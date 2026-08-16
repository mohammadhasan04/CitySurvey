"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { KeyRound, ArrowRight, Building2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your registered email address");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to send password reset link");
      } else {
        toast.success("Password reset link sent! Please check your email inbox.");
        setIsSent(true);
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-hero p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,oklch(0.555_0.195_250/15%),transparent_60%)]" />

      <Card className="relative w-full max-w-md shadow-2xl shadow-black/20 border-border/30 animate-scale-in my-8">
        <CardHeader className="text-center pb-2">
          <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-2xl gradient-primary shadow-lg shadow-primary/25 mb-4">
            <KeyRound className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold font-heading">
            Forgot Password?
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Enter your email address to receive a secure password reset link.
          </p>
        </CardHeader>

        <CardContent className="pt-4">
          {isSent ? (
            <div className="space-y-4 text-center">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-sm">
                A password reset link has been dispatched to <strong>{email}</strong>. Please open your email inbox and click the reset link.
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsSent(false)}
                className="w-full"
              >
                Send to another email address
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="forgot-email">Email Address</Label>
                <div className="relative">
                  <Input
                    id="forgot-email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                    required
                  />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 gradient-primary border-0 text-white shadow-md shadow-primary/25 font-semibold rounded-xl"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Sending Reset Link...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Send Password Reset Link
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </form>
          )}

          <div className="mt-6 text-center text-sm text-muted-foreground border-t border-border/40 pt-4">
            Remember your password?{" "}
            <Link href="/login" className="text-primary font-medium hover:underline">
              Back to Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
