import { FastifyPluginAsync } from 'fastify'





interface IParams{
  verificationId:string
}

interface IReply {
  200: {success:boolean};
  302: { url: string };
  '4xx': { error: string };
  '5xx': { error: string };
}


const sendSMS: FastifyPluginAsync = async (fastify, opts): Promise<void> => {

  fastify.get<{ Params:IParams, Reply:IReply }>(
    '/verifyLink/:verificationId',
    async  (request, reply) => {

    const { verificationId } = request.params;

    const verificationToken = await fastify.verificationManager.fetchVerificationToken(verificationId)

      if(verificationToken==null){
        return reply.sendFile("fail.html")
      }

    // send webhook


    return reply.sendFile("success.html")

    }
  )
}


export default sendSMS;
