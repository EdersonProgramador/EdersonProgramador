import { DEV_TECH_BRAND_SLUG } from "./development-tech-brand-slugs.js";

/** Ícones hospedados em `apps/web/public/dev-tech-icons/` (servidos na raiz do site). */
export const DEV_TECH_BRAND_LOCAL_ICON: Record<string, string> = {
  hotmart: "/dev-tech-icons/hotmart.svg",
  kiwify: "/dev-tech-icons/kiwify.svg",
  asaas: "/dev-tech-icons/asaas.svg",
  pagarme: "/dev-tech-icons/pagarme.ico",
  iugu: "/dev-tech-icons/iugu.ico",
  eduzz: "/dev-tech-icons/eduzz.png",
  monetizze: "/dev-tech-icons/monetizze.ico",
  activecampaign: "/dev-tech-icons/activecampaign.ico",
  "activecampaign-mail": "/dev-tech-icons/activecampaign-mail.ico",
  sendgrid: "/dev-tech-icons/sendgrid.svg",
  postmark: "/dev-tech-icons/postmark.svg",
  grpc: "/dev-tech-icons/grpc.svg",
  memcached: "/dev-tech-icons/memcached.svg",
  pinecone: "/dev-tech-icons/pinecone.svg",
  inngest: "/dev-tech-icons/inngest.png",
  elysia: "/dev-tech-icons/elysia.svg",
  "webhooks-native": "/dev-tech-icons/webhooks-native.svg",
  ses: "/dev-tech-icons/ses.svg",
  bullmq: "/dev-tech-icons/bullmq.svg",
  "leadlovers-api": "/dev-tech-icons/leadlovers.ico",
  "leadlovers-mail": "/dev-tech-icons/leadlovers.ico"
};

/** Slugs removidos do CDN atual; usar pacote Simple Icons 11.14 como fallback. */
export const DEV_TECH_SI_JSDELIVR_SLUGS = new Set<string>([
  "amazonaws",
  "amazondynamodb",
  "awslambda",
  "heroku",
  "microsoftazure",
  "microsoftsqlserver",
  "oracle"
]);

const SI_CDN = "https://cdn.simpleicons.org";
const SI_JSDELIVR = "https://cdn.jsdelivr.net/npm/simple-icons@11.14.0/icons";

export function simpleIconsCdnUrl(slug: string): string {
  return `${SI_CDN}/${slug}`;
}

export function simpleIconsJsdelivrUrl(slug: string): string {
  return `${SI_JSDELIVR}/${slug}.svg`;
}

/** URLs em ordem de tentativa (local → CDN → jsdelivr legado). */
export function devTechBrandIconCandidates(optionId: string): string[] {
  const local = DEV_TECH_BRAND_LOCAL_ICON[optionId];
  if (local) return [local];

  const slug = DEV_TECH_BRAND_SLUG[optionId];
  if (!slug) return [];

  const urls = [simpleIconsCdnUrl(slug)];
  if (DEV_TECH_SI_JSDELIVR_SLUGS.has(slug)) {
    urls.push(simpleIconsJsdelivrUrl(slug));
  }
  return urls;
}
