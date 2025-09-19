# Reporting & Analytics (MVP)

## Goals
Provide daily operational & financial KPIs + live lightweight snapshots without heavy OLTP impact.

## Core Metrics Definitions
| Metric | Definition |
|--------|-----------|
| appointments.requested | Count status Requested that day |
| appointments.confirmed | Count transitions to Confirmed (event-based) |
| appointments.completed | Count transitions to Completed |
| appointments.noShow | Count transitions to No-Show |
| revenue.gross | Sum invoice grandTotal where issuedAt day |
| revenue.discounts | Sum discountTotal |
| revenue.net | gross - discounts |
| visits.total | Count visits created |
| visits.documentedComplete | Count visits where signed & prescription exists & all SOAP sections non-empty |
| prescriptions.total | Count prescriptions issued |
| payments.failures | Count payments with status failed |
| bookingMedianSeconds | Median(confirmedAt - requestedAt) |

## Aggregation Pipeline (Daily)
1. Compute date boundaries [start, end).
2. Use `appointments` timeline fields for counts.
3. Use `invoices` for revenue sums.
4. Use `visits` + `prescriptions` join (lookup) to evaluate documentation completeness.
5. Compute median booking time using $setWindowFields or application merge.
6. Upsert into `report_daily` on completion.

## Live Snapshot Endpoint
- `/reports/kpis/today` queries raw counts with lightweight filters (not exact final) for dashboard.

## Data Flow
```
[Domain Writes] -> (Optionally emit raw event) -> Nightly Job -> report_daily
```

## Sample Pseudocode (Daily Job)
```ts
async function buildDailyReport(date: Date) {
  const start = startOfDay(date); const end = addDays(start,1);
  const appointments = await AppointmentModel.aggregate([ { $match: { createdAt: { $gte: start, $lt: end } } } ]); // refine per metric
  // TODO: implement specialized smaller queries per metric for efficiency
  // Compute metrics...
  await ReportDailyModel.updateOne({ date: start }, { $set: { metrics } }, { upsert: true });
}
```

## Export Capability
- Admin can request CSV export of daily metrics range -> compile from `report_daily`.

## Performance Considerations
- Limit pipeline memory usage; consider incremental updates after each transition (ROADMAP) if near real-time needed.

## Future Enhancements
- Cohort analysis (return visits, chronic adherence).
- Time-series store for vitals.
- Data warehouse ETL.

## TODO / Clarifications
- Confirm need for hour-level breakdown (currently daily only).
- Confirm whether invoice refunds adjust revenue.net retroactively (assumption: yes on refund day, separate metric for original day). 
