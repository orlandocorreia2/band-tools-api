import { Injectable, NestMiddleware, Next, Req, Res } from '@nestjs/common';

@Injectable()
export class TrimStringsMiddleware implements NestMiddleware {
  use(@Req() req: any, @Res() _: any, @Next() next: any) {
    this.trimStringProperties(req.body);
    this.trimStringProperties(req.query);
    this.trimStringProperties(req.params);
    next();
  }

  private trimStringProperties(obj: any): void {
    if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
      Object.keys(obj).forEach((key) => {
        if (typeof obj[key] === 'string') {
          obj[key] = obj[key].trim();
        } else if (typeof obj[key] === 'object') {
          this.trimStringProperties(obj[key]);
        }
      });
    }
    if (Array.isArray(obj)) {
      obj.forEach((item) => this.trimStringProperties(item));
    }
  }
}
