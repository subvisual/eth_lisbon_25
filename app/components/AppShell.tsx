"use client";

import React from "react";
import { Layout, ConfigProvider } from "antd";
import AppHeader from "./AppHeader";
import Providers from "@/lib/providers";

const { Content, Footer } = Layout;

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ConfigProvider>
      <Providers>
        <Layout
          style={{
            minHeight: "100dvh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <AppHeader />
          <Content style={{ flex: 1, paddingInline: 16 }}>{children}</Content>
          <Footer style={{ textAlign: "center" }}>
            © {new Date().getFullYear()} Subvisual • Built with ❤️ & redbull
          </Footer>
        </Layout>
      </Providers>
    </ConfigProvider>
  );
}
