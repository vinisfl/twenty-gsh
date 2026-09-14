import { IMaskInput } from 'react-imask';
import { useTranslate } from 'twenty-sdk/front-component';

import {
  fromCurrencyInputValue,
  toCurrencyInputValue,
} from 'src/front-components/fields/utils/currency-input-value.util';

const styles = {
  container: {
    display: 'flex',
    minHeight: 'var(--t-spacing-8)',
    width: '100%',
  },
  adornment: {
    alignItems: 'center',
    background: 'var(--t-background-secondary)',
    border: '1px solid var(--t-border-color-medium)',
    borderRadius: 'var(--t-border-radius-sm) 0 0 var(--t-border-radius-sm)',
    borderRight: 'none',
    color: 'var(--t-font-color-tertiary)',
    display: 'flex',
    padding: '0 var(--t-spacing-2)',
  },
  input: {
    background: 'var(--t-background-primary)',
    border: '1px solid var(--t-border-color-medium)',
    borderRadius: '0 var(--t-border-radius-sm) var(--t-border-radius-sm) 0',
    boxSizing: 'border-box',
    color: 'var(--t-font-color-primary)',
    flex: 1,
    font: 'inherit',
    minWidth: 0,
    padding: 'var(--t-spacing-2) var(--t-spacing-3)',
  },
} as const;

export type CurrencyInputProps = {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  disabled?: boolean;
};

// Keeps the numeric form state unmasked while presenting the same R$ input
// treatment used by the gate field kit.
export const CurrencyInput = ({
  value,
  onChange,
  disabled = false,
}: CurrencyInputProps) => {
  const { t } = useTranslate();

  const handleAccept = (
    maskedValue: string,
    maskReference: unknown,
    event?: InputEvent,
  ) => {
    void maskReference;

    if (!event) {
      return;
    }

    onChange(fromCurrencyInputValue(maskedValue));
  };

  return (
    <div style={styles.container}>
      <span style={styles.adornment}>{t('R$')}</span>
      <IMaskInput
        aria-label={t('Valor em reais')}
        mask={Number}
        thousandsSeparator="."
        radix=","
        mapToRadix={['.']}
        scale={2}
        value={toCurrencyInputValue(value)}
        unmask
        onAccept={handleAccept}
        disabled={disabled}
        inputMode="decimal"
        autoComplete="off"
        style={styles.input}
      />
    </div>
  );
};
