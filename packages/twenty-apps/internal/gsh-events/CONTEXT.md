# GSH Eventos

Funil comercial e operacional de eventos corporativos/privados da GSH (Gourmet & Co), modelado como uma extensão declarativa (Twenty App) do objeto Opportunity, Task e Company do Twenty CRM.

## Language

**Funil de eventos**:
O pipeline Kanban de Opportunity que representa a jornada comercial de um evento, da entrada do lead até o encerramento. Único para eventos internos e externos — a modalidade não cria pipelines separados.

**Etapa do funil** (campo `eventProcessStage`, rótulo "Etapa do evento"):
A posição canônica do deal no funil: Entrada, Qualificação, Proposta e negociação, Aceite e cadastro, Produção/formalização/evento, além de Encerrado, Perdido e Cancelado. É o único campo que move o funil.
_Avoid_: Stage, Situação atual — como campos concorrentes de progresso (ver `docs/research/crm-ux-benchmarks-gsh.md` no root do repo).

**Situação atual** (campo `eventCurrentSituation`):
Um status descritivo derivado do momento operacional do deal (ex.: "Formalização em andamento", "Em execução"), distinto da etapa do funil — não move o funil sozinho.

**Sub-processo (SP-N)**:
Uma unidade de trabalho documentada no mapeamento de processo da GSH (`~/Documents/gsh/Funnels/05-corporate-private-event/`, fora deste repo), numerada SP-0 a SP-12. Cada etapa do funil corresponde a um ou mais sub-processos — é o vocabulário de referência para justificar por que um gate ou uma tarefa automática existe.

**Modalidade**:
Interno (evento executado dentro de um venue GSH) ou Externo (fora do venue, no local do cliente). Variação puramente logística — não altera etapas comerciais nem a ordem dos documentos de formalização.
_Avoid_: "tipo de evento" para essa distinção — Tipo do evento é outro campo (coffee break, welcome coffee, etc.).

**Cadeia de formalização**:
A sequência estrita e obrigatória de quatro documentos gerados na etapa "Produção/formalização": Ordem de Serviço (OS) → Formulário de Compra → Nota Fiscal (NF) → Contrato. A OS é gerada propositalmente antes do contrato (risco interno aceito, "ônus interno"); o Contrato é gerado por último porque depende do número da NF.

**Gate de etapa**:
A validação bloqueante de campos obrigatórios exigida para avançar o deal de uma etapa do funil para a próxima (ou para Perdido/Cancelado). Só se aplica a avanços — recuos de etapa não passam por gate.

**Concluir (tarefa)**:
A ação no widget "Status agora" que abre um mini-formulário por tarefa, preenchendo o campo correspondente da cadeia de formalização (ou da transição de etapa) e marcando a Task como concluída num único passo. É o caminho preferido para avançar a cadeia; editar o campo diretamente (Fields widget, tabela) continua funcionando como alternativa. Substitui o padrão antigo de "tarefa em cadeia (drip task)" — as quatro tarefas da cadeia de formalização nascem todas juntas ao entrar na etapa, não mais uma de cada vez, porque o drip obrigava o vendedor a sair do board de tasks pra editar o registro toda vez que uma nova tarefa surgia.

**Atualizar evento**:
A ação de edição livre e completa do processo (Opportunity + Evento + Proposta + OS + Empresa), existente antes desta iniciativa e distinta dos modais dedicados de criação/gate de etapa — cobre qualquer edição fora do momento de criar ou avançar etapa.
