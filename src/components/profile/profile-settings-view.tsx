"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, useRef } from "react";
import { PageHeader, SectionCard, LoadingSkeleton } from "@/components/shared/page-components";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserCircle, Mail, Phone, Lock, Save, Upload, Trash2, Check, Shield, Lock as LockIcon } from "lucide-react";
import { toast } from "sonner";
import { getInitials } from "@/lib/utils";
import { useI18n } from "@/i18n/config";

const AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=250",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=250",
];

export function ProfileSettingsView() {
  const { data: session, update: updateSession } = useSession();
  const { t } = useI18n();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [isSubmittingInfo, setIsSubmittingInfo] = useState(false);
  const [isSubmittingPass, setIsSubmittingPass] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Info State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [image, setImage] = useState("");
  const [role, setRole] = useState("");

  // Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users/profile");
      const data = await res.json();
      if (data.success && data.data) {
        setName(data.data.name || "");
        setEmail(data.data.email || "");
        setPhone(data.data.phone || "");
        setImage(data.data.image || "");
        setRole(data.data.role || "RESIDENT");
      }
    } catch (err) {
      console.error("Failed to load profile", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be under 5MB.");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/users/avatar", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to upload profile picture");

      setImage(data.avatarUrl);
      toast.success("Private profile picture uploaded!");
      await updateSession({ user: { ...session?.user, image: data.avatarUrl } });
    } catch (err: any) {
      toast.error(err.message || "Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    try {
      const res = await fetch("/api/users/avatar", { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to remove avatar");

      setImage("");
      toast.success("Profile picture removed");
      await updateSession({ user: { ...session?.user, image: "" } });
    } catch (err: any) {
      toast.error(err.message || "Failed to remove avatar");
    }
  };

  const handleUpdateInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingInfo(true);
    try {
      const res = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, image }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update profile");

      toast.success("Profile details updated successfully!");
      await updateSession({
        user: { ...session?.user, name, email, image },
      });
      fetchProfile();
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setIsSubmittingInfo(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error("Current password and new password are required");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }

    setIsSubmittingPass(true);
    try {
      const res = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to change password");

      toast.success("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err.message || "Failed to change password");
    } finally {
      setIsSubmittingPass(false);
    }
  };

  if (loading) {
    return (
      <div>
        <PageHeader title={t("Profile")} description="" />
        <LoadingSkeleton count={3} />
      </div>
    );
  }

  const roleLabelMap: Record<string, string> = {
    SUPER_ADMIN: t("Super Admin"),
    CITY_ADMIN: t("City Admin"),
    RESIDENT: t("Resident"),
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("Profile")}
        description={t("Manage your personal details, private profile picture, and password")}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card & Avatar Selector */}
        <Card className="animate-fade-in lg:col-span-1 border-primary/20 shadow-md">
          <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
            <div className="relative group">
              {image ? (
                <img
                  src={image}
                  alt={name}
                  className="h-24 w-24 rounded-full object-cover border-4 border-primary/20 shadow-lg"
                />
              ) : (
                <div className="h-24 w-24 rounded-full gradient-primary flex items-center justify-center shadow-lg shadow-primary/25 text-white font-bold text-2xl">
                  {getInitials(name || "User")}
                </div>
              )}
            </div>

            <div>
              <h2 className="text-xl font-bold font-heading">{name || "User"}</h2>
              <p className="text-xs text-muted-foreground">{email}</p>
              <Badge className="mt-2" variant="secondary">
                <Shield className="h-3 w-3 mr-1 text-primary" />
                {roleLabelMap[role] || role}
              </Badge>
            </div>

            {/* Privacy Guarantee Note */}
            <div className="w-full p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-left text-xs text-emerald-700 dark:text-emerald-300 flex items-start gap-2">
              <LockIcon className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
              <span>
                {t("100% Private Profile Picture: Only you can view your uploaded picture when logged in. Other users will only see default initials.")}
              </span>
            </div>

            {/* File Upload Button */}
            <div className="w-full pt-2 space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="w-full gradient-primary border-0 text-white gap-2"
              >
                <Upload className="h-4 w-4" />
                {isUploading ? t("common.loading") : t("Upload Private Picture")}
              </Button>
              {image && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleRemoveAvatar}
                  className="w-full text-xs text-destructive hover:bg-destructive/10 gap-1.5"
                >
                  <Trash2 className="h-3.5 w-3.5" /> {t("common.delete")}
                </Button>
              )}
            </div>

            {/* Avatar Selector Presets */}
            <div className="w-full pt-4 border-t border-border/40 text-left">
              <Label className="text-xs font-semibold text-muted-foreground block mb-2">
                {t("Or Choose Preset Avatar")}
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {AVATAR_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setImage(preset)}
                    className={`relative rounded-xl overflow-hidden h-14 border-2 transition-all ${
                      image === preset ? "border-primary ring-2 ring-primary/30 scale-105" : "border-transparent opacity-75 hover:opacity-100"
                    }`}
                  >
                    <img src={preset} alt="avatar" className="h-full w-full object-cover" />
                    {image === preset && (
                      <div className="absolute inset-0 bg-primary/40 flex items-center justify-center">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Information & Security Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Form 1: Personal Details */}
          <SectionCard title={t("Personal Information")}>
            <form onSubmit={handleUpdateInfo} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prof-name">{t("common.name")}</Label>
                  <div className="relative">
                    <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="prof-name"
                      className="pl-9"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prof-email">{t("common.email")}</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="prof-email"
                      type="email"
                      className="pl-9"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prof-phone">{t("common.phone")}</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="prof-phone"
                      className="pl-9"
                      placeholder="+91 XXXXX XXXXX"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prof-img">{t("Avatar Picture URL (Optional)")}</Label>
                  <Input
                    id="prof-img"
                    placeholder="https://..."
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmittingInfo}
                className="gradient-primary border-0 text-white shadow-md shadow-primary/25 gap-1.5"
              >
                <Save className="h-4 w-4" />
                {isSubmittingInfo ? t("common.loading") : t("Save Profile Details")}
              </Button>
            </form>
          </SectionCard>

          {/* Form 2: Password Change */}
          <SectionCard title={t("Change Account Password")}>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="curr-pass">{t("Current Password")}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="curr-pass"
                    type="password"
                    className="pl-9"
                    placeholder="••••••••"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="new-pass">{t("New Password")}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="new-pass"
                      type="password"
                      className="pl-9"
                      placeholder={t("Min 8 chars (mix of uppercase, lowercase, number, symbol)")}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="conf-pass">{t("Confirm New Password")}</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="conf-pass"
                      type="password"
                      className="pl-9"
                      placeholder={t("Re-enter new password")}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmittingPass}
                className="gradient-primary border-0 text-white shadow-md shadow-primary/25 gap-1.5"
              >
                <Lock className="h-4 w-4" />
                {isSubmittingPass ? t("common.loading") : t("Update Password")}
              </Button>
            </form>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
