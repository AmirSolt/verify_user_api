import fp from 'fastify-plugin'
import { FastifyPluginAsync, FastifyPluginOptions } from 'fastify';


declare module 'fastify' {
    export interface FastifyInstance {
        rapidapi : {
            verifySecret: (headersRapidapiSecret:string)=>Promise<void>
      }
    }
  }
  


const rapidapi:FastifyPluginAsync<FastifyPluginOptions> = async (fastify, opts)=>{

    fastify.decorate("rapidapi", {
        verifySecret
    })

    
    async function verifySecret(headersRapidapiSecret:string){
        if(fastify.config.RAPIDAPI_SECRET !== headersRapidapiSecret){
            throw fastify.httpErrors.unauthorized(`Request headers x-rapidapi-proxy-secret is invalid.`)
        }
    }
}



export default fp(rapidapi, {
  name: 'rapidapi'
})