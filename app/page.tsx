"use client";

import { useState, useSyncExternalStore } from "react";
import { isConfigured } from "./storage";
import { ControlBoard } from "./ControlBoard";
import { Setup } from "./Setup";

const subscribe = () => () => {};

export default function Page() {
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const [setupComplete, setSetupComplete] = useState(false);

  if (!mounted) return null;

  if (!setupComplete && !isConfigured()) {
    return <Setup onComplete={() => setSetupComplete(true)} />;
  }

  return <ControlBoard />;
}
