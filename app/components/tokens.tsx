'use client';

import React, { useEffect, useState } from 'react';
import {
  Tabs,
  Form,
  Input,
  InputNumber,
  Button,
  message,
  Card,
  Typography,
} from 'antd';
import { useDynamicContext } from '@dynamic-labs/sdk-react-core';
import { getSigner } from '@dynamic-labs/ethers-v6';
import { isEthereumWallet } from '@dynamic-labs/ethereum';
import {
  Contract,
  ContractFactory,
  parseUnits,
  toUtf8Bytes,
} from 'ethers';
import Image from 'next/image';

import MyERC20 from '../../smart-contracts/artifacts/contracts/MyERC20.sol/MyERC20.json';
import MyERC721 from '../../smart-contracts/artifacts/contracts/MyERC721.sol/MyERC721.json';

const { Title } = Typography;
const { TabPane } = Tabs;


export default function TokenDeploymentComponent() {
  const { primaryWallet } = useDynamicContext();
  const [loading, setLoading] = useState(false);
  const [erc20Addr, setErc20Addr] = useState<string | null>(null);
  const [erc721Addr, setErc721Addr] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  /* ------------ helpers ------------ */
  const signerOrFail = async () => {
    if (!primaryWallet || !isEthereumWallet(primaryWallet)) {
      message.error('Please connect an Ethereum wallet.');
      return null;
    }
    return getSigner(primaryWallet);
  };

  /* ------------- DEPLOY ------------- */
  const deployERC20 = async (v: any) => {
    const signer = await signerOrFail();
    if (!signer) return;

    setLoading(true);
    try {
      const factory = new ContractFactory(
        MyERC20.abi,
        MyERC20.bytecode,
        signer
      );

      const total = BigInt(v.totalSupply);
      const decimals: number = v.decimals;
      const contract = await factory.deploy(
        v.name,
        v.symbol,
        total,
        decimals
      );
      await contract.waitForDeployment();
      const address = contract.target as string;
      setErc20Addr(address);
      message.success(`ERC20 deployed at ${address}`);
    } catch (err: any) {
      message.error(`ERC20 deploy failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const deployERC721 = async (v: any) => {
    const signer = await signerOrFail();
    if (!signer) return;

    setLoading(true);
    try {
      const factory = new ContractFactory(
        MyERC721.abi,
        MyERC721.bytecode,
        signer
      );

      const contract = await factory.deploy(v.name, v.symbol);
      await contract.waitForDeployment();
      const address = contract.target as string;
      setErc721Addr(address);
      message.success(`ERC721 deployed at ${address}`);
    } catch (err: any) {
      message.error(`ERC721 deploy failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  /* ------------- MINT --------------- */
  const mintERC20 = async (v: { amount: number }) => {
    const signer = await signerOrFail();
    if (!signer) return;
    if (!erc20Addr) {
      message.error('Deploy or set an ERC20 address first.');
      return;
    }

    setLoading(true);
    try {
      const erc20 = new Contract(erc20Addr, MyERC20.abi, signer);
      const dec: number = await erc20.decimals();
      const units = parseUnits(v.amount.toString(), dec);
      const tx = await erc20.mint(await signer.getAddress(), units);
      await tx.wait();
      message.success(`Minted ${v.amount} tokens`);
    } catch (err: any) {
      message.error(`Mint failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const mintERC721 = async (v: { uri: string }) => {
    const signer = await signerOrFail();
    if (!signer) return;
    if (!erc721Addr) {
      message.error('Deploy or set an ERC721 address first.');
      return;
    }

    setLoading(true);
    try {
      const erc721 = new Contract(erc721Addr, MyERC721.abi, signer);
      const tx = await erc721.safeMint(await signer.getAddress(), v.uri);
      await tx.wait();
      message.success('NFT minted');
    } catch (err: any) {
      message.error(`Mint failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  /* ----------------- UI ------------------ */
  return (
    <Card
      style={{
        maxWidth: 880,
        margin: '20px auto',
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        minHeight: 250,
      }}
    >
      <Title level={3} style={{ textAlign: 'center', marginBottom: 20 }}>
        Deploy Contracts or Mint Your Tokens
      </Title>

      <div style={{ display: 'flex' }}>
        <div
          style={{
            width: 260,
            height: 260,
            borderRight: '1px solid #ccc',
            position: 'relative',
            flexShrink: 0,
          }}
        >
          <Image
            src="/images/token-deploy.jpeg"
            alt="Token Deployment"
            fill
            sizes="260px"
            style={{ objectFit: 'cover' }}
            priority
          />
        </div>

        <div style={{ flex: 1, padding: 24 }}>
          <Tabs defaultActiveKey="erc20">
            {/* ───────── DEPLOY ───────── */}
            <TabPane tab="📦 Deploy ERC20" key="erc20">
              <Form layout="vertical" onFinish={deployERC20}>
                <Form.Item name="name" label="Token Name" rules={[{ required: true }]}>
                  <Input placeholder="MyToken" />
                </Form.Item>
                <Form.Item name="symbol" label="Symbol" rules={[{ required: true }]}>
                  <Input placeholder="MTK" />
                </Form.Item>
                <Form.Item name="totalSupply" label="Total Supply" rules={[{ required: true }]}>
                  <InputNumber style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item name="decimals" label="Decimals" rules={[{ required: true }]}>
                  <InputNumber style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit" block loading={loading}>
                    Deploy
                  </Button>
                </Form.Item>
              </Form>
              {erc20Addr && <p>Latest ERC20: {erc20Addr}</p>}
            </TabPane>

            <TabPane tab="📦 Deploy ERC721" key="erc721">
              <Form layout="vertical" onFinish={deployERC721}>
                <Form.Item name="name" label="Token Name" rules={[{ required: true }]}>
                  <Input placeholder="MyNFT" />
                </Form.Item>
                <Form.Item name="symbol" label="Symbol" rules={[{ required: true }]}>
                  <Input placeholder="MNFT" />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit" block loading={loading}>
                    Deploy
                  </Button>
                </Form.Item>
              </Form>
              {erc721Addr && <p>Latest ERC721: {erc721Addr}</p>}
            </TabPane>

            {/* ───────── MINT ───────── */}
            <TabPane tab="🪙 Mint ERC20" key="erc20Mint">
              <Form layout="vertical" onFinish={mintERC20}>
                <Form.Item
                  name="amount"
                  label="Amount (whole tokens)"
                  rules={[{ required: true }]}
                >
                  <InputNumber min={1} style={{ width: '100%' }} />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit" block loading={loading}>
                    Mint
                  </Button>
                </Form.Item>
              </Form>
            </TabPane>

            <TabPane tab="🎨 Mint ERC721" key="erc721Mint">
              <Form layout="vertical" onFinish={mintERC721}>
                <Form.Item name="uri" label="Token URI" rules={[{ required: true }]}>
                  <Input placeholder="ipfs://… or https://…" />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit" block loading={loading}>
                    Mint
                  </Button>
                </Form.Item>
              </Form>
            </TabPane>
          </Tabs>
        </div>
      </div>
    </Card>
  );
}
