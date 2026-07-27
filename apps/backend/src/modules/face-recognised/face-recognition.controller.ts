import { Request, Response } from 'express'
import { asyncHandler } from "../../utils/async-handler";
import { FaceRecognitionService } from './face-recognition.service';
import { AppError } from '../../utils/app-error';
import { ApiResponse } from '../../utils/api-response';
import { VisitorService } from '../visitors/visitor.service';

export class FaceRecognitionController {

    constructor(
        private readonly faceRecognitionService: FaceRecognitionService,
        private readonly visitorSerive: VisitorService
    ) { }

    public recognize = asyncHandler(
        async (
            req: Request,
            res: Response
        ) => {

            const file = req.file

            if (!file) {
                throw new AppError(
                    "image is required",
                    400
                )
            }

            const result = await this.faceRecognitionService.recognize(file)

            if (!result.matched) {
                return ApiResponse.success(
                    res,
                    "face not recognized",
                    result
                )
            }

            const visitor = await this.visitorSerive.getVisitor(result.person_id)

            return ApiResponse.success(
                res,
                "face recognized successfully",
                visitor
            )

        }
    )

    public register = () => {}

}