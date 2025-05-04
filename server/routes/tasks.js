// const express = require("express")
// const router = express.Router()
// const Task = require("../models/Task")
// const auth = require("../middleware/auth")

// // Get all tasks
// router.get("/", async (req, res) => {
//   try {
//     const { department, status, priority, dueDate } = req.query

//     // Build filter object
//     const filter = {}
//     if (department) {
//       const deptArray = Array.isArray(department) ? department : department.split(",")
//       filter.department = { $in: deptArray }
//     }
//     if (status) {
//       const statusArray = Array.isArray(status) ? status : status.split(",")
//       filter.status = { $in: statusArray }
//     }
//     if (priority) {
//       filter.priority = priority
//     }
//     if (dueDate) {
//       const date = new Date(dueDate)
//       filter.dueDate = {
//         $gte: new Date(date.setHours(0, 0, 0, 0)),
//         $lt: new Date(date.setHours(23, 59, 59, 999)),
//       }
//     }

//     const tasks = await Task.find(filter)
//       .populate("department", "name color")
//       .populate("assignee", "name avatar")
//       .populate("dependencies", "title status")

//     res.json(tasks)
//   } catch (error) {
//     console.error("Error fetching tasks:", error)
//     res.status(500).json({ error: "Server error" })
//   }
// })

// // Get task by ID
// router.get("/:id",async (req, res) => {
//   try {
//     const task = await Task.findById(req.params.id)
//       .populate("department", "name color")
//       .populate("assignee", "name avatar")
//       .populate("dependencies", "title status")

//     if (!task) {
//       return res.status(404).json({ error: "Task not found" })
//     }

//     res.json(task)
//   } catch (error) {
//     console.error("Error fetching task:", error)
//     res.status(500).json({ error: "Server error" })
//   }
// })

// // Create new task
// router.post("/",async (req, res) => {
//   try {
//     const newTask = new Task(req.body)
//     const task = await newTask.save()

//     // Populate fields for response
//     const populatedTask = await Task.findById(task._id)
//       .populate("department", "name color")
//       .populate("assignee", "name avatar")
//       .populate("dependencies", "title status")

//     // Emit socket event for real-time updates
//     req.io.emit("task-created", populatedTask)

//     res.status(201).json(populatedTask)
//   } catch (error) {
//     console.error("Error creating task:", error)
//     res.status(500).json({ error: "Server error" })
//   }
// })

// // Update task
// router.put("/:id", async (req, res) => {
//   try {
//     const { id } = req.params
//     const updates = req.body

//     // Find and update the task
//     const task = await Task.findByIdAndUpdate(id, { $set: updates }, { new: true })
//       .populate("department", "name color")
//       .populate("assignee", "name avatar")
//       .populate("dependencies", "title status")

//     if (!task) {
//       return res.status(404).json({ error: "Task not found" })
//     }

//     // Emit socket event for real-time updates
//     req.io.emit("task-updated", task)

//     res.json(task)
//   } catch (error) {
//     console.error("Error updating task:", error)
//     res.status(500).json({ error: "Server error" })
//   }
// })

// // Delete task
// router.delete("/:id", auth, async (req, res) => {
//   try {
//     const task = await Task.findByIdAndDelete(req.params.id)

//     if (!task) {
//       return res.status(404).json({ error: "Task not found" })
//     }

//     // Emit socket event for real-time updates
//     req.io.emit("task-deleted", req.params.id)

//     res.json({ message: "Task deleted successfully" })
//   } catch (error) {
//     console.error("Error deleting task:", error)
//     res.status(500).json({ error: "Server error" })
//   }
// })

// // Get task dependencies
// router.get("/:id/dependencies", auth, async (req, res) => {
//   try {
//     const task = await Task.findById(req.params.id).populate({
//       path: "dependencies",
//       populate: [
//         { path: "department", select: "name color" },
//         { path: "assignee", select: "name avatar" },
//       ],
//     })

