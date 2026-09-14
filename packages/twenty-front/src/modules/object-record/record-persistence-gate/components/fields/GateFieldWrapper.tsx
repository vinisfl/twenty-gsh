import { type ReactNode } from 'react';
import { useLingui } from '@lingui/react/macro';
import { styled } from '@linaria/react';
import { Tag } from 'twenty-ui/data-display';
import { type ThemeColor } from 'twenty-ui/theme';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { type GateFieldStatus } from '@/object-record/record-persistence-gate/types/GateFieldStatus';

const STATUS_TAG_COLOR: Record<GateFieldStatus, ThemeColor> = {
  filled: 'green',
  inherited: 'blue',
  pending: 'orange',
};

const StyledWrapper = styled.div<{ status: GateFieldStatus }>`
  border-left: 2px solid
    ${({ status }) => themeCssVariables.tag.text[STATUS_TAG_COLOR[status]]};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  padding-left: ${themeCssVariables.spacing[2]};
`;

const StyledStatusRow = styled.div`
  display: flex;
`;

export type GateFieldWrapperProps = {
  status: GateFieldStatus;
  children: ReactNode;
  className?: string;
};

// Communicates whether a gate field's value was typed in this modal, came
// from an existing linked record, or is still missing — the same three
// states every gate modal cares about but none currently shows visually
// (a field with an inherited value is today just omitted from the form).
export const GateFieldWrapper = ({
  status,
  children,
  className,
}: GateFieldWrapperProps) => {
  const { t } = useLingui();
  const statusLabel: Record<GateFieldStatus, string> = {
    filled: t`Preenchido`,
    inherited: t`Herdado`,
    pending: t`Pendente`,
  };

  return (
    <StyledWrapper status={status} className={className}>
      <StyledStatusRow>
        <Tag
          color={STATUS_TAG_COLOR[status]}
          text={statusLabel[status]}
          variant="outline"
          preventShrink
        />
      </StyledStatusRow>
      {children}
    </StyledWrapper>
  );
};
