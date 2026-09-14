import { useLingui } from '@lingui/react/macro';
import { styled } from '@linaria/react';
import { useContext } from 'react';
import { IconCircleDashed, IconProgressCheck } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { OpportunityStageReadinessContext } from '@/object-record/record-persistence-gate/contexts/OpportunityStageReadinessContext';
import { RecordBoardCardContext } from '@/object-record/record-board/record-board-card/contexts/RecordBoardCardContext';

const StyledReadinessIndicator = styled.div<{ isReadyToAdvance: boolean }>`
  align-items: center;
  color: ${({ isReadyToAdvance }) =>
    isReadyToAdvance
      ? themeCssVariables.color.green
      : themeCssVariables.color.orange};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[1]};
  padding: 0 ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[2]};
`;

export const OpportunityStageReadinessIndicator = () => {
  const { recordId } = useContext(RecordBoardCardContext);
  const { readinessByOpportunityId } = useContext(
    OpportunityStageReadinessContext,
  );
  const readiness = readinessByOpportunityId.get(recordId);

  if (!readiness) {
    return null;
  }

  return <OpportunityStageReadinessLabel readiness={readiness} />;
};

type OpportunityStageReadinessLabelProps = {
  readiness: {
    isReadyToAdvance: boolean;
    missingRequirementCount: number;
  };
};

const OpportunityStageReadinessLabel = ({
  readiness,
}: OpportunityStageReadinessLabelProps) => {
  const { t } = useLingui();

  const label = readiness.isReadyToAdvance
    ? t`Pronto para avançar`
    : readiness.missingRequirementCount === 1
      ? t`Falta 1 requisito`
      : t`Faltam ${readiness.missingRequirementCount} requisitos`;

  return (
    <StyledReadinessIndicator
      aria-label={label}
      isReadyToAdvance={readiness.isReadyToAdvance}
    >
      {readiness.isReadyToAdvance ? (
        <IconProgressCheck />
      ) : (
        <IconCircleDashed />
      )}
      {label}
    </StyledReadinessIndicator>
  );
};
