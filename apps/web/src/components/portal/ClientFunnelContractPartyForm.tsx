import type { AgencyContractAddress, AgencyContractPartyDetails, ContractPartyKind } from "@ederson-agencia/shared";
import { AGENCY_FUNNEL_COPY } from "@ederson-agencia/shared";

const ui = AGENCY_FUNNEL_COPY.client;

function emptyAddress(): AgencyContractAddress {
  return { street: "", number: "", complement: "", district: "", city: "", state: "", zip: "" };
}

function AddressFields({
  title,
  value,
  onChange
}: {
  title: string;
  value: AgencyContractAddress;
  onChange: (next: AgencyContractAddress) => void;
}) {
  return (
    <fieldset className="space-y-2 rounded-lg border border-[var(--app-border)]/80 p-3">
      <legend className="px-1 text-xs font-semibold text-[var(--app-text-subtle)]">{title}</legend>
      <div className="grid gap-2 sm:grid-cols-2">
        <input
          className="input sm:col-span-2"
          placeholder="Logradouro"
          value={value.street}
          onChange={(e) => onChange({ ...value, street: e.target.value })}
        />
        <input
          className="input"
          placeholder="Número"
          value={value.number}
          onChange={(e) => onChange({ ...value, number: e.target.value })}
        />
        <input
          className="input"
          placeholder="Complemento"
          value={value.complement ?? ""}
          onChange={(e) => onChange({ ...value, complement: e.target.value })}
        />
        <input
          className="input"
          placeholder="Bairro"
          value={value.district}
          onChange={(e) => onChange({ ...value, district: e.target.value })}
        />
        <input
          className="input"
          placeholder="Cidade"
          value={value.city}
          onChange={(e) => onChange({ ...value, city: e.target.value })}
        />
        <input
          className="input"
          placeholder="UF"
          value={value.state}
          maxLength={2}
          onChange={(e) => onChange({ ...value, state: e.target.value.toUpperCase() })}
        />
        <input
          className="input"
          placeholder="CEP"
          value={value.zip}
          onChange={(e) => onChange({ ...value, zip: e.target.value })}
        />
      </div>
    </fieldset>
  );
}

export function createInitialPartyDetails(email: string, fullName: string, phone: string): AgencyContractPartyDetails {
  return {
    kind: "pf",
    email,
    phone: phone || null,
    fullName,
    cpf: "",
    rg: "",
    profession: "",
    maritalStatus: "",
    address: emptyAddress()
  };
}

