'use client';

import React, { useState } from 'react';
import { AGVRobot, RobotCommand } from '../types';
import { StatCard } from '../components/common/Card';
import { WarehouseMap } from '../components/fleet/WarehouseMap';
import { RobotCard } from '../components/fleet/RobotCard';
import { CommandModal } from '../components/fleet/CommandModal';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/FormField';
import { Bot, Activity, AlertTriangle, BatteryCharging, Search, PlusCircle } from 'lucide-react';

export interface FleetOverviewPageProps {
  robots: AGVRobot[];
  onExecuteCommand: (robotId: string, command: RobotCommand) => void;
  onNavigateToLogs: (robotId: string) => void;
  onOpenRegisterModal: () => void;
  userRole: string;
}

export const FleetOverviewPage: React.FC<FleetOverviewPageProps> = ({
  robots,
  onExecuteCommand,
  onNavigateToLogs,
  onOpenRegisterModal,
  userRole
}) => {
  const [selectedRobotId, setSelectedRobotId] = useState<string>(robots[0]?.id || '');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [commandModalRobot, setCommandModalRobot] = useState<AGVRobot | null>(null);

  // Statistics calculation
  const totalRobots = robots.length;
  const activeRobots = robots.filter(r => r.status === 'ACTIVE').length;
  const alertRobots = robots.filter(r => r.status === 'ALERT').length;
  const avgBattery = Math.round(
    robots.reduce((acc, curr) => acc + curr.battery, 0) / (robots.length || 1)
  );

  // Filtered robots
  const filteredRobots = robots.filter(robot => {
    const matchesFilter = filterStatus === 'ALL' || robot.status === filterStatus;
    const matchesSearch =
      robot.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      robot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      robot.zone.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner / Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Bot className="w-6 h-6 text-cyan-400" aria-hidden="true" />
            Pemantauan Armada AGV & Operasional Gudang
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Status real-time, koordinat navigasi, dan telemetri rantai log Black Box robot logistik
          </p>
        </div>

        {userRole === 'ADMIN' && (
          <Button
            variant="cyber"
            onClick={onOpenRegisterModal}
            leftIcon={<PlusCircle className="w-4 h-4" />}
          >
            Daftarkan Robot Baru
          </Button>
        )}
      </div>

      {/* Metric Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="Total Armada AGV"
          value={totalRobots}
          subValue="Unit Terdaftar"
          icon={<Bot className="w-5 h-5" />}
          accentColor="cyan"
        />
        <StatCard
          label="Unit Aktif Misi"
          value={activeRobots}
          subValue="Beroperasi Normal"
          icon={<Activity className="w-5 h-5" />}
          accentColor="emerald"
        />
        <StatCard
          label="Status Siaga / Insiden"
          value={alertRobots}
          subValue="Perlu Forensik"
          icon={<AlertTriangle className="w-5 h-5" />}
          accentColor={alertRobots > 0 ? 'rose' : 'cyan'}
          trend={alertRobots > 0 ? { value: '+1 Insiden Baru Terdeteksi', positive: false } : undefined}
        />
        <StatCard
          label="Rata-rata Daya Baterai"
          value={`${avgBattery}%`}
          subValue="Kesehatan Baterai"
          icon={<BatteryCharging className="w-5 h-5" />}
          accentColor="amber"
        />
      </div>

      {/* Warehouse Map */}
      <WarehouseMap
        robots={robots}
        selectedRobotId={selectedRobotId}
        onSelectRobot={robot => setSelectedRobotId(robot.id)}
      />

      {/* Fleet Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3.5 rounded-xl">
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
          <span className="text-slate-400 text-[11px] uppercase mr-1">Filter Status:</span>
          {['ALL', 'ACTIVE', 'ALERT', 'CHARGING', 'IDLE'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filterStatus === status
                  ? 'bg-cyan-600 text-white font-bold'
                  : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {status === 'ALL' ? 'Semua Status' : status}
            </button>
          ))}
        </div>

        <div className="relative sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Cari ID, nama, zona..."
            className="pl-9 py-1.5 text-xs"
          />
        </div>
      </div>

      {/* Fleet Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Daftar Unit Armada ({filteredRobots.length} Unit)
          </h2>
          <span className="text-xs text-slate-400">
            Klik unit untuk melihat di peta atau kirim instruksi
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          {filteredRobots.map(robot => (
            <RobotCard
              key={robot.id}
              robot={robot}
              isSelected={selectedRobotId === robot.id}
              onSendCommand={r => setCommandModalRobot(r)}
              onViewLogs={r => onNavigateToLogs(r.id)}
            />
          ))}
        </div>
      </div>

      {/* Command Dispatch Modal */}
      <CommandModal
        isOpen={!!commandModalRobot}
        onClose={() => setCommandModalRobot(null)}
        robot={commandModalRobot}
        onExecuteCommand={onExecuteCommand}
      />
    </div>
  );
};
