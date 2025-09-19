# RBAC Permission Matrix (MVP)

> Principle: Default deny. Only explicitly granted actions are allowed. Audit every mutation.

## Roles
- patient
- frontdesk
- doctor
- pharmacy
- accounts
- admin

## Action Categories
- read / create / update / delete (soft)
- state-transition:* (appointment state machine)
- sign-off (visit)
- issue (prescription/diet plan)
- refund (payments)
- override (no-show -> checked-in)
- manage-users / manage-devices / manage-discounts

## Matrix (High-Level)
| Entity / Action | patient | frontdesk | doctor | pharmacy | accounts | admin |
|-----------------|---------|-----------|--------|----------|----------|-------|
| Patient: create self | ✔ | ✔ | ✖ | ✖ | ✖ | ✔ |
| Patient: read demographics | ✔ (self) | ✔ | ✔ | limited | limited | ✔ |
| Patient: read clinical (SOAP) | self (summary) | ✖ | ✔ | ✖ | ✖ | ✔ |
| Patient: update demographics | ✔ (self subset) | ✔ | ✖ | ✖ | ✖ | ✔ |
| Appointment: create | ✔ | ✔ | ✖ | ✖ | ✖ | ✔ |
| Appointment: read | self | ✔ | ✔ | limited (med dispense) | limited (financial) | ✔ |
| Appointment: update reason | ✔ (before confirm) | ✔ | ✖ | ✖ | ✖ | ✔ |
| Appointment: cancel | ✔ | ✔ | ✔ (clinical cause) | ✖ | ✖ | ✔ |
| Appointment: state-transition (per table) | limited | ✔ | ✔ (checked-in→in-consult, in-consult→completed) | ✖ | refund only | ✔ |
| Visit: create (on check-in) | ✖ | system | system | ✖ | ✖ | ✔ (maintenance) |
| Visit: read | self (summary) | ✖ | ✔ | ✖ | ✖ | ✔ |
| Visit: update draft SOAP | ✖ | ✖ | ✔ | ✖ | ✖ | ✔ |
| Visit: sign-off | ✖ | ✖ | ✔ | ✖ | ✖ | ✔ (override) |
| Prescription: issue | ✖ | ✖ | ✔ | ✖ | ✖ | ✔ (override) |
| Prescription: read | self | ✔ (label only) | ✔ | ✔ | limited | ✔ |
| Diet Plan: issue | ✖ | ✖ | ✔ | ✖ | ✖ | ✔ |
| Diet Plan: read | self | ✔ (status only) | ✔ | ✔ (macros only) | ✖ | ✔ |
| Orders: create | ✖ | ✖ | ✔ | ✖ | ✖ | ✔ |
| Orders: update status | ✖ | ✔ (collected) | ✔ (reviewed) | ✖ | ✖ | ✔ |
| Invoice: create | ✖ | ✔ | propose items | ✖ | ✖ | ✔ |
| Invoice: read | self | ✔ | ✔ | ✔ (med price) | ✔ | ✔ |
| Invoice: apply discount | ✖ | ✔ (<=threshold) | propose | ✖ | ✔ (any) | ✔ |
| Payment: create (capture) | self (link) | ✔ | ✖ | ✖ | ✔ (manual) | ✔ |
| Payment: refund | ✖ | ✖ | ✖ | ✖ | ✔ | ✔ |
| Document: upload (consent/report) | self (consent) | ✔ | ✔ | ✔ (dispense label) | ✖ | ✔ |
| Document: share link create | self (restricted) | ✖ | ✔ | ✖ | ✖ | ✔ |
| User/device management | ✖ | ✖ | ✖ | ✖ | ✖ | ✔ |

## Implementation Strategy
- Policy registry: mapping `resource:action` -> roles.
- Context injection: `req.context.actor = { id, role, permissions }`.
- Middleware: `requirePermission('appointment.state-transition.confirmed->checked-in')` or coarse `requireRole('doctor')`.
- Fine-grained checks for ownership (patient self) executed inside handlers.

## Policy Definition Example (TypeScript)
```ts
export const Policies = {
  'patient.create': ['frontdesk','admin','patient'],
  'patient.read.demographics': ['frontdesk','doctor','admin','accounts','pharmacy'],
  'patient.read.demographics.self': ['patient'],
  'patient.read.clinical': ['doctor','admin'],
  'appointment.create': ['frontdesk','patient','admin'],
  'appointment.cancel': ['frontdesk','patient','doctor','admin'],
  'appointment.transition.requested.confirmed': ['frontdesk','admin','system'],
  'appointment.transition.confirmed.checked-in': ['frontdesk','patient','admin'],
  'appointment.transition.checked-in.in-consult': ['doctor','admin'],
  'appointment.transition.in-consult.completed': ['doctor','admin'],
  'appointment.transition.confirmed.no-show': ['system'],
  'appointment.transition.no-show.checked-in': ['frontdesk','admin'],
  'visit.soap.update': ['doctor','admin'],
  'visit.signoff': ['doctor','admin'],
  'prescription.issue': ['doctor','admin'],
  'dietplan.issue': ['doctor','admin'],
  'invoice.create': ['frontdesk','admin'],
  'invoice.discount.apply': ['frontdesk','accounts','admin'],
  'payment.refund': ['accounts','admin']
  // TODO expand
} as const;
```

## Edge Cases & Enforcement Notes
- A doctor who is also clinic owner uses admin union of permissions (resolve via distinct user or role precedence rule).
- Self-access: always validate `actor.id === patient.userId` before serving patient-only endpoints.
- Prevent privilege escalation: role changes only by admin with device-approved session & MFA.
- Logging: Denied attempts produce audit event with action `authorization-denied` (optional, watch volume).

## TODO / Clarifications
- Discount threshold values (frontdesk max %, accounts unlimited?).
- Pharmacy visibility of diet macros acceptable? (Assumption: YES.)
- Accounts access to partial clinical context (currently limited) — confirm if any KPI needs more.
