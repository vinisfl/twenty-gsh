import { type MouseEvent, useState } from 'react';
import { ptBR } from 'date-fns/locale';
import DatePicker, { registerLocale } from 'react-datepicker';
import { useTranslate } from 'twenty-sdk/front-component';

import { ensureResizeObserver } from 'src/front-components/utils/ensure-resize-observer.util';

import 'react-datepicker/dist/react-datepicker.css';
import '../status-now-date-picker.css';

ensureResizeObserver();
registerLocale('pt-BR', ptBR);

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: 'var(--t-spacing-2)' },
  controls: { display: 'flex', gap: 'var(--t-spacing-2)' },
  trigger: {
    background: 'var(--t-background-primary)',
    border: '1px solid var(--t-border-color-medium)',
    borderRadius: 'var(--t-border-radius-sm)',
    color: 'var(--t-font-color-primary)',
    cursor: 'pointer',
    flex: 1,
    font: 'inherit',
    minHeight: 'var(--t-spacing-8)',
    padding: 'var(--t-spacing-2) var(--t-spacing-3)',
    textAlign: 'left',
  },
  clear: {
    background: 'var(--t-background-primary)',
    border: '1px solid var(--t-border-color-medium)',
    borderRadius: 'var(--t-border-radius-sm)',
    color: 'var(--t-font-color-secondary)',
    cursor: 'pointer',
    font: 'inherit',
    padding: 'var(--t-spacing-2) var(--t-spacing-3)',
  },
  placeholder: { color: 'var(--t-font-color-tertiary)' },
} as const;

const formatDateTimeDisplay = (date: Date): string =>
  new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);

export type DateTimeInputProps = {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  disabled?: boolean;
  placeholder?: string;
};

// Uses the calendar and time picker already established by "Status agora",
// while still allowing the free-edit form to clear a value.
export const DateTimeInput = ({
  value,
  onChange,
  disabled = false,
  placeholder,
}: DateTimeInputProps) => {
  const { t } = useTranslate();
  const [isOpen, setIsOpen] = useState(false);
  const displayPlaceholder = placeholder ?? t('Selecionar data e hora');
  const parsedValue = value ? new Date(value) : null;
  const selectedDate =
    parsedValue && !Number.isNaN(parsedValue.getTime()) ? parsedValue : null;

  const handleClear = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onChange(undefined);
    setIsOpen(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.controls}>
        <button
          type="button"
          aria-expanded={isOpen}
          aria-label={
            selectedDate ? t('Alterar data e hora') : displayPlaceholder
          }
          style={styles.trigger}
          onClick={() => setIsOpen((previousIsOpen) => !previousIsOpen)}
          disabled={disabled}
        >
          {selectedDate ? (
            formatDateTimeDisplay(selectedDate)
          ) : (
            <span style={styles.placeholder}>{displayPlaceholder}</span>
          )}
        </button>
        {selectedDate ? (
          <button
            type="button"
            aria-label={t('Limpar data e hora')}
            style={styles.clear}
            onClick={handleClear}
            disabled={disabled}
          >
            {t('Limpar')}
          </button>
        ) : null}
      </div>
      {isOpen ? (
        <DatePicker
          selected={selectedDate}
          onChange={(date: Date | null) =>
            onChange(date ? date.toISOString() : undefined)
          }
          inline
          locale="pt-BR"
          showTimeSelect
          timeFormat="HH:mm"
          timeIntervals={15}
          timeCaption={t('Horário')}
          dateFormat="dd/MM/yyyy, HH:mm"
          calendarClassName="gsh-reschedule-calendar"
          disabled={disabled}
        />
      ) : null}
    </div>
  );
};
