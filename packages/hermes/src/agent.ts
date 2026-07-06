import { generateText, stepCountIs, tool, type ModelMessage, type ToolSet } from 'ai';
import { z } from 'zod';
import { createWebSearchTool } from '@hero-u/ai';
import { model } from './llm/models.js';
import { addCronJob, listCronJobs, removeCronJob, updateCronJob } from './cron/store.js';
import { loadSession, saveSession } from './session.js';
import { env } from './env.js';

// 联网搜索走 OpenRouter 的 web 插件，与对话主模型解耦。
const WEB_SEARCH_MODEL = 'deepseek/deepseek-v4-flash:online';

// 联网搜索工具：聊天和定时任务共用；没配 OPENROUTER_API_KEY 时为空。
const webSearchTools = (): ToolSet =>
    env.OPENROUTER_API_KEY
        ? { web_search: createWebSearchTool({ apiKey: env.OPENROUTER_API_KEY, model: WEB_SEARCH_MODEL }) }
        : {};

export interface AgentDeps {
    accountId: string;
    userId: string;
    // 提供 sessionId 时启用按会话隔离的多轮上下文。
    sessionId?: string;
}

const systemPrompt = (): string =>
    `你是 hero-u 的飞书助手 hero-hermes，用简洁口语化的中文回复。
- 用户要创建/查看/修改/删除定时提醒时调用相应工具；schedule 必须是标准 5 段 cron 表达式（分 时 日 月 周），task 是到点要触发的提醒或指令。
- 修改或删除前若不知道任务 id，先用 list_crons 查到 id。
- 需要最新或实时信息时调用 web_search 联网搜索。
- 当用户的需求适合用定时提醒解决时（如重复待办、周期提醒），主动建议并帮他设成定时任务。
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
        ...webSearchTools(),
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
        system: `你是提醒助手。根据用户给的任务描述，生成要发送的提醒消息正文，简洁、口语化，直接输出正文，不要解释。需要最新或实时信息时调用 web_search 联网搜索。
当前时间：${new Date().toLocaleString('zh-CN')}。涉及新闻、资讯、天气等时效信息时，务必先联网搜索，并只采用与当前日期相符的最新内容。`,
        prompt: task,
        tools: webSearchTools(),
        stopWhen: stepCountIs(5),
    });
    return result.text;
};
