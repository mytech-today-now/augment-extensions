# Operation and adoption

Run explicit setup in project scope, inspect the dry-run first when desired, and read doctor fields independently. Installed software and valid config do not imply credentials, verified connectivity, or live activation. Keep TYPESAFE_API_KEY in the environment. Never print it or put it in files, exports, receipts, traces, or fixtures.

Choose offline fixtures or live calls explicitly. Live mode needs provider data policy enabled and an explicit request budget. SDK retries are disabled so one reservation authorizes at most one HTTP attempt. Persist reservations before requests and worker attempts. Unknown provider and cache costs remain null. Request and duration bounds are practical controls; no provider-enforced monetary cap is claimed.

Use durable queued, claimed, verifying, completed, review, failed, cancelled, exhausted and verification-failed outcomes. A handoff file is pending work until consumed and independently verified. Serialize writers. Refuse live lock takeover; inspect stale recovery claims. Resume retains attempts, request reservations and original wall-clock deadline. Reconcile uncertain local effects before retrying. Never retry uncertain external effects without their own idempotency and receipt protocol.

Workers cannot edit acceptance criteria through their returned output. The controller verifies artifact content, size and source digests. Confident completion proposals require a separate verifier. Cancellation stops owned subprocesses; custom workers must not detach external work.

Inventory current calls as generation, judgment or deterministic logic. Adopt one frequent judgment first. Inspect a local probe or the provider playground, run the labeled dispatcher cases, connect real workers, compare matched tasks, and inspect held-out cases before changing policy. Explicitly promote a new policyVersion only after measured completion, cost, latency and escalation outcomes justify it. Use the seven-day observation protocol in the README. Do not invent longitudinal results.

Keep runtime state in .augx-decision. Static exports and mirrors contain these rules only. Never copy queues, credentials, receipts, traces or live task snapshots into rule surfaces.
