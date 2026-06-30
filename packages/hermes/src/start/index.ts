import { watch } from 'node:fs';
import { ensureDir } from '../paths.js';
import { gateways } from '../gateways.js';
import { startGateway } from '../weixin/gateway.js';
import { accountsDir, listAccounts } from '../weixin/account.js';
import { loadFeishuConfig, startFeishuGateway } from '../feishu/gateway.js';
import { syncCronJobs } from './scheduler.js';

// 接入账号目录中尚未启动网关的微信账号；裂变新登录的账号会落盘到此目录，由监听自动捕获。
const startNewAccounts = (): void => {
    for (const account of listAccounts()) {
        if (!gateways.has(account.account_id)) {
            startGateway(account);
            console.log(`已接入微信账号 ${account.account_id}`);
        }
    }
};

ensureDir(accountsDir());
startNewAccounts();
watch(accountsDir(), () => startNewAccounts());

const feishuConfig = loadFeishuConfig();
if (feishuConfig) {
    await startFeishuGateway(feishuConfig);
    console.log(`已接入飞书应用 ${feishuConfig.appId}`);
}

if (gateways.size === 0) {
    console.error('尚未配置，请先运行 hero-hermes setup');
    process.exitCode = 1;
}
else {
    syncCronJobs();
    setInterval(syncCronJobs, 10_000);
    console.log('hero-hermes 已启动，正在监听微信账号目录与飞书消息...');
}
