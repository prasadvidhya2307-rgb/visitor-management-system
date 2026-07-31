import { Router } from "express";

import {
    createEmployeeSchema,
    updateEmployeeSchema,
} from "./employee.validation";
import { employeeController } from "../../container/index.js";
import { validate } from "../../middlewares/validate.middleware.js";

const router = Router();


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

router.delete(
    "/:employeeId",
    employeeController.deleteEmployee,
);

export default router;