import fp from 'fastify-plugin'
import { FastifyPluginAsync, FastifyPluginOptions } from 'fastify';



declare module 'fastify' {
    export interface FastifyInstance {
        email : {
            send: (toEmail:string, toName:string, fromName:string, subject:string, content:string)=>Promise<void>
      }
    }
  }


const email:FastifyPluginAsync<FastifyPluginOptions> = async (fastify, opts)=>{

    fastify.decorate("email", {
        send
    })

    
    async function send(toEmail:string, toName:string, fromName:string, subject:string, content:string){
        const rawResponse = await fetch("https://email-sender.killop1997.workers.dev/", {
          method:"POST",
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            apiKey:fastify.config.EMAIL_CF_WORKER_API_KEY,
            toEmail:toEmail,
            toName:toName,
            fromName:fromName,
            subject:subject,
            contentHTML:content,
          })
        })
        const data = await rawResponse.json();

        if (!rawResponse.ok) {
          console.error("==========================")
          console.error("***EMAIL ERROR***")
          console.error(`ERROR: ${JSON.stringify(data)}`)
          console.error("==========================")
          throw fastify.httpErrors.internalServerError("Program failed to send the email. Make sure the request variables are correct and the email exists. You can also ask for support to resolve this issue.")
        } 

    }
}


export default fp(email, {
  name: 'email'
})