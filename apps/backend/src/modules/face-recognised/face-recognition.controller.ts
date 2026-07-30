import { Request, Response } from 'express'
import { asyncHandler } from "../../utils/async-handler";
import { FaceRecognitionService } from './face-recognition.service';
import { AppError } from '../../utils/app-error';
import { FaceApiResponse } from '../../utils/api-response';
import { VisitorService } from '../visitors/visitor.service';
import { NodeResponseToFrontendRecognizeData } from './face-recognition.types';

export class FaceRecognitionController {

    constructor(
        private readonly faceRecognitionService: FaceRecognitionService,
        private readonly visitorService: VisitorService
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
            const { code, data, message } = result


            if (!result.data?.matched) {
                return FaceApiResponse.success(
                    res,
                    message,
                    code,
                    data
                )
            }

            const visitor =
                await this.visitorService.getVisitor(
                    result.data.personId!
                );

                console.log('visitor', visitor)

            return FaceApiResponse.success<NodeResponseToFrontendRecognizeData>(
                res,
                message,
                code,
                {
                    matched: data?.matched!,
                    visitor: {
                        ...visitor,
                        emails: visitor.emails.map(e => e.email),
                        mobiles: visitor.mobiles.map(m => m.mobile),

                    },
                    score: data?.score!
                }
            )

        }
    )

    public register = () => { }

}