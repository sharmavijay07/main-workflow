"use client";

import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Bell } from "lucide-react";

export function NotificationsPopover() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="relative">
          <Bell className="h-6 w-6" />
          {/* You can add a badge for number of notifications */}
          <span className="absolute top-0 right-0 inline-flex h-2 w-2 rounded-full bg-red-500"></span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-2">
          <h4 className="font-semibold text-lg">Notifications</h4>
          <p className="text-sm text-muted-foreground">No new notifications</p>
        </div>
      </PopoverContent>
    </Popover>
  );
}
