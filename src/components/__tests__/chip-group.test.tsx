import { fireEvent, render, screen } from '@testing-library/react-native';

import { ChipGroup, type ChipOption } from '@/components/chip-group';

type City = 'cph' | 'aarhus' | 'odense';

const options: ChipOption<City>[] = [
  { value: 'cph', label: 'Copenhagen' },
  { value: 'aarhus', label: 'Aarhus' },
  { value: 'odense', label: 'Odense' },
];

/** RNTL 14's render is async, so every caller awaits it. */
async function renderChipGroup({ value, allowDeselect }: { value: City | undefined; allowDeselect?: boolean }) {
  const onChange = jest.fn();
  await render(
    <ChipGroup
      options={options}
      value={value}
      onChange={onChange}
      allowDeselect={allowDeselect}
      accessibilityLabel="Pickup location"
    />,
  );
  return { onChange };
}

describe('ChipGroup', () => {
  it('renders every option inside a labelled radio group', async () => {
    await renderChipGroup({ value: undefined });
    expect(screen.getByLabelText('Pickup location')).toBeTruthy();
    for (const option of options) {
      expect(screen.getByLabelText(option.label)).toBeTruthy();
    }
  });

  it('reports the pressed option through onChange', async () => {
    const { onChange } = await renderChipGroup({ value: undefined });
    fireEvent.press(screen.getByLabelText('Aarhus'));
    expect(onChange).toHaveBeenCalledWith('aarhus');
  });

  it('keeps the same value when the selected chip is pressed again', async () => {
    const { onChange } = await renderChipGroup({ value: 'aarhus' });
    fireEvent.press(screen.getByLabelText('Aarhus'));
    expect(onChange).toHaveBeenCalledWith('aarhus');
  });

  it('deselects the selected chip when allowDeselect is set', async () => {
    const { onChange } = await renderChipGroup({ value: 'aarhus', allowDeselect: true });
    fireEvent.press(screen.getByLabelText('Aarhus'));
    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  it('marks only the selected option as selected for assistive tech', async () => {
    await renderChipGroup({ value: 'aarhus' });
    expect(screen.getByLabelText('Aarhus').props.accessibilityState.selected).toBe(true);
    expect(screen.getByLabelText('Copenhagen').props.accessibilityState.selected).toBe(false);
    expect(screen.getByLabelText('Odense').props.accessibilityState.selected).toBe(false);
  });
});
