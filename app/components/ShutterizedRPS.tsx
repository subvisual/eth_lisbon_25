'use client';

import React, { useState, useEffect } from 'react';
import {
  Layout,
  Card,
  Select,
  Button,
  Row,
  Col,
  Typography,
  Space,
  Progress,
  Spin,
  Steps,
  notification,
} from 'antd';
import { encryptData, decrypt as shutterDecrypt } from '@shutter-network/shutter-sdk';
import { hexToString, stringToHex } from 'viem';
import { DECRYPTION_DELAY, fetchDecryptionKey, fetchShutterData } from '../../lib/api';
import { ensureHexString, generateRandomBytes32 } from '../../lib/utils';

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const { Option } = Select;

type Move = 'rock' | 'paper' | 'scissors';
export type Player = 'player1' | 'player2';

interface PlayerState {
  move: Move | '';
  encryptedMove: string;
  submitted: boolean;
}

export default function App() {
  const [players, setPlayers] = useState<Record<Player, PlayerState>>({
    player1: { move: '', encryptedMove: '', submitted: false },
    player2: { move: '', encryptedMove: '', submitted: false },
  });
  const [countdown, setCountdown] = useState<number | null>(null);
  const [encryptionTimestamp, setEncryptionTimestamp] = useState<number | null>(null);
  const [identity, setIdentity] = useState<`0x${string}`>('0x');
  const [eonKey, setEonKey] = useState<`0x${string}`>('0x');
  const [loading, setLoading] = useState<{ player1: boolean; player2: boolean; decrypt: boolean }>({
    player1: false,
    player2: false,
    decrypt: false,
  });
  const [result, setResult] = useState<string>('');

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown !== null && countdown > 0) {
      timer = setInterval(() => setCountdown(c => (c !== null ? c - 1 : null)), 1000);
    } else if (countdown === 0) {
      decryptMoves();
    }
    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countdown]);

  const bothSubmitted = players.player1.submitted && players.player2.submitted;

  let currentStep = 0;
  if (bothSubmitted) {
    if (countdown !== null && countdown > 0) currentStep = 1;
    else if (loading.decrypt) currentStep = 2;
    else if (result) currentStep = 3;
  }

  const steps = [
    { title: 'Submit Moves' },
    { title: 'Waiting Decryption' },
    { title: 'Decrypting' },
    { title: 'Result' },
  ];

  const determineWinner = (move1: Move, move2: Move): string => {
    if (move1 === move2) return "It's a tie!";
    const wins: Record<Move, Move> = { rock: 'scissors', paper: 'rock', scissors: 'paper' };
    return wins[move1] === move2 ? 'Player 1 wins!' : 'Player 2 wins!';
  };

  async function submitMove(player: Player) {
    if (!players[player].move) {
      return notification.error({ message: 'Selection Required', description: `Select a move for ${player}.` });
    }
    setLoading(l => ({ ...l, [player]: true }));
    try {
      let id = identity;
      let key = eonKey;
      if (!encryptionTimestamp) {
        const ts = Math.floor(Date.now() / 1000) + DECRYPTION_DELAY;
        setEncryptionTimestamp(ts);
        const shutterData = await fetchShutterData(ts);
        notification.info({
          message: 'Shutter Data',
          description: (
            <pre style={{ whiteSpace: 'pre-wrap', maxHeight: 200, overflow: 'auto' }}>
              {JSON.stringify(shutterData, null, 2)}
            </pre>
          ),
          duration: 0,
        });
        id = ensureHexString(shutterData.identity) as `0x${string}`;
        key = ensureHexString(shutterData.eon_key) as `0x${string}`;
        setIdentity(id);
        setEonKey(key);
      }

      const msgHex = stringToHex(players[player].move);
      const sigma = generateRandomBytes32();
      const encryptedMove = await encryptData(msgHex, id, key, sigma);

      setPlayers(p => {
        const updated = {
          ...p,
          [player]: { ...p[player], encryptedMove, submitted: true },
        };
        if (updated.player1.submitted && updated.player2.submitted) {
          setCountdown(DECRYPTION_DELAY + 2);
        }
        return updated;
      });
    } catch {
      notification.error({ message: 'Error', description: 'Move submission failed.' });
    } finally {
      setLoading(l => ({ ...l, [player]: false }));
    }
  }

  async function decryptMoves() {
    setLoading(l => ({ ...l, decrypt: true }));
    try {
      const now = Math.floor(Date.now() / 1000);
      if (!encryptionTimestamp || now < encryptionTimestamp + 5) {
        return notification.warning({ message: 'Please wait', description: 'Key not available yet.' });
      }
      const { decryption_key } = await fetchDecryptionKey(identity);
      notification.info({ message: 'Decryption Key', description: decryption_key, duration: 5 });
      const keyHex = ensureHexString(decryption_key);
      const dec1 = hexToString(await shutterDecrypt(players.player1.encryptedMove, keyHex)) as Move;
      const dec2 = hexToString(await shutterDecrypt(players.player2.encryptedMove, keyHex)) as Move;
      setResult(determineWinner(dec1, dec2));
    } catch {
      notification.error({ message: 'Error', description: 'Decryption failed.' });
    } finally {
      setLoading(l => ({ ...l, decrypt: false }));
    }
  }

  return (
    <Layout style={{ minHeight: '100vh', background: '#fafafa' }}>
      <Header
        style={{
          background: '#fff',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '16px 24px',
        }}
      >
        <Title
          level={3}
          style={{
            margin: 0,
            fontFamily: 'Poppins, sans-serif',
            textAlign: 'center',
          }}
        >
          Shutter API on Gnosis Chain
        </Title>
      </Header>

      <Content style={{ padding: '40px 24px' }}>
        <Steps current={currentStep} items={steps} style={{ marginBottom: 40 }} />

        <Row gutter={[24, 24]} justify="center">
          {(['player1', 'player2'] as Player[]).map(pl => (
            <Col key={pl} xs={24} sm={12} md={8}>
              <Card>
                <Title level={4} style={{ textAlign: 'center', fontFamily: 'Poppins, sans-serif' }}>
                  {pl === 'player1' ? 'Player 1' : 'Player 2'}
                </Title>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Select
                    placeholder="Select Move"
                    value={players[pl].move}
                    onChange={v =>
                      setPlayers(p => ({ ...p, [pl]: { ...p[pl], move: v as Move } }))
                    }
                    style={{ width: '100%' }}
                  >
                    <Option value="rock">Rock</Option>
                    <Option value="paper">Paper</Option>
                    <Option value="scissors">Scissors</Option>
                  </Select>
                  <Button
                    type="primary"
                    block
                    loading={loading[pl]}
                    disabled={players[pl].submitted}
                    onClick={() => submitMove(pl)}
                  >
                    {players[pl].submitted ? 'Submitted' : 'Submit Move'}
                  </Button>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>

        {bothSubmitted && (
          <Row justify="center" style={{ marginTop: 40 }}>
            <Col xs={24} sm={16} md={12}>
              <Card style={{ textAlign: 'center' }}>
                {countdown !== null && countdown > 0 && (
                  <Space direction="vertical" align="center" style={{ width: '100%' }}>
                    <Text>Decryption in <Text strong>{countdown}s</Text></Text>
                    <Progress
                      percent={Math.round(
                        ((DECRYPTION_DELAY + 2 - countdown) / (DECRYPTION_DELAY + 2)) * 100
                      )}
                      showInfo={false}
                      strokeLinecap="round"
                    />
                  </Space>
                )}
                {result && !loading.decrypt && (
                  <Title
                    level={2}
                    style={{ color: '#389e0d', marginTop: 16, fontFamily: 'Poppins, sans-serif' }}
                  >
                    {result}
                  </Title>
                )}
              </Card>
            </Col>
          </Row>
        )}

        {loading.decrypt && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              backgroundColor: 'rgba(0,0,0,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}
          >
            <Spin tip="Decrypting moves..." size="large" />
          </div>
        )}
      </Content>
    </Layout>
  );
}
