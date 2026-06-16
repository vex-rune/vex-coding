/**
 * 配置管理模块
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { LLMConfig, DEFAULT_LLM_CONFIG, ProjectConfig } from '../types/index.js';

/** 配置存储 */
export class ConfigStore {
  private llmConfig: LLMConfig;
  private projectConfig: ProjectConfig;
  private configDir: string;

  constructor(configDir?: string) {
    this.configDir = configDir ?? this.getDefaultConfigDir();
    this.llmConfig = { ...DEFAULT_LLM_CONFIG };
    this.projectConfig = {
      indexOnStartup: true,
    };
    this.load();
  }

  /** 获取 LLM 配置 */
  getLLM(): LLMConfig {
    return { ...this.llmConfig };
  }

  /** 设置 LLM 配置（部分更新） */
  setLLM(config: Partial<LLMConfig>): void {
    this.llmConfig = { ...this.llmConfig, ...config };
  }

  /** 获取项目配置 */
  getProject(): ProjectConfig {
    return { ...this.projectConfig };
  }

  /** 设置项目配置 */
  setProject(config: Partial<ProjectConfig>): void {
    this.projectConfig = { ...this.projectConfig, ...config };
  }

  /** 获取 API Key */
  getApiKey(): string {
    return this.llmConfig.apiKey;
  }

  /** 设置 API Key */
  setApiKey(apiKey: string): void {
    this.llmConfig.apiKey = apiKey;
  }

  /** 验证配置是否有效 */
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.llmConfig.apiKey) {
      errors.push('API Key 未设置');
    }

    if (!this.llmConfig.apiEndpoint) {
      errors.push('API Endpoint 未设置');
    }

    if (!this.llmConfig.model) {
      errors.push('Model 未设置');
    }

    if (this.llmConfig.maxTokens <= 0) {
      errors.push('MaxTokens 必须大于 0');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /** 从文件加载配置 */
  load(): void {
    const llmConfigPath = this.getLLMConfigPath();
    if (existsSync(llmConfigPath)) {
      try {
        const content = readFileSync(llmConfigPath, 'utf-8');
        const loaded = JSON.parse(content) as Partial<LLMConfig>;
        this.llmConfig = { ...DEFAULT_LLM_CONFIG, ...loaded };
      } catch {
        // 配置加载失败，使用默认值
      }
    }

    const projectConfigPath = this.getProjectConfigPath();
    if (existsSync(projectConfigPath)) {
      try {
        const content = readFileSync(projectConfigPath, 'utf-8');
        const loaded = JSON.parse(content) as Partial<ProjectConfig>;
        this.projectConfig = { ...this.projectConfig, ...loaded };
      } catch {
        // 配置加载失败，使用默认值
      }
    }
  }

  /** 保存配置到文件 */
  save(): void {
    this.ensureConfigDir();

    const llmConfigPath = this.getLLMConfigPath();
    writeFileSync(llmConfigPath, JSON.stringify(this.llmConfig, null, 2), 'utf-8');

    const projectConfigPath = this.getProjectConfigPath();
    writeFileSync(projectConfigPath, JSON.stringify(this.projectConfig, null, 2), 'utf-8');
  }

  /** 获取默认配置目录 */
  private getDefaultConfigDir(): string {
    const home = process.env.HOME ?? process.env.USERPROFILE ?? '.';
    return join(home, '.vexcoding');
  }

  /** 获取 LLM 配置路径 */
  private getLLMConfigPath(): string {
    return join(this.configDir, 'config.json');
  }

  /** 获取项目配置路径 */
  private getProjectConfigPath(): string {
    return join(this.configDir, 'project.json');
  }

  /** 确保配置目录存在 */
  private ensureConfigDir(): void {
    if (!existsSync(this.configDir)) {
      mkdirSync(this.configDir, { recursive: true });
    }
  }
}

/** 单例配置存储 */
let globalConfigStore: ConfigStore | null = null;

/** 获取全局配置存储 */
export function getConfigStore(configDir?: string): ConfigStore {
  if (!globalConfigStore) {
    globalConfigStore = new ConfigStore(configDir);
  }
  return globalConfigStore;
}

/** 重置全局配置存储 */
export function resetConfigStore(): void {
  globalConfigStore = null;
}