#!/usr/bin/env node
import crypto from "node:crypto";
import readline from "node:readline";

function canonicalizeJCS(value) {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return "[" + value.map(canonicalizeJCS).join(",") + "]";
  }
  const keys = Object.keys(value).sort();
  return "{" + keys.filter(k => value[k] !== undefined).map(k => JSON.stringify(k) + ":" + canonicalizeJCS(value[k])).join(",") + "}";
}

const TOOLS = [
  {
    name: "verify_rfc8785_receipt",
    description: "Canonicalize a JSON payload per RFC-8785 (JCS) and compute its deterministic SHA-256 digest.",
    inputSchema: {
      type: "object",
      properties: {
        payload: { type: "object", description: "JSON object to canonicalize per RFC-8785" }
      },
      required: ["payload"]
    }
  },
  {
    name: "audit_x402_endpoint",
    description: "Inspect an HTTP 402 (x402) endpoint's PAYMENT-REQUIRED header and CORS exposure without sending payment.",
    inputSchema: {
      type: "object",
      properties: {
        url: { type: "string", description: "Target x402 endpoint URL" }
      },
      required: ["url"]
    }
  }
];

const rl = readline.createInterface({ input: process.stdin, terminal: false });
rl.on("line", async (line) => {
  if (!line.trim()) return;
  try {
    const req = JSON.parse(line);
    if (req.method === "initialize") {
      process.stdout.write(JSON.stringify({
        jsonrpc: "2.0",
        id: req.id,
        result: {
          protocolVersion: "2024-11-05",
          capabilities: { tools: {} },
          serverInfo: { name: "weaveverify-mcp", version: "1.1.0" }
        }
      }) + "\n");
    } else if (req.method === "tools/list") {
      process.stdout.write(JSON.stringify({
        jsonrpc: "2.0",
        id: req.id,
        result: { tools: TOOLS }
      }) + "\n");
    } else if (req.method === "tools/call") {
      const { name, arguments: args } = req.params || {};
      if (name === "verify_rfc8785_receipt") {
        const canonical = canonicalizeJCS(args?.payload || {});
        const sha256 = crypto.createHash("sha256").update(canonical).digest("hex");
        process.stdout.write(JSON.stringify({
          jsonrpc: "2.0",
          id: req.id,
          result: { content: [{ type: "text", text: JSON.stringify({ canonical, sha256 }, null, 2) }] }
        }) + "\n");
      } else if (name === "audit_x402_endpoint") {
        const res = await fetch(args.url, { headers: { Origin: "https://mcp.weaveverify.org" } });
        const pr = res.headers.get("payment-required");
        const expose = res.headers.get("access-control-expose-headers") || "";
        process.stdout.write(JSON.stringify({
          jsonrpc: "2.0",
          id: req.id,
          result: { content: [{ type: "text", text: JSON.stringify({ status: res.status, hasPaymentRequired: !!pr, corsExposesPaymentRequired: expose.toLowerCase().includes("payment-required") }, null, 2) }] }
        }) + "\n");
      }
    }
  } catch (err) {
    // ignore malformed line
  }
});
