"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { markNotificationRead, markAllNotificationsRead } from "@/app/sbh-1111/notifications-actions";

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  link: string | null;
  readAt: Date | null;
  createdAt: Date;
}

export function NotificationBell({ notifications }: { notifications: AdminNotification[] }) {
  const [isPending, startTransition] = useTransition();
  const unreadCount = notifications.filter((n) => !n.readAt).length;

  function handleOpenNotification(notification: AdminNotification) {
    if (!notification.readAt) {
      startTransition(() => {
        markNotificationRead(notification.id);
      });
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-2 py-1.5">
          <DropdownMenuLabel className="p-0">Notifications</DropdownMenuLabel>
          {unreadCount > 0 && (
            <button
              type="button"
              disabled={isPending}
              onClick={() => startTransition(() => markAllNotificationsRead())}
              className="text-xs font-medium text-primary hover:underline"
            >
              Mark all read
            </button>
          )}
        </div>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <p className="px-2 py-4 text-center text-sm text-muted-foreground">No notifications yet.</p>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {notifications.map((n) => {
              const content = (
                <div className={`px-2 py-2.5 text-sm ${!n.readAt ? "bg-muted/60" : ""}`}>
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium">{n.title}</p>
                    {!n.readAt && <Badge variant="default" className="h-1.5 w-1.5 shrink-0 rounded-full p-0" />}
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{n.message}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground/70">
                    {n.createdAt.toISOString().slice(0, 16).replace("T", " ")}
                  </p>
                </div>
              );
              return n.link ? (
                <Link key={n.id} href={n.link} onClick={() => handleOpenNotification(n)} className="block hover:bg-muted">
                  {content}
                </Link>
              ) : (
                <button key={n.id} type="button" onClick={() => handleOpenNotification(n)} className="block w-full text-left hover:bg-muted">
                  {content}
                </button>
              );
            })}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
