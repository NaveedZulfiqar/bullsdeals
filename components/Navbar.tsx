"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Home,
  Users,
  TrendingUp,
  Calculator,
  Folder,
  Mail,
  Banknote,
  ChevronDown,
  Settings,
  User,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const mastersDropdownItems = [
  { name: "Agents", href: "/dashboard/agents" },
  { name: "Other Brokerages", href: "/dashboard/other-brokerages" },
  { name: "Solicitors", href: "/dashboard/solicitors" },
  { name: "Category", href: "/dashboard/category" },
];

const navItems = [
  { name: "Home", icon: Home, hasDropdown: false, href: "/dashboard" },
  { name: "Masters", icon: Users, hasDropdown: true, href: "#" },
  { name: "Trades", icon: TrendingUp, hasDropdown: false, href: "/dashboard/trades" },
  { name: "Accounting", icon: Calculator, hasDropdown: true, href: "#" },
  { name: "Reports", icon: Folder, hasDropdown: true, href: "#" },
  { name: "Contact Support", icon: Mail, hasDropdown: false, href: "#" },
  { name: "Payroll", icon: Banknote, hasDropdown: true, href: "#" },
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            setCurrentUser(data.user);
          } else {
            router.push("/login");
          }
        } else {
          router.push("/login");
        }
      } catch (err) {
        console.error("Error verifying authentication session:", err);
        router.push("/login");
      }
    };
    checkUser();
  }, [router]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        window.location.href = "/login";
      }
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const getActiveTab = () => {
    if (pathname === "/dashboard") return "Home";
    if (pathname.startsWith("/dashboard/agents") || pathname.startsWith("/dashboard/other-brokerages") || pathname.startsWith("/dashboard/solicitors") || pathname.startsWith("/dashboard/category")) return "Masters";
    if (pathname.startsWith("/dashboard/trades")) return "Trades";
    return "Home";
  };

  const activeTab = getActiveTab();

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm h-16 flex items-center justify-between px-4 sm:px-6 w-full">
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="font-bold text-base sm:text-lg tracking-wide text-[#2C2C2C] uppercase whitespace-nowrap">
            BULLS <span className="text-[#FD7E14]">DEALS</span>
          </span>
        </div>

        {/* Middle: Desktop Nav Links */}
        <div className="hidden xl:flex items-center gap-0.5 flex-1 justify-center px-4" ref={dropdownRef}>
          {navItems.map((item) => (
            <div key={item.name} className="relative">
              <button
                onClick={() => {
                  if (item.name === "Masters") {
                    setOpenDropdown(openDropdown === "Masters" ? null : "Masters");
                  } else if (!item.hasDropdown && item.href !== "#") {
                    router.push(item.href);
                    setOpenDropdown(null);
                  }
                }}
                className={`flex items-center gap-1 px-2.5 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === item.name
                    ? "text-[#FD7E14] bg-orange-50 border-b-2 border-[#FD7E14] rounded-b-none"
                    : "text-gray-500 hover:text-[#FD7E14] hover:bg-orange-50"
                }`}
              >
                <item.icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.name}</span>
                {item.hasDropdown && <ChevronDown className="w-3 h-3 opacity-60" />}
              </button>

              {/* Masters Dropdown */}
              {item.name === "Masters" && openDropdown === "Masters" && (
                <div className="absolute left-0 top-full mt-1 w-52 bg-white border border-gray-200 rounded-lg shadow-lg py-1.5 z-50">
                  {mastersDropdownItems.map((dropItem) => (
                    <button
                      key={dropItem.name}
                      onClick={() => {
                        router.push(dropItem.href);
                        setOpenDropdown(null);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
                        pathname.startsWith(dropItem.href)
                          ? "text-[#FD7E14] bg-orange-50 border-l-3 border-[#FD7E14]"
                          : "text-gray-700 hover:text-[#FD7E14] hover:bg-orange-50"
                      }`}
                    >
                      {dropItem.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Right: User Profile + Settings + Mobile Menu */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Profile Capsule */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 bg-[#FAF8F5] hover:bg-[#F0EDE8] border border-gray-200 rounded-full py-1.5 pl-2 pr-3 transition-all cursor-pointer"
            >
              <div className="w-7 h-7 rounded-full bg-[#E8DFD3] flex items-center justify-center text-gray-500">
                <User className="w-4 h-4" />
              </div>
              <div className="hidden sm:flex flex-col justify-center">
                <span className="text-xs font-bold text-[#2C2C2C] leading-tight">
                  {currentUser?.name || "Sid"}
                </span>
                <span className="text-[9px] text-gray-400 font-semibold uppercase tracking-wider">
                  Save Max Bulls Realty
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-xl shadow-lg py-1.5 z-50">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="text-xs text-gray-400 font-medium">Logged in as</p>
                  <p className="text-sm font-semibold text-[#2C2C2C] truncate">
                    {currentUser?.email || "admin@bullsdeal.com"}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 font-medium transition-colors text-left cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>

          {/* Settings Button */}
          <button className="hidden sm:flex w-9 h-9 rounded-xl bg-white border border-gray-200 items-center justify-center text-gray-500 hover:text-[#FD7E14] hover:border-[#FD7E14] transition-all shadow-sm cursor-pointer">
            <Settings className="w-4 h-4" />
          </button>

          {/* Mobile Menu Toggle */}
          <button
            className="xl:hidden w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:text-[#FD7E14] transition-all shadow-sm cursor-pointer"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </nav>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="xl:hidden fixed inset-0 z-40 top-16">
          <div className="absolute inset-0 bg-black/30" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="absolute top-0 left-0 w-72 max-w-full h-full bg-white shadow-xl flex flex-col py-4">
            {navItems.map((item) => (
              <div key={item.name}>
                <button
                  onClick={() => {
                    if (item.name === "Masters") {
                      setOpenDropdown(openDropdown === "Masters-mobile" ? null : "Masters-mobile");
                    } else if (!item.hasDropdown && item.href !== "#") {
                      router.push(item.href);
                      setIsMobileMenuOpen(false);
                    }
                  }}
                  className={`flex items-center gap-3 px-5 py-3 text-sm font-medium transition-colors cursor-pointer w-full ${
                    activeTab === item.name
                      ? "text-[#FD7E14] bg-orange-50 border-l-4 border-[#FD7E14]"
                      : "text-gray-600 hover:text-[#FD7E14] hover:bg-orange-50 border-l-4 border-transparent"
                  }`}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span>{item.name}</span>
                  {item.hasDropdown && <ChevronDown className="w-3.5 h-3.5 opacity-60 ml-auto" />}
                </button>

                {/* Mobile Masters submenu */}
                {item.name === "Masters" && openDropdown === "Masters-mobile" && (
                  <div className="bg-gray-50 pl-12">
                    {mastersDropdownItems.map((dropItem) => (
                      <button
                        key={dropItem.name}
                        onClick={() => {
                          router.push(dropItem.href);
                          setIsMobileMenuOpen(false);
                          setOpenDropdown(null);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
                          pathname.startsWith(dropItem.href)
                            ? "text-[#FD7E14]"
                            : "text-gray-600 hover:text-[#FD7E14]"
                        }`}
                      >
                        {dropItem.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
