# @hero-u/css

### Install

```shell
npm install @hero-u/ant-design
```

```shell
yarn @hero-u/ant-design
```

### withTooltip

```tsx
import { Button as AntButton } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { withTooltip } from '@hero-u/ant-design';

const Button = withTooltip(AntButton);

const HelpIcon = withTooltip(QuestionCircleOutlined, {
    className: css`margin-left: 4px; cursor: pointer;`,
});

const App = () => {
    return (
        <div>
            <Button disabled disabledReason="你没有权限">高级功能</Button>
            <HelpIcon tooltip="提示内容" />
        </div>
    );
};
```

默认参数可以不传，或可以传入组件本身支持的任何 `props` 如 `className`，也支持 `tooltip` 和 `disabledReason`
