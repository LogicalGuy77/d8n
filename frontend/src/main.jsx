import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// 1. Import wagmi and dependencies
import { WagmiProvider, createConfig, http } from "wagmi";
import { mainnet, sepolia } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { metaMask } from "wagmi/connectors";

// 2. Create wagmi config
const config = createConfig({
  chains: [mainnet, sepolia], // Add the chains you want to support
  connectors: [
    metaMask({
      dappMetadata: {
        name: "d8n Workflow Automation",
        url: window.location.host,
      },
    }),
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});

// 3. Create a QueryClient
const queryClient = new QueryClient();

// 4. Wrap your App with the providers
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
);
