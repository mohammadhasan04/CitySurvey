"use client";

import { useEffect, useState } from "react";
import { PageHeader, SectionCard, LoadingSkeleton } from "@/components/shared/page-components";
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
import { FileEdit, Send, Clock, CheckCircle, XCircle } from "lucide-react";

interface Correction {
  id: string;
  description: string;
  response: string | null;
  status: string;
  createdAt: string;
}

const statusIcons: Record<string, React.ReactNode> = {
  PENDING: <Clock className="h-3.5 w-3.5 text-amber-500" />,
  APPROVED: <CheckCircle className="h-3.5 w-3.5 text-green-500" />,
  REJECTED: <XCircle className="h-3.5 w-3.5 text-red-500" />,
};

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  APPROVED: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  REJECTED: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

export default function ResidentCorrectionsPage() {
  const [corrections, setCorrections] = useState<Correction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [field, setField] = useState("");
  const [currentValue, setCurrentValue] = useState("");
  const [requestedValue, setRequestedValue] = useState("");
  const [reason, setReason] = useState("");

  const fetchCorrections = () => {
    setLoading(true);
    fetch("/api/corrections")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setCorrections(data.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCorrections();
  }, []);

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!field || !requestedValue || !reason) {
      toast.error("Field selection, requested value, and reason are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/corrections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          field,
          currentValue,
          requestedValue,
          reason,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit request");

      toast.success("Correction request submitted for municipal admin review!");
      setShowForm(false);
      setField("");
      setCurrentValue("");
      setRequestedValue("");
      setReason("");
      fetchCorrections();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit request");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader title="Correction Requests" description="Request data corrections or updates to your household record">
        <Button
          onClick={() => setShowForm(!showForm)}
          className="gradient-primary border-0 text-white shadow-md shadow-primary/25 gap-1.5"
        >
          <FileEdit className="h-4 w-4" />
          {showForm ? "Cancel" : "New Request"}
        </Button>
      </PageHeader>

      {showForm && (
        <SectionCard title="Submit Correction Request" className="mb-6 animate-fade-in">
          <form onSubmit={handleSubmitRequest} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="corr-field">Field to Correct *</Label>
                <Select value={field} onValueChange={(val) => setField(val ?? "")} required>
                  <SelectTrigger id="corr-field">
                    <SelectValue placeholder="Select field..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="headOfFamily">Head of Family</SelectItem>
                    <SelectItem value="houseNumber">House Number</SelectItem>
                    <SelectItem value="address">Address</SelectItem>
                    <SelectItem value="phone">Phone Number</SelectItem>
                    <SelectItem value="educationLevel">Education Level</SelectItem>
                    <SelectItem value="employmentStatus">Employment Status</SelectItem>
                    <SelectItem value="other">Other Information</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="current-val">Current Value</Label>
                <Input
                  id="current-val"
                  placeholder="e.g. Current recorded info"
                  value={currentValue}
                  onChange={(e) => setCurrentValue(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="correct-val">Requested / Correct Value *</Label>
                <Input
                  id="correct-val"
                  placeholder="e.g. Corrected info"
                  value={requestedValue}
                  onChange={(e) => setRequestedValue(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Correction *</Label>
              <Textarea
                id="reason"
                placeholder="Explain why this data needs to be corrected..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                required
              />
            </div>

            <Button type="submit" disabled={isSubmitting} className="gap-1.5 gradient-primary border-0 text-white">
              <Send className="h-4 w-4" />
              {isSubmitting ? "Submitting..." : "Submit to City Admin"}
            </Button>
          </form>
        </SectionCard>
      )}

      {/* Correction History */}
      {loading ? (
        <LoadingSkeleton count={3} className="lg:grid-cols-1" />
      ) : corrections.length === 0 ? (
        <Card className="animate-fade-in border-border/50">
          <CardContent className="p-8 text-center">
            <FileEdit className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold mb-2">No Correction Requests</h3>
            <p className="text-sm text-muted-foreground mb-4">
              If you find any incorrect details in your household records, click above to submit a correction request to city administrators.
            </p>
            <Button onClick={() => setShowForm(true)} className="gradient-primary border-0 text-white gap-1.5">
              <FileEdit className="h-4 w-4" /> Submit First Request
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {corrections.map((c, i) => (
            <Card
              key={c.id}
              className="animate-fade-in shadow-sm hover:border-primary/20 transition-all"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <CardContent className="p-4 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge className={statusColors[c.status]}>
                      <span className="flex items-center gap-1">
                        {statusIcons[c.status]}
                        {c.status}
                      </span>
                    </Badge>
                  </div>
                  <p className="text-xs font-medium text-foreground">
                    {c.description}
                  </p>
                  {c.response && (
                    <p className="text-xs text-emerald-600 font-medium">
                      Admin Note: {c.response}
                    </p>
                  )}
                </div>
                <span className="text-xs text-muted-foreground shrink-0 font-medium">
                  {new Date(c.createdAt).toLocaleDateString("en-IN")}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
