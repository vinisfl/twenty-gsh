import { getLatestProposal } from '@/object-record/record-persistence-gate/utils/getLatestProposal';

describe('getLatestProposal', () => {
  it('returns the proposal with the highest version without changing the input order', () => {
    const proposals = [
      { version: 1, status: 'SENT' },
      { version: 3, status: 'ACCEPTED' },
      { version: 2, status: 'SUPERSEDED' },
    ];

    expect(getLatestProposal(proposals)).toEqual({
      version: 3,
      status: 'ACCEPTED',
    });
    expect(proposals.map(({ version }) => version)).toEqual([1, 3, 2]);
  });
});
