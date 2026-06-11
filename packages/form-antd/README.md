# @hero-u/form-antd

Ant Design bindings for [@hero-u/form-core](../form-core/README.md).

## Installation

```bash
npm install @hero-u/form-antd @hero-u/form-core
```

Wrap your form in antd's `<Form>` to inherit its CSS variables:

```tsx
import { Form } from 'antd';
import { FormProvider, Field } from '@hero-u/form-antd';
import { Input, Select } from 'antd';

<Form layout="horizontal">
  <FormProvider initialValues={{ name: '', role: 'admin' }}>
    <Field name="name" label="Name">
      <Input />
    </Field>
    <Field name="role" label="Role" width={80}>
      <Select options={[{ value: 'admin' }, { value: 'user' }]} />
    </Field>
  </FormProvider>
</Form>
```

## `<Field>`

Renders a `Form.Item` layout wrapper and injects `value` / `onChange` / `disabled` into the child input via `cloneElement`.

```tsx
<Field name="age" label="Age" validate={v => v < 0 ? 'Must be non-negative' : undefined}>
  <InputNumber />
</Field>

<Field name="active" label="Active" type="checkbox">
  <Checkbox />
</Field>
```

| Prop | Type | Description |
|------|------|-------------|
| `name` | `Path \| PathSegment` | Field path |
| `type` | `'checkbox'` | Use `checked` instead of `value` |
| `validate` | `FieldValidate` | Field-level validator |
| `enableErrorWhenUntouched` | `boolean` | Show error before the field is touched |
| `extraChildren` | `ReactNode` | Rendered after the input inside `Form.Item` |
| + all `Form.Item` props | | Except `help`, `rules`, `shouldUpdate`, `dependencies` |

## `<FieldLayout>`

`Form.Item` wrapper used internally by `<Field>`. Use it directly when you need layout without a bound field path.

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `width` | `number` | `120` | Label column width in px |
| `hasGap` | `boolean` | `true` | When false, sets `marginBottom: 0` |

## `<FieldArray>`

Manages a list of items with add/delete controls.

```tsx
import { FieldArray } from '@hero-u/form-antd';

<FieldArray name="phones" createDefaultValue={() => ''} atLeastOne>
  {index => (
    <Field name={`phones.${index}`} label={`Phone ${index + 1}`} hasGap={false}>
      <Input />
    </Field>
  )}
</FieldArray>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `Path \| PathSegment` | — | Array field path |
| `createDefaultValue` | `() => T` | `() => ''` | Value for newly added items |
| `atLeastOne` | `boolean` | `false` | Disable delete when only one item remains |
| `AddButton` | `ComponentType<AddButtonProps>` | Button with `PlusOutlined` | Custom add trigger |
| `DeleteButton` | `ComponentType<DeleteButtonProps>` | Button with `DeleteOutlined` | Custom delete trigger |

## `<FieldArrayTable>` / `<FieldArrayInnerTable>`

Table-based array editor. Each row is a table row; columns are defined via `createColumns`.

```tsx
import { FieldArrayTable } from '@hero-u/form-antd';

<FieldArrayTable
  name="items"
  createDefaultValue={() => ({ name: '', qty: 1 })}
  createColumns={({ DeleteButton }) => [
    {
      title: 'Name',
      render: (_, __, index) => (
        <Field name={`items.${index}.name`} hasGap={false}>
          <Input />
        </Field>
      ),
    },
    { title: '', render: (_, __, index) => <DeleteButton index={index} /> },
  ]}
/>
```

## Re-exports

All of `@hero-u/form-core` is re-exported:

```tsx
import { FormProvider, Field, useFieldValue, useFormContext, useFormSubmit } from '@hero-u/form-antd';
```

## License

MIT
