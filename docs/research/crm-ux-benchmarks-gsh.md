# Benchmarks de UX para o CRM de eventos GSH

## Escopo e método

Análise das três capturas fornecidas em 28 de agosto de 2026, comparada a padrões documentados em fontes primárias de Salesforce, HubSpot, Pipedrive e Atlassian. O objetivo não é copiar uma interface, mas identificar decisões recorrentes que melhor resolvem cinco tarefas: saber o que fazer agora, avançar uma oportunidade, recuperar contexto, gerir o pipeline e prever o resultado.

As recomendações abaixo são sínteses de design: onde há uma afirmação sobre um produto de referência, a fonte oficial está ligada diretamente no texto.

## Resumo executivo

O principal problema não é visual; é de modelo mental. A interface atual tenta fazer o mesmo registro representar, ao mesmo tempo, oportunidade comercial, evento, checklist de formalização, produção e ordem de serviço. Por isso aparecem campos semanticamente concorrentes (`Stage`, `Etapa do evento`, `Situação atual`, `Pendência atual`, `Próxima ação`) e dezenas de propriedades sem uma hierarquia clara.

Os benchmarks convergem para cinco decisões:

1. **A home do vendedor deve ser uma fila de ações, não um cadastro.** O HubSpot reúne tarefas vencidas, de hoje e de amanhã e permite iniciar uma fila; o Pipedrive prioriza deals por próxima atividade, colocando vencidos e atividades de hoje no topo. ([HubSpot](https://knowledge.hubspot.com/sales-workspace/manage-sales-activities-in-the-updated-sales-workspace), [Pipedrive](https://support.pipedrive.com/en/article/how-are-deals-ordered-in-the-pipeline-view))
2. **O Kanban deve responder “onde está” e “o que requer atenção”.** No Pipedrive, o cartão padrão contém título, contato, valor, label e responsável; a próxima atividade é acionável no próprio cartão, e detalhes completos abrem uma visão dedicada. ([Pipedrive](https://support.pipedrive.com/en/article/pipeline-view), [customização dos cartões](https://support.pipedrive.com/en/article/deal-card-customization-sorting))
3. **O detalhe deve começar com um resumo e revelar o restante por contexto.** O Pipedrive mantém um resumo fixo no topo, permite reordenar/ocultar seções e concentra itens que exigem atenção em “Focus”; o HubSpot organiza o registro por visão geral, atividades e associações, com cards e seções recolhíveis. ([Pipedrive](https://support.pipedrive.com/en/article/deal-detail-view), [HubSpot](https://knowledge.hubspot.com/records/understand-the-default-record-layout))
4. **Vendedor e gestor precisam de vistas diferentes sobre a mesma fonte de dados.** O HubSpot separa a execução diária do Sales Workspace do forecast por equipe/usuário, incluindo meta, realizado, gap, cobertura e drill-down por negócio; o Salesforce Pipeline Inspection consolida métricas, mudanças recentes e oportunidades para coaching. ([HubSpot Sales Workspace](https://knowledge.hubspot.com/sales-workspace/manage-sales-activities-in-the-updated-sales-workspace), [HubSpot Forecast](https://knowledge.hubspot.com/forecast/use-the-forecast-tool), [Salesforce Pipeline Inspection](https://help.salesforce.com/s/articleView?id=sales.pipeline_inspection_managing_pipelines_overview.htm&language=en_US))
5. **Venda e entrega devem ser objetos/processos relacionados, não etapas do mesmo funil.** O Pipedrive distingue Deals, usados para acompanhar oportunidade e receita até `won/lost`, de Projects, usados para entrega, onboarding ou execução com tarefas e marcos, mantendo os dois vinculados. ([Pipedrive: Projects vs. Deals](https://support.pipedrive.com/en/article/projects-vs-deals?category=features), [Pipedrive Projects](https://support.pipedrive.com/en/article/projects-by-pipedrive))

## Diagnóstico das capturas

### 1. O Kanban perdeu sua função de varredura

Na captura ampla, a barra lateral de edição ocupa aproximadamente um quarto da tela enquanto cinco colunas competem pelo restante. Os cartões trazem valor, datas, local, modalidade, próxima ação e pendência, mas truncam justamente os identificadores e textos necessários para diferenciar os eventos. A quantidade de chips e cores reduz o sinal de urgência: cor passa a representar categoria, estágio, modalidade e situação ao mesmo tempo.

Em contraste, o Pipedrive define uma base pequena para o cartão — título, contato/organização, valor, label e owner —, permite até sete campos adicionais por usuário/pipeline e usa o estado da próxima atividade para ordenar as oportunidades. ([Pipedrive: customização](https://support.pipedrive.com/en/article/deal-card-customization-sorting), [Pipedrive: priorização](https://support.pipedrive.com/en/article/how-are-deals-ordered-in-the-pipeline-view))

**Implicação para a GSH:** o cartão deve ter no máximo dois níveis de leitura:

- Identificação: evento/cliente e valor.
- Ação: próxima ação + prazo, com um único estado visual de atenção (`atrasada`, `hoje`, `sem próxima ação`, `agendada`).

Local, modalidade, público, NF, contrato e produção pertencem ao detalhe ou a cartões especializados, salvo quando o usuário escolhe exibi-los. Essa recomendação é uma inferência apoiada pelo recorte de campos e pela ordenação baseada em atividade documentados pelo Pipedrive. ([fonte](https://support.pipedrive.com/en/article/pipeline-view))

### 2. O registro expõe a estrutura do banco, não a tarefa do usuário

Nas capturas estreitas, o usuário percorre uma lista longa e pouco agrupada; rótulos são truncados antes dos valores. Há pelo menos três representações do avanço do trabalho (`Stage: New`, `Etapa do evento: 5...`, `Situação atual: Formalização em andamento`). Sem uma regra explícita de precedência, o usuário não sabe qual campo move o funil ou alimenta a gestão.

Salesforce Path exibe por etapa um conjunto de até cinco campos-chave e orientação contextual, em vez de mostrar todos os campos como igualmente importantes. ([Salesforce](https://help.salesforce.com/s/articleView?id=000388000&language=en_US&type=1)) O próprio modelo de Opportunity mantém `Stage`, `Close Date`, `Amount` e `Next Step` como conceitos centrais do negócio. ([Salesforce Opportunity Fields](https://help.salesforce.com/s/articleView?id=sales.opp_fields.htm&language=en_US))

Pipedrive coloca no resumo dados centrais — score, valor, probabilidade, data esperada, contato e organização — e deixa seções reordenáveis/ocultáveis abaixo; itens acionáveis ficam em uma área de foco separada do histórico. ([Pipedrive](https://support.pipedrive.com/en/article/deal-detail-view)) O HubSpot separa propriedades, visão geral/atividades e associações em áreas e cards distintos, além de permitir seções recolhíveis e layouts por equipe. ([HubSpot layout](https://knowledge.hubspot.com/records/understand-the-default-record-layout), [HubSpot customização](https://knowledge.hubspot.com/object-settings/customize-records))

**Implicação para a GSH:** deve existir uma única “Etapa do funil” canônica. “Situação atual” pode ser eliminada ou convertida em status derivado. “Pendência” deve ser derivada do próximo requisito não concluído ou representada por uma tarefa; “Próxima ação” deve ser uma atividade com responsável e prazo, não apenas texto.

### 3. A atualização é um formulário de sistema, não uma decisão guiada

Na captura ampla, “Atualizar evento” abre grupos longos e exige que o vendedor entenda o modelo interno. A ação primária fica distante do contexto do cartão e o salvamento aparece abaixo da dobra. Isso aumenta a chance de abandono ou atualização parcial.

No Salesforce, o Path associa campos-chave e “Guidance for Success” a cada etapa. ([Salesforce](https://help.salesforce.com/s/articleView?id=000388000&language=en_US&type=1)) No HubSpot, o workspace permite visualizar e editar registros sem interromper o fluxo e oferece ações rápidas sobre itens de follow-up. ([HubSpot](https://knowledge.hubspot.com/sales-workspace/manage-sales-activities-in-the-updated-sales-workspace))

**Implicação para a GSH:** substituir “Atualizar” por ações orientadas à intenção:

- `Registrar contato`
- `Agendar próxima ação`
- `Enviar/atualizar proposta`
- `Avançar etapa`
- `Marcar como ganho/perdido`

Ao avançar etapa, abrir um fluxo curto com somente requisitos daquela transição, explicação do que falta e CTA fixo no rodapé. Os demais dados continuam disponíveis em “Ver todos os campos”. Esta é uma síntese de design baseada em Path e em ações contextuais do Sales Workspace. ([Salesforce](https://help.salesforce.com/s/articleView?id=000388000&language=en_US&type=1), [HubSpot](https://knowledge.hubspot.com/sales-workspace/manage-sales-activities-in-the-updated-sales-workspace))

### 4. A visão do gestor é apenas o funil do vendedor ampliado

Contar cartões por coluna e somar valores não responde às perguntas de gestão: quanto fecha no período, qual é o gap, qual a cobertura, quais negócios deterioraram e onde há risco sem ação.

O HubSpot expõe, no nível da equipe, meta, ganho, gap, submissão de forecast, pipeline aberto, cobertura e pipeline ponderado; o drill-down mostra os deals por vendedor e sinaliza mudanças de etapa e valor. ([HubSpot Forecast](https://knowledge.hubspot.com/forecast/use-the-forecast-tool)) O Salesforce destaca mudanças dos últimos sete dias em valor, data de fechamento, categoria e etapa, além de permitir filtros por período, rep, equipe ou território e edição inline. ([Salesforce Pipeline Inspection](https://help.salesforce.com/s/articleView?id=sales.pipeline_inspection_managing_pipelines_overview.htm&language=en_US)) O Pipedrive combina relatórios, metas e dashboards, com filtros e composição do layout. ([Pipedrive Insights](https://support.pipedrive.com/en/article/insights-feature))

**Implicação para a GSH:** criar uma experiência de gestão separada, com scorecards e uma tabela investigável. O Kanban pode ser um drill-down, não a tela principal da gestão.

### 5. O funil comercial incorpora a entrega do evento

A etapa `5. Produção / formalização / evento` mistura o fechamento comercial com trabalho operacional. Isso alonga artificialmente o ciclo da oportunidade, torna ambíguos “ganho” e “valor fechado” e obriga vendedores e produção a compartilhar um board que não serve plenamente a nenhum dos dois.

O Pipedrive documenta Deals como o processo comercial de uma oportunidade até `won/lost`, enquanto Projects organiza a entrega posterior com tarefas, subtarefas e marcos; os registros podem continuar vinculados. ([Pipedrive](https://support.pipedrive.com/en/article/projects-vs-deals?category=features), [Pipedrive Projects](https://support.pipedrive.com/en/article/projects-by-pipedrive))

**Implicação para a GSH:** o funil comercial deve terminar em `Ganho — contrato/aceite confirmado`. Nesse momento, criar ou ativar automaticamente um `Evento` operacional relacionado, com etapas próprias de formalização, produção, realização e pós-evento. A gestão pode cruzar receita e capacidade sem fundir as jornadas.

## Benchmark por jornada

| Jornada | Padrão de referência | Decisão recomendada para GSH |
|---|---|---|
| Começar o dia | HubSpot agrupa tarefas por prioridade/categoria e inicia uma fila; Pipedrive mostra vencidas, hoje e próximos dias no Focus mobile. ([HubSpot](https://knowledge.hubspot.com/sales-workspace/manage-sales-activities-in-the-updated-sales-workspace), [Pipedrive mobile](https://support.pipedrive.com/en/article/focus-view-in-the-mobile-app)) | Home “Meu dia” com `Atrasadas`, `Hoje`, `Sem próxima ação` e `Próximos eventos`; CTA `Começar fila`. |
| Priorizar deals | Pipedrive ordena por próxima atividade: atrasada, hoje, nenhuma, futura. ([Pipedrive](https://support.pipedrive.com/en/article/how-are-deals-ordered-in-the-pipeline-view)) | Ordenação padrão por urgência; permitir alternar para valor, data do evento ou responsável. |
| Ler o pipeline | Cartões Pipedrive usam poucos campos e permitem ação sobre a atividade sem abrir o registro. ([Pipedrive](https://support.pipedrive.com/en/article/pipeline-view)) | Cartão compacto; próxima ação visível e concluível; total e contagem por etapa; detalhes sob demanda. |
| Trabalhar um deal | Pipedrive combina barra de progresso, resumo, “Focus” e histórico filtrável. ([Pipedrive](https://support.pipedrive.com/en/article/deal-detail-view)) | Cabeçalho com etapa, valor, cliente, evento, owner e próxima ação; corpo em `Visão geral`, `Atividades`, `Proposta`, `Produção`; coluna lateral só para relações. |
| Registrar atividade | Pipedrive permite criar atividade pelo cartão ou detalhe e associa calls, meetings, tasks e emails ao deal/contato. ([Pipedrive](https://support.pipedrive.com/en/article/activities)) | Compositor único de atividade; ao concluir, sugerir imediatamente “Agendar próxima ação”. |
| Recuperar contexto | HubSpot separa visão geral, timeline cronológica e associações; atividades futuras aparecem no topo da timeline. ([HubSpot](https://knowledge.hubspot.com/records/work-with-records)) | Timeline como fonte do histórico, com próximo compromisso fixado no topo e filtros por tipo. |
| Avançar etapa | Salesforce Path mostra campos e orientação específicos da etapa. ([Salesforce](https://help.salesforce.com/s/articleView?id=000388000&language=en_US&type=1)) | Checklist de saída por etapa; mostrar somente obrigatórios/pendentes; confirmação explícita de avanço. |
| Acompanhar forecast | HubSpot mostra meta, realizado, gap, cobertura e drill-down por pessoa/deal. ([HubSpot](https://knowledge.hubspot.com/forecast/use-the-forecast-tool)) | Dashboard de gestão com período e equipe globais; cards de KPI; tabela de riscos e mudanças. |
| Detectar risco | Salesforce mostra overdue, deals movidos para dentro/fora do período, aumentos/reduções e dias em etapa. ([Salesforce métricas](https://help.salesforce.com/s/articleView?id=sales.pipeline_inspection_metrics_and_fields.htm&language=en_US)) | Flags calculadas: `sem próxima ação`, `ação atrasada`, `parado na etapa`, `data movida`, `evento próximo com formalização pendente`. |
| Trabalhar no celular | HubSpot permite filtrar forecast e abrir deal para nota/tarefa/atividade; Pipedrive concentra o mobile nos assuntos mais urgentes do dia. ([HubSpot mobile](https://knowledge.hubspot.com/forecast/use-the-forecast-tool), [Pipedrive mobile](https://support.pipedrive.com/en/article/focus-view-in-the-mobile-app)) | Não encolher o formulário desktop: mobile deve priorizar hoje, quick actions, resumo do evento e checklists de campo. |
| Alternar modo de análise | Salesforce e Linear disponibilizam lista e board; Linear permite ocultar colunas vazias e aplicar swimlanes. ([Salesforce](https://trailhead.salesforce.com/content/learn/modules/lex_implementation_basics/lex_implementation_basics_explore), [Linear](https://linear.app/docs/board-layout)) | Manter `Lista` e `Board` como vistas irmãs; vendedor pode preferir board, enquanto gestão investiga em tabela. |
| Triar sem perder contexto | O Peek do Linear abre os detalhes sobre a lista/board e permite navegar entre itens sem sair da vista. ([Linear](https://linear.app/docs/peek)) | Drawer curto com resumo, próxima ação e CTAs; `Abrir registro completo` para proposta, briefing e produção. |

## Arquitetura de informação recomendada

### Navegação principal por propósito

1. **Meu dia** — tarefas e eventos que exigem ação do vendedor.
2. **Oportunidades** — lista/Kanban do funil comercial.
3. **Agenda** — compromissos e datas dos eventos.
4. **Eventos/Projetos** — execução operacional após a venda, relacionada à oportunidade original.
5. **Gestão** — forecast, cobertura, risco, conversão e capacidade.

Essa separação evita que estados comerciais e operacionais concorram no mesmo Kanban. É uma recomendação inferida da separação entre Sales Workspace e Forecast no HubSpot e entre pipeline, atividades e Insights no Pipedrive. ([HubSpot](https://knowledge.hubspot.com/sales-workspace/manage-sales-activities-in-the-updated-sales-workspace), [Pipedrive](https://support.pipedrive.com/en/article/insights-feature))

### Registro de oportunidade

**Cabeçalho persistente**

- Nome do evento + empresa
- Etapa canônica
- Valor
- Data do evento
- Responsável
- Próxima ação + prazo
- CTAs: registrar atividade, agendar, avançar etapa

**Tabs**

- `Visão geral`: resumo, sinais de risco, contatos e próximos marcos.
- `Atividades`: timeline e compositor.
- `Proposta`: versões, valor, condições e aceite.
- `Formalização`: contrato, NF, cadastro e comprovantes.
- `Evento vinculado`: resumo e acesso ao registro operacional após a venda.

**Progressive disclosure**

- Mostrar primeiro o que é necessário para a decisão atual.
- Seções secundárias recolhidas por padrão.
- “Todos os campos” para auditoria/admin.
- Exibir propriedades condicionais por modalidade e etapa.

O HubSpot documenta tabs, cards, seções recolhíveis e layouts/condições por equipe; o Pipedrive documenta resumo fixo e seções reordenáveis/ocultáveis. ([HubSpot](https://knowledge.hubspot.com/object-settings/customize-records), [Pipedrive](https://support.pipedrive.com/en/article/deal-detail-view))

## Fluxos propostos, passo a passo

### Fluxo A — vendedor começa o dia

1. Abre `Meu dia` e vê quatro números: atrasadas, hoje, eventos próximos e sem próxima ação.
2. Clica `Começar fila`.
3. O primeiro item abre em painel contextual com resumo do deal e do contato.
4. Executa `Ligar`, `WhatsApp`, `Email` ou `Concluir tarefa`.
5. O sistema exige ou sugere fortemente a próxima ação com responsável e data.
6. Salva e avança automaticamente ao próximo item.

O padrão de fila vem do HubSpot, cuja execução guiada abre o contexto do contato e ações de email, ligação e reunião dentro da fila; o painel contextual com quick actions e navegação entre cards também aparece no Pulse Feed do Pipedrive. ([HubSpot Guided Execution](https://knowledge.hubspot.com/prospecting/use-guided-execution-in-the-sales-workspace), [Pipedrive Pulse](https://support.pipedrive.com/en/article/pulse-feed))

### Fluxo B — vendedor avança a oportunidade

1. Arrasta o cartão ou clica `Avançar etapa`.
2. O sistema mostra o nome da etapa de destino e o objetivo daquela etapa.
3. Exibe somente os requisitos faltantes, no máximo cinco campos-chave visíveis de uma vez.
4. Se falta um documento/atividade, oferece a ação correspondente no próprio fluxo.
5. Confirma avanço; o sistema registra a mudança na timeline.
6. Sugere a próxima ação coerente com a nova etapa.

O limite de cinco campos-chave e a orientação por etapa têm precedente no Salesforce Path. ([Salesforce](https://help.salesforce.com/s/articleView?id=000388000&language=en_US&type=1))

### Fluxo C — gestor faz reunião de pipeline

1. Abre `Gestão`, escolhe período, equipe e funil.
2. Lê meta, ganho, forecast, gap e cobertura.
3. Filtra `Em risco` ou clica uma variação relevante (valor reduzido, data movida, overdue).
4. Analisa a tabela de deals, ordenada por impacto financeiro/urgência.
5. Abre o deal em painel sem perder filtros.
6. Registra orientação ou próxima ação e segue para o deal seguinte.

O HubSpot posiciona o forecast como ferramenta de 1:1 com reps e oferece drill-down por pessoa/deal; o Salesforce Pipeline Inspection enfatiza mudanças e coaching. ([HubSpot](https://knowledge.hubspot.com/forecast/use-the-forecast-tool), [Salesforce](https://help.salesforce.com/s/articleView?id=release-notes.rn_sales_features_core_pipeline_inspection_parent.htm&language=en_US&release=232&type=5))

## Regras visuais e de interação

- **Uma cor, um significado:** reservar vermelho/âmbar/verde para estado e urgência; usar neutros para categorias. A atual multiplicidade de chips coloridos impede que cor funcione como alerta.
- **Hierarquia por espaço e tipografia:** agrupamentos e variação de espaço ajudam a leitura e a escaneabilidade; o Atlassian Design System recomenda usar escala e whitespace para hierarquizar, e um ritmo consistente para listas/tabelas. ([Atlassian spacing](https://atlassian.design/foundations/spacing))
- **Rótulos completos antes de densidade:** esconder campos menos usados é preferível a truncar todos os rótulos.
- **Ações com verbos:** `Agendar próxima ação` e `Avançar etapa` comunicam resultado melhor que `Atualizar`.
- **Comportamento consistente em qualquer tamanho:** o Atlassian recomenda padrões e interações familiares em diferentes dispositivos e tamanhos de tela para reduzir carga cognitiva. ([Atlassian accessibility](https://atlassian.design/foundations/accessibility))
- **Layouts próprios por breakpoint:** o Atlassian recomenda projetar no mínimo desktop e mobile e ajustar colunas/gutters por breakpoint; indica grid fluido para experiências tipo Kanban e grid fixo amplo para dashboards. ([Atlassian grid](https://atlassian.design/foundations/grid-beta/applying-grid/))
- **Acessibilidade:** não depender apenas de cor; manter foco visível, navegação por teclado, labels persistentes e contraste adequado. O Atlassian destaca componentes com suporte de teclado/ARIA, mas exige revisão end-to-end dos padrões e interações. ([Atlassian accessibility](https://atlassian.design/foundations/accessibility))

## Prioridade de redesenho

### P0 — corrigir o modelo mental

1. Definir a única etapa comercial canônica.
2. Separar oportunidade de evento em produção.
3. Transformar “próxima ação” em atividade estruturada: tipo, owner, data/hora e status.
4. Definir critérios de entrada/saída de cada etapa.

### P1 — criar a operação diária

1. Home `Meu dia`.
2. Kanban compacto, ordenado por próxima ação.
3. Painel de quick actions sem formulário longo.
4. Fluxo guiado de avanço de etapa.

### P2 — reconstruir o detalhe

1. Cabeçalho persistente.
2. Visão geral + timeline.
3. Tabs por domínio.
4. Seções condicionais e “todos os campos”.

### P3 — gestão

1. Metas, realizado, forecast, gap e cobertura.
2. Tabela de riscos e mudanças.
3. Drill-down por vendedor/deal mantendo filtros.

## Hipóteses e métricas de validação

Estas métricas são propostas de pesquisa, não benchmarks publicados:

- Tempo até o vendedor identificar a primeira ação do dia.
- Percentual de oportunidades abertas com próxima ação futura.
- Tempo e número de interações para registrar contato + agendar follow-up.
- Taxa de erro ao identificar a etapa atual.
- Percentual de avanços de etapa concluídos sem retrabalho.
- Tempo para o gestor responder “qual é o gap do mês?” e “quais três deals precisam de intervenção?”.
- Adoção semanal por vendedor e completude das atividades.

Teste recomendado: cinco a oito vendedores e dois a quatro gestores em tarefas moderadas com o protótipo atual e o redesenho. Usar as mesmas tarefas e medir sucesso, tempo, cliques, dúvidas e confiança percebida.

## Fontes primárias principais

- [HubSpot — Manage sales activities in the updated sales workspace](https://knowledge.hubspot.com/sales-workspace/manage-sales-activities-in-the-updated-sales-workspace)
- [HubSpot — Guided execution](https://knowledge.hubspot.com/prospecting/use-guided-execution-in-the-sales-workspace)
- [HubSpot — Use the forecast tool](https://knowledge.hubspot.com/forecast/use-the-forecast-tool)
- [HubSpot — Use the updated record default layout](https://knowledge.hubspot.com/records/understand-the-default-record-layout)
- [HubSpot — Customize records](https://knowledge.hubspot.com/object-settings/customize-records)
- [Pipedrive — Pipeline view](https://support.pipedrive.com/en/article/pipeline-view)
- [Pipedrive — Pipeline prioritization](https://support.pipedrive.com/en/article/how-are-deals-ordered-in-the-pipeline-view)
- [Pipedrive — Deal detail view](https://support.pipedrive.com/en/article/deal-detail-view)
- [Pipedrive — Pulse feed](https://support.pipedrive.com/en/article/pulse-feed)
- [Pipedrive — Insights](https://support.pipedrive.com/en/article/insights-feature)
- [Pipedrive — Projects vs. Deals](https://support.pipedrive.com/en/article/projects-vs-deals?category=features)
- [Salesforce — Create or edit key fields using Sales Path](https://help.salesforce.com/s/articleView?id=000388000&language=en_US&type=1)
- [Salesforce — Managing Pipelines with Pipeline Inspection](https://help.salesforce.com/s/articleView?id=sales.pipeline_inspection_managing_pipelines_overview.htm&language=en_US)
- [Salesforce — Pipeline Inspection metrics and fields](https://help.salesforce.com/s/articleView?id=sales.pipeline_inspection_metrics_and_fields.htm&language=en_US)
- [Atlassian Design System — Spacing](https://atlassian.design/foundations/spacing)
- [Atlassian Design System — Accessibility](https://atlassian.design/foundations/accessibility)
- [Atlassian Design System — Applying grid](https://atlassian.design/foundations/grid-beta/applying-grid/)
- [Linear — Board layout](https://linear.app/docs/board-layout)
- [Linear — Peek](https://linear.app/docs/peek)
