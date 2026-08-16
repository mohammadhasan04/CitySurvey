"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { getInitials } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useI18n } from "@/i18n/config";

export function DashboardTopbar() {
  const { data: session } = useSession();
  const { t } = useI18n();
  const user = session?.user;
  const role = user?.role;
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!session?.user?.id) return;
    let isMounted = true;

    const fetchNotifications = () => {
      fetch("/api/notifications")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && isMounted) {
            setUnreadCount(data.unreadCount || 0);
          }
        })
        .catch(console.error);
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [session]);

  const roleLabelMap: Record<string, string> = {
    SUPER_ADMIN: t("Super Admin"),
    CITY_ADMIN: t("City Admin"),
    RESIDENT: t("Resident"),
    PUBLIC: "Public",
  };

  const profileHref =
    role === "SUPER_ADMIN"
      ? "/super-admin/profile"
      : role === "CITY_ADMIN"
        ? "/admin/profile"
        : "/resident/profile";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/40 bg-background/80 backdrop-blur-lg px-4 sm:px-6">
      {/* Search */}
      <div className="relative hidden sm:block w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder={`${t("common.search")}...`}
          className="pl-9 h-9 bg-muted/50 border-transparent focus:border-primary/30 focus:bg-background transition-all"
        />
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-1.5 ml-auto">
        <LanguageSwitcher />
        <ThemeToggle />

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-full hover:bg-primary/10"
          asChild
        >
          <Link
            href={
              role === "RESIDENT"
                ? "/resident/notifications"
                : "/admin/notifications"
            }
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white animate-pulse-glow">
                {unreadCount}
              </span>
            )}
          </Link>
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex items-center gap-2 h-auto py-1.5 px-2 rounded-full hover:bg-muted/80"
            >
              <Avatar className="h-8 w-8 border-2 border-primary/20">
                {user?.image && <AvatarImage src={user.image} alt={user.name || "Avatar"} />}
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                  {user?.name ? getInitials(user.name) : "U"}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium leading-tight">
                  {user?.name || "User"}
                </p>
                <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 font-medium">
                  {roleLabelMap[role || "PUBLIC"]}
                </Badge>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={profileHref}>{t("Profile")}</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                href={
                  role === "RESIDENT"
                    ? "/resident/notifications"
                    : "/admin/notifications"
                }
              >
                {t("Notifications")}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-red-500 focus:text-red-500"
            >
              {t("auth.logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
