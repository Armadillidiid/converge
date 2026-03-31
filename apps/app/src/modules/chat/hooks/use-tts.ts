import { useState, useCallback, useRef } from "react";
import { sdkClient } from "@/shared/lib/sdk";

type Voice = "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer";

interface UseTTSResult {
  isSpeaking: boolean;
  isLoading: boolean;
  error: string | null;
  speak: (text: string, voice?: Voice) => Promise<void>;
  stop: () => void;
}

export function useTTS(): UseTTSResult {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const cacheRef = useRef<Map<string, string>>(new Map());

  const speak = useCallback(async (text: string, voice: Voice = "alloy") => {
    try {
      setError(null);

      const cacheKey = `${text}-${voice}`;
      let audioUrl = cacheRef.current.get(cacheKey);

      if (!audioUrl) {
        setIsLoading(true);

        const response = await sdkClient.ai.speak({
          body: { text, voice },
        });

        if (!response.data) {
          throw new Error("Speech generation failed");
        }

        audioUrl = `data:audio/mpeg;base64,${response.data.audio}`;
        cacheRef.current.set(cacheKey, audioUrl);
        setIsLoading(false);
      }

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setIsSpeaking(false);
        audioRef.current = null;
      };

      audio.onerror = () => {
        setError("Audio playback failed");
        setIsSpeaking(false);
        audioRef.current = null;
      };

      await audio.play();
      setIsSpeaking(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Speech generation failed");
      setIsLoading(false);
      setIsSpeaking(false);
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsSpeaking(false);
  }, []);

  return {
    isSpeaking,
    isLoading,
    error,
    speak,
    stop,
  };
}
