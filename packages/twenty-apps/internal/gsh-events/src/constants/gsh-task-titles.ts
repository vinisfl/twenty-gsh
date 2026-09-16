// mirror of the Gsh*TaskTitle.ts files in
// packages/twenty-front/src/modules/object-record/record-persistence-gate/constants/
// — manter em sincronia. twenty-shared não é uma dependência viável aqui:
// gsh-events roda como projeto Yarn standalone (fora do workspace raiz, com
// yarn.lock e node_modules próprios) que resolve dependências via npm
// registry, e o twenty-shared deste monorepo é `private: true`, nunca
// publicado sob esse nome (`yarn add twenty-shared@workspace:*` falha com
// "Workspace not found" a partir deste pacote — decisão registrada na
// issue #58).
export const GSH_EVENT_INITIAL_CONTACT_TASK_TITLE =
  'Fazer contato inicial e capturar briefing';

export const GSH_EVENT_REGISTRATION_REQUEST_TASK_TITLE =
  'Solicitar ficha cadastral ao cliente';

export const GSH_PROPOSAL_TASK_TITLE = 'Montar e enviar proposta';

export const GSH_PROPOSAL_FOLLOWUP_TASK_TITLE =
  'Fazer follow-up da proposta';

export const GSH_EVENT_SERVICE_ORDER_TASK_TITLE = 'Gerar Ordem de Serviço';

export const GSH_PURCHASE_FORM_TASK_TITLE = 'Preencher Formulário de Compra';

export const GSH_INVOICE_FOLLOWUP_TASK_TITLE =
  'Acompanhar emissão de NF junto ao financeiro';

export const GSH_CONTRACT_TASK_TITLE = 'Gerar contrato';
