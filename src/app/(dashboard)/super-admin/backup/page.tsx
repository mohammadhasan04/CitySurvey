"use client";

import { useState } from "react";
import { PageHeader, SectionCard } from "@/components/shared/page-components";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Database, Download, Upload, Clock, HardDrive, RefreshCw } from "lucide-react";

interface BackupEntry {
  id: string;
  filename: string;
  size: string;
  createdAt: string;
  type: "auto" | "manual";
}

const sampleBackups: BackupEntry[] = [
  { id: "1", filename: "backup_2026-08-01_auto.sql.gz", size: "45.2 MB", createdAt: "2026-08-01T00:00:00Z", type: "auto" },
  { id: "2", filename: "backup_2026-07-28_manual.sql.gz", size: "44.8 MB", createdAt: "2026-07-28T14:30:00Z", type: "manual" },
  { id: "3", filename: "backup_2026-07-25_auto.sql.gz", size: "44.1 MB", createdAt: "2026-07-25T00:00:00Z", type: "auto" },
];

export default function BackupPage() {
  const [backing, setBacking] = useState(false);

  const handleBackup = () => {
    setBacking(true);
    setTimeout(() => {
      toast.success("Database backup created successfully");
      setBacking(false);
    }, 3000);
  };

  return (
    <div>
      <PageHeader title="Backup & Restore" description="Database backup management">
        <Button
          onClick={handleBackup}
          disabled={backing}
          className="gradient-primary border-0 text-white shadow-md shadow-primary/25 gap-1.5"
        >
          {backing ? (
            <><RefreshCw className="h-4 w-4 animate-spin" /> Creating Backup...</>
          ) : (
            <><Database className="h-4 w-4" /> Create Backup Now</>
          )}
        </Button>
      </PageHeader>

      {/* Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="animate-fade-in">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/8">
              <HardDrive className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Last Backup</p>
              <p className="font-semibold text-sm">Aug 1, 2026</p>
            </div>
          </CardContent>
        </Card>
        <Card className="animate-fade-in stagger-1">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/8">
              <Clock className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Auto Backup</p>
              <p className="font-semibold text-sm">Every 3 days</p>
            </div>
          </CardContent>
        </Card>
        <Card className="animate-fade-in stagger-2">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/8">
              <Database className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Backups</p>
              <p className="font-semibold text-sm">{sampleBackups.length} stored</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Backup History */}
      <SectionCard title="Backup History">
        <div className="space-y-2">
          {sampleBackups.map((backup, i) => (
            <div
              key={backup.id}
              className="flex items-center justify-between p-3 rounded-lg border animate-fade-in"
              style={{ animationDelay: `${i * 0.08}s` }}
            >
              <div className="flex items-center gap-3">
                <Database className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium text-sm">{backup.filename}</p>
                  <p className="text-xs text-muted-foreground">
                    {backup.size} • {new Date(backup.createdAt).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={backup.type === "auto" ? "secondary" : "default"}>
                  {backup.type}
                </Badge>
                <Button variant="ghost" size="sm" className="gap-1">
                  <Download className="h-3.5 w-3.5" /> Download
                </Button>
                <Button variant="ghost" size="sm" className="gap-1">
                  <Upload className="h-3.5 w-3.5" /> Restore
                </Button>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
