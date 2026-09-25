import {
  type CSSProperties,
  type ReactNode,
  type SyntheticEvent,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { RestApiClient } from 'twenty-client-sdk/rest';
import { defineFrontComponent } from 'twenty-sdk/define';
import {
  enqueueSnackbar,
  useFrontComponentExecutionContext,
} from 'twenty-sdk/front-component';
import { Button } from 'twenty-ui/input';

import {
  CONTRACT_STATUS,
  EVENT_CURRENT_SITUATION,
  EVENT_MODALITY,
  EVENT_PROCESS_STAGE,
  INVOICE_STATUS,
  PROPOSAL_STATUS,
  PURCHASE_FORM_STATUS,
  SERVICE_ORDER_STATUS,
} from 'src/constants/domain-options';
import { UPDATE_EVENT_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { CurrencyInput } from 'src/front-components/fields/CurrencyInput';
import { DateTimeInput } from 'src/front-components/fields/DateTimeInput';
import type { CompanyUpdate } from 'src/types/company-update';
import type { CorporateEventUpdate } from 'src/types/corporate-event-update';
import type { EventUpdateResponse } from 'src/types/event-update-response';
import type { EventUpdateSnapshot } from 'src/types/event-update-snapshot';
import type { OpportunityUpdate } from 'src/types/opportunity-update';
import type { ProposalUpdate } from 'src/types/proposal-update';
import type { SaveEventUpdateRequest } from 'src/types/save-event-update-request';
import type { ServiceOrderUpdate } from 'src/types/service-order-update';

const theme = {
  spacing1: 'var(--t-spacing-1)',
  spacing2: 'var(--t-spacing-2)',
  spacing3: 'var(--t-spacing-3)',
  spacing4: 'var(--t-spacing-4)',
  spacing6: 'var(--t-spacing-6)',
  spacing8: 'var(--t-spacing-8)',
  backgroundPrimary: 'var(--t-background-primary)',
  backgroundSecondary: 'var(--t-background-secondary)',
  border: 'var(--t-border-color-medium)',
  borderLight: 'var(--t-border-color-light)',
  radius: 'var(--t-border-radius-sm)',
  fontPrimary: 'var(--t-font-color-primary)',
  fontSecondary: 'var(--t-font-color-secondary)',
  fontTertiary: 'var(--t-font-color-tertiary)',
  fontInverted: 'var(--t-font-color-inverted)',
  fontFamily: 'var(--t-font-family)',
  sizeXs: 'var(--t-font-size-xs)',
  sizeSm: 'var(--t-font-size-sm)',
  sizeMd: 'var(--t-font-size-md)',
  blue: 'var(--t-color-blue)',
};

const styles: Record<string, CSSProperties> = {
  shell: {
    minHeight: '100%',
    background: theme.backgroundPrimary,
    color: theme.fontPrimary,
    fontFamily: theme.fontFamily,
    fontSize: theme.sizeSm,
  },
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 2,
    padding: `${theme.spacing4} ${theme.spacing6}`,
    borderBottom: `1px solid ${theme.borderLight}`,
    background: theme.backgroundPrimary,
  },
  title: { margin: 0, fontSize: theme.sizeMd },
  subtitle: { margin: `${theme.spacing1} 0 0`, color: theme.fontTertiary },
  body: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing3,
    padding: theme.spacing4,
    paddingBottom: '88px',
  },
  section: {
    border: `1px solid ${theme.borderLight}`,
    borderRadius: theme.radius,
    background: theme.backgroundSecondary,
    padding: theme.spacing3,
  },
  summary: { cursor: 'pointer', fontWeight: 600 },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
    gap: theme.spacing3,
    marginTop: theme.spacing3,
  },
  full: { gridColumn: '1 / -1' },
  field: { display: 'flex', flexDirection: 'column', gap: theme.spacing1 },
  label: { color: theme.fontSecondary, fontSize: theme.sizeXs, fontWeight: 500 },
  control: {
    width: '100%',
    minHeight: theme.spacing8,
    boxSizing: 'border-box',
    border: `1px solid ${theme.border}`,
    borderRadius: theme.radius,
    background: theme.backgroundPrimary,
    color: theme.fontPrimary,
    font: 'inherit',
    padding: `${theme.spacing2} ${theme.spacing3}`,
  },
  textarea: { minHeight: '84px', resize: 'vertical' },
  checkboxRow: { display: 'flex', alignItems: 'center', gap: theme.spacing2 },
  helper: { color: theme.fontTertiary, fontSize: theme.sizeXs },
  footer: {
    position: 'fixed',
    bottom: 0,
    right: 0,
    left: 0,
    zIndex: 3,
    display: 'flex',
    justifyContent: 'flex-end',
    gap: theme.spacing2,
    padding: theme.spacing3,
    borderTop: `1px solid ${theme.borderLight}`,
    background: theme.backgroundPrimary,
  },
  empty: { padding: theme.spacing6, color: theme.fontTertiary },
};

