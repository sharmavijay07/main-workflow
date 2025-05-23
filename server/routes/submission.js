
// const express = require("express")
// const router = express.Router()
// const TaskSubmission = require("../models/TaskSubmission")
// const Task = require("../models/Task")
// const auth = require("../middleware/auth")
// const multer = require("multer")
// const { uploadToCloudinary } = require("../utils/cloudinary")

// // Configure multer for memory storage
// const upload = multer({
//   storage: multer.memoryStorage(),
//   limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
//   fileFilter: (req, file, cb) => {
//     if (!file) {
//       return cb(null, true) // Allow empty file field
//     }

//     const validTypes = [
//       "application/pdf",
//       "application/msword",
//       "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//       "image/png",
//       "image/jpeg",
//     ]
//     const validExtensions = /\.(pdf|doc|docx|png|jpg|jpeg)$/i
//     const mimetypeValid = validTypes.includes(file.mimetype)
//     const extnameValid = validExtensions.test(file.originalname)

//     if (!mimetypeValid || !extnameValid) {
//       console.error(`Invalid file: mimetype=${file.mimetype}, originalname=${file.originalname}`)
//       return cb(new Error("Only PDF, DOC, DOCX, PNG, and JPEG files are allowed"))
//     }

//     // Validate file content for HTML (not used here, but keeping for consistency)
//     if (file.mimetype === "text/html") {
//       if (!file.buffer) {
//         console.error(`No buffer for file: originalname=${file.originalname}`)
//         return cb(new Error("File buffer is missing"))
//       }
//       const content = file.buffer.toString("utf8", 0, 100)
//       if (!content.startsWith("<!DOCTYPE html")) {
//         console.error(`Invalid HTML content for file: originalname=${file.originalname}`)
//         return cb(new Error("Invalid HTML file"))
//       }
//     }

//     cb(null, true)
//   },
// })

// // Get all submissions (admin only)
// router.get("/", async (req, res) => {
//   try {
//     const submissions = await TaskSubmission.find()
//       .populate("task", "title status")
//       .populate("user", "name email")

//     res.json(submissions)
//   } catch (error) {
//     console.error("Error fetching submissions:", error)
//     res.status(500).json({ error: "Server error" })
//   }
// })

// // Get submission by ID
// router.get("/:id", async (req, res) => {
//   try {
//     const submission = await TaskSubmission.findById(req.params.id)
//       .populate("task", "title status department assignee")
//       .populate("user", "name email")

//     if (!submission) {
//       return res.status(404).json({ error: "Submission not found" })
//     }

//     res.json(submission)
//   } catch (error) {
//     console.error("Error fetching submission:", error)
//     res.status(500).json({ error: "Server error" })
//   }
// })

// // Get submission by task ID
// router.get("/task/:taskId", async (req, res) => {
//   try {
//     const submission = await TaskSubmission.findOne({ task: req.params.taskId })
//       .populate("task", "title status")
//       .populate("user", "name email")

//     if (!submission) {
//       return res.status(404).json({ error: "Submission not found" })
//     }

//     res.json(submission)
//   } catch (error) {
//     console.error("Error fetching submission by task:", error)
//     res.status(500).json({ error: "Server error" })
//   }
// })

// // Create new submission
// router.post("/",upload.single("document"), async (req, res) => {
//   try {
//     const { task: taskId, githubLink, notes, originalSubmission,userId } = req.body

//     // Check if task exists
//     const task = await Task.findById(taskId)
//     if (!task) {
//       return res.status(404).json({ error: "Task not found" })
//     }

//     // // Check if user is assigned to this task
//     // if (task.assignee.toString() !== req.user.id) {
//     //   return res.status(403).json({ error: "You can only submit tasks assigned to you" })
//     // }

//     // If it's an original submission (not a revision)
//     if (!originalSubmission) {
//       const existingSubmission = await TaskSubmission.findOne({
//         task: taskId,
//         originalSubmission: { $exists: false },
//       })

//       if (existingSubmission) {
//         return res.status(400).json({ error: "A submission already exists for this task" })
//       }
//     }

