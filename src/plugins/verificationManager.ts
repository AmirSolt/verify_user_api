import fp from 'fastify-plugin'
import { FastifyPluginAsync, FastifyPluginOptions } from 'fastify';
import {randomUUID} from 'crypto';  

interface VerificationToken{
    id:string
    to_phone_number:string|null
    email:string|null
    verifLink:string
    webhook_url: string
    webhook_secret_key: string
    success_redirect_url: string|null
}


declare module 'fastify' {
    export interface FastifyInstance {
        verificationManager : {
            saveVerificationToken: (to_phone_number:string|null, email:string|null, webhook_url:string, webhook_secret_key:string, success_redirect_url:string|null)=>Promise<VerificationToken>
            fetchVerificationToken: (id:string)=>Promise<VerificationToken|null>
      }
    }
  }


const verificationManager:FastifyPluginAsync<FastifyPluginOptions> = async (fastify, opts)=>{

    fastify.decorate("verificationManager", {
        saveVerificationToken,
        fetchVerificationToken
    })


    async function saveVerificationToken(to_phone_number:string|null, email:string|null, webhook_url:string, webhook_secret_key:string, success_redirect_url:string|null){
      const randomId = randomUUID()
      const verificationToken:VerificationToken = {
          id:randomId,
          to_phone_number:to_phone_number,
          email:email,
          webhook_url:webhook_url,
          webhook_secret_key:webhook_secret_key,
          success_redirect_url:success_redirect_url,
          verifLink:`${fastify.config.DOMAIN}/verifyLink/${randomId}`,
      }
      await fastify.redis.set(verificationToken.id, JSON.stringify(verificationToken)) 
      return verificationToken
    }

    async function fetchVerificationToken(id:string){
      const res = await fastify.redis.get(id)
      if(res==null){
          return null
      }
      return JSON.parse(res)
    }
}


export default fp(verificationManager, {
  name: 'verificationManager',
  dependencies:["redis"]
})