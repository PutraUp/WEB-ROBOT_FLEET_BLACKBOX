import React from 'react';
import { AGVRobot } from '../../types';
import { Card, CardHeader, CardContent, CardFooter } from '../common/Card';
import { Badge, BadgeVariant } from '../common/Badge';
import { Button } from '../common/Button';
import { Battery, MapPin, Gauge, Package, Send, History } from 'lucide-react';

export interface RobotCardProps {
  robot: AGVRobot;
  onSendCommand: (robot: AGVRobot) => void;
  onViewLogs: (robot: AGVRobot) => void;
  isSelected?: boolean;
}

export const RobotCard: React.FC<RobotCardProps> = ({
  robot,
  onSendCommand,
  onViewLogs,
  isSelected = false
}) => {
  const getBadgeVariant = (status: AGVRobot['status']): BadgeVariant => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'ALERT':
        return 'danger';
      case 'CHARGING':
        return 'warning';
      case 'IDLE':
        return 'info';
      default:
        return 'neutral';
    }
  };

  const getBatteryColor = (level: number) => {
    if (level < 20) return 'text-red-400 bg-red-950/40 border-red-800';
    if (level < 50) return 'text-amber-400 bg-amber-950/40 border-amber-800';
    return 'text-emerald-400 bg-emerald-950/40 border-emerald-800';
  };

  return (
    <Card
      glow={isSelected}
      className={`border transition-all ${
        isSelected ? 'border-cyan-500 ring-1 ring-cyan-500/50' : 'hover:border-slate-700'
      }`}
    >
      <CardHeader className="flex items-start justify-between pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60">
              {robot.id}
            </span>
            <h4 className="text-base font-bold text-white tracking-tight">{robot.name}</h4>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{robot.model}</p>
        </div>
        <Badge
          variant={getBadgeVariant(robot.status)}
          pulse={robot.status === 'ALERT' || robot.status === 'ACTIVE'}
          size="sm"
        >
          {robot.status}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-3 pt-3 text-xs">
        {/* Mission / Task */}
        <div className="bg-slate-950/60 rounded-lg p-2.5 border border-slate-800">
          <span className="text-[10px] text-slate-500 uppercase font-semibold block">Misi Saat Ini:</span>
          <p className="text-slate-200 font-medium mt-0.5 truncate">{robot.currentTask}</p>
        </div>

        {/* Telemetry Grid */}
        <div className="grid grid-cols-2 gap-2 text-slate-300">
          <div className="flex items-center gap-2 bg-slate-950/40 p-2 rounded border border-slate-800/60">
            <Battery className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
            <div>
              <span className="text-[10px] text-slate-500 block">Daya Baterai</span>
              <span className={`font-mono font-bold ${getBatteryColor(robot.battery)}`}>
                {robot.battery}%
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-950/40 p-2 rounded border border-slate-800/60">
            <Gauge className="w-4 h-4 text-cyan-400 shrink-0" aria-hidden="true" />
            <div>
              <span className="text-[10px] text-slate-500 block">Kecepatan</span>
              <span className="font-mono font-bold text-white">{robot.speed} m/s</span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-950/40 p-2 rounded border border-slate-800/60">
            <MapPin className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
            <div>
              <span className="text-[10px] text-slate-500 block">Koordinat</span>
              <span className="font-mono font-semibold text-slate-200">
                X:{robot.coordinates.x}, Y:{robot.coordinates.y}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-950/40 p-2 rounded border border-slate-800/60">
            <Package className="w-4 h-4 text-purple-400 shrink-0" aria-hidden="true" />
            <div>
              <span className="text-[10px] text-slate-500 block">Muatan Beban</span>
              <span className="font-mono font-semibold text-slate-200">{robot.payloadWeight} kg</span>
            </div>
          </div>
        </div>

        {/* Zone */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
          <span>Zona: <strong className="text-slate-300">{robot.zone}</strong></span>
          <span className="font-mono text-[10px]">Head: {robot.checkpointHead ? robot.checkpointHead.substring(0, 8) + '...' : '-'}</span>
        </div>
      </CardContent>

      <CardFooter className="gap-2">
        <Button
          variant="secondary"
          size="sm"
          className="flex-1 text-xs"
          leftIcon={<Send className="w-3.5 h-3.5" />}
          onClick={() => onSendCommand(robot)}
        >
          Kirim Perintah
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 text-xs"
          leftIcon={<History className="w-3.5 h-3.5" />}
          onClick={() => onViewLogs(robot)}
        >
          Lihat Log Rantai
        </Button>
      </CardFooter>
    </Card>
  );
};

