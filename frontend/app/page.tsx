import React from 'react';
import { Inter, Space_Grotesk } from 'next/font/google';
import { ScrollHero } from '@/components/hero/ScrollHero';
import { ContactSection } from '@/components/hero/ContactSection';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

export const metadata = {
  title: 'OpsPilot | Next-Gen Multi-Tenant Business CRM & Operations',
  description:
    'Experience intelligent human resource and business operations. Run hundreds of companies side by side with zero data leakage.',
};

export default function MarketingLandingPage() {
  return (
    <main
      className={`${inter.variable} ${spaceGrotesk.variable} min-h-screen bg-[#0A0F1F] text-white selection:bg-cyan-500/30 selection:text-cyan-200`}
    >
      {/* 1. Scroll-scrubbed Interactive Hero */}
      <ScrollHero />

      {/* 2. Anchor Contact / Demo Booking Section */}
      <ContactSection />
    </main>
  );
}
