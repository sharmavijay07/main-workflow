// const mongoose = require("mongoose")

// const TaskSubmissionSchema = new mongoose.Schema({
//   task: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Task",
//     required: true,
//   },
//   user: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     required: true,
//   },
//   githubLink: {
//     type: String,
//     required: true,
//     trim: true,
//   },
//   additionalLinks: {
//     type: String,
//     trim: true,
//   },
//   notes: {
//     type: String,
//   },
//   status: {
//     type: String,
//     enum: ["Pending", "Approved", "Rejected"],
//     default: "Pending",
//   },
//   feedback: {
//     type: String,
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
//   updatedAt: {
//     type: Date,
//     default: Date.now,
//   },
// })

// // Update the updatedAt field before saving
// TaskSubmissionSchema.pre("save", function (next) {
//   this.updatedAt = Date.now()
//   next()
// })

// module.exports = mongoose.model("TaskSubmission", TaskSubmissionSchema)




const mongoose = require("mongoose")

const TaskSubmissionSchema = new mongoose.Schema({
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Task",
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  githubLink: {
    type: String,
    trim: true,
  },
  additionalLinks: {
    type: String,
    trim: true,
  },
  notes: {
    type: String,
  },
  documentLink: {
    type: String,
    trim: true,
  },
  fileType: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected"],
    default: "Pending",
  },
  feedback: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

// Update the updatedAt field before saving
TaskSubmissionSchema.pre("save", function (next) {
  this.updatedAt = Date.now()
  next()
})

module.exports = mongoose.model("TaskSubmission", TaskSubmissionSchema)
