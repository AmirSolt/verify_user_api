import { FastifyPluginAsync } from 'fastify'
import { Static, Type } from '@sinclair/typebox'


const Headers = Type.Object({
  'x-rapidapi-proxy-secret': Type.String()
})

const Body = Type.Object({
    phoneNumber: Type.String({
        maxLength:20,
    }),
    verifyCode: Type.String({
      maxLength:12
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
    '/send-sms-code',
    {
      schema: {
        headers: Headers,
        body: Body,
      },
    },
    async  (request, reply) => {


      const rapidapiHeader = request.headers['x-rapidapi-proxy-secret']
      fastify.rapidapi.verifySecret(rapidapiHeader)


      const {phoneNumber, verifyCode, appName} = request.body
      const content = fastify.sms.getContent(verifyCode, appName)
      await fastify.sms.send(phoneNumber, content)


      reply.status(200).send({ success:true });
    }
  )
}


export default sendSMS;
