# Appointment State Machine

States:
# Appointment State Machine

Authoritative definition of all allowed appointment lifecycle transitions. Any deviation must raise an audit event and be rejected at API level.

## States
| State | Description | Terminal? | Notes |
|-------|-------------|-----------|-------|
| Requested | Initial intent created; slot may or may not be held | No | Created by patient/front desk/bot |
| Tentative | Slot held pending prepayment or manual confirmation | No | Auto-expires (revert/cancel) |
| Confirmed | Booking finalized and reminders scheduled | No | Precondition for check-in |
| Checked-In | Patient arrived & validated | No | Triggers visit creation next step |
| In-Consult | Doctor actively consulting (visit open) | No | Visit draft in progress |
| Completed | Consultation + billing finished | Sometimes (may refund) | Output state for KPIs |
| No-Show | Patient absent beyond grace | Yes (override path) | Override only back to Checked-In |
| Cancelled | Booking withdrawn pre-service | Sometimes | May proceed to Refunded |
| Refunded | Financially reversed | Yes | Terminal |

## Transition Matrix
| From | To | Trigger Source | Allowed Roles | Core Guards | Side Effects |
|------|----|----------------|---------------|-------------|--------------|
| (null) | Requested | Create API | Patient, FrontDesk, Bot | Slot free & lock success | timeline.requestedAt |
| Requested | Tentative | Prepayment required policy | FrontDesk, System | Policy(prepay=true) | hold slot; start 90s TTL |
| Requested | Confirmed | Direct confirm | FrontDesk, System | Slot still free & not locked by others | schedule reminders |
| Tentative | Confirmed | Payment success webhook | System(payment), FrontDesk | Payment.status=captured | release hold; schedule reminders |
| Tentative | Cancelled | Hold expired | System | hold TTL expired & no payment | free slot |
| Requested | Cancelled | Patient cancel API | Patient, FrontDesk | within cancellation window | maybe start refund (if prepaid) |
| Confirmed | Checked-In | QR scan / manual | Patient (self), FrontDesk | currentTime within visit window | set timeline.checkedInAt; create visit doc |
| Checked-In | In-Consult | Doctor opens visit | Doctor | visit exists & not signed | timeline.inConsultAt |
| In-Consult | Completed | Visit sign-off + billing closure | Doctor (+Billing) | visit.signed=true & invoice.status in allowed | timeline.completedAt; emit EVENT_COMPLETED |
| Confirmed | No-Show | Grace timer job | System | now > slot.start+grace & not checked-in | timeline.noShowAt |
| No-Show | Checked-In | Late arrival override | FrontDesk, Admin | within override window | append override flag |
| Confirmed | Cancelled | Cancel request | Patient, FrontDesk, Doctor | outside grace or policy override | refund if paid |
| Cancelled | Refunded | Refund processed | Accounts/Admin, System | payment captured & not yet refunded | create refund payment |
| Completed | Refunded | Exceptional refund | Admin | approval record exists | reverse ledger |
| Confirmed | Refunded | Pre-service, paid cancellation | Accounts/Admin | service not started | reverse ledger |

## Timing & Automation Rules
| Rule | Description | Config Key | Default |
|------|-------------|-----------|---------|
| autoNoShow | Mark Confirmed to No-Show after grace | scheduling.noShowGraceMinutes | 15 |
| holdExpire | Tentative hold to Cancelled | scheduling.holdSeconds | 90 |
| cancelRefundWindow | Full refund window before start | billing.fullRefundHours | 4 |
| lateOverride | No-Show override allowed window | scheduling.noShowOverrideMinutes | 60 |

## Invariants
- Single slot → max one non-terminal appointment.
- Visit created exactly once on Checked-In → In-Consult path.
- Completion requires: visit.signed AND invoice.status in ['paid','partial'(if config.allowPartialComplete=true)].
- Refunded implies matching credit ledger entries sum to refunded amount.

## Enforcement (Implementation Notes)
```ts
// src/state/appointmentState.ts (sketch)
export const AllowedTransitions: Record<string, { to: string; roles: string[]; guard: string; sideEffects: string[] }[]> = { /* ... */ };
```
Guard evaluation performs atomic `findOneAndUpdate` with `{ _id, status: from, ...dynamicConditions }`.

## Domain Events
- APPOINTMENT_CONFIRMED
- APPOINTMENT_CHECKED_IN
- APPOINTMENT_COMPLETED
- APPOINTMENT_NO_SHOW
- APPOINTMENT_REFUNDED

Each event includes: `{ appointmentId, patientId, doctorId, from, to, occurredAt, requestId }`.

## Audit Logging
On success store audit event diff (from.status -> to.status) + actor + requestId.
On failure respond `409` with code `INVALID_TRANSITION` or `GUARD_FAILED`.

## TODO / Clarifications
- Configurable partial payment allowance threshold for completion (assumed: any partial allowed if remaining <= 10% invoice total) // TODO implement.
- Distinguish Cancelled due to hold expiry vs user action (add `cancelReason`). // TODO add field.
- Determine if reschedule uses new appointment or modifies existing (assumption: new appointment with `rescheduleOf`). // TODO confirm.

## State Diagram
```
Requested --> Tentative --> Confirmed --> Checked-In --> In-Consult --> Completed
    |          |   |              ^              |
    |          |   |              |              v
    |          |   |              |           Refunded
    |          |   v              |              ^
    |          | Cancelled --> Refunded          |
    v          |                                  |
 Cancelled <---                                   |
        \________________________________________/
          (Refund paths)

Confirmed --(grace)--> No-Show --(override)--> Checked-In
```

|-------|------------|
| APPOINTMENT_CONFIRMED | Schedule T-24h & T-2h reminders |
| APPOINTMENT_CHECKED_IN | Start visit drafting timeout monitor *(TODO)* |
| APPOINTMENT_NO_SHOW | Send reschedule link notification |
| APPOINTMENT_COMPLETED | Send summary + feedback request |
| APPOINTMENT_REFUNDED | Send refund confirmation |

## Open TODOs
- Configurable per-doctor grace override (some may want 10m vs 15m).
- Group appointments *(ROADMAP)*.
- Bulk reschedule (holiday closure scenario) process design.
