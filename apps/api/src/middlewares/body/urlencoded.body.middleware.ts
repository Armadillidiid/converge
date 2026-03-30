import { Injectable, type NestMiddleware } from "@nestjs/common";
import b from "body-parser";
import type { Request, Response } from "express";

@Injectable()
export class UrlencodedBodyMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: () => any): void {
    b.urlencoded({ extended: true })(req, res, next);
  }
}
