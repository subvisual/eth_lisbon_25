'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Layout, Menu, theme as antdTheme } from 'antd';
import { DynamicWidget } from '@/lib/dynamic';
import { useDarkMode } from '@/lib/useDarkMode';

const { Header } = Layout;

export default function AppHeader() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const { isDarkMode } = useDarkMode();
  const themeMode = mounted && isDarkMode ? 'dark' : 'light';

  const { token } = antdTheme.useToken();

  const navLinkStyle: React.CSSProperties = { color: token.colorPrimary };

  const menuItems = [
    { label: <Link href="/" style={navLinkStyle}>Home</Link>, key: 'home' },
    { label: <Link href="/deploy-token" style={navLinkStyle}>Token Deployment</Link>, key: 'token' },
    { label: <Link href="/shutter-rps" style={navLinkStyle}>Shutter</Link>, key: 'rps' },
    {
      label: (
        <a href="https://faucet.gnosischain.com/" target="_blank" rel="noopener noreferrer" style={navLinkStyle}>
          Faucet ↗︎
        </a>
      ),
      key: 'faucet',
    },
    {
      label: (
        <a href="https://docs.gnosischain.com/" target="_blank" rel="noopener noreferrer" style={navLinkStyle}>
          Docs ↗︎
        </a>
      ),
      key: 'docs',
    },
  ];

  return (
    <Header
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 24,
        paddingInline: 24,
        background: themeMode === 'dark' ? token.colorBgElevated : '#ffffff',
      }}
    >
      {/* Logo */}
      <Link href="/" style={{ display: 'flex', alignItems: 'center', marginRight: 'auto' }}>
        <Image src="/logo.png" alt="Gnosis Chain" width={160} height={35} priority />
      </Link>

      {/* Navigation */}
      <Menu
        theme={themeMode}
        mode="horizontal"
        items={menuItems}
        selectable={false}
        style={{ flex: 1, justifyContent: 'center', minWidth: 0, background: 'transparent' }}
      />

      {/* Wallet connect */}
      <DynamicWidget />
    </Header>
  );
}