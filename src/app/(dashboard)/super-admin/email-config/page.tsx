"use client";

import { PageHeader, SectionCard } from "@/components/shared/page-components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Save, Mail, Send } from "lucide-react";

export default function EmailConfigPage() {
  return (
    <div>
      <PageHeader title="Email Configuration" description="Configure SMTP settings for email notifications" />

      <div className="space-y-6">
        <SectionCard title="SMTP Settings" icon={<Mail className="h-5 w-5 text-primary" />}>
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); toast.success("Email settings saved"); }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>SMTP Host</Label>
                <Input placeholder="smtp.example.com" />
              </div>
              <div className="space-y-2">
                <Label>SMTP Port</Label>
                <Input type="number" defaultValue="587" />
              </div>
              <div className="space-y-2">
                <Label>Username</Label>
                <Input placeholder="user@example.com" />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input type="password" placeholder="••••••••" />
              </div>
              <div className="space-y-2">
                <Label>From Name</Label>
                <Input defaultValue="City Survey System" />
              </div>
              <div className="space-y-2">
                <Label>From Email</Label>
                <Input type="email" placeholder="noreply@citysurvey.local" />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <p className="font-medium text-sm">Use TLS/SSL</p>
                <p className="text-xs text-muted-foreground">Encrypt email communication</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex gap-3">
              <Button type="submit" className="gradient-primary border-0 text-white gap-1.5">
                <Save className="h-4 w-4" /> Save Settings
              </Button>
              <Button type="button" variant="outline" className="gap-1.5" onClick={() => toast.info("Test email sent (simulated)")}>
                <Send className="h-4 w-4" /> Send Test Email
              </Button>
            </div>
          </form>
        </SectionCard>

        <SectionCard title="Email Status">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-3 rounded-lg bg-muted/50 flex items-center justify-between">
              <span className="text-sm">SMTP Connection</span>
              <Badge variant="secondary">Not Configured</Badge>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 flex items-center justify-between">
              <span className="text-sm">Emails Sent Today</span>
              <Badge variant="secondary">0</Badge>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 flex items-center justify-between">
              <span className="text-sm">Failed Deliveries</span>
              <Badge variant="secondary">0</Badge>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
