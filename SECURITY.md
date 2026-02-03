# Security Guidance (pg-simple-mcp)

This repository is intentionally minimal. It demonstrates how to wire an MCP server to PostgreSQL with the fewest moving parts. **It is not intended for production use.**

## Why this is risky in production
This server:
- Accepts arbitrary SQL via `run_sql_query`.
- Runs with the same privileges as the configured database user.
- Runs on developer machines where supply‑chain risks (malicious extensions, compromised tooling) are real.

In production, this can lead to:
- Data exfiltration or unauthorized modification.
- Destructive queries (drops, deletes, mass updates).
- Privilege escalation via unsafe SQL or DB functions.
- Credential leakage if environment variables or config files are exposed.

## Safe‑use boundaries (recommended)
- **Use only in non‑production environments.**
- Use **read‑only database credentials** with least privileges.
- Restrict network access to the database (localhost or a private subnet).
- Avoid storing secrets in git, shell history, or shared config files.

## Secure‑by‑default upgraded version (best practice)
If you must use this in a production‑like context, implement **all** of the below:

### 1) Hard block risky SQL
- Allow **only SELECT** and EXPLAIN.
- Block multiple statements.
- Reject DDL/DML (INSERT/UPDATE/DELETE/ALTER/DROP).
- Enforce a query timeout.

### 2) Read‑only DB role + RLS
- Create a dedicated read‑only role with least privilege.
- Enable Row‑Level Security (RLS) if multi‑tenant data is present.

### 3) Parameterized queries only
- Expose a **query catalog** (predefined templates) instead of raw SQL.
- Require parameters and validate them strictly.

### 4) Audit logging
- Log who ran what, when, and from where.
- Ship logs to a centralized SIEM.

### 5) Network controls
- Run behind a private network boundary.
- Restrict database access to the MCP host.

### 6) Secrets hygiene
- Load secrets from a vault (not `.env`).
- Rotate credentials regularly.

### 7) Supply‑chain safeguards
- Lock dependencies and verify integrity.
- Run in a container with a minimal base image.
- Use allowlisted extensions on developer machines.

## Suggested “secure‑by‑default” tool design
- Replace `run_sql_query` with **query catalog** tools:
  - `list_tables` (read‑only metadata)
  - `describe_table` (read‑only metadata)
  - `run_catalog_query` (predefined SQL + params)
- Add a **policy layer** that validates:
  - Only SELECT
  - No subqueries touching restricted schemas
  - Strict row limits

## Bottom line
This repo is a **learning example**. Use it **only for non‑production** experimentation. If you need production access, build the upgraded version above or use a hardened service designed for controlled, audited query access.
