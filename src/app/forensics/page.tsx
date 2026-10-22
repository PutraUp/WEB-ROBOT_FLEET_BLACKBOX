'use client';

import React from 'react';
import { useFleet } from '../../context/FleetContext';
import { IncidentForensicsPage } from '../../views/IncidentForensicsPage';

export default function ForensicsRoute() {
  const {
    robots,
    incidents,
    logsMap,
    handleAddIncident,
    handleUpdateIncidentVerification,
    currentRole
  } = useFleet();

  return (
    <IncidentForensicsPage
      robots={robots}
      incidents={incidents}
      logsMap={logsMap}
      onAddIncident={handleAddIncident}
      onUpdateIncidentVerification={handleUpdateIncidentVerification}
      userRole={currentRole}
    />
  );
}
