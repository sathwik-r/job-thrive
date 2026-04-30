import React from "react";
import { useLocation } from "wouter";
import { Home, Search, Briefcase, MessageSquare, User, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import Logo from "./logo";
import RoleToggle from "./role-toggle";
import { useAuth } from "@/hooks/use-auth";

interface AppLayoutProps {
  children: React.ReactNode;
  currentRole?: "seeker" | "referrer";
  onRoleChange?: (role: "seeker" | "referrer") => void;
}

const navItems = [
  { path: "/dashboard", label: "Home", icon: Home },
  { path: "/job-search", label: "Jobs", icon: Search },
  { path: "/coaching", label: "Coaching", icon: MessageSquare },
  { path: "/profile", label: "Profile", icon: User },
];

export default function AppLayout({ children, currentRole, onRoleChange }: AppLayoutProps) {
  const [location, setLocation] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();

  const isActive = (path: string) => {
    if (path === "/dashboard") return location === "/dashboard" || location === "/";
    return location.startsWith(path);
  };

  return (
    <div className="min-h-screen flex" style={{ background: "#0C0C0C" }}>
      {/* ── Desktop Sidebar ──────────────────── */}
      <aside
        className={`hidden md:flex flex-col shrink-0 sticky top-0 h-screen transition-all duration-200 ${
          collapsed ? "w-16" : "w-56"
        }`}
        style={{ background: "#141414", borderRight: "1px solid #1F1F1F" }}
      >
        {/* Logo */}
        <div className="p-4 flex items-center justify-between">
          <Logo size={collapsed ? 24 : 28} showText={!collapsed} />
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded-md hover:bg-[#1C1C1C] text-[#525252] hover:text-[#A3A3A3] transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-2 space-y-0.5">
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => setLocation(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? "bg-[#A3E635]/10 text-[#A3E635]"
                    : "text-[#525252] hover:text-[#A3A3A3] hover:bg-[#1C1C1C]"
                } ${collapsed ? "justify-center" : ""}`}
              >
                <item.icon className={`w-4.5 h-4.5 shrink-0 ${active ? "text-[#A3E635]" : ""}`} />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Role toggle at bottom */}
        {currentRole && onRoleChange && (
          <div className="p-3 border-t" style={{ borderColor: "#1F1F1F" }}>
            {collapsed ? (
              <button
                onClick={() => onRoleChange(currentRole === "seeker" ? "referrer" : "seeker")}
                className="w-full flex justify-center p-2 rounded-lg text-xs font-bold"
                style={{ background: "#1C1C1C", color: "#A3E635" }}
              >
                {currentRole === "seeker" ? "S" : "R"}
              </button>
            ) : (
              <RoleToggle currentRole={currentRole} onRoleChange={onRoleChange} />
            )}
          </div>
        )}

        {/* User */}
        <div className="p-3 border-t" style={{ borderColor: "#1F1F1F" }}>
          <button
            onClick={() => setLocation("/profile")}
            className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-[#1C1C1C] transition-colors ${collapsed ? "justify-center" : ""}`}
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
              style={{ background: "#A3E635", color: "#0C0C0C" }}>
              {user?.name?.charAt(0) || "U"}
            </div>
            {!collapsed && (
              <div className="text-left truncate">
                <p className="text-sm font-medium text-[#F5F5F5] truncate">{user?.name || "User"}</p>
                <p className="text-[10px] text-[#525252] truncate">{user?.email || ""}</p>
              </div>
            )}
          </button>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────── */}
      <main className="flex-1 min-w-0 flex flex-col">
        {/* Mobile header */}
        <header
          className="md:hidden flex items-center justify-between px-4 py-3 sticky top-0 z-30"
          style={{ background: "rgba(12,12,12,0.92)", backdropFilter: "blur(20px)", borderBottom: "1px solid #1F1F1F" }}
        >
          <Logo size={24} showText={true} />
          {currentRole && onRoleChange && (
            <RoleToggle currentRole={currentRole} onRoleChange={onRoleChange} />
          )}
          <button onClick={() => setLocation("/profile")} className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ background: "#A3E635", color: "#0C0C0C" }}>
            {user?.name?.charAt(0) || "U"}
          </button>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>

        {/* Mobile bottom nav */}
        <nav
          className="md:hidden flex items-center justify-around py-2 px-4 sticky bottom-0 z-30"
          style={{ background: "rgba(12,12,12,0.95)", backdropFilter: "blur(20px)", borderTop: "1px solid #1F1F1F" }}
        >
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => setLocation(item.path)}
                className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition-colors ${
                  active ? "text-[#A3E635]" : "text-[#3F3F3F]"
                }`}
              >
                {active && <div className="w-1 h-1 rounded-full bg-[#A3E635] mb-0.5" />}
                <item.icon className="w-5 h-5" />
                <span className="text-[9px] font-semibold">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </main>
    </div>
  );
}
