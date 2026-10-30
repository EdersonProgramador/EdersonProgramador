import { isAcademyStoreCustomer } from "./auth-context.js";
import {
  contractKindForTier,
  formatAddressLine,
  PARTNERSHIP_COMMERCIAL_CLAUSES,
  partyDetailsToSummaryLines,
  SERVICE_INTELLECTUAL_PROPERTY_CLAUSES,
  SERVICE_LIABILITY_CLAUSES,
  SERVICE_SCOPE_CLAUSES,
  SERVICE_THIRD_PARTY_COST_CLAUSES,
  type AgencyContractKind,
  type AgencyContractPartyDetails
} from "./agency-contract-legal.js";
import { BRAND_IDENTITY } from "./brand.js";
import { CONTRACT_COPY } from "./contract-copy.js";
import { AGENCY_CONTRACT_VERSION } from "./agency-funnel-copy.js";

export function sanitizeContractCompany(company: string | null | undefined): string | null {
  const trimmed = company?.trim();
  if (!trimmed || isAcademyStoreCustomer(trimmed)) return null;
  return trimmed;
}

export type AgencyContractDocumentSection = {
  heading: string;
  paragraphs: string[];
  bullets?: string[];
};

export type AgencyContractDocument = {
  title: string;
  version: string;
  contractKind: AgencyContractKind;
  generatedAt: string;
  sections: AgencyContractDocumentSection[];
};

export type ComposeAgencyContractInput = {
  contractKind: AgencyContractKind;
  packageTier: string;
  partyDetails: AgencyContractPartyDetails;
  packageLabel: string;
  totalValueCents: number;
  entryValueCents: number;
  phasesSummary: string;
  contractVersion?: string;
  intro?: string | null;
  clauses: string[];
};

function brl(cents: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(cents / 100);
}

function balanceCents(total: number, entry: number) {
  return Math.max(0, total - entry);
}

