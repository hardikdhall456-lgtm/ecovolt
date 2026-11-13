import { Appliance, BillCalculationResult, DailyConsumption, SlabBreakdownItem, UserSettings } from '../types';

/**
 * Formula: Energy (kWh) = Power (W) × Usage Hours ÷ 1000
 */
export function calculateDailyApplianceKwh(appliance: Appliance): number {
  return Number(((appliance.powerWatts * appliance.dailyHours) / 1000).toFixed(2));
}

/**
 * Formula: Energy (kWh) = Power (W) × Usage Hours × Operating Days ÷ 1000
 */
export function calculateMonthlyApplianceKwh(appliance: Appliance): number {
  return Number(
    ((appliance.powerWatts * appliance.dailyHours * appliance.operatingDaysPerMonth) / 1000).toFixed(2)
  );
}

/**
 * Calculate appliance cost using estimated consumption multiplied by the electricity tariff
 */
export function calculateApplianceMonthlyCost(appliance: Appliance, tariffPerKwh: number): number {
  const kwh = calculateMonthlyApplianceKwh(appliance);
  return Number((kwh * tariffPerKwh).toFixed(2));
}

/**
 * Electricity bill calculation supporting both flat rate and standard multi-tier slab models
 */
export function calculateBill(kwh: number, settings: UserSettings): BillCalculationResult {
  const { sampleTariffPerKwh, fixedMonthlyCharge, electricityTaxPercent, isTieredTariffEnabled } = settings;

  let energyCharges = 0;
  const slabBreakdown: SlabBreakdownItem[] = [];

  if (!isTieredTariffEnabled) {
    energyCharges = kwh * sampleTariffPerKwh;
  } else {
    let remaining = Math.max(0, kwh);

    // Slab 1: 0 - 100 units
    const slab1Units = Math.min(remaining, 100);
    const slab1Cost = slab1Units * sampleTariffPerKwh;
    slabBreakdown.push({
      slab: 'Slab 1 (0 – 100 units)',
      units: Number(slab1Units.toFixed(1)),
      rate: Number(sampleTariffPerKwh.toFixed(2)),
      cost: Number(slab1Cost.toFixed(2)),
    });
    remaining -= slab1Units;

    // Slab 2: 101 - 300 units (next 200 units)
    if (remaining > 0) {
      const slab2Units = Math.min(remaining, 200);
      const slab2Rate = Number((sampleTariffPerKwh * 1.3).toFixed(2));
      const slab2Cost = slab2Units * slab2Rate;
      slabBreakdown.push({
        slab: 'Slab 2 (101 – 300 units)',
        units: Number(slab2Units.toFixed(1)),
        rate: slab2Rate,
        cost: Number(slab2Cost.toFixed(2)),
      });
      remaining -= slab2Units;
    }

    // Slab 3: Above 300 units
    if (remaining > 0) {
      const slab3Rate = Number((sampleTariffPerKwh * 1.65).toFixed(2));
      const slab3Cost = remaining * slab3Rate;
      slabBreakdown.push({
        slab: 'Slab 3 (Above 300 units)',
        units: Number(remaining.toFixed(1)),
        rate: slab3Rate,
        cost: Number(slab3Cost.toFixed(2)),
      });
    }

    energyCharges = slabBreakdown.reduce((sum, item) => sum + item.cost, 0);
  }

  const baseTaxableAmount = energyCharges + fixedMonthlyCharge;
  const taxCharges = baseTaxableAmount * (electricityTaxPercent / 100);
  const totalBill = energyCharges + fixedMonthlyCharge + taxCharges;

  return {
    energyCharges: Number(energyCharges.toFixed(2)),
    fixedCharges: Number(fixedMonthlyCharge.toFixed(2)),
    taxCharges: Number(taxCharges.toFixed(2)),
    totalBill: Number(totalBill.toFixed(2)),
    slabBreakdown: isTieredTariffEnabled ? slabBreakdown : undefined,
  };
}

/**
 * Linear least-squares regression forecast for next n days
 * y = mx + b
 */
export function calculateLinearForecast(
  data: DailyConsumption[],
  forecastDays: number = 7
): { date: string; dayLabel: string; consumptionKwh: number; isForecast: boolean }[] {
  if (data.length < 2) return [];

  const n = data.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  data.forEach((pt, i) => {
    sumX += i;
    sumY += pt.consumptionKwh;
    sumXY += i * pt.consumptionKwh;
    sumXX += i * i;
  });

  const denominator = n * sumXX - sumX * sumX;
  const slope = denominator === 0 ? 0 : (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;

  const lastItem = data[data.length - 1];
  const lastDate = new Date(lastItem.date);
  const forecast: { date: string; dayLabel: string; consumptionKwh: number; isForecast: boolean }[] = [];

  for (let i = 1; i <= forecastDays; i++) {
    const nextDate = new Date(lastDate);
    nextDate.setDate(lastDate.getDate() + i);

    // Clamp value to reasonable positive residential bounds
    const predictedVal = Math.max(1.0, Number((slope * (n - 1 + i) + intercept).toFixed(2)));
    const dateStr = nextDate.toISOString().slice(0, 10);
    const dayLabel = nextDate.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });

    forecast.push({
      date: dateStr,
      dayLabel: `(Est) ${dayLabel}`,
      consumptionKwh: predictedVal,
      isForecast: true,
    });
  }

  return forecast;
}

/**
 * Computes an Energy Efficiency Score (0 to 100)
 */
export function calculateEnergyEfficiencyScore(
  avgDailyKwh: number,
  thresholdKwh: number,
  savedPercent: number
): { score: number; label: string; color: string } {
  // Baseline score based on usage vs threshold
  // If avgDailyKwh is half the threshold, high score. If exceeding threshold, low score.
  let score = 80;

  if (thresholdKwh > 0) {
    const usageRatio = avgDailyKwh / thresholdKwh;
    if (usageRatio <= 0.6) {
      score = 92;
    } else if (usageRatio <= 0.8) {
      score = 84;
    } else if (usageRatio <= 1.0) {
      score = 72;
    } else if (usageRatio <= 1.2) {
      score = 58;
    } else {
      score = 42;
    }
  }

  // Bonus/penalty for reduction compared to previous month
  if (savedPercent > 0) {
    score = Math.min(100, score + Math.min(12, Math.round(savedPercent * 0.8)));
  } else {
    score = Math.max(20, score - Math.min(15, Math.round(Math.abs(savedPercent) * 0.6)));
  }

  let label = 'Fair';
  let color = 'text-amber-600';

  if (score >= 85) {
    label = 'Excellent';
    color = 'text-emerald-500';
  } else if (score >= 70) {
    label = 'Good';
    color = 'text-teal-500';
  } else if (score >= 50) {
    label = 'Moderate';
    color = 'text-amber-500';
  } else {
    label = 'High Wastage';
    color = 'text-rose-500';
  }

  return { score, label, color };
}
