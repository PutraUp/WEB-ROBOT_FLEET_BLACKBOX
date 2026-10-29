'use client';

import React from 'react';
import { ShieldCheck, HardHat, ShieldAlert, Cpu, Terminal, Menu, X, Bot, Info, LogIn, LogOut, UserCheck } from 'lucide-react';
import { UserRole } from '../../types';
import { useRouter, usePathname } from 'next/navigation';
import { useFleet } from '../../context/FleetContext';

export interface NavbarProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  currentPage: string;
  onNavigate: (page: string) => void;
  openIncidentsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  onRoleChange,
  currentPage,
  onNavigate,
  openIncidentsCount
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { authUser, logoutUser } = useFleet();

  const navItems = [
    { id: 'fleet', path: '/', label: 'Armada AGV', icon: Cpu },
    { id: 'katalog', path: '/katalog', label: 'Katalog', icon: Bot },
    { id: 'logs', path: '/logs', label: 'Black Box Logs', icon: Terminal },
    {
      id: 'forensics',
      path: '/forensics',
      label: 'Investigasi Forensik',
      icon: ShieldAlert,
      badge: openIncidentsCount > 0 ? openIncidentsCount : undefined
    },
    { id: 'aead', path: '/aead', label: 'AEAD Kripto (Tugas 2)', icon: ShieldCheck },
    { id: 'admin', path: '/admin', label: 'Admin & Audit', icon: HardHat, roleRequired: 'ADMIN' },
    { id: 'tentang', path: '/tentang', label: 'Tentang', icon: Info },
    { id: 'login', path: '/login', label: 'Login (Zod)', icon: LogIn }
  ];

  const handleNavClick = (pageId: string, path: string) => {
    onNavigate(pageId);
    setMobileMenuOpen(false);
    if (router && router.push) {
      router.push(path);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleNavClick('fleet', '/')}
              className="flex items-center gap-3 text-left focus:outline-none focus:ring-2 focus:ring-cyan-500 rounded-lg p-1"
              aria-label="Kembali ke Beranda Robot Fleet Black Box"
            >
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-950/50 border border-cyan-400/30">
                <ShieldCheck className="w-6 h-6 text-white" aria-hidden="true" />
              </div>
              <div>
                <span className="text-sm sm:text-base font-bold text-white tracking-tight flex items-center gap-1.5">
                  ROBOT FLEET <span className="text-cyan-400 font-extrabold">BLACK BOX</span>
                </span>
                <span className="block text-[10px] text-slate-400 font-mono tracking-widest uppercase">
                  HMAC-SHA256 Forensic Integrity
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Navigasi Utama">
            {navItems.map(item => {
              if (item.roleRequired && currentRole !== 'ADMIN') return null;
              const isActive = currentPage === item.id || pathname === item.path;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id, item.path)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold tracking-wide uppercase transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* User Auth Status & Role Switcher */}
          <div className="hidden lg:flex items-center gap-3">
            {authUser ? (
              <div className="flex items-center gap-2 bg-slate-900/90 border border-emerald-500/30 rounded-lg px-2.5 py-1.5 shadow-sm">
                <UserCheck className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-white leading-tight">{authUser.name}</span>
                  <span className="text-[10px] text-emerald-400 font-mono leading-tight">
                    {authUser.role} ({authUser.email})
                  </span>
                </div>
                <button
                  type="button"
                  onClick={logoutUser}
                  title="Keluar / Logout"
                  className="ml-1 text-slate-400 hover:text-red-400 p-1 rounded hover:bg-slate-800 transition-colors"
                  aria-label="Logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => handleNavClick('login', '/login')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600/20 text-cyan-400 border border-cyan-500/40 hover:bg-cyan-600/30 transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Masuk (Zod)</span>
              </button>
            )}

            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg p-1">
              <label htmlFor="role-select" className="text-[11px] font-semibold text-slate-400 uppercase px-2">
                Peran:
              </label>
              <select
                id="role-select"
                value={currentRole}
                onChange={e => onRoleChange(e.target.value as UserRole)}
                className="bg-slate-950 text-cyan-400 text-xs font-semibold rounded-md px-2.5 py-1.5 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer"
                aria-label="Pilih Peran Pengguna Aktif"
              >
                <option value="OPERATOR">Operator Gudang</option>
                <option value="FORENSIC">Penyelidik Forensik</option>
                <option value="ADMIN">Admin Sistem</option>
              </select>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
              aria-label={mobileMenuOpen ? 'Tutup navigasi' : 'Buka navigasi'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" aria-hidden="true" />
              ) : (
                <Menu className="w-6 h-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-950 p-4 space-y-3">
          <div className="flex flex-col gap-1">
            {navItems.map(item => {
              if (item.roleRequired && currentRole !== 'ADMIN') return null;
              const isActive = currentPage === item.id || pathname === item.path;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id, item.path)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                      : 'text-slate-300 hover:bg-slate-900'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Mobile Auth Status */}
          <div className="pt-3 border-t border-slate-800">
            {authUser ? (
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-emerald-500/30 mb-2">
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  <div>
                    <span className="block text-xs font-bold text-white">{authUser.name}</span>
                    <span className="block text-[10px] text-emerald-400 font-mono">
                      {authUser.role} ({authUser.email})
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={logoutUser}
                  className="text-xs font-semibold text-red-400 hover:text-red-300 px-2 py-1 rounded bg-red-950/30 border border-red-500/30"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => handleNavClick('login', '/login')}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 mb-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Masuk ke Akun (Zod Form)</span>
              </button>
            )}

            <label htmlFor="mobile-role-select" className="text-xs font-semibold text-slate-400 block mb-1">
              Beralih Peran Pengguna (RBAC):
            </label>
            <select
              id="mobile-role-select"
              value={currentRole}
              onChange={e => onRoleChange(e.target.value as UserRole)}
              className="w-full bg-slate-900 text-cyan-400 text-sm font-semibold rounded-lg px-3 py-2 border border-slate-700"
            >
              <option value="OPERATOR">Operator Gudang</option>
              <option value="FORENSIC">Penyelidik Forensik</option>
              <option value="ADMIN">Admin Sistem</option>
            </select>
          </div>
        </div>
      )}
    </header>
  );
};

