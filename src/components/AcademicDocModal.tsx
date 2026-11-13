import React, { useState } from 'react';
import { 
  X, 
  BookOpen, 
  CheckCircle2, 
  FileCode, 
  Cpu, 
  Calculator, 
  Layers, 
  Download,
  AlertCircle
} from 'lucide-react';

interface AcademicDocModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AcademicDocModal: React.FC<AcademicDocModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'formulas' | 'architecture' | 'evaluation'>('overview');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in duration-150">
        {/* Modal Top Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-base text-white">MCA Final-Year Capstone Project Specification</h2>
              <p className="text-xs text-slate-400">
                EcoVolt: Smart Home Energy Consumption Analytics & Cost Optimization System
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3 border-b-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-emerald-600 text-emerald-700 bg-white font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Project Abstract & Scope
          </button>
          <button
            onClick={() => setActiveTab('formulas')}
            className={`py-3 px-3 border-b-2 transition-colors ${
              activeTab === 'formulas'
                ? 'border-emerald-600 text-emerald-700 bg-white font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Mathematical Formulas
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`py-3 px-3 border-b-2 transition-colors ${
              activeTab === 'architecture'
                ? 'border-emerald-600 text-emerald-700 bg-white font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Architecture & Modules
          </button>
          <button
            onClick={() => setActiveTab('evaluation')}
            className={`py-3 px-3 border-b-2 transition-colors ${
              activeTab === 'evaluation'
                ? 'border-emerald-600 text-emerald-700 bg-white font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Methodology & viva notes
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-700 leading-relaxed">
          {activeTab === 'overview' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-1.5">
                  1. Project Abstract
                </h3>
                <p className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-slate-700 text-xs leading-relaxed">
                  The <strong>Smart Home Energy Consumption Analytics Dashboard (EcoVolt)</strong> is a comprehensive
                  academic decision-support platform designed to monitor, analyze, and optimize domestic electrical power
                  consumption. The system models submetering physics for typical home appliances, calculates multi-tier
                  electricity bills, computes equivalent greenhouse gas emissions (kg CO₂), detects peak diurnal demand
                  spikes, and delivers transparent, rule-based prescriptive actions to mitigate electrical wastage.
                </p>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-1.5">
                  2. Problem Statement
                </h3>
                <p className="text-xs text-slate-600">
                  Residential electricity consumers face high monthly utility bills with zero visibility into individual
                  appliance consumption profiles or peak demand periods. Conventional meters display only a single cumulative
                  kWh reading without explaining which appliances generate excessive load, when phantom standby losses occur,
                  or how tariff slab boundaries elevate unit costs.
                </p>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-2">
                  3. Key Project Objectives
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-2xs flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Submetering Simulation:</strong> Derive appliance-level consumption via rated wattage and operational schedules.</span>
                  </div>
                  <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-2xs flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Multi-Tier Bill Modeling:</strong> Accurately calculate electricity bills with configurable slab thresholds, fixed charges, and duty taxes.</span>
                  </div>
                  <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-2xs flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Carbon Accounting:</strong> Convert kilowatt-hour usage into CO₂ equivalent kilograms using Central Electricity Authority grid factors.</span>
                  </div>
                  <div className="p-3 bg-white border border-slate-200 rounded-lg shadow-2xs flex items-start space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Prescriptive Optimization:</strong> Rule-based heuristic engine with quantified rupee (₹) and kWh energy savings.</span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 flex items-start space-x-3 text-xs text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Academic Prototype Disclosure:</strong> This project functions as an academic prototype utilizing reproducible,
                  statistically modeled residential time-series data. In industrial IoT installations, real-time telemetry would ingest
                  from CT clamps or smart meters via MQTT/Modbus protocols.
                </div>
              </div>
            </div>
          )}

          {activeTab === 'formulas' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-1">
                Deterministic Mathematical Engine
              </h3>
              <p className="text-xs text-slate-600">
                All metrics, charts, and recommendations in EcoVolt are dynamically computed using standard electrical
                engineering and statistical equations.
              </p>

              <div className="space-y-3 text-xs font-mono">
                <div className="p-3.5 bg-slate-900 text-slate-100 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-emerald-400 font-sans uppercase font-bold block mb-1">
                    1. Appliance Electrical Consumption (kWh)
                  </span>
                  <div className="text-emerald-300 font-bold">
                    E_appliance (kWh) = [ Power_rated (Watts) × Hours_daily × Days_month ] ÷ 1000
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans mt-1">
                    Converts rated active power into kilowatt-hours over the monthly operating cycle.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-900 text-slate-100 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-teal-400 font-sans uppercase font-bold block mb-1">
                    2. Electricity Tariff & Slab Calculation
                  </span>
                  <div className="text-teal-300 font-bold">
                    Bill_total = Σ( Units_slab_i × Rate_slab_i ) + Fixed_charges + [ (Energy_charges + Fixed) × Duty% ]
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans mt-1">
                    Standard residential telescopic tariff: Slab 1 (0-100 kWh), Slab 2 (101-300 kWh at 1.30x), Slab 3 (&gt;300 kWh at 1.65x).
                  </p>
                </div>

                <div className="p-3.5 bg-slate-900 text-slate-100 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-amber-400 font-sans uppercase font-bold block mb-1">
                    3. Carbon Footprint (kg CO₂ Equivalent)
                  </span>
                  <div className="text-amber-300 font-bold">
                    Emissions (kg CO₂) = Total_Energy (kWh) × Grid_Emission_Factor (0.82 kg CO₂/kWh)
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans mt-1">
                    Standard Indian electrical grid weighted emission factor based on thermal/renewable generation baseline.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-900 text-slate-100 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-purple-400 font-sans uppercase font-bold block mb-1">
                    4. Linear Least-Squares Trend Forecasting
                  </span>
                  <div className="text-purple-300 font-bold">
                    y = mx + b, where m = [ nΣ(xy) - ΣxΣy ] ÷ [ nΣ(x²) - (Σx)² ]
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans mt-1">
                    Computes slope and intercept over the past N days to extrapolate projected daily demand for the coming week.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'architecture' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-1">
                System Architecture & Technology Stack
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <h4 className="font-bold text-slate-900 mb-1">Frontend UI Layer</h4>
                  <ul className="text-slate-600 space-y-1 list-disc list-inside">
                    <li>React with TypeScript</li>
                    <li>Tailwind CSS v4 (SaaS palette)</li>
                    <li>Lucide React iconography</li>
                    <li>Responsive drawer & mobile view</li>
                  </ul>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <h4 className="font-bold text-slate-900 mb-1">Data Visualization</h4>
                  <ul className="text-slate-600 space-y-1 list-disc list-inside">
                    <li>Recharts Interactive Engine</li>
                    <li>Area & Line Charts (Trends)</li>
                    <li>Donut Charts (Category share)</li>
                    <li>Bar Charts (Diurnal hourly load)</li>
                  </ul>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <h4 className="font-bold text-slate-900 mb-1">State & Persistence</h4>
                  <ul className="text-slate-600 space-y-1 list-disc list-inside">
                    <li>HTML5 Web Storage (localStorage)</li>
                    <li>Synchronous schema validation</li>
                    <li>Client-side CSV exporter</li>
                    <li>Default state fallback mechanism</li>
                  </ul>
                </div>
              </div>

              <div className="p-4 bg-slate-900 text-slate-200 rounded-xl font-mono text-xs">
                <div className="text-emerald-400 font-bold mb-2">// Data Flow Pipeline</div>
                <div className="text-slate-300">
                  [Appliance Specs] + [Usage Hours] ──&gt; (Formula Engine) ──&gt; [Submeter kWh &amp; Cost] <br />
                  [Time-Series Ingest] ──&gt; [Aggregation Core] ──&gt; [KPI Cards + Recharts Series] <br />
                  [Total kWh] + [Tariff Settings] ──&gt; (Telescopic Slab Engine) ──&gt; [Estimated Bill Breakdown] <br />
                  [Appliance Profile] ──&gt; (Rule Matching Heuristics) ──&gt; [Prescriptive Savings Action]
                </div>
              </div>
            </div>
          )}

          {activeTab === 'evaluation' && (
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-700 mb-1">
                MCA Viva Examination Defense Notes
              </h3>

              <div className="space-y-3 text-xs">
                <div className="border border-slate-200 rounded-xl p-3 bg-white">
                  <span className="font-bold text-slate-900 block">Q1: How do you differentiate estimated appliance usage from actual consumption?</span>
                  <p className="text-slate-600 mt-1">
                    The total energy consumption represents the continuous whole-house meter reading (inclusive of unmonitored baseline loads,
                    refrigerator cycling, and standby power). The appliance management page calculates theoretical nominal consumption from rated
                    wattage. This transparently illustrates that submetered appliances account for the majority, but not 100%, of household draw.
                  </p>
                </div>

                <div className="border border-slate-200 rounded-xl p-3 bg-white">
                  <span className="font-bold text-slate-900 block">Q2: Why use rule-based recommendations instead of black-box ML?</span>
                  <p className="text-slate-600 mt-1">
                    Rule-based heuristics are fully explainable, deterministic, and verify domain-specific physical principles (e.g., BEE thermal
                    coefficients for AC compressors, convective loss in water geysers). Every recommendation shows exact underlying assumptions
                    and savings derivation rather than unverified machine-learning estimates.
                  </p>
                </div>

                <div className="border border-slate-200 rounded-xl p-3 bg-white">
                  <span className="font-bold text-slate-900 block">Q3: How is data preserved across sessions?</span>
                  <p className="text-slate-600 mt-1">
                    All user adjustments—including new appliances, edits, deletions, custom tariffs, and alert thresholds—are serialized into
                    browser local storage (`localStorage`) with immediate fallback to reproducible seed data if cleared.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Action */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-medium">
            MCA 2026 Academic Capstone Project Demonstration
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition"
          >
            Close Documentation
          </button>
        </div>
      </div>
    </div>
  );
};
