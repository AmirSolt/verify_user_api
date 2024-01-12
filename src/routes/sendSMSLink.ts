import { FastifyPluginAsync } from 'fastify'
import { Static, Type } from '@sinclair/typebox'


const Headers = Type.Object({
  'x-rapidapi-proxy-secret': Type.String()
})

const Body = Type.Object({
    phoneNumber: Type.String({
        maxLength:20,
    }),
    appName: Type.String({
      maxLength:60
    }),
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


      const {phoneNumber, appName} = request.body
      const verifToken = await fastify.verificationManager.saveVerificationToken(phoneNumber, null)
      const content = fastify.contentManager.getSMSLinkContent(verifToken.verifLink, appName)
      await fastify.sms.send(phoneNumber, content)


      reply.status(200).send({ success:true });
    }
  )
}


export default sendSMS;
