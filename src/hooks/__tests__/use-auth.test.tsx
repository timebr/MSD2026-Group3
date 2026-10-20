import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import { authRepository } from '@/api';
import { AuthProvider, useAuth } from '@/hooks/use-auth';
import type { User } from '@/models/user';

jest.mock('@/api', () => ({
  authRepository: {
    currentUser: jest.fn(),
    signUp: jest.fn(),
    logIn: jest.fn(),
    logOut: jest.fn(),
  },
}));

const mockAuthRepository = jest.mocked(authRepository);

const elena: User = { id: 'user-1', name: 'Elena', email: 'elena@example.com' };

function wrapper({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthRepository.currentUser.mockResolvedValue(null);
  });

  it('starts unready and becomes ready with no saved session', async () => {
    const { result } = await renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.ready).toBe(true));
    expect(result.current.user).toBeNull();
    expect(mockAuthRepository.currentUser).toHaveBeenCalledTimes(1);
  });

  it('restores a saved session on launch', async () => {
    mockAuthRepository.currentUser.mockResolvedValue(elena);
    const { result } = await renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.user).toEqual(elena));
  });

  it('sets the user on log in', async () => {
    mockAuthRepository.logIn.mockResolvedValue(elena);
    const { result } = await renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.ready).toBe(true));

    await act(async () => {
      await result.current.logIn({ email: 'elena@example.com', password: 'secret123' });
    });
    expect(mockAuthRepository.logIn).toHaveBeenCalledWith({ email: 'elena@example.com', password: 'secret123' });
    expect(result.current.user).toEqual(elena);
  });

  it('sets the user on sign up', async () => {
    mockAuthRepository.signUp.mockResolvedValue(elena);
    const { result } = await renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.ready).toBe(true));

    await act(async () => {
      await result.current.signUp({ name: 'Elena', email: 'elena@example.com', password: 'secret123' });
    });
    expect(result.current.user).toEqual(elena);
  });

  it('clears the user and the guest flag on log out', async () => {
    mockAuthRepository.currentUser.mockResolvedValue(elena);
    mockAuthRepository.logOut.mockResolvedValue();
    const { result } = await renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.user).toEqual(elena));

    await act(async () => {
      result.current.continueAsGuest();
    });
    expect(result.current.isGuest).toBe(true);

    await act(async () => {
      await result.current.logOut();
    });
    expect(result.current.user).toBeNull();
    expect(result.current.isGuest).toBe(false);
  });

  it('marks the session as a guest without a user', async () => {
    const { result } = await renderHook(() => useAuth(), { wrapper });
    await waitFor(() => expect(result.current.ready).toBe(true));
    await act(async () => {
      result.current.continueAsGuest();
    });
    expect(result.current.isGuest).toBe(true);
    expect(result.current.user).toBeNull();
  });

  it('throws when used outside the provider', async () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => {});
    await expect(renderHook(() => useAuth())).rejects.toThrow('useAuth must be used inside AuthProvider');
    error.mockRestore();
  });
});
