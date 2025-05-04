// "use client"

// import { useState, useEffect } from "react"
// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card"
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
// import { Badge } from "../ui/badge"
// import { Button } from "../ui/button"
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "../ui/dropdown-menu"
// import { MoreHorizontal, Eye, Edit, Trash, Loader2 } from 'lucide-react'
// import { TaskDetailsDialog } from "./task-details-dialog"
// import { useToast } from "../../hooks/use-toast"
// import { api } from "../../lib/api"
// import { useSocketContext } from "../../context/socket-context"

// export function TasksList({ filters }) {
//   const { toast } = useToast()
//   const { events } = useSocketContext()
//   const [tasks, setTasks] = useState([])
//   const [isLoading, setIsLoading] = useState(true)
//   const [error, setError] = useState(null)
//   const [selectedTask, setSelectedTask] = useState(null)
//   const [isDetailsOpen, setIsDetailsOpen] = useState(false)
//   const [isDeleting, setIsDeleting] = useState(false)

//   // Fetch tasks based on filters
//   useEffect(() => {
//     const fetchTasks = async () => {
//       try {
//         setIsLoading(true)
//         const data = await api.tasks.getTasks(filters)
//         setTasks(data)
//         setError(null)
//       } catch (err) {
//         setError(err.message || "Failed to load tasks")
//         toast({
//           title: "Error",
//           description: err.message || "Failed to load tasks",
//           variant: "destructive"
//         })
//       } finally {
//         setIsLoading(false)
//       }
//     }

//     fetchTasks()
//   }, [filters, toast])

//   // Handle socket events for real-time updates
//   useEffect(() => {
//     if (events.length > 0) {
//       const latestEvent = events[events.length - 1]

//       // Apply filter checks for socket updates
//       const matchesFilters = (task) => {
//         const { status, department, priority } = filters
//         return (
//           (!status?.length || status.includes(task.status)) &&
//           (!department?.length || department.includes(task.department?._id)) &&
//           (!priority || priority === "all" || task.priority === priority)
//         )
//       }

//       if (latestEvent.type === 'task-created' && matchesFilters(latestEvent.data)) {
//         setTasks(prev => [...prev, latestEvent.data])
//       } 
//       else if (latestEvent.type === 'task-updated') {
//         setTasks(prev => prev.map(task => 
//           task.id === latestEvent.data.id ? latestEvent.data : task
//         ).filter(matchesFilters))
//       }
//       else if (latestEvent.type === 'task-deleted') {
//         setTasks(prev => prev.filter(task => task.id !== latestEvent.data.id))
//       }
//     }
//   }, [events, filters])

//   const getStatusColor = (status) => {
//     switch (status) {
//       case "Completed":
//         return "bg-green-500/10 text-green-500 hover:bg-green-500/20"
//       case "In Progress":
//         return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
//       case "Pending":
//         return "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"
//       default:
//         return "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20"
//     }
//   }

//   const getPriorityColor = (priority) => {
//     switch (priority) {
//       case "High":
//         return "bg-red-500/10 text-red-500 hover:bg-red-500/20"
//       case "Medium":
//         return "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"
//       case "Low":
//         return "bg-green-500/10 text-green-500 hover:bg-green-500/20"
//       default:
//         return "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20"
//     }
//   }

//   const handleViewTask = (task) => {
//     setSelectedTask(task)
//     setIsDetailsOpen(true)
//   }

//   const handleDeleteTask = async (taskId) => {
//     if (confirm("Are you sure you want to delete this task?")) {
//       try {
//         setIsDeleting(true)
//         await api.tasks.deleteTask(taskId)
//         setTasks(tasks.filter(task => task.id !== taskId))
//         toast({
//           title: "Success",
//           description: "Task deleted successfully"
//         })
//       } catch (error) {
//         console.error("Error deleting task:", error)
//         toast({
//           title: "Error",
//           description: error.message || "Failed to delete task",
//           variant: "destructive"
//         })
//       } finally {
//         setIsDeleting(false)
//       }
//     }
//   }

