import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { LeadCaptureModal } from "./LeadCaptureModal";

export type LeadCapturePackageTier = "essential" | "professional" | "advanced";

type LeadCaptureContextValue = {
  openCapture: (opts?: { packageTier?: LeadCapturePackageTier }) => void;
};

const LeadCaptureContext = createContext<LeadCaptureContextValue | null>(null);

export function useLeadCapture() {
  const ctx = useContext(LeadCaptureContext);
  if (!ctx) throw new Error("useLeadCapture must be used within LeadCaptureProvider");
  return ctx;
}

export function useLeadCaptureOptional() {
  return useContext(LeadCaptureContext);
}

export function LeadCaptureProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [tier, setTier] = useState<LeadCapturePackageTier | undefined>();

  const openCapture = useCallback((opts?: { packageTier?: LeadCapturePackageTier }) => {
    setTier(opts?.packageTier);
    setOpen(true);
  }, []);

  const value = useMemo(() => ({ openCapture }), [openCapture]);

  return (
    <LeadCaptureContext.Provider value={value}>
      {children}
      <LeadCaptureModal open={open} onClose={() => setOpen(false)} packageTier={tier} />
    </LeadCaptureContext.Provider>
  );
}
