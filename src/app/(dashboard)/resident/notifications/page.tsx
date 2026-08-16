"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/page-components";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Info, AlertTriangle, CheckCircle } from "lucide-react";
import { useI18n } from "@/i18n/config";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

const typeConfig: Record<string, { icon: typeof Info; color: string; bg: string }> = {
  INFO: { icon: Info, color: "text-blue-500", bg: "bg-blue-500/8" },
  WARNING: { icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-500/8" },
  SUCCESS: { icon: CheckCircle, color: "text-green-500", bg: "bg-green-500/8" },
};

export default function ResidentNotificationsPage() {
  const { t } = useI18n();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/notifications")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setNotifications(data.data || []);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader title={t("Notifications")} description={t("Messages and alerts from the city administration")} />

      {loading ? (
        <Card className="animate-fade-in">
          <CardContent className="p-8 text-center text-muted-foreground">
            {t("common.loading")}
          </CardContent>
        </Card>
      ) : notifications.length === 0 ? (
        <Card className="animate-fade-in">
          <CardContent className="p-8 text-center">
            <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold mb-2">{t("No notifications")}</h3>
            <p className="text-sm text-muted-foreground">
              {t("You're all caught up! Notifications from city administration will appear here.")}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((notif, i) => {
            const config = typeConfig[notif.type.toUpperCase()] || typeConfig.INFO;
            const Icon = config.icon;
            return (
              <Card
                key={notif.id}
                className={`animate-fade-in transition-all ${!notif.isRead ? "border-primary/20 bg-primary/2" : ""}`}
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                <CardContent className="p-4 flex items-start gap-4">
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${config.bg}`}>
                    <Icon className={`h-4 w-4 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h4 className="font-medium text-sm">{notif.title}</h4>
                      {!notif.isRead && <Badge variant="default" className="text-[10px] h-4 px-1.5">{t("New")}</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">{notif.message}</p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {new Date(notif.createdAt).toLocaleDateString("en-IN")}
                  </span>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
