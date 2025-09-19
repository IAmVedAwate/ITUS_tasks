# Data Model & Mongo Schema Draft

> NOTE: Field-level encryption (FLE) annotation: (FLE) suffix. Hashed fields indicated. All `_id` are ObjectId unless noted. `tenantId` reserved.

## Collections Overview
- patients
- consents
- documents
- slots
- appointments
- visits
- prescriptions
- diet_plans
- orders
- invoices
- payments
- ledger_entries
- audit_events
- automation_events
- notifications_outbox
- report_daily
- users
- devices
- otp_tokens
- waitlist_locks

---
### patients
```
{
  _id, // patientId
  tenantId,
  phoneHash, // SHA-256(salt + phone) (indexed, unique)
  phoneEncrypted (FLE),
  emailEncrypted (FLE, optional),
  name: { first, last },
  dob: Date, // or ageYears if unknown
  gender, // enum
  city,
  allergies: [ { substance, reaction, severity } ] (FLE),
  chronicConditions: [string],
  ongoingMedications: [ { name (FLE), dose, freq } ],
  emergencyContact: { name, phone },
  flags: { vip: Boolean, blocked: Boolean },
  consents: [ { consentId, version, signedAt } ],
  createdAt, updatedAt, deletedAt?
}
```
Indexes:
- phoneHash unique
- tenantId + name.last

### consents
```
{ _id, tenantId, patientId, type, version, textHash, fileId (document reference), signedAt, revokedAt? }
```
Indexes: patientId + type (latest retrieval)

### documents
```
{ _id, tenantId, ownerType, ownerId, category, version, storageKey, mime, size, checksum, createdBy, createdAt, tags: [string], shareLinks: [ { tokenHash, expiresAt, createdAt, lastAccessAt } ] }
```
Indexes: ownerType+ownerId, shareLinks.expiresAt (TTL)

### slots
```
{ _id, tenantId, doctorId, date, start, end, status: 'free'|'held'|'booked'|'blocked', holdExpiresAt?, meta: { visitType, bufferBefore, bufferAfter } }
```
Indexes: doctorId+date, status, holdExpiresAt (TTL for cleanup)

### appointments
```
{ _id, tenantId, patientId, doctorId, slotId, visitType, reason, channel, status, timeline: { requestedAt, confirmedAt, checkedInAt, inConsultAt, completedAt, noShowAt, cancelledAt, refundedAt }, notes, waitlistOrigin?, rescheduleOf?, followUpFor?, createdBy, updatedAt }
```
Indexes: patientId+status, doctorId+status+timeline.requestedAt, status+timeline.noShowAt

### visits
```
{ _id, tenantId, appointmentId, patientId, doctorId, status: 'draft'|'signed', soap: { versions: [ { v, s, o, a, p, createdAt, createdBy } ], signedVersion?, lockedAt? }, diagnoses: [ { code?, text (FLE), primary? } ], vitals: [ { type, value (FLE), unit, collectedAt } ], services: [ { code, description, quantity, unitPrice } ], followUp: { recommendedAt?, intervalDays? }, createdAt, updatedAt }
```
Indexes: patientId+createdAt, doctorId+createdAt

### prescriptions
```
{ _id, tenantId, visitId, patientId, doctorId, version, supersedes?, items: [ { drugId?, name (FLE), strength, route, dose, frequency, durationDays, instructions, genericAllowed, refill: { allowed: Boolean, remaining, intervalDays? } } ], allergyFlags: [ { itemName, type } ], issuedAt, signedHash, qrData }
```
Indexes: patientId+issuedAt, visitId

### diet_plans
```
{ _id, tenantId, visitId, patientId, doctorId, version, supersedes?, templateId?, macros: { calories?, protein?, carbs?, fat? }, schedule: [ { day, meals: [ { label, items: [ { name, qty, unit } ], adherence?: Boolean } ] } ], adherenceSummary: { completedDays, lastUpdated }, issuedAt }
```
Indexes: patientId+issuedAt

### orders
```
{ _id, tenantId, visitId, patientId, doctorId, type: 'lab'|'imaging'|'procedure', items: [ { name, code?, panel? } ], statusTimeline: { orderedAt, collectedAt?, reportedAt?, reviewedAt?, patientNotifiedAt? }, abnormalFlag?, attachments: [documentId], notes }
```
Indexes: patientId+type, statusTimeline.reportedAt

