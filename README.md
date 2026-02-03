# fupgle (pg-simple-mcp)

A minimal MCP server that exposes PostgreSQL to VS Code/Copilot with three tools:
- `list_tables`
- `describe_table`
- `run_sql_query`

## Why this exists
This repo is intentionally small so teams can see how fast MCP unlocks data exploration inside VS Code/Copilot.

## What it does
- Connects to Postgres via environment variables
- Registers three tools over stdio
- Returns JSON results to the MCP client

## Tools
- **list_tables** — list tables in `public`
- **describe_table** — list columns for a table
- **run_sql_query** — run arbitrary SQL

## Security and credentials
All connection details are required via environment variables. No credentials are hard‑coded in the repo.

## Project layout
- `pg-simple-mcp/src/index.ts` — TypeScript source
- `pg-simple-mcp/build/index.js` — compiled output
- `mcp.json` — example MCP server config (sanitized)

## Quick start
See INSTALL.md for setup and VS Code configuration. A sanitized example MCP config is in `mcp.json` (server name: `fupgle`).
