"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { Loader2 } from "lucide-react";
import { api } from "../../lib/api";
import { useToast } from "../../hooks/use-toast";
import { useSocketContext } from "../../context/socket-context";
import { OptimizationInsights } from "../optimization/optimization-insights";
import { OptimizationActions } from "../optimization/optimization-actions";

// Utility function to map Tailwind colors to hex
const getHexColor = (tailwindColor) => {
  const colorMap = {
    "bg-blue-500": "#3b82f6",
    "bg-green-500": "#22c55e",
    "bg-amber-500": "#f59e0b",
    "bg-red-500": "#ef4444",
    "bg-gray-500": "#64748b",
  };
  return colorMap[tailwindColor] || "#64748b";
};

export function DependencyGraph() {
  const svgRef = useRef(null);
  const { toast } = useToast();
  const { events } = useSocketContext();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [insights, setInsights] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [viewMode, setViewMode] = useState("graph"); // "graph" or "gantt"

  // Fetch tasks, departments, and insights
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [tasksData, departmentsData, insightsData] = await Promise.all([
          api.tasks.getTasks(),
          api.departments.getDepartments(),
          api.ai.getInsights(),
        ]);
        console.log("Fetched tasks:", tasksData);
        console.log("Fetched departments:", departmentsData);
        console.log("Fetched insights:", insightsData);
        setTasks(tasksData);
        setDepartments(departmentsData);
        setInsights(insightsData);
        setError(null);
      } catch (err) {
        setError(err.message || "Failed to load data");
        toast({
          title: "Error",
          description: err.message || "Failed to load tasks, departments, or AI insights",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  // Listen for socket events to update insights
  useEffect(() => {
    if (events.length > 0) {
      const latestEvent = events[events.length - 1];
      if (latestEvent.type === "optimization-suggestions") {
        setInsights((prev) => [...prev, ...latestEvent.data]);
      }
    }
  }, [events]);

  // Filter tasks by selected department
  const filteredTasks = selectedDepartment === "All"
    ? tasks
    : tasks.filter((task) => task.department?.name === selectedDepartment);

  // Extract task IDs from insights for highlighting
  const insightTaskIds = insights
    .filter((insight) => insight.category === "Dependencies" || insight.category === "Deadlines")
    .map((insight) => {
      const match = insight.description.match(/Task '([^']+)'/);
      if (match) {
        const task = tasks.find((t) => t.title === match[1]);
        return task?._id;
      }
      return null;
    })
    .filter((id) => id);

  // Render Dependency Graph
  const renderDependencyGraph = () => {
    if (!svgRef.current || !filteredTasks.length || !departments.length) return;

    const nodes = filteredTasks.map((task) => ({
      id: task._id,
      title: task.title,
      department: task.department?.name || "Unknown",
      status: task.status,
      isHighlighted: insightTaskIds.includes(task._id),
    }));

    const links = [];
    filteredTasks.forEach((task) => {
      if (task.dependencies && task.dependencies.length > 0) {
        task.dependencies.forEach((dep) => {
          const depId = dep._id;
          if (nodes.find((node) => node.id === depId)) {
            links.push({
              source: depId,
              target: task._id,
            });
          }
        });
      }
    });
    console.log("Nodes:", nodes);
    console.log("Links:", links);

    d3.select(svgRef.current).selectAll("*").remove();

    const width = 800;
    const height = 600;
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };
    const boundedWidth = width - margin.left - margin.right;
    const boundedHeight = height - margin.top - margin.bottom;

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .style("background", "#f9fafb");

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("background", "#fff")
      .style("padding", "8px")
      .style("border", "1px solid #ccc")
      .style("border-radius", "4px")
      .style("pointer-events", "none")
      .style("opacity", 0);

    svg
      .append("defs")
      .append("marker")
      .attr("id", "arrowhead")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 25)
      .attr("refY", 0)
      .attr("orient", "auto")
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#888");

    const simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3
          .forceLink(links)
          .id((d) => d.id)
          .distance(100)
      )
      .force("charge", d3.forceManyBody().strength(-200))
      .force("center", d3.forceCenter(boundedWidth / 2, boundedHeight / 2))
      .force("collide", d3.forceCollide(40))
      .force("x", d3.forceX().strength(0.1))
      .force("y", d3.forceY().strength(0.1));

    const link = g
      .append("g")
      .attr("stroke", "#888")
      .attr("stroke-width", 2)
      .selectAll("line")
      .data(links)
      .enter()
      .append("line")
      .attr("marker-end", "url(#arrowhead)");

    const node = g
      .append("g")
      .selectAll(".node")
      .data(nodes)
      .enter()
      .append("g")
      .attr("class", "node")
      .call(d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended))
      .on("mouseover", (event, d) => {
        const deps = filteredTasks.find((t) => t._id === d.id)?.dependencies?.map((dep) => dep._id) || [];
        tooltip
          .style("opacity", 1)
          .html(
            `<strong>${d.title}</strong><br>ID: ${d.id}<br>Department: ${d.department}<br>Status: ${d.status}<br>Depends on: ${deps.join(", ") || "None"}`
          )
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 10}px`);
      })
      .on("mouseout", () => {
        tooltip.style("opacity", 0);
      });

    node
      .append("circle")
      .attr("r", 20)
      .attr("fill", (d) => {
        const dept = departments.find((dep) => dep.name === d.department);
        return dept ? getHexColor(dept.color) : "#64748b";
      })
      .attr("stroke", (d) => {
        if (d.isHighlighted) return "#ef4444";
        switch (d.status) {
          case "Completed": return "#22c55e";
          case "In Progress": return "#3b82f6";
          case "Pending": return "#f59e0b";
          default: return "#000";
        }
      })
      .attr("stroke-width", (d) => (d.isHighlighted ? 5 : 3));

    node
      .append("text")
      .attr("text-anchor", "middle")
      .attr("y", 30)
      .attr("font-size", "10px")
      .each(function (d) {
        const words = d.title.split(/\s+/).reverse();
        let word;
        let line = [];
        let lineNumber = 0;
        const lineHeight = 1.1;
        const dy = -0.5;
        let tspan = d3
          .select(this)
          .append("tspan")
          .attr("x", 0)
          .attr("dy", `${dy}em`);

        while ((word = words.pop())) {
          line.push(word);
          tspan.text(line.join(" "));
          if (tspan.node().getComputedTextLength() > 60) {
            line.pop();
            tspan.text(line.join(" "));
            line = [word];
            tspan.attr("dy", `${++lineNumber * lineHeight + dy}em`);
            tspan = d3
              .select(this)
              .append("tspan")
              .attr("x", 0)
              .attr("dy", `${lineHeight}em`)
              .text(word);
          }
        }
      });

    const legend = svg
      .append("g")
      .attr("transform", `translate(${width - 150}, ${margin.top})`);

    legend
      .append("text")
      .attr("x", 0)
      .attr("y", 0)
      .attr("font-size", "12px")
      .attr("font-weight", "bold")
      .text("Departments");

    departments.forEach((dept, i) => {
      const g = legend.append("g").attr("transform", `translate(0, ${20 + i * 20})`);
      g.append("circle").attr("r", 5).attr("fill", getHexColor(dept.color));
      g.append("text")
        .attr("x", 10)
        .attr("y", 4)
        .attr("font-size", "10px")
        .text(dept.name);
    });

    const statuses = [
      { name: "Completed", color: "#22c55e" },
      { name: "In Progress", color: "#3b82f6" },
      { name: "Pending", color: "#f59e0b" },
      { name: "AI Highlighted", color: "#ef4444" },
    ];

    legend
      .append("text")
      .attr("x", 0)
      .attr("y", 20 + departments.length * 20 + 20)
      .attr("font-size", "12px")
      .attr("font-weight", "bold")
      .text("Status (Border)");

    statuses.forEach((status, i) => {
      const g = legend.append("g").attr("transform", `translate(0, ${20 + departments.length * 20 + 40 + i * 20})`);
      g.append("circle")
        .attr("r", 5)
        .attr("fill", "none")
        .attr("stroke", status.color)
        .attr("stroke-width", 2);
      g.append("text")
        .attr("x", 10)
        .attr("y", 4)
        .attr("font-size", "10px")
        .text(status.name);
    });

    simulation.on("tick", () => {
      link
        .attr("x1", (d) => Math.max(0, Math.min(boundedWidth, d.source.x)))
        .attr("y1", (d) => Math.max(0, Math.min(boundedHeight, d.source.y)))
        .attr("x2", (d) => Math.max(0, Math.min(boundedWidth, d.target.x)))
        .attr("y2", (d) => Math.max(0, Math.min(boundedHeight, d.target.y)));

      node.attr("transform", (d) => {
        d.x = Math.max(20, Math.min(boundedWidth - 20, d.x));
        d.y = Math.max(20, Math.min(boundedHeight - 20, d.y));
        return `translate(${d.x},${d.y})`;
      });
    });

    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return { simulation, tooltip };
  };

  // Render Gantt Chart
  const renderGanttChart = () => {
    if (!svgRef.current || !filteredTasks.length || !departments.length) return;

    d3.select(svgRef.current).selectAll("*").remove();

    const width = 800;
    const height = 600;
    const margin = { top: 40, right: 150, bottom: 40, left: 100 };
    const boundedWidth = width - margin.left - margin.right;
    const boundedHeight = height - margin.top - margin.bottom;

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .style("background", "#f9fafb");

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const tooltip = d3
      .select("body")
      .append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("background", "#fff")
      .style("padding", "8px")
      .style("border", "1px solid #ccc")
      .style("border-radius", "4px")
      .style("pointer-events", "none")
      .style("opacity", 0);

    const ganttData = filteredTasks.map((task) => ({
      id: task._id,
      title: task.title,
      department: task.department?.name || "Unknown",
      status: task.status,
      start: new Date(task.createdAt),
      end: task.dueDate ? new Date(task.dueDate) : new Date(new Date(task.createdAt).setDate(new Date(task.createdAt).getDate() + 7)),
      dependencies: task.dependencies?.map((dep) => dep._id) || [],
      isHighlighted: insightTaskIds.includes(task._id),
    }));

    const xScale = d3
      .scaleTime()
      .domain([
        d3.min(ganttData, (d) => d.start),
        d3.max(ganttData, (d) => d.end),
      ])
      .range([0, boundedWidth])
      .nice();

    const yScale = d3
      .scaleBand()
      .domain(ganttData.map((d) => d.id))
      .range([0, boundedHeight])
      .padding(0.2);

    const xAxis = d3.axisTop(xScale).ticks(d3.timeDay.every(1)).tickFormat(d3.timeFormat("%b %d"));
    const yAxis = d3.axisLeft(yScale).tickFormat((id) => {
      const task = ganttData.find((d) => d.id === id);
      return task ? task.title : "";
    });

    g.append("g")
      .attr("class", "x-axis")
      .call(xAxis)
      .selectAll("text")
      .style("font-size", "10px")
      .attr("transform", "rotate(-45)")
      .attr("text-anchor", "end");

    g.append("g")
      .attr("class", "y-axis")
      .call(yAxis)
      .selectAll("text")
      .style("font-size", "10px");

    const bars = g
      .selectAll(".bar")
      .data(ganttData)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => xScale(d.start))
      .attr("y", (d) => yScale(d.id))
      .attr("width", (d) => xScale(d.end) - xScale(d.start))
      .attr("height", yScale.bandwidth())
      .attr("fill", (d) => {
        const dept = departments.find((dep) => dep.name === d.department);
        return dept ? getHexColor(dept.color) : "#64748b";
      })
      .attr("stroke", (d) => {
        if (d.isHighlighted) return "#ef4444";
        switch (d.status) {
          case "Completed": return "#22c55e";
          case "In Progress": return "#3b82f6";
          case "Pending": return "#f59e0b";
          default: return "#000";
        }
      })
      .attr("stroke-width", (d) => (d.isHighlighted ? 5 : 3))
      .on("mouseover", (event, d) => {
        tooltip
          .style("opacity", 1)
          .html(
            `<strong>${d.title}</strong><br>ID: ${d.id}<br>Department: ${d.department}<br>Status: ${d.status}<br>Start: ${d.start.toLocaleDateString()}<br>End: ${d.end.toLocaleDateString()}<br>Depends on: ${d.dependencies.join(", ") || "None"}`
          )
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 10}px`);
      })
      .on("mouseout", () => {
        tooltip.style("opacity", 0);
      });

    const legend = svg
      .append("g")
      .attr("transform", `translate(${width - 130}, ${margin.top})`);

    legend
      .append("text")
      .attr("x", 0)
      .attr("y", 0)
      .attr("font-size", "12px")
      .attr("font-weight", "bold")
      .text("Departments");

    departments.forEach((dept, i) => {
      const g = legend.append("g").attr("transform", `translate(0, ${20 + i * 20})`);
      g.append("circle").attr("r", 5).attr("fill", getHexColor(dept.color));
      g.append("text")
        .attr("x", 10)
        .attr("y", 4)
        .attr("font-size", "10px")
        .text(dept.name);
    });

    const statuses = [
      { name: "Completed", color: "#22c55e" },
      { name: "In Progress", color: "#3b82f6" },
      { name: "Pending", color: "#f59e0b" },
      { name: "AI Highlighted", color: "#ef4444" },
    ];

    legend
      .append("text")
      .attr("x", 0)
      .attr("y", 20 + departments.length * 20 + 20)
      .attr("font-size", "12px")
      .attr("font-weight", "bold")
      .text("Status (Border)");

    statuses.forEach((status, i) => {
      const g = legend.append("g").attr("transform", `translate(0, ${20 + departments.length * 20 + 40 + i * 20})`);
      g.append("circle")
        .attr("r", 5)
        .attr("fill", "none")
        .attr("stroke", status.color)
        .attr("stroke-width", 2);
      g.append("text")
        .attr("x", 10)
        .attr("y", 4)
        .attr("font-size", "10px")
        .text(status.name);
    });

    return { tooltip };
  };

  // Render the appropriate chart
  useEffect(() => {
    let cleanup = { simulation: null, tooltip: null };

    if (viewMode === "graph") {
      cleanup = renderDependencyGraph() || cleanup;
    } else if (viewMode === "gantt") {
      cleanup = renderGanttChart() || cleanup;
    }

    const style = document.createElement("style");
    style.setAttribute("data-tooltip", "true");
    style.innerHTML = `
      .tooltip {
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        max-width: 200px;
        font-size: 12px;
      }
    `;
    document.head.appendChild(style);

    return () => {
      if (cleanup.simulation) cleanup.simulation.stop();
      if (cleanup.tooltip) cleanup.tooltip.remove();
      const style = document.querySelector("style[data-tooltip]");
      if (style) document.head.removeChild(style);
    };
  }, [filteredTasks, departments, viewMode, insights]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p>Loading dependency graph...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-center text-red-500">
          <p>Error loading dependency graph: {error}</p>
          <button
            className="mt-4 px-4 py-2 bg-primary text-white rounded-md"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-4">
      <div className="flex-1">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div>
              <label htmlFor="department" className="mr-2 text-sm font-medium">
                Department:
              </label>
              <select
                id="department"
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="border border-gray-300 rounded-md px-2 py-1"
              >
                <option value="All">All</option>
                {departments.map((dept) => (
                  <option key={dept._id} value={dept.name}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("graph")}
                className={`px-4 py-2 rounded-md ${
                  viewMode === "graph" ? "bg-primary text-white" : "bg-gray-200"
                }`}
              >
                Dependency Graph
              </button>
              <button
                onClick={() => setViewMode("gantt")}
                className={`px-4 py-2 rounded-md ${
                  viewMode === "gantt" ? "bg-primary text-white" : "bg-gray-200"
                }`}
              >
                Gantt Chart
              </button>
            </div>
          </div>
          <svg ref={svgRef} className="w-full h-[600px] border border-gray-200 rounded-md" />
        </div>
        <div className="mt-4">
          <OptimizationInsights insights={insights} />
        </div>
      </div>
      {/* <div className="w-80">
        <OptimizationActions tasks={tasks} setTasks={setTasks} insights={insights} />
      </div> */}
    </div>
  );
}