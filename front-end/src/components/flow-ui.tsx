import m from "mithril";
import { cc, uniques } from "mithril-cc";
import { unescapeString } from "hyperdapp";

import { Flow } from "../lib/flow";
import { WalletConnector } from "../lib/wallet-connector";
import { WalletButton } from "./wallet-button";
import { btnClass } from "../lib/component-classes";
import { Prompt, PromptArg } from "../lib/prompt-types";
import { renderLog, LogType } from "./ui/log";
import { Loader } from "./loader";

type ButtonAttrs = {
  enabled?: boolean;
};

type Attrs = {
  flow: Flow | null;
  wallet: WalletConnector;
  className?: string;
};
export const FlowUI = cc<Attrs>(function ($attrs) {
  const flow = $attrs().flow;
  const promptHistory = makePromptHistory();

  // Listen to wallet 'ready' state
  //
  $attrs
    .map((a) => a.wallet.state.type)
    .map(uniques())
    .map(async () => {
      const state = $attrs().wallet.state;

      if (flow && state.type === "ready") {
        // TODO: Use current block number
        await flow.init(state.address.toLowerCase(), 10, {
          signer: state.signer,
          provider: state.provider,
        });
        await promptHistory.init(flow);
        m.redraw();
      }
    });

  return ({ wallet, className }) => {
    if (!flow) {
      return (
        <div class={`${className} p-4 bg-gray-100 dark:bg-gray-700`}>
          Loading flow code...
        </div>
      );
    }

    if (wallet.state.type !== "ready") {
      return (
        <div class={`${className} p-4 bg-gray-100 dark:bg-gray-700`}>
          {m(WalletButton, { wallet })}
        </div>
      );
    }

    return (
      <div class={`${className} py-4 bg-gray-100 dark:bg-gray-700`}>
        <div class="px-4 divide-y">
          {promptHistory.all().map((prompts, i) => (
            <div class="py-6 space-y-4 flex flex-col items-center dark:border-gray-600">
              {renderPrompts({
                flow,
                prompts,
                onInput: promptHistory.handleInput,
                running: promptHistory.running,
                isLatest: i === promptHistory.length - 1,
                className: "",
                executeButtonAction: promptHistory.execute,
              })}
            </div>
          ))}
        </div>
        {promptHistory.running &&
          <div class="px-4 flex items-center justify-center">
            {m(Loader)}
          </div>
        }
      </div>
    );
  };
});

