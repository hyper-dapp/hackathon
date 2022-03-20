import Http from "./xhr";
import { NFTStorage, File, Blob } from "nft.storage";

export type Attribute = {
  trait_type: string;
  value: any;
};

class IPFSStorageManager {
  http: any;
  client: NFTStorage;

  constructor(apiKey: string) {
    if (apiKey) {
      this.client = new NFTStorage({ token: apiKey });
      this.http = new Http();
      this.http.host = "https://ipfs.io/ipfs/";
    } else throw new Error("NFTStorage apiKey must be provided");
  }

  upload(file: string) {
    return this.client.storeDirectory([file as any]);
  }

  storeDataBlob(metadata: BlobPart) {
    const content = new Blob([metadata]);
    return this.client.storeBlob(content);
  }

  delete(cid: string) {
    return this.client.delete(cid);
  }

  createNFTMetaDataTemplate(
    logic: string,
    description: string,
    external_url: string,
    name: string,
    attributes: Attribute[] = [],
    image = ""
  ) {
    return JSON.stringify({
      description,
      external_url,
      name,
      logic,
      attributes,
      image,
    });
  }

  uploadAndGenerateMetaData(
    logic: string,
    name: string,
    description: string,
    attributes: Attribute[] = [],
    external_url: string,
    file: string
  ) {
    return new Promise(async (resolve, reject) => {
      try {
        const data: any = {
          description,
          external_url,
          name,
          logic,
          attributes,
        };

        if (file)
          data.image = new File([file], `${name}.png`, { type: "image/png" });
        const cid = await this.client.store(data);

        return resolve(cid);
      } catch (e) {
        return reject(e);
      }
    });
  }

  deleteMetaData(cid: string, cb: (progress: number) => void): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        const { image } = await this.http.get(cid);

        if (image) {
          await this.delete(image.split("/")[4]);
          if (cb) cb(0.5);
        }

        await this.delete(cid);
        if (cb) cb(1);
        return resolve();
      } catch (e) {
        return reject(e);
      }
    });
  }
}

export default IPFSStorageManager;
