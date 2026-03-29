import { Injectable } from "@nestjs/common";
import { slug } from "@repo/lib/slug.js";

@Injectable()
export class AppService {
  getHello(): string {
    console.log(slug("I'm the first import to lib package"));
    return "Hello World!";
  }
}
