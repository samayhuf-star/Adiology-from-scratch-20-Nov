
  import { createRoot } from "react-dom/client";
  import App from "./App.tsx";
  import "./index.css";
  import "./styles/themes.css";
  import "./styles/dashboard-theme-modern.css";
  import { Toaster } from "./components/ui/sonner";
  import { notifications } from "./utils/notifications";
  import { toast } from "sonner";
  import { ThemeProvider } from "./contexts/ThemeContext";

  // Initialize notification service
  notifications.setToastInstance(toast);

  // Filter out browser extension service worker errors (harmless)
  if (typeof window !== 'undefined') {
    const originalConsoleError = console.error;
    console.error = (...args: any[]) => {
      // Ignore errors from browser extension service workers
      const errorMessage = args.join(' ');
      if (
        errorMessage.includes('sw.js') ||
        errorMessage.includes('mobx-state-tree') ||
        errorMessage.includes('setDetectedLibs') ||
        (errorMessage.includes('service worker') && errorMessage.includes('extension'))
      ) {
        // Silently ignore these browser extension errors
        return;
      }
      // Log all other errors normally
      originalConsoleError.apply(console, args);
    };

    // Also filter unhandled promise rejections from extensions
    window.addEventListener('unhandledrejection', (event) => {
      const errorMessage = String(event.reason || '');
      if (
        errorMessage.includes('sw.js') ||
        errorMessage.includes('mobx-state-tree') ||
        errorMessage.includes('setDetectedLibs')
      ) {
        event.preventDefault(); // Prevent error from showing in console
      }
    });
  }

  createRoot(document.getElementById("root")!).render(
    <ThemeProvider>
      <App />
      <Toaster position="top-right" richColors closeButton />
    </ThemeProvider>
  );
  