


// "use client";

// import { useState, useEffect } from "react";
// import axios from "axios";
// import { API_URL } from "@/lib/api";
// import { cn } from "../../lib/utils";
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
// import { isValid, parse, format } from "date-fns";
// import { useToast } from "../../hooks/use-toast";
// import { useAuth } from "@/context/auth-context";


// export function CreateTaskDialog({ open, onOpenChange }) {
//   const { toast } = useToast();
//   const { user } = useAuth();
//   const [isLoading, setIsLoading] = useState(false);
//   const [departments, setDepartments] = useState([]);
//   const [users, setUsers] = useState([]);
//   const [tasks, setTasks] = useState([]);
//   const [documentFile, setDocumentFile] = useState(null);
//   const [dueDate, setDueDate] = useState(""); // Store date as string in YYYY-MM-DD format
//   const [dateError, setDateError] = useState(""); // Store validation error message

//   const [formData, setFormData] = useState({
//     title: "",
//     description: "",
//     department: "",
//     assignee: "",
//     priority: "Medium",
//     status: "Pending",
//     dependencies: [],
//   });

//   useEffect(() => {
//     console.log("formData updated:", formData);
//   }, [formData]);

//   // Fetch departments and tasks
//   useEffect(() => {
//     if (open) {
//       setFormData({
//         title: "",
//         description: "",
//         department: "",
//         assignee: "",
//         priority: "Medium",
//         status: "Pending",
//         dependencies: [],
//       });
//       setDueDate("");
//       setDocumentFile(null);
//       setDateError("");

//       const fetchData = async () => {
//         try {
//           const [departmentsResponse, tasksResponse] = await Promise.all([
//             axios.get(`${API_URL}/departments`),
//             axios.get(`${API_URL}/tasks`),
//           ]);

//           console.log("Departments:", departmentsResponse.data);
//           console.log("Tasks:", tasksResponse.data);

//           setDepartments(departmentsResponse.data);
//           setTasks(tasksResponse.data);
//           setUsers([]);
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

//   // Fetch users when department changes
//   useEffect(() => {
//     const fetchUsersByDepartment = async () => {
//       if (formData.department) {
//         try {
//           const usersResponse = await axios.get(`${API_URL}/users`, {
//             params: {
//               department: formData.department,
//               role_ne: "Admin",
//             },
//           });

//           console.log("Users for department:", usersResponse.data);
//           setUsers(usersResponse.data || []);
//           if (
//             formData.assignee &&
//             !usersResponse.data.some((u) => u._id === formData.assignee)
//           ) {
//             setFormData((prev) => ({ ...prev, assignee: "" }));
//           }
//         } catch (error) {
//           console.error("Error fetching users:", error);
//           toast({
//             title: "Error",
//             description: "Failed to load users for the selected department",
//             variant: "destructive",
//           });
//           setUsers([]);
//         }
//       } else {
//         setUsers([]);
//         setFormData((prev) => ({ ...prev, assignee: "" }));
//       }
//     };

//     fetchUsersByDepartment();
//   }, [formData.department, toast]);

//   const handleChange = (field, value) => {
//     console.log(`handleChange called - Field: ${field}, Value:`, value);
//     setFormData((prev) => {
//       const updatedFormData = { ...prev, [field]: value };
//       console.log("Updated formData:", updatedFormData);
//       return updatedFormData;
//     });
//   };

//   const handleDateChange = (e) => {
//     const value = e.target.value;
//     setDueDate(value);

//     // Validate date format (YYYY-MM-DD)
//     const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
//     if (!dateRegex.test(value)) {
//       setDateError("Please enter a valid date in YYYY-MM-DD format");
//       return;
//     }

//     // Parse and validate the date
//     const parsedDate = parse(value, "yyyy-MM-dd", new Date());
//     if (!isValid(parsedDate)) {
//       setDateError("Invalid date");
//       return;
//     }

//     // Check if date is in the past
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
//     if (parsedDate < today) {
//       setDateError("Due date cannot be in the past");
//       return;
//     }

//     setDateError("");
//   };

//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const validTypes = [
//         "application/pdf",
//         "application/msword",
//         "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//         "text/plain",
//         "text/html",
//       ];
//       const validExtensions = /\.(pdf|doc|docx|txt|html)$/i;
//       const extensionValid = validExtensions.test(file.name);
//       const typeValid = validTypes.includes(file.type);

//       if (!extensionValid || !typeValid) {
//         toast({
//           title: "Invalid File",
//           description: "Only PDF, DOC, DOCX, TXT, and HTML files are allowed.",
//           variant: "destructive",
//         });
//         return;
//       }

//       if (file.size > 10 * 1024 * 1024) {
//         toast({
//           title: "File Too Large",
//           description: "File size must be less than 10MB",
//           variant: "destructive",
//         });
//         return;
//       }

