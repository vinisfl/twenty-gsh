import { getFieldsWidgetGroupStageStatusByGroupId } from '@/page-layout/widgets/fields/utils/getFieldsWidgetGroupStageStatusByGroupId';

const groups = [
  { id: 'g1', name: 'Briefing do evento' },
  { id: 'g2', name: 'Comercial e proposta' },
  { id: 'g3', name: 'Formalização' },
  { id: 'g4', name: 'Produção do evento' },
  { id: 'g5', name: 'Pós-evento' },
];

describe('getFieldsWidgetGroupStageStatusByGroupId', () => {
  it('returns an empty map when currentGroupName is null', () => {
    const result = getFieldsWidgetGroupStageStatusByGroupId(groups, null);

    expect(result).toEqual({});
  });

  it('returns an empty map when currentGroupName does not match any group', () => {
    const result = getFieldsWidgetGroupStageStatusByGroupId(
      groups,
      'Some unmapped stage',
    );

    expect(result).toEqual({});
  });

  it('marks groups before the current one as completed, the matching one as current, and the rest as upcoming', () => {
    const result = getFieldsWidgetGroupStageStatusByGroupId(
      groups,
      'Formalização',
    );

    expect(result).toEqual({
      g1: 'completed',
      g2: 'completed',
      g3: 'current',
      g4: 'upcoming',
      g5: 'upcoming',
    });
  });

  it('marks the first group as current with no completed groups before it', () => {
    const result = getFieldsWidgetGroupStageStatusByGroupId(
      groups,
      'Briefing do evento',
    );

    expect(result).toEqual({
      g1: 'current',
      g2: 'upcoming',
      g3: 'upcoming',
      g4: 'upcoming',
      g5: 'upcoming',
    });
  });

  it('marks the last group as current with all others completed', () => {
    const result = getFieldsWidgetGroupStageStatusByGroupId(
      groups,
      'Pós-evento',
    );

    expect(result).toEqual({
      g1: 'completed',
      g2: 'completed',
      g3: 'completed',
      g4: 'completed',
      g5: 'current',
    });
  });
});
