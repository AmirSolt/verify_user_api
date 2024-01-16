import fp from 'fastify-plugin'
import { FastifyPluginAsync, FastifyPluginOptions } from 'fastify';
import {randomUUID} from 'crypto';  

interface VerificationToken{
    id:string
    to_phone_number:string|null
    email:string|null
    verifLink:string
    webhook_url: string|undefined
    webhook_secret_key: string|undefined
    redirect_url: string|undefined
    webhook_extra_json:any|undefined
}


declare module 'fastify' {
    export interface FastifyInstance {
        verificationManager : {
            saveVerificationToken: (to_phone_number:string|null, email:string|null, webhook_url:string|undefined, webhook_secret_key:string|undefined, redirect_url:string|undefined, webhook_extra_json:any|undefined)=>Promise<VerificationToken>
            fetchVerificationToken: (id:string)=>Promise<VerificationToken|null>
      }
    }
  }


const verificationManager:FastifyPluginAsync<FastifyPluginOptions> = async (fastify, opts)=>{

    fastify.decorate("verificationManager", {
        saveVerificationToken,
        fetchVerificationToken
    })


    async function saveVerificationToken(to_phone_number:string|null, email:string|null, webhook_url:string|undefined, webhook_secret_key:string|undefined, redirect_url:string|undefined, webhook_extra_json:any|undefined){
      if(webhook_url==null && redirect_url==null){
        throw fastify.httpErrors.unprocessableEntity("Either webhook_url or redirect_url must exist.")
      }
      
      const randomId = randomUUID()
      const verificationToken:VerificationToken = {
          id:randomId,
          to_phone_number:to_phone_number,
          email:email,
          webhook_url:webhook_url,
          webhook_secret_key:webhook_secret_key,
          redirect_url:redirect_url,
          verifLink:`${fastify.config.DOMAIN}/verifyLink/${encodeURIComponent(randomId)}`,
          webhook_extra_json,
      }
      await fastify.redis.set(verificationToken.id, JSON.stringify(verificationToken), "EX", 60*15) 
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