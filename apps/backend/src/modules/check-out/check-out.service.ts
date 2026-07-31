import { Visit } from "../../generated/prisma/client";

import { FaceRecognitionService } from "../face-recognised/face-recognition.service";
import {
    FaceRecognitionCode,
    FaceRecognitionResponseToNode,
} from "../face-recognised/face-recognition.types";

import { VisitService } from "../visit/visit.service";
import { VisitorService } from "../visitors/visitor.service";
import { VisitorResponseDto } from "../visitors/visitor.types";

export class CheckOutService {
    constructor(
        private readonly faceRecognitionService: FaceRecognitionService,
        private readonly visitorService: VisitorService,
        private readonly visitService: VisitService,
    ) { }

    public async checkOut(
        image: Express.Multer.File,
    ): Promise<
        FaceRecognitionResponseToNode | {
            visitor: VisitorResponseDto;
            visit: Visit;
        }
    > {
        const recognition =
            await this.faceRecognitionService.recognize(image);

        if (
            recognition.code !== FaceRecognitionCode.MATCH_FOUND ||
            !recognition.data?.personId
        ) {
            return recognition;
        }

        const visitor =
            await this.visitorService.getVisitor(
                recognition.data.personId,
            );

        const activeVisit =
            await this.visitService.getActiveVisit(
                visitor.id,
            );

        const visit =
            await this.visitService.checkoutVisit(
                activeVisit.id,
            );

        const visitorData: VisitorResponseDto = {
            ...visitor,
            emails: visitor.emails.map(e => e.email),
            mobiles: visitor.mobiles.map(e => e.mobile)
        }

        return {
            visitor: visitorData,
            visit,
        };
    }
}