import { LAUNCH_FUNNEL_COPY, PORTFOLIO_PRODUCTION, type PortfolioProductionItem } from "@ederson-agencia/shared";
import { ExternalLink } from "lucide-react";
import { ProductionProjectLogo } from "../ProductionProjectLogo";
import { cn } from "../../../lib/cn";

const s = LAUNCH_FUNNEL_COPY.socialProof;

type Variant = "dark" | "light";

function ClientFaceAvatar({ src, alt }: { src: string; alt: string }) {
  return (
    <span className="funnel-avatar funnel-avatar--photo">
      <img src={src} alt="" width={56} height={56} loading="lazy" decoding="async" title={alt} />
    </span>
  );
}

function ProjectCaseCard({ site, variant }: { site: PortfolioProductionItem; variant: Variant }) {
  const host = site.url.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const light = variant === "light";

  return (
    <a
      href={site.url}
      target="_blank"
      rel="noreferrer"
      className={cn(
        "group flex h-full flex-col gap-4 p-5 transition",
        light
          ? "rounded-[2rem] border border-slate-100 bg-white shadow-sm hover:border-indigo-200 hover:shadow-[0_24px_48px_-20px_rgba(79,70,229,0.25)]"
          : "funnel-case-card hover:border-emerald-500/45 hover:shadow-[0_0_32px_rgb(34_197_94_/_0.12)]"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <ProductionProjectLogo site={site} />
          <div className="min-w-0">
            <p
              className={cn(
                "truncate text-base font-bold",
                light
                  ? "font-sans tracking-tight text-slate-900 group-hover:text-indigo-600"
                  : "font-display text-white group-hover:text-emerald-300"
              )}
            >
              {site.name}
            </p>
            <p className={cn("truncate text-xs", light ? "text-slate-500" : "text-white/45")}>{host}</p>
          </div>
        </div>
        <ExternalLink
          className={cn(
            "h-4 w-4 shrink-0 transition",
            light ? "text-slate-300 group-hover:text-indigo-500" : "text-white/25 group-hover:text-emerald-400"
          )}
          aria-hidden
        />
      </div>
      <p className={cn("flex-1 text-sm leading-relaxed", light ? "font-medium text-slate-600" : "text-white/55")}>
        {site.description}
      </p>
      <div className="flex flex-wrap gap-2">
        {site.tags.map((tag) => (
          <span
            key={tag}
            className={cn(
              "px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider",
              light
                ? "rounded-full border border-indigo-100 bg-indigo-50 text-indigo-700"
                : "funnel-topic-chip"
            )}
          >
            {tag}
          </span>
        ))}
      </div>
    </a>
  );
}

export function FunnelSocialProofStrip({ variant = "dark" }: { variant?: Variant }) {
  const projects = PORTFOLIO_PRODUCTION;
  const faces = s.clientAvatars;
  const light = variant === "light";

  return (
    <section
      id="producao"
      className={cn(
        "funnel-section funnel-social-proof py-14 sm:py-16",
        light
          ? "border-y border-slate-100 bg-white font-sans"
          : "border-t border-white/[0.06] bg-[#060606]"
      )}
    >
      <div className={cn(light ? "mx-auto max-w-7xl px-6" : "landing-container")}>
        <p
          className={cn(
            "text-center text-xs font-bold uppercase tracking-widest",
            light ? "tracking-[0.35em] text-indigo-600" : "text-emerald-400/90"
          )}
        >
          {s.kicker}
        </p>
        <h2
          className={cn(
            "mt-3 text-center font-bold",
            light
              ? "font-sans text-3xl tracking-tight text-slate-900 sm:text-4xl md:text-5xl"
              : "font-display text-xl text-white sm:text-2xl md:text-3xl"
          )}
        >
          {s.title}
        </h2>
        <p
          className={cn(
            "mx-auto mt-3 max-w-2xl text-center text-sm leading-relaxed sm:text-base",
            light ? "font-medium text-slate-500" : "text-white/55"
          )}
        >
          {s.subtitle}
        </p>

        <div
          className="funnel-avatar-strip funnel-avatar-strip--center mt-10"
          aria-label="Clientes satisfeitos com projetos entregues"
        >
          {faces.map((item) => (
            <ClientFaceAvatar key={item.src} src={item.src} alt={item.alt} />
          ))}
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((site) => (
            <ProjectCaseCard key={site.url} site={site} variant={variant} />
          ))}
        </div>
      </div>
    </section>
  );
}