//     let documentLink = ""
//     let fileType = ""
//     if (req.file) {
//       console.log("File uploaded:", {
//         originalName: req.file.originalname,
//         mimeType: req.file.mimetype,
//         size: req.file.size,
//       })

//       const cloudinaryUrl = await uploadToCloudinary(req.file.buffer, req.file.originalname)
//       documentLink = cloudinaryUrl
//       fileType = req.file.mimetype
//     }

//     // Create new submission
//     const newSubmission = new TaskSubmission({
//       task: taskId,
//       user: userId,
//       githubLink: githubLink || "",
//       notes: notes || "",
//       documentLink,
//       fileType,
//       originalSubmission: originalSubmission ? originalSubmission : undefined,
//     })

//     const submission = await newSubmission.save()

//     // Update task status to "Completed" only for original submission
//     if (!originalSubmission && task.status !== "Completed") {
//       task.status = "Completed"
//       task.progress = 100
//       await task.save()
//     }

//     // Emit socket event for real-time updates
//     req.io.emit("submission-created", {
//       submission,
//       taskId,
//     })

//     res.status(201).json(submission)
//   } catch (error) {
//     console.error("Error creating submission:", error)
//     res.status(500).json({ error: error.message || "Server error" })
//   }
// })

// // Update submission
// router.put("/:id", upload.single("document"), async (req, res) => {
//   try {
//     const { githubLink, notes } = req.body
//     const submission = await TaskSubmission.findById(req.params.id)

//     if (!submission) {
//       return res.status(404).json({ error: "Submission not found" })
//     }

//     // // Check if user is authorized to update this submission
//     // if (submission.user.toString() !== req.user.id && req.user.role !== "Admin") {
//     //   return res.status(403).json({ error: "Not authorized" })
//     // }

//     let documentLink = submission.documentLink
//     let fileType = submission.fileType
//     if (req.file) {
//       console.log("File uploaded:", {
//         originalName: req.file.originalname,
//         mimeType: req.file.mimetype,
//         size: req.file.size,
//       })

//       const cloudinaryUrl = await uploadToCloudinary(req.file.buffer, req.file.originalname)
//       documentLink = cloudinaryUrl
//       fileType = req.file.mimetype
//     }

//     // Update submission
//     const updatedSubmission = await TaskSubmission.findByIdAndUpdate(
//       req.params.id,
//       {
//         $set: {
//           githubLink: githubLink || "",
//           notes: notes || "",
//           documentLink,
//           fileType,
//           updatedAt: Date.now(),
//         },
//       },
//       { new: true }
//     )
//       .populate("task", "title status")
//       .populate("user", "name email")

//     // Emit socket event for real-time updates
//     req.io.emit("submission-updated", updatedSubmission)

//     res.json(updatedSubmission)
//   } catch (error) {
//     console.error("Error updating submission:", error)
//     res.status(500).json({ error: "Server error" })
//   }
// })

// // Review submission (admin/manager only)
// router.put("/:id/review", async (req, res) => {
//   try {
//     const { status, feedback } = req.body

//     if (!status || !["Approved", "Rejected"].includes(status)) {
//       return res.status(400).json({ error: "Invalid status" })
//     }

//     const submission = await TaskSubmission.findById(req.params.id)

//     if (!submission) {
//       return res.status(404).json({ error: "Submission not found" })
//     }

//     // Update submission status and feedback
//     submission.status = status
//     submission.feedback = feedback
//     await submission.save()

//     // If approved, ensure task is marked as completed
//     if (status === "Approved") {
//       const task = await Task.findById(submission.task)
//       if (task && task.status !== "Completed") {
//         task.status = "Completed"
//         task.progress = 100
//         await task.save()
//       }
//     }

//     // Emit socket event for real-time updates
//     req.io.emit("submission-reviewed", submission)

//     res.json(submission)
//   } catch (error) {
//     console.error("Error reviewing submission:", error)
//     res.status(500).json({ error: "Server error" })
//   }
// })

// // Delete submission
// router.delete("/:id", async (req, res) => {
//   try {
//     const submission = await TaskSubmission.findById(req.params.id)

