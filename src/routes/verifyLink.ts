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


      fetch(verificationToken.webhook_url, {
          method:"POST",
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            id:verificationToken.id,
            user_email:verificationToken.email,
            user_phone_number:verificationToken.to_phone_number,
            webhook_secret_key:verificationToken.webhook_secret_key
          })
        })
    
    if(verificationToken.success_redirect_url){
      return reply.redirect(verificationToken.success_redirect_url)
    }


    return reply.sendFile("success.html")

    }
  )
}


export default sendSMS;
