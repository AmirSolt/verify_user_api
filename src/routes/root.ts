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

      if(isURL(verifyCode)){
        reply.status(400).send({ error:`verifyCode is invalid. verifyCode:${verifyCode}`  });
          return
      }
      if(appName && isURL(appName)){
        reply.status(400).send({error:`appName is invalid. appName:${appName}` });
          return
      }
      
      const message = await client.messages.create({
          from: process.env.TWILIO_PHONE_NUMBER,
          body: `${appName? appName+": ": ""}${verifyCode} is your security code. Do not share it with anyone.`,
          to: phoneNumber,
      });
      if (message.status === "failed") {
        console.error("==========================")
        console.error(`ERROR CODE: ${message.errorCode} ERROR MESSAGE: ${message.errorMessage}`)
        console.error("==========================")
        if(message.errorCode===21401){
          reply.status(400).send({ error:message.errorMessage });
          return
        }else{
          reply.status(500).send({ error:"An Error has occurred. Please let us know."  });
          return
        }
      } 

      reply.status(200).send({ success:true });
    }
  )
}


function isURL(url:string){
  try {
    new URL(url);
  } catch (_) {
    return false;  
  }
  return true
}

export default root;
