import { Injectable, Logger } from "@nestjs/common";
import { modelSchema, type ModelSchema } from "./models.schema.js";

const MODELS_DEV_URL = "https://models.dev/api.json";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

@Injectable()
export class ModelInfoService {
  private readonly logger = new Logger(ModelInfoService.name);
  private cache: Map<string, ModelSchema> = new Map();
  private lastFetch: number = 0;

  async getContextLimit(modelId: string): Promise<number> {
    const models = await this.fetchModels();
    const model = models[modelId];
    return model?.limit?.context ?? 128_000;
  }

  async getModel(modelId: string): Promise<ModelSchema | undefined> {
    const models = await this.fetchModels();
    return models[modelId];
  }

  private async fetchModels(): Promise<Record<string, ModelSchema>> {
    if (this.cache.size > 0 && Date.now() - this.lastFetch < CACHE_TTL_MS) {
      return Object.fromEntries(this.cache);
    }

    try {
      const res = await fetch(MODELS_DEV_URL);
      const data = await res.json();

      const models: Record<string, ModelSchema> = {};
      for (const [id, model] of Object.entries(
        data as Record<string, unknown>,
      )) {
        const parsed = modelSchema.safeParse(model);
        if (parsed.success) {
          models[id] = parsed.data;
          this.cache.set(id, parsed.data);
        }
      }

      this.lastFetch = Date.now();
      this.logger.log(
        `Fetched ${Object.keys(models).length} models from models.dev`,
      );
      return models;
    } catch (error) {
      this.logger.error("Failed to fetch models", error);
      return Object.fromEntries(this.cache);
    }
  }
}
