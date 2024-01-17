import { FastifyPluginAsync } from 'fastify'
import { Static, Type } from '@sinclair/typebox'
import { Value } from '@sinclair/typebox/value'



const Headers = Type.Object({
  'x-rapidapi-proxy-secret': Type.String()
})

const Body = Type.Object({
    to_email: Type.String({
        maxLength:60,
    }),
    verify_code: Type.String({
      maxLength:12
    }),
    app_name: Type.String({
      maxLength:60
    }),
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



const sendEmail: FastifyPluginAsync = async (fastify, opts): Promise<void> => {

  fastify.post<{ Headers:HeadersType, Body:BodyType, Reply:ReplyType }>(
    '/send-email-code',
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


      const {to_email, verify_code, app_name} = request.body
      const content = fastify.contentManager.getEmailCodeContent(verify_code, app_name)
      await fastify.email.send(to_email, "User", `${app_name} - verification service`, `${app_name} Account Verification Code`, content)


      reply.status(200).send({ success:true });
    }
  )
}


export default sendEmail;
