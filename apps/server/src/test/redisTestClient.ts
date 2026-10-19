import Redis from "ioredis";

const REDIS_TEST_HOST = process.env.REDIS_TEST_HOST ?? "localhost";
const REDIS_TEST_PORT = Number(process.env.REDIS_TEST_PORT ?? 6380);

export function createTestRedis(): Redis {
  return new Redis({
    host: REDIS_TEST_HOST,
    port: REDIS_TEST_PORT,
    lazyConnect: true,
  });
}

export async function isRedisAvailable(): Promise<boolean> {
  const redis = new Redis({
    host: REDIS_TEST_HOST,
    port: REDIS_TEST_PORT,
    connectTimeout: 1000,
    maxRetriesPerRequest: 0,
    retryStrategy: () => null,
  });

  try {
    await redis.ping();
    return true;
  } catch {
    return false;
  } finally {
    redis.disconnect();
  }
}
