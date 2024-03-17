import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import * as uuidValidate from 'uuid-validate';
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class CheckUuidGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const req = ctx.switchToHttp().getRequest();
    for (let param in req.params) {
        if (!uuidValidate(req.params[param])) {
            throw new BadRequestException(`Invalid id '${param}'`);
        }
    }
    
    return true
  }
}