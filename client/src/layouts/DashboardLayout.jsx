"use client"

import { useState } from "react"
import { Outlet } from "react-router-dom"
import { DashboardSidebar } from "../components/dashboard/sidebar"
import { DashboardHeader } from "../components/dashboard/header"

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
    // Add a class to the body to prevent scrolling when sidebar is open
    if (!sidebarOpen) {
      document.body.classList.add('sidebar-open')
    } else {
      document.body.classList.remove('sidebar-open')
    }
  }

  return (
    <div className="flex min-h-screen overflow-hidden">
      {/* Overlay for small screens when sidebar is open */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
          onClick={() => toggleSidebar()}
        />
      )}

      {/* Mobile Sidebar - completely separate from desktop sidebar for better control */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 transform transition-transform duration-300 ease-in-out md:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } border-r border-border`}
      >
        <DashboardSidebar />
      </div>

      {/* Desktop Sidebar - always visible on larger screens */}
      <div className="hidden md:block w-64 shrink-0">
        <div className="h-screen sticky top-0">
          <DashboardSidebar />
        </div>
      </div>

      {/* Main content area */}
      <div className="flex flex-col flex-1 w-full">
        <DashboardHeader sidebarOpen={sidebarOpen} onSidebarToggle={toggleSidebar} />
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
