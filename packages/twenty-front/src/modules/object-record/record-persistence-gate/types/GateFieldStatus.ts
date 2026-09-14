// Shared vocabulary for GateFieldWrapper: whether a gate field's current
// value came from the user typing it in this modal, from an existing linked
// record, or hasn't been provided yet.
export type GateFieldStatus = 'filled' | 'inherited' | 'pending';
