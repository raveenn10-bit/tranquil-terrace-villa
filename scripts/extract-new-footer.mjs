import fs from "node:fs";
import { execSync } from "node:child_process";

const zipPath = "C:/Users/chami/.gemini/antigravity/brain/dc822ad4-950c-4599-9783-b1c6359d36cc/.user_uploaded/media_1793225250248_3da61703.zip";

try {
  execSync(`powershell -command "Expand-Archive -Path '${zipPath}' -DestinationPath 'extracted-footer' -Force"`);
  console.log("Extracted successfully! Contents:");
  function list(dir) {
    for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = `${dir}/${f.name}`;
      if (f.isDirectory()) list(full);
      else console.log(full, fs.statSync(full).size);
    }
  }
  list("extracted-footer");
} catch (e) {
  console.error("Error:", e.message);
}
