'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown, Shield, Building, Sparkles } from 'lucide-react';

interface HeroHeaderProps {
  className?: string;
}

export function HeroHeader({ className = '' }: HeroHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const platformLoginUrl =
    process.env.NEXT_PUBLIC_PLATFORM_LOGIN_URL || '/platform/login';
  const companyLoginUrl =
    process.env.NEXT_PUBLIC_COMPANY_LOGIN_URL || '/login';

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setMobileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 px-4 sm:px-8 py-4 sm:py-6 flex items-center justify-between pointer-events-none ${className}`}
    >
      {/* Brand Block */}
      <div className="flex items-center gap-3 pointer-events-auto">
        <div className="relative group cursor-pointer">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white/80 border border-slate-200/80 backdrop-blur-md flex items-center justify-center p-2 shadow-lg shadow-slate-200/60 group-hover:border-indigo-500/40 transition-colors">
            {/* Stylized Compass / Paper Plane in Indigo-to-Cyan Gradient */}
            <svg
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full transform group-hover:scale-110 transition-transform duration-300"
            >
              <defs>
                <linearGradient
                  id="opspilot-gradient-light"
                  x1="2"
                  y1="2"
                  x2="30"
                  y2="30"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="#4F46E5" />
                  <stop offset="0.5" stopColor="#0284C7" />
                  <stop offset="1" stopColor="#06B6D4" />
                </linearGradient>
              </defs>
              <path
                d="M28 4L4 15.5L14 18L16.5 28L28 4Z"
                fill="url(#opspilot-gradient-light)"
                opacity="0.95"
              />
              <path
                d="M28 4L14 18"
                stroke="#FFFFFF"
                strokeWidth="1.5"
                strokeLinecap="round"
                opacity="0.8"
              />
            </svg>
          </div>
        </div>

        <div className="flex flex-col">
          <span className="text-lg sm:text-xl font-black tracking-tight text-slate-900 flex items-center gap-1.5 font-headline">
            OpsPilot
            <span className="inline-block w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
          </span>
          <span className="text-[11px] sm:text-xs text-slate-600 font-semibold tracking-wide">
            Business CRM Solution
          </span>
        </div>
      </div>

      {/* Desktop Login Pill */}
      <div className="hidden md:flex items-center gap-2 p-1.5 rounded-full bg-white/80 backdrop-blur-xl border border-slate-200/80 shadow-lg shadow-slate-200/50 pointer-events-auto">
        <Link
          href={platformLoginUrl}
          className="px-4 py-2 rounded-full text-xs font-bold text-slate-700 hover:text-slate-950 hover:bg-slate-100 transition-all flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-400/50"
        >
          <Shield className="w-3.5 h-3.5 text-indigo-600" />
          Admin Login
        </Link>
        <Link
          href={companyLoginUrl}
          className="px-5 py-2 rounded-full text-xs font-bold text-white bg-gradient-to-r from-indigo-600 via-sky-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 shadow-md shadow-indigo-500/20 hover:shadow-cyan-500/30 transition-all flex items-center gap-1.5 transform hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-cyan-400/60"
        >
          <Building className="w-3.5 h-3.5 text-white" />
          Company Login
        </Link>
      </div>

      {/* Mobile Login Dropdown */}
      <div
        className="relative md:hidden pointer-events-auto"
        ref={dropdownRef}
      >
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-expanded={mobileMenuOpen}
          aria-label="Toggle login menu"
          className="px-4 py-2 rounded-full bg-white/85 backdrop-blur-lg border border-slate-200/80 text-xs font-bold text-slate-800 flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          Login
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-200 ${
              mobileMenuOpen ? 'rotate-180 text-indigo-600' : 'text-slate-500'
            }`}
          />
        </button>

        {mobileMenuOpen && (
          <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white/95 backdrop-blur-2xl border border-slate-200/90 p-2 shadow-2xl shadow-slate-300/60 flex flex-col gap-1 animate-in fade-in zoom-in-95 duration-150">
            <Link
              href={companyLoginUrl}
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-200/60 hover:border-indigo-300 text-xs font-bold text-slate-900 flex items-center gap-2.5 transition-all"
            >
              <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                <Building className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold">Company Login</span>
                <span className="text-[10px] text-slate-500">Tenant Workspace</span>
              </div>
            </Link>

            <Link
              href={platformLoginUrl}
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-xl hover:bg-slate-100 text-xs font-semibold text-slate-700 hover:text-slate-950 flex items-center gap-2.5 transition-all"
            >
              <div className="w-6 h-6 rounded-lg bg-slate-100 text-indigo-600 flex items-center justify-center">
                <Shield className="w-3.5 h-3.5" />
              </div>
              <div className="flex flex-col">
                <span>Admin Login</span>
                <span className="text-[10px] text-slate-500">Platform Portal</span>
              </div>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
