import { Cron } from 'croner';
import { runCron } from '../agent.js';
import { listCronJobs, type CronJob } from '../cron/store.js';
import { gateways } from '../weixin/gateway.js';

const crons = new Map<string, Cron>();

// 到点由 AI 根据 task 生成提醒正文并发回给用户。
const runJob = async (job: CronJob): Promise<void> => {
    await gateways.get(job.accountId)?.send(job.userId, `⏰ ${await runCron(job.task)}`);
};

// 同步 cron.json 与运行中的定时器：新任务在下次同步时生效。
export const syncCronJobs = (): void => {
    const jobs = listCronJobs();
    const ids = new Set(jobs.map(job => job.id));
    for (const [id, cron] of crons) {
        if (!ids.has(id)) {
            cron.stop();
            crons.delete(id);
        }
    }
    for (const job of jobs) {
        if (crons.has(job.id)) {
            continue;
        }
        try {
            crons.set(job.id, new Cron(job.schedule, async () => {
                try {
                    await runJob(job);
                }
                catch (error) {
                    console.error('cron 执行失败:', error);
                }
            }));
        }
        catch (error) {
            console.error(`无效的 cron 表达式 "${job.schedule}":`, error);
        }
    }
};
