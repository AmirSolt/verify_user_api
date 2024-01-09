import { join } from 'path';
import AutoLoad, {AutoloadPluginOptions} from '@fastify/autoload';
import { FastifyPluginAsync } from 'fastify';
import Sensible from '@fastify/sensible'
import Env from '@fastify/env'
import Cors from '@fastify/cors'
import { Type } from '@sinclair/typebox'


export type AppOptions = {
  // Place your custom options for app below here.
} & Partial<AutoloadPluginOptions>;

const app: FastifyPluginAsync<AppOptions> = async (
    fastify,
    opts
): Promise<void> => {

  await fastify.register(Env, {
      schema: Type.Object({
        NODE_ENV: Type.String(),
        TWILIO_ACCOUNT_SID: Type.String(),
        TWILIO_AUTH_TOKEN: Type.String(),
        TWILIO_PHONE_NUMBER: Type.String(),
        RAPIDAPI_SECRET: Type.String(),
        EMAIL_CF_WORKER_API_KEY: Type.String(),
    })
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
