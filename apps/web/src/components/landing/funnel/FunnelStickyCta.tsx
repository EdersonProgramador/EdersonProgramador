import { LAUNCH_FUNNEL_COPY } from "@ederson-agencia/shared";
import { useLeadCaptureOptional } from "../lead-capture-context";

export function FunnelStickyCta() {
  const capture = useLeadCaptureOptional();
  if (!capture) return null;
  return (
    <div className="funnel-sticky-cta">
      <button type="button" className="btn-primary btn-primary--urgent w-full" onClick={() => capture.openCapture()}>
        {LAUNCH_FUNNEL_COPY.stickyCta}
      </button>
    </div>
  );
}
