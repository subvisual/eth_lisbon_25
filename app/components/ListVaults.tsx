import { useAccount } from "wagmi";
import { getSafesByOwner, getSafeBalances, SafeBalanceItem } from "@/lib/api";
import { useEffect, useState } from "react";
import { SafeInfoResponse } from "@safe-global/api-kit";
import {
  Flex,
  Select,
  Typography,
  Space,
  Card,
  Avatar,
  Statistic,
  Tooltip,
  Row,
  Col,
  Tag,
} from "antd";
import { apiKit } from "@/lib/apiKit";
import { ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";
import { useSafe } from "@/lib/providers";

const { Title, Text } = Typography;
const { Option } = Select;

const TokenCard = ({ balance }: { balance: SafeBalanceItem }) => {
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
              value={formattedBalance}
              precision={4}
              valueStyle={{ fontSize: 16 }}
              suffix={balance.tokenInfo?.symbol || "ETH"}
            />
            {balance.fiatBalance && (
              <Tooltip title="USD Value">
                <Text type="secondary">${balance.fiatBalance} USD</Text>
              </Tooltip>
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
                {Number(balance.fiatBalance24hChange).toFixed(2)}% (24h)
              </Tag>
            </Flex>
          )}
        </Flex>
      </Flex>
    </Card>
  );
};

const SafeInfo = ({ safeAddress }: { safeAddress: string }) => {
  const [safeInfo, setSafeInfo] = useState<SafeInfoResponse | null>(null);
  const [balances, setBalances] = useState<SafeBalanceItem[]>([]);
  const [fiatTotal, setFiatTotal] = useState<string | null>(null);

  useEffect(() => {
    const fetchSafeInfo = async () => {
      const response = await apiKit.getSafeInfo(safeAddress);
      const balancesResponse = await getSafeBalances(safeAddress);

      setSafeInfo(response);
      setBalances(balancesResponse.items || []);
      setFiatTotal(balancesResponse.fiatTotal || null);
    };

    fetchSafeInfo();
  }, [safeAddress]);

  return (
    <Flex vertical gap={24}>
      <Card title="Safe Information" bordered={false}>
        <Flex vertical gap={8}>
          <Text>
            <Text strong>Owners:</Text> {safeInfo?.owners?.join(", ")}
          </Text>
          <Text>
            <Text strong>Threshold:</Text> {safeInfo?.threshold}
          </Text>
        </Flex>
      </Card>

      {balances.length > 0 ? (
        <Card
          title="Token Balances"
          bordered={false}
          extra={
            fiatTotal && (
              <Statistic
                title="Total Value"
                value={fiatTotal}
                precision={2}
                prefix="$"
                suffix="USD"
                valueStyle={{ color: "#3f8600" }}
              />
            )
          }
        >
          <Row gutter={[16, 16]}>
            {balances.map((balance, index) => (
              <Col xs={24} md={24} xl={24} key={index}>
                <TokenCard balance={balance} />
              </Col>
            ))}
          </Row>
        </Card>
      ) : (
        <Card title="No Balances" bordered={false}>
          <Text>No balances found for this safe.</Text>
        </Card>
      )}
    </Flex>
  );
};

export const ListVaults = () => {
  const { address, isConnected } = useAccount();
  const [safes, setSafes] = useState<string[]>([]);
  const { selectedSafe, setSelectedSafe } = useSafe();

  useEffect(() => {
    const fetchSafes = async () => {
      if (!address) return;
      const response = await getSafesByOwner(address);
      setSafes(response.safes);
    };
    fetchSafes();
  }, [address]);

  const handleSafeSelect = (value: string) => {
    console.log("Selected Safe:", value);
    setSelectedSafe(value);
  };

  return (
    <Flex vertical gap={24} style={{ marginTop: 24 }}>
      {isConnected && (
        <Flex vertical gap={24}>
          <Card bordered={false}>
            <Title level={4}>Connected Wallet</Title>
            <Text copyable>{address}</Text>
          </Card>

          <Card bordered={false}>
            <Title level={4}>Select a Safe</Title>
            <Select
              placeholder="Choose a safe from the dropdown"
              style={{ width: "100%" }}
              onChange={handleSafeSelect}
              value={selectedSafe}
            >
              {safes.map((safe) => (
                <Option key={safe} value={safe}>
                  {safe}
                </Option>
              ))}
            </Select>
          </Card>

          {selectedSafe && <SafeInfo safeAddress={selectedSafe} />}
        </Flex>
      )}
    </Flex>
  );
};
