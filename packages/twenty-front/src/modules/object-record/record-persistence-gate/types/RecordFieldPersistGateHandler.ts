// Returning true lets the native field persist proceed; false means the
// handler has taken over (e.g. shown its own blocking feedback) and the
// native persist must not run.
export type RecordFieldPersistGateHandler = (params: {
  objectNameSingular: string;
  recordId: string;
  fieldName: string;
  valueToPersist: unknown;
}) => boolean | Promise<boolean>;