//   // Group tasks by department
//   const groupedTasks = tasks.reduce((acc, task) => {
//     const deptName = task.department?.name || 'Unknown'
//     if (!acc[deptName]) {
//       acc[deptName] = []
//     }
//     acc[deptName].push(task)
//     return acc
//   }, {})

//   if (isLoading) {
//     return (
//       <Card>
//         <CardHeader>
//           <CardTitle>Tasks by Department</CardTitle>
//           <CardDescription>View tasks grouped by department</CardDescription>
//         </CardHeader>
//         <CardContent className="flex justify-center items-center py-10">
//           <div className="flex flex-col items-center gap-2">
//             <Loader2 className="h-8 w-8 animate-spin text-primary" />
//             <p>Loading tasks...</p>
//           </div>
//         </CardContent>
//       </Card>
//     )
//   }

//   if (error) {
//     return (
//       <Card>
//         <CardHeader>
//           <CardTitle>Tasks by Department</CardTitle>
//           <CardDescription>View tasks grouped by department</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="p-4 text-center text-red-500">
//             <p>Error loading tasks: {error}</p>
//             <Button 
//               variant="outline" 
//               className="mt-4"
//               onClick={() => window.location.reload()}
//             >
//               Try Again
//             </Button>
//           </div>
//         </CardContent>
//       </Card>
//     )
//   }

//   return (
//     <div className="space-y-6">
//       {Object.keys(groupedTasks).length === 0 ? (
//         <Card>
//           <CardContent className="text-center py-8 text-muted-foreground">
//             <p>No tasks found matching the selected filters.</p>
//           </CardContent>
//         </Card>
//       ) : (
//         Object.entries(groupedTasks).map(([deptName, deptTasks]) => (
//           <Card key={deptName}>
//             <CardHeader>
//               <CardTitle>{deptName} Tasks</CardTitle>
//               <CardDescription>Tasks assigned to the {deptName} department</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <div className="overflow-x-auto">
//                 <Table>
//                   <TableHeader>
//                     <TableRow>
                     
//                       <TableHead>Title</TableHead>
//                       <TableHead>Assignee</TableHead>
//                       <TableHead>Status</TableHead>
//                       <TableHead>Priority</TableHead>
//                       <TableHead>Due Date</TableHead>
//                       <TableHead className="text-right">Actions</TableHead>
//                     </TableRow>
//                   </TableHeader>
//                   <TableBody>
//                     {deptTasks.map((task) => (
//                       <TableRow key={task._id ?? task.title}>
                       
//                         <TableCell>{task.title}</TableCell>
//                         <TableCell>{task.assignee?.name || 'Unassigned'}</TableCell>
//                         <TableCell>
//                           <Badge className={getStatusColor(task.status)}>{task.status}</Badge>
//                         </TableCell>
//                         <TableCell>
//                           <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
//                         </TableCell>
//                         <TableCell>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}</TableCell>
//                         <TableCell className="text-right">
//                           <DropdownMenu>
//                             <DropdownMenuTrigger asChild>
//                               <Button variant="ghost" className="h-8 w-8 p-0">
//                                 <span className="sr-only">Open menu</span>
//                                 <MoreHorizontal className="h-4 w-4" />
//                               </Button>
//                             </DropdownMenuTrigger>
//                             <DropdownMenuContent align="end">
//                               <DropdownMenuLabel>Actions</DropdownMenuLabel>
//                               <DropdownMenuItem onClick={() => handleViewTask(task)}>
//                                 <Eye className="mr-2 h-4 w-4" />
//                                 View details
//                               </DropdownMenuItem>
//                               <DropdownMenuItem>
//                                 <Edit className="mr-2 h-4 w-4" />
//                                 Edit task
//                               </DropdownMenuItem>
//                               <DropdownMenuSeparator />
//                               <DropdownMenuItem 
//                                 className="text-destructive"
//                                 onClick={() => handleDeleteTask(task.id)}
//                                 disabled={isDeleting}
//                               >
//                                 <Trash className="mr-2 h-4 w-4" />
//                                 Delete task
//                               </DropdownMenuItem>
//                             </DropdownMenuContent>
//                           </DropdownMenu>
//                         </TableCell>
//                       </TableRow>
//                     ))}
//                   </TableBody>
//                 </Table>
//               </div>
//             </CardContent>
//           </Card>
//         ))
//       )}
//       {selectedTask && <TaskDetailsDialog task={selectedTask} open={isDetailsOpen} onOpenChange={setIsDetailsOpen} />}
//     </div>
//   )
// }
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { MoreHorizontal, Eye, Edit, Trash, Loader2 } from 'lucide-react'
import { TaskDetailsDialog } from "./task-details-dialog"
import { useToast } from "../../hooks/use-toast"
import { api } from "../../lib/api"
import { useSocketContext } from "../../context/socket-context"

