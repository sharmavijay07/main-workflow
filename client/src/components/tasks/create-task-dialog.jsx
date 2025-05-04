// "use client";

// import { useState, useEffect } from "react";
// import axios from "axios";
// import { API_URL } from "@/lib/api";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "../ui/dialog";
// import { Button } from "../ui/button";
// import { Input } from "../ui/input";
// import { Label } from "../ui/label";
// import { Textarea } from "../ui/textarea";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "../ui/select";
// import { Calendar } from "../ui/calendar";
// import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
// import { CalendarIcon } from "lucide-react";
// import { format } from "date-fns";
// import { cn } from "../../lib/utils";
// import { useToast } from "../../hooks/use-toast";

// export function CreateTaskDialog({ open, onOpenChange }) {
//   const { toast } = useToast();
//   const [date, setDate] = useState();
//   const [isLoading, setIsLoading] = useState(false);
//   const [departments, setDepartments] = useState([]);
//   const [users, setUsers] = useState([]);
//   const [tasks, setTasks] = useState([]);

//   const [formData, setFormData] = useState({
//     title: "",
//     description: "",
//     department: "",
//     assignee: "",
//     priority: "Medium",
//     status: "Pending",
//     dependencies: [],
//   });

//   // Log formData changes for debugging
//   useEffect(() => {
//     console.log("formData updated:", formData);
//   }, [formData]);

//   // Fetch departments and users when dialog opens
//   useEffect(() => {
//     if (open) {
//       // Reset formData
//       setFormData({
//         title: "",
//         description: "",
//         department: "",
//         assignee: "",
//         priority: "Medium",
//         status: "Pending",
//         dependencies: [],
//       });
//       setDate(undefined);

//       const fetchData = async () => {
//         try {
//           const [departmentsResponse, usersResponse, tasksResponse] = await Promise.all([
//             axios.get(`${API_URL}/departments`),
//             axios.get(`${API_URL}/users`),
//             axios.get(`${API_URL}/tasks`),
//           ]);

//           console.log("Departments:", departmentsResponse.data);
//           console.log("Users:", usersResponse.data);
//           console.log("Tasks:", tasksResponse.data);

//           setDepartments(departmentsResponse.data);
//           setUsers(usersResponse.data);
//           setTasks(tasksResponse.data);
//         } catch (error) {
//           console.error("Error fetching data:", error);
//           toast({
//             title: "Error",
//             description: "Failed to load required data",
//             variant: "destructive",
//           });
//         }
//       };

//       fetchData();
//     }
//   }, [open, toast]);

//   const handleChange = (field, value) => {
//     console.log(`handleChange called - Field: ${field}, Value:`, value);
//     setFormData((prev) => {
//       const updatedFormData = { ...prev, [field]: value };
//       console.log("Updated formData:", updatedFormData);
//       return updatedFormData;
//     });
//   };

//   const handleSubmit = async () => {
//     if (!formData.title || !formData.department || !formData.assignee) {
//       console.log("Form Data at submission:", formData);
//       toast({
//         title: "Validation Error",
//         description: "Please fill in all required fields (Title, Department, Assignee)",
//         variant: "destructive",
//       });
//       return;
//     }

//     setIsLoading(true);

//     try {
//       const taskData = {
//         ...formData,
//         dueDate: date ? format(date, "yyyy-MM-dd") : null,
//       };

//       const result = await axios.post(`${API_URL}/tasks`, taskData);

//       toast({
//         title: "Success",
//         description: "Task created successfully",
//       });

//       // Reset form
//       setFormData({
//         title: "",
//         description: "",
//         department: "",
//         assignee: "",
//         priority: "Medium",
//         status: "Pending",
//         dependencies: [],
//       });
//       setDate(undefined);

