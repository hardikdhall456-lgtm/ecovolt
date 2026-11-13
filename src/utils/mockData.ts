import { Appliance, DailyConsumption, HourlyConsumption, RecommendationRule, UserSettings } from '../types';

export const DEFAULT_SETTINGS: UserSettings = {
  householdName: 'Skyline Residency - Flat 402',
  sampleTariffPerKwh: 7.5, // Indian sample domestic tariff rate (₹/kWh)
  fixedMonthlyCharge: 120.0,
  electricityTaxPercent: 5.0,
  co2FactorKgPerKwh: 0.82, // Central Electricity Authority (CEA) standard baseline for Indian grid
  highDailyThresholdKwh: 18.0,
  isTieredTariffEnabled: true,
  currencySymbol: '₹',
};

export const INITIAL_APPLIANCES: Appliance[] = [
  {
    id: 'app-1',
    name: 'Inverter Split AC (1.5 Ton)',
    category: 'HVAC',
    powerWatts: 1500,
    dailyHours: 7.0,
    operatingDaysPerMonth: 30,
    location: 'Master Bedroom',
    isSimulatedBaseline: true,
  },
  {
    id: 'app-2',
    name: 'Frost-Free Refrigerator (340L)',
    category: 'Refrigeration',
    powerWatts: 180,
    dailyHours: 24.0,
    operatingDaysPerMonth: 30,
    location: 'Kitchen',
    isSimulatedBaseline: true,
  },
  {
    id: 'app-3',
    name: 'Electric Storage Geyser (25L)',
    category: 'Water Heating',
    powerWatts: 2000,
    dailyHours: 1.5,
    operatingDaysPerMonth: 30,
    location: 'Main Bathroom',
    isSimulatedBaseline: true,
  },
  {
    id: 'app-4',
    name: 'BLDC Ceiling Fans (x4 Units)',
    category: 'HVAC',
    powerWatts: 140,
    dailyHours: 14.0,
    operatingDaysPerMonth: 30,
    location: 'Bedrooms & Living Room',
    isSimulatedBaseline: true,
  },
  {
    id: 'app-5',
    name: 'Living Room Smart TV (55-inch)',
    category: 'Entertainment',
    powerWatts: 120,
    dailyHours: 5.0,
    operatingDaysPerMonth: 30,
    location: 'Living Area',
    isSimulatedBaseline: true,
  },
  {
    id: 'app-6',
    name: 'LED Home Lighting (12 Fixtures)',
    category: 'Lighting',
    powerWatts: 110,
    dailyHours: 6.5,
    operatingDaysPerMonth: 30,
    location: 'Whole Home',
    isSimulatedBaseline: true,
  },
  {
    id: 'app-7',
    name: 'Front-Load Washing Machine',
    category: 'Laundry',
    powerWatts: 550,
    dailyHours: 1.2,
    operatingDaysPerMonth: 20,
    location: 'Utility Balcony',
    isSimulatedBaseline: true,
  },
  {
    id: 'app-8',
    name: 'Microwave & Induction Cooktop',
    category: 'Kitchen',
    powerWatts: 1300,
    dailyHours: 0.8,
    operatingDaysPerMonth: 28,
    location: 'Kitchen',
    isSimulatedBaseline: true,
  },
];

/**
 * 30-Day continuous realistic sample data with weekends and day-to-day variance
 */
export function generate30DaysConsumption(): DailyConsumption[] {
  const result: DailyConsumption[] = [];
  const today = new Date();

  // 30 days back from today
  const dailyMultipliers = [
    14.2, 13.8, 15.1, 16.5, 17.2, 19.4, 20.1, // Week 1 (weekend jump)
    14.0, 13.5, 14.8, 15.2, 16.9, 18.7, 19.5, // Week 2
    13.9, 14.3, 14.9, 15.4, 16.2, 18.1, 18.9, // Week 3
    14.4, 13.7, 14.5, 15.8, 16.3, 17.8, 18.6, // Week 4
    15.0, 14.6,                                // Days 29, 30
  ];

  for (let i = 29; i >= 0; i--) {
    const curDate = new Date(today);
    curDate.setDate(today.getDate() - i);

    const dateStr = curDate.toISOString().slice(0, 10);
    const dayLabel = curDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });

    const index = 29 - i;
    const currentKwh = dailyMultipliers[index] || 15.2;
    // Previous month was ~7.5% higher
    const prevMonthKwh = Number((currentKwh * 1.08 + ((index % 4) * 0.3 - 0.45)).toFixed(2));

    result.push({
      date: dateStr,
      dayLabel,
      consumptionKwh: Number(currentKwh.toFixed(2)),
      previousMonthKwh: prevMonthKwh,
      peakHour: 19 + (index % 3), // around 7 PM - 9 PM
    });
  }

  return result;
}

/**
 * 24-Hour Diurnal Load Profile for a residential home
 */
