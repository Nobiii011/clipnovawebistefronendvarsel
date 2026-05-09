// AdminLayout — shell for all admin panel pages.
// Visually distinct from CreatorLayout (dark sidebar, different color scheme).
// Admin pages are rendered via <Outlet />.

import { useState } from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "../../Components/admin/AdminSidebar";
import AdminTopbar from "../../Components/admin/AdminTopbar";

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full bg-neutral-950">
      <AdminSidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopbar setIsOpen={setIsSidebarOpen} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
