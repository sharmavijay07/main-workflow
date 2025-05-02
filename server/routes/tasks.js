const express = require("express")
const router = express.Router()
const Task = require("../models/Task")
const auth = require("../middleware/auth")

// Get all tasks
router.get("/", async (req, res) => {
  try {
    const { department, status, dueDate } = req.query

    // Build filter object
    const filter = {}
    if (department) filter.department = department
    if (status) filter.status = status
    if (dueDate) {
      const date = new Date(dueDate)
      filter.dueDate = {
        $gte: new Date(date.setHours(0, 0, 0, 0)),
        $lt: new Date(date.setHours(23, 59, 59, 999)),
      }
    }

    const tasks = await Task.find(filter)
      .populate("department", "name color")
      .populate("assignee", "name avatar")
      .populate("dependencies", "title status")

    res.json(tasks)
  } catch (error) {
    console.error("Error fetching tasks:", error)
    res.status(500).json({ error: "Server error" })
  }
})

// Get task by ID
router.get("/:id",async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("department", "name color")
      .populate("assignee", "name avatar")
      .populate("dependencies", "title status")

    if (!task) {
      return res.status(404).json({ error: "Task not found" })
    }

    res.json(task)
  } catch (error) {
    console.error("Error fetching task:", error)
    res.status(500).json({ error: "Server error" })
  }
})

// Create new task
router.post("/",async (req, res) => {
  try {
    const newTask = new Task(req.body)
    const task = await newTask.save()

    // Populate fields for response
    const populatedTask = await Task.findById(task._id)
      .populate("department", "name color")
      .populate("assignee", "name avatar")
      .populate("dependencies", "title status")

    // Emit socket event for real-time updates
    req.io.emit("task-created", populatedTask)

    res.status(201).json(populatedTask)
  } catch (error) {
    console.error("Error creating task:", error)
    res.status(500).json({ error: "Server error" })
  }
})

// Update task
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params
    const updates = req.body

    // Find and update the task
    const task = await Task.findByIdAndUpdate(id, { $set: updates }, { new: true })
      .populate("department", "name color")
      .populate("assignee", "name avatar")
      .populate("dependencies", "title status")

    if (!task) {
      return res.status(404).json({ error: "Task not found" })
    }

    // Emit socket event for real-time updates
    req.io.emit("task-updated", task)

    res.json(task)
  } catch (error) {
    console.error("Error updating task:", error)
    res.status(500).json({ error: "Server error" })
  }
})

// Delete task
router.delete("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id)

    if (!task) {
      return res.status(404).json({ error: "Task not found" })
    }

    // Emit socket event for real-time updates
    req.io.emit("task-deleted", req.params.id)

    res.json({ message: "Task deleted successfully" })
  } catch (error) {
    console.error("Error deleting task:", error)
    res.status(500).json({ error: "Server error" })
  }
})

// Get task dependencies
router.get("/:id/dependencies", auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate({
      path: "dependencies",
      populate: [
        { path: "department", select: "name color" },
        { path: "assignee", select: "name avatar" },
      ],
    })

    if (!task) {
      return res.status(404).json({ error: "Task not found" })
    }

    res.json(task.dependencies)
  } catch (error) {
    console.error("Error fetching task dependencies:", error)
    res.status(500).json({ error: "Server error" })
  }
})

module.exports = router
