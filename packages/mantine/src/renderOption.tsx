import { Group, SelectProps } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';

export const renderOption: SelectProps['renderOption'] = ({ option, checked }) => (
    <Group justify="space-between" w="100%" wrap="nowrap">
        <span>{option.label}</span>
        {checked && (
            <IconCheck
                size={14}
                color="var(--mantine-primary-color-filled)"
                style={{ flexShrink: 0 }}
            />
        )}
    </Group>
);
