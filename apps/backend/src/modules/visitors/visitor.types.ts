import { z } from 'zod'
import { createEmailSchema, createMobileSchema, createVisitorSchema, updateVisitorSchema } from "./visitor.validation";
import { IdentityType, RegistrationStatus } from '../../generated/prisma/enums';



/**
 * frontend send data to backend contract
 */
export type createMobileDto = z.infer<typeof createMobileSchema>
export type createEmailDto = z.infer<typeof createEmailSchema>
export type updateVisitorDto = z.infer<typeof updateVisitorSchema>
export type createVisitorDto = z.infer<typeof createVisitorSchema>

/**
 * backend send response to frontend contract
 */
export interface VisitorResponseDto {
    id: string;
    visitorCode: string;
    firstName: string;
    lastName: string | null;
    identityType: IdentityType;
    identityNumber: string;
    registrationStatus: RegistrationStatus;
    faceRegistered: boolean;
    // registrationImageUrl: string | null;
    emails: string[];
    mobiles: string[];
    createdAt: Date;
    updatedAt: Date;
}