
const express = require("express")
const router = express.Router()
const auth = require("../middleware/auth")
const adminAuth = require("../middleware/adminAuth")
const Task = require("../models/Task")
const User = require("../models/User")
const Department = require("../models/Department")
const Progress = require("../models/Progress")
const {
  sendTaskReminder,
  generateDepartmentProgressPDF,
  sendDepartmentProgressReport,
} = require("../utils/emailService")

// @route   POST api/notifications/broadcast-reminders
// @desc    Broadcast progress update reminders to all users with active tasks
// @access  Private (Admin only)
router.post("/broadcast-reminders", async (req, res) => {
  try {
    // Get all active tasks (not completed)
    const tasks = await Task.find({ status: { $ne: "Completed" } })
      .populate("assignee", "name email")
      .populate("department", "name")

    if (tasks.length === 0) {
      return res.status(404).json({ msg: "No active tasks found" })
    }

    const emailPromises = []
    const emailsSent = []

    // Send email for each task
    for (const task of tasks) {
      if (!task.assignee) continue

      emailPromises.push(
        sendTaskReminder(task.assignee, task)
          .then(() => {
            emailsSent.push({
              user: task.assignee.name,
              email: task.assignee.email,
              task: task.title,
            })
          })
          .catch((error) => {
            console.error(`Failed to send email to ${task.assignee.email}:`, error)
          }),
      )
    }

    await Promise.all(emailPromises)

    res.json({
      msg: `Sent ${emailsSent.length} reminder emails`,
      emails: emailsSent,
    })
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server Error")
  }
})

// @route   POST api/notifications/generate-reports
// @desc    Generate and email department progress reports
// @access  Private (Admin only)
router.post("/generate-reports/:id", async (req, res) => {
  try {
    // // Get the admin user
    // const admin = await User.findById(req.user.id)
    // if (!admin) {
    //   return res.status(404).json({ msg: "Admin user not found" })
    // }

    // Get all departments
    const departments = await Department.find()
    if (departments.length === 0) {
      return res.status(404).json({ msg: "No departments found" })
    }

    const reportsSent = []

    // Generate and send report for each department
    for (const department of departments) {
      // Get all tasks for this department
      const tasks = await Task.find({ department: department._id })

      // Get all users in this department
      const users = await User.find({ department: department._id })

      // Get progress data for all users in this department
      const progressData = {}

      // Fetch progress data for each user
      for (const user of users) {
        const userProgress = await Progress.find({ user: user._id }).sort({ date: -1 }).limit(30) // Get last 30 progress entries per user

        progressData[user._id] = userProgress
      }

      // Generate PDF report with progress data
      const pdfPath = await generateDepartmentProgressPDF(department, tasks, users, progressData)

      const admin = await User.findById(req.params.id);
      if (!admin || !admin.email) {
        return res.status(404).json({ msg: "Admin user not found or missing email" });
      }
      await sendDepartmentProgressReport(admin, department, pdfPath);

      reportsSent.push({
        department: department.name,
        taskCount: tasks.length,
        userCount: users.length,
        progressEntriesAnalyzed: Object.values(progressData).reduce((sum, entries) => sum + entries.length, 0),
      })
    }

    res.json({
      msg: `Generated and sent ${reportsSent.length} department reports`,
      reports: reportsSent,
    })
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server Error")
  }
})

module.exports = router
