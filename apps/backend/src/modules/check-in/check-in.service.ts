import { FaceRecognitionService } from "../face-recognised/face-recognition.service.js";
import { MediaService } from "../media/media.service.js";
import { VisitService } from "../visit/visit.service.js";
import { CreateVisitDto } from "../visit/visit.types.js";
import { VisitorService } from "../visitors/visitor.service.js";
import { CheckInDto } from "./check-in.types.js";

export class CheckInService {
    constructor(
        private readonly mediaService: MediaService,
        private readonly visitorService: VisitorService,
        private readonly visitService: VisitService,
        private readonly faceRecognitionService: FaceRecognitionService,
    ) { }

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

    public async existingCheckInWithImage(visitorId: string, dto: CreateVisitDto, image: Express.Multer.File) {
        const visitor = await this.visitorService.getVisitor(visitorId);
        const media = await this.mediaService.createTemporary(image);
        try {
            const visit = await this.visitService.createVisit(visitor.id, dto, media.id);
            await this.mediaService.markActive(media.id);
            return { visitor, visit };
        } catch (error) {
            await this.mediaService.deleteTemporary(media.id);
            throw error;
        }
    }
}
