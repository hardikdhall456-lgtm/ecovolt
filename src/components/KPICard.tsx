import React from 'react';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  icon: LucideIcon;
  badge?: {
    text: string;
    isPositive?: boolean;
    isNeutral?: boolean;
  };
  accentColor?: 'emerald' | 'teal' | 'amber' | 'blue' | 'purple' | 'rose';
  tooltip?: string;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  unit,
  subtitle,
  icon: Icon,
  badge,
  accentColor = 'emerald',
  tooltip,
}) => {
  const accentClasses = {
    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    teal: 'text-teal-600 bg-teal-50 border-teal-100',
    amber: 'text-amber-600 bg-amber-50 border-amber-100',
    blue: 'text-blue-600 bg-blue-50 border-blue-100',
    purple: 'text-purple-600 bg-purple-50 border-purple-100',
    rose: 'text-rose-600 bg-rose-50 border-rose-100',
  };

  return (
    <div
      className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
      title={tooltip}
    >
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{title}</span>
          <div className={`p-2.5 rounded-lg border ${accentClasses[accentColor]}`}>
            <Icon className="w-4 h-4" />
          </div>
        </div>

        <div className="flex items-baseline space-x-1.5">
          <span className="text-2xl font-extrabold text-slate-900 tracking-tight">{value}</span>
          {unit && <span className="text-xs font-semibold text-slate-500">{unit}</span>}
        </div>
      </div>

      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
        {subtitle && <span className="text-slate-500 text-[11px] truncate max-w-[150px]">{subtitle}</span>}
        {badge && (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide ${
              badge.isNeutral
                ? 'bg-slate-100 text-slate-700'
                : badge.isPositive
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-rose-100 text-rose-800'
            }`}
          >
            {badge.text}
          </span>
        )}
      </div>
    </div>
  );
};