export function ClientFunnelContractPartyForm({
  details,
  onChange
}: {
  details: AgencyContractPartyDetails;
  onChange: (next: AgencyContractPartyDetails) => void;
}) {
  const setKind = (kind: ContractPartyKind) => {
    if (kind === details.kind) return;
    if (kind === "pj") {
      onChange({
        kind: "pj",
        email: details.email,
        phone: details.phone,
        corporateName: "",
        cnpj: "",
        stateRegistration: "",
        municipalRegistration: "",
        hqAddress: emptyAddress(),
        representativeName: details.fullName ?? "",
        representativeCpf: "",
        representativeRg: "",
        representativeRole: ""
      });
    } else {
      onChange({
        kind: "pf",
        email: details.email,
        phone: details.phone,
        fullName: details.representativeName ?? details.fullName ?? "",
        cpf: "",
        rg: "",
        profession: "",
        maritalStatus: "",
        address: details.hqAddress ?? emptyAddress()
      });
    }
  };

  return (
    <div className="space-y-3 rounded-xl border border-[var(--app-border)] bg-[var(--app-hover)]/30 p-5">
      <div>
        <p className="text-sm font-semibold text-[var(--app-text)]">{ui.signPartyTitle}</p>
        <p className="mt-1 text-xs text-[var(--app-text-muted)]">{ui.signPartyHint}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={`rounded-full px-3 py-1 text-xs font-semibold ${details.kind === "pf" ? "bg-sky-600 text-white" : "border border-[var(--app-border)]"}`}
          onClick={() => setKind("pf")}
        >
          {ui.signPartyKindPf}
        </button>
        <button
          type="button"
          className={`rounded-full px-3 py-1 text-xs font-semibold ${details.kind === "pj" ? "bg-sky-600 text-white" : "border border-[var(--app-border)]"}`}
          onClick={() => setKind("pj")}
        >
          {ui.signPartyKindPj}
        </button>
      </div>

      <label className="block space-y-1 text-xs">
        <span className="font-medium text-[var(--app-text-subtle)]">{ui.signEmailLabel}</span>
        <input className="input bg-[var(--app-panel)]/80" readOnly value={details.email} />
      </label>

      <label className="block space-y-1 text-xs">
        <span className="font-medium text-[var(--app-text-subtle)]">{ui.signPhoneLabel}</span>
        <input
          className="input"
          value={details.phone ?? ""}
          onChange={(e) => onChange({ ...details, phone: e.target.value || null })}
          autoComplete="tel"
          inputMode="tel"
        />
      </label>

      <p className="text-xs text-amber-700 dark:text-amber-300/90">{ui.signAddressRequiredHint}</p>

      {details.kind === "pf" ? (
        <>
          <label className="block space-y-1 text-xs">
            <span className="font-medium text-[var(--app-text-subtle)]">{ui.signFieldLabel}</span>
            <input
              className="input"
              value={details.fullName ?? ""}
              onChange={(e) => onChange({ ...details, fullName: e.target.value })}
              autoComplete="name"
            />
          </label>
          <div className="grid gap-2 sm:grid-cols-2">
            <input
              className="input"
              placeholder="CPF"
              value={details.cpf ?? ""}
              onChange={(e) => onChange({ ...details, cpf: e.target.value })}
            />
            <input
              className="input"
              placeholder="RG"
              value={details.rg ?? ""}
              onChange={(e) => onChange({ ...details, rg: e.target.value })}
            />
            <input
              className="input"
              placeholder="Profissão"
              value={details.profession ?? ""}
              onChange={(e) => onChange({ ...details, profession: e.target.value })}
            />
            <input
              className="input"
              placeholder="Estado civil"
              value={details.maritalStatus ?? ""}
              onChange={(e) => onChange({ ...details, maritalStatus: e.target.value })}
            />
          </div>
          <AddressFields
            title="Endereço residencial"
            value={details.address ?? emptyAddress()}
            onChange={(address) => onChange({ ...details, address })}
          />
        </>
      ) : (
        <>
          <label className="block space-y-1 text-xs">
            <span className="font-medium text-[var(--app-text-subtle)]">{ui.signCompanyLabel}</span>
            <input
              className="input"
              value={details.corporateName ?? ""}
              onChange={(e) => onChange({ ...details, corporateName: e.target.value })}
            />
          </label>
          <div className="grid gap-2 sm:grid-cols-2">
            <input
              className="input"
              placeholder="CNPJ"
              value={details.cnpj ?? ""}
              onChange={(e) => onChange({ ...details, cnpj: e.target.value })}
            />
            <input
              className="input"
              placeholder="Inscrição estadual"
              value={details.stateRegistration ?? ""}
              onChange={(e) => onChange({ ...details, stateRegistration: e.target.value })}
            />
            <input
              className="input sm:col-span-2"
              placeholder="Inscrição municipal (se houver)"
              value={details.municipalRegistration ?? ""}
              onChange={(e) => onChange({ ...details, municipalRegistration: e.target.value })}
            />
          </div>
          <AddressFields
            title="Endereço da sede"
            value={details.hqAddress ?? emptyAddress()}
            onChange={(hqAddress) => onChange({ ...details, hqAddress })}
          />
          <fieldset className="space-y-2 rounded-lg border border-[var(--app-border)]/80 p-3">
            <legend className="px-1 text-xs font-semibold text-[var(--app-text-subtle)]">Representante legal</legend>
            <input
              className="input"
              placeholder="Nome completo"
              value={details.representativeName ?? ""}
              onChange={(e) => onChange({ ...details, representativeName: e.target.value })}
            />
            <div className="grid gap-2 sm:grid-cols-3">
              <input
                className="input"
                placeholder="CPF"
                value={details.representativeCpf ?? ""}
                onChange={(e) => onChange({ ...details, representativeCpf: e.target.value })}
              />
              <input
                className="input"
                placeholder="RG"
                value={details.representativeRg ?? ""}
                onChange={(e) => onChange({ ...details, representativeRg: e.target.value })}
              />
              <input
                className="input"
                placeholder="Cargo"
                value={details.representativeRole ?? ""}
                onChange={(e) => onChange({ ...details, representativeRole: e.target.value })}
              />
            </div>
          </fieldset>
        </>
      )}
    </div>
  );
}
