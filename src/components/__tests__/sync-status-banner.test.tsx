import { fireEvent, render, screen } from '@testing-library/react-native';

import { SyncStatusBanner } from '@/components/sync-status-banner';
import { useSyncStatus } from '@/hooks/use-bookings';
import { useIsOnline } from '@/offline/connectivity';
import { requestSync } from '@/offline/syncManager';

jest.mock('@/hooks/use-bookings', () => ({ useSyncStatus: jest.fn() }));
jest.mock('@/offline/connectivity', () => ({ useIsOnline: jest.fn() }));
jest.mock('@/offline/syncManager', () => ({ requestSync: jest.fn() }));

const mockUseSyncStatus = jest.mocked(useSyncStatus);
const mockUseIsOnline = jest.mocked(useIsOnline);
const mockRequestSync = jest.mocked(requestSync);

describe('SyncStatusBanner', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseIsOnline.mockReturnValue(true);
    mockUseSyncStatus.mockReturnValue({ pending: 0, failed: 0 });
  });

  it('renders nothing when online with nothing to sync', async () => {
    const result = await render(<SyncStatusBanner />);
    expect(result.toJSON()).toBeNull();
  });

  it('tells the user they are offline and that changes will sync later', async () => {
    mockUseIsOnline.mockReturnValue(false);
    await render(<SyncStatusBanner />);
    expect(screen.getByText("You're offline. Changes will sync once you're back online.")).toBeTruthy();
    expect(screen.queryByLabelText('Retry sync')).toBeNull();
  });

  it('counts pending and failed changes in the offline message', async () => {
    mockUseIsOnline.mockReturnValue(false);
    mockUseSyncStatus.mockReturnValue({ pending: 1, failed: 1 });
    await render(<SyncStatusBanner />);
    expect(screen.getByText("You're offline. 2 booking changes will sync once you're back online.")).toBeTruthy();
  });

  it('offers a retry that requests a new sync pass when a push failed', async () => {
    mockUseSyncStatus.mockReturnValue({ pending: 0, failed: 1 });
    await render(<SyncStatusBanner />);
    expect(screen.getByText('1 booking change failed to sync.')).toBeTruthy();
    fireEvent.press(screen.getByLabelText('Retry sync'));
    expect(mockRequestSync).toHaveBeenCalledTimes(1);
  });

  it('shows the syncing state for pending changes while online', async () => {
    mockUseSyncStatus.mockReturnValue({ pending: 2, failed: 0 });
    await render(<SyncStatusBanner />);
    expect(screen.getByText('Syncing 2 booking changes…')).toBeTruthy();
    expect(screen.queryByLabelText('Retry sync')).toBeNull();
  });
});
