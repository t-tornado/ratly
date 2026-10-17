import { Test, TestingModule } from '@nestjs/testing';
import { RateLimitService } from './rate-limit.service.js';
import { RedisService } from '../../lib/infra/redis/redis.service.js';

const mockRedisService = { eval: vi.fn(), get: vi.fn(), set: vi.fn() };

describe('RateLimitService', () => {
  let service: RateLimitService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RateLimitService,
        { provide: RedisService, useValue: mockRedisService },
      ],
    }).compile();

    service = module.get<RateLimitService>(RateLimitService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
