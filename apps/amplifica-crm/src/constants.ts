import { Lead, Client, Receivable, ArtOrder, PartnerRequest, IntegrationConfig, User, Partner } from './types';

/** Sem dados fictícios — o admin real vem do banco / seed da API. */
export const INITIAL_USERS: User[] = [
  {
    id: 'u1',
    name: 'Ederson Programador',
    email: 'edersonprogramador@gmail.com',
    role: 'ADMIN'
  }
];

export const INITIAL_PARTNERS_LIST: Partner[] = [];

export const INITIAL_LEADS: Lead[] = [];

export const INITIAL_CLIENTS: Client[] = [];

export const INITIAL_RECEIVABLES: Receivable[] = [];

export const INITIAL_ART_ORDERS: ArtOrder[] = [];

export const INITIAL_PARTNER_REQUESTS: PartnerRequest[] = [];

export const INITIAL_INTEGRATIONS: IntegrationConfig[] = [
  {
    id: 'i1',
    service: 'n8n Automações',
    isActive: true,
    webhookUrl: '',
    apiKey: '',
    accessUrl: '',
    type: 'generic'
  },
  {
    id: 'i2',
    service: 'WhatsApp API Oficial',
    isActive: true,
    webhookUrl: 'https://graph.facebook.com/v17.0/',
    apiKey: '',
    accessUrl: 'https://developers.facebook.com',
    type: 'whatsapp'
  }
];
