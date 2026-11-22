-- Form integrations (lead capture forms)
CREATE TABLE IF NOT EXISTS public.form_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    fields JSONB DEFAULT '["company", "contact_name", "email", "phone"]'::jsonb,
    success_message TEXT DEFAULT 'Obrigado! Entraremos em contato em breve.',
    redirect_url TEXT,
    owner_id UUID REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS source_form_id UUID REFERENCES public.form_integrations(id);
