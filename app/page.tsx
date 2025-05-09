'use client';

import React from 'react';
import { Row, Col, Card, Typography } from 'antd';
import {
  WalletOutlined,
  DeploymentUnitOutlined,
  ApiOutlined,
  CodeOutlined,
} from '@ant-design/icons';

const { Title, Paragraph } = Typography;

export default function HomePage() {
  const headingFont = 'Poppins, sans-serif';
  const bodyFont = 'Roboto, sans-serif';
  const textColor = '#262626';

  const cardStyle: React.CSSProperties = {
    background: '#ffffff',
    border: 'none',
    borderRadius: 12,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
    transition: 'box-shadow 0.25s ease',
  };

  const features = [
    {
      title: 'UX-Friendly Wallet',
      icon: (
        <WalletOutlined
          style={{ fontSize: '3.5rem', color: '#1677ff' /* blue-6 */ }}
        />
      ),
      description:
        'Connect seamlessly with MetaMask, WalletConnect, and social logins like Google and Farcaster using the native Dynamic SDK.',
    },
    {
      title: 'Token Deployments',
      icon: (
        <DeploymentUnitOutlined
          style={{ fontSize: '3.5rem', color: '#10b981' /* green-5 */ }}
        />
      ),
      description:
        'Deploy ERC-20 and ERC-721 tokens in one click. The guided UI handles constructor params, gas estimation, and post-deployment details.',
    },
    {
      title: 'Shutter API Integration',
      icon: (
        <ApiOutlined
          style={{ fontSize: '3.5rem', color: '#d946ef' /* purple-5 */ }}
        />
      ),
      description:
        'Integrate Shutter’s commit-and-reveal threshold-encryption workflows directly from the front-end with minimal boilerplate.',
    },
    {
      title: 'Hardhat 3 Tooling',
      icon: (
        <CodeOutlined
          style={{ fontSize: '3.5rem', color: '#f97316' /* orange-5 */ }}
        />
      ),
      description:
        'A next-gen Hardhat environment featuring blazing-fast Solidity tests, multichain workflows, and a revamped build system.',
    },
  ];

  return (
    <div
      style={{
        padding: '4rem 1rem',
        maxWidth: 1200,
        margin: '0 auto',
        fontFamily: bodyFont,
      }}
    >
      <section style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <Title
          level={1}
          style={{
            fontFamily: headingFont,
            color: '#000',
            fontSize: 'clamp(2.5rem, 5vw, 3.5rem)',
            fontWeight: 800,
            marginBottom: '1rem',
          }}
        >
          Gnosis Dapp Boilerplate
        </Title>

        <Paragraph
          style={{
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
            color: textColor,
            maxWidth: 700,
            margin: '0 auto',
            lineHeight: 1.6,
          }}
        >
          Accelerate Gnosis-powered dApp development with seamless wallet
          onboarding, one-click token deployment, Shutter integration, and more.
        </Paragraph>
      </section>

      <section>
        <Row gutter={[24, 24]} align="stretch">
          {features.map((feat) => (
            <Col
              key={feat.title}
              xs={24}
              sm={12}
              lg={8}
              style={{ display: 'flex' }} 
            >
              <Card
                hoverable
                style={cardStyle}
                bodyStyle={{ padding: '2rem', flex: 1 }}
                onMouseEnter={(e) =>
                  ((e.currentTarget.style.boxShadow =
                    '0 8px 24px rgba(0,0,0,0.12)'))
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget.style.boxShadow =
                    '0 4px 16px rgba(0,0,0,0.06)'))
                }
              >
                <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                  {feat.icon}
                </div>

                <Title
                  level={4}
                  style={{
                    fontFamily: headingFont,
                    color: textColor,
                    textAlign: 'center',
                    marginBottom: '0.75rem',
                  }}
                >
                  {feat.title}
                </Title>

                <Paragraph
                  style={{
                    color: textColor,
                    lineHeight: 1.6,
                    marginTop: 'auto', 
                  }}
                >
                  {feat.description}
                </Paragraph>
              </Card>
            </Col>
          ))}
        </Row>
      </section>
    </div>
  );
}
