import { describe, expect, it } from 'vitest';
import { toRichText } from 'src/logic-functions/utils/to-rich-text.util';

describe('toRichText', () => {
  it('maps plain markdown to the Twenty rich-text input shape', () => {
    expect(toRichText('texto')).toEqual({ markdown: 'texto' });
  });
});
