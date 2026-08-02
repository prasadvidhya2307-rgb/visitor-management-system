import { Router } from "express";
import { authController } from "../../container/index.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import {
    loginSchema,
    changePasswordSchema,
} from "./auth.validation.js";

const router = Router();

router.post(
    "/login",
    validate(loginSchema),
    authController.login,
);

router.use(authenticate)

router.get(
    "/me",
    authenticate,
    authController.me,
);

router.put(
    "/change-password",
    authenticate,
    validate(changePasswordSchema),
    authController.changePassword,
);

export default router;