function renderPrompts(params: {
  flow: Flow;
  prompts: PromptArg[];
  running: boolean;
  isLatest: boolean;
  className: string;
  executeButtonAction(action: any[]): void;
  onInput(name: any, acceptedValue: any): void;
}): m.Child[] {
  const filtered = params.prompts.filter((p): p is Prompt => {
    const keep = typeof p !== "string";
    if (!keep) {
      console.warn(`[prompt/render] Ignoring prompt string:`, p);
    }
    return keep;
  });

  const { className } = params;

  return filtered.map(([type, ...args]) => {
    if (type === "row") {
      return (
        <div class={`flex space-x-4 ${className}`}>
          {renderPrompts({ ...params, prompts: args }).map((prompt) => (
            <div class="flex flex-1 items-center justify-center">{prompt}</div>
          ))}
        </div>
      );
    } else if (type === "col") {
      return (
        <div class={`flex flex-col space-y-2 ${className}`}>
          {renderPrompts({ ...params, prompts: args }).map((prompt) => (
            <div class="flex flex-1 items-center justify-center">{prompt}</div>
          ))}
        </div>
      );
    } else if (type === "log") {
      let [logTypeInput, logTerm] = args as [string, Prompt];
      let logType: LogType;

      if (["notice", "error", "success", "warning"].includes(logTypeInput)) {
        logType = logTypeInput as LogType;
      } else {
        console.warn(`[prompt/log/unrecognized-type]`, logTypeInput, logTerm);
        logType = "notice";
      }

      return renderLog(
        logType,
        renderPrompts({ ...params, prompts: [logTerm] })
      );
    } else if (type === "text") {
      return (
        <div class={`prompt__text ${className}`}>
          {args.map(unescapeString).join("")}
        </div>
      );
    } else if (type === "button") {
      const [buttonText, attrs, callback] = args as [
        string,
        ButtonAttrs,
        Prompt[]
      ];

      return (
        <button
          class={`${btnClass()} ${className}`}
          onclick={() => params.executeButtonAction(callback as any)}
          disabled={!params.isLatest || params.running || attrs.enabled === false}
        >
          {unescapeString(buttonText)}
        </button>
      );
    } else if (type === "input") {
      const [inputType, name] = args;

      const oninput = (e: any) => {
        params.onInput(name, e.target.value);
      }
      const disabled = !params.isLatest || params.running

      if (inputType === 'address') {
        return (
          <input
            type="text"
            disabled={disabled}
            placeholder="0x..."
            oninput={oninput}
          />
        );
      } else if (inputType === 'eth') {
        return (
          <input
            type="number"
            step="any"
            disabled={disabled}
            placeholder="0.01"
            oninput={oninput}
          />
        );

      // TODO: Support more bytes/int/uint types
      } else if (inputType === 'bytes32') {
        return (
          <input
            type="text"
            pattern="[0-9a-fA-F]"
            disabled={disabled}
            placeholder="Enter bytes32 here"
            oninput={oninput}
          />
        );
      } else if (inputType === 'text') {
        return (
          <textarea
            disabled={disabled}
            placeholder="Enter text here"
            oninput={oninput}
          ></textarea>
        );
      }
      else {
        console.warn(`[prompt/input/unrecognized-type]`, type, inputType, args)
        return <div class={className}>
          Unrecognized input type: {type}({inputType}, ...)
        </div>;
      }

    } else if (type === "debug") {
      console.log(`[prompt/debug]`, ...args);
      return null;
    } else {
      console.warn(`[prompt/unrecognized-type]`, type, args)
      return <div class={className}>
        Unrecognized type: {type}
      </div>;
    }
  })
}

function makePromptHistory() {
  let flow: Flow;
  let history: Prompt[][] = [];
  let running = true;

  const api = {
    all() {
      return history;
    },
    get length() {
      return history.length;
    },
    get running() {
      return running;
    },
    log() {
      console.log("prompts>", history[history.length - 1]);
    },
    async init(_flow: Flow) {
      flow = _flow;
      history.push(await flow.getPrompts());
      api.log();
      running = false
    },
    async execute(action: Prompt[]) {
      console.log("execute>", action);
      running = true;
      m.redraw();

      let effectPrompts: Prompt[] = [];
      try {
        const { effects } = await flow.execute(action);
        console.log("effects>", effects);

        for (let [effectType, ...effectArgs] of effects) {
          if (effectType === "log") {
            effectPrompts.push([effectType, ...effectArgs]);
          } else {
            console.log(`[effect/unrecognized-type]`, effectType, effectArgs);
          }
        }
      }
      catch(executeError) {
        console.log('execute error>', executeError);
        running = false;
        m.redraw();
        return;
      }

      let newPrompts = await flow.getPrompts();

      if (effectPrompts.length) {
        newPrompts = effectPrompts.concat(newPrompts);
      }

      history.push(newPrompts);
      api.log();
      running = false;
      m.redraw();
    },

    // TODO: Debounce
    async handleInput(name: any, inputValue: any) {
      const accepted = await flow.handleInput(name, inputValue);
      if (!accepted) return

      // TODO: Write ui queue system to properly update browser input value
      console.log("acceptedValue", accepted.value)

      // Grab new prompts first so we can change array atomically
      const newPrompts = await flow.getPrompts();
      history.pop();
      history.push(newPrompts);
      api.log();
      m.redraw();
    },
  };

  return api;
}
