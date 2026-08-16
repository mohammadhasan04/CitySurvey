"use client";

import { useEffect, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader, LoadingSkeleton } from "@/components/shared/page-components";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollText, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useDebounce } from "@/hooks/use-debounce";

interface AuditEntry {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  details: string | null;
  createdAt: string;
  user: { name: string; email: string } | null;
}

const actionColors: Record<string, string> = {
  CREATE: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  UPDATE: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  DELETE: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  REGISTER: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
  LOGIN: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-400",
};

const columns: ColumnDef<AuditEntry>[] = [
  {
    accessorKey: "createdAt",
    header: "Timestamp",
    cell: ({ row }) => (
      <span className="text-xs font-mono">
        {new Date(row.original.createdAt).toLocaleString("en-IN")}
      </span>
    ),
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => (
      <Badge className={actionColors[row.original.action] || ""}>{row.original.action}</Badge>
    ),
  },
  {
    accessorKey: "entity",
    header: "Entity",
    cell: ({ row }) => <span className="font-medium">{row.original.entity}</span>,
  },
  {
    id: "user",
    header: "User",
    cell: ({ row }) => row.original.user?.name || "System",
  },
  {
    accessorKey: "details",
    header: "Details",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground truncate max-w-[200px] block">
        {row.original.details || "—"}
      </span>
    ),
  },
];

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/audit-logs")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setLogs(data.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader title="Audit Logs" description="System activity and change history" />

      {loading ? (
        <LoadingSkeleton count={8} className="lg:grid-cols-1" />
      ) : logs.length === 0 ? (
        <Card className="animate-fade-in">
          <CardContent className="p-8 text-center">
            <ScrollText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold mb-2">No audit logs yet</h3>
            <p className="text-sm text-muted-foreground">
              System activity will be recorded here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <DataTable columns={columns} data={logs} searchKey="entity" searchPlaceholder="Search logs..." />
      )}
    </div>
  );
}
