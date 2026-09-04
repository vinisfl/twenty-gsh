---
status: accepted
---

# The formalization chain lock requires a second, field-level core patch

`ADR-0001` covers stage gates: blocking Opportunity creation and Kanban drag-and-drop until a gate's fields are filled in. The "cadeia de formalização" (see `CONTEXT.md` — Cadeia de formalização, Tarefa em cadeia) is a different shape of problem: it blocks editing individual fields (Formulário de Compra, Nota Fiscal, Contrato) on records that are already in "Produção/formalização", without any stage change involved. Investigation confirmed the same gap `ADR-0001` found still applies one level down: `twenty-sdk/define` has no field-level validation or `onBeforeUpdate` hook either, and every editable-field surface (record table cell, side panel, board card, the record page's Fields widget) funnels through the same core hook, `usePersistField` — there is no equivalent to `shouldBlockDrop` for a plain field edit.

**Decision:** add one more small, isolated core patch to `twenty-front` — a `recordFieldPersistGateHandler` extension point in `usePersistField.ts`, mirroring the `opportunityStageAdvanceGateHandler` pattern from `ADR-0001` (single composable handler, no-op when unregistered). `gsh-events` registers `OpportunityFormalizationChainGateHandler` against it to block `purchaseFormStatus`/`invoiceStatus`/`contractStatus` on Opportunity and `status` on the ServiceOrder object until the previous link in the chain is complete, and to fire each drip task the first time its trigger value is reached.

**Alternative rejected:** route these fields exclusively through the existing "Atualizar evento" modal (`update-event.front-component.tsx`) and validate there instead of patching core. Rejected because that modal is documented as the free-edit surface distinct from gates (see `CONTEXT.md` — Atualizar evento) and, more importantly, these fields remain natively editable in the standard Fields widget on the Opportunity and ServiceOrder record pages — a modal-only check would not actually lock the field, just add a second, bypassable path to it.

**Consequence:** same as `ADR-0001` — this patch must be re-reviewed on relevant Twenty upstream updates, and should migrate to an official pre-update hook if Twenty ever ships one.
