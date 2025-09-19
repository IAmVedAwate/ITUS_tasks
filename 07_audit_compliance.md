# Audit & Compliance Design

## Objectives
- Immutable chronological record of all security & business critical changes.
- Low overhead write path; scalable archival (>3 years retention).
- Support forensic reconstruction & regulatory export (JSON/CSV bundle).

## Scope of Audited Actions
| Category | Actions |
|----------|---------|
| CRUD | create, update, soft-delete, restore |
| State | state-transition (appointments) |
| Clinical | visit.sign-off, prescription.issue, dietplan.issue, addendum.create |
| Security | auth.login.success/failure, auth.role-change, device.approve, password.reset |
| Billing | invoice.issue, payment.capture, payment.refund |
| Sharing | document.share.create, document.share.access |
| Authorization | authorization-denied (optional sampling) |

## Event Schema
```
{
  _id,
  tenantId,
  ts: Date,
  actor: { id, role },
  entity: { collection, id },
  action: string,
  from?: any,        // prior primitive state snapshot (selected fields)
  to?: any,          // new values (selected fields)
  diff?: { added, updated, removed },
  meta?: { requestId, ip, userAgent, reason?, override? },
  hash: string,      // SHA-256 canonical JSON of core fields for tamper detection
  chainPrev?: string // hash of previous event (per entity chain) *(ROADMAP)*
}
```
Selection rules: only record changed fields (field allowlist) to prevent PHI leakage beyond necessity; PHI enc still stored encrypted.

## Write Path
- Synchronous fire-and-forget insert to `audit_events` with minimal transformation.
- If insert fails (rare), log error with fallback transient queue (in-memory ring) *(ROADMAP persistent).* 

## Redaction Strategy
- Do not store full clinical note text diffs; only store signature hash & version number for sign-off event.
- For patient updates, only changed fields included.

## Integrity
- Hash is computed over: `{ts, actor.id, entity.collection, entity.id, action, diff}`.
- Optional chain linking for entity-level tamper detection (future feature).

## Retention & Archival
| Age | Storage | Action |
|-----|---------|--------|
| 0-12 months | Hot (primary cluster) | Full index |
| 12-36 months | Warm (compressed cluster / cheaper tier) | Drop secondary indexes except entity.id + ts |
| >36 months | Cold storage (S3 JSON lines, encrypted) | Purge from DB |

Archival job: nightly batch exporting `ts < now - 36m`.

## Export
- Admin endpoint `/admin/audit/export?from&to&actor&entity` -> async job -> signed URL.
- Format: NDJSON (one JSON per line) + manifest (counts, hash-of-hashes).

## Pseudocode (Writer)
```ts
export async function audit({ actor, entity, action, diff, meta }: AuditInput) {
  const ts = new Date();
  const payload = { tenantId: meta.tenantId, ts, actor, entity, action, diff, meta: { ...meta, requestId: meta.requestId } };
  payload.hash = sha256Canonical(payload);
  await AuditModel.create(payload); // fire & forget (no await) optional
}
```

## Sampling Denials
- To avoid noise, only sample every Nth authorization-denied, configurable.

## Compliance Mapping
| Requirement | Implementation |
|-------------|----------------|
| Immutable log | No update/delete on audit collection; DB user denies writes except insert |
| Exportable | Export job + NDJSON |
| Retention | Scheduled archival + removal |
| Tamper resistance | Hash + optional chain prev |
| Privacy | Field diff allowlist; PHI encrypted |

## TODO / Clarifications
- Exact list of PHI fields to exclude vs encrypted inclusion.
- Whether to include IP address for patient OTP requests (assumption: YES).
- Need digital signature of exported manifest? (Assumption: SHA-256 + stored separately) // TODO.
