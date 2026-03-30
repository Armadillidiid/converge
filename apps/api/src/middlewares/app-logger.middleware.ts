import { Injectable, type NestMiddleware, Logger } from "@nestjs/common";
import type { Request, Response, NextFunction } from "express";

@Injectable()
export class AppLoggerMiddleware implements NestMiddleware {
  private logger = new Logger("HTTP");

  use(request: Request, response: Response, next: NextFunction): void {
    const { ip, method, originalUrl } = request;
    const userAgent = request.get("user-agent") || "";

    const authHeader =
      request.get("authorization") || request.headers["authorization"] || "";
    const maskedAuth =
      typeof authHeader === "string" && authHeader.length > 0
        ? `${authHeader.split(" ")[0]} ${authHeader.split(" ")[1]?.slice(0, 6) ?? ""}...`
        : "none";
    const userId = (request as any).user?.id ?? "unknown";

    response.on("close", () => {
      const { statusCode } = response;
      const contentLength = response.get("content-length");
      this.logger.log(
        `${method} ${originalUrl} ${statusCode} ${contentLength} - ${userAgent} ${ip} user=${userId} auth=${maskedAuth}`,
      );
    });
    next();
  }
}
