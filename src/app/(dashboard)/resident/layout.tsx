import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default function ResidentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
