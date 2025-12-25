/**
 * 配置模块 - 从命令行参数读取配置
 */

export interface Config {
  baseUrl: string;
  token: string;
  batchSize: number;
  maxLinesPerBlob: number;
  textExtensions: Set<string>;
  excludePatterns: string[];
  enableLog: boolean;
}

/**
 * 上传策略配置（根据项目规模自适应）
 */
export interface UploadStrategy {
  batchSize: number;      // 每批上传的文件块数
  concurrency: number;    // 并发上传数
  timeout: number;        // 单次请求超时（毫秒）
  scaleName: string;      // 规模名称（用于日志）
}

/**
 * 根据文件块数量获取自适应上传策略
 */
export function getUploadStrategy(blobCount: number): UploadStrategy {
  if (blobCount < 100) {
    // 小型项目：保守配置，快速完成
    return {
      batchSize: 10,
      concurrency: 1,
      timeout: 30000,
      scaleName: '小型'
    };
  } else if (blobCount < 500) {
    // 中型项目：适度并发
    return {
      batchSize: 30,
      concurrency: 2,
      timeout: 45000,
      scaleName: '中型'
    };
  } else if (blobCount < 2000) {
    // 大型项目：高效并发
    return {
      batchSize: 50,
      concurrency: 3,
      timeout: 60000,
      scaleName: '大型'
    };
  } else {
    // 超大型项目：最大化吞吐
    return {
      batchSize: 70,
      concurrency: 4,
      timeout: 90000,
      scaleName: '超大型'
    };
  }
}

// 默认支持的文本文件扩展名
const DEFAULT_TEXT_EXTENSIONS = new Set([
  // 编程语言
  '.py', '.js', '.ts', '.jsx', '.tsx',
  '.java', '.go', '.rs', '.cpp', '.c',
  '.h', '.hpp', '.cs', '.rb', '.php',
  '.swift', '.kt', '.scala', '.clj',
  // 配置和数据
  '.md', '.txt', '.json', '.yaml', '.yml',
  '.toml', '.xml', '.ini', '.conf',
  // Web 相关
  '.html', '.css', '.scss', '.sass', '.less',
  // 脚本
  '.sql', '.sh', '.bash', '.ps1', '.bat',
  '.vue', '.svelte'
]);

// 默认排除模式
const DEFAULT_EXCLUDE_PATTERNS = [
  // 虚拟环境
  '.venv', 'venv', '.env', 'env', 'node_modules',
  // 版本控制
  '.git', '.svn', '.hg',
  // Python 缓存
  '__pycache__', '.pytest_cache', '.mypy_cache',
  '.tox', '.eggs', '*.egg-info',
  // 构建产物
  'dist', 'build', 'target', 'out',
  // IDE 配置
  '.idea', '.vscode', '.vs',
  // 系统文件
  '.DS_Store', 'Thumbs.db',
  // 编译文件
  '*.pyc', '*.pyo', '*.pyd', '*.so', '*.dll',
  // Ace-tool 目录
  '.ace-tool'
];

let config: Config | null = null;

/**
 * 解析命令行参数
 */
function parseArgs(): { baseUrl?: string; token?: string; enableLog?: boolean } {
  const args = process.argv.slice(2);
  const result: { baseUrl?: string; token?: string; enableLog?: boolean } = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--base-url' && i + 1 < args.length) {
      result.baseUrl = args[i + 1];
      i++;
    } else if (arg === '--token' && i + 1 < args.length) {
      result.token = args[i + 1];
      i++;
    } else if (arg === '--enable-log') {
      result.enableLog = true;
    }
  }

  return result;
}

/**
 * 初始化配置
 */
export function initConfig(): Config {
  const args = parseArgs();

  if (!args.baseUrl) {
    throw new Error('Missing required argument: --base-url');
  }

  if (!args.token) {
    throw new Error('Missing required argument: --token');
  }

  // 确保 baseUrl 包含协议前缀
  let baseUrl = args.baseUrl;
  if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
    baseUrl = `https://${baseUrl}`;
  }
  baseUrl = baseUrl.replace(/\/$/, ''); // 移除末尾斜杠

  config = {
    baseUrl,
    token: args.token,
    batchSize: 10,
    maxLinesPerBlob: 800,
    textExtensions: DEFAULT_TEXT_EXTENSIONS,
    excludePatterns: DEFAULT_EXCLUDE_PATTERNS,
    enableLog: args.enableLog || false
  };

  return config;
}

/**
 * 获取配置
 */
export function getConfig(): Config {
  if (!config) {
    throw new Error('Config not initialized. Call initConfig() first.');
  }
  return config;
}
