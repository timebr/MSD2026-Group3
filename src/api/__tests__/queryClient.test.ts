import NetInfo from '@react-native-community/netinfo';
import { dehydrate, onlineManager, QueryClient } from '@tanstack/react-query';

import { persistOptions, queryClient } from '@/api/queryClient';
import { bookingKeys, carKeys } from '@/api/queryKeys';

const DAY_MS = 24 * 60 * 60 * 1000;

/** The slice of a NetInfo state that the listener in queryClient.ts reads. */
interface NetInfoUpdate {
  isConnected: boolean;
  isInternetReachable: boolean | null;
}

describe('queryClient defaults', () => {
  it('refreshes the catalog after five minutes and keeps it for a day', () => {
    const queries = queryClient.getDefaultOptions().queries ?? {};
    expect(queries.staleTime).toBe(5 * 60 * 1000);
    expect(queries.gcTime).toBe(DAY_MS);
    expect(queries.retry).toBe(2);
  });

  it('tries once offline instead of failing fast on queries', () => {
    expect(queryClient.getDefaultOptions().queries?.networkMode).toBe('offlineFirst');
  });

  it('never makes booking writes wait for the network', () => {
    expect(queryClient.getDefaultOptions().mutations?.networkMode).toBe('always');
  });
});

describe('persistOptions', () => {
  it('versions the persisted cache so stale-shaped data is dropped', () => {
    expect(persistOptions.buster).toBe('v3');
    expect(persistOptions.maxAge).toBe(DAY_MS);
  });

  it('persists successful catalog queries but never bookings', () => {
    const client = new QueryClient();
    client.setQueryData(carKeys.list(undefined, undefined), [{ id: 'car-1' }]);
    client.setQueryData(bookingKeys.list, [{ id: 'booking-1' }]);

    const cache = dehydrate(client, {
      shouldDehydrateQuery: persistOptions.dehydrateOptions?.shouldDehydrateQuery,
    });

    const keys = cache.queries.map((query) => query.queryKey);
    expect(keys).toContainEqual(carKeys.list(undefined, undefined));
    expect(keys.some((key) => key[0] === bookingKeys.all[0])).toBe(false);
    client.clear();
  });

  it('skips queries that did not finish successfully', async () => {
    const client = new QueryClient();
    await client.prefetchQuery({
      queryKey: ['cars', 'failing'],
      queryFn: () => Promise.reject(new Error('boom')),
      retry: false,
    });

    const cache = dehydrate(client, {
      shouldDehydrateQuery: persistOptions.dehydrateOptions?.shouldDehydrateQuery,
    });
    expect(cache.queries).toHaveLength(0);
    client.clear();
  });

  it('subscribes NetInfo to the shared online manager on load', () => {
    expect(NetInfo.addEventListener).toHaveBeenCalledTimes(1);
  });

  it('drives the online manager from NetInfo state changes', () => {
    const listener = (NetInfo.addEventListener as jest.Mock).mock.calls[0][0] as (state: NetInfoUpdate) => void;

    listener({ isConnected: false, isInternetReachable: null });
    expect(onlineManager.isOnline()).toBe(false);

    listener({ isConnected: true, isInternetReachable: true });
    expect(onlineManager.isOnline()).toBe(true);
  });
});
