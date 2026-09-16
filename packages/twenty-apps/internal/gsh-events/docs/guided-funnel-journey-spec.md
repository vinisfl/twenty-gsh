# Jornada guiada do funil de eventos — spec de implementação

Resultado de uma sessão de grilling (2026-09-03). Ver [`../CONTEXT.md`](../CONTEXT.md) para vocabulário (Etapa do funil, Gate de etapa, Cadeia de formalização, Concluir) e [`adr/0001-hard-stage-gate-requires-core-patches.md`](./adr/0001-hard-stage-gate-requires-core-patches.md) para a decisão de tocar core do `twenty-front`, [`adr/0002-formalization-chain-lock-requires-persist-gate-patch.md`](./adr/0002-formalization-chain-lock-requires-persist-gate-patch.md) para o gate de campo que trava a cadeia de formalização, e [`adr/0003-task-completion-stays-in-gsh-events-sandbox.md`](./adr/0003-task-completion-stays-in-gsh-events-sandbox.md) para o "Concluir".

Fonte das regras de negócio: `~/Documents/gsh/Funnels/05-corporate-private-event/` (sub-processos SP-0 a SP-12, fora deste repo).

## Escopo

Todos os tipos de evento no funil de Oportunidades (interno e externo — mesmo motor comercial, só o checklist logístico varia).

## Arquitetura

- Modais novos e dedicados por momento (criação / cada transição de etapa) — não reaproveitam o formulário grande de "Atualizar evento" (`update-event.front-component.tsx`), que continua existindo para edição livre.
- Bloqueio rígido: nem a criação nem a mudança de etapa persistem sem passar pelo gate. Isso exige os patches de core descritos na ADR-0001 (`RecordBoardColumnNewRecordButton.tsx`, `CreateNewIndexRecordNoSelectionRecordCommand.tsx`, `useRecordBoardDndKit.ts`/`useProcessBoardCardDrop.ts`), condicionados ao objeto Opportunity.
- Tarefas automáticas são Task records normais vinculados à Opportunity — reaproveitam o mecanismo já existente (`get-next-open-task.util.ts`) que alimenta o painel "Status agora"/"Próxima ação".
- Dados fiscais da empresa (razão social, CNPJ, e-mail de faturamento) são lidos/gravados no objeto Company, nunca duplicados no modal — só pedidos se estiverem faltando.

## Criação (substitui o botão nativo "+ Novo" / "+ New Opportunity")

- Modal bloqueante: o registro só é criado no confirm.
- Campos mínimos (independente da coluna clicada): Nome do evento, Empresa/Contato (obrigatório; permite criar a empresa inline se não existir), Modalidade, Data prevista do evento, Valor estimado, Origem.
- Se criado direto numa coluna mais avançada do Kanban, o modal pede **cumulativamente** os campos obrigatórios de todas as etapas até ali (ver gates abaixo).
- Tarefa automática: **"Fazer contato inicial e capturar briefing"**, vencendo no próximo dia útil, atribuída ao dono do deal. Cria só a tarefa da etapa em que o deal nasceu — não gera tarefas retroativas das etapas puladas quando criado avançado.

## Gates de transição de etapa

Só se aplicam a **avanços** (mover pra uma etapa à frente). Recuos (voltar pra trás no funil) são livres, sem gate.

### → Proposta e negociação (saindo de Qualificação)

- Campos obrigatórios: tipo de evento, público estimado, local/cidade, data do evento, valor estimado.
- Confirmação explícita: "orçamento compatível" (checkbox).
- Ao confirmar o avanço: cria tarefa **"Montar e enviar proposta"**, prazo 24h.

### Dentro de Proposta e negociação (sem mudar etapa)

- Ao marcar a proposta como "Enviada" (preencher "Enviada em"): cria automaticamente **"Fazer follow-up da proposta"**, prazo 24h. Implementado — "Concluir" na tarefa "Montar e enviar proposta" abre um mini-formulário que preenche "Enviada em", marca a tarefa como concluída e cria o follow-up num único passo (issue #61).

### → Aceite e cadastro (saindo de Proposta e negociação)

- Campos obrigatórios: proposta com status "Aceita" + valor fechado preenchido.
- Ao confirmar o avanço: cria tarefa **"Solicitar ficha cadastral ao cliente"**.

### → Produção/formalização (saindo de Aceite e cadastro)

- Campos obrigatórios: evidência do aceite, valor fechado, dados fiscais da empresa (razão social, CNPJ, e-mail de faturamento — lidos do objeto Company).
- Ao confirmar o avanço: cria as quatro tarefas da cadeia de formalização de uma vez — **"Gerar Ordem de Serviço"**, **"Preencher Formulário de Compra"**, **"Acompanhar emissão de NF junto ao financeiro"** e **"Gerar contrato"** (prazo 7 dias nesta última, SLA documentado de assinatura) — todas atribuídas ao dono do deal, mesmo quando o trabalho real é de outra área (ex: Financeiro emite a NF, mas a tarefa fica com o vendedor de acompanhamento). Isso substitui o padrão antigo de "tarefa em cadeia (drip task)", em que cada tarefa só nascia quando a anterior era concluída (ver `CONTEXT.md` — Concluir).

### Dentro de Produção/formalização — cadeia de formalização travada em ordem

As quatro tarefas já existem desde a entrada na etapa, mas cada campo/status só fica editável depois que o anterior da cadeia estiver completo:

1. OS gerada → libera Formulário de Compra.
2. Formulário de Compra enviado → libera Nota Fiscal.
3. NF registrada → libera Contrato.
4. Contrato gerado.

"Concluir" em cada tarefa é o caminho preferido para preencher o campo correspondente e travar/destravar o próximo elo num só passo; editar o campo diretamente (Fields widget, tabela) continua funcionando como alternativa e respeita o mesmo gate de campo (ADR-0002). O gate de campo que impõe essa ordem é o mesmo antes e depois da reversão do drip — só a criação das tarefas mudou de "uma de cada vez" para "todas juntas" (issue #59).

### → Encerrado (saindo de Produção/formalização)

- Campos obrigatórios: contrato assinado + status de execução do evento = "Concluída" + checklist logístico (Montagem, Deslocamento, Abastecimento, Equipe) todos "Pronto" ou "Não aplicável".

### → Perdido / Cancelado (de qualquer etapa)

- Sempre exige o motivo (campo "Motivo da perda/cancelamento", já existe).

## Automação por data (fora do fluxo de etapa)

- 1 dia após a data do evento: cria automaticamente **"Solicitar feedback do cliente"**, via workflow agendado nativo do Twenty (trigger por data, não por mudança de etapa — SP-12).

## Fora de escopo desta iteração (não perguntado/decidido)

- SP-11 (acompanhamento de liderança em evento de cliente estratégico) — critério de "alto potencial" não documentado, não entrou no escopo.
- Cancellation penalty tiers (SP-9) — não documentado na fonte, não afeta o gate.
