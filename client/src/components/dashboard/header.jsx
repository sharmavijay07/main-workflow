// "use client"

// import { useState } from "react"
// import { Search } from "lucide-react"
// import { Button } from "../ui/button"
// import { Input } from "../ui/input"
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuLabel,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "../ui/dropdown-menu"
// import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
// import { ModeToggle } from "../mode-toggle"
// import { NotificationsPopover } from "../notifications/notifications-popover"
// import { useAuth } from "../../context/auth-context"
// import { MobileMenuButton } from "../ui/mobile-menu-button"

// export function DashboardHeader({ sidebarOpen, onSidebarToggle }) {
//   const [searchQuery, setSearchQuery] = useState("")
//   const { user } = useAuth()
  

//   return (
//     <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur-lg">
//       <div className="flex h-16 items-center justify-between px-4 md:px-6">
//          {/* Mobile Menu Button */}
        
        
//           <div className="block md:hidden z-50">
//           <MobileMenuButton isOpen={sidebarOpen} onClick={onSidebarToggle} className="mr-3" />
//         </div>
        

//         <div className="relative max-w-md flex-1 hidden md:flex">
//           <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
//           <Input
//             type="search"
//             placeholder="Search tasks, departments..."
//             className="w-full pl-8"
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//           />
//         </div>

//         <div className="flex flex-1 items-center justify-end space-x-4">
//           <NotificationsPopover />
//           <ModeToggle />
//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <Button variant="ghost" className="relative h-8 w-8 rounded-full">
//                 <Avatar className="h-8 w-8">
//                   <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
//                   <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
//                 </Avatar>
//               </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent
//               className="w-56 bg-popover/90 backdrop-blur-md border border-border shadow-xl rounded-xl"
//               align="end"
//               forceMount
//             >
//               <DropdownMenuLabel className="font-normal">
//                 <div className="flex flex-col space-y-1">
//                   <p className="text-sm font-medium leading-none">{user?.name || "User"}</p>
//                   <p className="text-xs leading-none text-muted-foreground">{user?.email || "user@example.com"}</p>
//                 </div>
//               </DropdownMenuLabel>
//               <DropdownMenuSeparator />
//               <DropdownMenuItem>Profile</DropdownMenuItem>
//               <DropdownMenuItem>Settings</DropdownMenuItem>
//               <DropdownMenuSeparator />
//               <DropdownMenuItem>Log out</DropdownMenuItem>
//             </DropdownMenuContent>
//           </DropdownMenu>
//         </div>
//       </div>
//     </header>
//   )
// }

"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ModeToggle } from "../mode-toggle"
import { NotificationsPopover } from "../notifications/notifications-popover"
import { useAuth } from "../../context/auth-context"
import { MobileMenuButton } from "@/components/ui/mobile-menu-button"

export function DashboardHeader({ sidebarOpen, onSidebarToggle }) {
  const [searchQuery, setSearchQuery] = useState("")
  const { user, logout } = useAuth()

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur-lg">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Mobile Menu Button */}
        <div className="block md:hidden z-50">
          <MobileMenuButton isOpen={sidebarOpen} onClick={onSidebarToggle} className="mr-3" />
        </div>

        <div className="relative max-w-md flex-1 hidden md:flex">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search tasks, departments..."
            className="w-full pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-1 items-center justify-end space-x-4">
          <NotificationsPopover />
          <ModeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                  <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-56 bg-popover/90 backdrop-blur-md border border-border shadow-xl rounded-xl"
              align="end"
              forceMount
            >
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name || "User"}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email || "user@example.com"}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
