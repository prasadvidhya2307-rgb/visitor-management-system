import { FaceRecognitionService } from "../face-recognised/face-recognition.service";
import { MediaService } from "../media/media.service";
import { VisitService } from "../visit/visit.service";
import { CreateVisitDto } from "../visit/visit.types";
import { VisitorService } from "../visitors/visitor.service";
import { CheckInDto } from "./check-in.types";

export class CheckInService {
    constructor(
        private readonly mediaService: MediaService,
        private readonly visitorService: VisitorService,
        private readonly visitService: VisitService,
        private readonly faceRecognitionService: FaceRecognitionService,
    ) { }

    // public async checkIn(
    //     dto: CheckInDto,
    //     image: Express.Multer.File,
    // ) {
    //     const media = await this.mediaService.createTemporary(image);

    //     const visitor = await this.visitorService.createVisitor(
    //         dto.visitor,
    //         media.id,
    //     );

    //     try {
    //         await this.faceRecognitionService.registerFace(
    //             visitor.id,
    //             image,
    //         );
    //     } catch (error) {
    //         await this.visitorService.failRegistration(visitor.id);
    //         throw error;
    //     }

    //     await this.visitorService.completeRegistration(
    //         visitor.id,
    //     );

    //     const visit = await this.visitService.createVisit({
    //         ...dto.visit,
    //         visitorId: visitor.id,
    //     });

    //     await this.mediaService.markActive(
    //         media.id,
    //     );

    //     return {
    //         visitor,
    //         visit,
    //     };
    // }


    public async existingCheckIn(
        visitorId: string,
        dto: CreateVisitDto,
    ) {
        const visitor =
            await this.visitorService.getVisitor(
                visitorId,
            );

        const visit =
            await this.visitService.createVisit(visitor.id, dto);

        return {
            visitor,
            visit,
        };
    }
}