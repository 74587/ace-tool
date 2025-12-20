/**
 * MCP 日志模块 - 向 MCP 客户端发送日志
 */

import type { Server } from '@modelcontextprotocol/sdk/server/index.js';

type LogLevel = 'debug' | 'info' | 'warning' | 'error';

let mcpServer: Server | null = null;

/**
 * 初始化 MCP 日志模块
 */
export function initMcpLogger(server: Server): void {
  mcpServer = server;
}

/**
 * 发送日志到 MCP 客户端
 */
export function sendMcpLog(level: LogLevel, message: string): void {
  if (!mcpServer) {
    return;
  }

  mcpServer.sendLoggingMessage({
    level,
    data: message,
  }).catch(() => {
    // 忽略发送失败（可能客户端未连接）
  });
}
