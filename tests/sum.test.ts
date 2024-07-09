import {describe, expect, test, jest, beforeEach, afterEach} from '@jest/globals';
import {sum, mockSum} from './sum';

describe('sum module', () => {

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  })

  const mockCallback = jest.fn((x: number)=> 42 + x);

  test('adds 1 + 2 to equal 3', () => {
    expect(sum(1, 2)).toBe(3);
  });

  test('mocking sum', () => {
    mockSum(1, 2, mockCallback);
    expect(mockCallback.mock.calls[0][0]).toBe(3)
    expect(mockCallback.mock.calls).toHaveLength(1)
  });
});