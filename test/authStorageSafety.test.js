const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

test("api client guards localStorage access behind a window check", () => {
  const filePath = path.join(process.cwd(), "client", "src", "api", "client.js");
  const source = fs.readFileSync(filePath, "utf8");

  assert.match(source, /const getBrowserStorage = \(\) => {/);
  assert.match(source, /typeof window === "undefined"/);
  assert.match(source, /try\s*{\s*return window\.localStorage;/);
  assert.match(source, /return storage\.getItem\("vote-token"\);/);
});

test("auth context uses storage helpers instead of direct localStorage access", () => {
  const filePath = path.join(process.cwd(), "client", "src", "context", "AuthContext.jsx");
  const source = fs.readFileSync(filePath, "utf8");

  assert.match(source, /const getBrowserStorage = \(\) => {/);
  assert.match(source, /try\s*{\s*return window\.localStorage;/);
  assert.match(source, /return storage\.getItem\(key\);/);
  assert.match(source, /storage\.setItem\(key, value\);/);
  assert.match(source, /storage\.removeItem\(key\);/);
  assert.match(source, /if \(!token\) {\s*removeStorage\(STORAGE_USER_KEY\);\s*setUser\(null\);\s*setBootstrapping\(false\);/s);
  assert.doesNotMatch(source, /[^.\w]localStorage\./);
});
