import z from "zod";
import { checkInSchema } from "./check-in.validation";
import { VisitStatus } from "../../generated/prisma/enums";
import { VisitorResponseDto } from "../visitors/visitor.types";
import { VisitResponseDto } from "../visit/visit.types";

export type CheckInDto = z.infer<typeof checkInSchema>

export interface CheckInResponse {
    visitor: VisitorResponseDto,
    visit: VisitResponseDto
}