//       onOpenChange(false);
//     } catch (error) {
//       console.error("Error creating task:", error);
//       toast({
//         title: "Error",
//         description: error.response?.data?.error || "Failed to create task",
//         variant: "destructive",
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange} className="dialog-overlay">
//       <DialogContent className="dialog-content sm:max-w-[525px]">
//         <DialogHeader>
//           <DialogTitle>Create New Task</DialogTitle>
//           <DialogDescription>Add a new task to your workflow management system</DialogDescription>
//         </DialogHeader>
//         <div className="grid gap-4 py-4">
//           <div className="grid gap-2">
//             <Label htmlFor="title">
//               Task Title <span className="text-red-500">*</span>
//             </Label>
//             <Input
//               id="title"
//               placeholder="Enter task title"
//               value={formData.title}
//               onChange={(e) => handleChange("title", e.target.value)}
//             />
//           </div>

//           <div className="grid gap-2">
//             <Label htmlFor="description">Description</Label>
//             <Textarea
//               id="description"
//               placeholder="Enter task description"
//               className="min-h-[100px]"
//               value={formData.description}
//               onChange={(e) => handleChange("description", e.target.value)}
//             />
//           </div>

//           <div className="grid grid-cols-2 gap-4">
//             <div className="grid gap-2">
//               <Label htmlFor="department">
//                 Department <span className="text-red-500">*</span>
//               </Label>
//               <Select
//                 value={formData.department}
//                 onValueChange={(value) => {
//                   console.log("Department selected:", value);
//                   handleChange("department", value);
//                 }}
//               >
//                 <SelectTrigger
//                   id="department"
//                   className="bg-white border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
//                 >
//                   <SelectValue placeholder="Select department" />
//                 </SelectTrigger>
//                 <SelectContent className="bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
//                   {departments.map((dept) => (
//                     <SelectItem
//                       key={dept._id}
//                       value={dept._id}
//                       className="hover:bg-gray-100 focus:bg-gray-100 transition-colors"
//                     >
//                       {dept.name}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             <div className="grid gap-2">
//               <Label htmlFor="assignee">
//                 Assignee <span className="text-red-500">*</span>
//               </Label>
//               <Select
//                 value={formData.assignee}
//                 onValueChange={(value) => {
//                   console.log("Assignee selected:", value);
//                   handleChange("assignee", value);
//                 }}
//               >
//                 <SelectTrigger
//                   id="assignee"
//                   className="bg-white border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
//                 >
//                   <SelectValue placeholder="Select assignee" />
//                 </SelectTrigger>
//                 <SelectContent className="bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
//                   {users.map((user) => (
//                     <SelectItem
//                       key={user._id}
//                       value={user._id}
//                       className="hover:bg-gray-100 focus:bg-gray-100 transition-colors"
//                     >
//                       {user.name}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>
//           </div>

//           <div className="grid grid-cols-2 gap-4">
//             <div className="grid gap-2">
//               <Label htmlFor="priority">Priority</Label>
//               <Select
//                 value={formData.priority}
//                 onValueChange={(value) => handleChange("priority", value)}
//               >
//                 <SelectTrigger
//                   id="priority"
//                   className="bg-white border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
//                 >
//                   <SelectValue placeholder="Select priority" />
//                 </SelectTrigger>
//                 <SelectContent className="bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
//                   <SelectItem
//                     value="High"
//                     className="hover:bg-gray-100 focus:bg-gray-100 transition-colors"
//                   >
//                     High
//                   </SelectItem>
//                   <SelectItem
//                     value="Medium"
//                     className="hover:bg-gray-100 focus:bg-gray-100 transition-colors"
//                   >
//                     Medium
//                   </SelectItem>
//                   <SelectItem
//                     value="Low"
//                     className="hover:bg-gray-100 focus:bg-gray-100 transition-colors"
//                   >
//                     Low
//                   </SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>

//             <div className="grid gap-2">
//               <Label>Due Date</Label>
//               <Popover>
//                 <PopoverTrigger asChild>
//                   <Button
//                     variant={"outline"}
//                     className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
//                   >
//                     <CalendarIcon className="mr-2 h-4 w-4" />
//                     {date ? format(date, "PPP") : "Select date"}
//                   </Button>
//                 </PopoverTrigger>
//                 <PopoverContent className="w-auto p-0">
//                   <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
//                 </PopoverContent>
//               </Popover>
//             </div>
//           </div>

