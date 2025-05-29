const express = require("express")
const router = express.Router()
const webpush = require("web-push")
const PushSubscription = require("../models/PushSubscription")
const auth = require("../middleware/auth")

// Configure web-push with VAPID keys
webpush.setVapidDetails(
  "mailto:your-email@example.com", // Replace with your email
  process.env.VAPID_PUBLIC_KEY ||
    "BEl62iUYgUivxIkv69yViEuiBIa40HcCWLrUjHLjdMorMYiNkAiOlSstp6riKGxGxaio4vWqlaKUaOOhSE8VLRs",
  process.env.VAPID_PRIVATE_KEY || "your-vapid-private-key", // Replace with your VAPID private key
)

// @route   POST api/push/subscribe
// @desc    Subscribe user to push notifications
// @access  Private
router.post("/subscribe", async (req, res) => {
  try {
    const { subscription, userId } = req.body

    if (!subscription || !userId) {
      return res.status(400).json({ error: "Subscription and userId are required" })
    }

    // Check if subscription already exists
    const existingSubscription = await PushSubscription.findOne({
      userId,
      endpoint: subscription.endpoint,
    })

    if (existingSubscription) {
      return res.json({ message: "Subscription already exists" })
    }

    // Save new subscription
    const newSubscription = new PushSubscription({
      userId,
      endpoint: subscription.endpoint,
      keys: subscription.keys,
      subscription: subscription,
    })

    await newSubscription.save()

    res.json({ message: "Subscription saved successfully" })
  } catch (error) {
    console.error("Error saving push subscription:", error)
    res.status(500).json({ error: "Server error" })
  }
})

// @route   POST api/push/unsubscribe
// @desc    Unsubscribe user from push notifications
// @access  Private
router.post("/unsubscribe", async (req, res) => {
  try {
    const { endpoint } = req.body
    const userId = req.user.id

    await PushSubscription.deleteOne({ userId, endpoint })

    res.json({ message: "Unsubscribed successfully" })
  } catch (error) {
    console.error("Error unsubscribing:", error)
    res.status(500).json({ error: "Server error" })
  }
})

// @route   POST api/push/send
// @desc    Send push notification to specific users
// @access  Private (Admin only)
router.post("/send", async (req, res) => {
  try {
    const { userIds, title, body, url, tag } = req.body

    if (!userIds || !title || !body) {
      return res.status(400).json({ error: "userIds, title, and body are required" })
    }

    // Get all subscriptions for the specified users
    const subscriptions = await PushSubscription.find({
      userId: { $in: userIds },
    })

    if (subscriptions.length === 0) {
      return res.json({ message: "No subscriptions found for specified users" })
    }

    const payload = JSON.stringify({
      title,
      body,
      url: url || "/",
      tag: tag || "default",
      primaryKey: Date.now().toString(),
    })

    const sendPromises = subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(sub.subscription, payload)
        return { success: true, userId: sub.userId }
      } catch (error) {
        console.error(`Failed to send notification to user ${sub.userId}:`, error)

        // If subscription is invalid, remove it
        if (error.statusCode === 410) {
          await PushSubscription.deleteOne({ _id: sub._id })
        }

        return { success: false, userId: sub.userId, error: error.message }
      }
    })

    const results = await Promise.all(sendPromises)
    const successful = results.filter((r) => r.success).length
    const failed = results.filter((r) => !r.success).length

    res.json({
      message: `Notifications sent: ${successful} successful, ${failed} failed`,
      results,
    })
  } catch (error) {
    console.error("Error sending push notifications:", error)
    res.status(500).json({ error: "Server error" })
  }
})

// @route   POST api/push/broadcast
// @desc    Send push notification to all subscribed users
// @access  Private (Admin only)
router.post("/broadcast", async (req, res) => {
  try {
    const { title, body, url, tag, excludeUserIds = [] } = req.body

    if (!title || !body) {
      return res.status(400).json({ error: "Title and body are required" })
    }

    // Get all subscriptions except excluded users
    const subscriptions = await PushSubscription.find({
      userId: { $nin: excludeUserIds },
    })

    if (subscriptions.length === 0) {
      return res.json({ message: "No subscriptions found" })
    }

    const payload = JSON.stringify({
      title,
      body,
      url: url || "/",
      tag: tag || "broadcast",
      primaryKey: Date.now().toString(),
    })

    const sendPromises = subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(sub.subscription, payload)
        return { success: true, userId: sub.userId }
      } catch (error) {
        console.error(`Failed to send notification to user ${sub.userId}:`, error)

        // If subscription is invalid, remove it
        if (error.statusCode === 410) {
          await PushSubscription.deleteOne({ _id: sub._id })
        }

        return { success: false, userId: sub.userId, error: error.message }
      }
    })

    const results = await Promise.all(sendPromises)
    const successful = results.filter((r) => r.success).length
    const failed = results.filter((r) => !r.success).length

    res.json({
      message: `Broadcast sent: ${successful} successful, ${failed} failed`,
      results,
    })
  } catch (error) {
    console.error("Error broadcasting push notifications:", error)
    res.status(500).json({ error: "Server error" })
  }
})

module.exports = router
