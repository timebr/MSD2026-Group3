import { onlineManager } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react-native';

import { useIsOnline } from '@/offline/connectivity';

async function flushOnlineChange(online: boolean) {
  await act(async () => {
    onlineManager.setOnline(online);
  });
}

describe('useIsOnline', () => {
  beforeEach(async () => {
    await flushOnlineChange(true);
  });

  it('reports the device as online by default', async () => {
    const { result } = await renderHook(() => useIsOnline());
    expect(result.current).toBe(true);
  });

  it('re-renders with false when the connection drops', async () => {
    const { result } = await renderHook(() => useIsOnline());
    await flushOnlineChange(false);
    expect(result.current).toBe(false);
  });

  it('re-renders with true again once the connection is back', async () => {
    const { result } = await renderHook(() => useIsOnline());
    await flushOnlineChange(false);
    await flushOnlineChange(true);
    expect(result.current).toBe(true);
  });

  it('notifies every mounted subscriber of the same change', async () => {
    const first = await renderHook(() => useIsOnline());
    const second = await renderHook(() => useIsOnline());
    await flushOnlineChange(false);
    expect(first.result.current).toBe(false);
    expect(second.result.current).toBe(false);
  });
});
