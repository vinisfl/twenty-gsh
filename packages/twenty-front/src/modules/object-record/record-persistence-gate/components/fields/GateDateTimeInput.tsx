import { useState } from 'react';
import { useLingui } from '@lingui/react/macro';
import { styled } from '@linaria/react';
import { ptBR } from 'date-fns/locale';
import DatePicker, { registerLocale } from 'react-datepicker';
import { isDefined } from 'twenty-shared/utils';
import { Field } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import 'react-datepicker/dist/react-datepicker.css';

registerLocale('pt-BR', ptBR);

const GATE_DATE_TIME_INPUT_CALENDAR_CLASS_NAME =
  'gate-date-time-input-calendar';

const StyledContainer = styled.div<{ fullWidth?: boolean }>`
  box-sizing: border-box;
  display: inline-flex;
  flex-direction: column;
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
`;

const StyledTrigger = styled.button`
  background-color: ${themeCssVariables.background.transparent.lighter};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  box-sizing: border-box;
  color: ${themeCssVariables.font.color.primary};
  cursor: pointer;
  font-family: ${themeCssVariables.font.family};
  font-size: ${themeCssVariables.font.size.md};
  height: 32px;
  padding: 0 ${themeCssVariables.spacing[2]};
  text-align: left;
  width: 100%;

  &:focus {
    border-color: ${themeCssVariables.color.blue};
    outline: none;
  }
`;

const StyledPlaceholder = styled.span`
  color: ${themeCssVariables.font.color.light};
`;

// Adapts the theming gsh-events' "Status agora" widget applies to its own
// react-datepicker instance (status-now-date-picker.css) into a Linaria
// equivalent, so this picker matches that already-shipped experience
// instead of introducing a third look for the same control.
const StyledCalendarContainer = styled.div`
  margin-top: ${themeCssVariables.spacing[1]};

  .${GATE_DATE_TIME_INPUT_CALENDAR_CLASS_NAME}.react-datepicker {
    background: ${themeCssVariables.background.primary};
    border: 1px solid ${themeCssVariables.border.color.medium};
    border-radius: ${themeCssVariables.border.radius.sm};
    box-sizing: border-box;
    color: ${themeCssVariables.font.color.primary};
    display: flex;
    flex-wrap: wrap;
    font-family: ${themeCssVariables.font.family};
    overflow: hidden;
    width: 100%;
  }

  .${GATE_DATE_TIME_INPUT_CALENDAR_CLASS_NAME} *,
  .${GATE_DATE_TIME_INPUT_CALENDAR_CLASS_NAME} *::before,
  .${GATE_DATE_TIME_INPUT_CALENDAR_CLASS_NAME} *::after {
    box-sizing: border-box;
  }

  .${GATE_DATE_TIME_INPUT_CALENDAR_CLASS_NAME}
    .react-datepicker__month-container {
    float: none;
    min-width: 0;
    width: 100%;
  }

  .${GATE_DATE_TIME_INPUT_CALENDAR_CLASS_NAME} .react-datepicker__header,
  .${GATE_DATE_TIME_INPUT_CALENDAR_CLASS_NAME}
    .react-datepicker__time-container,
  .${GATE_DATE_TIME_INPUT_CALENDAR_CLASS_NAME} .react-datepicker__time {
    background: ${themeCssVariables.background.primary};
    border-color: ${themeCssVariables.border.color.light};
  }

  .${GATE_DATE_TIME_INPUT_CALENDAR_CLASS_NAME} .react-datepicker__header {
    padding: ${themeCssVariables.spacing[2]} 0;
  }

  .${GATE_DATE_TIME_INPUT_CALENDAR_CLASS_NAME} .react-datepicker__current-month,
  .${GATE_DATE_TIME_INPUT_CALENDAR_CLASS_NAME} .react-datepicker-time__header,
  .${GATE_DATE_TIME_INPUT_CALENDAR_CLASS_NAME} .react-datepicker__day-name,
  .${GATE_DATE_TIME_INPUT_CALENDAR_CLASS_NAME} .react-datepicker__day,
  .${GATE_DATE_TIME_INPUT_CALENDAR_CLASS_NAME}
    .react-datepicker__time-list-item {
    color: ${themeCssVariables.font.color.primary};
  }

  .${GATE_DATE_TIME_INPUT_CALENDAR_CLASS_NAME} .react-datepicker__month {
    margin: ${themeCssVariables.spacing[2]};
  }

  .${GATE_DATE_TIME_INPUT_CALENDAR_CLASS_NAME} .react-datepicker__day-names,
  .${GATE_DATE_TIME_INPUT_CALENDAR_CLASS_NAME} .react-datepicker__week {
    display: grid;
    grid-template-columns: repeat(7, minmax(0, 1fr));
    margin: 0;
  }

  .${GATE_DATE_TIME_INPUT_CALENDAR_CLASS_NAME} .react-datepicker__day-name,
  .${GATE_DATE_TIME_INPUT_CALENDAR_CLASS_NAME} .react-datepicker__day {
    line-height: 2.25em;
    margin: 0;
    width: auto;
  }

  .${GATE_DATE_TIME_INPUT_CALENDAR_CLASS_NAME}
    .react-datepicker__time-container {
    border-left: 0;
    border-top: 1px solid ${themeCssVariables.border.color.light};
    float: none;
    width: 100%;
  }

  .${GATE_DATE_TIME_INPUT_CALENDAR_CLASS_NAME} .react-datepicker__time,
  .${GATE_DATE_TIME_INPUT_CALENDAR_CLASS_NAME} .react-datepicker__time-box {
    border-radius: 0;
    width: 100% !important;
  }

  .${GATE_DATE_TIME_INPUT_CALENDAR_CLASS_NAME}
    .react-datepicker__time
    .react-datepicker__time-box
    ul.react-datepicker__time-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(56px, 1fr));
    height: 132px !important;
    margin: 0;
    overflow-y: auto;
    padding: ${themeCssVariables.spacing[1]};
  }

  .${GATE_DATE_TIME_INPUT_CALENDAR_CLASS_NAME}
    .react-datepicker__time
    .react-datepicker__time-box
    ul.react-datepicker__time-list
    li.react-datepicker__time-list-item {
    height: auto;
    line-height: 1.25;
    min-height: 32px;
    padding: ${themeCssVariables.spacing[1]};
  }

  .${GATE_DATE_TIME_INPUT_CALENDAR_CLASS_NAME} .react-datepicker__day:hover,
  .${GATE_DATE_TIME_INPUT_CALENDAR_CLASS_NAME}
    .react-datepicker__time-list-item:hover {
    background: ${themeCssVariables.background.transparent.light};
  }

  .${GATE_DATE_TIME_INPUT_CALENDAR_CLASS_NAME} .react-datepicker__day--selected,
  .${GATE_DATE_TIME_INPUT_CALENDAR_CLASS_NAME}
    .react-datepicker__day--keyboard-selected,
  .${GATE_DATE_TIME_INPUT_CALENDAR_CLASS_NAME}
    .react-datepicker__time-list-item--selected {
    background: ${themeCssVariables.color.blue};
    color: ${themeCssVariables.background.primary};
  }
`;

