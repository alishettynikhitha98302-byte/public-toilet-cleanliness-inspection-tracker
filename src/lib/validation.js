import { z } from 'zod';
import { AppError } from '../middleware/errors.js';
export function validate(schema, value) { const parsed=schema.safeParse(value); if (!parsed.success) throw new AppError(400,'VALIDATION_ERROR','Please correct the submitted information.',parsed.error.issues.map(i=>({field:i.path.join('.'),message:i.message}))); return parsed.data; }
export const facilitySchema=z.object({name:z.string().trim().min(2).max(120),address:z.string().trim().min(4).max(240),district:z.string().trim().min(2).max(80),facility_type:z.enum(['public','park','transit','market','other']),accessibility:z.boolean().default(false),inspection_interval_days:z.number().int().min(1).max(90).default(7)}).strict();
export const scheduleSchema=z.object({facility_id:z.string().uuid(),scheduled_for:z.string().date()}).strict();
export const inspectionSchema=z.object({facility_id:z.string().uuid(),scheduled_for:z.string().date(),checklist:z.object({cleanliness:z.number().int().min(1).max(5),supplies:z.number().int().min(1).max(5),fixtures:z.number().int().min(1).max(5),accessibility:z.number().int().min(1).max(5),safety:z.number().int().min(1).max(5)},'Complete every checklist rating.').strict(),notes:z.string().trim().max(2000).default(''),evidence_url:z.string().url().max(500).optional().or(z.literal(''))}).strict();
export const defectSchema=z.object({inspection_id:z.string().uuid(),title:z.string().trim().min(4).max(160),description:z.string().trim().max(2000).default(''),severity:z.enum(['low','medium','high','critical']),assigned_to:z.string().uuid().optional(),due_at:z.string().datetime()}).strict();
export const actionSchema=z.object({resolution_note:z.string().trim().min(4).max(2000),status:z.enum(['resolved','in_progress'])}).strict();
export const reinspectionSchema=z.object({result:z.enum(['pass','fail']),notes:z.string().trim().max(2000).default('')}).strict();

\n