const readValue = (event: SyntheticEvent<HTMLElement>): string => {
  const source = event as {
    detail?: { value?: string };
    target?: { value?: string };
  };

  return source.detail?.value ?? source.target?.value ?? '';
};

const readChecked = (event: SyntheticEvent<HTMLElement>): boolean => {
  const source = event as {
    detail?: { checked?: boolean };
    target?: { checked?: boolean };
  };

  return source.detail?.checked ?? source.target?.checked ?? false;
};

const numberValue = (value: string): number | undefined =>
  value === '' ? undefined : Number(value);

type Option = { value: string; label: string };

const Field = ({ label, children, full = false, helper }: { label: string; children: ReactNode; full?: boolean; helper?: string }) => (
  <label style={{ ...styles.field, ...(full ? styles.full : {}) }}>
    <span style={styles.label}>{label}</span>
    {children}
    {helper ? <span style={styles.helper}>{helper}</span> : null}
  </label>
);

const TextInput = ({ value, onChange, type = 'text', disabled = false }: { value?: string | number; onChange: (value: string) => void; type?: string; disabled?: boolean }) => (
  <input type={type} value={value ?? ''} onChange={(event) => onChange(readValue(event))} disabled={disabled} style={styles.control} />
);

const TextArea = ({ value, onChange }: { value?: string; onChange: (value: string) => void }) => (
  <textarea value={value ?? ''} onChange={(event) => onChange(readValue(event))} style={{ ...styles.control, ...styles.textarea }} />
);

