# API Surface (MVP) v1
Base Path: `/api/v1`
Auth: JWT (staff) / OTP session token (patient). All responses JSON unless file download.

## Conventions
- Idempotency: Payment capture & booking confirm endpoints accept `Idempotency-Key` header (TODO implement store).
- Errors: `{ error: true, code, message, details? }` with HTTP status.
- Pagination: `?page=1&limit=20` returns `{ data, page, limit, total }`.
- Date-times ISO 8601 UTC.

## Auth & Session
| Method | Path | Description |
|--------|------|-------------|
| POST | /auth/patient/otp/request | Request OTP (rate limited) |
| POST | /auth/patient/otp/verify | Verify OTP -> session token |
| POST | /auth/staff/login | Staff login email/password |
| POST | /auth/staff/refresh | Rotate refresh token (TODO) |
| POST | /auth/logout | Invalidate tokens |

## Patients
| Method | Path | Description |
|--------|------|-------------|
| POST | /patients | Create patient (frontdesk/self) |
| GET | /patients/:id | Get patient (role filtered fields) |
| PATCH | /patients/:id | Update demographics (allowed roles) |
| GET | /patients | Search (phoneHash, name) |
| GET | /patients/:id/consents | List consents |
| POST | /patients/:id/consents | Add new consent version |

## Documents
| Method | Path | Description |
|--------|------|-------------|
| POST | /documents | Upload metadata -> pre-signed URL (TODO) |
| GET | /documents/:id | Get metadata (access check) |
| GET | /documents/:id/download | Download stream (audit) |
| POST | /documents/:id/share | Create expiring share link |

## Scheduling / Appointments
| Method | Path | Description |
|--------|------|-------------|
| GET | /slots?doctorId&date | List available slots |
| POST | /appointments | Create (Requested) |
| POST | /appointments/:id/confirm | Transition to Confirmed/Tentative logic |
| POST | /appointments/:id/check-in | Check-In |
| POST | /appointments/:id/start-consult | To In-Consult |
| POST | /appointments/:id/complete | Complete (requires invoice state) |
| POST | /appointments/:id/cancel | Cancel |
| POST | /appointments/:id/override-no-show | No-Show -> Checked-In |
| GET | /appointments/:id | Get appointment |
| GET | /appointments | Query by filters |

## Visits & Clinical
| Method | Path | Description |
|--------|------|-------------|
| GET | /visits/:id | Get visit (role filtered) |
| POST | /visits/:id/soap | Append / update draft section |
| POST | /visits/:id/sign-off | Sign & lock visit |
| POST | /visits/:id/addendum | Add addendum after sign-off |

## Prescriptions
| Method | Path | Description |
|--------|------|-------------|
| POST | /visits/:id/prescriptions | Issue prescription (new version) |
| GET | /prescriptions/:id | Get prescription |
| GET | /patients/:id/prescriptions | List patient prescriptions |

## Diet Plans
| Method | Path | Description |
|--------|------|-------------|
| POST | /visits/:id/diet-plans | Issue diet plan |
| GET | /diet-plans/:id | Get plan |
| POST | /diet-plans/:id/adherence | Update patient adherence (self) |

## Orders
| Method | Path | Description |
|--------|------|-------------|
| POST | /visits/:id/orders | Create orders |
| PATCH | /orders/:id/status | Update status (collected/reported/reviewed) |
| GET | /orders/:id | Get order |

## Billing & Payments
| Method | Path | Description |
|--------|------|-------------|
| POST | /invoices | Create draft invoice |
| GET | /invoices/:id | Get invoice |
| PATCH | /invoices/:id | Update line items (allowed roles) |
| POST | /invoices/:id/issue | Issue invoice (locks) |
| POST | /invoices/:id/pay | Record payment (cash) |
| POST | /invoices/:id/payment-link | Create payment link (gateway) |
| POST | /payments/webhook/razorpay | Webhook endpoint (idempotent) |
| POST | /payments/:id/refund | Refund payment |

## Reporting
| Method | Path | Description |
|--------|------|-------------|
| GET | /reports/daily?date= | Daily metrics |
| GET | /reports/kpis/today | Live snapshot (approx) |

## Notifications / Automation
| Method | Path | Description |
|--------|------|-------------|
| GET | /notifications/:id | Status |
| POST | /automation/replay | Replay failed automation event (admin) |

## Admin / Users
| Method | Path | Description |
|--------|------|-------------|
| GET | /users | List staff |
| POST | /users | Create staff user |
| PATCH | /users/:id | Update role / activate |
| POST | /devices/:id/approve | Approve device |

## Error Codes (Representative)
| Code | Meaning |
|------|---------|
| INVALID_TRANSITION | State machine guard failed |
| SLOT_LOCK_FAILED | Could not acquire slot hold |
| DUPLICATE_APPOINTMENT | Similar existing appointment in window |
| VALIDATION_ERROR | Input failed schema validation |
| UNAUTHORIZED | Missing/invalid auth |
| FORBIDDEN | Lacking permission |
| NOT_FOUND | Resource absent |
| PAYMENT_FAILURE | Gateway declined |
| REFUND_NOT_ALLOWED | Policy restriction |

## TODO
- Pagination & filtering specifics per list endpoint.
- Webhook signature verification details.
- Pre-signed upload process for documents.
- Version negotiation header design (future GraphQL gateway).
