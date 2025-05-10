"use client";

import React from "react";
import { AIChat } from "./components/AIChat";
import { useSafe } from "@/lib/providers";

export default function HomePage() {
  const { selectedSafe } = useSafe();

  if (!selectedSafe) {
    return null;
  }

  return <AIChat safeAddress={selectedSafe} />;
}
