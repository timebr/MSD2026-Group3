import { onlineManager } from '@tanstack/react-query';
import { useSyncExternalStore } from 'react';

// NetInfo is wired into TanStack's onlineManager in `src/api/queryClient.ts`,
// so queries and this hook share one notion of "online".
import '@/api/queryClient';

export function useIsOnline(): boolean {
  return useSyncExternalStore(
    onlineManager.subscribe.bind(onlineManager),
    () => onlineManager.isOnline(),
    () => true,
  );
}
