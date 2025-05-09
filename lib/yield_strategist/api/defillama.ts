export async function fetchYieldData() {
  const response = await fetch("https://yields.llama.fi/pools", {
    method: "GET",
    headers: {
      accept: "*/*",
    },
  });

  const data = await response.json();
  return data.data;
}

export async function fetchGnosisYieldData() {
  const data = await fetchYieldData();

  //   Filter the data to only include Gnosis chain
  const gnosisData = data.filter(
    (item) => item.chain.toLowerCase() === "gnosis"
  );

  return gnosisData;
}

import yields from "../../../yields.json";
export function mockGnosisYield() {
  const gnosisData = yields.data.filter(
    (item) => item.chain.toLowerCase() === "gnosis"
  );

  return gnosisData;
}
