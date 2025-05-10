"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Plus, Loader2, Mail, FileText ,Target} from 'lucide-react'
import { useNavigate } from "react-router-dom"
import { CreateTaskDialog } from "../components/tasks/create-task-dialog"
import { DepartmentStats } from "../components/dashboard/department-stats"
import { TasksOverview } from "../components/dashboard/tasks-overview"
import { AIInsights } from "../components/dashboard/ai-insights"
import { RecentActivity } from "../components/dashboard/recent-activity"
import { api, API_URL } from "../lib/api"
import { useToast } from "../hooks/use-toast"
import { useAuth } from "../context/auth-context"
import axios from "axios"



function Dashboard() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { user } = useAuth()
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false)
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    pendingTasks: 0,
    totalTasksChange: 0,
    completedTasksChange: 0,
    inProgressTasksChange: 0,
    pendingTasksChange: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSendingReminders, setIsSendingReminders] = useState(false)
  const [isGeneratingReports, setIsGeneratingReports] = useState(false)
  const [isSendingAimReminders, setIsSendingAimReminders] = useState(false)

  const isAdmin = user && (user.role === "Admin" || user.role === "Manager")

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)
        const dashboardStats = await api.dashboard.getStats()
        setStats(dashboardStats)
      } catch (error) {
        console.error("Error fetching dashboard stats:", error)
        toast({
          title: "Error",
          description: "Failed to load dashboard statistics",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [toast])

  const handleBroadcastReminders = async () => {
    try {
      setIsSendingReminders(true)
      const result = await api.notifications.broadcastReminders()
      toast({
        title: "Success",
        description: `Sent ${result.emails.length} reminder emails to users`,
        variant: "success",
      })
    } catch (error) {
      console.error("Error sending reminders:", error)
      toast({
        title: "Error",
        description: "Failed to send reminder emails",
        variant: "destructive",
      })
    } finally {
      setIsSendingReminders(false)
    }
  }

  const handleGenerateReports = async () => {
    try {
      setIsGeneratingReports(true)
      const result = await axios.post(`${API_URL}/notifications/generate-reports/${user.id}`)
      
      toast({
        title: "Success",
        description: `Generated ${result.data.reports.length} department reports and sent to your email`,
        variant: "success",
      })
    } catch (error) {
      console.error("Error generating reports:", error)
      toast({
        title: "Error",
        description: "Failed to generate department reports",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingReports(false)
    }
  }
  const handleBroadcastAimReminders = async () => {
    try {
      setIsSendingAimReminders(true)
      const result = await api.notifications.broadcastAimReminders()
      toast({
        title: "Success",
        description: `Sent ${result.emails.length} aim reminder emails to users`,
        variant: "success",
      })
    } catch (error) {
      console.error("Error sending aim reminders:", error)
      toast({
        title: "Error",
        description: "Failed to send aim reminder emails",
        variant: "destructive",
      })
    } finally {
      setIsSendingAimReminders(false)
    }
  }
  

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col space-y-6 overflow-y-auto px-4 md:px-6 py-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's an overview of your workflow.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button onClick={() => setIsCreateTaskOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Task
          </Button>
          
          {isAdmin && (
            <>
              <Button 
                variant="outline" 
                onClick={handleBroadcastReminders}
                disabled={isSendingReminders}
              >
                {isSendingReminders ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="mr-2 h-4 w-4" />
                )}
                Broadcast Reminders
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleGenerateReports}
                disabled={isGeneratingReports}
              >
                {isGeneratingReports ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <FileText className="mr-2 h-4 w-4" />
                )}
                Generate Reports
              </Button>
            </>
          )}

<Button variant="outline" onClick={handleBroadcastAimReminders} disabled={isSendingAimReminders}>
          {isSendingAimReminders ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Target className="mr-2 h-4 w-4" />
          )}
          Broadcast Aim Reminders
        </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTasks}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalTasksChange >= 0 ? "+" : ""}
              {stats.totalTasksChange}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedTasks}</div>
            <p className="text-xs text-muted-foreground">
              {stats.completedTasksChange >= 0 ? "+" : ""}
              {stats.completedTasksChange}% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <path d="M2 10h20" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgressTasks}</div>
            <p className="text-xs text-muted-foreground">
              {stats.inProgressTasksChange > 0 ? "+" : ""}
              {stats.inProgressTasksChange} tasks since yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingTasks}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingTasksChange > 0 ? "+" : ""}
              {stats.pendingTasksChange} tasks since yesterday
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DepartmentStats />
        <TasksOverview />
        <AIInsights />
      </div>

   

      <CreateTaskDialog open={isCreateTaskOpen} onOpenChange={setIsCreateTaskOpen} />
    </div>
  )
}

export default Dashboard
