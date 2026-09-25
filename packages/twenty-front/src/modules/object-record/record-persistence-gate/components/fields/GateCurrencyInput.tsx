import { styled } from '@linaria/react';
import { IMaskInput } from 'react-imask';
import { Field } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { getSafeScaleForCurrencyInput } from '@/ui/field/input/utils/getSafeScaleForCurrencyInput';
import { isDefined } from 'twenty-shared/utils';
import { getSeparatorsForNumberFormat } from '~/utils/format/getSeparatorsForNumberFormat';

const StyledContainer = styled.div<{ fullWidth?: boolean }>`
  box-sizing: border-box;
  display: inline-flex;
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
`;

const StyledAdornment = styled.div`
  align-items: center;
  background-color: ${themeCssVariables.background.transparent.light};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md} 0 0
    ${themeCssVariables.border.radius.md};
  border-right-style: none;
  box-sizing: border-box;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  flex-shrink: 0;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  height: 32px;
  justify-content: center;
  padding: 0 ${themeCssVariables.spacing[2]};
`;

const StyledMaskedInputWrapper = styled.div`
  background-color: ${themeCssVariables.background.transparent.lighter};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: 0 ${themeCssVariables.border.radius.md}
    ${themeCssVariables.border.radius.md} 0;
  box-sizing: border-box;
  flex-grow: 1;
  height: 32px;
  min-width: 0;

  > input {
    background-color: transparent;
    border: none;
    box-sizing: border-box;
    color: ${themeCssVariables.font.color.primary};
    font-family: ${themeCssVariables.font.family};
    font-size: ${themeCssVariables.font.size.md};
    height: 100%;
    outline: none;
    padding: 0 ${themeCssVariables.spacing[2]};
    width: 100%;

    &::placeholder,
    &::-webkit-input-placeholder {
      color: ${themeCssVariables.font.color.light};
    }
  }

  &:focus-within {
    border-color: ${themeCssVariables.color.blue};
  }
`;

export type GateCurrencyInputProps = {
  instanceId: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  fullWidth?: boolean;
};

// R$-prefixed, thousands-separated equivalent of a gate modal's raw
// `<SettingsTextInput type="number" leftAdornment="R$" />`. `value`/`onChange`
// stay the same unmasked decimal string (e.g. "1234.5") the gate modals
// already pass through toMonetaryAmountDraft, so this is a drop-in swap.
export const GateCurrencyInput = ({
  instanceId,
  label,
  value,
  onChange,
  placeholder,
  fullWidth,
}: GateCurrencyInputProps) => {
  const { numberFormat } = useNumberFormat();
  const { thousandsSeparator, radix } =
    getSeparatorsForNumberFormat(numberFormat);
  const scale = getSafeScaleForCurrencyInput({ value });

  // imask re-emits accept while formatting the incoming value, with no
  // originating input event; only a user keystroke may report a change.
  const handleAccept = (
    newValue: string,
    _maskRef: unknown,
    event?: InputEvent,
  ) => {
    if (!isDefined(event)) {
      return;
    }

    onChange(newValue);
  };

  return (
    <Field.Root>
      {label && <Field.Label htmlFor={instanceId}>{label}</Field.Label>}
      <StyledContainer fullWidth={fullWidth}>
        <StyledAdornment>R$</StyledAdornment>
        <StyledMaskedInputWrapper>
          <IMaskInput
            id={instanceId}
            mask={Number}
            min={0}
            thousandsSeparator={thousandsSeparator}
            radix={radix}
            scale={scale}
            value={value}
            unmask
            onAccept={handleAccept}
            placeholder={placeholder}
            autoComplete="off"
          />
        </StyledMaskedInputWrapper>
      </StyledContainer>
    </Field.Root>
  );
};
