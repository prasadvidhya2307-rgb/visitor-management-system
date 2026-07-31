import { Request, Response } from "express";

import { ApiResponse } from "../../utils/api-response";

import { PreRegistrationService } from "./pre-registration.service";
import {
    CreatePreRegistrationDto,
    UpdatePreRegistrationDto,
} from "./pre-registration.types";

export class PreRegistrationController {
    constructor(
        private readonly preRegistrationService: PreRegistrationService,
    ) {}

    public createPreRegistration = async (
        req: Request,
        res: Response,
    ): Promise<void> => {
        const dto =
            req.body as CreatePreRegistrationDto;

        const preRegistration =
            await this.preRegistrationService.createPreRegistration(
                dto,
            );

        ApiResponse.success(
            res,
            "Pre-registration created successfully.",
            preRegistration,
            201,
        );
    };

    public updatePreRegistration = async (
        req: Request<{id: string}>,
        res: Response,
    ): Promise<void> => {
        const dto =
            req.body as UpdatePreRegistrationDto;

        const preRegistration =
            await this.preRegistrationService.updatePreRegistration(
                req.params.id,
                dto,
            );

        ApiResponse.success(
            res,
            "Pre-registration updated successfully.",
            preRegistration,
        );
    };

    public getPreRegistration = async (
        req: Request<{id: string}>,
        res: Response,
    ): Promise<void> => {
        const preRegistration =
            await this.preRegistrationService.getPreRegistration(
                req.params.id,
            );

        ApiResponse.success(
            res,
            "Pre-registration fetched successfully.",
            preRegistration,
        );
    };

    public getPreRegistrations = async (
        req: Request,
        res: Response,
    ): Promise<void> => {
        const preRegistrations =
            await this.preRegistrationService.getPreRegistrations();

        ApiResponse.success(
            res,
            "Pre-registrations fetched successfully.",
            preRegistrations,
        );
    };

    public cancelPreRegistration = async (
        req: Request<{id: string}>,
        res: Response,
    ): Promise<void> => {
        const preRegistration =
            await this.preRegistrationService.cancelPreRegistration(
                req.params.id,
            );

        ApiResponse.success(
            res,
            "Pre-registration cancelled successfully.",
            preRegistration,
        );
    };
}