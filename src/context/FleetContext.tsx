'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import {
  UserRole,
  AGVRobot,
  BlackBoxLogEntry,
  IncidentRecord,
  AuditLog,
  RobotCommand,
  IncidentVerificationDetail
} from '../types';
import {
  INITIAL_ROBOTS,
  INITIAL_LOGS_MAP,
  INITIAL_INCIDENTS,
  INITIAL_AUDIT_LOGS
} from '../data/mockData';

export interface FleetContextType {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  currentPage: string;
  setCurrentPage: (page: string) => void;
  robots: AGVRobot[];
  setRobots: React.Dispatch<React.SetStateAction<AGVRobot[]>>;
  logsMap: Record<string, BlackBoxLogEntry[]>;
  setLogsMap: React.Dispatch<React.SetStateAction<Record<string, BlackBoxLogEntry[]>>>;
  incidents: IncidentRecord[];
  setIncidents: React.Dispatch<React.SetStateAction<IncidentRecord[]>>;
  auditLogs: AuditLog[];
  setAuditLogs: React.Dispatch<React.SetStateAction<AuditLog[]>>;
  selectedRobotIdForLogs: string;
  setSelectedRobotIdForLogs: (id: string) => void;
  isAdminRegisterOpen: boolean;
  setIsAdminRegisterOpen: (open: boolean) => void;
  openIncidentsCount: number;
  recordAudit: (action: string, target: string, status?: AuditLog['status']) => void;
  handleExecuteCommand: (robotId: string, command: RobotCommand) => void;
  handleUpdateLogs: (robotId: string, updatedLogs: BlackBoxLogEntry[]) => void;
  handleAddIncident: (
    newIncidentData: Omit<IncidentRecord, 'id' | 'status' | 'verificationResult'>
  ) => void;
  handleUpdateIncidentVerification: (incidentId: string, result: IncidentVerificationDetail) => void;
  handleRegisterRobot: (newRobot: AGVRobot) => void;
  handleNavigateToLogs: (robotId: string) => void;
}

const FleetContext = createContext<FleetContextType | undefined>(undefined);

