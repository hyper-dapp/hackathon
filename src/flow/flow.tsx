import "../global.css";

import m from "mithril";
import { cc } from "mithril-cc";
import { Flow, makeFlow } from "../lib/flow";
import { makeWalletConnector } from "../lib/wallet-connector";
import { FlowUI } from "../components/flow-ui";
import { plainText as GUESTBOOK_EXAMPLE } from "../../example-flows/guestbook.pl";

const Flow = cc(function () {
  let flow: Flow | null;
  const wallet = makeWalletConnector();

  this.oncreate(async () => {
    flow = await makeFlow(GUESTBOOK_EXAMPLE);
    m.redraw();
  });

  return () => {
    return (
      <div class="container mx-auto p-10 h-screen">
        <div class="flex flex-col items-center">
          {[
            // In an array to enable key
            m(FlowUI, {
              key: flow?.id || -1,
              flow,
              wallet,
              className: "w-[50%] rounded-xl",
            }),
          ]}
          <p class="text-white font-bold italic mt-2">Powered by HyperDapp</p>
        </div>
      </div>
    );
  };
});

m.mount(document.querySelector<HTMLDivElement>("#app")!, Flow);
