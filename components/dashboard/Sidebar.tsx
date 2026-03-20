"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "./LogoutButton";

type NavItem = {
  href: string;
  label: string;
};

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Pipeline" },
  { href: "/leads", label: "Leads" },
  { href: "/concepts", label: "Concepts" },
  { href: "/outreach", label: "Outreach" },
];

export default function Sidebar({ userEmail }: { userEmail: string | null }) {
  const pathname = usePathname();

  return (
    <aside className="w-[280px] px-5 py-6 bg-white/45 backdrop-blur-[24px] border-r border-white/70">
      <div className="flex flex-col gap-6">
        <div>
          <div className="text-[18px] font-semibold text-black/90">MINIM</div>
          <div className="mt-1 text-xs text-black/50 truncate">
            {userEmail ?? "Operator"}
          </div>
        </div>

        <nav className="flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive =
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname?.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "px-3 py-2 text-sm border border-transparent transition-colors",
                  isActive
                    ? "bg-white/72 text-[#3B82F6] border-white/80"
                    : "text-black/70 hover:bg-white/55 hover:border-white/65",
                ].join(" ")}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto">
          <LogoutButton />
        </div>
      </div>
    </aside>
  );
}

