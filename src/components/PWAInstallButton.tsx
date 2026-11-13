import React, { useState } from 'react';
import { Download, Smartphone, Share, PlusSquare, X, MonitorSmartphone } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { BrandLogo } from './BrandLogo';

interface PWAInstallButtonProps {
  variant?: 'sidebar' | 'compact';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ variant = 'sidebar' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);

  // Suppress completely if already running as an installed standalone PWA
  if (isInstalled) {
    return null;
  }

  const handleClick = async () => {
    if (isInstallable) {
      await install();
      return;
    }
    // For iOS Safari or browsers where native beforeinstallprompt hasn't fired (e.g., iframe preview)
    setShowGuideModal(true);
  };

  return (
    <>
      {variant === 'compact' ? (
        <button
          onClick={handleClick}
          className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-sm transition"
          title="Install EcoVolt App"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Install</span>
        </button>
      ) : (
        <button
          onClick={handleClick}
          className="w-full flex items-center justify-center space-x-2 py-2.5 px-3 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 text-xs font-extrabold rounded-lg shadow-md shadow-emerald-500/15 transition cursor-pointer"
        >
          <Download className="w-4 h-4 shrink-0" />
          <span>{isIOS ? 'Install on iOS' : 'Install App'}</span>
        </button>
      )}

      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-4">
          <div className="bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <BrandLogo size="md" />
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Install EcoVolt App</h3>
                  <p className="text-xs text-slate-500">Add to your phone or desktop home screen</p>
                </div>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
                aria-label="Close install guide"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isIOS ? (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 text-xs text-slate-700">
                <div className="flex items-start space-x-2.5">
                  <Share className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <p>
                    1. Tap the <strong>Share</strong> button in the Safari browser toolbar.
                  </p>
                </div>
                <div className="flex items-start space-x-2.5">
                  <PlusSquare className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <p>
                    2. Scroll down and select <strong>Add to Home Screen</strong>.
                  </p>
                </div>
                <div className="flex items-start space-x-2.5">
                  <Smartphone className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <p>
                    3. Tap <strong>Add</strong> to launch EcoVolt as a standalone app with the <strong>E</strong> icon.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 text-xs text-slate-700">
                <div className="flex items-start space-x-2.5">
                  <MonitorSmartphone className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <p>
                    If you are viewing inside an embedded preview frame, open the app URL directly in a standalone{' '}
                    <strong>Chrome, Edge, or Android browser tab</strong> first.
                  </p>
                </div>
                <div className="flex items-start space-x-2.5">
                  <Download className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <p>
                    Click the <strong>Install icon</strong> in the browser address bar (or open the browser menu{' '}
                    <strong>⋮ → Install EcoVolt</strong> / <strong>Add to Home Screen</strong>).
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={() => setShowGuideModal(false)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  );
};
