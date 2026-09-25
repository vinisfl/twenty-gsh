export const getLatestProposal = <TProposal extends { version: number | null }>(
  proposals: TProposal[],
): TProposal | undefined =>
  [...proposals].sort(
    (left, right) => (right.version ?? 0) - (left.version ?? 0),
  )[0];
