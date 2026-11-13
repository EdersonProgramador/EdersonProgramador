export type AutomationLeadContext = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  source?: string | null;
  packageTier?: string | null;
  message?: string;
  status?: string;
};

export type AutomationUserContext = {
  id: string;
  name: string;
  email: string;
};

export type AutomationProjectContext = {
  id: string;
  title: string;
  packageTier?: string | null;
  clientId?: string | null;
};

export type AutomationContext = {
  lead?: AutomationLeadContext;
  user?: AutomationUserContext;
  project?: AutomationProjectContext;
  meta?: Record<string, unknown>;
};
