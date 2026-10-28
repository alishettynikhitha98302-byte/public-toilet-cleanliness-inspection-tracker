# RLS and integration verification checklist

Use two synthetic accounts, A and B. Promote A to `operator`; leave B as `requester`.

1. Sign in as A. Insert and read a facility, complete an inspection, add a defect, save a resolution note, and submit a passing reinspection. Confirm the defect transitions to `closed` and audit_events contains each change.
2. Sign in as B and call `GET /api/facilities`, `GET /api/inspections`, `GET /api/defects`, and `GET /api/history`. Confirm requester scope returns only their explicitly related records and history is forbidden.
3. Attempt `POST /api/facilities`, `POST /api/inspections`, `POST /api/defects`, and `POST /api/defects/:id/reinspection` as B. Confirm 403.
4. As A, attempt defect creation for a scheduled inspection (expect 400) and a duplicate facility (expect 409). Submit invalid ratings, extra JSON fields, invalid date, invalid severity and malformed UUID; expect 400.
5. As B, attempt to update their own profile role to admin through Supabase REST. Confirm RLS check rejects it.
6. Verify a failed reinspection returns a resolved defect to in_progress; passing one closes it. Confirm open overdue counts change after statuses change.

Run with synthetic records only. Inspect `auth.uid()` behavior through the actual browser token; SQL editor requests run as postgres and do not exercise RLS.
