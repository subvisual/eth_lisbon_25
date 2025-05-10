"use client";

import React, { useState } from "react";
import { ListVaults } from "./components/ListVaults";
import { AIChat } from "./components/AIChat";

export default function HomePage() {
  const [selectedSafe, setSelectedSafe] = useState<string | undefined>();

  return (
    <div style={{ display: "flex", gap: "24px", padding: "24px" }}>
      <div style={{ flex: "1" }}>
        <ListVaults
          setSelectedSafe={setSelectedSafe}
          selectedSafe={selectedSafe}
        />
      </div>
      <div style={{ flex: "3" }}>
        {selectedSafe && <AIChat safeAddress={selectedSafe} />}
      </div>
    </div>
  );
}
