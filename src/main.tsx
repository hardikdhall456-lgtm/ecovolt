import { createRoot } from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App.tsx';
import './index.css';

registerSW({ immediate: true });

// Prevent pull-to-refresh reload in mobile browser / installed PWA mode
let touchStartY = 0;

document.addEventListener(
  'touchstart',
  function (e) {
    if (e.touches.length === 1) {
      touchStartY = e.touches[0].clientY;
    }
  },
  { passive: true }
);

document.addEventListener(
  'touchmove',
  function (e) {
    if (window.scrollY === 0) {
      const target = e.target as HTMLElement | null;
      const scrollableParent = target?.closest('main, .overflow-y-auto');
      const currentY = e.touches[0]?.clientY ?? 0;
      const isPullingDown = currentY > touchStartY;

      if (!scrollableParent) {
        e.preventDefault();
      } else if (scrollableParent.scrollTop === 0 && isPullingDown) {
        e.preventDefault();
      }
    }
  },
  { passive: false }
);

createRoot(document.getElementById('root')!).render(<App />);
