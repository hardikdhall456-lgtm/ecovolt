export type PageType = 
  | 'dashboard' 
  | 'analytics' 
  | 'appliances' 
  | 'bill' 
  | 'recommendations' 
  | 'settings';

export type ApplianceCategory = 
  | 'HVAC' 
  | 'Refrigeration' 
  | 'Water Heating' 
  | 'Lighting' 
  | 'Entertainment' 
  | 'Kitchen' 
  | 'Laundry' 
  | 'Other';

export interface Appliance {
  id: string;
  name: string;
  category: ApplianceCategory;
  powerWatts: number;
  dailyHours: number;
  operatingDaysPerMonth: number;
  location?: string;
  isSimulatedBaseline?: boolean;
}

export interface DailyConsumption {
  date: string;
  dayLabel: string;
  consumptionKwh: number;
  previousMonthKwh: number;
  peakHour: number;
}

export interface HourlyConsumption {
  hour: string; // e.g. '06:00'
  consumptionKwh: number;
  loadType: 'Base' | 'Peak' | 'Off-Peak';
}

export interface UserSettings {
  householdName: string;
  sampleTariffPerKwh: number;
  fixedMonthlyCharge: number;
  electricityTaxPercent: number;
  co2FactorKgPerKwh: number;
  highDailyThresholdKwh: number;
  isTieredTariffEnabled: boolean;
  currencySymbol: string;
}

export interface RecommendationRule {
  id: string;
  title: string;
  applianceCategory: ApplianceCategory;
  matchingKeywords: string[];
  defaultReductionHours: number;
  explanation: string;
  assumptions: string;
  priority: 'High' | 'Medium' | 'Low';
}

export interface SlabBreakdownItem {
  slab: string;
  units: number;
  rate: number;
  cost: number;
}

export interface BillCalculationResult {
  energyCharges: number;
  fixedCharges: number;
  taxCharges: number;
  totalBill: number;
  slabBreakdown?: SlabBreakdownItem[];
}
