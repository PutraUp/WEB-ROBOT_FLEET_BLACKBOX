'use client';

import React, { useEffect, ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useFleet } from '../../context/FleetContext';
import { Navbar } from './Navbar';
import { RoleBanner } from './RoleBanner';
import { Footer } from './Footer';
import { RegisterRobotModal } from '../admin/RegisterRobotModal';

export const AppShell: React.FC<{ children: ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const {
    currentRole,
    setCurrentRole,
    currentPage,
    setCurrentPage,
    openIncidentsCount,
    isAdminRegisterOpen,
    setIsAdminRegisterOpen,
    handleRegisterRobot,
    robots
  } = useFleet();

  // Sync pathname with currentPage
  useEffect(() => {
    if (pathname === '/logs') {
      setCurrentPage('logs');
    } else if (pathname === '/forensics') {
      setCurrentPage('forensics');
    } else if (pathname === '/admin') {
      setCurrentPage('admin');
    } else if (pathname?.startsWith('/katalog')) {
      setCurrentPage('katalog');
    } else if (pathname === '/tentang') {
      setCurrentPage('tentang');
    } else if (pathname === '/login') {
      setCurrentPage('login');
    } else if (pathname === '/aead') {
      setCurrentPage('aead');
    } else if (pathname === '/') {
      setCurrentPage('fleet');
    }
  }, [pathname, setCurrentPage]);

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    const targetPath = page === 'fleet' ? '/' : `/${page}`;
    if (pathname !== targetPath) {
      router.push(targetPath);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-white font-sans">
      {/* Accessibility Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 bg-cyan-600 text-white font-bold px-4 py-2 rounded-lg shadow-lg"
      >
        Lewati ke Konten Utama (Skip to main)
      </a>

      {/* Navigation Bar */}
      <Navbar
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        currentPage={currentPage}
        onNavigate={handleNavigate}
        openIncidentsCount={openIncidentsCount}
      />

      {/* Role Banner / RBAC Context Bar */}
      <RoleBanner currentRole={currentRole} onRoleChange={setCurrentRole} />

      {/* Main Content Area */}
      <main id="main-content" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </main>

      {/* Footer */}
      <Footer />

      {/* Global Register Modal if triggered from fleet */}
      <RegisterRobotModal
        isOpen={isAdminRegisterOpen}
        onClose={() => setIsAdminRegisterOpen(false)}
        onRegisterRobot={handleRegisterRobot}
        existingIds={robots.map(r => r.id)}
      />
    </div>
  );
};
