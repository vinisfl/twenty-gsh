import { serializeFileList } from '../serializeFileList';

const buildFile = () =>
  new File(['report contents'], 'report.csv', {
    type: 'text/csv',
    lastModified: 1700000000000,
  });

describe('serializeFileList', () => {
  it('should return undefined for a non-object', () => {
    expect(serializeFileList(null)).toBeUndefined();
    expect(serializeFileList('files')).toBeUndefined();
  });

  it('should return undefined when there is no numeric length', () => {
    expect(serializeFileList({})).toBeUndefined();
  });

  it('preserves the selected file for front-component uploads', () => {
    const file = buildFile();
    const result = serializeFileList({
      length: 1,
      0: file,
    });

    expect(result).toHaveLength(1);
    expect(result?.[0]).toBeInstanceOf(File);
    expect(result?.[0]).toBe(file);
  });

  it('should skip entries missing required fields', () => {
    const result = serializeFileList({
      length: 2,
      0: buildFile(),
      1: { name: 'incomplete' },
    });

    expect(result).toHaveLength(1);
    expect(result?.[0]).toBeInstanceOf(File);
  });
});
