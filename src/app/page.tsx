'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useFleet } from '../context/FleetContext';
import { FleetOverviewPage } from '../views/FleetOverviewPage';

export default function HomePage() {
  const router = useRouter();
  const {
    robots,
    handleExecuteCommand,
    setSelectedRobotIdForLogs,
    setCurrentPage,
    setIsAdminRegisterOpen,
    currentRole
  } = useFleet();

  const handleNavigateToLogs = (robotId: string) => {
    setSelectedRobotIdForLogs(robotId);
    setCurrentPage('logs');
    router.push('/logs');
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <FleetOverviewPage
      robots={robots}
      onExecuteCommand={handleExecuteCommand}
      onNavigateToLogs={handleNavigateToLogs}
      onOpenRegisterModal={() => setIsAdminRegisterOpen(true)}
      userRole={currentRole}
    />
  );
}
