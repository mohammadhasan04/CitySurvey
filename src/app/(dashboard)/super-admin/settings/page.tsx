"use client";

import { useState } from "react";
import { PageHeader, SectionCard } from "@/components/shared/page-components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Save, Globe, Bell, Database } from "lucide-react";

export default function SettingsPage() {
  return (
    <div>
      <PageHeader title="System Settings" description="Configure application-wide settings" />

      <div className="space-y-6">
        <SectionCard title="General Settings" icon={<Globe className="h-5 w-5 text-primary" />}>
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); toast.success("Settings saved"); }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city-name">City Name</Label>
                <Input id="city-name" defaultValue="Sample City" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city-code">City Code</Label>
                <Input id="city-code" defaultValue="SC-001" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-email">Admin Email</Label>
                <Input id="admin-email" type="email" defaultValue="admin@citysurvey.local" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-phone">Contact Phone</Label>
                <Input id="contact-phone" defaultValue="+91 1234 567890" />
              </div>
            </div>
            <Button type="submit" className="gradient-primary border-0 text-white gap-1.5">
              <Save className="h-4 w-4" /> Save Settings
            </Button>
          </form>
        </SectionCard>

        <SectionCard title="Feature Toggles" icon={<Bell className="h-5 w-5 text-primary" />}>
          <div className="space-y-4">
            {[
              { id: "allow-registration", label: "Public Registration", desc: "Allow new users to register", default: true },
              { id: "email-notifications", label: "Email Notifications", desc: "Send email notifications for important events", default: false },
              { id: "maintenance-mode", label: "Maintenance Mode", desc: "Show maintenance page to all users", default: false },
              { id: "survey-open", label: "Survey Open", desc: "Allow data collection and survey submission", default: true },
            ].map((toggle) => (
              <div key={toggle.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <p className="font-medium text-sm">{toggle.label}</p>
                  <p className="text-xs text-muted-foreground">{toggle.desc}</p>
                </div>
                <Switch id={toggle.id} defaultChecked={toggle.default} />
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Database Info" icon={<Database className="h-5 w-5 text-primary" />}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-muted-foreground">Provider</p>
              <p className="font-semibold">Supabase PostgreSQL</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-muted-foreground">ORM</p>
              <p className="font-semibold">Prisma 7</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-muted-foreground">Status</p>
              <p className="font-semibold text-green-600 dark:text-green-400">Connected</p>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
