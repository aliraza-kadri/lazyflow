import type { Metadata } from "next";
import { headers } from "next/headers";
import AdminSidebar from "@/components/admin/sidebar";

export const metadata: Metadata = {
  title: "Admin Dashboard — LazyFlow",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const headerList = await headers();
  const pathname = headerList.get("x-pathname") || "";

  // For Login and Forgot Password pages, do not show the dashboard sidebar
  if (pathname === "/admin/login" || pathname === "/admin/forgot-password") {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-lf-surface">
      <div className="hidden md:block">
        <AdminSidebar />
      </div>
      <div className="flex min-h-screen flex-1 flex-col">{children}</div>
    </div>
  );
}