export const FleetProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>('OPERATOR');
  const [currentPage, setCurrentPage] = useState<string>('fleet');

  // Application Global Mock States
  const [robots, setRobots] = useState<AGVRobot[]>(INITIAL_ROBOTS);
  const [logsMap, setLogsMap] = useState<Record<string, BlackBoxLogEntry[]>>(INITIAL_LOGS_MAP);
  const [incidents, setIncidents] = useState<IncidentRecord[]>(INITIAL_INCIDENTS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);

  const [selectedRobotIdForLogs, setSelectedRobotIdForLogs] = useState<string>(INITIAL_ROBOTS[1].id); // AGV-02 by default
  const [isAdminRegisterOpen, setIsAdminRegisterOpen] = useState(false);

  // Unresolved incident count
  const openIncidentsCount = incidents.filter(
    i => i.status === 'OPEN' || i.status === 'INVESTIGATING' || i.status === 'TAMPER_DETECTED'
  ).length;

  // Add an audit log entry
  const recordAudit = (action: string, target: string, status: AuditLog['status'] = 'SUCCESS') => {
    const newAudit: AuditLog = {
      id: `AUD-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString(),
      user: currentRole === 'ADMIN' ? 'admin_root' : currentRole === 'FORENSIC' ? 'forensic_clara' : 'operator_danu',
      role: currentRole,
      action,
      target,
      status
    };
    setAuditLogs(prev => [newAudit, ...prev]);
  };

  // Command execution handler
  const handleExecuteCommand = (robotId: string, command: RobotCommand) => {
    setRobots(prev =>
      prev.map(robot => {
        if (robot.id === robotId) {
          let updatedStatus = robot.status;
          let updatedTask = robot.currentTask;
          let newCoords = { ...robot.coordinates };

          if (command.type === 'STOP' || command.type === 'EMERGENCY_SHUTDOWN') {
            updatedStatus = 'ALERT';
            updatedTask = `DARURAT DIIKUTI: ${command.reason || 'Pemberhentian Manual'}`;
          } else if (command.type === 'RESUME') {
            updatedStatus = 'ACTIVE';
            updatedTask = 'Operasi normal dilanjutkan';
          } else if (command.type === 'MOVE_TO') {
            updatedStatus = 'ACTIVE';
            if (command.targetX !== undefined && command.targetY !== undefined) {
              newCoords = { x: command.targetX, y: command.targetY };
              updatedTask = `Navigasi rute baru ke (${command.targetX}, ${command.targetY})`;
            }
          } else if (command.type === 'CHARGE') {
            updatedStatus = 'CHARGING';
            updatedTask = 'Menuju stasiun pengisian daya';
          }

          return {
            ...robot,
            status: updatedStatus,
            currentTask: updatedTask,
            coordinates: newCoords,
            lastPing: new Date().toISOString()
          };
        }
        return robot;
      })
    );

    recordAudit(`EXECUTE_${command.type}`, `Robot ${robotId} - ${command.reason || 'Instruksi'}`);
  };

  // Log update handler
  const handleUpdateLogs = (robotId: string, updatedLogs: BlackBoxLogEntry[]) => {
    setLogsMap(prev => ({
      ...prev,
      [robotId]: updatedLogs
    }));
    recordAudit('MODIFY_LOG_CHAIN_SIMULATION', `Robot ${robotId} Logs`);
  };

  // Incident submission handler
  const handleAddIncident = (
    newIncidentData: Omit<IncidentRecord, 'id' | 'status' | 'verificationResult'>
  ) => {
    const newId = `INC-2026-00${incidents.length + 1}`;
    const newRecord: IncidentRecord = {
      ...newIncidentData,
      id: newId,
      status: 'INVESTIGATING'
    };

    setIncidents(prev => [newRecord, ...prev]);
    recordAudit('CREATE_INCIDENT', `${newId} (${newRecord.title})`);
  };

  // Verification result update handler
  const handleUpdateIncidentVerification = (incidentId: string, result: IncidentVerificationDetail) => {
    setIncidents(prev =>
      prev.map(inc => {
        if (inc.id === incidentId) {
          const newStatus = result.isValid ? 'RESOLVED' : 'TAMPER_DETECTED';
          return {
            ...inc,
            status: newStatus,
            verificationResult: result
          };
        }
        return inc;
      })
    );

    recordAudit(
      'RUN_FORENSIC_VERIFICATION',
      `Kasus ${incidentId} - Hasil: ${result.isValid ? 'OTENTIK' : 'TAMPERED'}`,
      result.isValid ? 'SUCCESS' : 'WARNING'
    );
  };

  // Robot registration handler
  const handleRegisterRobot = (newRobot: AGVRobot) => {
    setRobots(prev => [...prev, newRobot]);
    // Initialize default entry for the new robot
    setLogsMap(prev => ({
      ...prev,
      [newRobot.id]: [
        {
          seq: 1,
          ts: new Date().toISOString(),
          prev_mac: '0000000000000000000000000000000000000000000000000000000000000000',
          payload: {
            x: newRobot.coordinates.x,
            y: newRobot.coordinates.y,
            speed: 0,
            battery: 100,
            status: 'ONLINE',
            task: 'Pendaftaran robot selesai'
          },
          mac: 'a1b2c3d4e5f60718293a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e'
        }
      ]
    }));

    recordAudit('REGISTER_AGV', `${newRobot.id} (${newRobot.name})`);
  };

  // Quick navigation to logs
  const handleNavigateToLogs = (robotId: string) => {
    setSelectedRobotIdForLogs(robotId);
    setCurrentPage('logs');
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <FleetContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        currentPage,
        setCurrentPage,
        robots,
        setRobots,
        logsMap,
        setLogsMap,
        incidents,
        setIncidents,
        auditLogs,
        setAuditLogs,
        selectedRobotIdForLogs,
        setSelectedRobotIdForLogs,
        isAdminRegisterOpen,
        setIsAdminRegisterOpen,
        openIncidentsCount,
        recordAudit,
        handleExecuteCommand,
        handleUpdateLogs,
        handleAddIncident,
        handleUpdateIncidentVerification,
        handleRegisterRobot,
        handleNavigateToLogs
      }}
    >
      {children}
    </FleetContext.Provider>
  );
};

export function useFleet() {
  const context = useContext(FleetContext);
  if (!context) {
    throw new Error('useFleet must be used within a FleetProvider');
  }
  return context;
}
