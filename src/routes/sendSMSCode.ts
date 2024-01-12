import { FastifyPluginAsync } from 'fastify'
import { Static, Type } from '@sinclair/typebox'


const Headers = Type.Object({
  'x-rapidapi-proxy-secret': Type.String()
})

const Body = Type.Object({
    to_phone_number: Type.String({
        maxLength:20,
    }),
    verify_code: Type.String({
      maxLength:12
    }),
    app_name: Type.String({
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


      const {to_phone_number, verify_code, app_name} = request.body
      const content = fastify.contentManager.getSMSCodeContent(verify_code, app_name)
      await fastify.sms.send(to_phone_number, content)


      reply.status(200).send({ success:true });
    }
  )
}


export default sendSMS;
