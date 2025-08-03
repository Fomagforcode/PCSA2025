"use client"

import { useState, useEffect, useCallback } from "react"
import { realtimeManager, type RealtimeNotification } from "@/lib/realtime"
import { useToast } from "@/hooks/use-toast"

interface UseRealtimeOptions {
  table?: string
  callback?: () => void
}

export function useRealtime(options?: UseRealtimeOptions | string) {
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isConnected, setIsConnected] = useState(false)
  const { toast } = useToast()

  // Handle legacy string parameter
  const fieldOffice = typeof options === "string" ? options : undefined
  const table = typeof options === "object" ? options?.table : undefined
  const callback = typeof options === "object" ? options?.callback : undefined

  const updateNotifications = useCallback(() => {
    const allNotifications = realtimeManager.getNotifications(fieldOffice)
    const unread = realtimeManager.getUnreadCount(fieldOffice)

    setNotifications(allNotifications)
    setUnreadCount(unread)
  }, [fieldOffice])

  const handleNewRegistration = useCallback(
    (notification: RealtimeNotification) => {
      updateNotifications()

      // Show toast notification
      toast({
        title: notification.title,
        description: notification.message,
        duration: 5000,
      })

      // Call the provided callback if it exists
      if (callback) {
        callback()
      }
    },
    [updateNotifications, toast, callback],
  )

  const handleStatusUpdate = useCallback(
    (notification: RealtimeNotification) => {
      updateNotifications()

      // Show toast notification for status updates
      toast({
        title: notification.title,
        description: notification.message,
        duration: 3000,
      })

      // Call the provided callback if it exists
      if (callback) {
        callback()
      }
    },
    [updateNotifications, toast, callback],
  )

  const handleSystemNotification = useCallback(
    (notification: RealtimeNotification) => {
      updateNotifications()

      // Show toast for system notifications
      toast({
        title: notification.title,
        description: notification.message,
        variant: notification.type === "system_alert" ? "destructive" : "default",
        duration: 5000,
      })
    },
    [updateNotifications, toast],
  )

  useEffect(() => {
    // Subscribe to realtime updates
    const channel = realtimeManager.subscribeToRegistrations(fieldOffice, () => {
      setIsConnected(true)
    })

    // Add event listeners
    realtimeManager.addEventListener("new_registration", handleNewRegistration)
    realtimeManager.addEventListener("status_update", handleStatusUpdate)
    realtimeManager.addEventListener("notification", handleSystemNotification)

    // Initial load
    updateNotifications()
    setIsConnected(true)

    return () => {
      // Cleanup listeners
      realtimeManager.removeEventListener("new_registration", handleNewRegistration)
      realtimeManager.removeEventListener("status_update", handleStatusUpdate)
      realtimeManager.removeEventListener("notification", handleSystemNotification)
      setIsConnected(false)
    }
  }, [fieldOffice, handleNewRegistration, handleStatusUpdate, handleSystemNotification, updateNotifications])

  const markAsRead = useCallback(
    (notificationId: string) => {
      realtimeManager.markAsRead(notificationId)
      updateNotifications()
    },
    [updateNotifications],
  )

  const markAllAsRead = useCallback(() => {
    realtimeManager.markAllAsRead(fieldOffice)
    updateNotifications()
  }, [fieldOffice, updateNotifications])

  const broadcastNotification = useCallback((notification: Omit<RealtimeNotification, "id" | "timestamp" | "read">) => {
    realtimeManager.broadcastNotification(notification)
  }, [])

  return {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    broadcastNotification,
    refresh: updateNotifications,
  }
}
