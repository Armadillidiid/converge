import { Injectable, type NestMiddleware } from "@nestjs/common";
import b from "body-parser";
import type { Request, Response } from "express";

@Injectable()
export class RawBodyMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: () => any): void {
    b.raw({ type: "*/*" })(req, res, next);
  }
}
