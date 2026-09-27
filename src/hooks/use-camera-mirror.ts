"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type MirrorState = "off" | "pending" | "on" | "denied";

/** Own the stream independently of the video node, which React may detach first. */
export function useCameraMirror() {
  const [mirror, setMirror] = useState<MirrorState>("off");
  const videoNode = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const requestRef = useRef(0);
  const mirrorOnRef = useRef(false);

  const release = useCallback(() => {
    requestRef.current += 1;
    const stream = streamRef.current;
    streamRef.current = null;
    stream?.getTracks().forEach((track) => track.stop());
    if (videoNode.current) videoNode.current.srcObject = null;
    mirrorOnRef.current = false;
  }, []);

  const videoRef = useCallback((node: HTMLVideoElement | null) => {
    if (videoNode.current !== node) release();
    videoNode.current = node;
    if (node) setMirror("off");
  }, [release]);

  const closeMirror = useCallback(() => {
    release();
    setMirror("off");
  }, [release]);

  const openMirror = useCallback(async () => {
    release();
    const request = requestRef.current;
    setMirror("pending");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      const video = videoNode.current;
      // Navigation, switching views, or closing can happen while permission is pending.
      if (request !== requestRef.current || !video) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      streamRef.current = stream;
      video.srcObject = stream;
      await video.play();
      if (request !== requestRef.current) return;
      for (const track of stream.getVideoTracks()) {
        track.addEventListener("ended", closeMirror, { once: true });
      }
      mirrorOnRef.current = true;
      setMirror("on");
    } catch {
      if (request !== requestRef.current) return;
      release();
      setMirror("denied");
    }
  }, [release, closeMirror]);

  useEffect(() => release, [release]);
  return { mirror, videoRef, mirrorOnRef, openMirror, closeMirror };
}
