import { packageTierLabel, parsePackageTier } from "@ederson-agencia/shared";
import type { AutomationContext } from "./types.js";

const PLACEHOLDER = /\{\{\s*([A-Z0-9_]+)\s*\}\}/g;

export function interpolateTemplate(template: string, ctx: AutomationContext): string {
  const map = buildVarMap(ctx);
  return template.replace(PLACEHOLDER, (_, key: string) => map[key] ?? "");
}

function buildVarMap(ctx: AutomationContext): Record<string, string> {
  const lead = ctx.lead;
  const user = ctx.user;
  const project = ctx.project;
  const tier = lead?.packageTier ? parsePackageTier(lead.packageTier) : null;
  const first =
    (lead?.name ?? user?.name ?? "Cliente").trim().split(/\s+/)[0] ?? "Cliente";

  return {
    FIRSTNAME: first,
    LEAD_NAME: lead?.name ?? "",
    LEAD_EMAIL: lead?.email ?? "",
    LEAD_PHONE: lead?.phone ?? "",
    LEAD_SOURCE: lead?.source ?? "",
    PACKAGE_TIER: tier ? packageTierLabel(tier) : lead?.packageTier ?? "",
    PROJECT_TITLE: project?.title ?? "",
    PROJECT_ID: project?.id ?? "",
    USER_NAME: user?.name ?? "",
    USER_EMAIL: user?.email ?? ""
  };
}

export function buildBrevoAttributes(ctx: AutomationContext): Record<string, string> {
  const map = buildVarMap(ctx);
  return {
    FIRSTNAME: map.FIRSTNAME,
    LASTNAME: (ctx.lead?.name ?? ctx.user?.name ?? "").trim().split(/\s+/).slice(1).join(" ") || "",
    SMS: map.LEAD_PHONE,
    PACOTE: map.PACKAGE_TIER,
    FONTE: map.LEAD_SOURCE,
    LEAD_ID: ctx.lead?.id ?? ""
  };
}
