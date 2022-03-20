import "../global.css";

import m from "mithril";
import { cc } from "mithril-cc";
import { Flow, makeFlow } from "../lib/flow";
import { makeWalletConnector } from "../lib/wallet-connector";
import { FlowUI } from "../components/flow-ui";

const Flow = cc(function () {
  let flow: Flow | null;
  let query = m.parseQueryString(window.location.search)
  let noSuchFlow = false

  const wallet = makeWalletConnector();

  this.oncreate(async () => {
    if (!query.cid) {
      noSuchFlow = true;
      return;
    }

    try {
      const req = await fetch(`https://ipfs.io/ipfs/${query.cid}`);
      if (req.status !== 200) {
        throw new Error('bad_request');
      }

      const json = await req.json()
      if (typeof json.logic !== 'string') {
        throw new Error('bad_request');
      }

      flow = await makeFlow(json.logic);
    }
    catch(err) {
      noSuchFlow = true;
    }

    m.redraw();
  });

  return () => {
    return (
      <div class="container mx-auto p-10 h-screen">
        <div class="flex flex-col items-center">
          {[
            // In an array to enable key
            !noSuchFlow &&
            m(FlowUI, {
              key: flow?.id || -1,
              flow,
              wallet,
              className: "w-[50%] rounded-xl",
            }),
          ]}
          {noSuchFlow &&
            <div class="dark:text-red-300">
              {query.cid
                ? `No such flow for given CID (${query.cid})`
                : 'No given flow CID.'
              }
            </div>
          }
          <p class="text-white font-bold italic mt-2">Powered by HyperDapp</p>
        </div>
      </div>
    );
  };
});

m.mount(document.querySelector<HTMLDivElement>("#app")!, Flow);
