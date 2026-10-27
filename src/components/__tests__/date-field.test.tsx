import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { Platform } from 'react-native';

import { DateField } from '@/components/date-field';

jest.mock('@react-native-community/datetimepicker', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  const { View } = jest.requireActual<typeof import('react-native')>('react-native');
  const MockDateTimePicker = (props: Record<string, unknown>) =>
    React.createElement(View, { ...props, testID: 'datetime-picker' });
  return {
    __esModule: true,
    default: MockDateTimePicker,
    DateTimePickerAndroid: { open: jest.fn() },
  };
});

const mockOpen = jest.mocked(DateTimePickerAndroid.open);
const accessibilityLabel = 'Pick-up date';

describe('DateField', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    mockOpen.mockReset();
  });

  it('falls back to a text input on web', async () => {
    jest.replaceProperty(Platform, 'OS', 'web');
    const onChange = jest.fn();
    await render(<DateField value="" onChange={onChange} accessibilityLabel={accessibilityLabel} />);
    fireEvent.changeText(screen.getByLabelText(accessibilityLabel), '2030-10-05');
    expect(onChange).toHaveBeenCalledWith('2030-10-05');
  });

  it('asks the user to tap to choose on iOS when empty', async () => {
    await render(<DateField value="" onChange={jest.fn()} accessibilityLabel={accessibilityLabel} />);
    expect(screen.getByText('Tap to choose')).toBeTruthy();
  });

  it('shows no placeholder on iOS once a date is stored', async () => {
    await render(<DateField value="2030-10-05" onChange={jest.fn()} accessibilityLabel={accessibilityLabel} />);
    expect(screen.queryByText('Tap to choose')).toBeNull();
  });

  it('opens the native picker on Android and reports the confirmed date', async () => {
    jest.replaceProperty(Platform, 'OS', 'android');
    const onChange = jest.fn();
    await render(<DateField value="" onChange={onChange} accessibilityLabel={accessibilityLabel} />);

    expect(screen.getByText('Choose a date')).toBeTruthy();
    fireEvent.press(screen.getByLabelText(accessibilityLabel));
    expect(mockOpen).toHaveBeenCalledTimes(1);

    const { onValueChange } = mockOpen.mock.calls[0][0] as {
      onValueChange?: (event: unknown, date?: Date) => void;
    };
    // The callback only forwards to the component's onChange prop, so no
    // React state update is involved and act() is not needed here.
    onValueChange?.(undefined, new Date(2030, 9, 5));
    expect(onChange).toHaveBeenCalledWith('2030-10-05');
  });

  it('treats a stored value that is not YYYY-MM-DD as empty on Android', async () => {
    jest.replaceProperty(Platform, 'OS', 'android');
    const result = await render(
      <DateField value="not-a-date" onChange={jest.fn()} accessibilityLabel={accessibilityLabel} />,
    );
    expect(result.toJSON()).toBeTruthy();
    expect(screen.getByText('Choose a date')).toBeTruthy();
  });
});
