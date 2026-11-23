/** Pacotes comerciais — fonte única em `@ederson-agencia/shared`. */
import { agencyClientPortalPlans } from "@ederson-agencia/shared";

export type AgencyPlanId = "plan1" | "plan2" | "plan3";

export type AgencyPlan = {
  id: AgencyPlanId;
  name: string;
  price: string;
  sub: string;
  features: string[];
  featured?: boolean;
  maxMembers: number;
};

const MAX_MEMBERS: Record<AgencyPlanId, number> = {
  plan1: 3,
  plan2: 8,
  plan3: 20
};

export const AGENCY_PLANS: AgencyPlan[] = agencyClientPortalPlans().map((plan) => ({
  id: plan.legacyPlanId,
  name: plan.name,
  price: plan.priceLabel,
  sub: plan.sub,
  features: plan.features,
  featured: plan.featured,
  maxMembers: MAX_MEMBERS[plan.legacyPlanId]
}));

export function getAgencyPlan(planId: string | null | undefined): AgencyPlan {
  return AGENCY_PLANS.find((p) => p.id === planId) ?? AGENCY_PLANS[0];
}

export function agencyPlanName(planId: string | null | undefined): string {
  return getAgencyPlan(planId).name;
}