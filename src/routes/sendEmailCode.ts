import { FastifyPluginAsync } from 'fastify'
import { Static, Type } from '@sinclair/typebox'


const Headers = Type.Object({
  'x-rapidapi-proxy-secret': Type.String()
})

const Params = Type.Object({
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

type HeadersType = Static<typeof Headers>
type ParamsType = Static<typeof Params>


interface IReply {
  200: {success:boolean};
  302: { url: string };
  '4xx': { error: string };
  '5xx': { error: string };
}


const sendEmail: FastifyPluginAsync = async (fastify, opts): Promise<void> => {

  fastify.post<{ Headers:HeadersType, Params:ParamsType, Reply:IReply }>(
    '/send-email-code',
    {
      schema: {
        headers: Headers,
        params: Params,
      },
    },
    async  (request, reply) => {


      const rapidapiHeader = request.headers['x-rapidapi-proxy-secret']
      fastify.rapidapi.verifySecret(rapidapiHeader)


      const {to_email, verify_code, app_name} = request.params
      const content = fastify.contentManager.getEmailCodeContent(verify_code, app_name)
      await fastify.email.send(to_email, "User", `${app_name} - verification service`, `${app_name} Account Verification Code`, content)


      reply.status(200).send({ success:true });
    }
  )
}


export default sendEmail;
