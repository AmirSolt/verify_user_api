import fp from 'fastify-plugin'
import { FastifyPluginAsync, FastifyPluginOptions } from 'fastify';
import { isURL } from '../lib/helper';



declare module 'fastify' {
    export interface FastifyInstance {
        contentManager : {
            getEmailCodeContent: (verifyCode:string, appName:string)=>string
            getEmailLinkContent: (verifLink:string, appName:string)=>string
            getSMSCodeContent: (verifyCode:string, appName:string)=>string
            getSMSLinkContent: (verifLink:string, appName:string)=>string
      }
    }
  }


const contentManager:FastifyPluginAsync<FastifyPluginOptions> = async (fastify, opts)=>{

    fastify.decorate("contentManager", {
        getEmailCodeContent,
        getEmailLinkContent,
        getSMSCodeContent,
        getSMSLinkContent,
    })


    function getEmailCodeContent(verifyCode:string, appName:string):string{
        if(isURL(verifyCode)){
            throw fastify.httpErrors.badRequest(`verifyCode is invalid. verifyCode:${verifyCode}`)
        }
        if(appName && isURL(appName)){
          throw fastify.httpErrors.badRequest(`appName is invalid. appName:${appName}`)
        }
        return emailHTMLTemplate(verifyCode, appName)
    }

    function getSMSCodeContent(verifyCode:string, appName:string):string{
        if(isURL(verifyCode)){
            throw fastify.httpErrors.badRequest(`verifyCode is invalid. verifyCode:${verifyCode}`)
        }
        if(appName && isURL(appName)){
          throw fastify.httpErrors.badRequest(`appName is invalid. appName:${appName}`)
        }
        return `${appName}: ${verifyCode} is your security code. Do not share it with anyone.`
   }
   
   function getSMSLinkContent(verifLink:string, appName:string):string{
      return ""
   }
   function getEmailLinkContent(verifLink:string, appName:string):string{
      return ""
   }

}


const emailHTMLTemplate = (verifyCode:string, appName:string)=>`
<div class="">
    <div class="aHl"></div>
    <div id=":pa" tabindex="-1"></div>
    <div id=":p0" class="ii gt" jslog="20277; u014N:xr6bB; 1:WyIjdGhyZWFkLWY6MTc4NjQ3MzM5NTQ2Nzk1Mjc1MCJd; 4:WyIjbXNnLWY6MTc4NjQ3MzM5NTQ2Nzk1Mjc1MCJd">
       <div id=":oz" class="a3s aiL ">
          <u></u>
          <div style="margin:0;padding:0">
             <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse">
                <tbody>
                   <tr>
                      <td style="padding:20px;font-size:16px;font-family:Avenir,Helvetica,Arial,sans-serif;color:#252525">Hi,</td>
                   </tr>
                   <tr>
                      <td style="padding:30px;font-size:16px;font-family:Avenir,Helvetica,Arial,sans-serif;line-height:19px;color:#252525;text-align:center">Your ${appName} account verification code is:</td>
                   </tr>
                   <tr>
                      <td style="padding:30px;font-size:50px;letter-spacing:0.3em;font-family:Avenir,Helvetica,Arial,sans-serif;color:#252525;text-align:center">${verifyCode}</td>
                   </tr>
                   <tr>
                      <td style="padding:30px;font-size:16px;font-family:Avenir,Helvetica,Arial,sans-serif;line-height:19px;color:#252525;text-align:center">
                         Don’t share the code with anyone.
                         <br><br>
                         If it wasn’t you who request the code, someone may be trying to access your account. You can change your password to secure your account.
                      </td>
                   </tr>
                </tbody>
             </table>
             <div class="yj6qo"></div>
             <div class="adL">
             </div>
          </div>
          <div class="adL">
          </div>
       </div>
    </div>
    <div class="hi"></div>
    <div class="WhmR8e" data-hash="0"></div>
 </div>
`

export default fp(contentManager, {
  name: 'contentManager'
})