### invoices
```
{ _id, tenantId, patientId, visitId?, appointmentId?, number, status: 'draft'|'issued'|'partial'|'paid'|'refunded', lineItems: [ { type: 'consult'|'service'|'lab'|'med'|'package', refId?, description, quantity, unitPrice, taxRate, discountAmount?, total } ], subtotal, taxTotal, discountTotal, grandTotal, balanceDue, paymentsApplied: [paymentId], issuedAt, paidAt, refundedAt?, createdAt, updatedAt }
```
Indexes: patientId+status, number unique

### payments
```
{ _id, tenantId, invoiceId, method: 'upi'|'card'|'cash'|'link', amount, currency: 'INR', status: 'pending'|'captured'|'failed'|'refunded'|'partial', gateway: { provider, orderId?, paymentId?, refundId? }, split?: [ { method, amount } ], ledgerImpact: [ ledgerEntryId ], createdAt, updatedAt }
```
Indexes: invoiceId, status+createdAt

### ledger_entries
```
{ _id, tenantId, patientId, invoiceId?, paymentId?, type: 'debit'|'credit', amount, currency, description, createdAt }
```
Indexes: patientId+createdAt

### audit_events
```
{ _id, tenantId, ts, actor: { id, role }, entity: { collection, id }, action: 'create'|'update'|'delete'|'soft-delete'|'restore'|'sign-off'|'state-transition', from?, to?, diff: { added, updated, removed }, requestId, ip, userAgent, hash }
```
Indexes: entity.collection+entity.id, actor.id+ts

### automation_events
```
{ _id, tenantId, rule, entityRef: { type, id }, scheduledFor, executedAt?, status: 'pending'|'success'|'failed'|'cancelled', attempts, lastError?, dedupeKey }
```
Indexes: rule+scheduledFor, dedupeKey unique

### notifications_outbox
```
{ _id, tenantId, channel: 'whatsapp'|'sms'|'email', template, to, payload, status: 'pending'|'sent'|'failed', attempts, lastError?, scheduledFor?, sentAt }
```
Indexes: status+scheduledFor

### report_daily
```
{ _id, tenantId, date, metrics: { appointments: { requested, confirmed, completed, noShow }, revenue: { gross, discounts, net }, visits: { total, documentedComplete }, prescriptions: { total }, dietPlans: { total }, payments: { failures }, bookingMedianSeconds } }
```
Indexes: date, tenantId+date

### users
```
{ _id, tenantId, role: 'patient'|'frontdesk'|'doctor'|'pharmacy'|'accounts'|'admin', email?, passwordHash?, phoneHash?, phoneEncrypted?, name, mfa: { enabled, secret? }, deviceApprovalRequired, active, createdAt, updatedAt }
```
Indexes: role, email unique, phoneHash

### devices
```
{ _id, tenantId, userId, fingerprintHash, approved, firstSeenAt, lastSeenAt, revokedAt? }
```
Indexes: userId+fingerprintHash unique

### otp_tokens
```
{ _id, phoneHash, otpHash, expiresAt, attempts, consumedAt? }
```
Indexes: phoneHash, expiresAt (TTL)

### waitlist_locks
```
{ _id, tenantId, slotId, patientId, expiresAt }
```
TTL index on expiresAt

---
## Embedding vs Referencing Rationale
- **Visits** reference prescriptions, diet plans: avoid visit doc bloat with version history & large arrays.
- **Vitals** embedded in visit: limited cardinality per visit; quick retrieval with clinical note.
- **Line Items** embedded in invoice: atomic billing snapshot.
- **Audit events** separate to keep write path independent and to allow cold storage moves.

## Index Strategy (Initial)
- Critical latency paths: patient lookup (phoneHash); appointment slot search (doctorId+date); invoice number.
- Background review after first 2 weeks of prod metrics (TODO add index review job spec).

## Encryption Strategy
- Implement application-level encryption wrappers (Lib: crypto + AES-256-GCM) before persisting FLE fields (TODO evaluate Mongo Client-Side FLE vs manual for operational simplicity MVP).

## Versioning Strategy
- SOAP: incrementing integer `v` in versions array; signedVersion pointer.
- Prescription & Diet Plan: separate documents with `supersedes` chain.

## Soft Delete
- Add optional `deletedAt` & audit event action 'soft-delete'. Queries exclude by default using repository helper.

## Future Multi-Tenant Path
- Add compound indexes prefixing with tenantId where query isolation required.
- If per-tenant DB: remove tenantId & rotate connection by context middleware.

## Open TODO / Clarifications
- Exact maximum document size expectations for large diet plan templates.
- Evaluate time-series collection for vitals if analytics becomes heavy.

