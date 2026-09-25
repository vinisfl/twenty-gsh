import { getProposalToAcceptanceGateRequirements } from '@/object-record/record-persistence-gate/utils/getProposalToAcceptanceGateRequirements';

describe('getProposalToAcceptanceGateRequirements', () => {
  it('is satisfied when the proposal is accepted and the opportunity data is filled', () => {
    const result = getProposalToAcceptanceGateRequirements({
      opportunity: {
        eventClosedAmount: { amountMicros: 15_000_000_000 },
        eventAcceptanceEvidence: 'https://mail.example.com/aceite-cliente',
      },
      latestProposal: { status: 'ACCEPTED' },
    });

    expect(result).toEqual({
      isSatisfied: true,
      metRequirementKeys: [
        'proposalAccepted',
        'closedAmount',
        'acceptanceEvidence',
      ],
      missingRequirementKeys: [],
    });
  });

  it('is not satisfied and lists everything missing when there is no data', () => {
    const result = getProposalToAcceptanceGateRequirements({
      opportunity: undefined,
      latestProposal: undefined,
    });

    expect(result).toEqual({
      isSatisfied: false,
      metRequirementKeys: [],
      missingRequirementKeys: [
        'proposalAccepted',
        'closedAmount',
        'acceptanceEvidence',
      ],
    });
  });

  it('lists only the missing requirements when partially filled', () => {
    const result = getProposalToAcceptanceGateRequirements({
      opportunity: {
        eventClosedAmount: { amountMicros: 15_000_000_000 },
        eventAcceptanceEvidence: null,
      },
      latestProposal: { status: 'SENT' },
    });

    expect(result).toEqual({
      isSatisfied: false,
      metRequirementKeys: ['closedAmount'],
      missingRequirementKeys: ['proposalAccepted', 'acceptanceEvidence'],
    });
  });
});
