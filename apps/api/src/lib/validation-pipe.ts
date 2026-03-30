import {
  type PipeTransform,
  type ArgumentMetadata,
  BadRequestException,
  HttpStatus,
} from "@nestjs/common";
import { ZodError, type ZodType, z } from "zod";

export class ZodValidationPipe implements PipeTransform {
  constructor(
    private schema: ZodType,
    private options?: { validateCustomDecorators: boolean },
  ) {}

  transform(value: unknown, metadata: ArgumentMetadata): unknown {
    const validateCustomDecorators =
      this.options?.validateCustomDecorators || false;

    if (metadata.type === "custom" && !validateCustomDecorators) {
      return value;
    }

    try {
      const parsedValue: unknown = this.schema.parse(value);
      return parsedValue;
    } catch (error) {
      if (error instanceof ZodError) {
        console.error(z.treeifyError(error));
        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: "Validation failed",
          errors: z.treeifyError(error),
        });
      }
      throw error;
    }
  }
}
