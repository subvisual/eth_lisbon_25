import Aave from "@/app/components/Aave";
import AaveRepay from "@/app/components/AaveRepay";
import { Layout } from "antd";
export const metadata = {
  title: "Aave V3 | Gnosis Dapp Boilerplate",
};

export default function AavePage() {
  return (
    <Layout>
      <Aave />
      <AaveRepay />
    </Layout>
  );
}
