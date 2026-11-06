import React, { useState } from 'react';
import { useSociety } from '../../context/SocietyContext';
import {
  Shield,
  Building,
  CreditCard,
  QrCode,
  Dumbbell,
  AlertCircle,
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Star,
  Users,
  Lock,
  Code,
  LogIn,
  X,
  Car,
  CalendarDays,
} from 'lucide-react';
import { UserRole } from '../../types';
import { MDGLogo } from '../common/MDGLogo';

export const LandingPage: React.FC<{ onEnterApp: () => void }> = ({ onEnterApp }) => {
  const { login, switchRole, setIsCodeModalOpen } = useSociety();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [selectedRole, setSelectedRole] = useState<UserRole>('ADMIN');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');

  const handleQuickLogin = (role: UserRole) => {
    switchRole(role);
    onEnterApp();
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(username, selectedRole);
    onEnterApp();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-900/90 backdrop-blur-md px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <MDGLogo variant="light" size="md" />

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#home" className="text-white hover:text-indigo-400 transition">
              Home
            </a>
            <a href="#about" className="hover:text-indigo-400 transition">
              About
            </a>
            <a href="#features" className="hover:text-indigo-400 transition">
              Features
            </a>
            <a href="#why-mdg" className="hover:text-indigo-400 transition">
              Why MDG
            </a>
            <button
              onClick={() => setIsCodeModalOpen(true)}
              className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 transition font-semibold"
            >
              <Code className="h-4 w-4" />
              <span>Python & MySQL Setup</span>
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setAuthMode('login');
                setShowAuthModal(true);
              }}
              className="rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700 transition"
            >
              Login
            </button>
            <button
              onClick={() => {
                setAuthMode('register');
                setShowAuthModal(true);
              }}
              className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 hover:from-violet-500 hover:to-indigo-500 transition"
            >
              Register
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="relative overflow-hidden pt-12 pb-24 md:pt-20 md:pb-32">
        {/* Background Apartment Glow & Overlay */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center opacity-30 mix-blend-screen"
          style={{
            backgroundImage:
              'url(https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=2000&q=80)',
          }}
        ></div>
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-slate-900/40 via-slate-900/90 to-slate-950"></div>

        <div className="relative z-10 mx-auto max-w-7xl px-6">
          <div className="max-w-3xl">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-medium text-indigo-300 mb-6">
              <span>Modern Living</span>
              <span className="text-slate-500">|</span>
              <span>Smarter Management</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-[1.1]">
              MDG <br />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
                Society Management System
              </span>
            </h1>

            {/* Description */}
            <p className="mt-6 text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
              A complete digital solution for residential societies. Manage residents, flats, payments, complaints,
              facilities and more — all in one place. Built for a better, smarter community living experience.
            </p>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <button
                onClick={() => handleQuickLogin('ADMIN')}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-indigo-600/30 hover:scale-105 transition-all"
              >
                <span>Get Started (Admin Live Demo)</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={async () => {
                  const { downloadFullProjectZip } = await import('../../utils/downloadZip');
                  downloadFullProjectZip();
                }}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-emerald-600/20 hover:scale-105 transition-all"
              >
                <Code className="h-4 w-4" />
                <span>Download Project (.ZIP)</span>
              </button>
              <a
                href="#features"
                className="rounded-xl border border-slate-700 bg-slate-800/80 px-5 py-3.5 text-sm font-semibold text-slate-200 hover:bg-slate-700 transition"
              >
                View Features
              </a>
            </div>

            {/* Social Proof */}
            <div className="mt-10 flex items-center gap-4">
              <div className="flex -space-x-2">
                <img
                  className="inline-block h-9 w-9 rounded-full ring-2 ring-slate-900 object-cover"
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&q=80"
                  alt="Avatar"
                />
                <img
                  className="inline-block h-9 w-9 rounded-full ring-2 ring-slate-900 object-cover"
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=128&q=80"
                  alt="Avatar"
                />
                <img
                  className="inline-block h-9 w-9 rounded-full ring-2 ring-slate-900 object-cover"
                  src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=128&q=80"
                  alt="Avatar"
                />
                <img
                  className="inline-block h-9 w-9 rounded-full ring-2 ring-slate-900 object-cover"
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=128&q=80"
                  alt="Avatar"
                />
              </div>
              <div className="text-xs">
                <div className="flex text-amber-400">
                  {'★'.repeat(5)}
                </div>
                <span className="font-semibold text-slate-200">Trusted by 500+ Residents</span>
              </div>
            </div>

            {/* College Evaluation Demo Accounts Quick Launcher */}
            <div className="mt-12 rounded-3xl border border-indigo-500/30 bg-slate-900/90 backdrop-blur p-6 shadow-2xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-bold">
                    ✓
                  </span>
                  <h3 className="text-sm font-bold text-white tracking-wide">
                    College Presentation & Evaluation Demo Accounts
                  </h3>
                </div>
                <span className="rounded-full bg-emerald-950 px-3 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-800">
                  Ready for Live Demonstration
                </span>
              </div>

              <p className="text-xs text-slate-400 mt-2">
                Click any role below to launch the live dashboard instantly without typing, or enter the credentials in the login form:
              </p>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Admin Card */}
                <div className="rounded-2xl border border-indigo-500/30 bg-indigo-950/20 p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase text-indigo-400">1. Administrator</span>
                      <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded font-bold">Full Access</span>
                    </div>
                    <div className="mt-2 text-[11px] font-mono text-slate-300 space-y-0.5 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                      <div>User: <strong className="text-white">admin</strong></div>
                      <div>Pass: <strong className="text-emerald-400">Admin@123</strong></div>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2 leading-tight">
                      Manage 48 flats, purchase registration, ownership deeds, monthly bills & society governance.
                    </p>
                  </div>
                  <button
                    onClick={() => handleQuickLogin('ADMIN')}
                    className="mt-3 w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-2 text-xs font-bold text-white shadow hover:from-indigo-500 hover:to-violet-500 transition"
                  >
                    Launch Admin Demo →
                  </button>
                </div>

                {/* Resident Card */}
                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase text-emerald-400">2. Resident (Owner)</span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold">Flat A-101</span>
                    </div>
                    <div className="mt-2 text-[11px] font-mono text-slate-300 space-y-0.5 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                      <div>User: <strong className="text-white">rahul_sharma</strong></div>
                      <div>Pass: <strong className="text-emerald-400">Resident@123</strong></div>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2 leading-tight">
                      Flat A-101 dashboard, pay maintenance bills, book amenities, gym membership & invite guests.
                    </p>
                  </div>
                  <button
                    onClick={() => handleQuickLogin('RESIDENT')}
                    className="mt-3 w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-2 text-xs font-bold text-white shadow hover:from-emerald-500 hover:to-teal-500 transition"
                  >
                    Launch Resident Demo →
                  </button>
                </div>

                {/* Security Card */}
                <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase text-amber-400">3. Security Staff</span>
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-bold">Gate 1</span>
                    </div>
                    <div className="mt-2 text-[11px] font-mono text-slate-300 space-y-0.5 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                      <div>User: <strong className="text-white">security_gate1</strong></div>
                      <div>Pass: <strong className="text-emerald-400">Security@123</strong></div>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2 leading-tight">
                      Security gate console, live visitor QR code scanner, visitor log register & parcel intake.
                    </p>
                  </div>
                  <button
                    onClick={() => handleQuickLogin('SECURITY')}
                    className="mt-3 w-full rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 py-2 text-xs font-bold text-white shadow hover:from-amber-500 hover:to-orange-500 transition"
                  >
                    Launch Security Demo →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8 Feature Highlight Cards Section */}
      <section id="features" className="relative z-10 bg-slate-950 py-16 border-t border-slate-800">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Governance Modules</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">Comprehensive Society Management</h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              All 8 core residential pillars built to modern digital governance standards for seamless society administration.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Flats */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 text-center transition hover:border-emerald-500/50 hover:bg-slate-900">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 mb-3">
                <Building className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-white">48 Flats Directory</h3>
              <p className="mt-1 text-xs text-slate-400 leading-snug">
                Wings A, B, and C with occupancy statuses, BHK plans, and ownership purchase tracking.
              </p>
            </div>

            {/* Card 2: Residents */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 text-center transition hover:border-indigo-500/50 hover:bg-slate-900">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 mb-3">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-white">Owners & Residents</h3>
              <p className="mt-1 text-xs text-slate-400 leading-snug">
                Owner vs tenant profiles, family member rosters, emergency contacts, and move-in logs.
              </p>
            </div>

            {/* Card 3: Maintenance */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 text-center transition hover:border-emerald-500/50 hover:bg-slate-900">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 mb-3">
                <CreditCard className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-white">Maintenance Bills</h3>
              <p className="mt-1 text-xs text-slate-400 leading-snug">
                Automated monthly bills, payment recording via UPI/Cards, and downloadable stamped receipts.
              </p>
            </div>

            {/* Card 4: Parking */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 text-center transition hover:border-cyan-500/50 hover:bg-slate-900">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 mb-3">
                <Car className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-white">Parking Allocation</h3>
              <p className="mt-1 text-xs text-slate-400 leading-snug">
                Dedicated slot assignment with vehicle registration verification and zero double-booking.
              </p>
            </div>

            {/* Card 5: Visitors */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 text-center transition hover:border-purple-500/50 hover:bg-slate-900">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-400 mb-3">
                <QrCode className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-white">Visitors & QR Passes</h3>
              <p className="mt-1 text-xs text-slate-400 leading-snug">
                Instant encrypted QR entry passes with live security gate scanner and visitor audit logs.
              </p>
            </div>

            {/* Card 6: Complaints */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 text-center transition hover:border-amber-500/50 hover:bg-slate-900">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 mb-3">
                <AlertCircle className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-white">Complaints & Tickets</h3>
              <p className="mt-1 text-xs text-slate-400 leading-snug">
                Categorized issue ticketing with priority assignment, technician dispatch, and resolution dates.
              </p>
            </div>

            {/* Card 7: Gym */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 text-center transition hover:border-rose-500/50 hover:bg-slate-900">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-400 mb-3">
                <Dumbbell className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-white">Gym Management</h3>
              <p className="mt-1 text-xs text-slate-400 leading-snug">
                Monthly, quarterly, and annual gym memberships linked to residents with automated renewals.
              </p>
            </div>

            {/* Card 8: Facilities */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 text-center transition hover:border-teal-500/50 hover:bg-slate-900">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-400 mb-3">
                <CalendarDays className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-white">Facility Booking</h3>
              <p className="mt-1 text-xs text-slate-400 leading-snug">
                Clubhouse, banquet, and sports courts reservations with automated conflict and overlap prevention.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-slate-900 border-t border-slate-800">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Green Valley Residency • Bengaluru, Karnataka
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                About MDG Society Governance
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                The <strong>Modern Digital Governance (MDG)</strong> Society Management System is an end-to-end community governance platform deployed for <strong>Green Valley Residency</strong>, located in Bengaluru, Karnataka.
              </p>
              <p className="text-slate-400 text-xs leading-relaxed">
                Empowering 48 apartments across Wings A, B, and C with paperless maintenance billing, verifiable security gate passes, transparent financial audits, and democratic society polls. Built with strict role-based access control for Administrators, Residents, and Security Staff.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-200">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>48 Registered Flats (Wings A, B, C)</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-200">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Full Ownership History Retention</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-200">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>100% MySQL 8.0 Persistence</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-200">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Verifiable QR Security Passes</span>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-4">
                <button
                  onClick={() => handleQuickLogin('ADMIN')}
                  className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-3 text-xs font-bold text-white shadow-lg hover:from-emerald-500 hover:to-teal-500 transition"
                >
                  Enter Admin Dashboard →
                </button>
              </div>
            </div>

            {/* Right Preview Card */}
            <div className="lg:col-span-6 rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-rose-500"></div>
                  <div className="h-3 w-3 rounded-full bg-amber-500"></div>
                  <div className="h-3 w-3 rounded-full bg-emerald-500"></div>
                  <span className="text-xs text-slate-400 ml-2 font-mono">Green Valley Residency • Society Status</span>
                </div>
                <span className="text-[10px] rounded-full bg-emerald-900/60 px-2.5 py-1 text-emerald-300 font-bold">
                  Tagline: Better Living Together
                </span>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-slate-900 p-3.5 border border-slate-800">
                  <span className="text-[11px] text-slate-400">Total Flats</span>
                  <div className="text-xl font-bold text-white mt-1">48 Flats</div>
                  <span className="text-[10px] text-emerald-400">Wings A, B, C</span>
                </div>
                <div className="rounded-xl bg-slate-900 p-3.5 border border-slate-800">
                  <span className="text-[11px] text-slate-400">Occupancy Rate</span>
                  <div className="text-xl font-bold text-emerald-400 mt-1">94%</div>
                  <span className="text-[10px] text-slate-400">Active Families</span>
                </div>
                <div className="rounded-xl bg-slate-900 p-3.5 border border-slate-800">
                  <span className="text-[11px] text-slate-400">Society Health</span>
                  <div className="text-xl font-bold text-indigo-400 mt-1">85% Good</div>
                  <span className="text-[10px] text-indigo-300">Audited metrics</span>
                </div>
                <div className="rounded-xl bg-slate-900 p-3.5 border border-slate-800">
                  <span className="text-[11px] text-slate-400">Security Gate</span>
                  <div className="text-xl font-bold text-amber-400 mt-1">QR Pass</div>
                  <span className="text-[10px] text-slate-400">Live Verification</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Slogan Banner */}
      <div className="border-y border-emerald-900/40 bg-gradient-to-r from-emerald-950/60 via-slate-900 to-emerald-950/60 py-4 text-center text-xs sm:text-sm font-bold tracking-wider text-emerald-300 uppercase">
        🌿 Better Living Together • Modern Digital Governance • Green Valley Residency
      </div>

      {/* Footer */}
      <footer className="mt-auto bg-slate-950 py-8 border-t border-slate-900 text-xs text-slate-400">
        <div className="mx-auto max-w-7xl px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <MDGLogo variant="light" size="sm" />
          <div className="text-center md:text-left">
            <span className="text-slate-200 font-semibold">Green Valley Residency</span>
            <span className="mx-2 text-slate-600">•</span>
            <span>Bengaluru, Karnataka</span>
            <div className="text-[11px] text-slate-500 mt-0.5">Tagline: Better Living Together • © 2025 MDG Society Management</div>
          </div>
          <div className="flex gap-4 items-center">
            <button onClick={() => setIsCodeModalOpen(true)} className="text-emerald-400 hover:text-emerald-300 font-semibold">
              Python & MySQL Guide
            </button>
          </div>
        </div>
      </footer>

      {/* Authentication Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl text-slate-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <MDGLogo variant="light" size="sm" />
              <button
                onClick={() => setShowAuthModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <LogIn className="h-4 w-4 text-emerald-400" />
                {authMode === 'login' ? 'Login to MDG Portal' : 'Register for Society Approval'}
              </h3>
              <p className="text-[11px] text-slate-400">Green Valley Residency • Bengaluru, Karnataka</p>
            </div>

            <form onSubmit={handleFormSubmit} className="mt-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300">Select Role</label>
                <div className="mt-1.5 grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole('ADMIN');
                      setUsername('admin');
                    }}
                    className={`rounded-xl border py-2 text-xs font-semibold ${
                      selectedRole === 'ADMIN'
                        ? 'border-indigo-500 bg-indigo-600/20 text-indigo-300'
                        : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole('RESIDENT');
                      setUsername('rahul_sharma');
                    }}
                    className={`rounded-xl border py-2 text-xs font-semibold ${
                      selectedRole === 'RESIDENT'
                        ? 'border-indigo-500 bg-indigo-600/20 text-indigo-300'
                        : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    Resident
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole('SECURITY');
                      setUsername('security_head');
                    }}
                    className={`rounded-xl border py-2 text-xs font-semibold ${
                      selectedRole === 'SECURITY'
                        ? 'border-indigo-500 bg-indigo-600/20 text-indigo-300'
                        : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    Security
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Username / Email</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-800 px-3.5 py-2 text-sm text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div className="rounded-xl bg-indigo-950/40 border border-indigo-800/40 p-3 text-[11px] text-indigo-200">
                💡 <strong>Quick Demo Tip:</strong> Passwords and role authorization are simulated live in-session.
                Role permissions are strictly isolated per role.
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3 text-xs font-bold text-white shadow-lg hover:from-violet-500 hover:to-indigo-500 transition"
              >
                {authMode === 'login' ? 'Sign In' : 'Submit Registration for Admin Approval'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
