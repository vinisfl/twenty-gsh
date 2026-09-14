import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { GateDateTimeInput } from '@/object-record/record-persistence-gate/components/fields/GateDateTimeInput';

const useLinguiMock = () => ({
  i18n: {
    _: ({ id, message }: { id: string; message?: string }) => message ?? id,
  },
});

jest.mock('@lingui/react/macro', () => ({
  useLingui: () => useLinguiMock(),
}));
jest.mock('@lingui/react', () => ({
  useLingui: () => useLinguiMock(),
}));

describe('GateDateTimeInput', () => {
  it('shows a placeholder when there is no value', () => {
    render(
      <GateDateTimeInput
        instanceId="test-event-at"
        label="Data do evento"
        value={null}
        onChange={jest.fn()}
      />,
    );

    expect(screen.getByText('Data do evento')).toBeVisible();
    expect(screen.getByRole('button')).toHaveTextContent(
      'Selecionar data e hora',
    );
  });

  it('shows the formatted date and time when a value is set', () => {
    render(
      <GateDateTimeInput
        instanceId="test-event-at"
        value="2026-03-05T14:30:00.000Z"
        onChange={jest.fn()}
      />,
    );

    const trigger = screen.getByRole('button');
    expect(trigger.textContent).toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });

  it('opens the calendar when the trigger is clicked', async () => {
    const user = userEvent.setup();
    render(
      <GateDateTimeInput
        instanceId="test-event-at"
        value={null}
        onChange={jest.fn()}
      />,
    );

    expect(screen.queryByRole('table')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button'));

    expect(screen.getByRole('table')).toBeVisible();
  });
});
