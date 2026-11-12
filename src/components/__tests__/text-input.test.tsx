import { render, screen } from '@testing-library/react-native';

import { TextInput } from '@/components/text-input';

describe('TextInput', () => {
  it('renders the field with its accessibility label', async () => {
    await render(<TextInput value="" onChangeText={() => {}} accessibilityLabel="Email" />);
    expect(screen.getByLabelText('Email')).toBeTruthy();
  });

  it('shows the error message below the field when present', async () => {
    await render(<TextInput value="" onChangeText={() => {}} accessibilityLabel="Email" error="Enter a valid email" />);
    expect(screen.getByText('Enter a valid email')).toBeTruthy();
  });

  it('shows no error message when none is given', async () => {
    await render(<TextInput value="" onChangeText={() => {}} accessibilityLabel="Email" />);
    expect(screen.queryByText('Enter a valid email')).toBeNull();
  });
});
