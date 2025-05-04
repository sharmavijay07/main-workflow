import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { ThemeProvider } from "./components/theme-provider"
import { SidebarProvider } from "./components/ui/sidebar"
import { Toaster } from "./components/ui/toaster"
import { WorkspaceProvider } from "./context/workspace-context"
import { SocketProvider } from "./context/socket-context"
import { AuthProvider } from "./context/auth-context"
import { ProtectedRoute } from "./components/ProtectedRoute"
import { DashboardLayout } from "./layouts/DashboardLayout"
import Dashboard from "./pages/Dashboard"
import Tasks from "./pages/Tasks"
import Dependencies from "./pages/Dependencies"
import Departments from "./pages/Departments"
import Optimization from "./pages/Optimization"
import Settings from "./pages/Settings"
import Login from "./pages/Login"
import Register from "./pages/Register"
import AdminDashboard from "./pages/AdminDashboard"
import UserDashboard from "./pages/UserDashboard"
import TaskDetails from "./pages/TaskDetails"
import CompletedTasks from "./pages/CompletedTasks"
import Progress from "./pages/Progress"

function App() {

  const user = JSON.parse(localStorage.getItem("WorkflowUser") || "{}");
  const isAdmin = user?.role === "Admin"; // Assuming role is stored in the user 
  return (
    <ThemeProvider defaultTheme="system" storageKey="workflow-theme">
      <Router>
        <AuthProvider>
          <WorkspaceProvider>
            <SocketProvider>
              <SidebarProvider>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/progress" element={<Progress />} />

                  {/* Protected Routes */}
                  <Route
                    path="/"
                    element={ isAdmin? 
                     
                        <Navigate to="/dashboard" replace />
                     
                      :
                      <ProtectedRoute>
                        <Navigate to="/userdashboard" replace />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/"
                    element={
                      <ProtectedRoute>
                        <DashboardLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route
                      path="/dashboard"
                      element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      }
                    />


                    <Route
                      path="/admindashboard"
                      element={
                        <ProtectedRoute>
                          <AdminDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/userdashboard"
                      element={
                        <ProtectedRoute>
                          <UserDashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/tasks"
                      element={
                        <ProtectedRoute>
                          <Tasks />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/tasks/:id"
                      element={
                        <ProtectedRoute>
                          <TaskDetails />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/dependencies"
                      element={
                        <ProtectedRoute>
                          <Dependencies />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/departments"
                      element={
                        <ProtectedRoute>
                          <Departments />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/optimization"
                      element={
                        <ProtectedRoute>
                          <Optimization />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/settings"
                      element={
                        
                          <Settings />
                        
                      }

                    />
                    <Route
                      path="/completedtask"
                      element={
                        <ProtectedRoute>
                       <CompletedTasks />
                       </ProtectedRoute>
                      }
                      
                    />
                  </Route>
                </Routes>
                <Toaster />
              </SidebarProvider>
            </SocketProvider>
          </WorkspaceProvider>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  )
}

export default App
