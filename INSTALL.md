# Install & Configure (VS Code + Copilot MCP)

## 1) Install dependencies
```bash
cd /Users/mike/fupgle/pg-simple-mcp
npm install
```

## 2) Build
```bash
npm run build
```

## 3) Provide environment variables
Create a `.env` file in `pg-simple-mcp/`:
```bash
PG_HOST=your-db-host
PG_PORT=5432
PG_USER=your-user
PG_PASSWORD=your-password
PG_DATABASE=your-db
```

## 4) Configure MCP in VS Code
Use either an MCP config file (see `mcp.json`) or add this to User Settings / Workspace Settings (`settings.json`).

Example (settings.json):
```json
{
  "mcp.servers": {
    "fupgle": {
      "type": "stdio",
      "command": "node",
      "args": ["/path/to/fupgle/pg-simple-mcp/build/index.js"],
      "env": {
        "PG_HOST": "your-db-host",
        "PG_PORT": "5432",
        "PG_USER": "your-user",
        "PG_PASSWORD": "your-password",
        "PG_DATABASE": "your-db"
      }
    }
  }
}
```

Example (mcp.json):
```json
{
  "servers": {
    "fupgle": {
      "type": "stdio",
      "command": "node",
      "args": ["/path/to/fupgle/pg-simple-mcp/build/index.js"],
      "env": {
        "PG_HOST": "localhost",
        "PG_PORT": "5432",
        "PG_USER": "your-user",
        "PG_PASSWORD": "your-password",
        "PG_DATABASE": "your-db"
      }
    }
  },
  "inputs": []
}
```

## 5) Validate
Restart VS Code and open Copilot Chat. You should see tools:
- `list_tables`
- `describe_table`
- `run_sql_query`

## Notes
- Use read‑only DB credentials where possible.
- If you prefer `.env`, you can omit the `env` block and rely on the local file.