const Select = ({ value, options, onChange }: { value?: string; options: Option[]; onChange: (value: string) => void }) => (
  <select value={value ?? ''} onChange={(event) => onChange(readValue(event))} style={styles.control}>
    <option value="">Selecionar…</option>
    {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
  </select>
);

const stageOptions: Option[] = [
  [EVENT_PROCESS_STAGE.ENTRY, '1. Entrada'],
  [EVENT_PROCESS_STAGE.QUALIFICATION, '2. Qualificação'],
  [EVENT_PROCESS_STAGE.PROPOSAL_NEGOTIATION, '3. Proposta e negociação'],
  [EVENT_PROCESS_STAGE.ACCEPTANCE_REGISTRATION, '4. Aceite e cadastro'],
  [EVENT_PROCESS_STAGE.PRODUCTION_FORMALIZATION_EVENT, '5. Produção, formalização e evento'],
  [EVENT_PROCESS_STAGE.CLOSED, 'Encerrado'],
  [EVENT_PROCESS_STAGE.LOST, 'Perdido'],
  [EVENT_PROCESS_STAGE.CANCELLED, 'Cancelado'],
].map(([value, label]) => ({ value, label }));

const purchaseFormOptions: Option[] = [
  { value: PURCHASE_FORM_STATUS.NOT_STARTED, label: 'Não iniciado' },
  { value: PURCHASE_FORM_STATUS.SENT, label: 'Enviado' },
  { value: PURCHASE_FORM_STATUS.COMPLETED, label: 'Concluído' },
];

const invoiceOptions: Option[] = [
  { value: INVOICE_STATUS.NOT_REQUESTED, label: 'Não solicitada' },
  { value: INVOICE_STATUS.REQUESTED, label: 'Solicitada' },
  { value: INVOICE_STATUS.ISSUED, label: 'Emitida' },
];

const contractOptions: Option[] = [
  { value: CONTRACT_STATUS.NOT_STARTED, label: 'Não iniciado' },
  { value: CONTRACT_STATUS.SENT, label: 'Enviado' },
  { value: CONTRACT_STATUS.SIGNED, label: 'Assinado' },
];

const logisticsOptions: Option[] = [
  { value: 'NOT_APPLICABLE', label: 'Não aplicável' },
  { value: 'PENDING', label: 'Pendente' },
  { value: 'READY', label: 'Pronto(a)' },
];

type FormState = {
  opportunity: OpportunityUpdate;
  event: CorporateEventUpdate;
  proposal: ProposalUpdate;
  serviceOrder: ServiceOrderUpdate;
  company: CompanyUpdate;
};

const formFromSnapshot = (snapshot: EventUpdateSnapshot): FormState => ({
  opportunity: snapshot.opportunity,
  event: snapshot.event,
  proposal: { ...snapshot.latestProposal, createNewVersion: false },
  serviceOrder: { ...snapshot.serviceOrder, enabled: Boolean(snapshot.serviceOrder.id) },
  company: snapshot.company,
});

const UpdateEvent = () => {
  const opportunityId = useFrontComponentExecutionContext((context) =>
    context.recordId ?? (context.selectedRecordIds.length === 1 ? context.selectedRecordIds[0] : null),
  );
  const [snapshot, setSnapshot] = useState<EventUpdateSnapshot | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!opportunityId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setLoadError(null);
    try {
      const response = await new RestApiClient().post<EventUpdateResponse>('/s/gsh-events/update', { action: 'LOAD', opportunityId });
      if (!response.success || !response.snapshot) throw new Error(response.message);
      setSnapshot(response.snapshot);
      setForm(formFromSnapshot(response.snapshot));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível carregar o evento.';
      setLoadError(message);
      await enqueueSnackbar({ message, variant: 'error' });
    } finally {
      setLoading(false);
    }
  }, [opportunityId]);

  useEffect(() => { void load(); }, [load]);

  if (!opportunityId) {
    return <div style={styles.empty}>Selecione uma única oportunidade para atualizar o evento.</div>;
  }

  if (loading) {
    return <div style={styles.empty}>Carregando evento…</div>;
  }

  if (!form || !snapshot) {
    return <div style={styles.empty}><p>{loadError ?? 'Evento indisponível.'}</p><Button title="Tentar novamente" onClick={() => void load()} /></div>;
  }

  const setOpportunity = <K extends keyof OpportunityUpdate>(key: K, value: OpportunityUpdate[K]) =>
    setForm((current) => current ? { ...current, opportunity: { ...current.opportunity, [key]: value } } : current);
  const setEvent = <K extends keyof CorporateEventUpdate>(key: K, value: CorporateEventUpdate[K]) =>
    setForm((current) => current ? { ...current, event: { ...current.event, [key]: value } } : current);
  const setProposal = <K extends keyof ProposalUpdate>(key: K, value: ProposalUpdate[K]) =>
    setForm((current) => current ? { ...current, proposal: { ...current.proposal, [key]: value } } : current);
  const setServiceOrder = <K extends keyof ServiceOrderUpdate>(key: K, value: ServiceOrderUpdate[K]) =>
    setForm((current) => current ? { ...current, serviceOrder: { ...current.serviceOrder, [key]: value } } : current);
  const setCompany = <K extends keyof CompanyUpdate>(key: K, value: CompanyUpdate[K]) =>
    setForm((current) => current ? { ...current, company: { ...current.company, [key]: value } } : current);

  const save = async () => {
    setSaving(true);
    try {
      const request: SaveEventUpdateRequest = { action: 'SAVE', opportunityId, ...form };
      const response = await new RestApiClient().post<EventUpdateResponse>('/s/gsh-events/update', request);
      if (!response.success) throw new Error(response.message);
      if (response.snapshot) {
        setSnapshot(response.snapshot);
        setForm(formFromSnapshot(response.snapshot));
      }
      await enqueueSnackbar({ message: response.message, variant: 'success' });
    } catch (error) {
      await enqueueSnackbar({ message: error instanceof Error ? error.message : 'Não foi possível salvar.', variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const stage = form.opportunity.stage;
  const stageLabel = stageOptions.find((option) => option.value === stage)?.label ?? '—';

  return (
    <div style={styles.shell}>
      <header style={styles.header}>
        <h2 style={styles.title}>{snapshot.opportunityName}</h2>
        <p style={styles.subtitle}>{snapshot.companyName ?? 'Sem empresa vinculada'} · atualize o processo inteiro aqui</p>
      </header>
      <main style={styles.body}>
        <details open style={styles.section}>
          <summary style={styles.summary}>Agora: etapa, pendência e próxima ação</summary>
          <div style={styles.grid}>
            <Field label="Etapa do funil"><TextInput value={stageLabel} onChange={() => {}} disabled /></Field>
            <Field label="Situação atual"><Select value={form.opportunity.currentSituation} onChange={(value) => setOpportunity('currentSituation', value)} options={[
              { value: EVENT_CURRENT_SITUATION.PREPARE_OS, label: 'Preparar OS' },
              { value: EVENT_CURRENT_SITUATION.FORMALIZATION_IN_PROGRESS, label: 'Formalização em andamento' },
              { value: EVENT_CURRENT_SITUATION.EVENT_SCHEDULED, label: 'Evento agendado' },
              { value: EVENT_CURRENT_SITUATION.IN_EXECUTION, label: 'Em execução' },
              { value: EVENT_CURRENT_SITUATION.FEEDBACK_PENDING, label: 'Feedback pendente' },
              { value: EVENT_CURRENT_SITUATION.READY_TO_CLOSE, label: 'Pronto para encerrar' },
            ]} /></Field>
            <Field label="Pendência atual"><TextInput value={form.opportunity.currentPending} onChange={(value) => setOpportunity('currentPending', value)} /></Field>
            <Field label="Próxima ação"><TextInput value={form.opportunity.nextAction} onChange={(value) => setOpportunity('nextAction', value)} /></Field>
            <Field label="Data da próxima ação"><DateTimeInput value={form.opportunity.nextActionAt} onChange={(value) => setOpportunity('nextActionAt', value)} /></Field>
          </div>
        </details>

        <details open={stage === EVENT_PROCESS_STAGE.ENTRY || stage === EVENT_PROCESS_STAGE.QUALIFICATION} style={styles.section}>
          <summary style={styles.summary}>Briefing do evento</summary>
          <div style={styles.grid}>
            <Field label="Nome do evento"><TextInput value={form.event.name} onChange={(value) => setEvent('name', value)} /></Field>
            <Field label="Origem"><Select value={form.opportunity.source} onChange={(value) => setOpportunity('source', value)} options={[
              { value: 'EMAIL', label: 'E-mail' }, { value: 'WHATSAPP', label: 'WhatsApp' }, { value: 'REFERRAL', label: 'Indicação' }, { value: 'BH', label: 'BH' }, { value: 'RIO', label: 'Rio' }, { value: 'OTHER', label: 'Outro' },
            ]} /></Field>
            <Field label="Modalidade"><Select value={form.opportunity.modality} onChange={(value) => setOpportunity('modality', value)} options={[
              { value: EVENT_MODALITY.INTERNAL, label: 'Interno / na casa' }, { value: EVENT_MODALITY.EXTERNAL, label: 'Externo / fora da casa' },
            ]} /></Field>
            <Field label="Tipo"><Select value={form.event.eventType} onChange={(value) => setEvent('eventType', value)} options={[
              { value: 'COFFEE_BREAK', label: 'Coffee break' }, { value: 'WELCOME_COFFEE', label: 'Welcome coffee' }, { value: 'HAPPY_HOUR', label: 'Happy hour' }, { value: 'COCKTAIL', label: 'Coquetel' }, { value: 'FAIR', label: 'Feira' }, { value: 'MEAL', label: 'Refeição' }, { value: 'OTHER', label: 'Outro' },
            ]} /></Field>
            <Field label="Início"><DateTimeInput value={form.event.startAt ?? form.opportunity.eventAt} onChange={(value) => { setEvent('startAt', value); setOpportunity('eventAt', value); }} /></Field>
            <Field label="Fim"><DateTimeInput value={form.event.endAt} onChange={(value) => setEvent('endAt', value)} /></Field>
            <Field label="Local"><TextInput value={form.opportunity.location} onChange={(value) => setOpportunity('location', value)} /></Field>
            <Field label="Cidade"><TextInput value={form.event.city} onChange={(value) => setEvent('city', value)} /></Field>
            <Field label="Público estimado"><TextInput type="number" value={form.opportunity.audience} onChange={(value) => setOpportunity('audience', numberValue(value))} /></Field>
            <Field label="Público confirmado"><TextInput type="number" value={form.event.confirmedAudience} onChange={(value) => setEvent('confirmedAudience', numberValue(value))} /></Field>
            <Field label="Valor estimado (R$)"><CurrencyInput value={form.opportunity.amountBRL} onChange={(value) => setOpportunity('amountBRL', value)} /></Field>
            <Field label="Formato de serviço"><TextInput value={form.event.serviceFormat} onChange={(value) => setEvent('serviceFormat', value)} /></Field>
            <Field label="Salas e espaços"><TextInput value={form.event.rooms} onChange={(value) => setEvent('rooms', value)} /></Field>
            <Field label="Resumo do cardápio" full><TextArea value={form.event.menuSummary} onChange={(value) => setEvent('menuSummary', value)} /></Field>
            <Field label="Restrições e observações" full><TextArea value={form.event.restrictions} onChange={(value) => setEvent('restrictions', value)} /></Field>
          </div>
        </details>

        <details open={stage === EVENT_PROCESS_STAGE.PROPOSAL_NEGOTIATION} style={styles.section}>
          <summary style={styles.summary}>Proposta e negociação</summary>
          <div style={styles.grid}>
            <label style={{ ...styles.checkboxRow, ...styles.full }}>
              <input type="checkbox" checked={form.proposal.createNewVersion} onChange={(event) => {
                const checked = readChecked(event);
                setForm((current) => current ? { ...current, proposal: { ...current.proposal, createNewVersion: checked, version: checked ? (snapshot.latestProposal.version ?? 0) + 1 : current.proposal.version } } : current);
              }} />
              Registrar estes dados como nova versão da proposta
            </label>
            {!form.proposal.createNewVersion ? <span style={{ ...styles.helper, ...styles.full }}>Os dados abaixo mostram a última versão e ficam protegidos. Marque a opção acima para registrar uma nova versão.</span> : null}
            <fieldset disabled={!form.proposal.createNewVersion} style={{ display: 'contents' }}>
              <Field label="Título"><TextInput value={form.proposal.name} onChange={(value) => setProposal('name', value)} /></Field>
              <Field label="Versão"><TextInput type="number" value={form.proposal.version} onChange={(value) => setProposal('version', numberValue(value))} /></Field>
              <Field label="Status"><Select value={form.proposal.status} onChange={(value) => setProposal('status', value)} options={[
                { value: PROPOSAL_STATUS.DRAFT, label: 'Rascunho' }, { value: PROPOSAL_STATUS.SENT, label: 'Enviada' }, { value: PROPOSAL_STATUS.SUPERSEDED, label: 'Substituída' }, { value: PROPOSAL_STATUS.ACCEPTED, label: 'Aceita' }, { value: PROPOSAL_STATUS.REJECTED, label: 'Recusada' },
              ]} /></Field>
              <Field label="Valor total (R$)"><CurrencyInput value={form.proposal.totalBRL} onChange={(value) => setProposal('totalBRL', value)} /></Field>
              <Field label="Valor por pessoa (R$)"><CurrencyInput value={form.proposal.perPersonBRL} onChange={(value) => setProposal('perPersonBRL', value)} /></Field>
              <Field label="Validade"><DateTimeInput value={form.proposal.validUntil} onChange={(value) => setProposal('validUntil', value)} /></Field>
              <Field label="Enviada em"><DateTimeInput value={form.proposal.sentAt} onChange={(value) => setProposal('sentAt', value)} /></Field>
              <Field label="Link do documento"><TextInput value={form.proposal.documentUrl} onChange={(value) => setProposal('documentUrl', value)} /></Field>
              <Field label="Condições de pagamento" full><TextArea value={form.proposal.paymentTerms} onChange={(value) => { setProposal('paymentTerms', value); setOpportunity('paymentTerms', value); }} /></Field>
              <Field label="Alterações desta versão" full><TextArea value={form.proposal.changeSummary} onChange={(value) => setProposal('changeSummary', value)} /></Field>
            </fieldset>
          </div>
        </details>

        <details open={stage === EVENT_PROCESS_STAGE.ACCEPTANCE_REGISTRATION} style={styles.section}>
          <summary style={styles.summary}>Aceite e cadastro do cliente</summary>
          <div style={styles.grid}>
            <Field label="Evidência do aceite" full><TextArea value={form.opportunity.acceptanceEvidence} onChange={(value) => setOpportunity('acceptanceEvidence', value)} /></Field>
            <Field label="Valor fechado (R$)"><CurrencyInput value={form.opportunity.closedAmountBRL} onChange={(value) => setOpportunity('closedAmountBRL', value)} /></Field>
            <Field label="Razão social" helper={!form.company.id ? 'Vincule uma empresa à oportunidade antes de salvar o cadastro fiscal.' : undefined}><TextInput disabled={!form.company.id} value={form.company.legalName} onChange={(value) => setCompany('legalName', value)} /></Field>
            <Field label="CNPJ / identificação fiscal"><TextInput disabled={!form.company.id} value={form.company.taxId} onChange={(value) => setCompany('taxId', value)} /></Field>
            <Field label="E-mail de faturamento"><TextInput disabled={!form.company.id} value={form.company.billingEmail} onChange={(value) => setCompany('billingEmail', value)} /></Field>
          </div>
        </details>

        <details open={stage === EVENT_PROCESS_STAGE.PRODUCTION_FORMALIZATION_EVENT} style={styles.section}>
          <summary style={styles.summary}>Produção, formalização e ordem de serviço</summary>
          <div style={styles.grid}>
            <Field label="Ficha de compras"><Select value={form.opportunity.purchaseFormStatus} options={purchaseFormOptions} onChange={(value) => setOpportunity('purchaseFormStatus', value)} /></Field>
            <Field label="Nota fiscal"><Select value={form.opportunity.invoiceStatus} options={invoiceOptions} onChange={(value) => setOpportunity('invoiceStatus', value)} /></Field>
            <Field label="Contrato"><Select value={form.opportunity.contractStatus} options={contractOptions} onChange={(value) => setOpportunity('contractStatus', value)} /></Field>
            <Field label="Montagem"><Select value={form.event.assemblyStatus} options={logisticsOptions} onChange={(value) => setEvent('assemblyStatus', value)} /></Field>
            <Field label="Deslocamento"><Select value={form.event.travelStatus} options={logisticsOptions} onChange={(value) => setEvent('travelStatus', value)} /></Field>
            <Field label="Abastecimento"><Select value={form.event.supplyStatus} options={logisticsOptions} onChange={(value) => setEvent('supplyStatus', value)} /></Field>
            <Field label="Equipe"><Select value={form.event.teamStatus} options={logisticsOptions} onChange={(value) => setEvent('teamStatus', value)} /></Field>
            <label style={{ ...styles.checkboxRow, ...styles.full }}><input type="checkbox" checked={form.serviceOrder.enabled} onChange={(event) => setServiceOrder('enabled', readChecked(event))} />Criar ou atualizar a ordem de serviço</label>
            <Field label="Título da OS"><TextInput value={form.serviceOrder.name} onChange={(value) => setServiceOrder('name', value)} /></Field>
            <Field label="Status da OS"><Select value={form.serviceOrder.status} onChange={(value) => setServiceOrder('status', value)} options={[
              { value: SERVICE_ORDER_STATUS.PREPARING, label: 'Em preparação' }, { value: SERVICE_ORDER_STATUS.ISSUED, label: 'Emitida' }, { value: SERVICE_ORDER_STATUS.DISTRIBUTED, label: 'Distribuída' }, { value: SERVICE_ORDER_STATUS.COMPLETED, label: 'Concluída' },
            ]} /></Field>
            <Field label="Responsável operacional"><TextInput value={form.serviceOrder.responsible} onChange={(value) => setServiceOrder('responsible', value)} /></Field>
            <Field label="Distribuição concluída"><Select value={form.serviceOrder.distributionStatus} onChange={(value) => setServiceOrder('distributionStatus', value)} options={[{ value: 'NO', label: 'Não' }, { value: 'PARTIAL', label: 'Parcial' }, { value: 'YES', label: 'Sim' }]} /></Field>
            <Field label="Distribuída em"><DateTimeInput value={form.serviceOrder.distributedAt} onChange={(value) => setServiceOrder('distributedAt', value)} /></Field>
            <Field label="Link da OS"><TextInput value={form.serviceOrder.documentUrl} onChange={(value) => setServiceOrder('documentUrl', value)} /></Field>
            <Field label="Cronograma" full><TextArea value={form.serviceOrder.timeline} onChange={(value) => setServiceOrder('timeline', value)} /></Field>
            <Field label="Cardápio final" full><TextArea value={form.serviceOrder.finalMenu} onChange={(value) => setServiceOrder('finalMenu', value)} /></Field>
            <Field label="Estrutura e equipamentos" full><TextArea value={form.serviceOrder.structureAndEquipment} onChange={(value) => setServiceOrder('structureAndEquipment', value)} /></Field>
            <Field label="Orientações à equipe" full><TextArea value={form.serviceOrder.teamGuidance} onChange={(value) => setServiceOrder('teamGuidance', value)} /></Field>
          </div>
        </details>

        <details open={form.opportunity.currentSituation === EVENT_CURRENT_SITUATION.IN_EXECUTION || form.opportunity.currentSituation === EVENT_CURRENT_SITUATION.FEEDBACK_PENDING} style={styles.section}>
          <summary style={styles.summary}>Execução e feedback</summary>
          <div style={styles.grid}>
            <Field label="Status da execução"><Select value={form.event.executionStatus} onChange={(value) => setEvent('executionStatus', value)} options={[
              { value: 'NOT_STARTED', label: 'Não iniciada' }, { value: 'SCHEDULED', label: 'Agendada' }, { value: 'IN_PROGRESS', label: 'Em execução' }, { value: 'COMPLETED', label: 'Concluída' },
            ]} /></Field>
            <Field label="Status do feedback"><Select value={form.event.feedbackStatus} onChange={(value) => setEvent('feedbackStatus', value)} options={[
              { value: 'PENDING', label: 'Pendente' }, { value: 'REQUESTED', label: 'Solicitado' }, { value: 'RECEIVED', label: 'Recebido' }, { value: 'NOT_APPLICABLE', label: 'Não aplicável' },
            ]} /></Field>
            <Field label="Notas da execução" full><TextArea value={form.event.executionNotes} onChange={(value) => setEvent('executionNotes', value)} /></Field>
            <Field label="Feedback do cliente" full><TextArea value={form.event.feedback} onChange={(value) => setEvent('feedback', value)} /></Field>
            {(stage === EVENT_PROCESS_STAGE.LOST || stage === EVENT_PROCESS_STAGE.CANCELLED) ? <Field label="Motivo da perda/cancelamento"><Select value={form.opportunity.lossReason} onChange={(value) => setOpportunity('lossReason', value)} options={[
              { value: 'PRICE', label: 'Preço' }, { value: 'DATE', label: 'Data ou disponibilidade' }, { value: 'SCOPE', label: 'Escopo' }, { value: 'COMPETITOR', label: 'Concorrente' }, { value: 'NO_RESPONSE', label: 'Sem retorno' }, { value: 'OTHER', label: 'Outro' },
            ]} /></Field> : null}
          </div>
        </details>
      </main>
      <footer style={styles.footer}>
        <Button title={saving ? 'Salvando…' : 'Salvar atualização'} onClick={() => void save()} disabled={saving} isLoading={saving} />
      </footer>
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: UPDATE_EVENT_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'update-event',
  description: 'Atualização unificada e contextual do processo de um evento GSH.',
  component: UpdateEvent,
});
