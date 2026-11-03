import { useEffect, useId, type ReactNode } from "react";
import { X } from "lucide-react";

type AgencyAdminModalProps = {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
};

export function AgencyAdminModal({
  open,
  title,
  description,
  onClose,
  children,
  footer
}: AgencyAdminModalProps) {
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="agency-admin-modal" role="presentation" onMouseDown={onClose}>
      <div
        className="agency-admin-modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <header className="agency-admin-modal__head">
          <div className="min-w-0 pr-8">
            <h2 id={titleId} className="agency-admin-modal__title">
              {title}
            </h2>
            {description ? (
              <p id={descId} className="agency-admin-modal__desc">
                {description}
              </p>
            ) : null}
          </div>
          <button type="button" className="agency-admin-modal__close" onClick={onClose} aria-label="Fechar">
            <X className="h-4 w-4" aria-hidden />
          </button>
        </header>
        <div className="agency-admin-modal__body">{children}</div>
        {footer ? <footer className="agency-admin-modal__foot">{footer}</footer> : null}
      </div>
    </div>
  );
}
