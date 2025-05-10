// "use client";

// import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
// import { Bell } from "lucide-react";

// export function NotificationsPopover() {
//   return (
//     <Popover>
//       <PopoverTrigger asChild>
//         <button className="relative">
//           <Bell className="h-6 w-6" />
//           {/* You can add a badge for number of notifications */}
//           <span className="absolute top-0 right-0 inline-flex h-2 w-2 rounded-full bg-red-500"></span>
//         </button>
//       </PopoverTrigger>
//       <PopoverContent className="w-80">
//         <div className="space-y-2">
//           <h4 className="font-semibold text-lg">Notifications</h4>
//           <p className="text-sm text-muted-foreground">No new notifications</p>
//         </div>
//       </PopoverContent>
//     </Popover>
//   );
// }


"use client";

import { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Badge } from "../ui/badge";
import { useDashboard } from "../../context/DashboardContext";
import { useNavigate } from "react-router-dom";

export function NotificationsPopover() {
  const dashboardContext = useDashboard();
  const { recentReviews = [], hasNewReviews = false, markReviewsAsSeen = () => {} } = dashboardContext || {};
  const [readReviews, setReadReviews] = useState(new Set());
  const navigate = useNavigate();

  // Debug log to inspect recentReviews
  console.log("recentReviews:", recentReviews);

  // Ensure recentReviews is an array before filtering
  const safeReviews = Array.isArray(recentReviews) ? recentReviews : [];
  const unreadCount = safeReviews.filter((review) => !readReviews.has(review._id)).length;

  const markAsRead = (reviewId) => {
    setReadReviews((prev) => new Set([...prev, reviewId]));
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label={`Notifications (${unreadCount} unread)`}>
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-white border shadow-xl rounded-xl p-4" align="end">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium">Notifications</h4>
          {unreadCount > 0 && (
            <Button
              variant="link"
              size="sm"
              onClick={() => {
                markReviewsAsSeen();
                setReadReviews(new Set(safeReviews.map((r) => r._id)));
              }}
              className="text-blue-600 text-xs"
            >
              Mark all as read
            </Button>
          )}
        </div>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {safeReviews.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No new notifications</p>
          ) : (
            safeReviews.map((review) => (
              <div
                key={review._id}
                className={`p-2 rounded-md text-sm ${
                  readReviews.has(review._id) ? "bg-muted/50" : "bg-blue-50 dark:bg-blue-900/20"
                } cursor-pointer hover:bg-muted`}
                onClick={() => {
                  markAsRead(review._id);
                  navigate(`/tasks/${review.task._id}`);
                }}
              >
                <p className="font-medium">
                  Submission for "{review.task?.title || "Unknown Task"}" was {review.status}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(review.updatedAt).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
