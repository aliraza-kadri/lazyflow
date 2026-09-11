import type { Metadata } from "next";
import AdminSidebar from "@/components/admin/sidebar";

export const metadata: Metadata = {
  title: "Admin Dashboard — LazyFlow",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-lf-surface">
      <div className="hidden md:block">
        <AdminSidebar />
      </div>
      <div className="flex min-h-screen flex-1 flex-col">{children}</div>
    </div>
  );
}
