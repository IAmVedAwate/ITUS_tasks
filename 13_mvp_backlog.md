# MVP Backlog & Sprint Slicing

## Epics
1. Authentication & RBAC
2. Patient Registry & Consents
3. Scheduling & Appointments
4. Clinical Documentation (Visits + SOAP + Prescriptions + Diet Plans)
5. Billing & Payments
6. Automation & Notifications
7. Reporting & KPIs
8. Security, Audit & Compliance
9. Infrastructure & DevOps

## Sprint Plan (Assume 2-week sprints, 3 sprints)
### Sprint 1 (Foundations)
- Story: Set up repo & CI pipeline
- Story: Implement Auth (patient OTP request/verify)
- Story: Staff login + basic JWT issuance
- Story: RBAC middleware + policy registry
- Story: Patient create/read/update endpoints (demographics + consent upload placeholder)
- Story: Slot template generation script & list slots endpoint
- Story: Appointment create + confirm + basic state transitions (Requested->Confirmed)
- Story: Audit event writer (create/update + state-transition)
- Story: Basic health & metrics endpoints
- Story: Security: encryption helper + phone hashing

### Sprint 2 (Clinical & Billing)
- Story: Visit creation on Check-In
- Story: SOAP draft save + sign-off lock
- Story: Prescription issue + PDF/QR stub
- Story: Diet plan create + adherence checkbox endpoint
- Story: Invoice draft create + issue + line item calc
- Story: Payment integration (Razorpay create link + webhook capture)
- Story: Partial payment ledger update
- Story: Appointment full state machine (No-Show automation, overrides)
- Story: Reminders (t24, t2) automation execution
- Story: Reporting daily job (appointments + revenue + documentation KPIs)

### Sprint 3 (Polish & Compliance)
- Story: Refund flow + state Refunded transitions
- Story: Addendum to signed visit
- Story: Abnormal lab alert placeholder (manual trigger)
- Story: Device approval flow (admin approve)
- Story: Export audit log (time range)
- Story: KPI endpoint /reports/kpis/today
- Story: Optimization: indexes pass + slow query review
- Story: Backup & restore runbook docs
- Story: Hardening: rate limits, logging PHI scrub
- Story: Final QA & UAT fixes

## Representative User Stories (INVEST Format)
- As a FrontDesk user, I can create a patient by phone OTP so that booking can proceed.
- As a Patient, I can confirm an appointment via reminder link so my slot is secured.
- As a Doctor, I can sign off a visit locking the SOAP note so that the clinical record is immutable.
- As Accounts, I can issue a refund so that patient overpayment is corrected.
- As Admin, I can export audit logs between dates for compliance review.

## Definition of Done (General)
- Code: Reviewed, lint & tests pass.
- Security: No secrets committed; sensitive fields encrypted.
- Audit: All mutations produce audit event.
- Docs: Endpoint documented in API spec.
- Tests: Unit (core logic) + minimal integration for critical flows (auth, booking, payment capture).

## Risks & Mitigations
| Risk | Impact | Mitigation |
|------|--------|-----------|
| Payment webhook race | Duplicate capture | Idempotency key store |
| Slot overbooking under concurrency | Patient dissatisfaction | Atomic slot update with status check |
| PHI leakage in logs | Compliance breach | Scrubbing middleware + code review checklist |
| Reminder provider downtime | Missed confirmations | Retry + fallback SMS |

## TODO / Clarifications
- Exact test coverage target (assumption 60% lines initial).
- UAT sign-off criteria by clinic stakeholders.
