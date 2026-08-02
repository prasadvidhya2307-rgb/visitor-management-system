import { Visit } from "@prisma/client";

import { FaceRecognitionService } from "../face-recognised/face-recognition.service.js";
import {
    FaceRecognitionCode,
    FaceRecognitionResponseToNode,
} from "../face-recognised/face-recognition.types.js";

import { VisitService } from "../visit/visit.service.js";
import { VisitorService } from "../visitors/visitor.service.js";
import { VisitorResponseDto } from "../visitors/visitor.types.js";
import { CheckOutResponse } from "./check-out.types.js";
import { AppError } from "../../utils/app-error.js";

export class CheckOutService {
    constructor(
        private readonly faceRecognitionService: FaceRecognitionService,
        private readonly visitorService: VisitorService,
        private readonly visitService: VisitService,
    ) { }

    public async checkOut(
        image: Express.Multer.File,
    ): Promise<CheckOutResponse> {


        const recognition =
            await this.faceRecognitionService.recognize(image);

        const { code, data, message } = recognition;

        if (!recognition.data?.matched) {
            return {
                message: message,
                matched: data.matched,
                score: data.score,
                code,
                visitor: null,
                visit: null
            }
        }


        const visitor =
            await this.visitorService.getVisitor(
                recognition.data.personId!,
            );

        const activeVisit =
            await this.visitService.getActiveVisit(
                visitor.id,
            );

        if (!activeVisit) {
            throw new AppError(
                "no visit found for this visitor",
                404
            )
        }

        const visit =
            await this.visitService.checkoutVisit(
                activeVisit.id,
                visitor.id
            )


        const visitorData: VisitorResponseDto = {
            ...visitor,
            emails: visitor.emails.map(e => e.email),
            mobiles: visitor.mobiles.map(e => e.mobile)
        }

        return {
            message: message,
            matched: data.matched,
            score: data.score,
            code,
            visitor: visitorData,
            visit: visit
        }
    }
}