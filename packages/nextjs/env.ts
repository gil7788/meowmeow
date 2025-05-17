import { z } from "zod";

export type Environment = "local" | "test" | "main" | "localnet" | "testnet" | "mainnet";

const envSchema = z.object({
  NEXT_PUBLIC_NET: z.enum(["local", "test", "main", "localnet", "testnet", "mainnet"]),
  NEXT_PUBLIC_LAUNCHPAD_CONTRACT_ADDRESS: z.string().startsWith("0x"),
});

function isSafeParseSuccess<T>(result: z.SafeParseReturnType<any, T>): result is z.SafeParseSuccess<T> {
  return result.success;
}

let networkEnv: Environment = "local"; // fallback
let launchpadContractAddress = "0x0000000000000000000000000000000000000000";

if (typeof window === "undefined") {
  // ✅ Server-side environment parsing
  const parsed = envSchema.safeParse(process.env);
  if (isSafeParseSuccess(parsed)) {
    networkEnv = parsed.data.NEXT_PUBLIC_NET;
    launchpadContractAddress = parsed.data.NEXT_PUBLIC_LAUNCHPAD_CONTRACT_ADDRESS;
  } else {
    console.error("❌ Invalid environment variables:", parsed.error.format());
    throw new Error("Invalid environment variables");
  }
} else {
  // ✅ Client-side access to env vars must use string literals
  const net = process.env.NEXT_PUBLIC_NET;
  const contract = process.env.NEXT_PUBLIC_LAUNCHPAD_CONTRACT_ADDRESS;

  if (
    net === "local" ||
    net === "test" ||
    net === "main" ||
    net === "localnet" ||
    net === "testnet" ||
    net === "mainnet"
  ) {
    networkEnv = net;
  } else {
    console.warn("⚠️ Invalid or missing NEXT_PUBLIC_NET on client, using 'local'");
  }

  if (typeof contract === "string" && contract.startsWith("0x") && contract.length === 42) {
    launchpadContractAddress = contract;
  } else {
    console.warn("⚠️ Invalid or missing NEXT_PUBLIC_LAUNCHPAD_CONTRACT_ADDRESS on client");
  }
}

export const env = {
  networkEnv,
  launchpadContractAddress,
};
