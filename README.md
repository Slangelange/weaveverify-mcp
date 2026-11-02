# WeaveVerify MCP Server (`@weaveverify/mcp-server`)

**WeaveVerify** is a Model Context Protocol (MCP) server for autonomous agents and developers that provides deterministic **RFC-8785 (JCS) Ed25519 receipt verification**, **HTTP 402 (`x402`) paywall & discovery schema auditing**, **Solana Actions / Blink inspection**, and **Solana/EVM DEX microstructure & SPL authority risk analysis**.

## Tools Provided

| Tool Name | Description |
| :--- | :--- |
| `verify_rfc8785_receipt` | Canonicalizes a JSON receipt payload per RFC-8785 (JCS) and verifies its detached or embedded Ed25519 signature and SHA-256 digest. |
| `audit_x402_endpoint` | Probes an `x402` HTTP endpoint and its `/.well-known/x402` discovery document without spending funds; decodes Base64 `PAYMENT-REQUIRED` headers, checks CORS `Access-Control-Expose-Headers`, and validates atomic `amount`, `asset`, `network`, and `payTo`. |
| `inspect_solana_blink` | Validates `actions.json` rules, CORS headers, and `GET`/`POST` Solana Action endpoints for spec compliance and account safety. |
| `analyze_solana_token_microstructure` | Evaluates CLMM/DLMM liquidity-to-MCap convexity, buy/sell transaction count vs. notional skew, and SPL `MintAuthority`/`FreezeAuthority` mutability risks. |

## Quickstart (NPX / Stdio)

```json
{
  "mcpServers": {
    "weaveverify": {
      "command": "node",
      "args": ["index.mjs"]
    }
  }
}
```

## Live x402 & Streamable HTTP Endpoint

- **Discovery (`/.well-known/x402`):** `https://national-feedback-specified-complicated.trycloudflare.com/.well-known/x402`
- **Health (`GET /health`):** `https://national-feedback-specified-complicated.trycloudflare.com/health`
- **Receive-Only Settlement Address (`Base USDC`):** `0x7D1A2a7fe0b0C659cC5e0ACbFC04E0074bf8A62c`

## License

MIT
