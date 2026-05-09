import { AdminNavbar } from "@/components/AdminNavbar";
import { AdminSidebar } from "@/components/AdminSidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-surface-container-low md:pl-64">
      {/*
        Fixed sidebar does not consume flex width — pl-60 reserves space so the main
        column matches the viewport (avoids horizontal overflow).
      */}
      <AdminSidebar />
      <div className="flex min-h-screen min-w-0 flex-col">
        <AdminNavbar />
        <main className="flex-1 px-4 py-6 md:px-8 md:py-10">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
