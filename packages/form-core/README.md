# @hero-u/form-core

Framework-agnostic form state management with a pub/sub subscription model.

## Installation

```bash
npm install @hero-u/form-core
```

## Core concepts

State is stored in a stable ref object (`FormRefObject`) created once per `FormProvider`. Components subscribe to specific field paths via `useSyncExternalStore`; only subscribed components re-render when their path changes.

**`setFieldValue` uses immutable path cloning (`setIn`)**: writing `transactions.0.checked` shallow-clones every container along that path, so both `useFieldValue('transactions.0.checked')` and `useFieldValue('transactions')` receive the update. Sibling paths keep their original references.

**Emit strategy `'related'`** (default): notifying a path also notifies any ancestor or descendant subscriptions, matching the cloning scope exactly.

## Basic usage

```tsx
import { FormProvider, useFormContext, useFieldValue } from '@hero-u/form-core';

interface Values {
  name: string;
  age: number;
}

// Provider
<FormProvider<Values>
  initialValues={{ name: '', age: 0 }}
  onValuesChange={values => console.log(values)}
>
  <MyForm />
</FormProvider>

// Read a field reactively
const name = useFieldValue<string>('name');

// Read/write via form ref
const form = useFormContext<Values>();
form.getValues();
form.setFieldValue('name', 'Alice');
form.setFieldValue('items.0.checked', true);           // fine-grained write
form.setValues({ name: 'Alice', age: 30 });            // shallow-merge multiple fields
form.setFieldValue('items', prev => [...prev, item]);  // functional update
form.resetFields();
```

## API

### `<FormProvider>`

| Prop | Type | Description |
|------|------|-------------|
| `initialValues` | `T \| (() => T)` | Initial form values |
| `onValuesChange` | `(values: T) => void` | Called after every field write |
| `validate` | `(values: T) => Errors \| Promise<Errors>` | Form-level validator |
| `emitCompareStrategy` | `'equal' \| 'related' \| 'all' \| fn` | Subscription notification strategy (default `'related'`) |

### Hooks

| Hook | Returns | Description |
|------|---------|-------------|
| `useFormContext<T>()` | `FormRefObject<T>` | Access the form ref |
| `useFieldValue<V>(name)` | `V` | Subscribe to a field value |
| `useFieldHandler(name, opts?)` | `onChange fn` | Standard change handler (supports `type: 'checkbox'`) |
| `useField(name)` | `{ value, error, touched }` | Field state snapshot |
| `useFormSubmit(onSubmit)` | `{ handleSubmit, isSubmitting }` | Submit with validation |
| `useFormSubmitCount()` | `number` | How many times the form was submitted |
| `useFormErrors()` | `Errors` | Current validation errors |
| `useFormValidating()` | `boolean` | Whether async validation is running |

### `FormRefObject` methods

| Method | Description |
|--------|-------------|
| `getValues()` | Current values snapshot (non-reactive) |
| `setFieldValue(path, value \| updater)` | Write one field (immutable path clone) |
| `setValues(partial \| updater)` | Shallow-merge into values |
| `resetFields()` | Restore `initialValues`, clear errors & touched |
| `getFieldValue(path)` | Non-reactive field read |
| `getFieldError(path)` | Current error for a field |
| `waitForValidation()` | `Promise<Errors>` — resolves after debounced validation settles |

### Path notation

Paths follow lodash convention: `'a.b'`, `'items[0].name'`, or an array `['items', 0, 'name']`.

### Validation

```tsx
import { createValidate, createRequiredFieldValidate } from '@hero-u/form-core';

// Field-level (attach via Field component or setFieldValidate)
const validateAge = createValidate<number>(({ value }) => {
  if (value < 0) return 'Must be non-negative';
});

// Required shorthand
const required = createRequiredFieldValidate('This field is required');

// Form-level
<FormProvider validate={values => {
  const errors: any = {};
  if (!values.name) errors.name = 'Required';
  return errors;
}}>
```

### `FieldDefaultPropsProvider`

Propagate `disabled` (and other default props) to all `Field` descendants:

```tsx
<FieldDefaultPropsProvider disabled={isLoading}>
  <MyForm />
</FieldDefaultPropsProvider>
```

## License

MIT