export function TasksList() {
  const { toast } = useToast()
  const { events } = useSocketContext()
  const [tasks, setTasks] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedTask, setSelectedTask] = useState(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Fetch tasks
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setIsLoading(true)
        const data = await api.tasks.getTasks()
        setTasks(data)
        setError(null)
      } catch (err) {
        setError(err.message || "Failed to load tasks")
        toast({
          title: "Error",
          description: err.message || "Failed to load tasks",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchTasks()
  }, [toast])

  // Listen for socket events to update tasks
  useEffect(() => {
    if (events.length > 0) {
      const latestEvent = events[events.length - 1]
      
      if (latestEvent.type === 'task-created') {
        setTasks(prev => [...prev, latestEvent.data])
      } 
      else if (latestEvent.type === 'task-updated') {
        setTasks(prev => prev.map(task => 
          task.id === latestEvent.data.id ? latestEvent.data : task
        ))
      }
      else if (latestEvent.type === 'task-deleted') {
        setTasks(prev => prev.filter(task => task.id !== latestEvent.data.id))
      }
    }
  }, [events])

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-500/10 text-green-500 hover:bg-green-500/20"
      case "In Progress":
        return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
      case "Pending":
        return "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"
      default:
        return "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20"
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "bg-red-500/10 text-red-500 hover:bg-red-500/20"
      case "Medium":
        return "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"
      case "Low":
        return "bg-green-500/10 text-green-500 hover:bg-green-500/20"
      default:
        return "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20"
    }
  }

  const handleViewTask = (task) => {
    setSelectedTask(task)
    setIsDetailsOpen(true)
  }

  const handleDeleteTask = async (taskId) => {
    if (confirm("Are you sure you want to delete this task?")) {
      try {
        setIsDeleting(true)
        await api.tasks.deleteTask(taskId)
        setTasks(tasks.filter(task => task.id !== taskId))
        toast({
          title: "Success",
          description: "Task deleted successfully"
        })
      } catch (error) {
        console.error("Error deleting task:", error)
        toast({
          title: "Error",
          description: error.message || "Failed to delete task",
          variant: "destructive"
        })
      } finally {
        setIsDeleting(false)
      }
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>All Tasks</CardTitle>
          <CardDescription>View and manage all tasks across departments</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-10">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p>Loading tasks...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>All Tasks</CardTitle>
          <CardDescription>View and manage all tasks across departments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 text-center text-red-500">
            <p>Error loading tasks: {error}</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Tasks</CardTitle>
        <CardDescription>View and manage all tasks across departments</CardDescription>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No tasks found. Create a new task to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Assignee</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => (
                 <TableRow key={task.id ?? task.title}>

                    <TableCell className="font-medium">{task.id}</TableCell>
                    <TableCell>{task.title}</TableCell>
                    <TableCell>{task.department?.name || 'Unknown'}</TableCell>
                    <TableCell>{task.assignee?.name || 'Unassigned'}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(task.status)}>{task.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                    </TableCell>
                    <TableCell>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleViewTask(task)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit task
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => handleDeleteTask(task.id)}
                            disabled={isDeleting}
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Delete task
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {selectedTask && <TaskDetailsDialog task={selectedTask} open={isDetailsOpen} onOpenChange={setIsDetailsOpen} />}
    </Card>
  )
}

