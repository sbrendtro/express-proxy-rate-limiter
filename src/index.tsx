import express from "express";
import rateLimit from "express-rate-limit";
import proxy from "express-http-proxy";
import RedisStore from "rate-limit-redis";
import { createClient } from "redis";
import config from 'config';

const redisConfig = config.get('redis');
const limiterConfig = config.get('limiter');
const proxyConfig = config.get('proxy');

const verbs = process.env.RATELIMITER_VERBS ? JSON.parse(process.env.RATELIMITER_VERBS) : proxyConfig.verbs;


(async () => {
    // Express app
    const app = express()

    // Create a `node-redis` client
    const client = createClient({
        // Apply our local config
        ...redisConfig,
        url: process.env.RATELIMITER_REDIS_URL ?? redisConfig.url
        // ... (see https://github.com/redis/node-redis/blob/master/docs/client-configuration.md)
    });

    // Then connect to the Redis server
    await client.connect();

    // Create and use the rate limiter
    const limiter = rateLimit({
        // Apply our local config
        ...limiterConfig,

        // Allow overrides with env vars
        windowMs: process.env.RATELIMITER_WINDOW_MS ?? limiterConfig.windowMs,
        max: process.env.RATELIMITER_MAX ?? limiterConfig.max,

        // Redis store configuration
        store: new RedisStore({
        sendCommand: (...args: string[]) => client.sendCommand(args),
        }),
    });
    app.use(limiter);

    // Set up the proxy backend
    app.use('/', proxy(process.env.RATELIMITER_BACKEND_URL ?? proxyConfig.backendUrl, {
        ...proxyConfig.options,
        filter: function(req, res) {
            return verbs.includes(req.method);
        }
    }))

    app.listen(process.env.RATELIMITER_FRONTEND_PORT ?? proxyConfig.frontendPort)
})();
