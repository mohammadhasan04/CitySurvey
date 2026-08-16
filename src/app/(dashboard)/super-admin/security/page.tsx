"use client";

import { PageHeader, SectionCard } from "@/components/shared/page-components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Lock, Key, ShieldCheck, Timer } from "lucide-react";
import { toast } from "sonner";

export default function SecurityPage() {
  return (
    <div>
      <PageHeader title="Security Settings" description="Configure authentication and access policies" />

      <div className="space-y-6">
        <SectionCard title="Password Policy" icon={<Key className="h-5 w-5 text-primary" />}>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Minimum Password Length</Label>
                <Input type="number" defaultValue="8" min="6" max="32" />
              </div>
              <div className="space-y-2">
                <Label>Max Login Attempts</Label>
                <Input type="number" defaultValue="5" min="3" max="10" />
              </div>
            </div>
            {[
              { label: "Require uppercase letter", default: true },
              { label: "Require number", default: true },
              { label: "Require special character", default: true },
            ].map((rule) => (
              <div key={rule.label} className="flex items-center justify-between p-3 rounded-lg border">
                <span className="text-sm font-medium">{rule.label}</span>
                <Switch defaultChecked={rule.default} />
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Session Management" icon={<Timer className="h-5 w-5 text-primary" />}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Session Timeout (hours)</Label>
              <Input type="number" defaultValue="24" min="1" max="168" />
            </div>
            <div className="space-y-2">
              <Label>Token Refresh Interval (hours)</Label>
              <Input type="number" defaultValue="1" min="1" max="24" />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Security Status" icon={<ShieldCheck className="h-5 w-5 text-primary" />}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "HTTPS Enforced", value: "Yes", status: "green" },
              { label: "CSRF Protection", value: "Active", status: "green" },
              { label: "Rate Limiting", value: "Enabled", status: "green" },
            ].map((item) => (
              <div key={item.label} className="p-3 rounded-lg bg-muted/50 flex items-center justify-between">
                <span className="text-sm">{item.label}</span>
                <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                  {item.value}
                </Badge>
              </div>
            ))}
          </div>
        </SectionCard>

        <Button
          onClick={() => toast.success("Security settings saved")}
          className="gradient-primary border-0 text-white shadow-md shadow-primary/25 gap-1.5"
        >
          <Lock className="h-4 w-4" /> Save Security Settings
        </Button>
      </div>
    </div>
  );
}
