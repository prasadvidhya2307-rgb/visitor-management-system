import { Router } from "express";

import {
    createEmployeeSchema,
    updateEmployeeSchema,
} from "./employee.validation.js";
import { employeeController } from "../../container/index.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { upload } from "../../middlewares/upload.middleware.js";

const router = Router();

router.use(authenticate)

router.post(
    "/",
    validate(createEmployeeSchema),
    employeeController.createEmployee,
);

router.get(
    "/",
    employeeController.getEmployees,
);

router.get(
    "/:employeeId",
    employeeController.getEmployee,
);

router.patch(
    "/:employeeId",
    validate(updateEmployeeSchema),
    employeeController.updateEmployee,
);
router.put("/:employeeId/image", upload.single("image"), employeeController.updateProfileImage);

router.delete(
    "/:employeeId",
    employeeController.deleteEmployee,
);

export default router;
