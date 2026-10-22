'use client';

import React from 'react';
import { useFleet } from '../../context/FleetContext';
import { AdminManagementPage } from '../../views/AdminManagementPage';

export default function AdminRoute() {
  const { robots, auditLogs, handleRegisterRobot, currentRole } = useFleet();

  return (
    <AdminManagementPage
      robots={robots}
      auditLogs={auditLogs}
      onRegisterRobot={handleRegisterRobot}
      userRole={currentRole}
    />
  );
}
