import { Link } from "react-router-dom";
import { AGENCY_APP_BASE, MARKETING_PLATFORM_AUDIENCES, MARKETING_PLATFORM_CHANNELS, MARKETING_PLATFORM_FEATURES, MARKETING_PLATFORM_RESOURCES } from "@ederson-agencia/shared";
import { useAdminProjectScope } from "../admin/admin-project-scope";
import { MarketingPlatformIcon } from "./marketing-platform-icons";

const ADMIN = `${AGENCY_APP_BASE}/admin`;

export function MarketingPlatformHub() {
  const { withProjectQuery } = useAdminProjectScope();
  return (
    <div className="marketing-platform space-y-10">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--app-text)]">Marketing e mensageria</h1>
        <p className="max-w-2xl text-sm text-[var(--app-text-muted)]">
          Campanhas, transacional, CRM, dados, fidelização e integrações — mesmo modelo de plataformas como Brevo, com
          execução no seu painel.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="marketing-platform__section-title">Funcionalidades</h2>
        <div className="marketing-platform__grid marketing-platform__grid--3">
          {MARKETING_PLATFORM_FEATURES.map((item) => (
            <Link key={item.id} to={withProjectQuery(`${ADMIN}/${item.adminPath}`)} className="marketing-platform-card">
              <div className="marketing-platform-card__icon">
                <MarketingPlatformIcon name={item.icon} />
              </div>
              <div className="min-w-0">
                <div className="marketing-platform-card__title">{item.title}</div>
                <p className="marketing-platform-card__desc">{item.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="marketing-platform__section-title">Canais</h2>
        <div className="marketing-platform__grid marketing-platform__grid--4">
          {MARKETING_PLATFORM_CHANNELS.map((ch) => (
            <Link
              key={ch.id}
              to={withProjectQuery(`${ADMIN}/marketing/canais#${ch.id}`)}
              className="marketing-platform-card marketing-platform-card--compact"
            >
              <div className="marketing-platform-card__icon">
                <MarketingPlatformIcon name={ch.icon} />
              </div>
              <div className="marketing-platform-card__title">{ch.label}</div>
              <p className="marketing-platform-card__desc">{ch.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="marketing-platform__section-title">Para quem é</h2>
        <div className="marketing-platform__grid marketing-platform__grid--2">
          {MARKETING_PLATFORM_AUDIENCES.map((aud) => (
            <SnapshotProviderCard
              key={aud.id}
              title={aud.title}
              description={aud.description}
              icon={aud.icon}
            />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="marketing-platform__section-title">Central de conteúdo e ajuda</h2>
        <div className="marketing-platform__grid marketing-platform__grid--3">
          {MARKETING_PLATFORM_RESOURCES.map((res) =>
            "href" in res ? (
              <a key={res.id} href={res.href} target="_blank" rel="noreferrer" className="marketing-platform-card">
                <ExternalLinkIcon />
                <div>
                  <div className="marketing-platform-card__title">{res.label}</div>
                  <p className="marketing-platform-card__desc">Abrir em nova aba</p>
                </div>
              </a>
            ) : (
              <Link key={res.id} to={withProjectQuery(`${ADMIN}/${res.adminPath}`)} className="marketing-platform-card">
                <div className="marketing-platform-card__icon">
                  <MarketingPlatformIcon name="plug" />
                </div>
                <div>
                  <div className="marketing-platform-card__title">{res.label}</div>
                  <p className="marketing-platform-card__desc">Dentro da agência</p>
                </div>
              </Link>
            )
          )}
        </div>
      </section>
    </div>
  );
}

function SnapshotProviderCard({ title, description, icon }: { title: string; description: string; icon: string }) {
  return (
    <div className="marketing-platform-card">
      <div className="marketing-platform-card__icon">
        <MarketingPlatformIcon name={icon} />
      </div>
      <div>
        <div className="marketing-platform-card__title">{title}</div>
        <p className="marketing-platform-card__desc">{description}</p>
      </div>
    </div>
  );
}

function ExternalLinkIcon() {
  return (
    <div className="marketing-platform-card__icon">
      <MarketingPlatformIcon name="mail" />
    </div>
  );
}