//       const reader = new FileReader();
//       reader.onload = (event) => {
//         const content = event.target.result;
//         if (
//           file.type === "text/html" &&
//           typeof content === "string" &&
//           !content.startsWith("<!DOCTYPE html")
//         ) {
//           toast({
//             title: "Invalid HTML File",
//             description: "The file does not appear to be a valid HTML document.",
//             variant: "destructive",
//           });
//           setDocumentFile(null);
//         } else {
//           setDocumentFile(file);
//         }
//       };
//       reader.readAsText(file.slice(0, 100));
//     }
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

//     // Validate due date if provided
//     if (dueDate) {
//       const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
//       if (!dateRegex.test(dueDate)) {
//         toast({
//           title: "Validation Error",
//           description: "Please enter a valid due date in YYYY-MM-DD format",
//           variant: "destructive",
//         });
//         return;
//       }

//       const parsedDate = parse(dueDate, "yyyy-MM-dd", new Date());
//       if (!isValid(parsedDate)) {
//         toast({
//           title: "Validation Error",
//           description: "Invalid due date",
//           variant: "destructive",
//         });
//         return;
//       }

//       const today = new Date();
//       today.setHours(0, 0, 0, 0);
//       if (parsedDate < today) {
//         toast({
//           title: "Validation Error",
//           description: "Due date cannot be in the past",
//           variant: "destructive",
//         });
//         return;
//       }
//     }

//     setIsLoading(true);

//     try {
//       const formDataToSend = new FormData();
//       formDataToSend.append("title", formData.title);
//       formDataToSend.append("description", formData.description);
//       formDataToSend.append("department", formData.department);
//       formDataToSend.append("assignee", formData.assignee);
//       formDataToSend.append("priority", formData.priority);
//       formDataToSend.append("status", formData.status);
//       formDataToSend.append("dependencies", JSON.stringify(formData.dependencies));
//       formDataToSend.append("user", user.id);
//       if (dueDate) {
//         formDataToSend.append("dueDate", dueDate); // Send as YYYY-MM-DD string
//       }
//       if (documentFile) {
//         formDataToSend.append("document", documentFile);
//       }

//       const result = await axios.post(`${API_URL}/tasks`, formDataToSend, {
//         headers: {
//           "Content-Type": "multipart/form-data",
//         },
//       });

//       toast({
//         title: "Success",
//         description: "Task created successfully",
//       });

//       setFormData({
//         title: "",
//         description: "",
//         department: "",
//         assignee: "",
//         priority: "Medium",
//         status: "Pending",
//         dependencies: [],
//       });
//       setDueDate("");
//       setDocumentFile(null);
//       setDateError("");

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
//                 disabled={users.length === 0}
//               >
//                 <SelectTrigger
//                   id="assignee"
//                   className="bg-white border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
//                 >
//                   <SelectValue
//                     placeholder={users.length === 0 ? "No users available" : "Select assignee"}
//                   />
//                 </SelectTrigger>
//                 <SelectContent className="bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
//                   {users.length > 0 ? (
//                     users.map((user) => (
//                       <SelectItem
//                         key={user._id}
//                         value={user._id}
//                         className="hover:bg-gray-100 focus:bg-gray-100 transition-colors"
//                       >
//                         {user.name}
//                       </SelectItem>
//                     ))
//                   ) : (
//                     <div className="px-4 py-2 text-sm text-gray-500">No users available</div>
//                   )}
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
//               <Label htmlFor="dueDate">Due Date</Label>
//               <Input
//                 id="dueDate"
//                 type="text"
//                 placeholder="YYYY-MM-DD"
//                 value={dueDate}
//                 onChange={handleDateChange}
//                 className={cn(
//                   "bg-white border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors",
//                   dateError && "border-red-500"
//                 )}
//               />
//               {dateError && (
//                 <p className="text-sm text-red-500">{dateError}</p>
//               )}
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

//           <div className="grid gap-2">
//             <Label htmlFor="document">Document</Label>
//             <Input
//               id="document"
//               type="file"
//               accept=".pdf,.doc,.docx,.txt,.html"
//               onChange={handleFileChange}
//             />
//             {documentFile && (
//               <p className="text-sm text-muted-foreground">Selected: {documentFile.name}</p>
//             )}
//           </div>
//         </div>
//         <DialogFooter>
//           <Button variant="outline" onClick={() => onOpenChange(false)}>
//             Cancel
//           </Button>
//           <Button type="submit" onClick={handleSubmit} disabled={isLoading || dateError}>
//             {isLoading ? "Creating..." : "Create Task"}
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }



"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "@/lib/api";
import { cn } from "../../lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { isValid, parse } from "date-fns";
import { useToast } from "../../hooks/use-toast";
import { useAuth } from "@/context/auth-context";