const formatDateTimeDisplay = (date: Date): string =>
  new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);

export type GateDateTimeInputProps = {
  instanceId: string;
  label?: string;
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
  fullWidth?: boolean;
};

// Friendly equivalent of a gate modal's raw `<SettingsTextInput
// type="datetime-local" />`, matching the inline calendar + time-select
// experience gsh-events' "Status agora" widget already gives users when
// rescheduling a next action. `value`/`onChange` stay ISO strings, so this
// is a drop-in swap alongside the existing toDateTimeLocalInputValue /
// fromDateTimeLocalInputValue helpers.
export const GateDateTimeInput = ({
  instanceId,
  label,
  value,
  onChange,
  placeholder,
  fullWidth,
}: GateDateTimeInputProps) => {
  const { t } = useLingui();
  const [isOpen, setIsOpen] = useState(false);

  const parsedValue = isDefined(value) ? new Date(value) : null;
  const selectedDate =
    isDefined(parsedValue) && !Number.isNaN(parsedValue.getTime())
      ? parsedValue
      : null;

  const handleChange = (date: Date | null) => {
    if (!isDefined(date) || Number.isNaN(date.getTime())) {
      return;
    }

    onChange(date.toISOString());
  };

  return (
    <Field.Root>
      {label && <Field.Label htmlFor={instanceId}>{label}</Field.Label>}
      <StyledContainer fullWidth={fullWidth}>
        <StyledTrigger
          id={instanceId}
          type="button"
          onClick={() => setIsOpen((previousIsOpen) => !previousIsOpen)}
        >
          {isDefined(selectedDate) ? (
            formatDateTimeDisplay(selectedDate)
          ) : (
            <StyledPlaceholder>
              {placeholder ?? t`Selecionar data e hora`}
            </StyledPlaceholder>
          )}
        </StyledTrigger>
        {isOpen && (
          <StyledCalendarContainer>
            <DatePicker
              selected={selectedDate}
              onChange={handleChange}
              inline
              locale="pt-BR"
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              timeCaption={t`Horário`}
              dateFormat="dd/MM/yyyy, HH:mm"
              calendarClassName={GATE_DATE_TIME_INPUT_CALENDAR_CLASS_NAME}
            />
          </StyledCalendarContainer>
        )}
      </StyledContainer>
    </Field.Root>
  );
};
