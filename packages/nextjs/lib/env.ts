import { type Environment, type NetworkConfig, NetworkConfigs } from "./config";
import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_NET: z.enum(["local", "test", "main", "localnet", "testnet", "mainnet"]),
  NEXT_PUBLIC_LAUNCHPAD_CONTRACT_ADDRESS: z.string().startsWith("0x"),
});

function isSafeParseSuccess<T>(result: z.SafeParseReturnType<any, T>): result is z.SafeParseSuccess<T> {
  return result.success;
}

const parsed = envSchema.safeParse(process.env);

let safeEnv: z.infer<typeof envSchema>;

if (isSafeParseSuccess(parsed)) {
  safeEnv = parsed.data;
} else {
  if (typeof window === "undefined") {
    console.error("❌ Invalid environment variables:", parsed.error.format());
    throw new Error("Invalid environment variables");
  } else {
    console.warn("⚠️ Environment variables not validated on client");
    safeEnv = {
      NEXT_PUBLIC_NET: "local",
      NEXT_PUBLIC_LAUNCHPAD_CONTRACT_ADDRESS: "0x0000000000000000000000000000000000000000",
    };
  }
}

// ✅ Explicit typing here
const networkEnv: Environment = safeEnv.NEXT_PUBLIC_NET;
const network: NetworkConfig = NetworkConfigs[networkEnv];

export const env = {
  networkEnv,
  launchpadContractAddress: safeEnv.NEXT_PUBLIC_LAUNCHPAD_CONTRACT_ADDRESS,
  network,
};
