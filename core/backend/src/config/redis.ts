import Redis from 'ioredis';
import { logger } from '../utils/logger';

interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
  keyPrefix?: string;
  retryStrategy?: (times: number) => number | void;
  maxRetriesPerRequest?: number;
  enableReadyCheck?: boolean;
  showFriendlyErrorStack?: boolean;
}

class RedisService {
  private static instance: RedisService;
  private client: Redis;
  private subscriber: Redis;
  private publisher: Redis;

  private constructor() {
    const config: RedisConfig = {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0'),
      keyPrefix: process.env.REDIS_KEY_PREFIX || 'workflow:',
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      showFriendlyErrorStack: process.env.NODE_ENV !== 'production',
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
      }
    };

    // Create Redis clients
    this.client = new Redis(config);
    this.subscriber = new Redis(config);
    this.publisher = new Redis(config);

    // Set up error handling
    this.setupErrorHandling(this.client, 'Main');
    this.setupErrorHandling(this.subscriber, 'Subscriber');
    this.setupErrorHandling(this.publisher, 'Publisher');

    // Set up connection handling
    this.setupConnectionHandling();
  }

  private setupErrorHandling(client: Redis, name: string) {
    client.on('error', (error) => {
      logger.error(`Redis ${name} Error:`, error);
    });

    client.on('warning', (warning) => {
      logger.warn(`Redis ${name} Warning:`, warning);
    });
  }

  private setupConnectionHandling() {
    this.client.on('connect', () => {
      logger.info('Redis client connected');
    });

    this.client.on('ready', () => {
      logger.info('Redis client ready');
    });

    this.client.on('close', () => {
      logger.warn('Redis connection closed');
    });

    this.client.on('reconnecting', () => {
      logger.info('Redis client reconnecting');
    });
  }

  public static getInstance(): RedisService {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService();
    }
    return RedisService.instance;
  }

  /**
   * Get the Redis client
   */
  public getClient(): Redis {
    return this.client;
  }

  /**
   * Get the Redis subscriber client
   */
  public getSubscriber(): Redis {
    return this.subscriber;
  }

  /**
   * Get the Redis publisher client
   */
  public getPublisher(): Redis {
    return this.publisher;
  }

  /**
   * Cache management methods
   */

  async set(key: string, value: any, expireSeconds?: number): Promise<'OK'> {
    const serializedValue = JSON.stringify(value);
    if (expireSeconds) {
      return this.client.set(key, serializedValue, 'EX', expireSeconds);
    }
    return this.client.set(key, serializedValue);
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.client.get(key);
    if (!value) return null;
    return JSON.parse(value) as T;
  }

  async del(key: string): Promise<number> {
    return this.client.del(key);
  }

  async exists(key: string): Promise<number> {
    return this.client.exists(key);
  }

  async expire(key: string, seconds: number): Promise<number> {
    return this.client.expire(key, seconds);
  }

  /**
   * Lock management methods
   */

  async acquireLock(lockKey: string, ttlSeconds: number): Promise<string | null> {
    const token = Math.random().toString(36).substring(2);
    const acquired = await this.client.set(
      `lock:${lockKey}`,
      token,
      'NX',
      'EX',
      ttlSeconds
    );
    return acquired ? token : null;
  }

  async releaseLock(lockKey: string, token: string): Promise<boolean> {
    const script = `
      if redis.call("get", KEYS[1]) == ARGV[1] then
        return redis.call("del", KEYS[1])
      else
        return 0
      end
    `;
    const result = await this.client.eval(
      script,
      1,
      `lock:${lockKey}`,
      token
    );
    return result === 1;
  }

  /**
   * Pub/Sub methods
   */

  async publish(channel: string, message: any): Promise<number> {
    const serializedMessage = JSON.stringify(message);
    return this.publisher.publish(channel, serializedMessage);
  }

  async subscribe(channel: string, callback: (message: any) => void): Promise<void> {
    await this.subscriber.subscribe(channel);
    this.subscriber.on('message', (chan, message) => {
      if (chan === channel) {
        try {
          const parsedMessage = JSON.parse(message);
          callback(parsedMessage);
        } catch (error) {
          logger.error('Error parsing Redis message:', error);
        }
      }
    });
  }

  async unsubscribe(channel: string): Promise<void> {
    await this.subscriber.unsubscribe(channel);
  }

  /**
   * Rate limiting methods
   */

  async incrementCounter(key: string, windowSeconds: number): Promise<number> {
    const multi = this.client.multi();
    multi.incr(key);
    multi.expire(key, windowSeconds);
    const results = await multi.exec();
    return results ? (results[0][1] as number) : 0;
  }

  /**
   * Cleanup method
   */
  async cleanup(): Promise<void> {
    await this.client.quit();
    await this.subscriber.quit();
    await this.publisher.quit();
  }
}

// Export singleton instance
export const redisClient = RedisService.getInstance().getClient();
export const redisSubscriber = RedisService.getInstance().getSubscriber();
export const redisPublisher = RedisService.getInstance().getPublisher();
export const redisService = RedisService.getInstance();
