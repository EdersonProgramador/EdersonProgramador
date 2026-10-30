/** Tipos e cláusulas legais — prestação de serviços vs parceria comercial. */

export type ContractPartyKind = "pf" | "pj";
export type AgencyContractKind = "service" | "partnership";

export type AgencyContractAddress = {
  street: string;
  number: string;
  complement?: string | null;
  district: string;
  city: string;
  state: string;
  zip: string;
};

export type AgencyContractPartyDetails = {
  kind: ContractPartyKind;
  email: string;
  phone: string | null;
  /** Pessoa física */
  fullName?: string | null;
  cpf?: string | null;
  rg?: string | null;
  profession?: string | null;
  maritalStatus?: string | null;
  address?: AgencyContractAddress | null;
  /** Pessoa jurídica */
  corporateName?: string | null;
  cnpj?: string | null;
  stateRegistration?: string | null;
  municipalRegistration?: string | null;
  hqAddress?: AgencyContractAddress | null;
  representativeName?: string | null;
  representativeCpf?: string | null;
  representativeRg?: string | null;
  representativeRole?: string | null;
};

export const SERVICE_SCOPE_CLAUSES = [
  "Anexo Técnico (Backlog/Requisitos): o desenvolvimento só inicia após anexo detalhando telas, regras de negócio e integrações incluídas. O que não estiver expressamente listado não faz parte do escopo.",
  "Alteração de escopo: pedidos de nova funcionalidade, integração ou regra de negócio geram orçamento complementar e revisão do cronograma, com aceite prévio por escrito.",
  "Termo de aceite por etapa: após cada entrega ou na entrega final, o CONTRATANTE dispõe de 5 (cinco) a 10 (dez) dias úteis para testes e apontamento de não conformidades alinhadas ao anexo. Silêncio, uso em produção ou ausência de manifestação implicam aceite tácito da etapa."
] as const;

export const SERVICE_INTELLECTUAL_PROPERTY_CLAUSES = [
  "Retenção de propriedade: a transferência dos direitos patrimoniais sobre o software customizado e a entrega/liberação do código-fonte (repositório GitHub, GitLab ou equivalente) ocorrerão somente após a quitação integral dos valores contratados.",
  "Bibliotecas e ativos pré-existentes: a CONTRATADA mantém o direito de reutilizar rotinas, padrões arquiteturais, scripts e componentes open-source de sua autoria ou licenciados, sem transferir ao CONTRATANTE a propriedade desses módulos base."
] as const;

export const SERVICE_THIRD_PARTY_COST_CLAUSES = [
  "Custos de infraestrutura e terceiros (AWS, Azure, Firebase, Apple Developer, Google Play Console, APIs pagas, gateways, CRMs, certificados SSL, domínios e licenças) são de responsabilidade financeira exclusiva do CONTRATANTE, salvo previsão expressa em anexo."
] as const;

export const SERVICE_LIABILITY_CLAUSES = [
  "Limitação de responsabilidade: em qualquer hipótese, a responsabilidade financeira da CONTRATADA por falhas, indisponibilidade ou lucros cessantes fica limitada ao montante total efetivamente pago pelo CONTRATANTE neste contrato.",
  "Garantia de correção (bugfix): por 30 (trinta) a 90 (noventa) dias após o aceite final, a CONTRATADA corrige gratuitamente defeitos operacionais comprovadamente desalinhados ao escopo aprovado. Atualizações de SO, alterações por terceiros ou mudanças de escopo excluem a garantia."
] as const;

export const PARTNERSHIP_COMMERCIAL_CLAUSES = [
  "Modelo de parceria: além da prestação de serviços de desenvolvimento, as partes pactuam participação da CONTRATADA em percentual sobre receitas líquidas do produto digital, conforme percentual e periodicidade definidos em anexo comercial.",
  "Auditoria de métricas: o CONTRATANTE concede à CONTRATADA acesso de leitura aos painéis financeiros, relatórios de vendas e plataformas de pagamento (Stripe, Asaas, Pagar.me e similares) necessários à validação de repasses e comissões.",
  "Retenção e suspensão: atraso superior ao prazo acordado no repasse da participação nas receitas autoriza, após aviso prévio de 10 (dez) dias úteis, a suspensão de manutenção, atualizações ou, em último caso, indisponibilização controlada do aplicativo até a regularização."
] as const;

export function isPartnershipTier(tier: string): boolean {
  return tier === "partnership";
}

export function contractKindForTier(tier: string): AgencyContractKind {
  return isPartnershipTier(tier) ? "partnership" : "service";
}

export function formatAddressLine(addr: AgencyContractAddress | null | undefined): string | null {
  if (!addr) return null;
  const parts = [
    [addr.street, addr.number].filter(Boolean).join(", "),
    addr.complement,
    addr.district,
    [addr.city, addr.state].filter(Boolean).join("/"),
    addr.zip ? `CEP ${addr.zip}` : null
  ].filter(Boolean);
  return parts.length ? parts.join(" · ") : null;
}

function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

export function isCompleteContractAddress(addr: AgencyContractAddress | null | undefined): boolean {
  if (!addr) return false;
  return (
    addr.street.trim().length > 0 &&
    addr.number.trim().length > 0 &&
    addr.district.trim().length > 0 &&
    addr.city.trim().length > 0 &&
    addr.state.trim().length >= 2 &&
    digitsOnly(addr.zip).length >= 8
  );
}

