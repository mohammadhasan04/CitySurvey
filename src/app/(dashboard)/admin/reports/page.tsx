"use client";

import { useState } from "react";
import { PageHeader, SectionCard } from "@/components/shared/page-components";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Download, FileText, Table2, FileSpreadsheet } from "lucide-react";
import { REPORT_TYPES } from "@/lib/constants";

const exportFormats = [
  { value: "pdf", label: "PDF Report", icon: FileText, color: "text-red-500" },
  { value: "excel", label: "Excel (.xlsx)", icon: FileSpreadsheet, color: "text-green-600" },
  { value: "csv", label: "CSV Data", icon: Table2, color: "text-blue-500" },
];

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState("");
  const [generating, setGenerating] = useState(false);

  const handleExport = async (format: string) => {
    if (!selectedReport) {
      toast.error("Please select a report type first");
      return;
    }
    setGenerating(true);
    // Simulate report generation
    setTimeout(() => {
      toast.success(`${format.toUpperCase()} report generated successfully`);
      setGenerating(false);
    }, 2000);
  };

  return (
    <div>
      <PageHeader
        title="Reports & Export"
        description="Generate and download reports in multiple formats"
      />

      {/* Report Selector */}
      <SectionCard title="Select Report Type" className="mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {REPORT_TYPES.map((report) => (
            <Card
              key={report.value}
              className={`cursor-pointer transition-all border-2 ${
                selectedReport === report.value
                  ? "border-primary bg-primary/5"
                  : "border-transparent hover:border-primary/20"
              }`}
              onClick={() => setSelectedReport(report.value)}
            >
              <CardContent className="p-4 flex items-center justify-between">
                <span className="font-medium text-sm">{report.label}</span>
                {selectedReport === report.value && (
                  <Badge>Selected</Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </SectionCard>

      {/* Export Options */}
      <SectionCard title="Export Format" description={selectedReport ? `Export ${REPORT_TYPES.find((r) => r.value === selectedReport)?.label || "report"}` : "Select a report type above first"}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {exportFormats.map((format) => (
            <Button
              key={format.value}
              variant="outline"
              className="h-auto p-5 flex flex-col items-center gap-3"
              disabled={!selectedReport || generating}
              onClick={() => handleExport(format.value)}
            >
              <format.icon className={`h-8 w-8 ${format.color}`} />
              <div className="text-center">
                <p className="font-semibold text-sm">{format.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Download {format.value.toUpperCase()}
                </p>
              </div>
            </Button>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
