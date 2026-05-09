// StatCard — reusable stat display card.
// Migrated from src/Components/StatCard.jsx.
// Used on Dashboard, Payments, and Admin analytics pages.

export default function StatCard({ icon, title, value, subtitle, gradient }) {
  const bg = gradient || "from-indigo-800 via-rose-700 to-amber-500";

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-r ${bg} p-6 shadow-lg`}>
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative z-10 flex flex-col items-center text-center gap-2">
        <div className="text-4xl">{icon}</div>
        <h2 className="text-3xl font-bold">{value}</h2>
        <p className="text-lg font-medium">{title}</p>
        {subtitle && <span className="text-sm text-white/70">{subtitle}</span>}
      </div>
    </div>
  );
}
