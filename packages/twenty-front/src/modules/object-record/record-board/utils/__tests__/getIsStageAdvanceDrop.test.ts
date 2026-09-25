import { getIsStageAdvanceDrop } from '@/object-record/record-board/utils/getIsStageAdvanceDrop';

describe('getIsStageAdvanceDrop', () => {
  it('should return true when the destination group is further along than the source group', () => {
    expect(
      getIsStageAdvanceDrop({
        sourceGroupPosition: 0,
        destinationGroupPosition: 2,
      }),
    ).toBe(true);
  });

  it('should return false when the destination group is earlier than the source group', () => {
    expect(
      getIsStageAdvanceDrop({
        sourceGroupPosition: 2,
        destinationGroupPosition: 0,
      }),
    ).toBe(false);
  });

  it('should return false when the drop stays within the same group', () => {
    expect(
      getIsStageAdvanceDrop({
        sourceGroupPosition: 1,
        destinationGroupPosition: 1,
      }),
    ).toBe(false);
  });
});
