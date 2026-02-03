#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import * as dotenv from "dotenv";
import { Pool } from "pg";

dotenv.config();

const requiredEnv = ["PG_HOST", "PG_PORT", "PG_USER", "PG_PASSWORD", "PG_DATABASE"] as const;
for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing required env var: ${key}`);
  }
}

const pool = new Pool({
  host: process.env.PG_HOST,
  port: parseInt(process.env.PG_PORT as string, 10),
  user: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
});

const tools = [
  {
    name: "run_sql_query",
    description: "Execute a SQL query against the connected PostgreSQL database.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string" },
      },
      required: ["query"],
      additionalProperties: false,
    },
  },
  {
    name: "list_tables",
    description: "List all tables in the current database schema.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "describe_table",
    description: "Describe the columns and types of a given table.",
    inputSchema: {
      type: "object",
      properties: { table: { type: "string" } },
      required: ["table"],
      additionalProperties: false,
    },
  },
];

class PgVectorMcpServer {
  private server = new Server({ name: "pg-vector-mcp", version: "0.1.0" }, { capabilities: { tools: {} } });

  constructor() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));
    this.server.setRequestHandler(CallToolRequestSchema, async (req) => {
      const name = req.params.name;
      const args = (req.params.arguments ?? {}) as Record<string, any>;
      try {
        switch (name) {
          case "run_sql_query": {
            const { query } = args;
            if (!query) throw new McpError(ErrorCode.InvalidParams, "Query is required");
            const result = await pool.query(query);
            return { content: [{ type: "text", text: JSON.stringify(result.rows, null, 2) }] };
          }
          case "list_tables": {
            const result = await pool.query(`
              SELECT table_name
              FROM information_schema.tables
              WHERE table_schema = 'public'
              ORDER BY table_name;
            `);
            return { content: [{ type: "text", text: JSON.stringify(result.rows, null, 2) }] };
          }
          case "describe_table": {
            const { table } = args;
            if (!table) throw new McpError(ErrorCode.InvalidParams, "Table name is required");
            const result = await pool.query(`
              SELECT column_name, data_type, is_nullable
              FROM information_schema.columns
              WHERE table_name = $1;
            `, [table]);
            return { content: [{ type: "text", text: JSON.stringify(result.rows, null, 2) }] };
          }
          default:
            throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
        }
      } catch (err: any) {
        console.error("Error executing tool:", err);
        return { content: [{ type: "text", text: `Error: ${err.message}` }], isError: true };
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("pg-vector MCP server running on stdio");
  }
}

new PgVectorMcpServer().run().catch(console.error);
