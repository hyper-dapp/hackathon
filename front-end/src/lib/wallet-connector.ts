/**
 * Abstraction over Wallet Connect and Metamask
 *
 */
import m from "mithril";
import * as ethers from "ethers";
import WalletConnectProviderUmd from "@walletconnect/web3-provider/dist/umd/index.min.js";
import type WalletConnectProvider from "@walletconnect/web3-provider/dist/esm/index";

export type WalletConnector = ReturnType<typeof makeWalletConnector>;

type Status =
  | { type: "loading" }
  | { type: "init" }
  | { type: "connecting" }
  | { type: "disconnected" }
  | { type: "error"; context: "connect" | "update" | "disconnect"; error: any }
  | { type: "ready"; provider: any; signer: any; address: string };

export function makeWalletConnector() {
  let adapter = null as null | Adapter;

  const handle = {
    type: null as null | Adapter["type"],
    // Abstraction over both methods
    state: { type: "init" } as Status,

    // Populated by either method
    provider: null as any,

    async connectViaWalletConnect() {
      if (adapter) {
        adapter.disconnect();
      }
      adapter = await makeWalletConnect({ updateStatus });
      await adapter.connect();
      handle.provider = adapter.provider;
    },

    async connectViaMetamask() {
      if (adapter) {
        adapter.disconnect();
      }
      adapter = await makeMetamask({ updateStatus });
      await adapter.connect();
      handle.provider = adapter.provider;
    },
  };

  function updateStatus(s: Status) {
    if (handle.state.type !== s.type) {
      m.redraw();
    }
    handle.state = s;
  }

  return handle;
}

/**
 * An adapter abstracts away the logic behind each wallet connector.
 * ASSUMPTION:
 *    When switching from one adapter to the other,
 *    the old one gets disconnected and garbage collected.
 */
type Adapter = {
  type: "WalletConnect" | "Metamask";
  connect: () => Promise<void>;
  provider: any;
  disconnect: () => void;
};

type AdapterParams = {
  updateStatus(s: Status): void;
};

/**
 * Wallet Connect adapter
 *
 * See here for more info:
 *   https://docs.walletconnect.com/tech-spec
 *
 */
async function makeWalletConnect({ updateStatus }: AdapterParams) {
  const walletConnectProvider: WalletConnectProvider = new WalletConnectProviderUmd({
    infuraId: import.meta.env.VITE_INFURA_ID as string,
  });

  const wallet: Adapter = {
    type: "WalletConnect",
    provider: new ethers.providers.Web3Provider(walletConnectProvider),
    async connect() {
      await walletConnectProvider.enable();
      updateStatus({
        type: "ready",
        provider: wallet.provider,
        signer: wallet.provider.getSigner(),
        address: walletConnectProvider.accounts[0],
      });
    },
    disconnect() {
      // wallet.provider.off('accountsChanged')
      // wallet.provider.off('chainChanged')
      // wallet.provider.off('disconnect')
    },
  };

  updateStatus({ type: "init" });

  walletConnectProvider.on("accountsChanged", (accounts: string[]) => {
    console.log("accountsChanged", accounts);
  });

  walletConnectProvider.on("chainChanged", (chainId: number) => {
    console.log("chainChanged", chainId);
  });

  walletConnectProvider.on("disconnect", (code: number, reason: string) => {
    console.log("disconnect", code, reason);
    updateStatus({ type: "init" });
  });

  return wallet;
}

/**
 * Metamask and ethers.js
 *
 * See here for more info:
 *   https://docs.walletconnect.com/tech-spec
 *
 */
async function makeMetamask({ updateStatus }: AdapterParams) {
  const provider = new ethers.providers.Web3Provider((window as any).ethereum);
  const subs = [] as { unsubscribe: () => void }[];

  const initialAccounts = await provider.listAccounts();
  if (initialAccounts.length > 0) {
    updateStatus({
      type: "ready",
      provider,
      signer: await provider.getSigner(),
      address: initialAccounts[0],
    });
  } else {
    updateStatus({ type: "init" });
  }

  const wallet: Adapter = {
    type: "Metamask",
    provider,
    async connect() {
      let sub1 = window.ethereum.on(
        "accountsChanged",
        function (accounts: string[]) {
          console.log("accountsChanged", accounts);
          if (accounts.length === 0) {
            updateStatus({ type: "init" });
          } else {
            // TODO: Handle account change
          }
        }
      );
      let sub2 = window.ethereum.on(
        "networkChanged",
        function (networkId: number) {
          // Time to reload your interface with the new networkId
          console.log('Network changed', networkId)
        }
      );

      subs.push(sub1, sub2);

      updateStatus({ type: "connecting" });
      await provider.send("eth_requestAccounts", []);
      updateStatus({
        type: "ready",
        provider,
        signer: await provider.getSigner(),
        address: (await provider.listAccounts())[0],
      });
    },
    disconnect() {
      // window.ethereum.off()
      subs.forEach((s) => s.unsubscribe());
    },
  };

  return wallet;
}
