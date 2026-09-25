---
status: accepted
---

# Hard stage gates require small, isolated patches to twenty-front core

GSH quer que a criação de Opportunity e a mudança de etapa no Kanban abram um modal **bloqueante**: o registro só é criado, ou só muda de etapa, se os campos obrigatórios daquele gate forem preenchidos e confirmados (ver `CONTEXT.md` — Gate de etapa). Investigação confirmou que `twenty-sdk/define` não expõe nenhum hook `onBeforeCreate`/`onBeforeUpdate`: o botão "+ Novo" do Kanban chama `createNewIndexRecord` diretamente, e o drag-and-drop chama `updateOneRecord` diretamente, ambos síncronos, sem ponto de extensão de app. O único precedente de bloqueio pré-persistência no core é `shouldBlockDrop` em `useRecordBoardDndKit.ts`, usado hoje só para conflito de ordenação.

**Decisão:** aceitar patches pequenos e isolados no core do `twenty-front` — especificamente `RecordBoardColumnNewRecordButton.tsx`, `CreateNewIndexRecordNoSelectionRecordCommand.tsx` (criação) e `useRecordBoardDndKit.ts`/`useProcessBoardCardDrop.ts` (mudança de etapa) — condicionados ao objeto Opportunity, para desviar pro modal do app `gsh-events` antes de persistir. Isso rompe o padrão que o app seguiu até aqui (100% declarativo via `twenty-sdk/define`, com só 2 exceções cosméticas anteriores em `page-layout/widgets/fields/`).

**Alternativa rejeitada:** gate "soft" — deixar o registro criar/mover normalmente e abrir o modal logo em seguida, sem bloquear. Ficaria inteiramente dentro do app, sem tocar core, mas não entrega a garantia que a GSH pediu (o vendedor pode fechar o modal e o deal fica num estado que o processo documentado não permite).

**Consequência:** essas mudanças de core precisam ser re-revisadas a cada atualização relevante do Twenty upstream (o hook que elas usam não é uma API pública estável). Se o Twenty algum dia expuser um hook oficial de pré-criação/pré-atualização, migrar para ele e remover o patch.
