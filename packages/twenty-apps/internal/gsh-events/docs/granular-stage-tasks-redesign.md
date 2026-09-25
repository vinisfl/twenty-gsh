# Redesenho: tasks granulares por etapa do funil de Oportunidades

Resultado de uma sessão de grilling (2026-09-18). Complementa
[`guided-funnel-journey-spec.md`](./guided-funnel-journey-spec.md) — não o substitui. Objetivo: em vez de
uma task por etapa com um mini-formulário multi-campo, cada dado exigido pelo próximo gate vira sua
própria task ("Coletar X"), cujo "Concluir" preenche exatamente aquele campo — o dado é capturado assim
que fica disponível na conversa, em vez de esperar o momento de avançar de etapa.

Cada seção abaixo é candidata a virar uma issue separada.

---

## 1. Contato inicial vira task de envio, com anexo obrigatório

**Etapa:** Entrada / Qualificação — criada junto com a Oportunidade.

**Muda:** a atual task "Fazer contato inicial e capturar briefing" deixa de capturar briefing. Vira
**"Enviar contato inicial"** — só sobre o ato de contatar o cliente.

- Prazo: próximo dia útil (mantém o atual).
- Responsável: dono do deal (mantém o atual).
- Concluir exige anexar um arquivo (print do e-mail enviado) via a aba de anexos da Task (já suportada
  nativamente — `attachments` relation, mesmo padrão de Opportunity/Company). Sem anexo, o "Concluir" não
  fecha a task.
- Ao concluir com sucesso, dispara a criação das 5 tasks da seção 2.

**Por quê:** hoje não existe evidência de que o contato inicial de fato aconteceu; a task apenas
descreve uma intenção. Exigir o anexo alinha com o rigor já aplicado em outros pontos do funil
(evidência do aceite, por exemplo).

---

## 2. Tasks granulares "Coletar X" em Qualificação

**Etapa:** Qualificação — criadas automaticamente ao concluir "Enviar contato inicial" (seção 1), não
antes.

Cinco tasks, uma por campo hoje exigido pelo gate → Proposta e negociação:

- "Coletar tipo de evento"
- "Coletar público estimado"
- "Coletar local/cidade"
- "Coletar data do evento"
- "Coletar valor estimado"

- Prazo: nenhum (coletadas organicamente ao longo da conversa).
- Responsável: dono do deal.
- Concluir cada uma abre um mini-formulário de um único campo e grava direto na Oportunidade.

**Gate → Proposta e negociação:** sem mudança na validação (ainda checa os mesmos 5 campos + o
checkbox "orçamento compatível"), mas os campos já aparecem preenchidos/herdados se as tasks
correspondentes foram concluídas — o vendedor só confirma o checkbox e avança.

**Por quê:** exemplo motivador da sessão — hoje o vendedor só é solicitado a preencher esses 5 campos
no momento de tentar avançar de etapa, mesmo que já soubesse as respostas há dias.

---

## 3. Follow-up da proposta com desfecho ramificado + task de revisão recorrente

**Etapa:** Proposta e negociação. "Montar e enviar proposta" (24h) e a criação de "Fazer follow-up da
proposta" (24h) ao marcar a proposta como "Enviada" **não mudam**.

**Muda o Concluir de "Fazer follow-up da proposta":** passa a perguntar o desfecho da conversa com o
cliente:

- **"Cliente aceitou"** → preenche status da proposta = Aceita + pede o valor fechado. Com isso, os
  campos exigidos pelo gate → Aceite e cadastro já ficam prontos.
- **"Cliente pediu alteração"** → não avança nada; cria automaticamente uma nova task **"Negociar
  revisão da proposta"**, vinculada à task anterior (para formar um histórico rastreável do ciclo).
  Essa nova task tem o mesmo desfecho de duas saídas — pode se repetir quantas vezes o cliente pedir
  revisão.

**Por quê:** SP-4 (`~/Documents/gsh/Funnels/05-corporate-private-event/processes/sp4-followup-negotiation-revisions.md`)
documenta ciclos observados de até 7 revisões sem nenhum rastreamento hoje — nem no funil real, nem no
código atual, que só cria uma única task de follow-up sem loop.

---

## 4. Ficha cadastral vira 4 tasks granulares em Aceite e cadastro

**Etapa:** Aceite e cadastro — criadas ao avançar de Proposta e negociação, substituindo a atual
"Solicitar ficha cadastral ao cliente".

- "Coletar razão social"
- "Coletar CNPJ"
- "Coletar e-mail de faturamento"
- "Coletar evidência do aceite"

- Prazo: nenhum.
- Responsável: dono do deal.
- Concluir cada uma grava o campo correspondente (as 3 fiscais no objeto Company, evidência do aceite
  na Oportunidade).

**Gate → Produção/formalização:** sem mudança na validação (evidência do aceite, valor fechado, dados
fiscais), mas os campos já aparecem preenchidos/herdados se as 4 tasks foram concluídas.

**Por quê:** mesma lógica da seção 2 — os dados fiscais costumam chegar aos poucos (ficha cadastral do
cliente, contato com financeiro), não todos de uma vez no momento do avanço de etapa.

---

## Sem mudanças (confirmado nesta sessão, não entram como issue)

- **Produção/formalização:** a cadeia de 4 tasks (Gerar OS → Preencher Formulário de Compra →
  Acompanhar NF → Gerar contrato) já segue este mesmo padrão — Concluir preenche o campo
  correspondente e libera o próximo elo. Nenhuma mudança necessária.
- **Encerrado:** status de execução do evento e o checklist logístico (Montagem, Deslocamento,
  Abastecimento, Equipe) continuam como campos preenchidos direto no gate de fechamento — não viram
  tasks nesta rodada.
- **SP-12 "Solicitar feedback do cliente"** (1 dia após o evento, via workflow agendado): continua
  documentado em `guided-funnel-journey-spec.md` como pendência conhecida, não implementado. Ficou
  fora do escopo desta rodada por ser um trigger por data, não uma task de transição de etapa.

---

## Notas de implementação (para quem for abrir as issues)

- Todas as tasks novas seguem o mecanismo já existente: `Task` normal vinculada à Opportunity via
  `TaskTarget`, mesmo padrão usado hoje pelas tasks de etapa e lido por `get-next-open-task.util.ts`
  (painel "Status agora"/"Próxima ação").
- O padrão de mini-formulário no "Concluir" que preenche um campo e fecha a task num único passo já
  existe hoje para "Montar e enviar proposta" → "Enviada em" (issue #61) e para os itens da cadeia de
  formalização (`OpportunityFormalizationChainGateHandler.tsx`) — as novas tasks replicam esse mesmo
  mecanismo, só que com granularidade de um campo por task.
- Os gates de transição de etapa (`OpportunityQualificationGateModal.tsx`,
  `OpportunityAcceptanceGateModal.tsx`, etc.) não perdem sua validação — continuam checando os campos
  da Oportunidade/Company diretamente. A mudança é só *onde e quando* esses campos são preenchidos.
