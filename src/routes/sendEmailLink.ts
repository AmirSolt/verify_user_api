import { FastifyPluginAsync } from 'fastify'
import { Static, Type } from '@sinclair/typebox'


const Headers = Type.Object({
  'x-rapidapi-proxy-secret': Type.String()
})

const Params = Type.Object({
    to_email: Type.String({
        maxLength:60,
    }),
    app_name: Type.String({
      maxLength:60
    }),
    webhook_url: Type.Optional(Type.String()),
    webhook_secret_key: Type.Optional(Type.String()),
    redirect_url: Type.Optional(Type.String()),
    webhook_extra_json:Type.Optional(Type.Any())
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
    '/send-email-link',
    {
      schema: {
        headers: Headers,
        params: Params,
      },
    },
    async  (request, reply) => {


      const rapidapiHeader = request.headers['x-rapidapi-proxy-secret']
      fastify.rapidapi.verifySecret(rapidapiHeader)


      const {to_email, app_name, webhook_url, webhook_secret_key, redirect_url, webhook_extra_json} = request.params
      const verifToken = await fastify.verificationManager.saveVerificationToken(null, to_email, webhook_url, webhook_secret_key, redirect_url, webhook_extra_json)
      const content = fastify.contentManager.getEmailLinkContent(verifToken.verifLink, app_name)
      await fastify.email.send(to_email, "User", `${app_name} - verification service`, `${app_name} Account Verification Link`, content)


      reply.status(200).send({ success:true });
    }
  )
}


export default sendEmail;