//     if (!task) {
//       return res.status(404).json({ error: "Task not found" })
//     }

//     res.json(task.dependencies)
//   } catch (error) {
//     console.error("Error fetching task dependencies:", error)
//     res.status(500).json({ error: "Server error" })
//   }
// })

// module.exports = router
const express = require("express")
const router = express.Router()
const Task = require("../models/Task")
const auth = require("../middleware/auth")
const multer = require("multer")
const { uploadToCloudinary } = require("../utils/cloudinary")

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (!file) {
      console.error("No file provided in upload")
      return cb(new Error("No file provided"))
    }

    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
      "text/html",
    ]
    const validExtensions = /\.(pdf|doc|docx|txt|html)$/i
    const mimetypeValid = validTypes.includes(file.mimetype)
    const extnameValid = validExtensions.test(file.originalname)

    if (!mimetypeValid || !extnameValid) {
      console.error(`Invalid file: mimetype=${file.mimetype}, originalname=${file.originalname}`)
      return cb(new Error("Only PDF, DOC, DOCX, TXT, and HTML files are allowed"))
    }

    // Validate file content for HTML
    if (file.mimetype === "text/html") {
      if (!file.buffer) {
        console.error(`No buffer for file: originalname=${file.originalname}`)
        return cb(new Error("File buffer is missing"))
      }
      const content = file.buffer.toString("utf8", 0, 100)
      if (!content.startsWith("<!DOCTYPE html")) {
        console.error(`Invalid HTML content for file: originalname=${file.originalname}`)
        return cb(new Error("Invalid HTML file"))
      }
    }

    cb(null, true)
  },
})

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
router.get("/:id", async (req, res) => {
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
// Create new task
router.post("/", upload.single("document"), async (req, res) => {
  try {
    const { title, description, department, assignee, priority, status, dependencies, dueDate, user } = req.body;

    // Validate required fields
    if (!title || !department || !assignee) {
      return res.status(400).json({ error: "Title, department, and assignee are required" });
    }

    let notes = "";
    let fileType = "";
    if (req.file) {
      // Log file details for debugging
      console.log("File uploaded:", {
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
      });

      // Upload file buffer to Cloudinary
      const cloudinaryUrl = await uploadToCloudinary(req.file.buffer, req.file.originalname);
      notes = `Document: ${cloudinaryUrl} (${req.file.originalname})`;
      fileType = req.file.mimetype; // Store MIME type
    }

    // Create task
    const task = new Task({
      title,
      description,
      department,
      assignee,
      priority: priority || "Medium",
      status: status || "Pending",
      dependencies: dependencies ? JSON.parse(dependencies) : [],
      dueDate: dueDate || null,
      createdBy: user,
      notes,
      fileType, // New field to store MIME type
    });
    const savedTask = await task.save();

    // Populate fields for response
    const populatedTask = await Task.findById(savedTask._id)
      .populate("department", "name color")
      .populate("assignee", "name avatar")
      .populate("dependencies", "title status");

    // Emit socket event for real-time updates
    if (req.io) {
      req.io.emit("task:created", populatedTask);
    }

    res.status(201).json(populatedTask);
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ error: error.message || "Server error" });
  }
});
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
    if (req.io) {
      req.io.emit("task:updated", task)
    }

    res.json(task)
  } catch (error) {
    console.error("Error updating task:", error)
    res.status(500).json({ error: "Server error" })
  }
})

// Delete task
router.delete("/:id", async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id)

    if (!task) {
      return res.status(404).json({ error: "Task not found" })
    }

    // Emit socket event for real-time updates
    if (req.io) {
      req.io.emit("task:deleted", req.params.id)
    }

    res.json({ message: "Task deleted successfully" })
  } catch (error) {
    console.error("Error deleting task:", error)
    res.status(500).json({ error: "Server error" })
  }
})

// Get task dependencies
router.get("/:id/dependencies", async (req, res) => {
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
