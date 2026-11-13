import React from 'react';
import { 
  Zap, 
  IndianRupee, 
  Calendar, 
  TrendingDown, 
  TrendingUp,
  Leaf, 
  AlertTriangle, 
  Flame, 
  Award, 
  Clock, 
  ArrowUpRight,
  Lightbulb,
  ShieldAlert,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import { KPICard } from '../components/KPICard';
import { Appliance, DailyConsumption, HourlyConsumption, PageType, UserSettings } from '../types';
import { 
  calculateBill, 
  calculateEnergyEfficiencyScore, 
  calculateMonthlyApplianceKwh 
} from '../utils/calculations';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

interface DashboardViewProps {
  appliances: Appliance[];
  dailyData: DailyConsumption[];
  hourlyData: HourlyConsumption[];
  settings: UserSettings;
  onNavigate: (page: PageType) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  appliances,
  dailyData,
  hourlyData,
  settings,
  onNavigate,
}) => {
  // Underlying 30-day aggregate calculations
  const totalMonthKwh = Number(
    dailyData.reduce((acc, curr) => acc + curr.consumptionKwh, 0).toFixed(1)
  );
  const prevMonthKwh = Number(
    dailyData.reduce((acc, curr) => acc + curr.previousMonthKwh, 0).toFixed(1)
  );
  const daysCount = dailyData.length || 1;
  const avgDailyKwh = Number((totalMonthKwh / daysCount).toFixed(2));

  // Percentage difference vs previous month
  const deltaPercent = Number((((prevMonthKwh - totalMonthKwh) / prevMonthKwh) * 100).toFixed(1));
  const isSaving = deltaPercent >= 0;

  // Bill & Carbon footprint
  const billMetrics = calculateBill(totalMonthKwh, settings);
  const carbonEmissionsKg = Number((totalMonthKwh * settings.co2FactorKgPerKwh).toFixed(1));

  // Top consuming appliance
  const sortedAppliances = [...appliances].sort(
    (a, b) => calculateMonthlyApplianceKwh(b) - calculateMonthlyApplianceKwh(a)
  );
  const topAppliance = sortedAppliances[0];
  const topApplianceKwh = topAppliance ? calculateMonthlyApplianceKwh(topAppliance) : 0;
  const topApplianceShare = totalMonthKwh > 0 ? Math.round((topApplianceKwh / totalMonthKwh) * 100) : 0;

  // Peak period detection from 24-hr load curve
  const peakHour = [...hourlyData].sort((a, b) => b.consumptionKwh - a.consumptionKwh)[0];

  // Category grouping for Donut Chart
  const categoryMap = appliances.reduce<Record<string, number>>((acc, app) => {
    const kwh = calculateMonthlyApplianceKwh(app);
    acc[app.category] = (acc[app.category] || 0) + kwh;
    return acc;
  }, {});

  const pieData = Object.entries(categoryMap).map(([name, value]) => ({
    name,
    value: Number(value.toFixed(1)),
  }));

  const DONUT_COLORS = ['#10B981', '#06B6D4', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#64748B', '#14B8A6'];

  // Energy Efficiency Score calculation
  const efficiency = calculateEnergyEfficiencyScore(
    avgDailyKwh,
    settings.highDailyThresholdKwh,
    deltaPercent
  );

  // Check if threshold is breached
  const isThresholdBreached = avgDailyKwh > settings.highDailyThresholdKwh;

  return (
    <div className="space-y-6">
      {/* Top Welcome & Context Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-slate-200 gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Overview Dashboard</h1>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              Live Analysis
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Household telemetry &amp; consumption breakdown for{' '}
            <span className="font-semibold text-slate-800">{settings.householdName}</span>
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => onNavigate('analytics')}
            className="flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg shadow-2xs transition"
          >
            <span>Detailed Charts</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onNavigate('bill')}
            className="flex items-center space-x-1 px-3 py-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg shadow-2xs transition"
          >
            <IndianRupee className="w-3.5 h-3.5" />
            <span>Bill Simulator</span>
          </button>
        </div>
      </div>

      {/* Threshold Alert Banner (if exceeded) */}
      {isThresholdBreached ? (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-3 text-rose-900">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <span className="font-bold text-sm block">Consumption Anomaly Detected!</span>
            Current daily average of <span className="font-bold">{avgDailyKwh} kWh/day</span> exceeds your configured threshold of{' '}
            <span className="font-bold">{settings.highDailyThresholdKwh} kWh/day</span>. Review heavy loads such as{' '}
            {topAppliance?.name} or modify limits in Settings.
          </div>
          <button
            onClick={() => onNavigate('recommendations')}
            className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shrink-0 transition"
          >
            View Actions
          </button>
        </div>
      ) : (
        <div className="p-3 bg-emerald-50/80 border border-emerald-200/80 rounded-xl flex items-center justify-between text-xs text-emerald-900">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Budget Healthy:</strong> Daily average consumption ({avgDailyKwh} kWh) is safely below the{' '}
              {settings.highDailyThresholdKwh} kWh target limit.
            </span>
          </div>
          <button
            onClick={() => onNavigate('settings')}
            className="text-emerald-700 hover:underline font-semibold text-[11px]"
          >
            Edit Threshold
          </button>
        </div>
      )}

      {/* 5 Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard
          title="Total Energy (30D)"
          value={totalMonthKwh}
          unit="kWh"
          subtitle="Whole-house load"
          icon={Zap}
          accentColor="emerald"
        />
        <KPICard
          title="Estimated Bill"
          value={`₹${billMetrics.totalBill.toLocaleString('en-IN')}`}
          subtitle={`Tariff: ₹${settings.sampleTariffPerKwh}/unit`}
          icon={IndianRupee}
          accentColor="teal"
        />
        <KPICard
          title="Daily Average"
          value={avgDailyKwh}
          unit="kWh/day"
          subtitle={`Budget: ${settings.highDailyThresholdKwh} kWh`}
          icon={Calendar}
          accentColor="blue"
        />
        <KPICard
          title="Period Comparison"
          value={`${Math.abs(deltaPercent)}%`}
          subtitle="vs Previous month"
          icon={isSaving ? TrendingDown : TrendingUp}
          badge={{
            text: isSaving ? `${deltaPercent}% Lower` : `${Math.abs(deltaPercent)}% Higher`,
            isPositive: isSaving,
          }}
          accentColor={isSaving ? 'emerald' : 'rose'}
        />
        <KPICard
          title="Carbon Footprint"
          value={carbonEmissionsKg}
          unit="kg CO₂"
          subtitle={`Factor: ${settings.co2FactorKgPerKwh} kg/unit`}
          icon={Leaf}
          accentColor="purple"
        />
      </div>

      {/* Smart Insights Strip: 4 Diagnostic Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Efficiency Score Gauge */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-navy-900 text-white p-4 rounded-xl border border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Efficiency Score
            </span>
            <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-md border border-emerald-500/30">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2 flex items-baseline space-x-2">
            <span className="text-3xl font-black text-white">{efficiency.score}</span>
            <span className="text-xs text-slate-400">/ 100</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-slate-800 ${efficiency.color}`}>
              {efficiency.label}
            </span>
          </div>
          <div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-400 h-1.5 rounded-full transition-all duration-700"
                style={{ width: `${efficiency.score}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5">
              Derived from baseline threshold comparison and monthly conservation delta.
            </p>
          </div>
        </div>

        {/* Highest Consuming Appliance */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Top Energy Consumer
            </span>
            <div className="p-1.5 bg-rose-50 text-rose-600 rounded-md border border-rose-100">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-base font-extrabold text-slate-900 truncate" title={topAppliance?.name}>
              {topAppliance?.name || 'Air Conditioner'}
            </div>
            <div className="text-xs font-semibold text-rose-600 mt-0.5">
              {topApplianceKwh} kWh <span className="text-slate-400 font-normal">({topApplianceShare}% of home load)</span>
            </div>
          </div>
          <button
            onClick={() => onNavigate('appliances')}
            className="text-[11px] text-slate-500 hover:text-emerald-600 font-semibold flex items-center space-x-1"
          >
            <span>Manage appliances</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>

        {/* Peak Demand Period */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Peak Demand Window
            </span>
            <div className="p-1.5 bg-amber-50 text-amber-600 rounded-md border border-amber-100">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-lg font-extrabold text-slate-900">
              {peakHour?.hour || '20:00'} – {parseInt(peakHour?.hour || '20', 10) + 1}:00
            </div>
            <div className="text-xs font-semibold text-amber-600 mt-0.5">
              Draws ~{peakHour?.consumptionKwh || 2.45} kWh / hour
            </div>
          </div>
          <p className="text-[10px] text-slate-400">
            Concurrence of cooking, lighting, and HVAC compressor loads.
          </p>
        </div>

        {/* Savings Opportunities */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Savings Potential
            </span>
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-md border border-emerald-100">
              <Lightbulb className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-lg font-extrabold text-emerald-600">Up to ₹480 / mo</div>
            <div className="text-xs text-slate-500 mt-0.5">5 Prescriptive rules available</div>
          </div>
          <button
            onClick={() => onNavigate('recommendations')}
            className="text-[11px] text-emerald-700 hover:text-emerald-800 font-bold flex items-center space-x-1"
          >
            <span>Review suggestions</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Main Charts: Daily Trend (2 cols) + Appliance Category Donut (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Electricity Consumption Line/Area Chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
            <div>
              <h2 className="text-base font-bold text-slate-900">30-Day Daily Consumption Curve</h2>
              <p className="text-xs text-slate-500">Historical electricity usage recorded in kilowatt-hours (kWh)</p>
            </div>
            <div className="flex items-center space-x-3 text-xs">
              <span className="flex items-center space-x-1.5 text-slate-600 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span>Current Month</span>
              </span>
              <span className="flex items-center space-x-1.5 text-slate-400 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span>
                <span>Prev Month</span>
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="dashboardAreaKwh" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="dayLabel" tick={{ fontSize: 10, fill: '#64748B' }} minTickGap={25} />
                <YAxis tick={{ fontSize: 10, fill: '#64748B' }} unit=" kWh" />
                <Tooltip
                  formatter={(val: any) => [`${val} kWh`, 'Daily Consumption']}
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                    border: 'none',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="consumptionKwh"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#dashboardAreaKwh)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart: Appliance Category Distribution */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Category Distribution</h2>
            <p className="text-xs text-slate-500">Proportional energy share by appliance category</p>
          </div>

          <div className="h-52 w-full flex items-center justify-center my-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`${val} kWh`, 'Total']}
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                    border: 'none',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[11px] pt-3 border-t border-slate-100">
            {pieData.slice(0, 6).map((entry, idx) => (
              <div key={entry.name} className="flex items-center space-x-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: DONUT_COLORS[idx % DONUT_COLORS.length] }}
                />
                <span className="text-slate-600 truncate">{entry.name}</span>
                <span className="font-bold text-slate-900 ml-auto">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hourly Diurnal Load Profile Strip */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900">24-Hour Diurnal Load Profile</h2>
            <p className="text-xs text-slate-500">
              Reveals continuous overnight vampire standby load versus active morning/evening surges
            </p>
          </div>
          <div className="flex items-center space-x-2 text-xs">
            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-medium">Off-Peak (00-05h)</span>
            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded font-medium">Peak (18-22h)</span>
          </div>
        </div>

        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hourlyData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#64748B' }} interval={2} />
              <YAxis tick={{ fontSize: 10, fill: '#64748B' }} unit=" kWh" />
              <Tooltip
                formatter={(val: any) => [`${val} kWh`, 'Hourly Load']}
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '12px',
                  border: 'none',
                }}
              />
              <Bar dataKey="consumptionKwh" fill="#0D9488" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
