import { Injectable, type NestMiddleware } from "@nestjs/common";
import b from "body-parser";
import type { Request, Response } from "express";

@Injectable()
export class JsonBodyMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: () => any): void {
    b.json()(req, res, next);
  }
}
