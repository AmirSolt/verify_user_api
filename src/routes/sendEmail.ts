import { FastifyPluginAsync } from 'fastify'
import { Static, Type } from '@sinclair/typebox'


const Headers = Type.Object({
  'x-rapidapi-proxy-secret': Type.String()
})

const Body = Type.Object({
    toEmail: Type.String({
        maxLength:60,
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


const sendEmail: FastifyPluginAsync = async (fastify, opts): Promise<void> => {

  fastify.post<{ Headers:HeadersType, Body:BodyType, Reply:IReply }>(
    '/send-email-code',
    {
      schema: {
        headers: Headers,
        body: Body,
      },
    },
    async  (request, reply) => {


      const rapidapiHeader = request.headers['x-rapidapi-proxy-secret']
      fastify.rapidapi.verifySecret(rapidapiHeader)


      const {toEmail, verifyCode, appName} = request.body
      const content = fastify.email.getContent(verifyCode, appName)
      await fastify.email.send(toEmail, "User", `${appName} - verification service`, `${appName} Account Verification Code`, content)


      reply.status(200).send({ success:true });
    }
  )
}


export default sendEmail;
