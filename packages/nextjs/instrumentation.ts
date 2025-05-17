import { env } from "~~/env";

export function register() {
  console.log("🛠️ Instrumentation running...");
  console.log(`Env:\n${JSON.stringify(env, null, 2)}`);
}
