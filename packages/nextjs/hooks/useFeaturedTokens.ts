"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { TokenCreatedEvent } from "@/lib/types";
import { decodeBase64ToBlob } from "@/utils/encoderBase64";
import { getFeaturedTokenAddresses, getTokenMetadata, listenToBuyEvent } from "~~/lib/onchainEventListener";

const MAX_EVENTS = 8;

export function useFeaturedTokens() {
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
          console.warn("Failed to parse image for:", event.tokenAddress);
        }
      }
    });
    setImages(prev => ({ ...prev, ...newImages }));
  }, []);

  const loadFeaturedTokens = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const addresses = await getFeaturedTokenAddresses();
      const tokenMetadata = await Promise.all(addresses.map(getTokenMetadata));
      extractImages(tokenMetadata);
      setTokens(tokenMetadata.reverse().slice(-MAX_EVENTS));
    } catch (err) {
      console.error("Error loading featured tokens:", err);
      setError("Failed to fetch featured meme coins.");
    } finally {
      setLoading(false);
    }
  }, [extractImages]);

  useEffect(() => {
    loadFeaturedTokens();
    const stopListening = listenToBuyEvent(loadFeaturedTokens);
    return () => {
      stopListening();
      imageUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
    };
  }, [loadFeaturedTokens]);

  return { tokens, images, loading, error };
}
