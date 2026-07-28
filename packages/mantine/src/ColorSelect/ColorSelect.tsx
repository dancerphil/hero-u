import { ColorSwatch, Popover } from '@mantine/core';
import { resolveColor } from './color.js';
import { ColorPresetSwatches } from './ColorPresetSwatches.js';
import type { ColorSelectProps } from './types.js';

export function ColorSelect(props: ColorSelectProps) {
    return (
        <Popover radius="md" position="bottom-start" shadow="md">
            <Popover.Target>
                <ColorSwatch
                    radius="md"
                    size={32}
                    color={resolveColor(props.value)}
                    style={{ cursor: 'pointer' }}
                />
            </Popover.Target>
            <Popover.Dropdown p={8}>
                <ColorPresetSwatches {...props} />
            </Popover.Dropdown>
        </Popover>
    );
}
