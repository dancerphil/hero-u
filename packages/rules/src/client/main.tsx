import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MantineProvider, v8CssVariablesResolver } from '@mantine/core';
import '@mantine/core/styles.css';
import './index.css';
import { I18nProvider } from './i18n';
import App from './App';

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <MantineProvider defaultColorScheme="dark" cssVariablesResolver={v8CssVariablesResolver}>
            <I18nProvider>
                <App />
            </I18nProvider>
        </MantineProvider>
    </StrictMode>,
);
