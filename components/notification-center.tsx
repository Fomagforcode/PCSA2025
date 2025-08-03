"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Bell, CheckCheck, Circle, User, AlertTriangle } from "lucide-react"
import { useRealtime } from "@/hooks/use-realtime"
import type { RealtimeNotification } from "@/lib/realtime"
import { formatDistanceToNow } from "date-fns"

interface NotificationCenterProps {
  fieldOffice?: string
}

export function NotificationCenter({ fieldOffice }: NotificationCenterProps) {
  const { notifications, unreadCount, markAsRead, markAllAsRead, isConnected } = useRealtime(fieldOffice)
  const [isOpen, setIsOpen] = useState(false)

  const getNotificationIcon = (type: RealtimeNotification["type"]) => {
    switch (type) {
      case "new_registration":
        return <User className="h-4 w-4 text-blue-500" />
      case "status_update":
        return <CheckCheck className="h-4 w-4 text-green-500" />
      case "system_alert":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <Circle className="h-4 w-4 text-gray-500" />
    }
  }

  const getNotificationColor = (type: RealtimeNotification["type"]) => {
    switch (type) {
      case "new_registration":
        return "border-l-blue-500"
      case "status_update":
        return "border-l-green-500"
      case "system_alert":
        return "border-l-red-500"
      default:
        return "border-l-gray-500"
    }
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative bg-transparent">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
          {!isConnected && <div className="absolute -bottom-1 -right-1 h-2 w-2 bg-red-500 rounded-full" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {isConnected ? "Live" : "Offline"}
            </Badge>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllAsRead} className="h-6 px-2 text-xs">
                Mark all read
              </Button>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">No notifications yet</div>
        ) : (
          <ScrollArea className="h-96">
            <div className="space-y-1">
              {notifications.slice(0, 20).map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={`flex flex-col items-start gap-2 p-3 cursor-pointer border-l-2 ${getNotificationColor(notification.type)} ${
                    !notification.read ? "bg-muted/50" : ""
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start justify-between w-full">
                    <div className="flex items-center gap-2">
                      {getNotificationIcon(notification.type)}
                      <span className="font-medium text-sm">{notification.title}</span>
                      {!notification.read && <div className="h-2 w-2 bg-blue-500 rounded-full" />}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground w-full">{notification.message}</p>
                  {notification.fieldOffice && (
                    <Badge variant="outline" className="text-xs">
                      {notification.fieldOffice}
                    </Badge>
                  )}
                </DropdownMenuItem>
              ))}
            </div>
          </ScrollArea>
        )}

        {notifications.length > 20 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-center text-sm text-muted-foreground">
              Showing 20 of {notifications.length} notifications
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
