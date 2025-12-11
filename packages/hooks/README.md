# @hero-u/hooks

### Install

```shell
npm install @hero-u/hooks
```

```shell
yarn @hero-u/hooks
```

### Use

```tsx
import { useMobile } from '@hero-u/hooks';

const isMobile = useMobile();
```

```tsx
import { useActionLoading } from '@hero-u/hooks';

const [onClick, loading] = useActionLoading(handleClick);
```
