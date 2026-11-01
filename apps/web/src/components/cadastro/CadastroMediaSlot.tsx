import { useState } from "react";
import { ImageIcon } from "lucide-react";

export type CadastroMediaSlotConfig = {
  /** Caminho público (ex.: /cadastro/vsl-poster.webp) — coloque o arquivo em apps/web/public/… */
  path: string;
  alt: string;
  label: string;
  hint: string;
  /** Sobrescreve `path` quando definido no copy */
  src?: string | null;
  variant?: "wide" | "video" | "portrait" | "footer";
};

export function CadastroMediaSlot({ slot }: { slot: CadastroMediaSlotConfig }) {
  const candidate = (slot.src?.trim() || slot.path).trim();
  const [failed, setFailed] = useState(false);

  const showImage = Boolean(candidate) && !failed;

  return (
    <div
      className={`cadastro-media-slot cadastro-media-slot--${slot.variant ?? "wide"}${showImage ? " cadastro-media-slot--filled" : ""}`}
    >
      {showImage ? (
        <img
          src={candidate}
          alt={slot.alt}
          className="cadastro-media-slot__img"
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="cadastro-media-slot__empty">
          <ImageIcon className="cadastro-media-slot__icon" aria-hidden />
          <p className="cadastro-media-slot__label">{slot.label}</p>
          <p className="cadastro-media-slot__hint">{slot.hint}</p>
          <code className="cadastro-media-slot__path">{slot.path}</code>
        </div>
      )}
    </div>
  );
}
