import React, { useState } from 'react';
import { 
  Save, 
  RotateCcw, 
  Check, 
  AlertCircle, 
  Leaf, 
  ShieldAlert, 
  Settings2,
  HelpCircle,
  Zap,
  Info
} from 'lucide-react';
import { UserSettings } from '../types';

interface SettingsViewProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  onResetAllData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onResetAllData,
}) => {
  const [householdName, setHouseholdName] = useState(settings.householdName);
  const [sampleTariff, setSampleTariff] = useState(settings.sampleTariffPerKwh);
  const [fixedCharges, setFixedCharges] = useState(settings.fixedMonthlyCharge);
  const [taxPercent, setTaxPercent] = useState(settings.electricityTaxPercent);
  const [co2Factor, setCo2Factor] = useState(settings.co2FactorKgPerKwh);
  const [highThreshold, setHighThreshold] = useState(settings.highDailyThresholdKwh);
  const [tieredTariff, setTieredTariff] = useState(settings.isTieredTariffEnabled);
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      householdName: householdName.trim() || 'Smart Residence',
      sampleTariffPerKwh: Number(sampleTariff),
      fixedMonthlyCharge: Number(fixedCharges),
      electricityTaxPercent: Number(taxPercent),
      co2FactorKgPerKwh: Number(co2Factor),
      highDailyThresholdKwh: Number(highThreshold),
      isTieredTariffEnabled: tieredTariff,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Title */}
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">System Settings &amp; Parameters</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure household metadata, electricity tariff schedules, carbon emissions factors, and alert thresholds.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
        {/* Household Identity */}
        <div>
          <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center space-x-2">
            <Settings2 className="w-4 h-4 text-emerald-600" />
            <span>Household Profile</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Household / Residence Title
              </label>
              <input
                type="text"
                required
                value={householdName}
                onChange={(e) => setHouseholdName(e.target.value)}
                placeholder="e.g. Skyline Residency Villa 402"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Currency Standard
              </label>
              <input
                type="text"
                disabled
                value="Indian Rupee (₹ - INR)"
                className="w-full px-3 py-2 border border-slate-200 bg-slate-50 text-slate-500 rounded-lg text-xs font-semibold cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Electricity Tariff Modeling */}
        <div className="pt-4 border-t border-slate-100">
          <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center space-x-2">
            <Zap className="w-4 h-4 text-emerald-600" />
            <span>Tariff &amp; Utility Billing Configuration</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Base Tariff Rate (₹ / kWh)
              </label>
              <input
                type="number"
                step="0.1"
                min="0.5"
                required
                value={sampleTariff}
                onChange={(e) => setSampleTariff(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Clearly identified as a sample rate rather than an official DISCOM tariff.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Fixed Monthly Charges (₹)
              </label>
              <input
                type="number"
                step="5"
                min="0"
                required
                value={fixedCharges}
                onChange={(e) => setFixedCharges(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Contracted connected load capacity overhead.
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Electricity Duty / Tax (%)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="30"
                required
                value={taxPercent}
                onChange={(e) => setTaxPercent(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                State electricity duty surcharge percentage.
              </span>
            </div>
          </div>

          <div className="mt-3">
            <label className="flex items-center space-x-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={tieredTariff}
                onChange={(e) => setTieredTariff(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
              />
              <span className="text-xs font-bold text-slate-800">
                Default to Tiered / Slab Tariff Model (0-100, 101-300, 300+ units)
              </span>
            </label>
          </div>
        </div>

        {/* Environmental & Anomaly Thresholds */}
        <div className="pt-4 border-t border-slate-100">
          <h2 className="text-sm font-bold text-slate-900 mb-3 flex items-center space-x-2">
            <Leaf className="w-4 h-4 text-emerald-600" />
            <span>Environmental &amp; Anomaly Thresholds</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                CO₂ Emission Factor (kg CO₂ / kWh)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                max="2.5"
                required
                value={co2Factor}
                onChange={(e) => setCo2Factor(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg mt-1 text-[10px] text-slate-500 flex items-start space-x-1.5">
                <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <span>
                  <strong>CEA Benchmark Note:</strong> Standard Central Electricity Authority baseline for the Indian national grid is approximately 0.82 kg CO₂/kWh.
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Daily High Consumption Alert Limit (kWh / Day)
              </label>
              <input
                type="number"
                step="1"
                min="5"
                max="80"
                required
                value={highThreshold}
                onChange={(e) => setHighThreshold(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Triggers visual warning banners across the dashboard when daily average exceeds this threshold.
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          {isSaved ? (
            <div className="flex items-center space-x-1.5 text-xs text-emerald-700 font-bold">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Settings successfully persisted to local storage!</span>
            </div>
          ) : (
            <span />
          )}

          <button
            type="submit"
            className="flex items-center space-x-1.5 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-2xs transition"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>

      {/* Danger Zone: Reset Data */}
      <div className="bg-rose-50/70 border border-rose-200 rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-rose-900 flex items-center space-x-1.5">
              <RotateCcw className="w-4 h-4 text-rose-600" />
              <span>Reset Prototype Data Baseline</span>
            </h3>
            <p className="text-xs text-rose-700 mt-1 max-w-lg">
              Revert appliances list, custom parameters, and settings back to the initial reproducible academic prototype baseline.
            </p>
          </div>
          <button
            type="button"
            onClick={onResetAllData}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-2xs transition shrink-0"
          >
            Reset All Sample Data
          </button>
        </div>
      </div>
    </div>
  );
};
