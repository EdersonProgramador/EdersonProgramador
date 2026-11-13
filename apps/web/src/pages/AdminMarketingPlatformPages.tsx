import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AGENCY_APP_BASE,
  MARKETING_CAPABILITY_MATRIX,
  MARKETING_LEAD_SOURCE_OPTIONS,
  marketingAudienceTierOptions
} from "@ederson-agencia/shared";
import { ApiError, apiGet, apiPatch, apiPost } from "../api";
import { AdminMarketingPlatformShell, useAdminProjectScope } from "../components/admin/admin-project-scope";
import { AdminPageHead } from "./DashboardPages";
import { MarketingPlatformHub } from "../components/marketing/MarketingPlatformHub";
import { MarketingSetupPanel } from "../components/marketing/MarketingSetupPanel";
import { MarketingPlatformIcon } from "../components/marketing/marketing-platform-icons";

const ADMIN = `${AGENCY_APP_BASE}/admin`;

type MarketingOverview = {
  contactsTotal: number;
  campaignsTotal: number;
  loyaltyEnabled: boolean;
  providers: Record<string, boolean>;
};

export function AdminMarketingPlatformHubPage() {
  const { withProjectQuery } = useAdminProjectScope();
  const [stats, setStats] = useState<MarketingOverview | null>(null);
  useEffect(() => {
    void apiGet<MarketingOverview>("/agency/admin/marketing/overview").then(setStats).catch(() => null);
  }, []);

  const providersOk = stats ? Object.values(stats.providers).some(Boolean) : false;

  return (
    <AdminMarketingPlatformShell showProjections>
      <AdminPageHead
        title="Plataforma de marketing"
        description="Funcionalidades, canais e integrações no mesmo ecossistema da agência."
      />
      {stats ? (
        <ul className="flex flex-wrap gap-3 text-sm text-[var(--app-text-muted)]">
          <li>
            CDP: <strong className="text-[var(--app-text)]">{stats.contactsTotal}</strong> contatos
          </li>
          <li>
            Campanhas: <strong className="text-[var(--app-text)]">{stats.campaignsTotal}</strong>
          </li>
          <li>
            E-mail:{" "}
            <strong className={providersOk ? "text-emerald-400" : "text-amber-400"}>{providersOk ? "provedor ativo" : "configure .env"}</strong>
          </li>
          <li>
            Fidelização:{" "}
            <strong className="text-[var(--app-text)]">{stats.loyaltyEnabled ? "ativa" : "inativa"}</strong>
          </li>
        </ul>
      ) : null}
      <MarketingSetupPanel withProjectQuery={withProjectQuery} />
      <div className="marketing-platform__grid marketing-platform__grid--2">
        {MARKETING_CAPABILITY_MATRIX.map((row) => (
          <div key={row.pillar} className="marketing-platform-card">
            <div className="marketing-platform-card__title">{row.pillar}</div>
            <p className="marketing-platform-card__desc">
              <strong>No app:</strong> {row.inApp}
            </p>
            <p className="marketing-platform-card__desc mt-1">
              <strong>Externo:</strong> {row.external}
            </p>
          </div>
        ))}
      </div>
      <MarketingPlatformHub />
    </AdminMarketingPlatformShell>
  );
}

type CampaignChannel = "email" | "sms" | "whatsapp";

type AudienceFilter = { source?: string; packageTier?: string; limit?: number };

type Campaign = {
  id: string;
  name: string;
  channel: CampaignChannel;
  status: string;
  subject: string | null;
  bodyHtml: string | null;
  audienceFilterJson: AudienceFilter | null;
  scheduledAt: string | null;
  sentAt: string | null;
  statsJson: { sent?: number; failed?: number; total?: number; skippedNoPhone?: number } | null;
};

function buildAudienceFilter(source: string, packageTier: string, limit: number): AudienceFilter {
  return {
    ...(source ? { source } : {}),
    ...(packageTier ? { packageTier } : {}),
    limit
  };
}

