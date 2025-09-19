# Infrastructure & DevOps Plan

## Environments
| Env | Purpose | Data | Access |
|-----|---------|------|--------|
| dev | Developer shared sandbox | Synthetic | Engineers |
| stage | Pre-prod validation, restore drills | Masked subset | QA + Admin |
| prod | Live clinic | Real | Restricted |

## Cloud (Assumption AWS ap-south-1)
- VPC with public ALB -> private subnets for app nodes + MongoDB Atlas (peered) / or self-managed.
- S3 (encrypted) for documents & cold audit archives.
- KMS CMK for envelope encryption.

## Components
| Component | Initial | Scaling Path |
|-----------|--------|--------------|
| API App | 2x t3.small EC2 (ASG) | Horizontal scale / containerize (ECS Fargate) |
| MongoDB | Atlas M10 | Scale cluster tier / sharding |
| Job Worker | Same node process | Separate service + SQS queue |
| Cache (optional) | None | Redis (ElastiCache) for slot locks, rate limits |
| Metrics | CloudWatch basic | Prometheus + Grafana |
| Logs | CloudWatch Logs | Central ELK / OpenSearch |

## CI/CD (GitHub Actions)
Workflows:
- `lint-test-build.yml`: on PR -> run ESLint, Vitest, tsc.
- `deploy.yml`: on tagged release -> build Docker, push ECR, trigger deploy (CodeDeploy or ECS).

## Deployment Strategy
- Blue/green for API (two target groups behind ALB) or rolling if simple.
- DB migrations: idempotent scripts (Mongo change sets) executed pre-deploy.

## Secrets Management
- Use SSM Parameter Store or Secrets Manager for JWT_SECRET, DB creds, KMS key alias.
- Never commit secrets; `.env` only for local dev.

## Backups & DR
| Item | Strategy |
|------|----------|
| MongoDB | Atlas daily snapshot + PITR |
| S3 Docs | Versioning + replication (optional) |
| Audit Cold Storage | Daily export job -> S3 (GLACIER after 90d) |
| Restore Drill | Quarterly: stage environment restore from latest prod snapshot |
| RPO | 24h (PITR shrinks effectively) |
| RTO | 2h (re-provision app + restore DB snapshot) |

## Monitoring & Alerts
- Metrics: latency p95, error rate %, automation failure count, no-show job runtime.
- Alerts: Slack/Webhook if error rate >2% 5m window, automation failure spike, DB CPU >70% sustained.

## Security Controls
- Security groups restrict DB to app subnets.
- WAF (optional) for ALB (rate limiting OTP endpoints).
- IAM least privilege roles for EC2 & CI pipelines.
- Dependency scanning (Dependabot).

## Slot Locking (Future)
- Introduce Redis key `slot:{id}:lock` TTL 90s for highly concurrent scaling scenario.

## Logging Hygiene
- Structured JSON: { ts, level, requestId, actorId, route, msg }.
- Exclude PHI: never log SOAP fields, prescriptions, diagnoses text.

## Cost Optimization Early
- Rightsize to minimal instance counts, enable autoscaling with conservative thresholds.

## TODO / Clarifications
- Confirm self-managed vs Atlas DB.
- Confirm required compliance certifications (ISO/HIPAA-like) driving additional controls.
