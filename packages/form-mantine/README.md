# @hero-u/form-mantine

Mantine bindings for [@hero-u/form-core](../form-core/README.md).

## Installation

```bash
npm install @hero-u/form-mantine @hero-u/form-core
```

## Usage

```tsx
import { FormProvider, Field, FieldArray, useFieldValue, useFormContext } from '@hero-u/form-mantine';
import { TextInput, Checkbox, NumberInput } from '@mantine/core';

<FormProvider initialValues={{ name: '', items: [''] }}>
  <Field name="name">
    <TextInput label="Name" />
  </Field>

  <FieldArray name="items" createDefaultValue={() => ''}>
    {index => (
      <Field name={`items.${index}`}>
        <TextInput />
      </Field>
    )}
  </FieldArray>
</FormProvider>
```

## `<Field>`

Injects `value` / `onChange` / `error` / `disabled` into a single Mantine input via `cloneElement`. No layout wrapper — label stays on the input component itself.

```tsx
<Field name="checked" type="checkbox">
  <Checkbox label="Agree" />
</Field>
```

| Prop | Type | Description |
|------|------|-------------|
| `name` | `Path \| PathSegment` | Field path |
| `type` | `'checkbox'` | Use `checked` instead of `value` |
| `validate` | `FieldValidate` | Field-level validator |
| `enableErrorWhenUntouched` | `boolean` | Show error before the field is touched |

Child props take precedence: if the child already has `value`, `onChange`, or `error` set, those are kept as-is.

## `<FieldArray>`

Manages a list of items with add/delete controls.

```tsx
<FieldArray
  name="phones"
  createDefaultValue={() => ({ number: '', type: 'mobile' })}
  atLeastOne
>
  {index => (
    <Field name={`phones.${index}.number`}>
      <TextInput placeholder="Phone" />
    </Field>
  )}
</FieldArray>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `Path \| PathSegment` | — | Array field path |
| `createDefaultValue` | `() => T` | `() => ''` | Value for newly added items |
| `atLeastOne` | `boolean` | `false` | Disable delete when only one item remains |
| `Container` | `ComponentType` | `Group` | Wraps each row |
| `AddButton` | `ComponentType<AddButtonProps>` | Button with `IconPlus` | Custom add trigger |
| `DeleteButton` | `ComponentType<DeleteButtonProps>` | `ActionIcon` with `IconTrash` | Custom delete trigger |

## Re-exports

All of `@hero-u/form-core` is re-exported, so a single import covers everything:

```tsx
import { FormProvider, Field, useFieldValue, useFormContext, useFormSubmit } from '@hero-u/form-mantine';
```

## License

MIT
