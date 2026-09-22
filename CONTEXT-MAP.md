# Context Map

## Contexts

- [GSH Eventos](./packages/twenty-apps/internal/gsh-events/CONTEXT.md) — funil comercial e operacional de eventos corporativos/privados da GSH, modelado como Twenty App sobre o objeto Opportunity

## Relationships

- **GSH Eventos → Twenty core (Opportunity/Task/Company objects)**: GSH Eventos estende os objetos padrão do Twenty via `twenty-sdk/define` (campos, page-layouts, front-components) em vez de duplicar modelo próprio; ver ADR-0001 no contexto GSH Eventos para o limite dessa extensão.
