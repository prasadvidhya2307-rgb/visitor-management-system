import { Media, Visitor } from "../../generated/prisma/client";
import { FaceRecognitionService } from "../face-recognised/face-recognition.service";
import { MediaService } from "../media/media.service";
import { VisitorService } from "../visitors/visitor.service";
import { createVisitorDto } from "./visitor-registration.types";

export class VisitorRegistrationService {
    constructor(
        private readonly mediaService: MediaService,
        private readonly faceRecognitionService: FaceRecognitionService,
        private readonly visitorService: VisitorService,
    ) { }

    public async register(
        dto: createVisitorDto,
        image: Express.Multer.File,
    ) {
        let registrationImage: Media | null = null;
        let visitor: Visitor | null = null;

        try {
            console.log("1. Saving registration image");

            registrationImage = await this.mediaService.createTemporary(image);

            console.log("2. Creating visitor");

            visitor = await this.visitorService.createVisitor(
                dto,
                registrationImage.id,
            );

            console.log("3. Registering face");

            await this.faceRecognitionService.registerFace(
                visitor.id,
                image,
            );

            console.log("4. Marking registration image active");

            await this.mediaService.markActive(registrationImage.id);

            console.log("5. Completing registration");

            await this.visitorService.completeRegistration(visitor.id);

            console.log("6. Returning visitor");

            return await this.visitorService.getVisitor(visitor.id);
        } catch (error) {
            console.log("Registration failed. Rolling back...");

            if (registrationImage) {
                await this.mediaService.deleteTemporary(
                    registrationImage.id,
                );
            }

            if (visitor) {
                await this.visitorService.failRegistration(
                    visitor.id,
                );
            }

            throw error;
        }
    }
}