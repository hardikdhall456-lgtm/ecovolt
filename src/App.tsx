import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardView } from './pages/DashboardView';
import { AnalyticsView } from './pages/AnalyticsView';
import { AppliancesView } from './pages/AppliancesView';
import { BillCalculatorView } from './pages/BillCalculatorView';
import { RecommendationsView } from './pages/RecommendationsView';
import { SettingsView } from './pages/SettingsView';
import { AcademicDocModal } from './components/AcademicDocModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PageType, Appliance, UserSettings, DailyConsumption, HourlyConsumption } from './types';
import { 
  DEFAULT_SETTINGS, 
  INITIAL_APPLIANCES, 
  generate30DaysConsumption, 
  generate24HourProfile 
} from './utils/mockData';

export function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');
  const [isDocModalOpen, setIsDocModalOpen] = useState<boolean>(false);

  // Persistent User Settings
  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const saved = localStorage.getItem('ecovolt_settings');
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Persistent Appliances
  const [appliances, setAppliances] = useState<Appliance[]>(() => {
    try {
      const saved = localStorage.getItem('ecovolt_appliances');
      return saved ? JSON.parse(saved) : INITIAL_APPLIANCES;
    } catch {
      return INITIAL_APPLIANCES;
    }
  });

  // Persistent 30-Day Time-Series Data
  const [dailyData, setDailyData] = useState<DailyConsumption[]>(() => {
    try {
      const saved = localStorage.getItem('ecovolt_daily');
      return saved ? JSON.parse(saved) : generate30DaysConsumption();
    } catch {
      return generate30DaysConsumption();
    }
  });

  // 24-Hour Diurnal Load Profile
  const [hourlyData] = useState<HourlyConsumption[]>(() => generate24HourProfile());

  // Save changes to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('ecovolt_settings', JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings:', e);
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem('ecovolt_appliances', JSON.stringify(appliances));
    } catch (e) {
      console.error('Failed to save appliances:', e);
    }
  }, [appliances]);

  useEffect(() => {
    try {
      localStorage.setItem('ecovolt_daily', JSON.stringify(dailyData));
    } catch (e) {
      console.error('Failed to save daily consumption:', e);
    }
  }, [dailyData]);

  // Appliance Handlers
  const handleAddAppliance = (app: Omit<Appliance, 'id'>) => {
    const newApp: Appliance = {
      ...app,
      id: `app-${Date.now()}`,
    };
    setAppliances((prev) => [newApp, ...prev]);
  };

  const handleUpdateAppliance = (updated: Appliance) => {
    setAppliances((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
  };

  const handleDeleteAppliance = (id: string) => {
    setAppliances((prev) => prev.filter((item) => item.id !== id));
  };

  // Settings Handlers
  const handleUpdateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  // Reset all application data to standard baseline
  const handleResetAllData = () => {
    try {
      localStorage.removeItem('ecovolt_settings');
      localStorage.removeItem('ecovolt_appliances');
      localStorage.removeItem('ecovolt_daily');
    } catch (e) {
      console.error('Reset error:', e);
    }
    setSettings(DEFAULT_SETTINGS);
    setAppliances(INITIAL_APPLIANCES);
    setDailyData(generate30DaysConsumption());
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen overflow-hidden bg-slate-50 font-sans text-slate-900">
      {/* Sidebar Navigation */}
      <Navbar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        openDocModal={() => setIsDocModalOpen(true)}
        householdName={settings.householdName}
      />

      {/* Main Workspace Area */}
      <main className="flex-1 overflow-y-auto overscroll-y-none p-4 md:p-8">
        <div className="max-w-7xl mx-auto pb-12">
          {currentPage === 'dashboard' && (
            <DashboardView
              appliances={appliances}
              dailyData={dailyData}
              hourlyData={hourlyData}
              settings={settings}
              onNavigate={setCurrentPage}
            />
          )}

          {currentPage === 'analytics' && (
            <AnalyticsView
              dailyData={dailyData}
              hourlyData={hourlyData}
              appliances={appliances}
              onResetData={handleResetAllData}
            />
          )}

          {currentPage === 'appliances' && (
            <AppliancesView
              appliances={appliances}
              settings={settings}
              onAddAppliance={handleAddAppliance}
              onUpdateAppliance={handleUpdateAppliance}
              onDeleteAppliance={handleDeleteAppliance}
            />
          )}

          {currentPage === 'bill' && (
            <BillCalculatorView
              dailyData={dailyData}
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
            />
          )}

          {currentPage === 'recommendations' && (
            <RecommendationsView
              appliances={appliances}
              settings={settings}
            />
          )}

          {currentPage === 'settings' && (
            <SettingsView
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              onResetAllData={handleResetAllData}
            />
          )}
        </div>
      </main>

      {/* In-App Academic Viva Documentation Modal */}
      <AcademicDocModal isOpen={isDocModalOpen} onClose={() => setIsDocModalOpen(false)} />

      {/* Offline Connectivity Indicator */}
      <OfflineIndicator />
    </div>
  );
}

export default App;
