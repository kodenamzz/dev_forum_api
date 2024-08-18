import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}
  private readonly logger = new Logger();
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    try {
      await clerkClient.verifyToken(request.cookies.__session, {
        jwtKey: this.configService.get<string>('CLERK_JWT_KEY'),
      });
    } catch (error) {
      this.logger.error(error);
      return false;
    }
    return true;
  }
}