function AudienceFilterFields({
  channel,
  source,
  packageTier,
  limit,
  onSource,
  onTier,
  onLimit,
  onChannel
}: {
  channel: CampaignChannel;
  source: string;
  packageTier: string;
  limit: number;
  onSource: (v: string) => void;
  onTier: (v: string) => void;
  onLimit: (v: number) => void;
  onChannel?: (v: CampaignChannel) => void;
}) {
  const tierOptions = marketingAudienceTierOptions();
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {onChannel ? (
        <label className="block text-sm sm:col-span-2">
          Canal
          <select className="input mt-1 w-full" value={channel} onChange={(e) => onChannel(e.target.value as CampaignChannel)}>
            <option value="email">E-mail</option>
            <option value="sms">SMS (Brevo)</option>
            <option value="whatsapp">WhatsApp (webhook)</option>
          </select>
        </label>
      ) : null}
      <label className="block text-sm">
        Fonte do lead (CDP)
        <select className="input mt-1 w-full" value={source} onChange={(e) => onSource(e.target.value)}>
          {MARKETING_LEAD_SOURCE_OPTIONS.map((o) => (
            <option key={o.id || "all"} value={o.id}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm">
        Pacote
        <select className="input mt-1 w-full" value={packageTier} onChange={(e) => onTier(e.target.value)}>
          {tierOptions.map((o) => (
            <option key={o.id || "all"} value={o.id}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm sm:col-span-2">
        Limite de destinatários
        <input
          type="number"
          min={1}
          max={2000}
          className="input mt-1 w-40"
          value={limit}
          onChange={(e) => onLimit(Number(e.target.value))}
        />
        {channel !== "email" ? (
          <span className="ml-2 text-xs text-[var(--app-text-muted)]">Somente contatos com telefone</span>
        ) : null}
      </label>
    </div>
  );
}

export function AdminMarketingCampaignsPage() {
  const { withProjectQuery } = useAdminProjectScope();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [bodyHtml, setBodyHtml] = useState("<p>Olá,</p><p>Conteúdo da campanha.</p>");
  const [draftChannel, setDraftChannel] = useState<CampaignChannel>("email");
  const [audienceSource, setAudienceSource] = useState("");
  const [audienceTier, setAudienceTier] = useState("");
  const [audienceLimit, setAudienceLimit] = useState(200);
  const [audienceCount, setAudienceCount] = useState<number | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const selected = campaigns.find((c) => c.id === selectedId) ?? null;
  const activeChannel = selected?.channel ?? draftChannel;

  const load = useCallback(() => {
    void apiGet<{ campaigns: Campaign[] }>("/agency/admin/marketing/campaigns").then((r) => setCampaigns(r.campaigns));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!selectedId) {
      setAudienceCount(null);
      return;
    }
    const qs = new URLSearchParams({
      channel: activeChannel,
      source: audienceSource,
      packageTier: audienceTier,
      limit: String(audienceLimit)
    });
    void apiGet<{ count: number }>(`/agency/admin/marketing/campaigns/${selectedId}/audience?${qs}`).then((r) =>
      setAudienceCount(r.count)
    );
  }, [selectedId, activeChannel, audienceSource, audienceTier, audienceLimit, campaigns]);

  function selectCampaign(c: Campaign) {
    setSelectedId(c.id);
    const f = c.audienceFilterJson ?? {};
    setAudienceSource(f.source ?? "");
    setAudienceTier(f.packageTier ?? "");
    setAudienceLimit(f.limit ?? 200);
  }

  async function create() {
    if (!name.trim()) return;
    setMsg(null);
    try {
      await apiPost("/agency/admin/marketing/campaigns", {
        name,
        subject: draftChannel === "email" ? subject : name,
        bodyHtml,
        channel: draftChannel,
        audienceFilter: buildAudienceFilter(audienceSource, audienceTier, audienceLimit)
      });
      setName("");
      load();
      setMsg("Campanha criada (rascunho).");
    } catch (e) {
      setMsg(e instanceof ApiError ? e.message : "Erro");
    }
  }

  async function saveSelected() {
    if (!selected) return;
    setMsg(null);
    try {
      await apiPatch(`/agency/admin/marketing/campaigns/${selected.id}`, {
        channel: selected.channel,
        subject: selected.subject,
        bodyHtml: selected.bodyHtml,
        audienceFilter: buildAudienceFilter(audienceSource, audienceTier, audienceLimit)
      });
      load();
      setMsg("Campanha atualizada.");
    } catch (e) {
      setMsg(e instanceof ApiError ? e.message : "Erro");
    }
  }

  async function sendSelected() {
    if (!selected) return;
    setMsg(null);
    try {
      await apiPatch(`/agency/admin/marketing/campaigns/${selected.id}`, {
        channel: selected.channel,
        subject: selected.subject,
        bodyHtml: selected.bodyHtml,
        audienceFilter: buildAudienceFilter(audienceSource, audienceTier, audienceLimit)
      });
      const res = await apiPost<{ message: string; stats?: Campaign["statsJson"] }>(
        `/agency/admin/marketing/campaigns/${selected.id}/send`,
        {}
      );
      load();
      setMsg(res.message);
    } catch (e) {
      setMsg(e instanceof ApiError ? e.message : "Erro no envio");
    }
  }

  function patchSelected(patch: Partial<Campaign>) {
    if (!selectedId) return;
    setCampaigns((prev) => prev.map((c) => (c.id === selectedId ? { ...c, ...patch } : c)));
  }

  return (
    <AdminMarketingPlatformShell>
      <AdminPageHead
        title="Campanhas"
        description="Audiência por fonte/pacote no CDP — e-mail, SMS (Brevo) e WhatsApp (webhook)."
      />
      <p className="text-sm text-[var(--app-text-muted)]">
        <Link className="text-emerald-400 hover:underline" to={withProjectQuery(`${ADMIN}/marketing/cdp`)}>
          Sincronize o CDP
        </Link>{" "}
        antes do primeiro envio ·{" "}
        <Link className="text-emerald-400 hover:underline" to={withProjectQuery(`${ADMIN}/automacoes`)}>
          automações
        </Link>{" "}
        para jornadas transacionais.
      </p>
      <div className="panel space-y-3 p-4">
        <h2 className="text-sm font-semibold">Nova campanha</h2>
        <input className="input w-full" placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} />
        <AudienceFilterFields
          channel={draftChannel}
          source={audienceSource}
          packageTier={audienceTier}
          limit={audienceLimit}
          onSource={setAudienceSource}
          onTier={setAudienceTier}
          onLimit={setAudienceLimit}
          onChannel={setDraftChannel}
        />
        {draftChannel === "email" ? (
          <input className="input w-full" placeholder="Assunto" value={subject} onChange={(e) => setSubject(e.target.value)} />
        ) : null}
        <textarea
          className="input min-h-[120px] w-full font-mono text-xs"
          placeholder={draftChannel === "email" ? "HTML do e-mail" : "Texto da mensagem"}
          value={bodyHtml}
          onChange={(e) => setBodyHtml(e.target.value)}
        />
        <button type="button" className="btn-primary" onClick={() => void create()}>
          Criar rascunho
        </button>
        {msg ? <p className="text-sm text-[var(--app-text-muted)]">{msg}</p> : null}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <ul className="space-y-2">
          {campaigns.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                className={`marketing-platform-card w-full text-left ${selectedId === c.id ? "ring-1 ring-emerald-500/50" : ""}`}
                onClick={() => selectCampaign(c)}
              >
                <div className="marketing-platform-card__icon">
                  <MarketingPlatformIcon name="megaphone" />
                </div>
                <div>
                  <div className="marketing-platform-card__title">{c.name}</div>
                  <p className="marketing-platform-card__desc">
                    {c.status} · {c.channel} {c.subject ? `· ${c.subject}` : ""}
                    {c.statsJson?.total != null ? ` · ${c.statsJson.sent}/${c.statsJson.total} enviados` : ""}
                  </p>
                </div>
              </button>
            </li>
          ))}
        </ul>
        {selected ? (
          <div className="panel space-y-3 p-4">
            <h2 className="text-sm font-semibold">Editar: {selected.name}</h2>
            <AudienceFilterFields
              channel={selected.channel}
              source={audienceSource}
              packageTier={audienceTier}
              limit={audienceLimit}
              onSource={setAudienceSource}
              onTier={setAudienceTier}
              onLimit={setAudienceLimit}
              onChannel={(ch) => patchSelected({ channel: ch })}
            />
            {selected.channel === "email" ? (
              <input
                className="input w-full"
                value={selected.subject ?? ""}
                onChange={(e) => patchSelected({ subject: e.target.value })}
                placeholder="Assunto"
              />
            ) : null}
            <textarea
              className="input min-h-[160px] w-full font-mono text-xs"
              value={selected.bodyHtml ?? ""}
              onChange={(e) => patchSelected({ bodyHtml: e.target.value })}
            />
            <p className="text-xs text-[var(--app-text-muted)]">
              Audiência estimada ({selected.channel}): <strong>{audienceCount ?? "…"}</strong> destinatário(s)
            </p>
            <div className="flex flex-wrap gap-2">
              <button type="button" className="btn-secondary" onClick={() => void saveSelected()}>
                Salvar
              </button>
              {["DRAFT", "SCHEDULED"].includes(selected.status) ? (
                <button type="button" className="btn-primary" onClick={() => void sendSelected()}>
                  Enviar agora
                </button>
              ) : null}
            </div>
          </div>
        ) : (
          <p className="text-sm text-[var(--app-text-muted)]">Selecione uma campanha para editar e enviar.</p>
        )}
      </div>
    </AdminMarketingPlatformShell>
  );
}

export function AdminMarketingTransactionalPage() {
  const { withProjectQuery } = useAdminProjectScope();
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("Teste transacional");
  const [html, setHtml] = useState("<p>E-mail de teste da plataforma.</p>");
  const [phone, setPhone] = useState("");
  const [smsText, setSmsText] = useState("Teste SMS — Ederson Agência");
  const [waText, setWaText] = useState("Olá! Mensagem de teste WhatsApp.");
  const [msg, setMsg] = useState<string | null>(null);

  async function sendTest() {
    setMsg(null);
    try {
      const res = await apiPost<{ message: string }>("/agency/admin/marketing/transactional/test", { to, subject, html });
      setMsg(res.message);
    } catch (e) {
      setMsg(e instanceof ApiError ? e.message : "Falha no envio");
    }
  }

  async function sendSmsTest() {
    setMsg(null);
    try {
      const res = await apiPost<{ message: string }>("/agency/admin/marketing/transactional/test-sms", {
        phone,
        content: smsText
      });
      setMsg(res.message);
    } catch (e) {
      setMsg(e instanceof ApiError ? e.message : "Falha no SMS");
    }
  }

  async function sendWaTest() {
    setMsg(null);
    try {
      const res = await apiPost<{ message: string }>("/agency/admin/marketing/transactional/test-whatsapp", {
        phone,
        text: waText
      });
      setMsg(res.message);
    } catch (e) {
      setMsg(e instanceof ApiError ? e.message : "Falha no WhatsApp");
    }
  }

  return (
    <AdminMarketingPlatformShell>
      <AdminPageHead title="Mensagens transacionais" description="E-mail, SMS e WhatsApp — testes e automações." />
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="panel space-y-3 p-4">
          <h2 className="text-sm font-semibold">E-mail</h2>
          <input className="input w-full" type="email" placeholder="Destinatário" value={to} onChange={(e) => setTo(e.target.value)} />
          <input className="input w-full" value={subject} onChange={(e) => setSubject(e.target.value)} />
          <textarea className="input min-h-[100px] w-full font-mono text-xs" value={html} onChange={(e) => setHtml(e.target.value)} />
          <button type="button" className="btn-primary" onClick={() => void sendTest()}>
            Enviar teste
          </button>
        </div>
        <div className="panel space-y-3 p-4">
          <h2 className="text-sm font-semibold">SMS (Brevo)</h2>
          <input className="input w-full" placeholder="+55..." value={phone} onChange={(e) => setPhone(e.target.value)} />
          <textarea className="input min-h-[80px] w-full text-sm" value={smsText} onChange={(e) => setSmsText(e.target.value)} />
          <button type="button" className="btn-primary" onClick={() => void sendSmsTest()}>
            Enviar SMS
          </button>
        </div>
        <div className="panel space-y-3 p-4">
          <h2 className="text-sm font-semibold">WhatsApp (webhook)</h2>
          <input className="input w-full" placeholder="+55..." value={phone} onChange={(e) => setPhone(e.target.value)} />
          <textarea className="input min-h-[80px] w-full text-sm" value={waText} onChange={(e) => setWaText(e.target.value)} />
          <button type="button" className="btn-primary" onClick={() => void sendWaTest()}>
            Disparar webhook
          </button>
        </div>
      </div>
      {msg ? <p className="text-sm text-[var(--app-text-muted)]">{msg}</p> : null}
      <div className="marketing-platform__grid marketing-platform__grid--2">
        <Link to={withProjectQuery(`${ADMIN}/automacoes`)} className="marketing-platform-card">
          <div className="marketing-platform-card__icon">
            <MarketingPlatformIcon name="mail-cog" />
          </div>
          <div>
            <div className="marketing-platform-card__title">Fluxos transacionais</div>
            <p className="marketing-platform-card__desc">Ação message.send nos triggers de lead e projeto.</p>
          </div>
        </Link>
        <Link to={withProjectQuery(`${ADMIN}/operacao/launch-kit`)} className="marketing-platform-card">
          <div className="marketing-platform-card__icon">
            <MarketingPlatformIcon name="mail" />
          </div>
          <div>
            <div className="marketing-platform-card__title">Templates de lançamento</div>
            <p className="marketing-platform-card__desc">Kit LP com e-mails PPL, CPL e carrinho.</p>
          </div>
        </Link>
      </div>
    </AdminMarketingPlatformShell>
  );
}

type LeadCard = { id: string; name: string; email: string; status: string; packageTier: string | null };

export function AdminMarketingCrmPage() {
  const { withProjectQuery } = useAdminProjectScope();
  const [grouped, setGrouped] = useState<Record<string, LeadCard[]>>({});
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(() => {
    void apiGet<{ grouped: Record<string, LeadCard[]> }>("/agency/admin/marketing/crm/pipeline").then((r) =>
      setGrouped(r.grouped)
    );
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function moveLead(id: string, status: string) {
    setBusy(id);
    try {
      await apiPatch(`/agency/leads/${id}`, { status });
      load();
    } finally {
      setBusy(null);
    }
  }

  const columns = ["NEW", "QUALIFIED", "WON", "LOST"] as const;
  const labels: Record<string, string> = { NEW: "Novos", QUALIFIED: "Qualificados", WON: "Ganhos", LOST: "Perdidos" };
  const nextStatus: Record<string, string | null> = {
    NEW: "QUALIFIED",
    QUALIFIED: "WON",
    WON: null,
    LOST: "NEW"
  };

  return (
    <AdminMarketingPlatformShell>
      <AdminPageHead title="Gestão de vendas" description="Pipeline de leads integrado ao funil e projetos." />
      <Link className="text-sm text-emerald-400 hover:underline" to={withProjectQuery(`${ADMIN}/leads`)}>
        Abrir lista completa de leads
      </Link>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {columns.map((col) => (
          <div key={col} className="marketing-crm-column">
            <h3>
              {labels[col]} ({grouped[col]?.length ?? 0})
            </h3>
            {(grouped[col] ?? []).slice(0, 12).map((lead) => (
              <div key={lead.id} className="marketing-crm-card space-y-2">
                <div className="font-medium text-[var(--app-text)]">{lead.name}</div>
                <div className="text-xs text-[var(--app-text-muted)]">{lead.email}</div>
                {nextStatus[col] ? (
                  <button
                    type="button"
                    disabled={busy === lead.id}
                    className="text-xs text-emerald-400 hover:underline"
                    onClick={() => void moveLead(lead.id, nextStatus[col]!)}
                  >
                    → {labels[nextStatus[col]!]}
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        ))}
      </div>
    </AdminMarketingPlatformShell>
  );
}

type Contact = {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  updatedAt: string;
  attributesJson: unknown;
};

export function AdminMarketingCdpPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [q, setQ] = useState("");
  const [syncMsg, setSyncMsg] = useState<string | null>(null);

  const load = useCallback(() => {
    void apiGet<{ contacts: Contact[] }>(`/agency/admin/marketing/contacts?q=${encodeURIComponent(q)}`).then((r) =>
      setContacts(r.contacts)
    );
  }, [q]);

  useEffect(() => {
    load();
  }, [load]);

  async function syncFromLeads() {
    setSyncMsg(null);
    try {
      const res = await apiPost<{ synced: number }>("/agency/admin/marketing/contacts/sync", { limit: 500 });
      setSyncMsg(`${res.synced} perfil(is) sincronizado(s).`);
      load();
    } catch (e) {
      setSyncMsg(e instanceof ApiError ? e.message : "Erro na sincronização");
    }
  }

  return (
    <AdminMarketingPlatformShell>
      <AdminPageHead title="Plataforma de dados (CDP)" description="Perfis unificados alimentados por leads e automações." />
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className="btn-secondary" onClick={() => void syncFromLeads()}>
          Sincronizar leads e clientes
        </button>
        {syncMsg ? <span className="text-sm text-[var(--app-text-muted)]">{syncMsg}</span> : null}
      </div>
      <input
        className="input max-w-md"
        placeholder="Buscar por nome ou e-mail"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <ContactsTable contacts={contacts} />
    </AdminMarketingPlatformShell>
  );
}

function ContactsTable({ contacts }: { contacts: Contact[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-[var(--app-border)]">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-[var(--app-border)] bg-black/20 text-xs uppercase text-[var(--app-text-muted)]">
          <tr>
            <th className="p-3">Contato</th>
            <th className="p-3">Telefone</th>
            <th className="p-3">Pontos</th>
            <th className="p-3">Atualizado</th>
          </tr>
        </thead>
        <tbody>
          {contacts.map((c) => (
            <tr key={c.id} className="border-b border-[var(--app-border)]">
              <td className="p-3">
                <div className="font-medium">{c.name ?? "—"}</div>
                <div className="text-xs text-[var(--app-text-muted)]">{c.email}</div>
              </td>
              <td className="p-3">{c.phone ?? "—"}</td>
              <td className="p-3 text-xs">
                {typeof (c.attributesJson as Record<string, unknown> | null)?.loyaltyPoints === "number"
                  ? (c.attributesJson as Record<string, number>).loyaltyPoints
                  : "—"}
              </td>
              <td className="p-3 text-xs text-[var(--app-text-muted)]">{new Date(c.updatedAt).toLocaleString("pt-BR")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

type ChannelRow = { id: string; label: string; description: string; ready: boolean; note: string };

export function AdminMarketingChannelsPage() {
  const [channels, setChannels] = useState<ChannelRow[]>([]);
  useEffect(() => {
    void apiGet<{ channels: ChannelRow[] }>("/agency/admin/marketing/channels").then((r) => setChannels(r.channels));
  }, []);

  return (
    <AdminMarketingPlatformShell>
      <AdminPageHead title="Canais" description="E-mail, SMS, WhatsApp, push, chat e voz — status de conexão." />
      <div className="marketing-platform__grid marketing-platform__grid--4">
        {channels.map((ch) => (
          <article key={ch.id} id={ch.id} className="marketing-platform-card marketing-platform-card--compact">
            <div className="marketing-platform-card__icon">
              <MarketingPlatformIcon name={ch.id === "push" ? "bell" : ch.id === "whatsapp" ? "message-circle" : ch.id} />
            </div>
            <div className="marketing-platform-card__title">{ch.label}</div>
            <p className="marketing-platform-card__desc">{ch.note}</p>
            <span className={`marketing-platform-card__badge${ch.ready ? "" : " is-off"}`}>
              {ch.ready ? "Pronto" : "Configurar"}
            </span>
          </article>
        ))}
      </div>
    </AdminMarketingPlatformShell>
  );
}

export function AdminMarketingIntegrationsPage() {
  const [data, setData] = useState<{
    catalog: { role: string; examples: string }[];
    connected: Record<string, unknown>;
    envHints: Record<string, boolean>;
  } | null>(null);

  useEffect(() => {
    void apiGet<{
      catalog: { role: string; examples: string }[];
      connected: Record<string, unknown>;
      envHints: Record<string, boolean>;
    }>("/agency/admin/marketing/integrations").then(setData);
  }, []);

  return (
    <AdminMarketingPlatformShell>
      <AdminPageHead title="Integrações" description="Conectores equivalentes a centenas de apps — via API e webhook." />
      {data ? (
        <>
          <dl className="grid gap-2 sm:grid-cols-2">
            {Object.entries(data.envHints).map(([k, v]) => (
              <div key={k} className="marketing-platform-card">
                <div>
                  <div className="marketing-platform-card__title">{k}</div>
                  <span className={`marketing-platform-card__badge${v ? "" : " is-off"}`}>{v ? "Conectado" : "Off"}</span>
                </div>
              </div>
            ))}
          </dl>
          <ul className="text-sm text-[var(--app-text-muted)]">
            {data.catalog.map((row) => (
              <li key={row.role}>
                <strong className="text-[var(--app-text)]">{row.role}:</strong> {row.examples}
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </AdminMarketingPlatformShell>
  );
}

export function AdminMarketingLoyaltyPage() {
  const [enabled, setEnabled] = useState(false);
  const [name, setName] = useState("Programa Ederson");
  const [pointsCheckout, setPointsCheckout] = useState(100);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    void apiGet<{
      loyalty: { enabled: boolean; name: string };
      rules: { pointsPerCheckout?: number };
    }>("/agency/admin/marketing/loyalty").then((r) => {
      setEnabled(r.loyalty.enabled);
      setName(r.loyalty.name);
      setPointsCheckout(r.rules.pointsPerCheckout ?? 100);
    });
  }, []);

  async function save() {
    setMsg(null);
    try {
      await apiPatch("/agency/admin/marketing/loyalty", {
        enabled,
        name,
        rulesJson: { pointsPerCheckout: pointsCheckout, pointsPerReferral: 50 }
      });
      setMsg("Programa salvo. Pontos são creditados no checkout do cliente.");
    } catch (e) {
      setMsg(e instanceof ApiError ? e.message : "Erro");
    }
  }

  return (
    <AdminMarketingPlatformShell>
      <AdminPageHead title="Fidelização" description="Níveis e pontos — base para recompensas e renovação." />
      <div className="panel max-w-lg space-y-3 p-4">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
          Programa ativo
        </label>
        <input className="input w-full" value={name} onChange={(e) => setName(e.target.value)} />
        <label className="block text-sm">
          Pontos por checkout concluído
          <input
            type="number"
            min={0}
            className="input mt-1 w-40"
            value={pointsCheckout}
            onChange={(e) => setPointsCheckout(Number(e.target.value))}
          />
        </label>
        <p className="text-xs text-[var(--app-text-muted)]">
          Níveis padrão: Start, Growth, Partner. Pontos aparecem no CDP do contato.
        </p>
        <button type="button" className="btn-primary" onClick={() => void save()}>
          Salvar
        </button>
        {msg ? <p className="text-sm">{msg}</p> : null}
      </div>
    </AdminMarketingPlatformShell>
  );
}
