import { FastifyPluginAsync } from 'fastify'
import { client } from '../lib/twilio'
import { VerifReq, VerifReqType } from '../lib/validator';

interface IHeaders{
  'x-rapidapi-proxy-secret':string|undefined;
}

interface IReply {
  200: {success:boolean};
  302: { url: string };
  '4xx': { error: string };
  '5xx': { error: string };
}


const root: FastifyPluginAsync = async (fastify, opts): Promise<void> => {

  fastify.post<{ Headers:IHeaders, Body:VerifReqType, Reply:IReply }>(
    '/',
    {
      schema: {
        body: VerifReq,
      },
    },
    async  (request, reply) => {

      const rapidapiHeader = request.headers['x-rapidapi-proxy-secret']
      if(rapidapiHeader==null || process.env.RAPIDAPI_SECRET !== rapidapiHeader){
        reply.status(400).send({error:`Request headers x-rapidapi-proxy-secret is invalid.`})
        return
      }


      const {phoneNumber, verifyCode, appName} = request.body
  
      try{
        await client.messages.create({
          from: process.env.TWILIO_PHONE_NUMBER,
          body: `App name: ${appName} Code: ${verifyCode}`,
          to: phoneNumber,
      });
    }catch(e){
      if (e instanceof Error) {
        console.error(`ERROR NAME: ${e.name}  ERROR MESSAGE: ${e.message}`)
        reply.status(500).send({ error:e.message  });

      } 
  }

      reply.status(200).send({ success:true });
    }
  )
}


export default root;
