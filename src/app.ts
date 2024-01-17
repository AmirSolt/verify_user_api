import { join } from 'path';
import AutoLoad, {AutoloadPluginOptions} from '@fastify/autoload';
import { FastifyPluginAsync } from 'fastify';
import Sensible from '@fastify/sensible'
import Env from '@fastify/env'
import fastifyStatic from '@fastify/static'
import Cors from '@fastify/cors'
import path from 'path';
import { Static, Type } from '@sinclair/typebox'


const Envs = Type.Object({
  NODE_ENV: Type.String(),
  DOMAIN: Type.String(),
  TWILIO_ACCOUNT_SID: Type.String(),
  REDIS_URL:Type.String(),
  TWILIO_AUTH_TOKEN: Type.String(),
  TWILIO_PHONE_NUMBER: Type.String(),
  RAPIDAPI_SECRET: Type.String(),
  EMAIL_CF_WORKER_API_KEY: Type.String(),
})
type EnvsType = Static<typeof Envs>


declare module 'fastify' {
  interface FastifyInstance {
    config: EnvsType
  }
}


export type AppOptions = {
  // Place your custom options for app below here.
} & Partial<AutoloadPluginOptions>;

const app: FastifyPluginAsync<AppOptions> = async (
    fastify,
    opts
): Promise<void> => {

  await fastify.register(Env, {
      schema: Envs
  })

  await fastify.register(fastifyStatic, {
    root: path.join(__dirname, 'public'),
  })

  await fastify.register(Sensible)

  await fastify.register(Cors, {
    origin: false
  })


  void fastify.register(AutoLoad, {
    dir: join(__dirname, 'plugins'),
    options: opts
  })

  void fastify.register(AutoLoad, {
    dir: join(__dirname, 'routes'),
    options: opts
  })

};

export default app;
export { app }
