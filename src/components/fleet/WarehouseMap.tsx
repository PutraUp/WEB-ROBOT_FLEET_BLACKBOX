import React from 'react';
import { AGVRobot } from '../../types';
import { MapPin, Battery, Gauge } from 'lucide-react';

export interface WarehouseMapProps {
  robots: AGVRobot[];
  selectedRobotId?: string;
  onSelectRobot: (robot: AGVRobot) => void;
}

export const WarehouseMap: React.FC<WarehouseMapProps> = ({
  robots,
  selectedRobotId,
  onSelectRobot
}) => {
  // Warehouse grid dimension: 40m x 35m
  const maxX = 40;
  const maxY = 35;

  const getStatusColor = (status: AGVRobot['status']) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-emerald-500 border-emerald-300 text-emerald-300';
      case 'ALERT':
        return 'bg-red-500 border-red-300 text-red-300';
      case 'CHARGING':
        return 'bg-amber-500 border-amber-300 text-amber-300';
      case 'IDLE':
        return 'bg-cyan-500 border-cyan-300 text-cyan-300';
      default:
        return 'bg-slate-500 border-slate-300 text-slate-300';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-cyan-400" aria-hidden="true" />
            Peta Tata Letak Gudang Logistik (Visual Real-time Grid)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Pelacakan posisi telemetri koordinat X/Y armada AGV dalam radius 40m &times; 35m
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>Aktif</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
            <span>Alert/Insiden</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>Charging</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span>
            <span>Idle</span>
          </div>
        </div>
      </div>

      {/* Grid Canvas */}
      <div className="relative w-full aspect-[16/9] max-h-[380px] bg-slate-950 rounded-lg border border-slate-800 overflow-hidden shadow-inner">
        {/* Warehouse Zone Boundaries */}
        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 opacity-30 pointer-events-none">
          <div className="border-r border-b border-cyan-500/20 p-2 text-[10px] font-mono text-cyan-400">
            [SEKTOR A] Rak Penyimpanan
          </div>
          <div className="border-b border-cyan-500/20 p-2 text-[10px] font-mono text-cyan-400 text-right">
            [SEKTOR B] Loading Dock
          </div>
          <div className="border-r border-cyan-500/20 p-2 text-[10px] font-mono text-cyan-400 flex items-end">
            [SEKTOR D] Stasiun Pengisian Daya
          </div>
          <div className="p-2 text-[10px] font-mono text-cyan-400 text-right flex items-end justify-end">
            [SEKTOR C] Area Pemilahan / Sorting
          </div>
        </div>

        {/* Subtle grid lines */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(to right, #38bdf8 1px, transparent 1px), linear-gradient(to bottom, #38bdf8 1px, transparent 1px)',
            backgroundSize: '30px 30px'
          }}
        />

        {/* Robots plotted */}
        {robots.map(robot => {
          const leftPercent = Math.min(Math.max((robot.coordinates.x / maxX) * 100, 5), 92);
          const topPercent = Math.min(Math.max((robot.coordinates.y / maxY) * 100, 8), 88);
          const isSelected = selectedRobotId === robot.id;
          const statusCol = getStatusColor(robot.status);

          return (
            <button
              key={robot.id}
              onClick={() => onSelectRobot(robot)}
              style={{ left: `${leftPercent}%`, top: `${topPercent}%` }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 group transition-all duration-300 focus:outline-none z-20 ${
                isSelected ? 'scale-125 z-30' : 'hover:scale-115'
              }`}
              aria-label={`Robot ${robot.id} (${robot.name}), status ${robot.status}, koordinat X:${robot.coordinates.x} Y:${robot.coordinates.y}`}
            >
              {/* Pulse effect if Alert or Active */}
              {(robot.status === 'ALERT' || robot.status === 'ACTIVE') && (
                <span
                  className={`absolute -inset-2 rounded-full animate-ping opacity-60 ${
                    robot.status === 'ALERT' ? 'bg-red-500' : 'bg-emerald-500'
                  }`}
                  aria-hidden="true"
                />
              )}

              {/* Robot Marker Pin */}
              <div
                className={`relative flex items-center justify-center w-8 h-8 rounded-lg border-2 shadow-lg transition-transform ${
                  isSelected
                    ? 'ring-4 ring-cyan-400/50 border-white bg-slate-900'
                    : 'bg-slate-900/90 hover:border-white'
                } ${statusCol}`}
              >
                <span className="font-mono text-[10px] font-black text-white">
                  {robot.id.replace('AGV-', '')}
                </span>
              </div>

              {/* Hover/Selected Tooltip */}
              <div
                className={`absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 whitespace-nowrap bg-slate-900 border border-slate-700 text-white rounded-md px-2 py-1 shadow-xl pointer-events-none transition-opacity text-[11px] ${
                  isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}
              >
                <p className="font-bold text-cyan-300">{robot.id}: {robot.name}</p>
                <div className="flex items-center gap-2 text-[10px] text-slate-300 mt-0.5">
                  <span className="flex items-center gap-0.5">
                    <Battery className="w-2.5 h-2.5 text-emerald-400" />
                    {robot.battery}%
                  </span>
                  <span className="flex items-center gap-0.5">
                    <Gauge className="w-2.5 h-2.5 text-cyan-400" />
                    {robot.speed}m/s
                  </span>
                  <span>({robot.coordinates.x}, {robot.coordinates.y})</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

