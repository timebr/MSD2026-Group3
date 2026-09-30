import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { router } from 'expo-router';
import { act, fireEvent, renderRouter, screen, waitFor } from 'expo-router/testing-library';
import path from 'path';

import { LocalAuthRepository } from '@/api/local/authRepository';
import type { BookingDraft } from '@/models/booking';

// Renders the real screens in src/app with the real root layout (S1–S3 flows).
const APP_DIR = path.resolve(__dirname, '../app');

// Stand-in for SHA-256 so the test doesn't need the native crypto module.
const fakeHash = async (text: string) => `hashed:${text}`;

jest.setTimeout(30000);

/** renderRouter's render is async with @testing-library/react-native 14, so wait for it. */
async function renderApp() {
  const app = renderRouter(APP_DIR, { initialUrl: '/' });
  await app;
  // Not `return app`: an async function would unwrap the thenable result.
  return { getPathname: () => app.getPathname() };
}

describe('app navigation', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('opens the car list when continuing as a guest', async () => {
    const app = await renderApp();
    await waitFor(() => expect(app.getPathname()).toBe('/welcome'));

    await fireEvent.press(screen.getByLabelText('Continue as guest'));

    await waitFor(() => expect(app.getPathname()).toBe('/'));
    expect(screen.getByText('Sort: price low to high')).toBeTruthy();
  });

  it('opens the car list after logging in from the welcome screen', async () => {
    await new LocalAuthRepository(fakeHash).signUp({
      name: 'Elena',
      email: 'elena@example.com',
      password: 'secret123',
    });
    await new LocalAuthRepository(fakeHash).logOut();
    // The app hashes with expo-crypto; stub it the same way as the sign-up above.
    jest.spyOn(Crypto, 'digestStringAsync').mockImplementation((_algorithm, text) => fakeHash(text));

    const app = await renderApp();
    await waitFor(() => expect(app.getPathname()).toBe('/welcome'));

    await fireEvent.press(screen.getByLabelText('Log in'));
    await waitFor(() => expect(app.getPathname()).toBe('/login'));
    await fireEvent.changeText(screen.getByLabelText('Email'), 'elena@example.com');
    await fireEvent.changeText(screen.getByLabelText('Password'), 'secret123');
    await fireEvent.press(screen.getByLabelText('Log in'));

    await waitFor(() => expect(app.getPathname()).toBe('/'));
    expect(screen.getByText('Sort: price low to high')).toBeTruthy();
  });

  it('goes straight back to the car list after placing a booking', async () => {
    await new LocalAuthRepository(fakeHash).signUp({
      name: 'Elena',
      email: 'elena@example.com',
      password: 'secret123',
    });
    const draft: BookingDraft = {
      carId: 'car-1',
      pickupLocationId: 'loc-cph-airport',
      dropoffLocationId: 'loc-cph-airport',
      startDate: '2030-10-05',
      endDate: '2030-10-08',
      price: { days: 3, basePrice: 87, insuranceCost: 0, fees: 0, totalPrice: 87 },
    };

    const app = await renderApp();
    await waitFor(() => expect(app.getPathname()).toBe('/'));
    await act(() => router.push({ pathname: '/car/[id]', params: { id: 'car-1' } }));
    await act(() => router.push({ pathname: '/booking/[carId]', params: { carId: 'car-1' } }));
    await act(() => router.push({ pathname: '/checkout', params: { draft: JSON.stringify(draft) } }));
    await waitFor(() => expect(app.getPathname()).toBe('/checkout'));

    await fireEvent.changeText(screen.getByLabelText('Cardholder name'), 'Elena');
    await fireEvent.changeText(screen.getByLabelText('Card number'), '4242424242424242');
    await fireEvent.changeText(screen.getByLabelText('Card expiry month'), '12');
    await fireEvent.changeText(screen.getByLabelText('Card expiry year'), '2035');
    await fireEvent.changeText(screen.getByLabelText('Card CVV'), '123');
    await fireEvent.press(screen.getByLabelText('Confirm and pay'));

    await waitFor(() => expect(app.getPathname()).toBe('/'));
    expect(screen.getByText('Booking confirmed!')).toBeTruthy();
    // Car details, booking form and checkout are closed, not left behind the list.
    expect(router.canGoBack()).toBe(false);
  });
});
