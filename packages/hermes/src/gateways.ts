export interface Gateway {
    // userId 同时是会话标识与回发目标，飞书是 chat_id。
    send: (userId: string, text: string) => Promise<void>;
}

// 全局单例：各渠道启动时按 accountId 自注册，scheduler 按 accountId 取用。
export const gateways = new Map<string, Gateway>();
