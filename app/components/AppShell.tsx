"use client";

import React from "react";
import { Layout, ConfigProvider } from "antd";
import AppHeader from "./AppHeader";
import Providers from "@/lib/providers";
import { ListVaults } from "./ListVaults";

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
          <Content style={{ flex: 1, paddingInline: 16 }}>
            <div
              style={{
                display: "flex",
                gap: "24px",
                padding: "24px 24px 0",
                height: "100%",
              }}
            >
              <div style={{ display: "flex", flex: "1" }}>
                <ListVaults />
              </div>
              <div style={{ display: "flex", flex: "3" }}>{children}</div>
            </div>
          </Content>
          <Footer style={{ textAlign: "center" }}>
            © {new Date().getFullYear()} Subvisual • Built with ❤️ & redbull
          </Footer>
        </Layout>
      </Providers>
    </ConfigProvider>
  );
}
