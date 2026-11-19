import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { LeadCaptureModal } from "./LeadCaptureModal";

export type LeadCapturePackageTier = "essential" | "professional" | "advanced";

type LeadCaptureContextValue = {
  openCapture: (opts?: { packageTier?: LeadCapturePackageTier; campaign?: string }) => void;
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
  const [campaign, setCampaign] = useState<string | undefined>();

  const openCapture = useCallback((opts?: { packageTier?: LeadCapturePackageTier; campaign?: string }) => {
    setTier(opts?.packageTier);
    setCampaign(opts?.campaign);
    setOpen(true);
  }, []);

  const value = useMemo(() => ({ openCapture }), [openCapture]);

  return (
    <LeadCaptureContext.Provider value={value}>
      {children}
      <LeadCaptureModal
        open={open}
        onClose={() => setOpen(false)}
        packageTier={tier}
        campaign={campaign}
      />
    </LeadCaptureContext.Provider>
  );
}
