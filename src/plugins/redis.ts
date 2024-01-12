import fp from 'fastify-plugin'
import { FastifyPluginAsync, FastifyPluginOptions } from 'fastify';
import Redis from 'ioredis';



declare module 'fastify' {
  export interface FastifyInstance {
    redis : Redis
  }
}

const redis:FastifyPluginAsync<FastifyPluginOptions> = async (fastify, opts)=>{
    const client = new Redis(fastify.config.REDIS_URL);
    fastify.decorate("redis", client)
}

export default fp(redis, {
  name: 'redis'
})