# Automation Rules Engine (MVP)

## Philosophy
Deterministic, idempotent, auditable. Hard-coded catalog MVP; pluggable DSL later.

## Rule Catalog (Initial)
| Rule Key | Trigger Type | Description | Action |
|----------|--------------|-------------|--------|
| reminder.t24 | scheduled (cron enqueue) | 24h before appointment start | send reminder w/ confirm/reschedule links |
| reminder.t2 | scheduled | 2h before start | send enriched reminder (map pin / tele link) |
| booking.hold.expire | scheduled sweep | Expire Tentative holds | cancel + free slot |
| appointment.auto.no_show | scheduled sweep | Mark no-show after grace | transition -> No-Show |
| payment.link.retry | event+delay | Link unpaid 10m later | resend link once |
| lab.result.abnormal | inbound event | Abnormal lab posted | notify doctor & block patient view until review |
| chronic.followup.schedule | patient tag added | Chronic condition DM/HTN | schedule future appointment draft |

## Data Structures
- `automation_events`: persistence of scheduled tasks.
- `notifications_outbox`: channel-specific messages.

## Event Flow Example
1. Appointment Confirmed -> emit domain event.
2. Scheduler inserts two automation_events (t24, t2) with `scheduledFor` timestamps.
3. Worker polls due tasks (index on scheduledFor) every minute.
4. Executes handler; sets status success or failed (with lastError & attempts++).

## Handler Interface
```ts
interface AutomationHandler {
  key: string;
  schedule?(domainEvent: DomainEvent, ctx: Ctx): Promise<AutomationEvent[]>; // for event-driven scheduling
  execute(event: AutomationEvent, ctx: Ctx): Promise<void>;
  dedupe?(event: AutomationEvent): string; // returns dedupe key for uniqueness
}
```

## Idempotency
- Each automation event has `dedupeKey`; unique index prevents duplicates.
- Execution must re-check current entity state (e.g., skip reminder if appointment already Completed/Cancelled).

## Retry Strategy
- On transient failure: exponential backoff: attempt 1 -> +2m, attempt 2 -> +10m, attempt 3 -> mark failed & escalate.
- Escalation: create notification to frontdesk channel or log metric.

## Scheduling Resolution
- Minimum resolution 1 minute (cron worker tick). Real-time triggers publish immediately (e.g., abnormal lab).

## Pseudocode (Worker Loop)
```ts
async function processDue(now = new Date()) {
  const due = await AutomationEvent.find({ status: 'pending', scheduledFor: { $lte: now } }).limit(100);
  for (const ev of due) {
    const handler = handlers[ev.rule];
    if (!handler) continue; // log
    try {
      await handler.execute(ev, ctx);
      await ev.updateOne({ status: 'success', executedAt: new Date() });
    } catch (e) {
      const next = computeRetry(ev);
      await ev.updateOne({ status: next.status, attempts: ev.attempts + 1, lastError: e.message, scheduledFor: next.nextRun });
    }
  }
}
```

## Observability
- Metrics: `automation_events_pending`, `automation_failures_total{rule}`.
- Audit: rule executions not logged unless they mutate state; reminders create notification records (already audited separately via outbox insert).

## Security
- No PHI in reminder payload beyond minimal (patient first name, date/time). Detailed clinical info never sent automatically.

## TODO / Clarifications
- Quiet hours window (suppress non-urgent notifications) default assumption: 22:00–07:00 local.
- Payment retry count >1? (Current: only one resend.)
- Chronic follow-up auto scheduling deferred? (Mark as ROADMAP if not MVP).
