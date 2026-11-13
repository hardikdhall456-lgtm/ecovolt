import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Search, 
  SlidersHorizontal, 
  Calculator, 
  X, 
  Check, 
  Info, 
  AlertCircle,
  Zap,
  CheckCircle2,
  Clock,
  HelpCircle
} from 'lucide-react';
import { Appliance, ApplianceCategory, UserSettings } from '../types';
import { 
  calculateMonthlyApplianceKwh, 
  calculateDailyApplianceKwh, 
  calculateApplianceMonthlyCost 
} from '../utils/calculations';

interface AppliancesViewProps {
  appliances: Appliance[];
  settings: UserSettings;
  onAddAppliance: (appliance: Omit<Appliance, 'id'>) => void;
  onUpdateAppliance: (appliance: Appliance) => void;
  onDeleteAppliance: (id: string) => void;
}

const CATEGORIES: ApplianceCategory[] = [
  'HVAC',
  'Refrigeration',
  'Water Heating',
  'Lighting',
  'Entertainment',
  'Kitchen',
  'Laundry',
  'Other',
];

export const AppliancesView: React.FC<AppliancesViewProps> = ({
  appliances,
  settings,
  onAddAppliance,
  onUpdateAppliance,
  onDeleteAppliance,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<ApplianceCategory>('HVAC');
  const [formWatts, setFormWatts] = useState<number>(1000);
  const [formHours, setFormHours] = useState<number>(4.0);
  const [formDays, setFormDays] = useState<number>(30);
  const [formLocation, setFormLocation] = useState<string>('');
  const [formError, setFormError] = useState<string>('');

  // Delete confirmation
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const openAddModal = () => {
    setEditingId(null);
    setFormName('');
    setFormCategory('HVAC');
    setFormWatts(1000);
    setFormHours(4.0);
    setFormDays(30);
    setFormLocation('');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (app: Appliance) => {
    setEditingId(app.id);
    setFormName(app.name);
    setFormCategory(app.category);
    setFormWatts(app.powerWatts);
    setFormHours(app.dailyHours);
    setFormDays(app.operatingDaysPerMonth);
    setFormLocation(app.location || '');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError('Please enter a descriptive appliance name.');
      return;
    }
    if (formWatts <= 0) {
      setFormError('Rated power (Watts) must be greater than 0.');
      return;
    }
    if (formHours <= 0 || formHours > 24) {
      setFormError('Daily usage hours must be between 0.1 and 24 hours.');
      return;
    }
    if (formDays <= 0 || formDays > 31) {
      setFormError('Operating days per month must be between 1 and 31 days.');
      return;
    }

    if (editingId) {
      onUpdateAppliance({
        id: editingId,
        name: formName.trim(),
        category: formCategory,
        powerWatts: Number(formWatts),
        dailyHours: Number(formHours),
        operatingDaysPerMonth: Number(formDays),
        location: formLocation.trim() || undefined,
      });
    } else {
      onAddAppliance({
        name: formName.trim(),
        category: formCategory,
        powerWatts: Number(formWatts),
        dailyHours: Number(formHours),
        operatingDaysPerMonth: Number(formDays),
        location: formLocation.trim() || undefined,
      });
    }
    setIsModalOpen(false);
  };

  // Filtered List
  const filteredList = useMemo(() => {
    return appliances.filter((app) => {
      const matchesSearch =
        app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (app.location && app.location.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory = selectedCategory === 'ALL' || app.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [appliances, searchTerm, selectedCategory]);

  // Aggregates
  const totalSubmeterKwh = useMemo(() => {
    return Number(
      appliances.reduce((sum, a) => sum + calculateMonthlyApplianceKwh(a), 0).toFixed(1)
    );
  }, [appliances]);

  const totalSubmeterCost = useMemo(() => {
    return Number(
      appliances
        .reduce((sum, a) => sum + calculateApplianceMonthlyCost(a, settings.sampleTariffPerKwh), 0)
        .toFixed(2)
    );
  }, [appliances, settings.sampleTariffPerKwh]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-200 gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Appliance Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure device wattage, operational duty cycle, and calculate individual appliance power loads.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-2xs transition"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Appliance</span>
        </button>
      </div>

      {/* Physics Formula Callout & Submeter Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 bg-slate-950 text-slate-200 p-4 rounded-xl border border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-1.5">
                <Calculator className="w-3.5 h-3.5" />
                <span>Electrical Engineering Consumption Formula</span>
              </span>
              <span className="text-[10px] text-slate-400">Deterministic Model</span>
            </div>
            <div className="font-mono text-xs bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-emerald-300">
              Energy (kWh) = [ Power (W) × Daily Hours × Days/Month ] ÷ 1000
            </div>
            <div className="font-mono text-xs bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-teal-300 mt-1.5">
              Cost (₹) = Energy (kWh) × Configured Tariff (₹{settings.sampleTariffPerKwh} / kWh)
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            * Clearly distinguishes theoretical nominal device rating from total measured whole-house load.
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase">Submeter Sum Total</span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {totalSubmeterKwh} <span className="text-xs font-semibold text-slate-500">kWh/month</span>
            </div>
            <div className="text-sm font-bold text-emerald-600 mt-1">
              Est. Cost: ₹{totalSubmeterCost.toLocaleString('en-IN')}
            </div>
          </div>
          <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 flex items-center justify-between">
            <span>Configured Devices:</span>
            <span className="font-bold text-slate-800">{appliances.length} items</span>
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search appliances by name or room location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-900 shadow-2xs"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <SlidersHorizontal className="w-4 h-4 text-slate-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full sm:w-auto bg-white border border-slate-200 text-slate-800 text-xs rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold shadow-2xs"
          >
            <option value="ALL">All Categories ({appliances.length})</option>
            {CATEGORIES.map((cat) => {
              const count = appliances.filter((a) => a.category === cat).length;
              return (
                <option key={cat} value={cat}>
                  {cat} ({count})
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Appliances Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-5 py-3.5">Appliance &amp; Location</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5">Rated Power</th>
                <th className="px-4 py-3.5">Usage Hours</th>
                <th className="px-4 py-3.5">Daily (kWh)</th>
                <th className="px-4 py-3.5">Monthly (kWh)</th>
                <th className="px-4 py-3.5">Est. Monthly Cost</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-slate-400">
                    <p className="font-semibold text-slate-500">No appliances found.</p>
                    <p className="text-[11px] mt-1">Try modifying your search or click "Add New Appliance".</p>
                  </td>
                </tr>
              ) : (
                filteredList.map((app) => {
                  const dailyKwh = calculateDailyApplianceKwh(app);
                  const monthlyKwh = calculateMonthlyApplianceKwh(app);
                  const monthlyCost = calculateApplianceMonthlyCost(app, settings.sampleTariffPerKwh);

                  return (
                    <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-slate-900">{app.name}</div>
                        {app.location && (
                          <span className="text-[10px] text-slate-400 block">{app.location}</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                          {app.category}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-mono font-semibold text-slate-800">
                        {app.powerWatts} W
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-800">{app.dailyHours} hrs / day</div>
                        <span className="text-[10px] text-slate-400">{app.operatingDaysPerMonth} days / mo</span>
                      </td>
                      <td className="px-4 py-3.5 font-mono font-bold text-slate-800">{dailyKwh} kWh</td>
                      <td className="px-4 py-3.5 font-mono font-extrabold text-emerald-600">
                        {monthlyKwh} kWh
                      </td>
                      <td className="px-4 py-3.5 font-bold text-slate-900">
                        ₹{monthlyCost.toFixed(2)}
                      </td>
                      <td className="px-4 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => openEditModal(app)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                          title="Edit appliance parameters"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(app.id)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                          title="Delete appliance"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center space-x-3 text-rose-600">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-slate-900">Confirm Deletion</h3>
            </div>
            <p className="text-xs text-slate-600">
              Are you sure you want to delete this appliance? Its power load and submeter calculations will be removed from your dashboard.
            </p>
            <div className="flex justify-end space-x-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (deleteConfirmId) {
                    onDeleteAppliance(deleteConfirmId);
                    setDeleteConfirmId(null);
                  }
                }}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-2xs"
              >
                Delete Appliance
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Appliance Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full p-6 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingId ? 'Edit Appliance Specification' : 'Add New Appliance'}
                </h3>
                <p className="text-xs text-slate-500">Provide nominal active wattage and daily usage schedule.</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Appliance Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Bedroom Inverter AC, Dishwasher"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as ApplianceCategory)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none font-semibold"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Location / Room (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Kitchen, Living Room"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Rated Power (W)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formWatts}
                    onChange={(e) => setFormWatts(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Active Watts</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Daily Usage (Hours)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.1"
                    max="24"
                    required
                    value={formHours}
                    onChange={(e) => setFormHours(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">0.1 to 24 hrs</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Days / Month</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    required
                    value={formDays}
                    onChange={(e) => setFormDays(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">1 to 31 days</span>
                </div>
              </div>

              {/* Real-time Calculation Preview inside Modal */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                  Dynamic Calculation Preview
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Estimated Monthly Load:</span>
                  <span className="font-bold text-slate-900 font-mono">
                    {((formWatts * formHours * formDays) / 1000).toFixed(2)} kWh
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-200/60">
                  <span className="text-slate-600">Estimated Monthly Cost:</span>
                  <span className="font-bold text-emerald-600 font-mono">
                    ₹{(((formWatts * formHours * formDays) / 1000) * settings.sampleTariffPerKwh).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex justify-end space-x-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-2xs transition"
                >
                  {editingId ? 'Save Appliance Changes' : 'Add Appliance'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
