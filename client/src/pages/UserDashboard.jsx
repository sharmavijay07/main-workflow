"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import {
  Plus,
  Loader2,
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Github,
  ExternalLink,
  Bell,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { CreateTaskDialog } from "../components/tasks/create-task-dialog"
import { useToast } from "../hooks/use-toast"
import { useAuth } from "../context/auth-context"
import { Badge } from "../components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
import { Progress } from "../components/ui/progress"
import axios from "axios"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog"
import { Textarea } from "../components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert"
import { SubmissionFeedbackCard } from "../components/dashboard/SubmissionFeedbackCard"
import { API_URL } from "@/lib/api"

function UserDashboard() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { user } = useAuth()
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false)
  const [userStats, setUserStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    pendingTasks: 0,
    upcomingDeadlines: [],
    completionRate: 0,
  })
  const [userTasks, setUserTasks] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTask, setSelectedTask] = useState(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [submissions, setSubmissions] = useState([])
  const [selectedSubmission, setSelectedSubmission] = useState(null)
  const [isSubmissionDetailsOpen, setIsSubmissionDetailsOpen] = useState(false)
  const [isRevisionDialogOpen, setIsRevisionDialogOpen] = useState(false)
  const [revisionNotes, setRevisionNotes] = useState("")
  const [hasNewReviews, setHasNewReviews] = useState(false)
  const [recentReviews, setRecentReviews] = useState([])

  const handleViewTask = (task) => {
    setSelectedTask(task)
    setIsDetailsOpen(true)
  }

  const handleViewSubmission = (submission) => {
    setSelectedSubmission(submission)
    setIsSubmissionDetailsOpen(true)
  }

  const handleSubmitRevision = async () => {
    if (!selectedSubmission || !revisionNotes.trim()) return;
  
    try {
      setIsLoading(true);
  
      const token = localStorage.getItem("WorkflowToken"); // 👈 Fetch the token
  
      await axios.post(`${API_URL}/submissions`, {
        task: selectedSubmission.task._id,
        githubLink: selectedSubmission.githubLink,
        additionalLinks: selectedSubmission.additionalLinks,
        notes: revisionNotes,
        originalSubmission: selectedSubmission._id,
        user: user.id,
      }, {
        headers: {
          "x-auth-token": token, // 👈 Add it here
        },
      });
  
      toast({
        title: "Success",
        description: "Your revision has been submitted successfully",
      });
  
      setIsRevisionDialogOpen(false);
      fetchUserDashboardData();
    } catch (error) {
      console.error("Error submitting revision:", error);
      toast({
        title: "Error",
        description: "Failed to submit revision",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const markReviewsAsSeen = async () => {
    try {
      // This would be an API call to mark notifications as read
      // For now, we'll just update the local state
      setHasNewReviews(false)

      // In a real implementation, you would call an API endpoint like:
      // await axios.post(`${API_URL}/users/${user.id}/mark-reviews-seen`)
    } catch (error) {
      console.error("Error marking reviews as seen:", error)
    }
  }

  const fetchUserDashboardData = async () => {
    const storedUser = JSON.parse(localStorage.getItem("WorkflowUser"))
    if (!storedUser?.id) {
      console.error("User ID is undefined")
      setIsLoading(false)
      return
    }

    console.log("Fetching stats for user ID:", storedUser.id)

    try {
      setIsLoading(true)

      // Using axios for API calls
      const statsResponse = await axios.get(`${API_URL}/dashboard/user-stats/${storedUser.id}`)
      const tasks = await axios.get(`${API_URL}/users/${storedUser.id}/tasks`)

      // Fetch user's submissions
      const submissionsResponse = await axios.get(`${API_URL}/users/${storedUser.id}/submissions`)

      // Check for recent reviews (in the last 7 days)
      const recentlyReviewed = submissionsResponse.data.filter((submission) => {
        // Check if submission was reviewed recently
        if (submission.status !== "Pending") {
          const reviewDate = new Date(submission.updatedAt)
          const sevenDaysAgo = new Date()
          sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
          return reviewDate > sevenDaysAgo
        }
        return false
      })

      setUserStats(statsResponse.data)
      setUserTasks(tasks.data)
      setSubmissions(submissionsResponse.data)
      setRecentReviews(recentlyReviewed)
      setHasNewReviews(recentlyReviewed.length > 0)
    } catch (error) {
      console.error("Error fetching user dashboard data:", error)
      toast({
        title: "Error",
        description: "Failed to load your dashboard data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUserDashboardData()

    // Set up polling for new reviews (every 5 minutes)
    const intervalId = setInterval(fetchUserDashboardData, 5 * 60 * 1000)

    return () => clearInterval(intervalId)
  }, [user, toast])

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

  const getSubmissionStatusBadge = (status) => {
    switch (status) {
      case "Approved":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-300 flex items-center gap-1">
            <ThumbsUp className="h-3 w-3" /> Approved
          </Badge>
        )
      case "Rejected":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300 flex items-center gap-1">
            <ThumbsDown className="h-3 w-3" /> Rejected
          </Badge>
        )
      default:
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-900/50 dark:text-amber-300 flex items-center gap-1">
            <Clock className="h-3 w-3" /> Pending Review
          </Badge>
        )
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p>Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user?.name || "User"}! Here's your task overview.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchUserDashboardData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={() => setIsCreateTaskOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Task
          </Button>
        </div>
      </div>

      {hasNewReviews && (
        <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <Bell className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertTitle className="text-blue-800 dark:text-blue-300">New submission reviews</AlertTitle>
          <AlertDescription className="text-blue-700 dark:text-blue-400">
            You have {recentReviews.length} recently reviewed submission{recentReviews.length !== 1 ? "s" : ""}. Check
            the "My Submissions" tab for details.
            <Button
              variant="link"
              className="text-blue-700 dark:text-blue-400 p-0 h-auto font-normal ml-2"
              onClick={markReviewsAsSeen}
            >
              Mark as read
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Tasks</CardTitle>
            <div className="h-4 w-4 text-muted-foreground">
              <Clock className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.totalTasks}</div>
            <p className="text-xs text-muted-foreground">Total assigned tasks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <div className="h-4 w-4 text-muted-foreground">
              <CheckCircle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.completedTasks}</div>
            <p className="text-xs text-muted-foreground">{userStats.completionRate}% completion rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <div className="h-4 w-4 text-muted-foreground">
              <Clock className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.inProgressTasks}</div>
            <p className="text-xs text-muted-foreground">Tasks currently in progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <div className="h-4 w-4 text-muted-foreground">
              <AlertCircle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats.pendingTasks}</div>
            <p className="text-xs text-muted-foreground">Tasks waiting to be started</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tasks" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 mx-auto">
          <TabsTrigger value="tasks">My Tasks</TabsTrigger>
          <TabsTrigger value="submissions" className="relative">
            My Submissions
            {hasNewReviews && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>My Tasks</CardTitle>
                <CardDescription>View and manage your assigned tasks</CardDescription>
              </CardHeader>
              <CardContent>
                {userTasks?.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>You don't have any tasks assigned yet.</p>
                    <Button variant="outline" className="mt-4" onClick={() => setIsCreateTaskOpen(true)}>
                      Create Your First Task
                    </Button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Priority</TableHead>
                          <TableHead>Due Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {userTasks?.slice(0, 5).map((task) => (
                          <TableRow
                            key={task._id}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => navigate(`/tasks/${task._id}`)}
                          >
                            <TableCell className="font-medium">{task.title}</TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(task.status)}>{task.status}</Badge>
                            </TableCell>
                            <TableCell>
                              <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                            </TableCell>
                            <TableCell>
                              {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No date"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    {userTasks?.length > 5 && (
                      <div className="mt-4 text-center">
                        <Button variant="outline" onClick={() => navigate("/tasks")}>
                          View All Tasks
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Deadlines</CardTitle>
                <CardDescription>Tasks due soon</CardDescription>
              </CardHeader>
              <CardContent>
                {userStats.upcomingDeadlines && userStats.upcomingDeadlines.length > 0 ? (
                  <div className="space-y-4">
                    {userStats.upcomingDeadlines.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between p-3 rounded-md bg-muted/50 cursor-pointer hover:bg-muted"
                        onClick={() => navigate(`/tasks/${task.id}`)}
                      >
                        <div>
                          <p className="font-medium text-sm">{task.title}</p>
                          <p className="text-xs text-muted-foreground">
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calendar className="mx-auto h-8 w-8 text-muted-foreground/60 mb-2" />
                    <p>No upcoming deadlines</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>My Progress</CardTitle>
              <CardDescription>Your task completion progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Overall Completion</p>
                      <p className="text-xs text-muted-foreground">
                        {userStats.completedTasks} of {userStats.totalTasks} tasks completed
                      </p>
                    </div>
                    <span className="text-sm font-medium">{userStats.completionRate}%</span>
                  </div>
                  <Progress value={userStats.completionRate} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="submissions" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>My Submissions</CardTitle>
              <CardDescription>Track the status of your task submissions</CardDescription>
            </CardHeader>
            <CardContent>
              {submissions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Github className="mx-auto h-8 w-8 text-muted-foreground/60 mb-2" />
                  <p>You haven't submitted any tasks yet.</p>
                  <p className="text-sm mt-1">Complete a task and submit it to see it here.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Task</TableHead>
                        <TableHead>Submitted On</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {submissions.map((submission) => (
                        <TableRow key={submission._id} className="hover:bg-muted/50">
                          <TableCell className="font-medium">{submission.task?.title || "Unknown Task"}</TableCell>
                          <TableCell>{new Date(submission.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>{getSubmissionStatusBadge(submission.status)}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleViewSubmission(submission)
                                }}
                              >
                                View
                              </Button>
                              {submission.status === "Rejected" && (
                                <Button
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setSelectedSubmission(submission)
                                    setIsRevisionDialogOpen(true)
                                  }}
                                >
                                  Submit Revision
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {recentReviews.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Recent Reviews</CardTitle>
                <CardDescription>Feedback on your recent submissions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentReviews.map((review) => (
                    <SubmissionFeedbackCard
                      key={review._id}
                      submission={review}
                      onViewDetails={(submission) => {
                        setSelectedSubmission(submission)
                        setIsSubmissionDetailsOpen(true)
                      }}
                      onSubmitRevision={(submission) => {
                        setSelectedSubmission(submission)
                        setIsRevisionDialogOpen(true)
                      }}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <CreateTaskDialog open={isCreateTaskOpen} onOpenChange={setIsCreateTaskOpen} />

      {/* Submission Details Dialog */}
     
      <Dialog open={isSubmissionDetailsOpen} onOpenChange={setIsSubmissionDetailsOpen} className="dialog-overlay">
        <DialogContent className="dialog-content sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Submission Details</DialogTitle>
            <DialogDescription>{selectedSubmission?.task?.title || "Task Submission"}</DialogDescription>
          </DialogHeader>

          {selectedSubmission && (
            <div className="space-y-4 py-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium">Status:</p>
                  {getSubmissionStatusBadge(selectedSubmission.status)}
                </div>
                <p className="text-sm text-muted-foreground">
                  Submitted on {new Date(selectedSubmission.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">GitHub Repository:</p>
                <div className="flex items-center gap-2 bg-muted p-2 rounded">
                  <Github className="h-4 w-4" />
                  <a
                    href={selectedSubmission.githubLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    {selectedSubmission.githubLink}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>

              {selectedSubmission.additionalLinks && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Additional Links:</p>
                  <div className="flex items-center gap-2 bg-muted p-2 rounded">
                    <ExternalLink className="h-4 w-4" />
                    <a
                      href={selectedSubmission.additionalLinks}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                    >
                      {selectedSubmission.additionalLinks}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              )}

              {selectedSubmission.notes && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Your Notes:</p>
                  <div className="bg-muted p-3 rounded">
                    <p className="text-sm whitespace-pre-line">{selectedSubmission.notes}</p>
                  </div>
                </div>
              )}

              {selectedSubmission.feedback && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Reviewer Feedback:</p>
                  <div
                    className={`p-3 rounded ${
                      selectedSubmission.status === "Approved"
                        ? "bg-green-50 dark:bg-green-900/20"
                        : "bg-red-50 dark:bg-red-900/20"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-line">{selectedSubmission.feedback}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSubmissionDetailsOpen(false)}>
              Close
            </Button>
            {selectedSubmission?.status === "Rejected" && (
              <Button
                onClick={() => {
                  setIsSubmissionDetailsOpen(false)
                  setIsRevisionDialogOpen(true)
                }}
              >
                Submit Revision
              </Button>
            )}
            {selectedSubmission?.task && (
              <Button
                variant="outline"
                onClick={() => {
                  setIsSubmissionDetailsOpen(false)
                  navigate(`/tasks/${selectedSubmission.task._id}`)
                }}
              >
                View Task
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revision Dialog */}
      <Dialog open={isRevisionDialogOpen} onOpenChange={setIsRevisionDialogOpen} className="dialog-overlay">
        <DialogContent className="dialog-content sm:max-w-[525px]">
      
          <DialogHeader>
            <DialogTitle>Submit Revision</DialogTitle>
            <DialogDescription>Update your submission based on the reviewer's feedback</DialogDescription>
          </DialogHeader>

          {selectedSubmission && (
            <div className="space-y-4 py-4">
              {selectedSubmission.feedback && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Reviewer Feedback:</p>
                  <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded">
                    <p className="text-sm whitespace-pre-line">{selectedSubmission.feedback}</p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <p className="text-sm font-medium">Your Original Submission:</p>
                <div className="flex items-center gap-2 bg-muted p-2 rounded">
                  <Github className="h-4 w-4" />
                  <a
                    href={selectedSubmission.githubLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    {selectedSubmission.githubLink}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium">Revision Notes:</p>
                <Textarea
                  placeholder="Describe the changes you've made in response to the feedback..."
                  value={revisionNotes}
                  onChange={(e) => setRevisionNotes(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRevisionDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitRevision} disabled={!revisionNotes.trim() || isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...
                </>
              ) : (
                "Submit Revision"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default UserDashboard
// "use client"

// import { useState, useEffect } from "react"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
// import { Button } from "../components/ui/button"
// import { Plus, Loader2, CheckCircle, Clock, AlertCircle, Calendar } from "lucide-react"
// import { useNavigate } from "react-router-dom"
// import { CreateTaskDialog } from "../components/tasks/create-task-dialog"
// import { api } from "../lib/api"
// import { useToast } from "../hooks/use-toast"
// import { useAuth } from "../context/auth-context"
// import { Badge } from "../components/ui/badge"
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table"
// import { Progress } from "../components/ui/progress"
// import axios from 'axios'
// import { TaskDetailsDialog } from "@/components/tasks/task-details-dialog"

// function UserDashboard() {
//   const navigate = useNavigate()
//   const { toast } = useToast()
//   const { user } = useAuth()
//   const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false)
//   const [userStats, setUserStats] = useState({
//     totalTasks: 0,
//     completedTasks: 0,
//     inProgressTasks: 0,
//     pendingTasks: 0,
//     upcomingDeadlines: [],
//     completionRate: 0,
//   })
//   const [userTasks, setUserTasks] = useState([])
//   const [isLoading, setIsLoading] = useState(true)
 



//   const handleViewTask =(task) => {
//     setSelectedTask(task)
//     setIsDetailsOpen(true)
//   }

//   useEffect(() => {
//     const fetchUserDashboardData = async () => {
//       const storedUser = JSON.parse(localStorage.getItem("WorkflowUser"))
//       if (!storedUser?.id) {
//         console.error("User ID is undefined");
//         setIsLoading(false);
//         return;
//       }
      
//       console.log("Fetching stats for user ID:", storedUser.id);

//       try {
//         setIsLoading(true);

//         // Using axios for API calls
//         const statsResponse = await axios.get(`${API_URL}/dashboard/user-stats/${storedUser.id}`);
//         const tasks = await axios.get(`${API_URL}/users/${storedUser.id}/tasks`);

//         setUserStats(statsResponse.data);
//         setUserTasks(tasks.data);
//       } catch (error) {
//         console.error("Error fetching user dashboard data:", error);
//         toast({
//           title: "Error",
//           description: "Failed to load your dashboard data",
//           variant: "destructive",
//         });
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchUserDashboardData();
//   }, [user, toast]);

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

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center h-[80vh]">
//         <div className="flex flex-col items-center gap-2">
//           <Loader2 className="h-8 w-8 animate-spin text-primary" />
//           <p>Loading your dashboard...</p>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold tracking-tight">My Dashboard</h1>
//           <p className="text-muted-foreground">Welcome back, {user?.name || "User"}! Here's your task overview.</p>
//         </div>
//         <Button onClick={() => setIsCreateTaskOpen(true)}>
//           <Plus className="mr-2 h-4 w-4" />
//           New Task
//         </Button>
//       </div>

//       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">My Tasks</CardTitle>
//             <div className="h-4 w-4 text-muted-foreground">
//               <Clock className="h-4 w-4" />
//             </div>
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{userStats.totalTasks}</div>
//             <p className="text-xs text-muted-foreground">Total assigned tasks</p>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Completed</CardTitle>
//             <div className="h-4 w-4 text-muted-foreground">
//               <CheckCircle className="h-4 w-4" />
//             </div>
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{userStats.completedTasks}</div>
//             <p className="text-xs text-muted-foreground">{userStats.completionRate}% completion rate</p>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">In Progress</CardTitle>
//             <div className="h-4 w-4 text-muted-foreground">
//               <Clock className="h-4 w-4" />
//             </div>
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{userStats.inProgressTasks}</div>
//             <p className="text-xs text-muted-foreground">Tasks currently in progress</p>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//             <CardTitle className="text-sm font-medium">Pending</CardTitle>
//             <div className="h-4 w-4 text-muted-foreground">
//               <AlertCircle className="h-4 w-4" />
//             </div>
//           </CardHeader>
//           <CardContent>
//             <div className="text-2xl font-bold">{userStats.pendingTasks}</div>
//             <p className="text-xs text-muted-foreground">Tasks waiting to be started</p>
//           </CardContent>
//         </Card>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         <Card className="md:col-span-2">
//           <CardHeader>
//             <CardTitle>My Tasks</CardTitle>
//             <CardDescription>View and manage your assigned tasks</CardDescription>
//           </CardHeader>
//           <CardContent>
//             {userTasks?.length === 0 ? (
//               <div className="text-center py-8 text-muted-foreground">
//                 <p>You don't have any tasks assigned yet.</p>
//                 <Button variant="outline" className="mt-4" onClick={() => setIsCreateTaskOpen(true)}>
//                   Create Your First Task
//                 </Button>
//               </div>
//             ) : (
//               <div className="overflow-x-auto">
//                 <Table>
//                   <TableHeader>
//                     <TableRow>
//                       <TableHead>Title</TableHead>
//                       <TableHead>Status</TableHead>
//                       <TableHead>Priority</TableHead>
//                       <TableHead>Due Date</TableHead>
//                     </TableRow>
//                   </TableHeader>
//                   <TableBody>
//                     {userTasks?.slice(0, 5).map((task) => (
//                       <TableRow
//                         key={task.id}
//                         className="cursor-pointer hover:bg-muted/50"
//                         onClick={() => {
//                           navigate(`/tasks/${task._id}`)
                          

//                         }}
//                       >
//                         <TableCell className="font-medium">{task.title}</TableCell>
//                         <TableCell>
//                           <Badge className={getStatusColor(task.status)}>{task.status}</Badge>
//                         </TableCell>
//                         <TableCell>
//                           <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
//                         </TableCell>
//                         <TableCell>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "No date"}</TableCell>
//                       </TableRow>
//                     ))}
//                   </TableBody>
//                 </Table>
//                 {userTasks?.length > 5 && (
//                   <div className="mt-4 text-center">
//                     <Button variant="outline" onClick={() => navigate("/tasks")}>
//                       View All Tasks
//                     </Button>
//                   </div>
//                 )}
//               </div>
//             )}
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader>
//             <CardTitle>Upcoming Deadlines</CardTitle>
//             <CardDescription>Tasks due soon</CardDescription>
//           </CardHeader>
//           <CardContent>
//             {userStats.upcomingDeadlines && userStats.upcomingDeadlines.length > 0 ? (
//               <div className="space-y-4">
//                 {userStats.upcomingDeadlines.map((task) => (
//                   <div
//                     key={task.id}
//                     className="flex items-center justify-between p-3 rounded-md bg-muted/50 cursor-pointer hover:bg-muted"
//                     onClick={() => navigate(`/tasks/${task.id}`)}
//                   >
//                     <div>
//                       <p className="font-medium text-sm">{task.title}</p>
//                       <p className="text-xs text-muted-foreground">
//                         Due: {new Date(task.dueDate).toLocaleDateString()}
//                       </p>
//                     </div>
//                     <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <div className="text-center py-8 text-muted-foreground">
//                 <Calendar className="mx-auto h-8 w-8 text-muted-foreground/60 mb-2" />
//                 <p>No upcoming deadlines</p>
//               </div>
//             )}
//           </CardContent>
//         </Card>
//       </div>

//       <Card>
//         <CardHeader>
//           <CardTitle>My Progress</CardTitle>
//           <CardDescription>Your task completion progress</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <div className="space-y-4">
//             <div>
//               <div className="flex items-center justify-between mb-2">
//                 <div className="space-y-1">
//                   <p className="text-sm font-medium">Overall Completion</p>
//                   <p className="text-xs text-muted-foreground">
//                     {userStats.completedTasks} of {userStats.totalTasks} tasks completed
//                   </p>
//                 </div>
//                 <span className="text-sm font-medium">{userStats.completionRate}%</span>
//               </div>
//               <Progress value={userStats.completionRate} className="h-2" />
//             </div>
//           </div>
//         </CardContent>
//       </Card>

//       <CreateTaskDialog open={isCreateTaskOpen} onOpenChange={setIsCreateTaskOpen} />
//     </div>
//   )
// }

// export default UserDashboard