//           <div className="grid gap-2">
//             <Label htmlFor="dependencies">Dependencies</Label>
//             <Select
//               value={formData.dependencies[0] || ""}
//               onValueChange={(value) => handleChange("dependencies", value ? [value] : [])}
//             >
//               <SelectTrigger
//                 id="dependencies"
//                 className="bg-white border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
//               >
//                 <SelectValue placeholder="Select dependent tasks" />
//               </SelectTrigger>
//               <SelectContent className="bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
//                 {tasks.map((task) => (
//                   <SelectItem
//                     key={task._id}
//                     value={task._id}
//                     className="hover:bg-gray-100 focus:bg-gray-100 transition-colors"
//                   >
//                     {task.title}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </div>
//         </div>
//         <DialogFooter>
//           <Button variant="outline" onClick={() => onOpenChange(false)}>
//             Cancel
//           </Button>
//           <Button type="submit" onClick={handleSubmit} disabled={isLoading}>
//             {isLoading ? "Creating..." : "Create Task"}
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }
"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { api, API_URL } from "@/lib/api"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Textarea } from "../ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import { Calendar } from "../ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "../../lib/utils"
import { useToast } from "../../hooks/use-toast"
import { useAuth } from "@/context/auth-context"

export function CreateTaskDialog({ open, onOpenChange }) {
  const { toast } = useToast()
  const { user } = useAuth()
  const [date, setDate] = useState()
  const [isLoading, setIsLoading] = useState(false)
  const [departments, setDepartments] = useState([])
  const [users, setUsers] = useState([])
  const [tasks, setTasks] = useState([])
  const [documentFile, setDocumentFile] = useState(null)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    department: "",
    assignee: "",
    priority: "Medium",
    status: "Pending",
    dependencies: [],
  })

  useEffect(() => {
    console.log("formData updated:", formData)
  }, [formData])

  // Fetch departments and users when dialog opens
  useEffect(() => {
    if (open) {
      // Reset formData
      setFormData({
        title: "",
        description: "",
        department: "",
        assignee: "",
        priority: "Medium",
        status: "Pending",
        dependencies: [],
      })
      setDate(undefined)
      setDocumentFile(null)

      const fetchData = async () => {
        try {
          const [departmentsResponse, usersResponse, tasksResponse] = await Promise.all([
            axios.get(`${API_URL}/departments`),
            axios.get(`${API_URL}/users`),
            axios.get(`${API_URL}/tasks`),
          ])

          console.log("Departments:", departmentsResponse.data)
          console.log("Users:", usersResponse.data)
          console.log("Tasks:", tasksResponse.data)

          setDepartments(departmentsResponse.data)
          setUsers(usersResponse.data)
          setTasks(tasksResponse.data)
        } catch (error) {
          console.error("Error fetching data:", error)
          toast({
            title: "Error",
            description: "Failed to load required data",
            variant: "destructive",
          })
        }
      }

      fetchData()
    }
  }, [open, toast])

  const handleChange = (field, value) => {
    console.log(`handleChange called - Field: ${field}, Value:`, value)
    setFormData((prev) => {
      const updatedFormData = { ...prev, [field]: value }
      console.log("Updated formData:", updatedFormData)
      return updatedFormData
    })
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const validTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
        "text/html",
      ]
      const validExtensions = /\.(pdf|doc|docx|txt|html)$/i
      const extensionValid = validExtensions.test(file.name)
      const typeValid = validTypes.includes(file.type)

      if (!extensionValid || !typeValid) {
        toast({
          title: "Invalid File",
          description: "Only PDF, DOC, DOCX, TXT, and HTML files are allowed. Ensure the file extension matches its type.",
          variant: "destructive",
        })
        return
      }

      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "File size must be less than 10MB",
          variant: "destructive",
        })
        return
      }

      // Validate file content for HTML
      const reader = new FileReader()
      reader.onload = (event) => {
        const content = event.target.result
        if (file.type === "text/html" && typeof content === "string" && !content.startsWith("<!DOCTYPE html")) {
          toast({
            title: "Invalid HTML File",
            description: "The file does not appear to be a valid HTML document.",
            variant: "destructive",
          })
          setDocumentFile(null)
        } else {
          setDocumentFile(file)
        }
      }
      reader.readAsText(file.slice(0, 100)) // Read first 100 bytes
    }
  }

  const handleSubmit = async () => {
    if (!formData.title || !formData.department || !formData.assignee) {
      console.log("Form Data at submission:", formData)
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (Title, Department, Assignee)",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append("title", formData.title)
      formDataToSend.append("description", formData.description)
      formDataToSend.append("department", formData.department)
      formDataToSend.append("assignee", formData.assignee)
      formDataToSend.append("priority", formData.priority)
      formDataToSend.append("status", formData.status)
      formDataToSend.append("dependencies", JSON.stringify(formData.dependencies))
      formDataToSend.append("user", user.id) // Use user._id instead of user
      if (date) {
        formDataToSend.append("dueDate", format(date, "yyyy-MM-dd"))
      }
      if (documentFile) {
        formDataToSend.append("document", documentFile)
      }

      const result = await axios.post(`${API_URL}/tasks`, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      toast({
        title: "Success",
        description: "Task created successfully",
      })

      // Reset form
      setFormData({
        title: "",
        description: "",
        department: "",
        assignee: "",
        priority: "Medium",
        status: "Pending",
        dependencies: [],
      })
      setDate(undefined)
      setDocumentFile(null)

      onOpenChange(false)
    } catch (error) {
      console.error("Error creating task:", error)
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to create task",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} className="dialog-overlay">
      <DialogContent className="dialog-content sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>Add a new task to your workflow management system</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">
              Task Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Enter task title"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter task description"
              className="min-h-[100px]"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="department">
                Department <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.department}
                onValueChange={(value) => {
                  console.log("Department selected:", value)
                  handleChange("department", value)
                }}
              >
                <SelectTrigger
                  id="department"
                  className="bg-white border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {departments.map((dept) => (
                    <SelectItem
                      key={dept._id}
                      value={dept._id}
                      className="hover:bg-gray-100 focus:bg-gray-100 transition-colors"
                    >
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="assignee">
                Assignee <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.assignee}
                onValueChange={(value) => {
                  console.log("Assignee selected:", value)
                  handleChange("assignee", value)
                }}
              >
                <SelectTrigger
                  id="assignee"
                  className="bg-white border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <SelectValue placeholder="Select assignee" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {users.map((user) => (
                    <SelectItem
                      key={user._id}
                      value={user._id}
                      className="hover:bg-gray-100 focus:bg-gray-100 transition-colors"
                    >
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => handleChange("priority", value)}
              >
                <SelectTrigger
                  id="priority"
                  className="bg-white border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  <SelectItem
                    value="High"
                    className="hover:bg-gray-100 focus:bg-gray-100 transition-colors"
                  >
                    High
                  </SelectItem>
                  <SelectItem
                    value="Medium"
                    className="hover:bg-gray-100 focus:bg-gray-100 transition-colors"
                  >
                    Medium
                  </SelectItem>
                  <SelectItem
                    value="Low"
                    className="hover:bg-gray-100 focus:bg-gray-100 transition-colors"
                  >
                    Low
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="dependencies">Dependencies</Label>
            <Select
              value={formData.dependencies[0] || ""}
              onValueChange={(value) => handleChange("dependencies", value ? [value] : [])}
            >
              <SelectTrigger
                id="dependencies"
                className="bg-white border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <SelectValue placeholder="Select dependent tasks" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {tasks.map((task) => (
                  <SelectItem
                    key={task._id}
                    value={task._id}
                    className="hover:bg-gray-100 focus:bg-gray-100 transition-colors"
                  >
                    {task.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="document">Document</Label>
            <Input
              id="document"
              type="file"
              accept=".pdf,.doc,.docx,.txt,.html"
              onChange={handleFileChange}
            />
            {documentFile && (
              <p className="text-sm text-muted-foreground">Selected: {documentFile.name}</p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
