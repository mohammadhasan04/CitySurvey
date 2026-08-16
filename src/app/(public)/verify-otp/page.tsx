"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ShieldCheck, ArrowRight, RotateCw, KeyRound, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const type = searchParams.get("type") || "signup";
  const urlOtp = searchParams.get("otp") || "";

  const [otp, setOtp] = useState<string[]>(() => {
    if (urlOtp && urlOtp.length === 6) {
      return urlOtp.split("");
    }
    return Array(6).fill("");
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split("");
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      toast.error("Please enter the complete 6-digit verification code");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpCode, type }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "OTP verification failed");
      } else {
        toast.success(data.message);
        router.push(data.redirect || "/login");
      }
    } catch {
      toast.error("Something went wrong during verification");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0 || isResending) return;
    setIsResending(true);
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, type }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to resend OTP");
      } else {
        toast.success("A new 6-digit OTP code has been sent to your email.");
        setResendTimer(60);
        setOtp(Array(6).fill(""));
        inputRefs.current[0]?.focus();
      }
    } catch {
      toast.error("Failed to resend OTP code");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Card className="relative w-full max-w-md shadow-2xl shadow-black/20 border-border/30 animate-scale-in my-8">
      <CardHeader className="text-center pb-2">
        <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-2xl gradient-primary shadow-lg shadow-primary/25 mb-4">
          <ShieldCheck className="h-7 w-7 text-white" />
        </div>
        <h1 className="text-2xl font-bold font-heading">
          {type === "recovery" ? "Verify Reset OTP" : "Verify Email Address"}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Enter the 6-digit code sent to <br />
          <span className="font-semibold text-foreground">{email || "your email address"}</span>
        </p>
      </CardHeader>

      <CardContent className="pt-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-between items-center gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="w-12 h-14 text-center text-xl font-bold rounded-xl border border-input bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm"
              />
            ))}
          </div>

          <Button
            type="submit"
            disabled={isLoading || otp.join("").length !== 6}
            className="w-full h-11 gradient-primary border-0 text-white shadow-md shadow-primary/25 font-semibold rounded-xl"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Verifying Code...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Verify OTP Code
                <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </Button>
        </form>

        <div className="mt-6 flex items-center justify-between text-xs text-muted-foreground border-t border-border/40 pt-4">
          <span>Didn&apos;t receive the code?</span>
          <button
            type="button"
            onClick={handleResend}
            disabled={resendTimer > 0 || isResending}
            className="text-primary font-semibold hover:underline flex items-center gap-1 disabled:opacity-50"
          >
            <RotateCw className={`h-3 w-3 ${isResending ? "animate-spin" : ""}`} />
            {resendTimer > 0 ? `Resend code in ${resendTimer}s` : "Resend OTP"}
          </button>
        </div>

        <div className="mt-4 text-center text-xs">
          <Link href="/login" className="text-muted-foreground hover:text-foreground">
            Back to Sign In
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default function VerifyOtpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center gradient-hero p-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,oklch(0.555_0.195_250/15%),transparent_60%)]" />
      <Suspense fallback={<div className="text-white">Loading verification...</div>}>
        <VerifyOtpContent />
      </Suspense>
    </div>
  );
}
