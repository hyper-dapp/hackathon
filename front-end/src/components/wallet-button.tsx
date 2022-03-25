import m from "mithril";
import { ccs } from "mithril-cc";
import { btnClass } from "../lib/component-classes";
import { WalletConnector } from "../lib/wallet-connector";

type Attrs = {
  wallet: WalletConnector;
};
export const WalletButton = ccs<Attrs>(({ wallet }) => {
  const state = wallet.state;
  return (
    <div class="flex flex-col items-center text-3xl font-bold">
      {state.type === "loading" && "Loading"}
      {state.type === "init" &&
        <button
          class={`m-2 ${btnClass({ size: "lg" })}`}
          onclick={() => wallet.connectViaWalletConnect()}
        >
          Connect with Wallet Connect
        </button>
      }
      {state.type === "init" &&
        <button
          class={`m-2 ${btnClass({ size: "lg" })}`}
          onclick={() => wallet.connectViaMetamask()}
        >
          Connect with Metamask
        </button>
      }
      {state.type === "ready" && `Ready (${wallet.type})`}
      {state.type === "error" && `Error ${state.error.message}`}
    </div>
  );
});
