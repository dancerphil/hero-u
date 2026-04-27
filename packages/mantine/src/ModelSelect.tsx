import { useMemo, type ReactNode } from 'react';
import { Combobox, Group, InputBase, ScrollArea, Text, Tooltip, useCombobox } from '@mantine/core';
import { groupBy } from 'lodash-es';
import { IconHelp } from '@tabler/icons-react';

export interface ModelOption {
    id: string;
    provider?: string;
    name?: string;
    description?: string;
    multiplier?: number;
}

interface Props {
    value?: string;
    onChange?: (model: string) => void;
    options: ModelOption[];
    disabled?: boolean;
    placeholder?: ReactNode;
}

const capitalize = (str: string): string => str.charAt(0).toUpperCase() + str.slice(1);

export const ModelSelect = ({ value, onChange, options, disabled = false, placeholder }: Props) => {
    const combobox = useCombobox();

    const modelGroups = useMemo(
        () => {
            const withDefaults = options.map(m => ({ ...m, provider: m.provider || 'Other' }));
            const group = groupBy(withDefaults, 'provider');
            return Object.entries(group).map(([provider, groupedModels]) => ({
                provider,
                models: [...groupedModels].sort((a, b) => (a.multiplier ?? 0) - (b.multiplier ?? 0)),
            }));
        },
        [options],
    );

    const selectedModel = options.find(m => m.id === value);
    const displayValue = selectedModel
        ? <Text component="span" size="sm">{selectedModel.name ?? selectedModel.id}</Text>
        : <Text component="span" size="sm" c="dimmed">{placeholder ?? 'Select model...'}</Text>;

    const optionElements = modelGroups.map(group => (
        <Combobox.Group key={group.provider} label={capitalize(group.provider)}>
            {group.models.map(model => (
                <Combobox.Option key={model.id} value={model.id}>
                    <Group justify="space-between" wrap="nowrap" w="100%">
                        <Text component="span" size="sm">{model.name ?? model.id}</Text>
                        <Group gap={4} wrap="nowrap" style={{ flexShrink: 0 }} c="dimmed">
                            {model.multiplier != null && (
                                <Text component="span" size="sm">{`${model.multiplier}x`}</Text>
                            )}
                            {model.description && (
                                <Tooltip label={model.description}>
                                    <IconHelp size={14} style={{ cursor: 'help' }} />
                                </Tooltip>
                            )}
                        </Group>
                    </Group>
                </Combobox.Option>
            ))}
        </Combobox.Group>
    ));

    return (
        <Combobox
            store={combobox}
            onOptionSubmit={(value) => {
                onChange?.(value);
                combobox.closeDropdown();
            }}
            disabled={disabled}
        >
            <Combobox.Target>
                <InputBase
                    component="button"
                    type="button"
                    pointer
                    rightSection={<Combobox.Chevron />}
                    onClick={() => combobox.toggleDropdown()}
                    disabled={disabled}
                >
                    {displayValue}
                </InputBase>
            </Combobox.Target>

            <Combobox.Dropdown>
                <Combobox.Options>
                    <ScrollArea.Autosize mah={320} type="scroll">
                        {optionElements}
                    </ScrollArea.Autosize>
                </Combobox.Options>
            </Combobox.Dropdown>
        </Combobox>
    );
};
