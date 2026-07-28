import {
    ActionIcon,
    CheckIcon,
    ColorPicker,
    ColorSwatch,
    Popover,
    TextInput,
} from '@mantine/core';
import { useEyeDropper } from '@mantine/hooks';
import { IconFocus2 } from '@tabler/icons-react';
import { isCustomColor } from './color.js';
import classes from './ColorSwatch.module.css';
import { ColorWheelIcon } from './ColorWheelIcon.js';
import type { ColorValueProps } from './types.js';

export function ColorCustomControls({ value, onChange }: ColorValueProps) {
    const { open, supported } = useEyeDropper();
    const customColorSelected = isCustomColor(value);

    const handleEyeDropper = async () => {
        try {
            const color = await open();
            if (color) onChange(color.sRGBHex);
        }
        catch {
            return;
        }
    };

    return (
        <>
            <Popover radius="md" position="bottom-end" shadow="md">
                <Popover.Target>
                    {customColorSelected ? (
                        <ColorSwatch
                            component="button"
                            radius="md"
                            size={32}
                            color={value}
                            className={classes.swatch}
                        >
                            <CheckIcon size={14} />
                        </ColorSwatch>
                    ) : (
                        <ActionIcon size="lg" variant="default">
                            <ColorWheelIcon />
                        </ActionIcon>
                    )}
                </Popover.Target>
                <Popover.Dropdown p={8}>
                    <ColorPicker
                        value={value}
                        onChange={onChange}
                        format="rgba"
                    />
                    <TextInput
                        value={value}
                        onChange={event => onChange(event.currentTarget.value)}
                        placeholder="Enter color"
                        radius="md"
                        size="xs"
                        mt="xs"
                    />
                </Popover.Dropdown>
            </Popover>
            {supported && (
                <ActionIcon
                    size="lg"
                    variant="default"
                    onClick={handleEyeDropper}
                >
                    <IconFocus2 size={18} />
                </ActionIcon>
            )}
        </>
    );
}
