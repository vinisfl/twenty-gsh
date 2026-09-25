import { useLingui } from '@lingui/react/macro';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledSummary = styled.p`
  background: ${themeCssVariables.background.transparent.light};
  border-left: 2px solid ${themeCssVariables.color.orange};
  color: ${themeCssVariables.font.color.primary};
  margin: ${themeCssVariables.spacing[4]} 0 0;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
`;

export type GateRequirementSummaryProps = {
  missingRequirementLabels: string[];
  isLoading?: boolean;
};

export const GateRequirementSummary = ({
  missingRequirementLabels,
  isLoading = false,
}: GateRequirementSummaryProps) => {
  const { t } = useLingui();

  if (isLoading) {
    return (
      <StyledSummary>{t`Carregando requisitos para confirmar…`}</StyledSummary>
    );
  }

  if (missingRequirementLabels.length === 0) {
    return null;
  }

  return (
    <StyledSummary role="status">
      {t`Para habilitar a confirmação, complete: ${missingRequirementLabels.join(', ')}.`}
    </StyledSummary>
  );
};
