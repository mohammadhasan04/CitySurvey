"use client";

import { useState } from "react";
import { PageHeader, SectionCard } from "@/components/shared/page-components";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Send, Bell, Users, Home } from "lucide-react";

export default function AdminNotificationsPage() {
  const [sending, setSending] = useState(false);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      toast.success("Notification sent successfully");
      setSending(false);
    }, 1500);
  };

  return (
    <div>
      <PageHeader title="Notifications" description="Send notifications to residents" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Send Notification */}
        <SectionCard title="Send Notification" className="lg:col-span-2 animate-fade-in">
          <form onSubmit={handleSend} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notif-title">Title</Label>
              <Input id="notif-title" placeholder="Notification title" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notif-message">Message</Label>
              <Textarea id="notif-message" placeholder="Write your notification message..." rows={4} required />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Target Audience</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select audience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Residents</SelectItem>
                    <SelectItem value="ward">Specific Ward</SelectItem>
                    <SelectItem value="household">Specific Household</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type="submit" disabled={sending} className="gradient-primary border-0 text-white gap-1.5">
              <Send className="h-4 w-4" />
              {sending ? "Sending..." : "Send Notification"}
            </Button>
          </form>
        </SectionCard>

        {/* Quick Stats */}
        <div className="space-y-4 animate-fade-in stagger-1">
          <Card>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/8">
                <Bell className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Sent</p>
                <p className="text-xl font-bold">0</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/8">
                <Users className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Residents Reached</p>
                <p className="text-xl font-bold">0</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
