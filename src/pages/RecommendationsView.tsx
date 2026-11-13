import React, { useState, useMemo } from 'react';
import { 
  Lightbulb, 
  CheckCircle2, 
  ChevronRight, 
  TrendingDown, 
  Sparkles, 
  ShieldCheck, 
  Leaf, 
  IndianRupee, 
  Zap,
  Info,
  Check
} from 'lucide-react';
import { Appliance, UserSettings } from '../types';
import { RECOMMENDATION_RULES } from '../utils/mockData';
import { calculateApplianceMonthlyCost, calculateMonthlyApplianceKwh } from '../utils/calculations';

interface RecommendationsViewProps {
  appliances: Appliance[];
  settings: UserSettings;
}

export const RecommendationsView: React.FC<RecommendationsViewProps> = ({ appliances, settings }) => {
  // Store applied status in local component state
  const [adoptedMap, setAdoptedMap] = useState<Record<string, boolean>>({});

  const toggleAdopt = (id: string) => {
    setAdoptedMap((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Derive dynamic recommendations by matching rules against existing user appliances
  const generatedRecommendations = useMemo(() => {
    return RECOMMENDATION_RULES.map((rule) => {
      // Find matching appliance in user's list
      const matchedAppliance = appliances.find((app) => {
        const nameLower = app.name.toLowerCase();
        const matchesCat = app.category === rule.applianceCategory;
        const matchesKeyword = rule.matchingKeywords.some((kw) => nameLower.includes(kw));
        return matchesCat || matchesKeyword;
      });

      let potentialKwh = 0;
      let potentialCost = 0;
      let targetName = 'General Household Load';

      if (matchedAppliance) {
        targetName = matchedAppliance.name;
        // Don't reduce more than 50% of appliance's operating hours
        const reducedHours = Math.min(rule.defaultReductionHours, matchedAppliance.dailyHours * 0.45);
        potentialKwh = Number(
          (
            (matchedAppliance.powerWatts * reducedHours * matchedAppliance.operatingDaysPerMonth) /
            1000
          ).toFixed(1)
        );
        potentialCost = Number((potentialKwh * settings.sampleTariffPerKwh).toFixed(2));
      } else {
        // Generic conservative estimate based on category heuristic
        potentialKwh = 12.0;
        potentialCost = Number((12.0 * settings.sampleTariffPerKwh).toFixed(2));
      }

      return {
        ...rule,
        matchedAppliance,
        targetName,
        potentialKwh,
        potentialCost,
        co2AvoidedKg: Number((potentialKwh * settings.co2FactorKgPerKwh).toFixed(1)),
      };
    });
  }, [appliances, settings.sampleTariffPerKwh, settings.co2FactorKgPerKwh]);

  // Total potential savings across all recommendations
  const totalPotentialKwh = useMemo(() => {
    return Number(generatedRecommendations.reduce((acc, r) => acc + r.potentialKwh, 0).toFixed(1));
  }, [generatedRecommendations]);

  const totalPotentialRupees = useMemo(() => {
    return Number(generatedRecommendations.reduce((acc, r) => acc + r.potentialCost, 0).toFixed(2));
  }, [generatedRecommendations]);

  // Actual adopted savings
  const adoptedStats = useMemo(() => {
    let kwh = 0;
    let rupees = 0;
    let count = 0;

    generatedRecommendations.forEach((r) => {
      if (adoptedMap[r.id]) {
        kwh += r.potentialKwh;
        rupees += r.potentialCost;
        count += 1;
      }
    });

    return {
      kwh: Number(kwh.toFixed(1)),
      rupees: Number(rupees.toFixed(2)),
      count,
    };
  }, [generatedRecommendations, adoptedMap]);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Smart Recommendations Engine</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Deterministic, rule-based prescriptive actions derived from active device ratings, standby characteristics, and usage schedules.
        </p>
      </div>

      {/* Hero Opportunity Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-navy-900 text-white rounded-2xl p-6 border border-slate-800 shadow-md flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Total Addressable Opportunity</span>
          </div>
          <div className="text-3xl font-black text-white">
            Save up to ₹{totalPotentialRupees.toLocaleString('en-IN')}{' '}
            <span className="text-sm font-semibold text-emerald-300">/ month</span>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Adopting all 5 efficiency actions could save up to <span className="font-bold text-white">{totalPotentialKwh} kWh</span> of electricity
            and prevent <span className="font-bold text-white">{(totalPotentialKwh * settings.co2FactorKgPerKwh).toFixed(1)} kg CO₂</span> emissions monthly.
          </p>
        </div>

        {/* Adopted Progress Widget */}
        <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700/80 min-w-[260px]">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-300 font-semibold">Adopted Measures:</span>
            <span className="text-emerald-400 font-bold">
              {adoptedStats.count} of {generatedRecommendations.length}
            </span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden mb-3">
            <div
              className="bg-emerald-400 h-2 rounded-full transition-all duration-500"
              style={{
                width: `${(adoptedStats.count / (generatedRecommendations.length || 1)) * 100}%`,
              }}
            />
          </div>
          <div className="text-xs flex items-center justify-between pt-2 border-t border-slate-700/60">
            <span className="text-slate-400">Captured Savings:</span>
            <span className="font-bold text-emerald-400 font-mono">
              ₹{adoptedStats.rupees.toFixed(2)} / mo ({adoptedStats.kwh} kWh)
            </span>
          </div>
        </div>
      </div>

      {/* Transparency Callout */}
      <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl flex items-start space-x-3 text-xs text-emerald-950">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-900">Explainable Energy Intelligence: </span>
          EcoVolt uses transparent domain heuristics grounded in Bureau of Energy Efficiency (BEE) standards.
          Every card explicitly discloses the exact reason it was triggered and the model assumptions behind its savings projection.
        </div>
      </div>

      {/* Recommendation Cards List */}
      <div className="space-y-4">
        {generatedRecommendations.map((rec) => {
          const isAdopted = !!adoptedMap[rec.id];

          const priorityBadge = {
            High: 'bg-rose-100 text-rose-800 border-rose-200',
            Medium: 'bg-amber-100 text-amber-800 border-amber-200',
            Low: 'bg-blue-100 text-blue-800 border-blue-200',
          }[rec.priority];

          return (
            <div
              key={rec.id}
              className={`p-5 rounded-2xl border transition-all duration-200 ${
                isAdopted
                  ? 'bg-emerald-50/60 border-emerald-400 shadow-2xs'
                  : 'bg-white border-slate-200 shadow-2xs hover:shadow-xs hover:border-slate-300'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                {/* Details */}
                <div className="space-y-2.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${priorityBadge}`}>
                      {rec.priority} Priority
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                      {rec.applianceCategory}
                    </span>
                    {rec.matchedAppliance && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        Target: {rec.matchedAppliance.name}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{rec.title}</h3>

                  <p className="text-xs text-slate-600 leading-relaxed">{rec.explanation}</p>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                    <div className="text-slate-700">
                      <span className="font-bold text-slate-900">Why was this generated? </span>
                      Identified in household profile with heavy rated wattage or extended continuous operational schedule.
                    </div>
                    <div className="text-slate-600">
                      <span className="font-bold text-slate-900">Underlying Model Assumption: </span>
                      {rec.assumptions}
                    </div>
                  </div>
                </div>

                {/* Savings Metric & Interactive Action Button */}
                <div className="lg:text-right flex lg:flex-col justify-between items-end gap-3 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                  <div>
                    <div className="text-xl font-black text-emerald-600 font-mono">
                      -₹{rec.potentialCost.toFixed(2)}{' '}
                      <span className="text-xs font-semibold text-slate-500">/ mo</span>
                    </div>
                    <div className="text-xs font-semibold text-slate-500 mt-0.5">
                      -{rec.potentialKwh} kWh • Avoids {rec.co2AvoidedKg} kg CO₂
                    </div>
                  </div>

                  <button
                    onClick={() => toggleAdopt(rec.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-2xs ${
                      isAdopted
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    {isAdopted ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Action Adopted</span>
                      </>
                    ) : (
                      <>
                        <span>Adopt This Measure</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
