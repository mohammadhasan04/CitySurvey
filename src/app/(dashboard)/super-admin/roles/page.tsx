"use client";

import { PageHeader, SectionCard } from "@/components/shared/page-components";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Key, Shield, Users } from "lucide-react";
import { ROLES } from "@/lib/constants";

const rolePermissions: Record<string, string[]> = {
  SUPER_ADMIN: ["Full system access", "Manage city admins", "System settings", "Audit logs", "Backup/Restore", "Security config"],
  CITY_ADMIN: ["Manage households", "Manage residents", "Manage wards/areas", "Send notifications", "View analytics", "Generate reports", "Handle corrections"],
  RESIDENT: ["View own household", "View family members", "Submit corrections", "View notifications", "Update profile"],
  PUBLIC: ["View statistics", "View survey progress", "Contact form"],
};

export default function RolesPage() {
  return (
    <div>
      <PageHeader title="Roles & Permissions" description="System role definitions and access control" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(rolePermissions).map(([role, permissions], i) => (
          <Card key={role} className="animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/8">
                  {role === "SUPER_ADMIN" ? <Shield className="h-5 w-5 text-primary" /> :
                   role === "CITY_ADMIN" ? <Key className="h-5 w-5 text-primary" /> :
                   <Users className="h-5 w-5 text-primary" />}
                </div>
                <div>
                  <h3 className="font-bold font-heading">{role.replace(/_/g, " ")}</h3>
                  <Badge variant="secondary" className="text-[10px]">{permissions.length} permissions</Badge>
                </div>
              </div>
              <ul className="space-y-1.5">
                {permissions.map((p) => (
                  <li key={p} className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    {p}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
