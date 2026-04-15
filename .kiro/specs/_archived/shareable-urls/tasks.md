# Implementation Plan

- [ ] 1. Implement the encoding/decoding module
  - Create `web/src/share.ts`
  - Implement `encode(text: string): string` using `pako` synchronous deflate + base64url, with `v1,model=` prefix
  - Implement `decode(fragment: string): string | null` — parse version prefix, handle `v1` format, return null on failure or unknown version
  - Write unit tests for round-trip encoding/decoding
  - Write tests for corrupt/invalid input returning null
  - Write tests for unknown version prefix returning null
  - Write size tests verifying example models stay under 2000 characters
  - _Requirements: SHARE-1.1, SHARE-1.2, SHARE-1.3, SHARE-1.4, SHARE-1.5_

- [ ] 2. Implement URL loading on page init
  - On app mount, check `window.location.hash` for `v1,model=` prefix
  - Decode the fragment and load into the editor
  - On decode failure, fall back to default example and show a warning toast
  - _Requirements: SHARE-1.2, SHARE-1.4, SHARE-1.5_

- [ ] 3. Build the Share button and clipboard flow
  - Add Share button to the toolbar
  - On click: encode editor text, set `window.location.hash`, copy URL to clipboard
  - Show toast "Link copied to clipboard" for 3 seconds
  - Implement clipboard fallback: show URL in a selectable input if clipboard API is denied
  - _Requirements: SHARE-1.1, SHARE-2.1, SHARE-2.2_

- [ ] 4. End-to-end browser testing
  - Click Share, open the copied URL in a new tab, verify model loads correctly
  - Test with each built-in example model
  - Test with a manually corrupted URL hash
  - Test clipboard fallback by denying clipboard permission
  - _Requirements: SHARE-1.1, SHARE-1.2, SHARE-1.4, SHARE-2.1, SHARE-2.2_
