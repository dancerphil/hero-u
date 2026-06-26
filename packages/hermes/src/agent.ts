import { generateText, stepCountIs, tool, type ModelMessage } from 'ai';
import { z } from 'zod';
import { createWebSearchTool } from '@hero-u/ai';
import { model } from './llm/models.js';
import { addCronJob, listCronJobs, removeCronJob, updateCronJob } from './cron/store.js';
import { requestQrcode, waitForLogin } from './weixin/qrLogin.js';
import { loadSession, saveSession } from './session.js';
import { env } from './env.js';

// 联网搜索走 OpenRouter 的 web 插件，与对话主模型解耦。
const WEB_SEARCH_MODEL = 'deepseek/deepseek-v4-flash:online';

export interface AgentDeps {
    accountId: string;
    userId: string;
    // 提供 sessionId 时启用按会话隔离的多轮上下文。
    sessionId?: string;
}

const systemPrompt = (): string =>
    `你是 hero-u 的微信助手 hero-hermes，用简洁口语化的中文回复。
- 用户要创建/查看/修改/删除定时提醒时调用相应工具；schedule 必须是标准 5 段 cron 表达式（分 时 日 月 周），task 是到点要触发的提醒或指令。
- 修改或删除前若不知道任务 id，先用 list_crons 查到 id。
- 需要最新或实时信息时调用 web_search 联网搜索。
- 当用户的需求适合用定时提醒解决时（如重复待办、周期提醒），主动建议并帮他设成定时任务。
- 用户想邀请别人或接入新微信账号时调用 invite 获取二维码，并把返回的图片链接原样发给用户，不要改写链接。
当前时间：${new Date().toLocaleString('zh-CN')}`;

const buildTools = (deps: AgentDeps) => {
    const ownJobs = () => listCronJobs().filter(job => job.accountId === deps.accountId && job.userId === deps.userId);
    return {
        create_cron: tool({
            description: '创建定时任务，到点后由 AI 根据 task 生成提醒内容发回给用户。',
            inputSchema: z.object({
                schedule: z.string().describe('标准 5 段 cron 表达式，如 "0 8 * * *" 表示每天早上 8 点'),
                task: z.string().describe('到点要触发的提醒或指令，如 "提醒喝水" 或 "给我一句今日鼓励"'),
            }),
            execute: async ({ schedule, task }) => {
                const job = addCronJob({ accountId: deps.accountId, userId: deps.userId, schedule, task });
                return `已创建：${job.schedule} → ${job.task}（id: ${job.id}）`;
            },
        }),
        list_crons: tool({
            description: '列出当前用户的所有定时任务及其 id。',
            inputSchema: z.object({}),
            execute: async () => {
                const jobs = ownJobs();
                return jobs.length === 0
                    ? '当前没有定时任务。'
                    : jobs.map(job => `${job.id}｜${job.schedule}｜${job.task}`).join('\n');
            },
        }),
        update_cron: tool({
            description: '修改指定 id 的定时任务的 schedule 或 task。',
            inputSchema: z.object({
                id: z.string(),
                schedule: z.string().optional(),
                task: z.string().optional(),
            }),
            execute: async ({ id, schedule, task }) => {
                const job = updateCronJob(id, { schedule, task });
                return job ? `已更新：${job.schedule} → ${job.task}` : `未找到任务 ${id}`;
            },
        }),
        delete_cron: tool({
            description: '删除指定 id 的定时任务。',
            inputSchema: z.object({ id: z.string() }),
            execute: async ({ id }) => (removeCronJob(id) ? '已删除' : `未找到任务 ${id}`),
        }),
        invite: tool({
            description: '当用户想邀请别人、接入新的微信账号或索要二维码时调用，返回一张可扫码登录的二维码图片链接。',
            inputSchema: z.object({}),
            execute: async () => {
                const qrcode = await requestQrcode();
                // 后台等待扫码确认；确认后 saveAccount 会被账号目录监听捕获，自动接入新账号、无需重启。
                void waitForLogin(qrcode.value).catch(error => console.error('邀请登录轮询失败:', error));
                return `把这个二维码图片转发给对方，扫码即可接入新的微信账号（5 分钟内有效）。请把链接原样发给用户：\n${qrcode.imageUrl}`;
            },
        }),
        ...(env.OPENROUTER_API_KEY
            ? { web_search: createWebSearchTool({ apiKey: env.OPENROUTER_API_KEY, model: WEB_SEARCH_MODEL }) }
            : {}),
    };
};

export const runAgent = async (text: string, deps: AgentDeps): Promise<string> => {
    const history = deps.sessionId ? loadSession(deps.sessionId) : [];
    const messages: ModelMessage[] = [...history, { role: 'user', content: text }];
    const result = await generateText({
        model,
        system: systemPrompt(),
        messages,
        tools: buildTools(deps),
        stopWhen: stepCountIs(5),
    });
    if (deps.sessionId) {
        saveSession(deps.sessionId, [...messages, ...result.response.messages]);
    }
    return result.text;
};

// cron 到点时由 AI 根据任务描述生成要发送的提醒正文。
export const runCron = async (task: string): Promise<string> => {
    const result = await generateText({
        model,
        system: '你是提醒助手。根据用户给的任务描述，生成要发送的提醒消息正文，简洁、口语化，直接输出正文，不要解释。',
        prompt: task,
    });
    return result.text;
};
