"use client";

import { useEffect, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/data-table";
import { PageHeader, LoadingSkeleton } from "@/components/shared/page-components";
import { Badge } from "@/components/ui/badge";

interface SurveyRecord {
  id: string;
  surveyId: string;
  headOfFamily: string;
  houseNumber: string;
  surveyStatus: string;
  totalMembers: number;
  createdAt: string;
  ward: { name: string; wardNumber: number };
}

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  IN_PROGRESS: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  COMPLETED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  VERIFIED: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400",
};

const columns: ColumnDef<SurveyRecord>[] = [
  { accessorKey: "surveyId", header: "Survey ID", cell: ({ row }) => <span className="font-mono text-xs">{row.original.surveyId}</span> },
  { accessorKey: "headOfFamily", header: "Head of Family", cell: ({ row }) => <span className="font-medium">{row.original.headOfFamily}</span> },
  { accessorKey: "houseNumber", header: "House #" },
  { id: "ward", header: "Ward", cell: ({ row }) => `W${row.original.ward.wardNumber} - ${row.original.ward.name}` },
  { accessorKey: "totalMembers", header: "Members" },
  { accessorKey: "surveyStatus", header: "Status", cell: ({ row }) => <Badge className={statusColors[row.original.surveyStatus]}>{row.original.surveyStatus.replace("_", " ")}</Badge> },
  { accessorKey: "createdAt", header: "Date", cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString("en-IN") },
];

export default function SurveyRecordsPage() {
  const [records, setRecords] = useState<SurveyRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/households")
      .then((r) => r.json())
      .then((data) => { if (data.success) setRecords(data.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader title="Survey Records" description="All household survey records" />
      {loading ? <LoadingSkeleton count={5} className="lg:grid-cols-1" /> : (
        <DataTable columns={columns} data={records} searchKey="surveyId" searchPlaceholder="Search by survey ID..." />
      )}
    </div>
  );
}