//     if (!submission) {
//       return res.status(404).json({ error: "Submission not found" })
//     }

//     // Check if user is authorized to delete this submission
//     if (submission.user.toString() !== req.user.id && req.user.role !== "Admin") {
//       return res.status(403).json({ error: "Not authorized" })
//     }

//     await TaskSubmission.findByIdAndDelete(req.params.id)

//     // Emit socket event for real-time updates
//     req.io.emit("submission-deleted", req.params.id)

//     res.json({ message: "Submission deleted successfully" })
//   } catch (error) {
//     console.error("Error deleting submission:", error)
//     res.status(500).json({ error: "Server error" })
//   }
// })

// module.exports = router



const express = require("express")
const router = express.Router()
const TaskSubmission = require("../models/TaskSubmission")
const Task = require("../models/Task")
const auth = require("../middleware/auth")
const multer = require("multer")
const { uploadToCloudinary } = require("../utils/cloudinary")
const Notification = require("../models/Notification")
const User = require("../models/User")

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (!file) {
      return cb(null, true) // Allow empty file field
    }

    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/png",
      "image/jpeg",
    ]
    const validExtensions = /\.(pdf|doc|docx|png|jpg|jpeg)$/i
    const mimetypeValid = validTypes.includes(file.mimetype)
    const extnameValid = validExtensions.test(file.originalname)

    if (!mimetypeValid || !extnameValid) {
      console.error(`Invalid file: mimetype=${file.mimetype}, originalname=${file.originalname}`)
      return cb(new Error("Only PDF, DOC, DOCX, PNG, and JPEG files are allowed"))
    }

    // Validate file content for HTML (not used here, but keeping for consistency)
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

// Get all submissions (admin only)
router.get("/", async (req, res) => {
  try {
    const submissions = await TaskSubmission.find()
      .populate("task", "title status")
      .populate("user", "name email")

    res.json(submissions)
  } catch (error) {
    console.error("Error fetching submissions:", error)
    res.status(500).json({ error: "Server error" })
  }
})

// Get submission by ID
router.get("/:id", async (req, res) => {
  try {
    const submission = await TaskSubmission.findById(req.params.id)
      .populate("task", "title status department assignee")
      .populate("user", "name email")

    if (!submission) {
      return res.status(404).json({ error: "Submission not found" })
    }

    res.json(submission)
  } catch (error) {
    console.error("Error fetching submission:", error)
    res.status(500).json({ error: "Server error" })
  }
})

// Get submission by task ID
router.get("/task/:taskId", async (req, res) => {
  try {
    const submission = await TaskSubmission.findOne({ task: req.params.taskId })
      .populate("task", "title status")
      .populate("user", "name email")

    if (!submission) {
      return res.status(404).json({ error: "Submission not found" })
    }

    res.json(submission)
  } catch (error) {
    console.error("Error fetching submission by task:", error)
    res.status(500).json({ error: "Server error" })
  }
})

// Create new submission
router.post("/",upload.single("document"), async (req, res) => {
  try {
    const { task: taskId, githubLink, notes, originalSubmission,userId } = req.body

    // Check if task exists
    const task = await Task.findById(taskId)
    if (!task) {
      return res.status(404).json({ error: "Task not found" })
    }

    // // Check if user is assigned to this task
    // if (task.assignee.toString() !== req.user.id) {
    //   return res.status(403).json({ error: "You can only submit tasks assigned to you" })
    // }

    // If it's an original submission (not a revision)
    if (!originalSubmission) {
      const existingSubmission = await TaskSubmission.findOne({
        task: taskId,
        originalSubmission: { $exists: false },
      })

      if (existingSubmission) {
        return res.status(400).json({ error: "A submission already exists for this task" })
      }
    }

    let documentLink = ""
    let fileType = ""
    if (req.file) {
      console.log("File uploaded:", {
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
      })

      const cloudinaryUrl = await uploadToCloudinary(req.file.buffer, req.file.originalname)
      documentLink = cloudinaryUrl
      fileType = req.file.mimetype
    }

    // Create new submission
    const newSubmission = new TaskSubmission({
      task: taskId,
      user: userId,
      githubLink: githubLink || "",
      notes: notes || "",
      documentLink,
      fileType,
      originalSubmission: originalSubmission ? originalSubmission : undefined,
    })

    const submission = await newSubmission.save();

    // Populate user information
    await submission.populate('user', 'name');

    // Update task status to "Completed" only for original submission
    if (!originalSubmission && task.status !== "Completed") {
      task.status = "Completed";
      task.progress = 100;
      await task.save();
    }

    // Emit socket event for real-time updates
    req.io.emit("submission-created", {
      submission,
      taskId,
    });

    // Find admin user(s) to notify
    const admins = await User.find({ role: "Admin" });
    for (const admin of admins) {
      await Notification.create({
        recipient: admin._id,
        type: "task_submitted",
        title: "Task Submitted",
        message: `Submission by ${submission.user.name} for task: '${task.title}'. Please review it.`,
        task: taskId,
      });
    }

    res.status(201).json(submission);
  } catch (error) {
    console.error("Error creating submission:", error)
    res.status(500).json({ error: error.message || "Server error" })
  }
})

