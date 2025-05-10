"use client";

import React from "react";
import { ListVaults } from "./components/ListVaults";
import { AIChat } from "./components/AIChat";

export default function HomePage() {
  return (
    <div style={{ display: "flex", gap: "24px", padding: "24px" }}>
      <div style={{ flex: "1" }}>
        <ListVaults />
      </div>
      <div style={{ flex: "2" }}>
        <AIChat />
      </div>
    </div>
  );
}
