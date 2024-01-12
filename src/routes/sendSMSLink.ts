import { FastifyPluginAsync } from 'fastify'
import { Static, Type } from '@sinclair/typebox'


const Headers = Type.Object({
  'x-rapidapi-proxy-secret': Type.String()
})

const Body = Type.Object({
    to_phone_number: Type.String({
        maxLength:20,
    }),
    app_name: Type.String({
      maxLength:60
    }),
    webhook_url: Type.String(),
    webhook_secret_key: Type.String(),
    success_redirect_url: Type.Optional(Type.String())
})

type HeadersType = Static<typeof Headers>
type BodyType = Static<typeof Body>


interface IReply {
  200: {success:boolean};
  302: { url: string };
  '4xx': { error: string };
  '5xx': { error: string };
}


const sendSMS: FastifyPluginAsync = async (fastify, opts): Promise<void> => {

  fastify.post<{ Headers:HeadersType, Body:BodyType, Reply:IReply }>(
    '/send-sms-link',
    {
      schema: {
        headers: Headers,
        body: Body,
      },
    },
    async  (request, reply) => {


      const rapidapiHeader = request.headers['x-rapidapi-proxy-secret']
      fastify.rapidapi.verifySecret(rapidapiHeader)


      const {to_phone_number, app_name, webhook_url, webhook_secret_key, success_redirect_url} = request.body
      const verifToken = await fastify.verificationManager.saveVerificationToken(to_phone_number, null, webhook_url, webhook_secret_key, success_redirect_url??null)
      const content = fastify.contentManager.getSMSLinkContent(verifToken.verifLink, app_name)
      await fastify.sms.send(to_phone_number, content)


      reply.status(200).send({ success:true });
    }
  )
}


export default sendSMS;
