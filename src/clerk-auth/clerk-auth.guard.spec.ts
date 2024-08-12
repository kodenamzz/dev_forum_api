import { ConfigService } from '@nestjs/config';
import { ClerkAuthGuard } from './clerk-auth.guard';

describe('ClerkAuthGuard', () => {
  let config: ConfigService;
  it('should be defined', () => {
    expect(new ClerkAuthGuard(config)).toBeDefined();
  });
});
