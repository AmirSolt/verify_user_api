import fp from 'fastify-plugin'
import { FastifyPluginAsync, FastifyPluginOptions } from 'fastify';
import { containsSpecialChars } from '../lib/helper';



declare module 'fastify' {
    export interface FastifyInstance {
        contentManager : {
            getEmailCodeContent: (verify_code:string, app_name:string)=>string
            getEmailLinkContent: (verifLink:string, app_name:string)=>string
            getSMSCodeContent: (verify_code:string, app_name:string)=>string
            getSMSLinkContent: (verifLink:string, app_name:string)=>string
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


    function getEmailCodeContent(verify_code:string, app_name:string):string{
        if(containsSpecialChars(verify_code)){
            throw fastify.httpErrors.badRequest(`verify_code cannot contain special characters. verify_code:${verify_code}`)
        }
        if(app_name && containsSpecialChars(app_name)){
          throw fastify.httpErrors.badRequest(`app_name cannot contain special characters. app_name:${app_name}`)
        }
        return emailHTMLTemplate(verify_code, null, app_name)
    }

    function getSMSCodeContent(verify_code:string, app_name:string):string{
        if(containsSpecialChars(verify_code)){
            throw fastify.httpErrors.badRequest(`verify_code cannot contain special characters. verify_code:${verify_code}`)
        }
        if(app_name && containsSpecialChars(app_name)){
          throw fastify.httpErrors.badRequest(`app_name cannot contain special characters. app_name:${app_name}`)
        }
        return `${app_name}: ${verify_code} is your security code. Do not share it with anyone.`
   }
   
   function getSMSLinkContent(verifLink:string, app_name:string):string{
      if(app_name && containsSpecialChars(app_name)){
         throw fastify.httpErrors.badRequest(`app_name cannot contain special characters. app_name:${app_name}`)
       }
       return `${app_name}: To verify your phone number click the link below. If you were not expecting this verification, please ignore.\n ${verifLink}`
   }
   function getEmailLinkContent(verifLink:string, app_name:string):string{
      if(app_name && containsSpecialChars(app_name)){
         throw fastify.httpErrors.badRequest(`app_name cannot contain special characters. app_name:${app_name}`)
       }
      return emailHTMLTemplate(null, verifLink, app_name)

   }

}


const emailHTMLTemplate = (verify_code:string|null, verify_link:string|null, app_name:string)=>{
   
   const verifyCodeHTML = `<td style="padding:30px;font-size:50px;letter-spacing:0.3em;font-family:Avenir,Helvetica,Arial,sans-serif;color:#252525;text-align:center">${verify_code}</td>`
   
   const verifyLinkHTML = `
   <td style="font-family:Avenir,Helvetica,Arial,sans-serif;text-align:center">
 
   <a href="${verify_link}" target="_blank" style="background-color: #17a607; color: white; padding: 10px 20px; text-align: center; text-decoration: none; display: inline-block; font-size: 16px; margin: 4px 2px; cursor: pointer; border-radius: 8px;">
      Verify Email
   </a>
   </td>
   `

   let verifyHTML = verify_code? verifyCodeHTML : verifyLinkHTML


   return `
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
                     <td style="padding:30px;font-size:16px;font-family:Avenir,Helvetica,Arial,sans-serif;line-height:19px;color:#2d80c4;text-align:center">Your <b>${app_name}</b> email verification: </td>
                  </tr>
                  <tr>
                    ${verifyHTML}
                  </tr>
                  <tr>
                     <td style="padding:30px;font-size:16px;font-family:Avenir,Helvetica,Arial,sans-serif;line-height:19px;color:#252525;text-align:center">
                        For security purposes, don not share the content of this email with anyone.
                        <br><br>
                        If you did not request verification, someone may be trying to access your account. You can change your password to secure your account.
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

}

export default fp(contentManager, {
  name: 'contentManager'
})