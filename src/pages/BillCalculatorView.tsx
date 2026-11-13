import React, { useState } from 'react';
import { 
  IndianRupee, 
  Layers, 
  CheckCircle2, 
  HelpCircle, 
  Sparkles, 
  Save, 
  TrendingUp, 
  TrendingDown,
  Info,
  Sliders,
  RotateCcw
} from 'lucide-react';
import { DailyConsumption, UserSettings } from '../types';
import { calculateBill } from '../utils/calculations';

interface BillCalculatorViewProps {
  dailyData: DailyConsumption[];
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
}

export const BillCalculatorView: React.FC<BillCalculatorViewProps> = ({
  dailyData,
  settings,
  onUpdateSettings,
}) => {
  // Underlying 30-day actual consumption
  const actual30DayKwh = Number(
    dailyData.reduce((acc, curr) => acc + curr.consumptionKwh, 0).toFixed(1)
  );
  const prevMonthKwh = Number(
    dailyData.reduce((acc, curr) => acc + curr.previousMonthKwh, 0).toFixed(1)
  );

  // Projected 30-day run rate (based on last 7 days consumption)
  const last7Days = dailyData.slice(-7);
  const last7DaysAvg = last7Days.reduce((acc, curr) => acc + curr.consumptionKwh, 0) / (last7Days.length || 1);
  const projectedMonthKwh = Number((last7DaysAvg * 30).toFixed(1));

  // Interactive what-if simulation states
  const [testKwh, setTestKwh] = useState<number>(actual30DayKwh);
  const [tariffRate, setTariffRate] = useState<number>(settings.sampleTariffPerKwh);
  const [fixedCharges, setFixedCharges] = useState<number>(settings.fixedMonthlyCharge);
  const [taxPercent, setTaxPercent] = useState<number>(settings.electricityTaxPercent);
  const [tieredEnabled, setTieredEnabled] = useState<boolean>(settings.isTieredTariffEnabled);
  const [savedNotification, setSavedNotification] = useState(false);

  // Active calculation configuration
  const activeConfig: UserSettings = {
    ...settings,
    sampleTariffPerKwh: tariffRate,
    fixedMonthlyCharge: fixedCharges,
    electricityTaxPercent: taxPercent,
    isTieredTariffEnabled: tieredEnabled,
  };

  const calculatedBill = calculateBill(testKwh, activeConfig);
  const previousMonthBill = calculateBill(prevMonthKwh, activeConfig);
  const projectedMonthBill = calculateBill(projectedMonthKwh, activeConfig);

  const billDifference = Number((calculatedBill.totalBill - previousMonthBill.totalBill).toFixed(2));
  const isLowerBill = billDifference <= 0;

  const handleSaveAsDefault = () => {
    onUpdateSettings({
      sampleTariffPerKwh: tariffRate,
      fixedMonthlyCharge: fixedCharges,
      electricityTaxPercent: taxPercent,
      isTieredTariffEnabled: tieredEnabled,
    });
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 2500);
  };

  const resetToActual = () => {
    setTestKwh(actual30DayKwh);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-200 gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Electricity Bill Calculator</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Interactive multi-tier tariff modeling, telescopic slab calculations, fixed overheads, and run-rate projections.
          </p>
        </div>

        {savedNotification && (
          <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-bold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Saved as Household Default!</span>
          </div>
        )}
      </div>

      {/* 3 Summary Projection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Estimated Current Bill */}
        <div className="p-5 rounded-xl bg-slate-950 text-white shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 text-[11px] font-bold uppercase tracking-wider">
              <span>Estimated Current Bill</span>
              <span className="text-emerald-400">At {testKwh} kWh</span>
            </div>
            <div className="text-3xl font-black text-white mt-2">
              ₹{calculatedBill.totalBill.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800 text-xs flex items-center justify-between">
            <span className="text-slate-400">vs Prior Month:</span>
            <span
              className={`font-bold flex items-center space-x-1 ${
                isLowerBill ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {isLowerBill ? <TrendingDown className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
              <span>
                {isLowerBill ? `-₹${Math.abs(billDifference)}` : `+₹${Math.abs(billDifference)}`}
              </span>
            </span>
          </div>
        </div>

        {/* Projected Month-End */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="text-slate-500 text-[11px] font-bold uppercase tracking-wider flex items-center justify-between">
              <span>Projected Month-End</span>
              <span className="text-amber-600">7-Day Run Rate</span>
            </div>
            <div className="text-2xl font-black text-slate-900 mt-2">
              ₹{projectedMonthBill.totalBill.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
            Based on recent {last7DaysAvg.toFixed(1)} kWh/day consumption trajectory ({projectedMonthKwh} kWh full month).
          </div>
        </div>

        {/* Previous Month Baseline */}
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">
              Previous Month Baseline
            </div>
            <div className="text-2xl font-black text-slate-700 mt-2">
              ₹{previousMonthBill.totalBill.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
            Historical benchmark recorded for {prevMonthKwh} kWh total consumption.
          </div>
        </div>
      </div>

      {/* Main Grid: Parameters on Left, Transparent Detailed Breakdown on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tariff & Consumption Configuration */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">Tariff &amp; Load Parameters</h2>
            <button
              onClick={handleSaveAsDefault}
              className="flex items-center space-x-1 text-xs bg-slate-900 hover:bg-slate-800 text-white font-semibold px-2.5 py-1.5 rounded-lg transition"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Set as Default</span>
            </button>
          </div>

          {/* Monthly Consumption Slider */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700">Simulated Consumption (kWh)</label>
              <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {testKwh} kWh
              </span>
            </div>
            <input
              type="range"
              min="20"
              max="1000"
              step="5"
              value={testKwh}
              onChange={(e) => setTestKwh(parseFloat(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1">
              <span>Min: 20 kWh</span>
              <button
                type="button"
                onClick={resetToActual}
                className="text-emerald-700 hover:underline font-semibold flex items-center space-x-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset to 30D Actual ({actual30DayKwh} kWh)</span>
              </button>
              <span>Max: 1000 kWh</span>
            </div>
          </div>

          {/* Base Tariff Rate */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Base Electricity Tariff (₹ / kWh)
            </label>
            <input
              type="number"
              step="0.25"
              min="0.5"
              value={tariffRate}
              onChange={(e) => setTariffRate(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              Sample domestic benchmark rate (configured in INR)
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Fixed Charges (₹/mo)</label>
              <input
                type="number"
                step="5"
                min="0"
                value={fixedCharges}
                onChange={(e) => setFixedCharges(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">Meter demand charge</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Electricity Duty (%)</label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="30"
                value={taxPercent}
                onChange={(e) => setTaxPercent(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">State cess / duty</span>
            </div>
          </div>

          {/* Multi-Tier / Slab Checkbox */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <label className="flex items-center space-x-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={tieredEnabled}
                onChange={(e) => setTieredEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
              />
              <span className="text-xs font-bold text-slate-800">
                Enable Tiered / Slab Tariff Model
              </span>
            </label>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              When enabled, energy is billed telescopically:
              <br />• 0 – 100 kWh: 1.00x Base (₹{tariffRate}/kWh)
              <br />• 101 – 300 kWh: 1.30x Base (₹{(tariffRate * 1.3).toFixed(2)}/kWh)
              <br />• Above 300 kWh: 1.65x Base (₹{(tariffRate * 1.65).toFixed(2)}/kWh)
            </p>
          </div>
        </div>

        {/* Transparent Bill Calculation Breakdown Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900">Step-by-Step Bill Breakdown</h2>
                <p className="text-xs text-slate-500">
                  Completely transparent calculations without hidden adjustments
                </p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded bg-slate-100 text-slate-700">
                {tieredEnabled ? 'Telescopic Slabs' : 'Flat Rate'}
              </span>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden mt-3">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Billing Head</th>
                    <th className="px-4 py-3">Formula / Units Applied</th>
                    <th className="px-4 py-3 text-right">Computed Cost</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {tieredEnabled && calculatedBill.slabBreakdown ? (
                    calculatedBill.slabBreakdown.map((item, idx) => (
                      <tr key={idx} className="bg-emerald-50/30 hover:bg-emerald-50/50">
                        <td className="px-4 py-3 font-semibold text-slate-900">{item.slab}</td>
                        <td className="px-4 py-3 text-slate-500 font-mono">
                          {item.units} units × ₹{item.rate.toFixed(2)} / kWh
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                          ₹{item.cost.toFixed(2)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="px-4 py-3 font-semibold text-slate-900">Flat Energy Charges</td>
                      <td className="px-4 py-3 text-slate-500 font-mono">
                        {testKwh} units × ₹{tariffRate.toFixed(2)} / kWh
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                        ₹{calculatedBill.energyCharges.toFixed(2)}
                      </td>
                    </tr>
                  )}

                  <tr>
                    <td className="px-4 py-3 font-semibold text-slate-900">Subtotal Energy Cost</td>
                    <td className="px-4 py-3 text-slate-500">Sum of energy consumption charges</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                      ₹{calculatedBill.energyCharges.toFixed(2)}
                    </td>
                  </tr>

                  <tr>
                    <td className="px-4 py-3 font-semibold text-slate-900">Fixed Monthly Demand Overhead</td>
                    <td className="px-4 py-3 text-slate-500">Contracted electrical load connection charge</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                      ₹{calculatedBill.fixedCharges.toFixed(2)}
                    </td>
                  </tr>

                  <tr>
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      Electricity Duty / Tax ({taxPercent}%)
                    </td>
                    <td className="px-4 py-3 text-slate-500 font-mono">
                      {taxPercent}% on (₹{calculatedBill.energyCharges.toFixed(2)} + ₹{calculatedBill.fixedCharges.toFixed(2)})
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                      ₹{calculatedBill.taxCharges.toFixed(2)}
                    </td>
                  </tr>

                  <tr className="bg-slate-950 text-white font-extrabold text-sm">
                    <td className="px-4 py-3.5" colSpan={2}>
                      Grand Total Bill (Payable)
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-emerald-400">
                      ₹{calculatedBill.totalBill.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Academic Tariff Disclaimer */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 mt-4 flex items-start space-x-2 text-[11px] text-slate-500">
              <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <strong>Tariff Rate Identification:</strong> The tariff baseline is configured as a representative
                sample domestic schedule (₹{tariffRate}/kWh) for academic evaluation, rather than an official state DISCOM schedule.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
