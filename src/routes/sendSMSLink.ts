import { FastifyPluginAsync } from 'fastify'
import { Static, Type } from '@sinclair/typebox'
import { Value } from '@sinclair/typebox/value'


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
    webhook_url: Type.Optional(Type.String()),
    webhook_secret_key: Type.Optional(Type.String()),
    redirect_url: Type.Optional(Type.String()),
    webhook_extra_json:Type.Optional(Type.Any())
})

const Reply = Type.Object({
  200: Type.Object({
    success:Type.Boolean()
  }),
  302: Type.Object({
    url:Type.String()
  }),
  '4xx': Type.Object({
    error:Type.String()
  }),
  '5xx': Type.Object({
    error:Type.String()
  }),
})

type HeadersType = Static<typeof Headers>
type BodyType = Static<typeof Body>
type ReplyType = Static<typeof Reply>
const ReplyValue = Value.Create(Reply)


const sendSMS: FastifyPluginAsync = async (fastify, opts): Promise<void> => {

  fastify.post<{ Headers:HeadersType, Body:BodyType, Reply:ReplyType }>(
    '/send-sms-link',
    {
      schema: {
        headers: Headers,
        body: Body,
        response:{
          200:ReplyValue[200],
        }
      },
    },
    async  (request, reply) => {


      const rapidapiHeader = request.headers['x-rapidapi-proxy-secret']
      fastify.rapidapi.verifySecret(rapidapiHeader)


      const {to_phone_number, app_name, webhook_url, webhook_secret_key, redirect_url, webhook_extra_json} = request.body
      const verifToken = await fastify.verificationManager.saveVerificationToken(to_phone_number, null, webhook_url, webhook_secret_key, redirect_url, webhook_extra_json)
      const content = fastify.contentManager.getSMSLinkContent(verifToken.verifLink, app_name)
      await fastify.sms.send(to_phone_number, content)


      reply.status(200).send({ success:true });
    }
  )
}


export default sendSMS;
