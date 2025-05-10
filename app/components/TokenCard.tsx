import { Card, Avatar, Flex, Tag, Statistic, Typography } from "antd";
import { ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";
const { Text } = Typography;

export const TokenCard = ({ balance }: { balance: any }) => {
  const formattedBalance = balance.tokenInfo?.decimals
    ? (Number(balance.balance) / 10 ** balance.tokenInfo.decimals).toFixed(4)
    : balance.balance;

  const isPositiveChange = Number(balance.fiatBalance24hChange) >= 0;

  return (
    <Card
      hoverable
      style={{
        marginBottom: 16,
        borderRadius: 8,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      <Flex align="center" gap={16}>
        <Avatar
          size={48}
          src={balance.tokenInfo?.logoUri || undefined}
          style={{
            backgroundColor: !balance.tokenInfo?.logoUri
              ? "#1890ff"
              : undefined,
          }}
        >
          {!balance.tokenInfo?.logoUri &&
            (balance.tokenInfo?.symbol?.[0] || "T")}
        </Avatar>

        <Flex vertical flex={1}>
          <Flex justify="space-between" align="center">
            <Text strong>{balance.tokenInfo?.name || "Unknown Token"}</Text>
            <Tag color="blue">{balance.tokenInfo?.symbol || "ETH"}</Tag>
          </Flex>

          <Flex justify="space-between" align="center" style={{ marginTop: 8 }}>
            <Statistic
              value={balance.formattedBalance}
              precision={4}
              valueStyle={{ fontSize: 16 }}
              suffix={balance.tokenInfo?.symbol || "ETH"}
            />
            {balance.fiatBalance && (
              <Flex align="center">
                <Text type="secondary">${balance.fiatBalance} USD</Text>
              </Flex>
            )}
          </Flex>

          {balance.fiatBalance24hChange && (
            <Flex justify="flex-end" style={{ marginTop: 4 }}>
              <Tag
                color={isPositiveChange ? "success" : "error"}
                icon={
                  isPositiveChange ? <ArrowUpOutlined /> : <ArrowDownOutlined />
                }
              >
                {isPositiveChange ? "+" : ""}
                {balance.fiatBalance24hChange}% (24h)
              </Tag>
            </Flex>
          )}
        </Flex>
      </Flex>
    </Card>
  );
};
