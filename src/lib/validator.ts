// ==== No validation is needed, so far. ====


import { Static, Type } from '@sinclair/typebox'



export const VerifReq = Type.Object({
    to_phone_number: Type.String({
        maxLength:20,
    }),
    verify_code: Type.String({
      maxLength:12
    }),
    app_name: Type.Optional( Type.String({
      maxLength:60
    })),
})

export type VerifReqType = Static<typeof VerifReq>