'use client';

import React from 'react';
import Link from 'next/link';
import {
  Building2,
  ShieldCheck,
  KeyRound,
  Users,
  Briefcase,
  Network,
  UserCheck,
  BadgeCheck,
  MapPin,
  Sliders,
  LayoutDashboard,
  Sparkles,
  Bot,
  FileCheck,
  Rocket,
  Check,
  ArrowRight,
  Calendar,
} from 'lucide-react';
import { FeatureCardData } from '@/lib/heroSteps';

const ICON_MAP: Record<string, React.ElementType> = {
  Building2,
  ShieldCheck,
  KeyRound,
  Users,
  Briefcase,
  Network,
  UserCheck,
  BadgeCheck,
  MapPin,
  Sliders,
  LayoutDashboard,
  Sparkles,
  Bot,
  FileCheck,
  Rocket,
};

interface FeatureCardProps {
  card: FeatureCardData;
  isHeroStatement?: boolean;
}

export function FeatureCard({ card, isHeroStatement = false }: FeatureCardProps) {
  const IconComponent = ICON_MAP[card.iconName] || Sparkles;

  if (isHeroStatement) {
    return (
      <div className="w-full max-w-[340px] sm:max-w-[400px] text-left relative p-5 sm:p-6 rounded-2xl bg-white/45 backdrop-blur-[3px] border border-white/70 shadow-[0_10px_30px_rgba(15,23,42,0.06)] group">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-indigo-600/10 border border-indigo-300/50 text-indigo-700 text-[11px] font-bold uppercase tracking-wider mb-2.5 shadow-xs">
          <IconComponent className="w-3.5 h-3.5 text-indigo-600" />
          <span>{card.eyebrow}</span>
        </div>

        {/* Hero Headline */}
        <h1 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight leading-snug mb-2 font-headline drop-shadow-xs">
          {card.headline}
        </h1>

        {/* Subline Description */}
        {card.desc && (
          <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed mb-3">
            {card.desc}
          </p>
        )}

        {/* Bullets */}
        {card.bullets && card.bullets.length > 0 && (
          <ul className="space-y-1.5 mb-4 pt-1.5 border-t border-slate-200/60">
            {card.bullets.map((bullet, idx) => (
              <li
                key={idx}
                className="flex items-center gap-2 text-xs font-semibold text-slate-800"
              >
                <div className="w-3.5 h-3.5 rounded-full bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                  <Check className="w-2 h-2 stroke-[3]" />
                </div>
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        )}

        {/* CTAs */}
        {card.cta && (
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
            {card.cta.primary && (
              <Link
                href={card.cta.primary.href}
                className="px-4 py-2 rounded-full text-xs font-bold text-white bg-gradient-to-r from-indigo-600 via-sky-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 shadow-md shadow-indigo-500/20 hover:shadow-cyan-500/30 flex items-center gap-1.5 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>{card.cta.primary.text}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
            {card.cta.secondary && (
              <Link
                href={card.cta.secondary.href}
                className="px-4 py-2 rounded-full text-xs font-semibold text-slate-800 bg-white/85 hover:bg-white border border-slate-300/80 shadow-xs transition-all flex items-center gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                <span>{card.cta.secondary.text}</span>
              </Link>
            )}
          </div>
        )}

        {/* Subnote */}
        {card.subnote && (
          <p className="text-[10px] font-medium text-slate-500 pt-2 border-t border-slate-200/60">
            {card.subnote}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="w-full max-w-[340px] sm:max-w-[370px] text-left relative transition-all duration-300 p-5 sm:p-6 rounded-2xl bg-white/35 sm:bg-white/40 backdrop-blur-[3px] border border-white/70 shadow-[0_10px_30px_rgba(15,23,42,0.05)] hover:bg-white/50 group">
      {/* Header: Icon + Eyebrow */}
      <div className="flex items-center gap-2.5 mb-2.5">
        <div className="w-7 h-7 rounded-lg bg-indigo-600/10 border border-indigo-200 text-indigo-700 flex items-center justify-center flex-shrink-0 shadow-sm">
          <IconComponent className="w-4 h-4 text-indigo-600" />
        </div>
        <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-700 font-headline">
          {card.eyebrow}
        </span>
      </div>

      {/* Headline */}
      <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight leading-snug mb-2 font-headline drop-shadow-sm">
        {card.headline}
      </h2>

      {/* Description */}
      {card.desc && (
        <p className="text-xs sm:text-sm font-medium text-slate-700 leading-relaxed mb-3">
          {card.desc}
        </p>
      )}

      {/* Bullets */}
      {card.bullets && card.bullets.length > 0 && (
        <ul className="space-y-1.5 pt-2 border-t border-slate-300/40">
          {card.bullets.map((bullet, idx) => (
            <li
              key={idx}
              className="flex items-start gap-2 text-xs font-semibold text-slate-800 leading-tight"
            >
              <div className="w-3.5 h-3.5 rounded-full bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                <Check className="w-2 h-2 stroke-[3]" />
              </div>
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
