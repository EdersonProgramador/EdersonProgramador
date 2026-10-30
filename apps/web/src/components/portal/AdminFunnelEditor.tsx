import { useEffect, useState } from "react";
import {
  AGENCY_FUNNEL_COPY,
  PACKAGE_TIER_IDS,
  type PackageTierId
} from "@ederson-agencia/shared";
import { apiGet, apiPatch } from "../../api";

type FunnelConfigRow = {
  livePublished: boolean;
  liveTitle: string;
  liveSubtitle: string | null;
  liveScheduledAt: string | null;
  liveStreamUrl: string | null;
  liveReplayUrl: string | null;
  packagesJson: Record<string, unknown> | null;
  contractIntro: string | null;
  contractClausesJson: string[] | null;
  checkoutTitle: string | null;
  checkoutBody: string | null;
  checkoutPixKey: string | null;
};

type TierForm = {
  enabled: boolean;
  name: string;
  tagline: string;
  priceReais: string;
  bullets: string;
};

function tierFormFromJson(packagesJson: Record<string, unknown> | null, id: PackageTierId): TierForm {
  const o = (packagesJson?.[id] ?? {}) as Record<string, unknown>;
  const cents = typeof o.totalValueCents === "number" ? o.totalValueCents : null;
  return {
    enabled: o.enabled !== false,
    name: typeof o.name === "string" ? o.name : "",
    tagline: typeof o.tagline === "string" ? o.tagline : "",
    priceReais: cents != null ? String(cents / 100) : "",
    bullets: Array.isArray(o.bullets) ? (o.bullets as string[]).join("\n") : ""
  };
}

