import { randomUUID } from 'node:crypto';
import { heroUPath, readJson, writeJson } from '../paths.js';

export interface CronJob {
    id: string;
    accountId: string;
    userId: string;
    schedule: string;
    task: string;
    createdAt: string;
}

const cronFile = (): string => heroUPath('cron.json');

export const listCronJobs = (): CronJob[] => readJson<CronJob[]>(cronFile()) ?? [];

export const addCronJob = (job: Pick<CronJob, 'accountId' | 'userId' | 'schedule' | 'task'>): CronJob => {
    const jobs = listCronJobs();
    const created: CronJob = { ...job, id: randomUUID(), createdAt: new Date().toISOString() };
    jobs.push(created);
    writeJson(cronFile(), jobs);
    return created;
};

export const updateCronJob = (
    id: string,
    patch: Partial<Pick<CronJob, 'schedule' | 'task'>>,
): CronJob | undefined => {
    const jobs = listCronJobs();
    const job = jobs.find(item => item.id === id);
    if (!job) {
        return undefined;
    }
    if (patch.schedule !== undefined) {
        job.schedule = patch.schedule;
    }
    if (patch.task !== undefined) {
        job.task = patch.task;
    }
    writeJson(cronFile(), jobs);
    return job;
};

export const removeCronJob = (id: string): boolean => {
    const jobs = listCronJobs();
    const next = jobs.filter(job => job.id !== id);
    if (next.length === jobs.length) {
        return false;
    }
    writeJson(cronFile(), next);
    return true;
};
