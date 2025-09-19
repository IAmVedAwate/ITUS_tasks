# Security & Privacy Controls

## Objectives
Protect PHI & PII, satisfy DPDP expectations, minimize breach blast radius, enable auditability.

## Data Classification
| Class | Examples | Protection |
|-------|----------|-----------|
| PHI | diagnoses, prescriptions, vitals | Field encryption + access controls |
| PII | phone, email, name | Hash (lookup) + encryption |
| Operational | appointment status, invoice totals | Standard controls |
| Secrets | JWT secret, gateway keys | KMS + secret manager |

## Encryption
- At Rest: MongoDB encrypted volume + application-level AES-256-GCM for PHI fields.
- In Transit: HTTPS (TLS1.2+); HSTS.
- Field Encryption Helper: `encryptField(value)` / `decryptField(value)` wrappers; store `ciphertext:base64|iv|tag` format.

## Key Management
- Master key in KMS (alias: `clinic/phi`), data keys derived & cached in-memory with TTL.
- Key rotation: quarterly generate new data key; re-encrypt lazily on read (write-back).

## Authentication
- Patients: OTP (6-digit, 5 attempts, TTL 5m) -> short-lived session token (24h) limited scopes.
- Staff: Email/password (bcrypt cost 12) + MFA for roles admin/accounts; session tokens 15m + rotating refresh 7d.

## Device Approval (Staff)
- First login from new device -> device record approved=false -> limited access -> admin approval endpoint.

## Authorization
- RBAC policies (see policies registry) + ownership checks.
- Deny by default; log structured denial (sampled) with code.

## Session Management
- JWT short lived; refresh endpoint rotates tokens and invalidates prior refresh (token family store - TODO store).
- Logout blacklist approach (cache) or short expiry fallback.

## Input Validation & Sanitization
- Joi schemas per endpoint.
- Reject unexpected fields (stripUnknown).

## Rate Limiting
- OTP endpoints: 5/min per phoneHash, 15/day.
- Auth failures: incremental backoff.
- Reminder dispatch: global throttle to respect provider limits.

## Logging & Monitoring
- PHI scrubbing middleware scans payload keys: ['soap','diagnoses','prescriptions'].
- Access logs separate from application logs.
- Security events metric counters (login failures, device approvals).

## Vulnerability Management
- Weekly dependency scan (Dependabot).
- Quarterly penetration test (external) *(ROADMAP)*.

## Backup & Restore
- See Infra plan; encrypted snapshots & test restores.

## Data Minimization
- Only store required intake fields; optional extended fields separate collection *(ROADMAP: patient_extended).* 

## Privacy Rights Handling
- Patient export: compile summary (demographics + visit summaries) – endpoint TBD.
- Patient delete (soft): mask PII (replace encrypted phone/email w/ deletion marker) + mark deletedAt.

## Incident Response (Outline)
1. Detect anomaly (alert). 2. Triage & classify severity. 3. Contain (revoke tokens, rotate keys). 4. Eradicate (patch). 5. Recover (restore service). 6. Post-mortem & audit export.

## TODO / Clarifications
- Confirm need for data residency attestation docs.
- Confirm patient right-to-erasure specifics under DPDP (likely pseudonymization rather than full delete).
