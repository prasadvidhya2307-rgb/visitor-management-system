import { z } from "zod";

export const updateSettingsSchema = z.object({
    companyName: z.string().trim().max(150),
    maxVisitHours: z.number().int().min(1).max(168),
    requirePhoto: z.boolean(),
    autoCheckoutHours: z.number().int().min(1).max(168),
});
