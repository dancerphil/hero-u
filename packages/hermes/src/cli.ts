import { setup } from './setup.js';

const usage = `hero-hermes — hero-u 的微信助手

用法:
  hero-hermes setup   配置 API Key 与微信扫码登录（可反复运行，支持多账号）
  hero-hermes start   启动助手（监听消息 + 定时任务）`;

export const main = async (argv: string[]): Promise<void> => {
    try {
        const [command] = argv;
        if (command === 'setup') {
            await setup();
        }
        else if (command === 'start') {
            await import('./start/index.js');
        }
        else {
            console.log(usage);
        }
    }
    catch (error) {
        console.error(error);
        process.exitCode = 1;
    }
};
