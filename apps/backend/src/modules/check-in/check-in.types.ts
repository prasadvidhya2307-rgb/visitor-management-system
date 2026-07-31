import z from "zod";
import { checkInSchema } from "./check-in.validation.js";
import { VisitStatus } from "@prisma/client";
import { VisitorResponseDto } from "../visitors/visitor.types.js";
import { VisitResponseDto } from "../visit/visit.types.js";

export type CheckInDto = z.infer<typeof checkInSchema>

export interface CheckInResponse {
    visitor: VisitorResponseDto,
    visit: VisitResponseDto
}