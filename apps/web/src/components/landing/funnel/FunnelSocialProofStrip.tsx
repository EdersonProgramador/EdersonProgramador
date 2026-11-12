import { LAUNCH_FUNNEL_COPY, PORTFOLIO_PRODUCTION, type PortfolioProductionItem } from "@ederson-agencia/shared";
import { ExternalLink } from "lucide-react";
import { ProductionProjectLogo } from "../ProductionProjectLogo";

const s = LAUNCH_FUNNEL_COPY.socialProof;

function ClientFaceAvatar({ src, alt }: { src: string; alt: string }) {
  return (
    <span className="funnel-avatar funnel-avatar--photo">
      <img src={src} alt="" width={56} height={56} loading="lazy" decoding="async" title={alt} />
    </span>
  );
}

function ProjectCaseCard({ site }: { site: PortfolioProductionItem }) {
  const host = site.url.replace(/^https?:\/\//, "").replace(/\/$/, "");
  return (
    <a
      href={site.url}
      target="_blank"
      rel="noreferrer"
      className="funnel-case-card group flex h-full flex-col gap-4 p-5 transition hover:border-emerald-500/45 hover:shadow-[0_0_32px_rgb(34_197_94_/_0.12)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <ProductionProjectLogo site={site} />
          <div className="min-w-0">
            <p className="truncate font-display text-base font-bold text-white group-hover:text-emerald-300">{site.name}</p>
            <p className="truncate text-xs text-white/45">{host}</p>
          </div>
        </div>
        <ExternalLink className="h-4 w-4 shrink-0 text-white/25 transition group-hover:text-emerald-400" aria-hidden />
      </div>
      <p className="flex-1 text-sm leading-relaxed text-white/55">{site.description}</p>
      <div className="flex flex-wrap gap-2">
        {site.tags.map((tag) => (
          <span key={tag} className="funnel-topic-chip px-2.5 py-1 text-[10px]">
            {tag}
          </span>
        ))}
      </div>
    </a>
  );
}

export function FunnelSocialProofStrip() {
  const projects = PORTFOLIO_PRODUCTION;
  const faces = s.clientAvatars;

  return (
    <section id="producao" className="funnel-section funnel-social-proof border-t border-white/[0.06] bg-[#060606] py-14 sm:py-16">
      <div className="landing-container">
        <p className="text-center text-xs font-bold uppercase tracking-widest text-emerald-400/90">{s.kicker}</p>
        <h2 className="mt-3 text-center font-display text-xl font-bold text-white sm:text-2xl md:text-3xl">{s.title}</h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-sm leading-relaxed text-white/55 sm:text-base">{s.subtitle}</p>

        <div className="funnel-avatar-strip funnel-avatar-strip--center mt-10" aria-label="Clientes satisfeitos com projetos entregues">
          {faces.map((item) => (
            <ClientFaceAvatar key={item.src} src={item.src} alt={item.alt} />
          ))}
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((site) => (
            <ProjectCaseCard key={site.url} site={site} />
          ))}
        </div>
      </div>
    </section>
  );
}
