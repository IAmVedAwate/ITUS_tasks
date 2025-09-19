# Future Extensibility Notes

## Multi-Tenant Evolution
- Introduce gateway resolving tenant from subdomain / header.
- Shift from shared collection with tenantId to per-tenant database (scripted migration) when > N clinics or regulatory isolation required.

## Inventory Module
- Add collections: inventory_items, stock_batches, stock_movements.
- Hook prescription issue -> reserve stock; invoice payment -> decrement & movement record.
- Alerts for low stock via automation rule.

## Lab Integration
- External partner webhook -> map to orderId -> update statusTimeline.reportedAt; push abnormal flag evaluation.
- Structured lab results collection for numeric values enabling trend analytics.

## Wearables / Remote Monitoring
- Ingest device reading events into time-series collection `vitals_stream` (sharded by patientId + day).
- Aggregation service summarizing daily extremes & averages.

## Rules Engine DSL
- JSON/YAML driven condition tree: triggers (event|schedule) -> conditions -> actions.
- UI builder & versioned rule deployments.

## Group Visits / Multi-Provider
- Visit participants array referencing additional provider userIds.
- Authorization changes: each participant can add SOAP addenda.

## Telehealth Enhancements
- Video session lifecycle events (join/leave) -> analytics.
- Recording encryption & restricted playback.

## API Marketplace
- Public API keys with scoped permissions (read-only patient summaries) for partner apps.
- Quota + billing (usage-based) *(far roadmap)*.

## Data Warehouse
- Periodic CDC (Mongo change streams) -> Kafka -> ELT to warehouse (ClickHouse / BigQuery) for advanced queries.

## ML Opportunities
- No-show prediction model -> dynamic reminder intensity.
- Medication adherence risk scoring -> targeted interventions.

## Internationalization
- Locale-specific templates; translation key system; fallback chain.

## Plugin Architecture
- Event bus + extension registration objects injecting menu/actions.

## TODO / Clarifications
- Threshold for splitting services (appointments/day?).
- Prioritize inventory vs labs for first non-MVP expansion.
