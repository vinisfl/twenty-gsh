import { render, screen } from '@testing-library/react';

import { GateRequirementSummary } from '@/object-record/record-persistence-gate/components/GateRequirementSummary';

const useLinguiMock = () => ({
  i18n: {
    _: ({
      id,
      message,
      values,
    }: {
      id: string;
      message?: string;
      values?: Record<string, string>;
    }) =>
      message?.replace(
        /\{(\w+)\}/g,
        (placeholder, key) => values?.[key] ?? placeholder,
      ) ?? id,
  },
});

jest.mock('@lingui/react/macro', () => ({
  useLingui: () => useLinguiMock(),
}));
jest.mock('@lingui/react', () => ({
  useLingui: () => useLinguiMock(),
}));

describe('GateRequirementSummary', () => {
  it('lists every missing requirement while confirmation is blocked', () => {
    render(
      <GateRequirementSummary
        missingRequirementLabels={['Valor fechado', 'Evidência do aceite']}
      />,
    );

    expect(screen.getByRole('status')).toHaveTextContent(
      'Para habilitar a confirmação, complete: Valor fechado, Evidência do aceite.',
    );
  });

  it('explains that requirements are loading instead of presenting a stale list', () => {
    render(<GateRequirementSummary missingRequirementLabels={[]} isLoading />);

    expect(
      screen.getByText('Carregando requisitos para confirmar…'),
    ).toBeVisible();
  });

  it('does not render when confirmation is enabled', () => {
    const { container } = render(
      <GateRequirementSummary missingRequirementLabels={[]} />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