export function AdminFunnelEditor() {
  const ui = AGENCY_FUNNEL_COPY.admin;
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [livePublished, setLivePublished] = useState(false);
  const [liveTitle, setLiveTitle] = useState("");
  const [liveSubtitle, setLiveSubtitle] = useState("");
  const [liveScheduledAt, setLiveScheduledAt] = useState("");
  const [liveStreamUrl, setLiveStreamUrl] = useState("");
  const [liveReplayUrl, setLiveReplayUrl] = useState("");
  const [contractIntro, setContractIntro] = useState("");
  const [contractClauses, setContractClauses] = useState("");
  const [checkoutTitle, setCheckoutTitle] = useState("");
  const [checkoutBody, setCheckoutBody] = useState("");
  const [checkoutPixKey, setCheckoutPixKey] = useState("");
  const [tiers, setTiers] = useState<Record<PackageTierId, TierForm>>({
    essential: tierFormFromJson(null, "essential"),
    professional: tierFormFromJson(null, "professional"),
    advanced: tierFormFromJson(null, "advanced")
  });

  useEffect(() => {
    void apiGet<{ config: FunnelConfigRow }>("/agency/admin/funnel-config").then((res) => {
      const c = res.config;
      setLivePublished(c.livePublished);
      setLiveTitle(c.liveTitle);
      setLiveSubtitle(c.liveSubtitle ?? "");
      setLiveScheduledAt(c.liveScheduledAt ? c.liveScheduledAt.slice(0, 16) : "");
      setLiveStreamUrl(c.liveStreamUrl ?? "");
      setLiveReplayUrl(c.liveReplayUrl ?? "");
      setContractIntro(c.contractIntro ?? "");
      setContractClauses(Array.isArray(c.contractClausesJson) ? c.contractClausesJson.join("\n") : "");
      setCheckoutTitle(c.checkoutTitle ?? "");
      setCheckoutBody(c.checkoutBody ?? "");
      setCheckoutPixKey(c.checkoutPixKey ?? "");
      const pj = c.packagesJson as Record<string, unknown> | null;
      setTiers({
        essential: tierFormFromJson(pj, "essential"),
        professional: tierFormFromJson(pj, "professional"),
        advanced: tierFormFromJson(pj, "advanced")
      });
    });
  }, []);

  async function save() {
    setBusy(true);
    setStatus(null);
    const packagesJson: Record<string, unknown> = {};
    for (const id of PACKAGE_TIER_IDS) {
      const t = tiers[id];
      const price = Number.parseFloat(t.priceReais.replace(",", "."));
      packagesJson[id] = {
        enabled: t.enabled,
        name: t.name.trim() || undefined,
        tagline: t.tagline.trim() || undefined,
        totalValueCents: Number.isFinite(price) && price > 0 ? Math.round(price * 100) : undefined,
        bullets: t.bullets
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean)
      };
    }

    try {
      await apiPatch("/agency/admin/funnel-config", {
        livePublished,
        liveTitle,
        liveSubtitle: liveSubtitle.trim() || null,
        liveScheduledAt: liveScheduledAt ? new Date(liveScheduledAt).toISOString() : null,
        liveStreamUrl: liveStreamUrl.trim() || null,
        liveReplayUrl: liveReplayUrl.trim() || null,
        packagesJson,
        contractIntro: contractIntro.trim() || null,
        contractClausesJson: contractClauses
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean),
        checkoutTitle: checkoutTitle.trim() || null,
        checkoutBody: checkoutBody.trim() || null,
        checkoutPixKey: checkoutPixKey.trim() || null
      });
      setStatus("Funil salvo. Clientes verão as atualizações na Área do cliente.");
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Erro ao salvar.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="panel space-y-6 p-6">
      <div>
        <h2 className="text-xl font-semibold text-[var(--app-text)]">{ui.funnelEditorTitle}</h2>
        <p className="mt-1 text-sm text-[var(--app-text-muted)]">{ui.funnelEditorHint}</p>
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-medium">Live / aula</legend>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={livePublished} onChange={(e) => setLivePublished(e.target.checked)} />
          {ui.livePublish}
        </label>
        <input className="input" placeholder="Título da aula" value={liveTitle} onChange={(e) => setLiveTitle(e.target.value)} />
        <input className="input" placeholder="Subtítulo" value={liveSubtitle} onChange={(e) => setLiveSubtitle(e.target.value)} />
        <input
          className="input"
          type="datetime-local"
          value={liveScheduledAt}
          onChange={(e) => setLiveScheduledAt(e.target.value)}
        />
        <input className="input" placeholder="Link da live (YouTube/Meet)" value={liveStreamUrl} onChange={(e) => setLiveStreamUrl(e.target.value)} />
        <input className="input" placeholder="Link do replay (opcional)" value={liveReplayUrl} onChange={(e) => setLiveReplayUrl(e.target.value)} />
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-sm font-medium">Pacotes</legend>
        {PACKAGE_TIER_IDS.map((id) => (
          <div key={id} className="rounded-xl border border-[var(--app-border)] p-4 space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium capitalize">
              <input
                type="checkbox"
                checked={tiers[id].enabled}
                onChange={(e) => setTiers((t) => ({ ...t, [id]: { ...t[id], enabled: e.target.checked } }))}
              />
              {id}
            </label>
            <input
              className="input text-sm"
              placeholder="Nome exibido"
              value={tiers[id].name}
              onChange={(e) => setTiers((t) => ({ ...t, [id]: { ...t[id], name: e.target.value } }))}
            />
            <input
              className="input text-sm"
              placeholder="Tagline"
              value={tiers[id].tagline}
              onChange={(e) => setTiers((t) => ({ ...t, [id]: { ...t[id], tagline: e.target.value } }))}
            />
            <input
              className="input text-sm"
              placeholder="Preço total (R$)"
              value={tiers[id].priceReais}
              onChange={(e) => setTiers((t) => ({ ...t, [id]: { ...t[id], priceReais: e.target.value } }))}
            />
            <textarea
              className="input min-h-20 text-sm"
              placeholder="Bullets (um por linha)"
              value={tiers[id].bullets}
              onChange={(e) => setTiers((t) => ({ ...t, [id]: { ...t[id], bullets: e.target.value } }))}
            />
          </div>
        ))}
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Contrato digital</legend>
        <textarea className="input min-h-20" placeholder="Introdução" value={contractIntro} onChange={(e) => setContractIntro(e.target.value)} />
        <textarea
          className="input min-h-24"
          placeholder="Cláusulas (uma por linha)"
          value={contractClauses}
          onChange={(e) => setContractClauses(e.target.value)}
        />
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Checkout (entrada)</legend>
        <input className="input" placeholder="Título" value={checkoutTitle} onChange={(e) => setCheckoutTitle(e.target.value)} />
        <textarea className="input min-h-24" placeholder="Instruções de pagamento" value={checkoutBody} onChange={(e) => setCheckoutBody(e.target.value)} />
        <input className="input" placeholder="Chave PIX" value={checkoutPixKey} onChange={(e) => setCheckoutPixKey(e.target.value)} />
      </fieldset>

      <button type="button" className="btn-primary" disabled={busy} onClick={() => void save()}>
        {busy ? "Salvando…" : ui.saveFunnel}
      </button>
      {status ? <p className="text-sm text-sky-600 dark:text-sky-300">{status}</p> : null}
    </section>
  );
}
