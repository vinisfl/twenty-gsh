export const toRichText = (markdown: string | undefined) =>
  markdown === undefined ? undefined : { markdown };
