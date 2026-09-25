export type StepStatus = 'completed' | 'current' | 'upcoming';

// currentIndex is -1 when the record's stage isn't one of the funnel steps
// (e.g. a terminal status like Closed/Lost/Cancelled) — no step can be
// resolved as completed/current in that case.
export const getStepStatus = (
  index: number,
  currentIndex: number,
): StepStatus => {
  if (currentIndex === -1) return 'upcoming';
  if (index < currentIndex) return 'completed';
  if (index === currentIndex) return 'current';
  return 'upcoming';
};
