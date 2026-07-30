import { FaceRecognitionService } from "../face-recognised/face-recognition.service";
import { VisitorService } from "../visitors/visitor.service";
import { createVisitorDto } from "./visitor-registration.types";

export class VisitorRegistrationService {
    constructor(
        private readonly faceRecognitionService: FaceRecognitionService,
        private readonly visitorService: VisitorService
    ) { }

    public async register(
        dto: createVisitorDto,
        image: Express.Multer.File
    ) {

         console.log("1. Creating visitor");

        const visitor = await this.visitorService.createVisitor(dto)

        console.log("2. Visitor created", visitor);

        try {
            console.log("3. Registering face");
            await this.faceRecognitionService.registerFace(
                visitor.id,
                image
            )

            console.log("4. Face registered");

            await this.visitorService.markFaceRegistered(visitor.id)

            console.log("5. Done");
            
            const dataVisitor = await this.visitorService.getVisitor(visitor.id)
            console.log(dataVisitor)

            return this.visitorService.getVisitor(visitor.id)

        } catch (error) {
            await this.visitorService.markFaceRegistered(visitor.id)

            throw error
        }

    }
}