import { useUserWallets } from "@dynamic-labs/sdk-react-core";
import { getSafesByOwner } from "@/lib/api";
import { useEffect, useState } from "react";
import { OwnerResponse } from "@safe-global/api-kit";
import { Flex, Select, Typography, Space } from "antd";

const { Title, Text } = Typography;
const { Option } = Select;

export const ListVaults = () => {
  const userWallets = useUserWallets();
  const [safes, setSafes] = useState<string[]>([]);
  const [selectedSafe, setSelectedSafe] = useState<string | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  useEffect(() => {
    const fetchSafes = async () => {
      if (userWallets.length === 0) {
        console.log("No wallets found");
        return;
      }

      const firstWallet = userWallets[0];
      setWalletAddress(firstWallet.address);

      // Fetch safes only for the first wallet
      const response = await getSafesByOwner(firstWallet.address);
      setSafes(response.safes);
    };
    fetchSafes();
  }, [userWallets]);

  const handleSafeSelect = (value: string) => {
    setSelectedSafe(value);
  };

  return (
    <Flex vertical gap={16}>
      {walletAddress && (
        <Flex vertical gap={16}>
          <Title level={4}>Connected Wallet</Title>
          <Text>{walletAddress}</Text>

          <Space direction="vertical" style={{ width: "100%" }}>
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

            {selectedSafe && (
              <Flex vertical gap={8} style={{ marginTop: 16 }}>
                <Title level={5}>Selected Safe</Title>
                <Text>{selectedSafe}</Text>
              </Flex>
            )}
          </Space>
        </Flex>
      )}
    </Flex>
  );
};
