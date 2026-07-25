import { z } from 'zod'
import { createEmailSchema, createMobileSchema, createVisitorSchema, updateVisitorSchema } from "./visitor.validation";


export type createMobileDto = z.infer<typeof createMobileSchema>
export type createEmailDto = z.infer<typeof createEmailSchema>
export type createVisitorDto = z.infer<typeof createVisitorSchema>
export type updateVisitorDto = z.infer<typeof updateVisitorSchema>