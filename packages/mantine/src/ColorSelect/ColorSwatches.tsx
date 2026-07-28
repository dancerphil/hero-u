import { Group } from '@mantine/core';
import { ColorCustomControls } from './ColorCustomControls.js';
import { ColorPresetSwatches } from './ColorPresetSwatches.js';
import type { ColorSwatchesProps } from './types.js';

export function ColorSwatches({ value, onChange, allowCustom }: ColorSwatchesProps) {
    return (
        <Group gap={4} wrap="nowrap">
            <ColorPresetSwatches value={value} onChange={onChange} />
            {allowCustom && (
                <ColorCustomControls value={value} onChange={onChange} />
            )}
        </Group>
    );
}
