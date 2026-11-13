import React, { useState, useMemo } from 'react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Download, 
  SlidersHorizontal, 
  Info, 
  Sparkles, 
  RotateCcw, 
  Calendar, 
  TrendingUp,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { Appliance, DailyConsumption, HourlyConsumption } from '../types';
import { calculateLinearForecast, calculateMonthlyApplianceKwh } from '../utils/calculations';

interface AnalyticsViewProps {
  dailyData: DailyConsumption[];
  hourlyData: HourlyConsumption[];
  appliances: Appliance[];
  onResetData: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  dailyData,
  hourlyData,
  appliances,
  onResetData,
}) => {
  const [dateRange, setDateRange] = useState<'7' | '14' | '30'>('30');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [showForecast, setShowForecast] = useState<boolean>(true);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Filtered dataset according to selected window
  const filteredDaily = useMemo(() => {
    const count = parseInt(dateRange, 10);
    return dailyData.slice(-count);
  }, [dailyData, dateRange]);

  // Statistics for the selected window
  const windowTotalKwh = useMemo(() => {
    return Number(filteredDaily.reduce((acc, curr) => acc + curr.consumptionKwh, 0).toFixed(1));
  }, [filteredDaily]);

  const windowPrevKwh = useMemo(() => {
    return Number(filteredDaily.reduce((acc, curr) => acc + curr.previousMonthKwh, 0).toFixed(1));
  }, [filteredDaily]);

  const windowDailyAvg = useMemo(() => {
    return Number((windowTotalKwh / (filteredDaily.length || 1)).toFixed(2));
  }, [windowTotalKwh, filteredDaily]);

  const windowVariance = useMemo(() => {
    if (windowPrevKwh === 0) return 0;
    return Number((((windowPrevKwh - windowTotalKwh) / windowPrevKwh) * 100).toFixed(1));
  }, [windowTotalKwh, windowPrevKwh]);

  // Least-Squares Linear Regression Forecast
  const forecastSeries = useMemo(() => {
    if (!showForecast) return [];
    return calculateLinearForecast(filteredDaily, 7);
  }, [filteredDaily, showForecast]);

  // Unified chart array merging actuals and forecast points
  const combinedTrendData = useMemo(() => {
    const historical = filteredDaily.map((d) => ({
      dateLabel: d.dayLabel,
      actualKwh: d.consumptionKwh,
      previousMonthKwh: d.previousMonthKwh,
      forecastKwh: null as number | null,
    }));

    if (!showForecast || forecastSeries.length === 0) {
      return historical;
    }

    // Connect the last historical point to the forecast line for continuous visualization
    const lastHist = historical[historical.length - 1];
    if (lastHist) {
      lastHist.forecastKwh = lastHist.actualKwh;
    }

    const forecasted = forecastSeries.map((f) => ({
      dateLabel: f.dayLabel,
      actualKwh: null as number | null,
      previousMonthKwh: null as number | null,
      forecastKwh: f.consumptionKwh,
    }));

    return [...historical, ...forecasted];
  }, [filteredDaily, forecastSeries, showForecast]);

  // Filtered and sorted appliances
  const filteredAppliances = useMemo(() => {
    let list = appliances;
    if (selectedCategory !== 'ALL') {
      list = list.filter((a) => a.category === selectedCategory);
    }
    return [...list].sort((a, b) => {
      const kwhA = calculateMonthlyApplianceKwh(a);
      const kwhB = calculateMonthlyApplianceKwh(b);
      return sortOrder === 'desc' ? kwhB - kwhA : kwhA - kwhB;
    });
  }, [appliances, selectedCategory, sortOrder]);

  const applianceBarData = filteredAppliances.map((app) => ({
    name: app.name.length > 20 ? app.name.slice(0, 18) + '…' : app.name,
    monthlyKwh: calculateMonthlyApplianceKwh(app),
    powerWatts: app.powerWatts,
    dailyHours: app.dailyHours,
  }));

  // CSV Data Exporter
  const handleExportCSV = () => {
    const headers = [
      'Date',
      'Day_Label',
      'Current_Consumption_kWh',
      'Previous_Month_kWh',
      'Peak_Hour_24H',
      'Variance_Percentage',
    ];

    const rows = filteredDaily.map((d) => {
      const variance = Number(
        (((d.previousMonthKwh - d.consumptionKwh) / d.previousMonthKwh) * 100).toFixed(1)
      );
      return [
        d.date,
        `"${d.dayLabel}"`,
        d.consumptionKwh,
        d.previousMonthKwh,
        `${d.peakHour}:00`,
        `${variance}%`,
      ];
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', encodedUri);
    downloadAnchor.setAttribute(
      'download',
      `EcoVolt_Energy_Analytics_${dateRange}Days_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
  };

  const categories = ['ALL', ...Array.from(new Set(appliances.map((a) => a.category)))];

  return (
    <div className="space-y-6">
      {/* Page Header and Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Energy Analytics</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Historical time-series analysis, period comparisons, appliance sub-allocations, and regression forecasting.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Date Range Selector */}
          <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1 text-xs shadow-2xs">
            <button
              onClick={() => setDateRange('7')}
              className={`px-3 py-1.5 rounded-md font-semibold transition ${
                dateRange === '7' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Past 7 Days
            </button>
            <button
              onClick={() => setDateRange('14')}
              className={`px-3 py-1.5 rounded-md font-semibold transition ${
                dateRange === '14' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              14 Days
            </button>
            <button
              onClick={() => setDateRange('30')}
              className={`px-3 py-1.5 rounded-md font-semibold transition ${
                dateRange === '30' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Full 30 Days
            </button>
          </div>

          {/* Forecasting Switch */}
          <button
            onClick={() => setShowForecast(!showForecast)}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg border text-xs font-bold transition shadow-2xs ${
              showForecast
                ? 'bg-amber-50 text-amber-800 border-amber-300'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>{showForecast ? 'Forecast Active (+7D)' : 'Enable Forecast'}</span>
          </button>

          {/* CSV Export */}
          <button
            onClick={handleExportCSV}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-2xs transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          {/* Reset Demo Data button */}
          <button
            onClick={onResetData}
            title="Reset to default reproducible academic baseline"
            className="p-2 bg-white hover:bg-slate-100 text-slate-500 rounded-lg border border-slate-200 shadow-2xs transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Window Summary Metric Badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Window Total</span>
          <div className="text-xl font-extrabold text-slate-900 mt-0.5">{windowTotalKwh} kWh</div>
          <span className="text-[10px] text-slate-400">For selected {dateRange} days</span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Daily Average</span>
          <div className="text-xl font-extrabold text-slate-900 mt-0.5">{windowDailyAvg} kWh/day</div>
          <span className="text-[10px] text-slate-400">Mean consumption</span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Prior Period Delta</span>
          <div
            className={`text-xl font-extrabold mt-0.5 ${
              windowVariance >= 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {windowVariance >= 0 ? `-${windowVariance}%` : `+${Math.abs(windowVariance)}%`}
          </div>
          <span className="text-[10px] text-slate-400">vs same days last month</span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase">Projected 7D Trajectory</span>
          <div className="text-xl font-extrabold text-amber-600 mt-0.5">
            {forecastSeries.length > 0
              ? `${(forecastSeries.reduce((s, c) => s + c.consumptionKwh, 0) / 7).toFixed(1)} kWh/d`
              : 'N/A'}
          </div>
          <span className="text-[10px] text-slate-400">Linear regression model</span>
        </div>
      </div>

      {/* Main Comparative Trend Chart */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Comparative Daily Trend: Current vs. Previous Month ({dateRange} Days)
            </h2>
            <p className="text-xs text-slate-500">
              Correlating day-to-day energy draw with prior month baseline and linear projection
            </p>
          </div>

          {showForecast && (
            <div className="flex items-center space-x-1.5 text-xs text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Extrapolating next 7 days via Least-Squares fit</span>
            </div>
          )}
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={combinedTrendData} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="dateLabel" tick={{ fontSize: 10, fill: '#64748B' }} minTickGap={20} />
              <YAxis tick={{ fontSize: 10, fill: '#64748B' }} unit=" kWh" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '12px',
                  border: 'none',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Line
                name="Current Period (kWh)"
                type="monotone"
                dataKey="actualKwh"
                stroke="#10B981"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#10B981' }}
                activeDot={{ r: 6 }}
              />
              <Line
                name="Previous Month (kWh)"
                type="monotone"
                dataKey="previousMonthKwh"
                stroke="#94A3B8"
                strokeWidth={1.8}
                strokeDasharray="4 4"
                dot={false}
              />
              {showForecast && (
                <Line
                  name="7-Day Linear Forecast (kWh)"
                  type="monotone"
                  dataKey="forecastKwh"
                  stroke="#F59E0B"
                  strokeWidth={2}
                  strokeDasharray="3 3"
                  dot={{ r: 3, fill: '#F59E0B' }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Appliance-Wise Consumption Bar Chart */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">Appliance-Wise Energy Distribution</h2>
            <p className="text-xs text-slate-500">
              Calculated consumption per appliance based on active power rating and runtime schedule
            </p>
          </div>

          <div className="flex items-center space-x-3 text-xs">
            <div className="flex items-center space-x-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-50 border border-slate-300 text-slate-800 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat === 'ALL' ? 'All Categories' : cat}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold transition"
            >
              Sort: {sortOrder === 'desc' ? 'Highest First' : 'Lowest First'}
            </button>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={applianceBarData} margin={{ top: 10, right: 10, left: -10, bottom: 35 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="name" angle={-25} textAnchor="end" tick={{ fontSize: 10, fill: '#64748B' }} />
              <YAxis tick={{ fontSize: 10, fill: '#64748B' }} unit=" kWh" />
              <Tooltip
                formatter={(val: any) => [`${val} kWh / month`, 'Appliance Submetering']}
                contentStyle={{
                  backgroundColor: '#0F172A',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '12px',
                  border: 'none',
                }}
              />
              <Bar dataKey="monthlyKwh" fill="#0EA5E9" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Academic Methodology Callout */}
      <div className="p-4 bg-slate-100 rounded-xl border border-slate-200 flex items-start space-x-3 text-xs text-slate-600">
        <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-800">Forecasting Methodology: </span>
          The 7-day predictive series is derived using ordinary least-squares (OLS) linear regression on the selected time window:
          <span className="font-mono font-semibold ml-1 text-slate-800">y = mx + b</span>. The forecast highlights trend momentum
          without fabricating imaginary external sensor readings.
        </div>
      </div>
    </div>
  );
};
