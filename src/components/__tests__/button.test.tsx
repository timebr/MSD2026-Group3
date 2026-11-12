import { fireEvent, render, screen } from '@testing-library/react-native';

import { Button } from '@/components/button';

describe('Button', () => {
  it('renders its label', async () => {
    await render(<Button label="Confirm and pay" onPress={() => {}} />);
    expect(screen.getByText('Confirm and pay')).toBeTruthy();
  });

  it('exposes the button accessibility role', async () => {
    await render(<Button label="Confirm and pay" onPress={() => {}} />);
    expect(screen.getByRole('button', { name: 'Confirm and pay' })).toBeTruthy();
  });

  it('calls onPress when enabled', async () => {
    const onPress = jest.fn();
    await render(<Button label="Confirm and pay" onPress={onPress} />);
    fireEvent.press(screen.getByText('Confirm and pay'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('reflects the disabled state and does not call onPress', async () => {
    const onPress = jest.fn();
    await render(<Button label="Confirm and pay" onPress={onPress} disabled />);
    const button = screen.getByRole('button', { name: 'Confirm and pay' });
    expect(button.props.accessibilityState?.disabled).toBe(true);
    fireEvent.press(button);
    expect(onPress).not.toHaveBeenCalled();
  });
});
