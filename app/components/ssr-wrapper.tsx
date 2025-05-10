"use client";

import { useEffect, useState } from "react";

export function SsrWrapper({ children }: { children: React.ReactNode }) {
  const [isSsr, setIsSsr] = useState(true);

  useEffect(() => {
    setIsSsr(false);
  }, []);

  if (isSsr) return null;

  return children;
}
