# CINIC Clinic Platform — Executive Briefing (MVP)

> A simple, safe, and efficient clinic system for booking, consultation, and billing — built for day‑to‑day operations and future growth.

---

## 1) What we’re building and why (Guiding Principles)

- Capture once, at the source: Front Desk, Doctor, and Billing each enter information during their step. Clinical notes lock after sign‑off for integrity.
- Keep it lean: Only essential fields now; easy to extend later.
- Built for India: Privacy (DPDP), minimal PHI in logs, GST‑ready billing, India data residency.
- Patient‑friendly: WhatsApp‑first updates and a lightweight patient portal.

Expected benefits
- Faster front‑desk operations, fewer errors, and better traceability.
- Doctors focus on care; records are reliable and auditable.
- Management sees daily KPIs without heavy reports.

---

## 2) How it’s put together (Architecture)

- One secure API with modular services for Auth, Patients, Scheduling, Clinical, Billing, Automation, and Reporting.
- MongoDB (India region) for data; S3‑style storage for documents.
- Integrations: WhatsApp/SMS for reminders, Razorpay for payments (others pluggable later).
- Starts as a compact, reliable monolith; can scale to multi‑clinic and micro‑services when needed.

Reliability & safety
- Short, secure sessions; role‑based access; device approval for staff.
- Immutable audit trail for all important changes.
- Backups and restore drills; observability for uptime and errors.

---

## 3) What data we store (Data Model — plain English)

- Patients: basic details, consents, emergency contact, medical flags.
- Appointments & Slots: booking status and timelines.
- Visits: consultation notes (SOAP), vitals, diagnoses.
- Prescriptions & Diet Plans: versioned and traceable.
- Billing: invoices, payments, and a simple ledger.
- Audit & Reporting: immutable events and daily KPIs.

Privacy by design
- Patient identifiers (like phone) are hashed/encrypted.
- Clinical text and sensitive fields are stored encrypted.

---

## 4) A day in the clinic (Appointment Lifecycle)

1. Patient requests a slot (Requested)
2. Optional hold while pre‑payment completes (Tentative)
3. Confirm the appointment (Confirmed) → reminders scheduled
4. Patient arrives (Checked‑In) → visit is created
5. Doctor consults (In‑Consult) → notes drafted
6. Consultation and billing complete (Completed)
7. If patient doesn’t arrive, system marks No‑Show (with override option)
8. Cancellations/refunds are handled with clear rules

Why this matters
- Clear states prevent confusion and double‑booking.
- Automation handles routine reminders and no‑show processing.
- Every transition is audited for accountability.

---

## 5) Who can do what (RBAC — Roles & Permissions)

Roles: patient, front desk, doctor, pharmacy, accounts, admin

Examples
- Patients can create their profile and update some of their own details.
- Front Desk can create patients, manage bookings, and see demographics.
- Doctors write and sign clinical notes; issue prescriptions and diet plans.
- Accounts manage invoices, discounts (with limits), and refunds.
- Admin oversees users, devices, and advanced actions.

Outcome
- Least‑privilege access reduces risk; everyday work stays smooth.

---

## 6) What the API covers today (API Surface — MVP)

- Auth (OTP for patients; staff login roadmap)
- Patients (create, search/list, update baseline)
- Scheduling/Appointments (create, confirm, check‑in, transition, cancel)
- Visits & Clinical (draft SOAP, sign‑off)
- Prescriptions & Diet Plans (issue and view)
- Billing & Payments (invoice, collect, refund)
- Reporting (daily KPIs, today’s snapshot)

Note: The current codebase includes Auth (OTP) and Patients flow; other endpoints are planned and documented for the MVP rollout.

---

## 7) Always traceable (Audit & Compliance)

- Every important change creates an immutable audit event: who, what, when.
- Minimal sensitive content in audit — mostly diffs and references.
- Long‑term retention: hot → warm → cold storage (S3), exportable on demand.

Benefits
- Easier investigations and regulatory reporting.
- Strong safety net against accidental or malicious changes.

---

## 8) Set‑and‑forget automation (Automation Rules)

Initial rules
- Reminders 24 hours and 2 hours before visits.
- Release held slots if payment doesn’t complete.
- Mark No‑Show after grace period.
- Payment follow‑ups and abnormal lab notifications.

Design
- Deterministic and idempotent; safe to retry.
- Visible status and error handling; escalates on repeated failures.

---

## 9) Running it well (Infrastructure & DevOps)

- Environments: dev, stage, prod (India region). 
- CI/CD: automatic tests, linting, builds; tagged releases deploy.
- Backups and disaster recovery with periodic restore drills.
- Security controls: network isolation, secrets management, least‑privilege IAM.

Outcome
- Predictable releases, quick recovery, and controlled costs.

---

## 10) Security & Privacy — in practice

- Encryption in transit and at rest; sensitive fields encrypted in the app.
- OTP for patients; staff with MFA & device approval (roadmap).
- Strict validation; aggressive logging hygiene (no PHI in logs).
- Rate limits on auth; short‑lived tokens.

Result
- Strong protections without slowing daily work.

---

## 11) What you can measure (Reporting & Analytics)

- Bookings: requested, confirmed, completed, no‑shows.
- Revenue: gross, discounts, net.
- Clinical completion: signed visits with complete documentation.
- “Time to confirm” as a measure of patient experience.

Delivery
- Daily reports via background jobs; quick “today” snapshot for dashboards.

---

## 12) Growing with you (Future Extensibility)

- Multi‑clinic/tenant support when needed.
- Inventory and labs integrations.
- Wearables and remote monitoring.
- Rules engine with a visual builder.
- Data warehouse and ML‑assisted insights.

Approach
- Add modules and integrations without re‑architecting the core.

---

## 13) What’s next (MVP Backlog)

Three sprint outline (example)
- Sprint 1: Foundations — Auth (OTP), RBAC, Patients, basic scheduling, audit.
- Sprint 2: Clinical & Billing — Visits, SOAP, prescriptions, diet plans, invoices, payments, reminders.
- Sprint 3: Compliance & Polish — Refunds, addenda, device approval, reporting/KPIs, hardening.

Risks we’re already planning for
- Payment races → idempotency store; Slot contention → atomic locks; PHI leaks → scrubbing & reviews; Provider downtime → retries + fallbacks.

---

## Summary — Why this will work

- Operationally simple today; robust and extensible tomorrow.
- Secure by design, with auditable records and clear roles.
- Automation lifts the routine load; reporting keeps the team informed.
- Built specifically for Indian clinics and compliance needs.

Next step: Pick a pilot clinic, run the 3‑sprint plan, and iterate with real feedback.
