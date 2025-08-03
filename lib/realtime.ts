import { supabase } from "@/lib/supabase/client"
import type { RealtimeChannel } from "@supabase/supabase-js"

export interface RealtimeNotification {
  id: string
  type: "new_registration" | "status_update" | "system_alert"
  title: string
  message: string
  data?: any
  timestamp: Date
  read: boolean
  fieldOffice?: string
}

export class RealtimeManager {
  private channels: Map<string, RealtimeChannel> = new Map()
  private notifications: RealtimeNotification[] = []
  private listeners: Map<string, Set<Function>> = new Map()

  constructor() {
    this.setupSystemChannel()
  }

  private setupSystemChannel() {
    const systemChannel = supabase
      .channel("system-notifications")
      .on("broadcast", { event: "notification" }, (payload) => {
        this.handleNotification(payload.payload as RealtimeNotification)
      })
      .subscribe()

    this.channels.set("system", systemChannel)
  }

  subscribeToRegistrations(fieldOffice?: string, callback?: (payload: any) => void) {
    const channelName = fieldOffice ? `registrations-${fieldOffice}` : "registrations-all"

    if (this.channels.has(channelName)) {
      return this.channels.get(channelName)!
    }

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "individual_registrations",
          ...(fieldOffice && { filter: `field_office_id=eq.${fieldOffice}` }),
        },
        (payload) => {
          
          this.handleNewRegistration(payload, "individual")
          callback?.(payload)
        },
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "group_registrations",
          ...(fieldOffice && { filter: `field_office_id=eq.${fieldOffice}` }),
        },
        (payload) => {
          
          this.handleNewRegistration(payload, "group")
          callback?.(payload)
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "individual_registrations",
          ...(fieldOffice && { filter: `field_office_id=eq.${fieldOffice}` }),
        },
        (payload) => {
          
          this.handleStatusUpdate(payload, "individual")
          callback?.(payload)
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "group_registrations",
          ...(fieldOffice && { filter: `field_office_id=eq.${fieldOffice}` }),
        },
        (payload) => {
          
          this.handleStatusUpdate(payload, "group")
          callback?.(payload)
        },
      )
      .subscribe()

    this.channels.set(channelName, channel)
    return channel
  }

  private handleNewRegistration(payload: any, type: "individual" | "group") {
    const record = payload.new
    const notification: RealtimeNotification = {
      id: `new-${type}-${record.id}-${Date.now()}`,
      type: "new_registration",
      title: "New Registration",
      message:
        type === "individual"
          ? `${record.full_name} has registered for Funrun 2025`
          : `${record.agency_name} has submitted a group registration`,
      data: { record, type },
      timestamp: new Date(),
      read: false,
      fieldOffice: record.field_office_id?.toString(),
    }

    this.addNotification(notification)
    
    this.notifyListeners("new_registration", notification)
  }

  private handleStatusUpdate(payload: any, type: "individual" | "group") {
    const record = payload.new
    const oldRecord = payload.old

    if (record.status !== oldRecord.status) {
      const notification: RealtimeNotification = {
        id: `status-${type}-${record.id}-${Date.now()}`,
        type: "status_update",
        title: "Status Updated",
        message:
          type === "individual"
            ? `${record.full_name}'s registration status changed to ${record.status}`
            : `${record.agency_name}'s group registration status changed to ${record.status}`,
        data: { record, oldRecord, type },
        timestamp: new Date(),
        read: false,
        fieldOffice: record.field_office_id?.toString(),
      }

      this.addNotification(notification)
      this.notifyListeners("status_update", notification)
    }
  }

  private handleNotification(notification: RealtimeNotification) {
    this.addNotification(notification)
    this.notifyListeners("notification", notification)
  }

  private addNotification(notification: RealtimeNotification) {
    this.notifications.unshift(notification)
    // Keep only last 100 notifications
    if (this.notifications.length > 100) {
      this.notifications = this.notifications.slice(0, 100)
    }
  }

  private notifyListeners(event: string, data: any) {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      eventListeners.forEach((listener) => listener(data))
    }
  }

  addEventListener(event: string, listener: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(listener)
  }

  removeEventListener(event: string, listener: Function) {
    const eventListeners = this.listeners.get(event)
    if (eventListeners) {
      eventListeners.delete(listener)
    }
  }

  getNotifications(fieldOffice?: string): RealtimeNotification[] {
    if (!fieldOffice) return this.notifications
    return this.notifications.filter((n) => !n.fieldOffice || n.fieldOffice === fieldOffice)
  }

  getUnreadCount(fieldOffice?: string): number {
    return this.getNotifications(fieldOffice).filter((n) => !n.read).length
  }

  markAsRead(notificationId: string) {
    const notification = this.notifications.find((n) => n.id === notificationId)
    if (notification) {
      notification.read = true
    }
  }

  markAllAsRead(fieldOffice?: string) {
    this.getNotifications(fieldOffice).forEach((n) => (n.read = true))
  }

  broadcastNotification(notification: Omit<RealtimeNotification, "id" | "timestamp" | "read">) {
    const fullNotification: RealtimeNotification = {
      ...notification,
      id: `broadcast-${Date.now()}`,
      timestamp: new Date(),
      read: false,
    }

    supabase.channel("system-notifications").send({
      type: "broadcast",
      event: "notification",
      payload: fullNotification,
    })
  }

  disconnect() {
    this.channels.forEach((channel) => {
      supabase.removeChannel(channel)
    })
    this.channels.clear()
    this.listeners.clear()
  }
}

// Global instance
export const realtimeManager = new RealtimeManager()
