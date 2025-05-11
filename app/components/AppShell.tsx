"use client";

import React from "react";
import { Layout, ConfigProvider, Flex } from "antd";
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
            maxHeight: "100dvh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <AppHeader />
          <Content
            style={{
              flex: 1,
              paddingInline: 16,
              overflowY: "scroll",
              position: "relative",
            }}
          >
            <div
              style={{
                display: "flex",
                gap: "24px",
                padding: "24px 24px 0",
                height: "100%",
                maxHeight: "100%",
                overflow: "scroll",
              }}
            >
              <Flex style={{ flex: "1" }}>
                <ListVaults />
              </Flex>
              <Flex style={{ flex: "3", maxHeight: "100%" }}>{children}</Flex>
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