export function CreateTaskDialog({ open, onOpenChange }) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [documentFile, setDocumentFile] = useState(null);
  const [dueDate, setDueDate] = useState("");
  const [dateError, setDateError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    department: "",
    assignee: "",
    priority: "Medium",
    status: "Pending",
    dependencies: [],
  });

  useEffect(() => {
    if (open) {
      setFormData({
        title: "",
        description: "",
        department: "",
        assignee: "",
        priority: "Medium",
        status: "Pending",
        dependencies: [],
      });
      setDueDate("");
      setDocumentFile(null);
      setDateError("");
      setFilteredUsers([]);

      const fetchData = async () => {
        try {
          const [departmentsResponse, usersResponse, tasksResponse] = await Promise.all([
            axios.get(`${API_URL}/departments`),
            axios.get(`${API_URL}/users`, { params: { role_ne: "Admin" } }),
            axios.get(`${API_URL}/tasks`),
          ]);

          setDepartments(departmentsResponse.data);
          setAllUsers(usersResponse.data || []);
          setTasks(tasksResponse.data);
        } catch (error) {
          console.error("Error fetching data:", error);
          toast({
            title: "Error",
            description: "Failed to load required data",
            variant: "destructive",
          });
        }
      };

      fetchData();
    }
  }, [open, toast]);

  const handleDepartmentChange = (departmentId) => {
    setFormData((prev) => ({ ...prev, department: departmentId, assignee: "" }));
    const usersInDepartment = allUsers.filter(
      (user) => user.department?._id === departmentId
    );
    setFilteredUsers(usersInDepartment);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (e) => {
    const value = e.target.value;
    setDueDate(value);

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(value)) {
      setDateError("Please enter a valid date in YYYY-MM-DD format");
      return;
    }

    const parsedDate = parse(value, "yyyy-MM-dd", new Date());
    if (!isValid(parsedDate)) {
      setDateError("Invalid date");
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (parsedDate < today) {
      setDateError("Due date cannot be in the past");
      return;
    }

    setDateError("");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
        "text/html",
      ];
      if (!validTypes.includes(file.type)) {
        toast({
          title: "Invalid File",
          description: "Only PDF, DOC, DOCX, TXT, and HTML files are allowed.",
          variant: "destructive",
        });
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "File size must be less than 10MB",
          variant: "destructive",
        });
        return;
      }

      setDocumentFile(file);
    }
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.department || !formData.assignee) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (Title, Department, Assignee)",
        variant: "destructive",
      });
      return;
    }

    if (dueDate) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(dueDate)) {
        toast({
          title: "Validation Error",
          description: "Please enter a valid due date in YYYY-MM-DD format",
          variant: "destructive",
        });
        return;
      }

      const parsedDate = parse(dueDate, "yyyy-MM-dd", new Date());
      if (!isValid(parsedDate)) {
        toast({
          title: "Validation Error",
          description: "Invalid due date",
          variant: "destructive",
        });
        return;
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (parsedDate < today) {
        toast({
          title: "Validation Error",
          description: "Due date cannot be in the past",
          variant: "destructive",
        });
        return;
      }
    }

    setIsLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("department", formData.department);
      formDataToSend.append("assignee", formData.assignee);
      formDataToSend.append("priority", formData.priority);
      formDataToSend.append("status", formData.status);
      formDataToSend.append("dependencies", JSON.stringify(formData.dependencies));
      formDataToSend.append("createdBy", user.id);
      if (dueDate) {
        formDataToSend.append("dueDate", dueDate);
      }
      if (documentFile) {
        formDataToSend.append("document", documentFile);
        formDataToSend.append("fileType", documentFile.type);
      }

      await axios.post(`${API_URL}/tasks`, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast({
        title: "Success",
        description: "Task created successfully",
      });

      onOpenChange(false);
    } catch (error) {
      console.error("Error creating task:", error);
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to create task",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} className="dialog-overlay">
      <DialogContent className="dialog-content sm:max-w-[525px]  max-h-[80vh] overflow-y-auto">

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
                onValueChange={handleDepartmentChange}
              >
                <SelectTrigger id="department" className="bg-white border-gray-300">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-300">
                  {departments.map((dept) => (
                    <SelectItem key={dept._id} value={dept._id}>
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
                onValueChange={(value) => handleChange("assignee", value)}
                disabled={!formData.department || filteredUsers.length === 0}
              >
                <SelectTrigger id="assignee" className="bg-white border-gray-300">
                  <SelectValue
                    placeholder={
                      !formData.department
                        ? "Select a department first"
                        : filteredUsers.length === 0
                        ? "No users available"
                        : "Select assignee"
                    }
                  />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-300">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <SelectItem key={user._id} value={user._id}>
                        {user.name}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-sm text-gray-500">
                      No users available
                    </div>
                  )}
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
                <SelectTrigger id="priority" className="bg-white border-gray-300">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-300">
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="text"
                placeholder="YYYY-MM-DD"
                value={dueDate}
                onChange={handleDateChange}
                className={cn(dateError && "border-red-500")}
              />
              {dateError && <p className="text-sm text-red-500">{dateError}</p>}
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="dependencies">Dependencies</Label>
            <Select
              value={formData.dependencies[0] || ""}
              onValueChange={(value) => handleChange("dependencies", value ? [value] : [])}
            >
              <SelectTrigger id="dependencies" className="bg-white border-gray-300">
                <SelectValue placeholder="Select dependent tasks" />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-300">
                {tasks.map((task) => (
                  <SelectItem key={task._id} value={task._id}>
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
          <Button type="submit" onClick={handleSubmit} disabled={isLoading || dateError}>
            {isLoading ? "Creating..." : "Create Task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
