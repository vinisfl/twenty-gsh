import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { GateCurrencyInput } from '@/object-record/record-persistence-gate/components/fields/GateCurrencyInput';

describe('GateCurrencyInput', () => {
  it('renders the label and the R$ adornment', () => {
    render(
      <GateCurrencyInput
        instanceId="test-amount"
        label="Valor estimado (R$)"
        value=""
        onChange={jest.fn()}
      />,
    );

    expect(screen.getByText('Valor estimado (R$)')).toBeVisible();
    expect(screen.getByText('R$')).toBeVisible();
  });

  it('formats the typed value with a thousands separator', async () => {
    const user = userEvent.setup();
    render(
      <GateCurrencyInput
        instanceId="test-amount"
        value=""
        onChange={jest.fn()}
      />,
    );

    const input = screen.getByRole('textbox');
    await user.type(input, '123456');

    expect(input).toHaveValue('123,456');
  });

  it('reports the unmasked numeric value through onChange', async () => {
    const handleChange = jest.fn();
    const user = userEvent.setup();
    render(
      <GateCurrencyInput
        instanceId="test-amount"
        value=""
        onChange={handleChange}
      />,
    );

    await user.type(screen.getByRole('textbox'), '1500');

    expect(handleChange).toHaveBeenLastCalledWith('1500');
  });
});