export function generate24HourProfile(): HourlyConsumption[] {
  const hours = [
    { hour: '00:00', kwh: 0.34, loadType: 'Off-Peak' as const },
    { hour: '01:00', kwh: 0.31, loadType: 'Off-Peak' as const },
    { hour: '02:00', kwh: 0.29, loadType: 'Off-Peak' as const },
    { hour: '03:00', kwh: 0.28, loadType: 'Off-Peak' as const },
    { hour: '04:00', kwh: 0.30, loadType: 'Off-Peak' as const },
    { hour: '05:00', kwh: 0.45, loadType: 'Off-Peak' as const },
    { hour: '06:00', kwh: 0.95, loadType: 'Base' as const },
    { hour: '07:00', kwh: 1.85, loadType: 'Peak' as const }, // morning heating & kitchen
    { hour: '08:00', kwh: 1.65, loadType: 'Peak' as const },
    { hour: '09:00', kwh: 0.90, loadType: 'Base' as const },
    { hour: '10:00', kwh: 0.55, loadType: 'Base' as const },
    { hour: '11:00', kwh: 0.48, loadType: 'Base' as const },
    { hour: '12:00', kwh: 0.62, loadType: 'Base' as const },
    { hour: '13:00', kwh: 0.92, loadType: 'Base' as const }, // lunch / afternoon
    { hour: '14:00', kwh: 1.15, loadType: 'Base' as const },
    { hour: '15:00', kwh: 0.85, loadType: 'Base' as const },
    { hour: '16:00', kwh: 0.68, loadType: 'Base' as const },
    { hour: '17:00', kwh: 0.78, loadType: 'Base' as const },
    { hour: '18:00', kwh: 1.35, loadType: 'Peak' as const },
    { hour: '19:00', kwh: 2.15, loadType: 'Peak' as const }, // evening prime
    { hour: '20:00', kwh: 2.45, loadType: 'Peak' as const }, // peak concurrent appliances
    { hour: '21:00', kwh: 1.98, loadType: 'Peak' as const },
    { hour: '22:00', kwh: 1.45, loadType: 'Base' as const },
    { hour: '23:00', kwh: 0.65, loadType: 'Off-Peak' as const },
  ];

  return hours.map((h) => ({
    hour: h.hour,
    consumptionKwh: h.kwh,
    loadType: h.loadType,
  }));
}

/**
 * Transparent, rule-based recommendation heuristics
 */
export const RECOMMENDATION_RULES: RecommendationRule[] = [
  {
    id: 'rule-ac-temperature',
    title: 'Adjust AC Thermostat to 24°C & Reduce Run Time by 1.5 Hours',
    applianceCategory: 'HVAC',
    matchingKeywords: ['ac', 'air conditioner', 'split', 'hvac'],
    defaultReductionHours: 1.5,
    explanation:
      'Bureau of Energy Efficiency (BEE) research demonstrates that setting temperature to 24°C rather than 18-20°C reduces compressor power consumption by 6% per degree Celsius while maintaining comfort.',
    assumptions:
      'Modeled by curtailing 1.5 daily compressor hours or equivalent thermal load reduction on 30 operating days per month.',
    priority: 'High',
  },
  {
    id: 'rule-geyser-timer',
    title: 'Install Smart Water Heater Timer (Limit Cycle to 45 mins)',
    applianceCategory: 'Water Heating',
    matchingKeywords: ['geyser', 'water heater', 'boiler'],
    defaultReductionHours: 0.5,
    explanation:
      'Storage water heaters experience passive convective standing loss when active continuously. Pre-heating water only for immediate usage cuts idle cycling.',
    assumptions:
      'Modeled by trimming 30 minutes (0.5 hour) of daily unmonitored resistive element heating.',
    priority: 'High',
  },
  {
    id: 'rule-standby-vampire',
    title: 'Mitigate Vampire Standby Loads on TV & Entertainment Consoles',
    applianceCategory: 'Entertainment',
    matchingKeywords: ['tv', 'television', 'entertainment'],
    defaultReductionHours: 1.0,
    explanation:
      'Smart TVs, set-top boxes, and audio amplifiers draw 10–25W continuous ghost power even in low-power sleep mode.',
    assumptions:
      'Switching off the multi-plug socket at the wall eliminates standby ghost consumption (approximated as 1.0 active hour equivalent).',
    priority: 'Medium',
  },
  {
    id: 'rule-lighting-efficiency',
    title: 'Turn Off Ambient Daytime Lighting & Maximize Natural Daylight',
    applianceCategory: 'Lighting',
    matchingKeywords: ['light', 'bulb', 'downlight', 'lamp'],
    defaultReductionHours: 1.5,
    explanation:
      'Daylight harvesting and turning off redundant fixtures in vacant rooms noticeably shrinks continuous lighting draw.',
    assumptions:
      'Assuming 1.5 fewer hours of operational lighting per day across household fixtures.',
    priority: 'Medium',
  },
  {
    id: 'rule-washing-cold-water',
    title: 'Wash Laundry with Cold Water & Full Machine Loads',
    applianceCategory: 'Laundry',
    matchingKeywords: ['washing', 'washer', 'laundry'],
    defaultReductionHours: 0.3,
    explanation:
      'Up to 75% of washing machine energy is consumed in internal water heating rather than mechanical motor drum agitation.',
    assumptions:
      'Switching to eco-cold cycles reduces equivalent cycle power burden by 25% across monthly operating days.',
    priority: 'Low',
  },
];
