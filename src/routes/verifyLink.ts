import { FastifyPluginAsync } from 'fastify'





interface IParams {
  verificationId: string
}

interface IReply {
  200: { success: boolean };
  302: { url: string };
  '4xx': { error: string };
  '5xx': { error: string };
}


const sendSMS: FastifyPluginAsync = async (fastify, opts): Promise<void> => {

  fastify.get<{ Params: IParams, Reply: IReply }>(
    '/verifyLink/:verificationId',
    async (request, reply) => {

      const { verificationId } = request.params;

      const verificationToken = await fastify.verificationManager.getVerificationToken(verificationId)

      if (verificationToken == null) {
        return reply.sendFile("verifyLink/fail.html")
      }

      if (verificationToken.webhook_url && !verificationToken.is_read) {
        fetch(verificationToken.webhook_url, {
          method: "POST",
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            id: verificationToken.id,
            user_email: verificationToken.email,
            user_phone_number: verificationToken.to_phone_number,
            webhook_secret_key: verificationToken.webhook_secret_key,
            webhook_extra_json: verificationToken.webhook_extra_json
          })
        })
      }

      if (verificationToken.redirect_url) {
        return reply.redirect(verificationToken.redirect_url)
      }

      fastify.verificationManager.updateReadVerificationToken(verificationToken)

      return reply.sendFile("verifyLink/success.html")

    }
  )
}


export default sendSMS;
