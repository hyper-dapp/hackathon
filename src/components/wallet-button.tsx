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
    <h1 class="text-3xl font-bold underline">
      {state.type === "loading" && "Loading"}
      {state.type === "init" && (
        <div class="p-4">
          <button
            class={`m-2 ${btnClass({ size: "lg" })}`}
            onclick={() => wallet.connectViaWalletConnect()}
          >
            Connect with Wallet Connect
          </button>
          <button
            class={`m-2 ${btnClass({ size: "lg" })}`}
            onclick={() => wallet.connectViaMetamask()}
          >
            Connect with Metamask
          </button>
        </div>
      )}
      {state.type === "ready" && `Ready (${wallet.type})`}
      {state.type === "error" && `Error ${state.error.message}`}
    </h1>
  );
});
