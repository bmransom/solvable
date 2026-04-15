# Shareable URLs - Design

## Overview

Models are encoded in the URL hash fragment using base64url-encoded compressed text. The encoding pipeline is: UTF-8 text → deflate compression → base64url encoding → URL fragment. This keeps everything client-side with no backend dependency. The hash fragment is not sent to the server, preserving privacy.

## Architecture

```
Share Flow:
  Editor text → TextEncoder → pako.deflate → base64url → window.location.hash

Load Flow:
  window.location.hash → base64url decode → pako.inflate → TextDecoder → Editor
```

## Components and Interfaces

### ShareEncoder (`share.ts`)

**Purpose**: Encode and decode LP models to/from URL-safe strings.

**Responsibilities**:
- `encode(text: string): string` — compress and base64url-encode
- `decode(fragment: string): string | null` — decode and decompress, return null on failure
- Use `pako` (zlib in JS) or the native `CompressionStream` API for deflate
- Use base64url encoding (URL-safe alphabet, no padding)

### Share button and toast

**Purpose**: UI for triggering share and confirming clipboard copy.

**Responsibilities**:
- Share button in the toolbar next to Solve
- On click: encode current editor text, update `window.location.hash`, copy full URL to clipboard
- Show toast "Link copied to clipboard" for 3 seconds
- Fallback: if clipboard API fails, show a modal with the URL in a selectable input

### URL loading on page init

**Purpose**: Detect and load shared models on page load.

**Responsibilities**:
- On app mount, check `window.location.hash`
- If non-empty, attempt to decode; on success, load into editor instead of default example
- On failure, load default example and show a warning toast

## Compression Strategy

Using synchronous deflate via `pako` (widely used, ~45KB gzipped). For the small payloads typical of LP models (under 10KB), synchronous `pako` is simpler and faster than the async `CompressionStream` API. Typical LP models compress well — a 500-character model compresses to ~200 bytes, yielding a ~270 character base64 string. Well within the 2000 character URL limit.

## URL Format

```
https://solvable.dev/#v1,model=<base64url-encoded-deflated-text>
```

The `v1,` prefix enables future format changes without breaking old URLs. On decode, check the version prefix:
- `v1,model=...` → current deflate + base64url encoding
- No version prefix → attempt legacy decode, fall back to default example on failure
- Unknown version → fall back to default example with warning

The `model=` key allows future extensibility (e.g., `#v1,model=...&settings=...`).

## Testing Strategy

- **Round-trip test**: Encode a model, decode it, verify exact match
- **Corrupt data test**: Pass garbage to decode, verify null return (no crash)
- **Size test**: Encode the largest example model, verify URL stays under 2000 characters
- **Browser test**: Manually test share → open in new tab → verify model loads
