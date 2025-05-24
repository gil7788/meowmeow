"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { TokenCreatedEvent } from "@/lib/types";
import { decodeBase64ToBlob } from "@/utils/encoderBase64";
import { getRecentTokenAddresses, getTokenMetadata, listenToTokenCreated } from "~~/lib/onchainEventListener";

export function useTrendingTokens() {
  const imageUrlsRef = useRef<string[]>([]);
  const [tokens, setTokens] = useState<TokenCreatedEvent[]>([]);
  const [images, setImages] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const extractImages = useCallback((events: TokenCreatedEvent[]) => {
    const newImages: Record<string, string> = {};
    events.forEach(event => {
      if (event.image && event.image !== "none") {
        try {
          const blob = decodeBase64ToBlob(event.image);
          const url = URL.createObjectURL(blob);
          newImages[event.tokenAddress] = url;
          imageUrlsRef.current.push(url);
        } catch {
          console.warn(`Failed to parse meme image for: ${event.tokenAddress}`);
        }
      }
    });
    setImages(prev => ({ ...prev, ...newImages }));
  }, []);

  const loadRecentTokens = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const addresses = await getRecentTokenAddresses();
      const metadataList = await Promise.all(addresses.map(getTokenMetadata));
      setTokens(metadataList);
      extractImages(metadataList.reverse());
    } catch (err) {
      console.error("Failed to load recent tokens:", err);
      setError("Unable to fetch trending meme coins.");
    } finally {
      setLoading(false);
    }
  }, [extractImages]);

  useEffect(() => {
    let isMounted = true;
    const urlsToRevoke: string[] = [...imageUrlsRef.current];

    loadRecentTokens();

    const stopListening = listenToTokenCreated(() => {
      if (isMounted) loadRecentTokens();
    });

    return () => {
      isMounted = false;
      stopListening();
      urlsToRevoke.forEach(url => URL.revokeObjectURL(url));
    };
  }, [loadRecentTokens]);

  return { tokens, images, loading, error };
}