// Update submission
router.put("/:id", upload.single("document"), async (req, res) => {
  try {
    const { githubLink, notes } = req.body
    const submission = await TaskSubmission.findById(req.params.id)

    if (!submission) {
      return res.status(404).json({ error: "Submission not found" })
    }

    // // Check if user is authorized to update this submission
    // if (submission.user.toString() !== req.user.id && req.user.role !== "Admin") {
    //   return res.status(403).json({ error: "Not authorized" })
    // }

    let documentLink = submission.documentLink
    let fileType = submission.fileType
    if (req.file) {
      console.log("File uploaded:", {
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
      })

      const cloudinaryUrl = await uploadToCloudinary(req.file.buffer, req.file.originalname)
      documentLink = cloudinaryUrl
      fileType = req.file.mimetype
    }

    // Update submission
    const updatedSubmission = await TaskSubmission.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          githubLink: githubLink || "",
          notes: notes || "",
          documentLink,
          fileType,
          updatedAt: Date.now(),
        },
      },
      { new: true }
    )
      .populate("task", "title status")
      .populate("user", "name email")

    // Emit socket event for real-time updates
    req.io.emit("submission-updated", updatedSubmission)

    res.json(updatedSubmission)
  } catch (error) {
    console.error("Error updating submission:", error)
    res.status(500).json({ error: "Server error" })
  }
})

// Review submission (admin/manager only)
router.put("/:id/review", async (req, res) => {
  try {
    const { status, feedback } = req.body

    if (!status || !["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" })
    }

    const submission = await TaskSubmission.findById(req.params.id)

    if (!submission) {
      return res.status(404).json({ error: "Submission not found" })
    }

    // Update submission status and feedback
    submission.status = status
    submission.feedback = feedback
    await submission.save()

    // If approved, ensure task is marked as completed
    if (status === "Approved") {
      const task = await Task.findById(submission.task)
      if (task && task.status !== "Completed") {
        task.status = "Completed"
        task.progress = 100
        await task.save()
      }
    }

    // Emit socket event for real-time updates
    req.io.emit("submission-reviewed", submission)

    res.json(submission)
  } catch (error) {
    console.error("Error reviewing submission:", error)
    res.status(500).json({ error: "Server error" })
  }
})

// Delete submission
router.delete("/:id", async (req, res) => {
  try {
    const submission = await TaskSubmission.findById(req.params.id)

    if (!submission) {
      return res.status(404).json({ error: "Submission not found" })
    }

    // Check if user is authorized to delete this submission
    if (submission.user.toString() !== req.user.id && req.user.role !== "Admin") {
      return res.status(403).json({ error: "Not authorized" })
    }

    await TaskSubmission.findByIdAndDelete(req.params.id)

    // Emit socket event for real-time updates
    req.io.emit("submission-deleted", req.params.id)

    res.json({ message: "Submission deleted successfully" })
  } catch (error) {
    console.error("Error deleting submission:", error)
    res.status(500).json({ error: "Server error" })
  }
})

module.exports = router



