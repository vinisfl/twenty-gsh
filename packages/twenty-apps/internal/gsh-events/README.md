# GSH Eventos

Twenty App para conduzir eventos corporativos em um único funil comercial e operacional.

## Experiência do usuário

- **Funil de eventos:** Kanban de Oportunidades com cinco macroetapas ativas. O cartão mostra data, local, modalidade, valor, próxima ação e pendência atual.
- **Atualizar evento:** ação fixa sobre a Oportunidade e aba `Execução do evento` no registro. O formulário abre a seção pertinente à etapa e salva os dados nos objetos corretos.
- **Visões complementares:** formalização pendente, agenda, propostas versionadas, OS emitidas/distribuídas na semana do evento, pós-evento e eventos encerrados.

## Modelo de dados

- **Oportunidade:** posição no funil, contexto comercial, pendência, próxima ação, aceite e situação documental.
- **Execução do evento:** briefing, público confirmado, checklist de montagem/deslocamento/abastecimento/equipe, execução e feedback.
- **Proposta:** uma linha por versão; a atualização só cria uma versão quando `Registrar como nova versão` estiver marcado.
- **Ordem de serviço:** cronograma, cardápio final, estrutura, equipe e situação da distribuição.
- **Empresa e Pessoa:** dados fiscais e papel do contato, respectivamente.

## Fora do escopo desta versão

O app não contém regras automáticas, alertas, SLAs, movimentação automática de etapa, bloqueios de sequência documental ou cobrança automática de feedback. As validações presentes protegem apenas o formato e a integridade dos dados enviados. Execução do evento e OS são relações 1:1 no processo; como o SDK expõe relações reversas como listas, a tela unificada reutiliza o registro relacionado já carregado e interrompe a edição se detectar duplicidade.

Os testes de serviço incluem dois percursos completos, interno e externo, cobrindo cadastro fiscal, qualificação, duas versões de proposta, aceite, formalização, OS, execução e feedback.

## Validar e instalar

```bash
corepack yarn install
corepack yarn typecheck
corepack yarn lint
corepack yarn test
corepack yarn twenty dev:build
```

Depois de configurar um remote autenticado do Twenty:

```bash
corepack yarn twenty plan
corepack yarn twenty apply
```

O `plan` deve ser revisado antes do `apply`, principalmente em workspaces que já possuam extensões no objeto Oportunidade.
