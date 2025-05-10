"use client";

import React, { useState, useRef, useEffect } from "react";
import { Card, Button, Typography, Flex, Table, Tag } from "antd";

const { Text } = Typography;

// Helper components for rendering specific tool results
export const GnosisYieldTable = ({ yieldData }: { yieldData: any[] }) => {
  const [showAll, setShowAll] = useState(false);
  const displayData = showAll ? yieldData : yieldData.slice(0, 10);

  const columns = [
    {
      title: "Asset",
      key: "asset",
      render: (_unused: any, record: any) => (
        <Flex align="center">
          <Text strong>{record.symbol || "Unknown"}</Text>
          {record.poolMeta && <Tag color="blue">{record.poolMeta}</Tag>}
        </Flex>
      ),
    },
    {
      title: "APY",
      key: "apy",
      render: (_unused: any, record: any) => {
        const apy = record.apy ?? record.apyBase ?? 0;
        return `$${apy.toFixed(2)}`;
      },
      sorter: (a: any, b: any) =>
        (a.apy ?? a.apyBase ?? 0) - (b.apy ?? b.apyBase ?? 0),
    },
    {
      title: "TVL",
      dataIndex: "tvlUsd",
      key: "tvl",
      render: (_unused: any, record: any) => {
        const tvl = record.tvlUsd ?? record.tvl ?? 0;
        return `$${tvl.toLocaleString()}`;
      },
      sorter: (a: any, b: any) => (a.tvlUsd ?? 0) - (b.tvlUsd ?? 0),
    },
    {
      title: "7d Change",
      key: "change7d",
      render: (_unused: any, record: any) => {
        const change = record.apyPct7D;
        if (change == null) return "-";
        const isPositive = change >= 0;
        return (
          <Text type={isPositive ? "success" : "danger"}>
            {isPositive ? "+" : ""}
            {change.toFixed(2)}%
          </Text>
        );
      },
      sorter: (a: any, b: any) => (a.apyPct7D ?? 0) - (b.apyPct7D ?? 0),
    },
    {
      title: "Project",
      dataIndex: "project",
      key: "project",
      render: (_unused: any, record: any) => {
        const project = record.project ?? record.projectName ?? "-";
        return project;
      },
    },
    {
      title: "Prediction",
      key: "prediction",
      render: (_unused: any, record: any) => {
        const prediction = record.predictions?.predictedClass;
        const probability = record.predictions?.predictedProbability;

        if (!prediction) return "-";

        const color = prediction.includes("Up")
          ? "green"
          : prediction.includes("Down")
          ? "red"
          : "blue";

        return (
          <Tag color={color}>
            {prediction} {probability ? `(${probability}%)` : ""}
          </Tag>
        );
      },
    },
  ];

  return (
    <Card title="Gnosis Yield Opportunities" style={{ marginTop: 12 }}>
      <Table
        dataSource={displayData.map((item, index) => ({ ...item, key: index }))}
        columns={columns}
        size="small"
        pagination={false}
      />
      {yieldData.length > 10 && (
        <Button
          type="link"
          onClick={() => setShowAll(!showAll)}
          style={{ marginTop: 12 }}
        >
          {showAll ? "Show Less" : `Show All (${yieldData.length})`}
        </Button>
      )}
    </Card>
  );
};
