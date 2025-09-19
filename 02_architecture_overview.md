# System Architecture Overview (MVP)

## Logical Component Map

| Domain Service | Responsibility | Key Collections |
|----------------|----------------|-----------------|
| Auth & Identity | OTP login (patients), staff auth (email+password), MFA (admin), session & device approval | users, devices, otp_tokens |
| Patient Registry | Patient demographics, consents, documents linkage | patients, consents, documents |
| Scheduling | Slot templates, appointments, waitlist, booking locks | slots, appointments, waitlist_locks |
| Clinical / Encounters | Visits (SOAP), vitals, diagnoses, prescriptions, diet plans, orders | visits, vitals (embedded), prescriptions, diet_plans, orders |
| Billing & Payments | Invoices, line items, payments, refunds, ledger | invoices, payments, ledger_entries |
| Automation & Jobs | Reminders, no-show, payment follow-up, abnormal alerts | automation_events, job_runs |
| Notifications | WhatsApp/SMS/email dispatch, rate limiting | notifications_outbox |
| Document Vault | File metadata, versioning, share links, audit access | documents, document_access |
| Reporting | Daily aggregates, KPI computations | report_daily, report_raw_events |
| Audit & Compliance | Immutable audit events + retention management | audit_events |

## High-Level Diagram (Conceptual)
```
[Client (React PWA / Front Desk Portal / Doctor Console)]
        |  HTTPS (JWT / OTP)
        v
[API Gateway / Express Layer]
  |-- Auth Service
  |-- Scheduling Service
  |-- Clinical Service
  |-- Billing Service
  |-- Documents Service
  |-- Automation Worker (queue consumer)
  |-- Reporting Aggregator (cron)

[MongoDB Atlas (India Region)]
  |  Collections (normalized w/ selective embedding)

[Object Storage (S3-compatible, India)]
  |  Encrypted documents

[External Integrations]
  - WhatsApp Business API
  - SMS Gateway
  - Payment Gateway (Razorpay abstraction)
  - (Future) Lab Partner API / Inventory / Wearables
```

## Service Interaction Notes
- Express monolith with modular service folders *(MVP)*; can be extracted to micro-services when scaling triggers occur (appointments/day > 5k, or > 200 concurrent users).
- Domain boundaries enforced via folder structure + service interfaces (e.g., `services/schedulingService.ts`).
- Event emission (in-process) for critical domain events: `APPOINTMENT_CONFIRMED`, `VISIT_SIGNED_OFF`, `PAYMENT_CAPTURED`, etc. Automation worker subscribes (in-process now, message bus later).

## Data Flow Examples
1. Booking:
   - Client calls `POST /appointments/request` -> lock slot -> confirm -> emit event -> schedule reminders.
2. Consultation:
   - Doctor opens visit -> incremental SOAP drafts stored (version temp docs) -> on sign-off create immutable snapshot + emit `VISIT_SIGNED_OFF`.
3. Billing:
   - Services used aggregated -> invoice draft -> apply discounts (role check) -> payment link created -> on success payment + ledger + audit.

## Scaling & Evolution Strategy
| Trigger | Action |
|--------|--------|
| >5 clinics or multi-tenant requirement | Introduce tenant routing layer + per-tenant DB or shared cluster with isolated databases |
| High write contention on appointments | Move slot lock to Redis + eventual confirmation queue |
| Heavy analytics queries | ETL nightly to warehouse (ClickHouse / BigQuery) |
| Increased automation complexity | Introduce rule engine service + persisted rule DSL |

## Cross-Cutting Concerns
- **RBAC Middleware**: declarative policy mapping endpoint -> required role/action.
- **Audit Middleware**: collect context + diff snapshots on mutating operations.
- **Validation Layer**: Joi schemas per endpoint with central error formatting.
- **Encryption Utility**: wrapper for field-level encryption / hashing operations.
- **Idempotency**: Payment webhooks & booking endpoints accept `Idempotency-Key` header; stored in `idempotency_keys` *(MVP optional - TODO)*.

## Performance Targets
- p95 < 300ms for standard CRUD (appointments, patients).
- Background jobs offloaded (reminders) not blocking request thread.

## Failure & Resilience
- Retry strategy for outbound calls (payment, WhatsApp) exponential backoff (max 3) then escalate to front desk notification.
- Circuit breaker pattern *(ROADMAP)* if external failures sustained.

## Observability
- Structured logs: requestId, actorId, route, latency, outcome.
- Metrics: counters (appointments_created), gauges (queue_length), histograms (booking_latency_ms).
- Error tracking placeholder; integrate Sentry *(ROADMAP)*.

## Security Highlights
- JWT short-lived (15m) + refresh token (rotating) for staff.
- Patient OTP session tokens (24h) minimal scope.
- Device approval: initial login flagged unapproved; admin approves -> device record `approved=true`.

## TODO Gaps / Clarifications
- Quiet hours config object format.
- Exact discount approval thresholds.
- Teleconsultation video provider selected placeholder.

