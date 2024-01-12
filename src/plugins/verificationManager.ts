import fp from 'fastify-plugin'
import { FastifyPluginAsync, FastifyPluginOptions } from 'fastify';
import {v4 as uuidv4} from 'uuid';  

interface VerificationToken{
    id:string
    phoneNumber:string|null
    email:string|null
    verifLink:string
}


declare module 'fastify' {
    export interface FastifyInstance {
        verificationManager : {
            saveVerificationToken: (phoneNumber:string|null, email:string|null)=>Promise<VerificationToken>
            fetchVerificationToken: (id:string)=>Promise<VerificationToken|null>
      }
    }
  }


const verificationManager:FastifyPluginAsync<FastifyPluginOptions> = async (fastify, opts)=>{

    fastify.decorate("verificationManager", {
        saveVerificationToken,
        fetchVerificationToken
    })


    async function saveVerificationToken(phoneNumber:string|null, email:string|null){
      const randomId = uuidv4()
      const verificationToken:VerificationToken = {
          id:randomId,
          phoneNumber:phoneNumber,
          email:email,
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