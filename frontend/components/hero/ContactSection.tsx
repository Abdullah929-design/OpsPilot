'use client';

import React, { useState } from 'react';
import { Mail, ArrowRight, ShieldCheck, Zap, Globe, Sparkles } from 'lucide-react';
import Link from 'next/link';

export function ContactSection() {
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section
      id="contact"
      className="relative z-10 py-24 sm:py-32 px-6 sm:px-12 bg-gradient-to-b from-[#F1F5F9] via-white to-[#F8FAFC] border-t border-slate-200"
    >
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Next-Gen Operations</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-950 tracking-tight leading-tight mb-4 font-headline">
            Ready to elevate your enterprise operations?
          </h2>
          <p className="text-slate-600 text-base sm:text-lg max-w-xl mx-auto font-medium">
            Schedule a personalized walkthrough with our solution architects to see multi-tenancy in action.
          </p>
        </div>

        {/* Contact Card */}
        <div className="p-8 sm:p-12 rounded-3xl bg-white/80 backdrop-blur-xl border border-slate-200 shadow-[0_20px_60px_rgba(15,23,42,0.06)] relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 mb-2 font-headline">
                Request a Dedicated Walkthrough
              </h3>
              <p className="text-sm font-medium text-slate-600 mb-6 leading-relaxed">
                Fill in your work email and our team will prepare a sandbox tenant for your organization within 2 hours.
              </p>

              <div className="space-y-3 text-xs font-semibold text-slate-700">
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <span>SOC2 & GDPR Compliant Infrastructure</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center">
                    <Zap className="w-3.5 h-3.5" />
                  </div>
                  <span>Instant sandbox tenant deployment</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-cyan-50 text-cyan-600 flex items-center justify-center">
                    <Globe className="w-3.5 h-3.5" />
                  </div>
                  <span>Global multi-region data residency</span>
                </div>
              </div>
            </div>

            {/* Form */}
            {submitted ? (
              <div className="p-6 rounded-2xl bg-indigo-50 border border-indigo-200 text-center">
                <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-indigo-500/20">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h4 className="text-base font-extrabold text-slate-900 mb-1">Walkthrough Requested!</h4>
                <p className="text-xs font-medium text-slate-600">
                  Our architecture team will email <span className="text-indigo-600 font-bold">{email}</span> within 2 hours with sandbox credentials.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Work Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all font-medium"
                    />
                    <Mail className="absolute right-3.5 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Company Name
                  </label>
                  <input
                    type="text"
                    required
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Acme Corp"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all font-medium"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 via-sky-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 shadow-xl shadow-indigo-500/20 hover:shadow-cyan-500/30 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
                >
                  <span>Book Demo Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Footer note */}
        <div className="mt-16 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200 pt-8 font-medium">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">OpsPilot</span>
            <span>&copy; {new Date().getFullYear()} OpsPilot Systems Inc. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="/platform/login" className="hover:text-indigo-600 transition-colors">
              Platform Admin
            </a>
            <a href="/login" className="hover:text-indigo-600 transition-colors">
              Company Login
            </a>
            <a href="#contact" className="hover:text-indigo-600 transition-colors">
              Contact
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
