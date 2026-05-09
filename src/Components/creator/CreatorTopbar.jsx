// CreatorTopbar — migrated from src/Components/Topbar.jsx.
// Receives setIsOpen via props from CreatorLayout outlet context.
// Visual design preserved.

import { BarChart2, Menu } from "lucide-react";

export default function CreatorTopbar({ setIsOpen, title = "Dashboard Overview" }) {
  return (
    <div className="flex items-center gap-4 mb-8">
      <button className="lg:hidden" onClick={() => setIsOpen(true)}>
        <Menu />
      </button>
      <BarChart2 className="text-green-400" />
      <h1 className="text-xl sm:text-2xl font-semibold">{title}</h1>
    </div>
  );
}
