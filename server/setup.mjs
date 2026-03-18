import { spawn, spawnSync } from "child_process";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log("Installing dependencies...");
const install = spawnSync("npm", ["install"], { cwd: __dirname, stdio: "inherit" });
if (install.error) {
  console.error("Failed to install:", install.error);
  process.exit(1);
}

console.log("\nBuilding TypeScript...");
const build = spawnSync("npm", ["run", "build"], { cwd: __dirname, stdio: "inherit" });
if (build.error) {
  console.error("Failed to build:", build.error);
  process.exit(1);
}

console.log("\nStarting server...");
const start = spawn("npm", ["start"], { cwd: __dirname, stdio: "inherit" });
start.on("error", (err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
