import { Router } from "express";

import {
    createEmployeeSchema,
    updateEmployeeSchema,
} from "./employee.validation";
import { employeeController } from "../../container";
import { validate } from "../../middlewares/validate.middleware";

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