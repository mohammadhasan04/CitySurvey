"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Lock, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      toast.error("Please fill in both password fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, newPassword, confirmPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Password reset failed");
      } else {
        toast.success(data.message || "Password updated successfully!");
        router.push("/login");
      }
    } catch {
      toast.error("Something went wrong during password reset");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="relative w-full max-w-md shadow-2xl shadow-black/20 border-border/30 animate-scale-in my-8">
      <CardHeader className="text-center pb-2">
        <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-2xl gradient-primary shadow-lg shadow-primary/25 mb-4">
          <Lock className="h-7 w-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold font-heading">
          Reset Password
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Set a new strong password for <br />
          <span className="font-semibold text-foreground">{email}</span>
        </p>
      </CardHeader>

      <CardContent className="pt-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <div className="relative">
              <Input
                id="new-password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter new strong password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input
              id="confirm-password"
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 gradient-primary border-0 text-white shadow-md shadow-primary/25 font-semibold rounded-xl"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Updating Password...
              </span>
            ) : (
              "Save New Password"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-muted-foreground border-t border-border/40 pt-4">
          <Link href="/login" className="text-primary font-medium hover:underline">
            Back to Sign In
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center gradient-hero p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,oklch(0.555_0.195_250/15%),transparent_60%)]" />
      <Suspense fallback={<div className="text-white">Loading password reset...</div>}>
        <ResetPasswordContent />
      </Suspense>
    </div>
  );
}