export function composeAgencyContractDocument(input: ComposeAgencyContractInput): AgencyContractDocument {
  const version = input.contractVersion?.trim() || AGENCY_CONTRACT_VERSION;
  const isPartnership = input.contractKind === "partnership";
  const balance = balanceCents(input.totalValueCents, input.entryValueCents);
  const contratanteLines = partyDetailsToSummaryLines(input.partyDetails);

  const title = isPartnership
    ? "Contrato de Parceria Comercial com Divisão de Receitas"
    : CONTRACT_COPY.serviceTitle;

  const sections: AgencyContractDocumentSection[] = [
    {
      heading: "1. Partes",
      paragraphs: [
        `CONTRATANTE (${input.partyDetails.kind === "pj" ? "Pessoa Jurídica" : "Pessoa Física"}):`,
        ...contratanteLines,
        `CONTRATADA: ${BRAND_IDENTITY.name}, prestadora de serviços de desenvolvimento de software e soluções digitais, contato via ${BRAND_IDENTITY.domainUrl}.`
      ]
    },
    {
      heading: "2. Objeto",
      paragraphs: [
        input.intro?.trim() || CONTRACT_COPY.definition,
        isPartnership
          ? `Modalidade: ${input.packageLabel}. Desenvolvimento do produto digital com participação da CONTRATADA nas receitas, conforme anexos técnico e comercial.`
          : `Pacote contratado: ${input.packageLabel}. ${CONTRACT_COPY.serviceTitle}.`
      ]
    },
    {
      heading: "3. Escopo fechado e critérios de aceite",
      paragraphs: [
        "Para emissão de nota fiscal e segurança jurídica, os dados do CONTRATANTE foram qualificados neste instrumento.",
        "Dados exigidos: para PJ — razão social, CNPJ, inscrições, sede e representante legal; para PF — nome completo, CPF, RG, profissão, estado civil e endereço."
      ],
      bullets: [...SERVICE_SCOPE_CLAUSES]
    },
    {
      heading: "4. Propriedade intelectual e código-fonte",
      paragraphs: [],
      bullets: [...SERVICE_INTELLECTUAL_PROPERTY_CLAUSES]
    },
    {
      heading: "5. Custos de terceiros e infraestrutura",
      paragraphs: [],
      bullets: [...SERVICE_THIRD_PARTY_COST_CLAUSES]
    },
    {
      heading: "6. Responsabilidade limitada e garantia",
      paragraphs: [],
      bullets: [...SERVICE_LIABILITY_CLAUSES]
    }
  ];

  if (isPartnership) {
    sections.push({
      heading: "7. Parceria comercial e divisão de receitas",
      paragraphs: [
        "As partes reconhecem modelo de risco e receita compartilhados. Percentuais, bases de cálculo, prazos de repasse e metas comerciais constam do Anexo Comercial assinado conjuntamente."
      ],
      bullets: [...PARTNERSHIP_COMMERCIAL_CLAUSES]
    });
    sections.push({
      heading: "8. Valores iniciais",
      paragraphs: [
        `Taxa de setup / entrada na assinatura: ${brl(input.entryValueCents)}.`,
        "Remuneração variável: percentual sobre receitas líquidas conforme Anexo Comercial (não substitui a taxa de setup quando aplicável).",
        CONTRACT_COPY.payment.taxesNote
      ]
    });
  } else {
    sections.push({
      heading: "7. Valores e pagamento",
      paragraphs: [
        CONTRACT_COPY.payment.headline,
        `${CONTRACT_COPY.payment.totalLabel}: ${brl(input.totalValueCents)}.`,
        `${CONTRACT_COPY.payment.entryLabel}: ${brl(input.entryValueCents)} (checkout após assinatura digital nesta plataforma).`,
        balance > 0
          ? `${CONTRACT_COPY.payment.balanceLabel}: ${brl(balance)}. ${CONTRACT_COPY.payment.balanceNote}`
          : CONTRACT_COPY.payment.balanceNote,
        CONTRACT_COPY.payment.taxesNote,
        CONTRACT_COPY.payment.technicalHour
      ]
    });
  }

  sections.push(
    {
      heading: isPartnership ? "9. Jornada de entrega" : "8. Jornada de entrega",
      paragraphs: [
        `Fases do projeto (ordem de execução): ${input.phasesSummary}.`,
        CONTRACT_COPY.timeline.totalDaysNote,
        CONTRACT_COPY.timeline.materialsNote
      ]
    },
    {
      heading: isPartnership ? "10. Obrigações da contratante" : "9. Obrigações da contratante",
      paragraphs: [CONTRACT_COPY.clientObligationsIntro]
    },
    {
      heading: isPartnership ? "11. Cláusulas complementares" : "10. Cláusulas complementares",
      paragraphs: [],
      bullets: input.clauses.length ? input.clauses : [...CONTRACT_COPY.proposalBullets]
    },
    {
      heading: isPartnership ? "12. Aceite eletrônico" : "11. Aceite eletrônico",
      paragraphs: [
        isPartnership
          ? `O CONTRATANTE declara ter lido e aceito este Contrato de Parceria (versão ${version}), inclusive anexos técnico e comercial, com validade de assinatura eletrônica na Área do cliente ${BRAND_IDENTITY.name}.`
          : `O CONTRATANTE declara ter lido e aceito integralmente este instrumento (versão ${version}), concedendo validade à assinatura eletrônica realizada na Área do cliente ${BRAND_IDENTITY.name}, com força de anuência ao contrato de prestação de serviços e ao Anexo de escopo do pacote ${input.packageLabel}.`
      ]
    }
  );

  return {
    title,
    version,
    contractKind: input.contractKind,
    generatedAt: new Date().toISOString(),
    sections
  };
}

export function composeAgencyContractDocumentForTier(
  tier: string,
  input: Omit<ComposeAgencyContractInput, "contractKind" | "packageTier">
): AgencyContractDocument {
  return composeAgencyContractDocument({
    ...input,
    packageTier: tier,
    contractKind: contractKindForTier(tier)
  });
}

export function contractDocumentToPlainText(doc: AgencyContractDocument): string {
  const lines: string[] = [doc.title, `Versão: ${doc.version}`, `Tipo: ${doc.contractKind}`, ""];
  for (const section of doc.sections) {
    lines.push(section.heading);
    lines.push(...section.paragraphs);
    if (section.bullets?.length) {
      for (const b of section.bullets) lines.push(`• ${b}`);
    }
    lines.push("");
  }
  return lines.join("\n").trim();
}

export { formatAddressLine };
