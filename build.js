// Usage: node build.js <username> <password>
// Reads source/app.html, encrypts the page body (AES-GCM, PBKDF2 key), writes index.html with a login screen.
const fs = require("fs"), crypto = require("crypto");
const [user, pass] = process.argv.slice(2);
if (!user || !pass) { console.error("Usage: node build.js <username> <password>"); process.exit(1); }
const src = fs.readFileSync(__dirname + "/source/app.html", "utf8");
const style = src.match(/<style>([\s\S]*?)<\/style>/)[1];
const body = src.match(/<body>([\s\S]*)<\/body>/)[1];
const salt = crypto.randomBytes(16), iv = crypto.randomBytes(12);
const key = crypto.pbkdf2Sync(user.trim().toLowerCase() + ":" + pass, salt, 250000, 32, "sha256");
const c = crypto.createCipheriv("aes-256-gcm", key, iv);
const enc = Buffer.concat([c.update(body, "utf8"), c.final(), c.getAuthTag()]); // tag appended, as WebCrypto expects
const b64 = b => b.toString("base64");
const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow"><title>Nevada Forward Data Repository · Sign in</title>
<style>${style}
  #login { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--light); padding: 20px; }
  #login form { background: #fff; width: 100%; max-width: 380px; border-top: 6px solid var(--scarlet); border-radius: 8px; padding: 28px; box-shadow: 0 4px 18px rgba(0,0,0,.12); }
  #login h1 { font-size: 22px; margin: 0 0 4px; } #login p { margin: 0 0 18px; color: var(--gray); font-size: 14px; }
  #login label { display: block; font-size: 13px; font-weight: 600; margin: 12px 0 4px; }
  #login input { width: 100%; padding: 10px 12px; border: 1px solid var(--border); border-radius: 6px; font-size: 15px; }
  #login button { width: 100%; margin-top: 18px; padding: 11px; background: var(--scarlet); color: #fff; border: 0; border-radius: 6px; font-size: 15px; font-weight: 600; cursor: pointer; }
  #login button:hover { background: var(--scarlet-dark); } #err { color: var(--scarlet-dark); font-size: 14px; min-height: 20px; margin-top: 10px; }
</style></head>
<body>
<div id="login"><form id="f" autocomplete="on">
  <h1>Nevada Forward Data Repository</h1><p>Team members only. Sign in to continue.</p>
  <label for="u">Username</label><input id="u" autocomplete="username" required autofocus>
  <label for="p">Password</label><input id="p" type="password" autocomplete="current-password" required>
  <button type="submit">Sign in</button><div id="err" role="alert"></div>
</form></div>
<script>
const SALT="${b64(salt)}", IV="${b64(iv)}", DATA="${b64(enc)}";
const d = s => Uint8Array.from(atob(s), c => c.charCodeAt(0));
document.getElementById("f").addEventListener("submit", async e => {
  e.preventDefault();
  const err = document.getElementById("err"); err.textContent = "";
  try {
    const u = document.getElementById("u").value.trim().toLowerCase(), p = document.getElementById("p").value;
    const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(u + ":" + p), "PBKDF2", false, ["deriveKey"]);
    const key = await crypto.subtle.deriveKey({ name: "PBKDF2", salt: d(SALT), iterations: 250000, hash: "SHA-256" }, base, { name: "AES-GCM", length: 256 }, false, ["decrypt"]);
    const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: d(IV) }, key, d(DATA));
    document.body.innerHTML = new TextDecoder().decode(plain);
    document.body.querySelectorAll("script").forEach(o => { const n = document.createElement("script"); n.textContent = o.textContent; o.replaceWith(n); });
  } catch (x) { err.textContent = "Incorrect username or password."; }
});
</script></body></html>`;
fs.writeFileSync(__dirname + "/index.html", html);
console.log("Built index.html for user:", user);
