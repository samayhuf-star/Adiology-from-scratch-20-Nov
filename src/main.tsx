
  import { createRoot } from "react-dom/client";
  import App from "./App.tsx";
  import "./index.css";
  import { Toaster } from "./components/ui/sonner";
  import { notifications } from "./utils/notifications";
  import { toast } from "sonner";

  // Initialize notification service
  notifications.setToastInstance(toast);

  createRoot(document.getElementById("root")!).render(
    <>
      <App />
      <Toaster position="top-right" richColors closeButton />
    </>
  );
  