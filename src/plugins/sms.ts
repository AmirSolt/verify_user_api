import fp from 'fastify-plugin'
import { FastifyPluginAsync, FastifyPluginOptions } from 'fastify';
import TwilioSDK from 'twilio';




declare module 'fastify' {
  export interface FastifyInstance {
    sms : {
      send: (phoneNumber:string, content:string)=>Promise<void>
    }
  }
}


const sms:FastifyPluginAsync<FastifyPluginOptions> = async (fastify, opts)=>{
    const client = new TwilioSDK.Twilio(fastify.config.TWILIO_ACCOUNT_SID, fastify.config.TWILIO_AUTH_TOKEN);

    fastify.decorate("sms", {
        send
    })


    
    async function send(phoneNumber:string, content:string){
        const message = await client.messages.create({
            from: fastify.config.TWILIO_PHONE_NUMBER,
            body: content,
            to: phoneNumber,
        });
        if (message.status === "failed") {
          console.error("==========================")
          console.error("***SMS ERROR***")
          console.error(`ERROR CODE: ${message.errorCode} ERROR MESSAGE: ${message.errorMessage}`)
          console.error("==========================")
          if(message.errorCode===21401){
            throw fastify.httpErrors.unprocessableEntity(message.errorMessage)
          }else{
            throw fastify.httpErrors.internalServerError("Program failed to send the SMS. Ask for support to resolve this issue.")
          }
        } 
    }
}

export default fp(sms, {
  name: 'sms'
})