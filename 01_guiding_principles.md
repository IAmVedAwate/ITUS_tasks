# Guiding Principles & Assumptions (MVP)

> Source: Specification + clarified assumptions. All items tagged *(MVP)* indicate current scope. Items tagged *(ROADMAP)* are explicitly deferred.

## Product Core
- Capture-at-source: enforce that Front Desk, Doctor, Billing enter data at workflow step; later edits require addenda where clinical data is involved.
- Lean first: only essential entities + fields; extensibility hooks via versioning & referencing.
- India compliance: DPDP alignment, PHI minimization, GST-ready invoices.
- WhatsApp-first patient communication; web/PWA portal for self-service.

## Tenancy / Deployment
- Single clinic per deployment *(MVP)* with `tenantId` field reserved for future multi-tenant.
- All data stored in India region (choose AWS ap-south-1).

## Security & Compliance
- Field-level encryption (FLE) for PHI fields: diagnoses, allergies, medications, lab results, vitals raw values.
- Hashed phone (SHA-256 + salt) for patient lookup; raw phone stored encrypted.
- Append-only audit log; >3 year retention; daily cold storage snapshot.
- Consents & documents versioned; share links ephemeral (TTL configurable, default 7 days).
- No PHI in application logs; correlation IDs for traceability.

## Scheduling
- Pre-generated doctor slot documents daily with buffer rules.
- 90s slot lock during booking.
- Strict anti double-booking; waitlist FIFO.
- Auto mark No-Show at +15m (configurable) with override permission (FrontDesk, Admin).

## Clinical
- SOAP notes free text sections initially; version history until sign-off; post sign-off immutable with addenda records.
- Multiple diagnoses allowed; primary flag deferred *(ROADMAP)*.
- Extensible vitals as key:value pairs + typed metadata.
- Prescriptions immutable after issue; new version = superseding doc referencing prior.

## Billing & Payments
- Gateways: Razorpay (primary abstraction), pluggable provider interface.
- Split & partial payments; ledger tracks outstanding.
- Discounts allowed with role guard & optional approval threshold *(ROADMAP)*.
- Refund generates reversal entry & Appointment state may proceed to Refunded.

## Diet Plans
- Template + personalized macros; adherence = per day checkbox completion rate.
- Versions maintained per follow-up.

## Orders & Labs
- Manual status progression; PDF result upload; abnormal flag via static config.

## Automation
- Hard-coded rule set executed by job worker & event hooks; roadmap: rules UI + DSL.

## Reporting
- Daily aggregation pipeline into `report_daily`; real-time metrics limited to health & queue.

## DevOps / Infra
- Monorepo; GitHub Actions; environments: dev, stage, prod.
- Daily backups + weekly automated restore validation.
- Observability minimal: HTTP metrics, error rate, automation job failures.

## Extensibility Hooks
- `tenantId`, `extensions` map on key entities; event bus pattern for future modules (inventory, labs API, wearables ingestion).

## Success Metrics Definitions
- No-Show Rate = NoShows / (Completed + NoShows) per period.
- Booking Completion Time = median(time Confirmed - time Requested) for successful bookings.
- Doctor Note Completion Rate = Visits with (S,O,A,P all non-empty AND Prescription exists) / Total Visits.

## Outstanding Clarifications (Flagged TODO)
- Digital signature implementation detail (hash vs CA-signed) specifics.
- Device approval UX (simple email OTP vs admin console approve).
- Quiet hours exact window & WhatsApp vs SMS fallback order.
- Refund approval hierarchy thresholds.

