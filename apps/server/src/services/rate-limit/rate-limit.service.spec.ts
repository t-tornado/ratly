import { Test, TestingModule } from '@nestjs/testing';
import { RateLimitService } from './rate-limit.service.js';
import { RedisService } from '../../lib/infra/redis/redis.service.js';

const mockRedisService = { eval: vi.fn(), get: vi.fn(), set: vi.fn() };

describe('RateLimitService', () => {
  let service: RateLimitService;

  beforeEach(async () => {
    vi.clearAllMocks();

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

  it('calls eval exactly once when readAllRows is invoked with 3 seeded users', async () => {
    const now = Date.now();

    // Flat layout: [now, uid, count, bonus, pausedCount, limit, windowTtl, pauseTtl, lastSeen, ...]
    const mockFlat = [
      now,
      'user-1', 5, 0, 0, 100, 3000, -2, now - 1000,
      'user-2', 10, 2, 1, 100, 2000, -2, now - 2000,
      'user-3', 0, 0, 0, 100, -2, -2, now - 3000,
    ];

    mockRedisService.eval.mockResolvedValue(mockFlat);

    const rows = await service.readAllRows();

    expect(mockRedisService.eval).toHaveBeenCalledTimes(1);
    expect(rows).toHaveLength(3);
  });
});
