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
        console.log("onCallFn (cache hit)", functionSig, contractAddress);
        return block.cache[cacheKey];
      }
      console.log("onCallFn", functionSig, args, block, contractAddress);

      const returns = returnType.length
        ? ` ${mutability.view ? "view " : ""}returns (${returnType.join(",")})`
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
          (yes) =>
            console.log("yes", yes) || yes.map(convertEthersContractCallResult),
          (no) => {
            console.log("no", no);
            throw no;
          }
        );

      console.log("Result", result);

      block.cache[cacheKey] = result;

      return result;
    },
  });
}
