"use client";

import type React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Layout, Menu, theme as antdTheme } from "antd";
import { ConnectButton } from "@rainbow-me/rainbowkit";

import { useDarkMode } from "@/lib/useDarkMode";

const { Header } = Layout;

export default function AppHeader() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const { isDarkMode } = useDarkMode();
  const themeMode = mounted && isDarkMode ? "dark" : "light";

  const { token } = antdTheme.useToken();

  const navLinkStyle: React.CSSProperties = { color: token.colorPrimary };

  const menuItems = [
    {
      label: (
        <Link href="/" style={navLinkStyle}>
          AI Assistant
        </Link>
      ),
      key: "home",
    },
    {
      label: (
        <Link href="/aave" style={navLinkStyle}>
          Aave
        </Link>
      ),
      key: "aave",
    },
    {
      label: (
        <Link href="/bridging" style={navLinkStyle}>
          Bridging
        </Link>
      ),
      key: "bridging",
    },
  ];

  return (
    <Header
      style={{
        display: "flex",
        alignItems: "center",
        gap: 24,
        paddingInline: 24,
        background: themeMode === "dark" ? token.colorBgElevated : "#ffffff",
      }}
    >
      {/* Logo */}
      <Link
        href="/"
        style={{ display: "flex", alignItems: "center", marginRight: "auto" }}
      >
        <Image
          src="/logo.png"
          alt="App Logo"
          width={100}
          height={35}
          priority
        />
      </Link>

      {/* Navigation */}
      <Menu
        theme={themeMode}
        mode="horizontal"
        items={menuItems}
        selectable={false}
        style={{
          flex: 1,
          justifyContent: "center",
          minWidth: 0,
          background: "transparent",
        }}
      />

      {/* Wallet connect */}
      <ConnectButton />
    </Header>
  );
}
