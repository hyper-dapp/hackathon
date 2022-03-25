import m from "mithril";
import { cc } from "mithril-cc";
import { Flow, makeFlow } from "../lib/flow";
import { makeWalletConnector } from "../lib/wallet-connector";
import { FlowUI } from "../components/flow-ui";

export const FlowPage = cc(function () {
  let flow: Flow | null;
  let cid = m.route.param('cid')
  let name = ''
  let noSuchFlow = false

  const wallet = makeWalletConnector();

  this.oncreate(async () => {
    if (!cid) {
      noSuchFlow = true;
      return;
    }

    try {
      const req = await fetch(`https://ipfs.io/ipfs/${cid}`);
      if (req.status !== 200) {
        throw new Error('bad_request');
      }

      const json = await req.json()
      if (typeof json.logic !== 'string') {
        throw new Error('bad_request');
      }

      name = json.name;
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
          {name &&
            <h1 class="mb-4 text-xl font-medium">{name}</h1>
          }
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
              {cid
                ? `No such flow for given CID (${cid})`
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
