import { render, screen } from '@testing-library/react';

import { GateFieldWrapper } from '@/object-record/record-persistence-gate/components/fields/GateFieldWrapper';

// The lingui macro rewrites `t\`Text\`` into `i18n._({ id, message: 'Text' })`
// against the real `useLingui` from `@lingui/react`; falling back to the
// compiled-in `message` sidesteps needing the real (build-time-generated)
// message id in this unit test.
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

describe('GateFieldWrapper', () => {
  it('renders its children', () => {
    render(
      <GateFieldWrapper status="pending">
        <div>Field content</div>
      </GateFieldWrapper>,
    );

    expect(screen.getByText('Field content')).toBeVisible();
  });

  it.each([
    ['filled', 'Preenchido'],
    ['inherited', 'Herdado'],
    ['pending', 'Pendente'],
  ] as const)('shows the %s status label', (status, expectedLabel) => {
    render(
      <GateFieldWrapper status={status}>
        <div>Field content</div>
      </GateFieldWrapper>,
    );

    expect(screen.getByText(expectedLabel)).toBeVisible();
  });
});
