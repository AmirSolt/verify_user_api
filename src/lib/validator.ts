// ==== No validation is needed, so far. ====


import { Static, Type } from '@sinclair/typebox'



export const VerifReq = Type.Object({
    phoneNumber: Type.String({
        maxLength:20,
    }),
    verifyCode: Type.String({
      maxLength:12
    }),
    appName: Type.Optional( Type.String({
      maxLength:60
    })),
})

export type VerifReqType = Static<typeof VerifReq>