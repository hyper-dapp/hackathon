import JSONbig from 'json-bigint'
import { ethers } from "ethers";
import { createFlow, convertEthersContractCallResult } from "hyperdapp";

export type Flow = Awaited<ReturnType<typeof makeFlow>>;

const JSON_bigint = JSONbig({ useNativeBigInt: true, alwaysParseAsBig: true })

export async function makeFlow(code: string) {
  return await createFlow(code, {

    async onCallFn({
      block,
      env,
      contractAddress,
      functionSig,
      paramTypes,
      args,
      returnType,
      value,
      mutability,
    }: any) {
      const cacheKey =
        functionSig +
        (paramTypes.length == 0
          ? ""
          : ethers.utils.defaultAbiCoder.encode(paramTypes, args));

      // TODO: Handle more cases
      if (mutability.view && block.cache[cacheKey]) {
        console.log("[call_fn] (cache hit)", functionSig, contractAddress);
        return block.cache[cacheKey];
      }
      console.log("[call_fn]", functionSig, value, args, block, contractAddress);

      const returns = returnType.length
        ? ` ${mutability.view ? "view " : ""}returns ${
              returnType[0].startsWith('tuple(')
              ? returnType[0].replace(/^tuple/, '')
              : `(${returnType.join(",")})`
            }`
        : "";

      const iface = new ethers.utils.Interface([
        `function ${functionSig}${
          mutability.payable ? " payable" : ""
        }${returns}`,
      ]);
      const contract = new ethers.Contract(
        contractAddress,
        iface,
        env.provider
      );
      const result = await contract
        .connect(env.signer)
        .functions[functionSig](...args, { value: value })
        .then(
          (result) => {
            // console.log('[call_fn] Raw result:', result)
            if (Array.isArray(result)) {
              // View function call
              return result?.map(convertEthersContractCallResult)
            }
            else if (result && result.wait) {
              // Mutative function call
              console.log("[call_fn] Waiting on transaction...")
              return result.wait().then(
                function onSucess() {
                  console.log("[call_fn] Transaction successful!")
                  // Return "nothing" to indicate success
                  return []
                },
                function onError(err: any) {
                  console.log("[call_fn] Transaction failed", err)
                }
              )
            }
            else {
              return result
            }
          },
          (error) => {
            if (error.code === 4001) {
              console.log('[call_fn] User cancelled metamask transaction', error)
            }
            else if (error.message.match(/request rejected/i)) {
              console.log('[call_fn] WalletConnect transaction rejected', error)
            }
            else {
              console.log('[call_fn] Error:', error)
              throw error
            }
          }
        );

      console.log("[call_fn] Returned:", result);

      if (result !== undefined) {
        block.cache[cacheKey] = result;
      }

      return result;
    },

    async onCallHttp({ method, url, cache }: any) {
      // Currently only support GET requests
      if (method !== 'GET') {
        console.error('[call_http] Only GET calls are currently supported')
        throw new Error('http_non_get')
      }

      if (cache[url]) {
        console.log('[call_http] GET (cache hit)', url)
        return cache[url]
      }
      console.log('[call_http] GET', url)

      const res = await fetch(url)
      const body = await res.text()
      let json: any = undefined
      try {
        json = JSON_bigint.parse(body)
        console.log('[call_http] Result:', json)
      }
      catch {
        console.log('[call_http] Failed to parse:', body)
        json = undefined
      }
      const result = [
        res.status,
        // @ts-ignore
        Object.fromEntries(res.headers.entries()),
        json,
      ]

      if (json) {
        cache[url] = result
      }

      return result
    },
  });
}
