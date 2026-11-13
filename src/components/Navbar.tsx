import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  BarChart3, 
  Cpu, 
  ReceiptText, 
  Lightbulb, 
  Settings, 
  Menu,
  X
} from 'lucide-react';
import { PageType } from '../types';
import { BrandLogo } from './BrandLogo';
import { PWAInstallButton } from './PWAInstallButton';

interface NavbarProps {
  currentPage: PageType;
  setCurrentPage: (page: PageType) => void;
  openDocModal: () => void;
  householdName: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPage,
  setCurrentPage,
  openDocModal,
  householdName,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems: { id: PageType; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'dashboard', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'analytics', label: 'Energy Analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'appliances', label: 'Appliances', icon: <Cpu className="w-4 h-4" /> },
    { id: 'bill', label: 'Bill Calculator', icon: <ReceiptText className="w-4 h-4" /> },
    { id: 'recommendations', label: 'Smart Recommendations', icon: <Lightbulb className="w-4 h-4" />, badge: '5 Rules' },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  const handleNavClick = (page: PageType) => {
    setCurrentPage(page);
    setMobileOpen(false);
  };

  const navContent = (
    <div className="flex flex-col h-full justify-between">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BrandLogo size="md" />
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-base tracking-tight text-white">EcoVolt</span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Analytics
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate max-w-[140px] mt-0.5">
                {householdName || 'Smart Residence'}
              </p>
            </div>
          </div>
          {/* Mobile close button */}
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className="p-3">
          <div className="text-[10px] font-bold text-slate-400 uppercase px-3 py-2 tracking-wider">
            Analytics Modules
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold shadow-inner'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className={isActive ? 'text-emerald-400' : 'text-slate-400'}>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer / Install */}
      <div className="p-3">
        <div className="px-1">
          <PWAInstallButton variant="sidebar" />
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between bg-slate-950 text-white px-4 py-3 border-b border-slate-800 shrink-0">
        <div className="flex items-center space-x-2.5">
          <BrandLogo size="sm" />
          <div>
            <span className="font-bold text-sm">EcoVolt.ai</span>
            <span className="text-[10px] text-slate-400 block -mt-1">Smart Energy Dashboard</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <PWAInstallButton variant="compact" />
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 text-slate-300 hover:text-white rounded-lg bg-slate-800"
            aria-label="Toggle navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-slate-950 text-slate-300 flex-col shrink-0 border-r border-slate-800/80 h-full select-none z-20">
        {navContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-slate-950 border-r border-slate-800 z-50 h-full">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
};
