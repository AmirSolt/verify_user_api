import fp from 'fastify-plugin'
import { FastifyPluginAsync, FastifyPluginOptions } from 'fastify';
import { isURL } from '../lib/helper';


const email:FastifyPluginAsync<FastifyPluginOptions> = async (fastify, opts)=>{

    fastify.decorate("email", {
        getContent,
        send
    })


    function getContent(verifyCode:string, appName:string):string{
        if(isURL(verifyCode)){
            throw fastify.httpErrors.badRequest(`verifyCode is invalid. verifyCode:${verifyCode}`)
        }
        if(appName && isURL(appName)){
          throw fastify.httpErrors.badRequest(`appName is invalid. appName:${appName}`)
        }
        return emailHTMLTemplate + `${appName}: ${verifyCode}`
    }

    
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
            contentText:content,
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


const emailHTMLTemplate = `
<div class=""><div class="aHl"></div><div id=":pa" tabindex="-1"></div><div id=":p0" class="ii gt" jslog="20277; u014N:xr6bB; 1:WyIjdGhyZWFkLWY6MTc4NjQ3MzM5NTQ2Nzk1Mjc1MCJd; 4:WyIjbXNnLWY6MTc4NjQ3MzM5NTQ2Nzk1Mjc1MCJd"><div id=":oz" class="a3s aiL "><u></u>
<div style="margin:0;padding:0">
<table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse">
    <tbody><tr>
        <td style="padding:20px;font-size:16px;font-family:Avenir,Helvetica,Arial,sans-serif;color:#252525">Hi,</td>
    </tr>
    <tr>
        <td style="text-align:center">
            <img border="0" alt="logo" src="https://ci3.googleusercontent.com/meips/ADKq_NaGnn-W8LtRhCgU-5eL1uglsmZGyBxQRSOJHOWn74hheSI4XLwAj2KdU1ELhcpchrZO4ZEnKjjTtVM39oahiHuRp7oUR5Q8MkpeBLnUsejkT0WbLTS4xQoKcmWV6aDTbfxO0lxTsNXGZNKMn2UaJw=s0-d-e1-ft#https://s3.amazonaws.com/src.tplinkcloud.com/accounts/new_vi/mail/resources/kasa-icon.png" style="width:64px;height:64px;outline:none;text-decoration:none;border:none" class="CToWUd" data-bit="iit" jslog="138226; u014N:xr6bB; 53:WzAsMl0.">
        </td>
    </tr>
    <tr>
        <td style="padding:30px;font-size:16px;font-family:Avenir,Helvetica,Arial,sans-serif;line-height:19px;color:#252525;text-align:center">Your Kasa account verification code is:</td>
    </tr>
    <tr>
        <td style="padding:30px;font-size:50px;letter-spacing:0.3em;font-family:Avenir,Helvetica,Arial,sans-serif;color:#252525;text-align:center">947397</td>
    </tr>
    <tr>
        <td style="padding:30px;font-size:16px;font-family:Avenir,Helvetica,Arial,sans-serif;line-height:19px;color:#252525;text-align:center">
            This code will expire in 10 minutes. Don’t share the code with anyone.
            <br><br>
            If it wasn’t you who request the code, someone may be trying to access your account. You can change your password to secure your account.
        </td>
    </tr>
</tbody></table><div class="yj6qo"></div><div class="adL">
</div></div><div class="adL">
</div></div></div><div class="hi"></div><div class="WhmR8e" data-hash="0"></div></div>

`

export default fp(email, {
  name: 'email'
})