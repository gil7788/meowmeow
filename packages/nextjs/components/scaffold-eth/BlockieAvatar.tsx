"use client";

import Image from "next/image";
import { AvatarComponent } from "@rainbow-me/rainbowkit";
import { blo } from "blo";

// Custom Avatar for RainbowKit
export const BlockieAvatar: AvatarComponent = ({ address, ensImage, size }) => (
  // Don't want to use nextJS Image here (and adding remote patterns for the URL)

  <Image
    src={ensImage || blo(address as `0x${string}`)}
    width={size}
    height={size}
    alt={`${address} avatar`}
    // className="w-full max-w-[300px] h-auto"
    className="rounded-full"
  />
);