export function normalizePartyDetails(details: AgencyContractPartyDetails): AgencyContractPartyDetails {
  const trim = (s: string | null | undefined) => s?.trim() ?? "";
  const normAddr = (addr: AgencyContractAddress | null | undefined): AgencyContractAddress | null => {
    if (!addr) return null;
    return {
      street: trim(addr.street),
      number: trim(addr.number),
      complement: trim(addr.complement) || null,
      district: trim(addr.district),
      city: trim(addr.city),
      state: trim(addr.state).toUpperCase().slice(0, 2),
      zip: trim(addr.zip)
    };
  };

  if (details.kind === "pj") {
    return {
      kind: "pj",
      email: trim(details.email).toLowerCase(),
      phone: trim(details.phone) || null,
      corporateName: trim(details.corporateName),
      cnpj: trim(details.cnpj),
      stateRegistration: trim(details.stateRegistration) || null,
      municipalRegistration: trim(details.municipalRegistration) || null,
      hqAddress: normAddr(details.hqAddress),
      representativeName: trim(details.representativeName),
      representativeCpf: trim(details.representativeCpf),
      representativeRg: trim(details.representativeRg),
      representativeRole: trim(details.representativeRole)
    };
  }

  return {
    kind: "pf",
    email: trim(details.email).toLowerCase(),
    phone: trim(details.phone) || null,
    fullName: trim(details.fullName),
    cpf: trim(details.cpf),
    rg: trim(details.rg),
    profession: trim(details.profession) || null,
    maritalStatus: trim(details.maritalStatus) || null,
    address: normAddr(details.address)
  };
}

export function validatePartyDetails(details: AgencyContractPartyDetails): string | null {
  const d = normalizePartyDetails(details);
  if (!d.email.includes("@")) return "Informe um e-mail válido.";
  if (d.kind === "pj") {
    const corporateName = d.corporateName ?? "";
    const cnpj = d.cnpj ?? "";
    const representativeName = d.representativeName ?? "";
    const representativeCpf = d.representativeCpf ?? "";
    if (corporateName.length < 3) return "Informe a razão social completa.";
    if (digitsOnly(cnpj).length < 14) return "Informe o CNPJ completo.";
    if (representativeName.length < 3) return "Informe o nome do representante legal.";
    if (digitsOnly(representativeCpf).length < 11) return "Informe o CPF do representante.";
    if (!(d.representativeRg ?? "").trim()) return "Informe o RG do representante.";
    if (!(d.representativeRole ?? "").trim()) return "Informe o cargo do representante.";
    if (!isCompleteContractAddress(d.hqAddress)) {
      return "Preencha o endereço completo da sede (logradouro, número, bairro, cidade, UF e CEP).";
    }
  } else {
    const fullName = d.fullName ?? "";
    const cpf = d.cpf ?? "";
    if (fullName.length < 3) return "Informe o nome completo (como no contrato).";
    if (digitsOnly(cpf).length < 11) return "Informe o CPF completo.";
    if (!(d.rg ?? "").trim()) return "Informe o RG.";
    if (!isCompleteContractAddress(d.address)) {
      return "Preencha o endereço residencial completo (logradouro, número, bairro, cidade, UF e CEP).";
    }
  }
  return null;
}

export function legalNameFromPartyDetails(details: AgencyContractPartyDetails): string {
  if (details.kind === "pj") {
    return details.representativeName?.trim() || details.corporateName?.trim() || "Contratante";
  }
  return details.fullName?.trim() || "Contratante";
}

export function partyDetailsToSummaryLines(details: AgencyContractPartyDetails): string[] {
  const lines: string[] = [`E-mail: ${details.email.trim().toLowerCase()}`];
  if (details.phone?.trim()) lines.push(`Telefone: ${details.phone.trim()}`);

  if (details.kind === "pj") {
    if (details.corporateName?.trim()) lines.push(`Razão social: ${details.corporateName.trim()}`);
    if (details.cnpj?.trim()) lines.push(`CNPJ: ${details.cnpj.trim()}`);
    if (details.stateRegistration?.trim()) lines.push(`Inscrição estadual: ${details.stateRegistration.trim()}`);
    if (details.municipalRegistration?.trim()) lines.push(`Inscrição municipal: ${details.municipalRegistration.trim()}`);
    const hq = formatAddressLine(details.hqAddress);
    if (hq) lines.push(`Sede: ${hq}`);
    const rep = [
      details.representativeName?.trim(),
      details.representativeRole?.trim() ? `(${details.representativeRole.trim()})` : null,
      details.representativeCpf?.trim() ? `CPF ${details.representativeCpf.trim()}` : null,
      details.representativeRg?.trim() ? `RG ${details.representativeRg.trim()}` : null
    ]
      .filter(Boolean)
      .join(" ");
    if (rep) lines.push(`Representante legal: ${rep}`);
  } else {
    if (details.fullName?.trim()) lines.push(`Nome completo: ${details.fullName.trim()}`);
    if (details.cpf?.trim()) lines.push(`CPF: ${details.cpf.trim()}`);
    if (details.rg?.trim()) lines.push(`RG: ${details.rg.trim()}`);
    if (details.profession?.trim()) lines.push(`Profissão: ${details.profession.trim()}`);
    if (details.maritalStatus?.trim()) lines.push(`Estado civil: ${details.maritalStatus.trim()}`);
    const home = formatAddressLine(details.address);
    if (home) lines.push(`Endereço: ${home}`);
  }

  return lines;
}
