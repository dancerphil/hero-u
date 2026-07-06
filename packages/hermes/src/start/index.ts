import { gateways } from '../gateways.js';
import { loadFeishuConfig, startFeishuGateway } from '../feishu/gateway.js';
import { syncCronJobs } from './scheduler.js';

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
    console.log('hero-hermes 已启动，正在监听飞书消息...');
}
