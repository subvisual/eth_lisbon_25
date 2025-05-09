'use client';

import { Layout, Typography } from 'antd';

const { Header, Content } = Layout;
const { Title } = Typography;

export default function App() {

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
          Aave V3 on Gnosis Chain
        </Title>
      </Header>
    </Layout>
  );
}
