# OK, Let's GNO

## Try it: https://eth-lisbon-25.vercel.app/

A next-generation web3 application enabling seamless cross-chain account top-ups, unified Aave lending/borrowing, and AI-powered portfolio optimization.

Built for ETH Lisbon 2025.

---

## 🚀 Features

- **Multi-Chain Top-Up:**  
  Instantly bridge any crypto asset from any supported blockchain to your Gnosis Safe/Pay card on Gnosis Chain.

- **Unified Aave Lending & Borrowing:**  
  Lend, borrow, and repay assets on Aave directly from a single, intuitive interface.

- **AI Agent for DeFi Portfolio Optimization:**  
  Chat with an AI agent that analyzes your holdings, curates yield strategies, and can autonomously execute bridging, allocation, and strategy transactions upon your approval.

- **Agentic Automation:**  
  The AI agent can check your balances, devise optimal DeFi strategies, prompt you for confirmation, and execute complex, multi-step transactions with a single click.

---

## 🛠 Architecture

- **Frontend:** React-based interface for wallet connection, asset management, Aave operations, and AI chat.
- **Backend/API:** Node.js/Express server orchestrates cross-chain transfers, fetches yield strategies, and powers the AI agent.
- **Smart Contracts:** Custom contracts for bridging, asset routing, and agentic transactions on Gnosis Chain and other EVM networks.
- **AI Agent:** Integrates LLMs to provide conversational portfolio management and automated DeFi actions.

---

## 🌐 Supported Networks & Protocols

- **Chains:** Gnosis Chain, Ethereum, and other EVM-compatible networks.
- **Protocols:** Gnosis Pay, Aave, Safe (Gnosis Safe), custom bridging contracts.

---

## 🏁 Getting Started

### 1. Clone the Repository

```
git clone https://github.com/subvisual/eth_lisbon_25.git
cd eth_lisbon_25
```

### 2. Install Dependencies

```
npm install
```

### 3. Configure Environment

- Copy `.env.example` to `.env` and fill in required RPC URLs, API keys, and contract addresses.

### 4. Run the App

```
npm run dev
```

- The frontend will be available at [http://localhost:3000](http://localhost:3000).

---

## 💡 Usage

1. **Connect your wallet** (MetaMask, WalletConnect, etc.).
2. **Top up your account:**
   - Select the source chain and asset.
   - Enter the amount and confirm.
   - Funds are bridged and deposited to your Gnosis Safe.
3. **Lend or borrow on Aave:**
   - Choose assets to lend, borrow, or repay.
   - Borrowed funds can be routed directly to your Gnosis Safe.
4. **Optimize with the AI Agent:**
   - Open the chat interface.
   - The agent analyzes your portfolio, suggests yield strategies, and can execute transactions after your approval.

---

## 🤖 AI Agent Capabilities

- **Portfolio Analysis:** Scans your on-chain holdings and positions.
- **Strategy Curation:** Selects optimal yield strategies from a curated list.
- **Agentic Transactions:**
  - Bridges assets cross-chain.
  - Allocates assets to yield opportunities.
  - Lends, borrows, or repays on Aave.
  - Manages collateral and debt positions.
- **Conversational Interface:**
  - Define risk preferences and investment goals via chat.
  - Confirm or decline recommended actions before execution.

---

## 🧑‍💻 Contributing

Pull requests and issues are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## 🛟 Support

For questions, issues, or feature requests, open an issue in this repository.

---

## 📄 License

MIT License. See [LICENSE](LICENSE) for details.

---

**Made with ❤️ for ETH Lisbon 2025**  
[https://github.com/subvisual/eth_lisbon_25](https://github.com/subvisual/eth_lisbon_25)
