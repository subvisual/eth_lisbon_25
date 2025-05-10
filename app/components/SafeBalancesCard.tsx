import { TokenCard } from "./TokenCard";
import { Card, Row, Col, Statistic } from "antd";

const calcFiatTotal = (data: { items: { fiatBalance: string }[] }) => {
  let fiatTotal = 0;
  data.items.forEach((item: { fiatBalance: string }) => {
    if (item.fiatBalance) {
      fiatTotal += Number(item.fiatBalance);
    }
  });
  return fiatTotal;
};

export const SafeBalancesCard = ({ data }: { data: any }) => {
  return (
    <Card
      title="Token Balances"
      bordered={false}
      style={{ marginTop: 12 }}
      extra={
        calcFiatTotal(data) && (
          <Statistic
            title="Total Value"
            value={data.fiatTotal}
            precision={2}
            prefix="$"
            suffix="USD"
            valueStyle={{ color: "#3f8600" }}
          />
        )
      }
    >
      <Row gutter={[16, 16]}>
        {data.items.map((balance: any, index: number) => (
          <Col xs={24} key={index}>
            <TokenCard balance={balance} />
          </Col>
        ))}
      </Row>
    </Card>
  );
};
