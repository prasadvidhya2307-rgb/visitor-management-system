import {IdentityType} from "../../generated/prisma/client"


export interface createMobileDto {
    mobile: string;
    isPrimary: boolean;
}

export interface createEmailDto {
    email: string;
    isPrimary: boolean;
}

export interface createVisitorDto {
    firstName: string;
    lastName?: string;

    identityType: IdentityType
    identityNumber: string

    mobiles: createMobileDto[];
    emails?: createEmailDto[];
}