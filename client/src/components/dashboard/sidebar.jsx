import { useLocation, Link } from "react-router-dom"
import { LayoutDashboard, CheckSquare, Network, Users, Sparkles, Settings, LogOut, CheckCircle } from "lucide-react"

export function DashboardSidebar() {
  const location = useLocation()

  const routes = [
    { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { title: "Tasks", href: "/tasks", icon: CheckSquare },
    { title: "Dependencies", href: "/dependencies", icon: Network },
    { title: "Departments", href: "/departments", icon: Users },
    { title: "AI Optimization", href: "/optimization", icon: Sparkles },
    { title: "Completed Tasks", href: "/completedtask", icon: CheckCircle },
  ]

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900 text-black dark:text-white">
      <div className="border-b border-border dark:border-gray-700">
        <div className="flex items-center px-4 py-3">
          <div className="flex items-center gap-2 font-semibold text-xl">
            <Sparkles className="h-6 w-6 text-primary" />
            <span>WorkflowAI</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <div className="mb-6">
            <div className="text-sm font-medium text-muted-foreground dark:text-gray-400 mb-2">Navigation</div>
            <nav className="space-y-1">
              {routes.map((route) => (
                <Link
                  key={route.href}
                  to={route.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm ${
                    location.pathname === route.href
                      ? "bg-primary/10 text-primary font-medium"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <route.icon className="h-5 w-5" />
                  <span>{route.title}</span>
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <div className="text-sm font-medium text-muted-foreground dark:text-gray-400 mb-2">Workspace</div>
            <div className="px-3 py-2">
              <div className="text-sm font-medium">Default Workspace</div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-border dark:border-gray-700 p-4">
        <div className="space-y-1">
          <Link
            to="/settings"
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Settings className="h-5 w-5" />
            <span>Settings</span>
          </Link>
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm hover:bg-gray-100 dark:hover:bg-gray-800">
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  )
}
