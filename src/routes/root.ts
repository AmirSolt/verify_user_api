import { FastifyPluginAsync } from 'fastify'
import { client } from '../lib/twilio'
import { VerifReq, VerifReqType } from '../lib/validator';


interface IReply {
  200: {success:boolean};
  302: { url: string };
  '4xx': { error: string };
  '5xx': { error: string };
}


const root: FastifyPluginAsync = async (fastify, opts): Promise<void> => {

  fastify.post<{ Body:VerifReqType, Reply:IReply }>(
    '/',
    {
      schema: {
        body: VerifReq,
      },
    },
    async  (request, reply) => {

      const {phoneNumber, verifyCode, appName} = request.body
  
      try{
        await client.messages.create({
          from: process.env.TWILIO_PHONE_NUMBER,
          body: `App name: ${appName} Code: ${verifyCode}`,
          to: phoneNumber,
      });
    }catch(err){
      reply.status(500).send({ error:err });
  }

      reply.status(200).send({ success:true });
    }
  )
}


export default root;
