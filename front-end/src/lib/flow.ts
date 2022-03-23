import { ethers } from "ethers";
import { createFlow, convertEthersContractCallResult } from "hyperdapp";

export type Flow = Awaited<ReturnType<typeof makeFlow>>;

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
        console.log("call_fn (cache hit)", functionSig, contractAddress);
        return block.cache[cacheKey];
      }
      console.log("call_fn", functionSig, value, args, block, contractAddress);

      const returns = returnType.length
        ? ` ${mutability.view ? "view " : ""}returns ${
              returnType[0].startsWith('tuple(')
              ? returnType[0].replace(/^tuple/, '')
              : `(${returnType.join(",")})`
            }`
        : "";

      const iface = new ethers.utils.Interface([
        // Constructor
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
            console.log('[call_fn] Result:', result)
            if (Array.isArray(result)) {
              // View function call
              return result?.map(convertEthersContractCallResult)
            }
            else if (result && result.wait) {
              // Mutative function call
              return result.wait().then(() => undefined)
            }
            else {
              return result
            }
          },
          (error) => {
            console.log('[call_fn] Error:', error)
            throw error
          }
        );

      console.log("[call_fn] Final result", result);

      if (result !== undefined) {
        block.cache[cacheKey] = result;
      }

      return result;
    },
  });
}
