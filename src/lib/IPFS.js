import Http from './xhr';
import {
  NFTStorage,
  File,
  Blob
} from 'nft.storage'

class IPFSStorageManager {
  constructor(apiKey) {
    if (apiKey) {
      this.client = new NFTStorage({ token: apiKey });
      this.http = new Http();
      this.http.host = 'https://ipfs.io/ipfs/';
    } else throw new Error('NFTStorage apiKey must be provided');
  }

  upload(file) {
    return this.client.storeDirectory([file]);
  }

  storeDataBlob(metadata) {
    const content = new Blob([metadata]);
    return this.client.storeBlob(content);
  }

  delete(cid) {
    return this.client.delete(cid);
  }

  createNFTMetaDataTemplate(logic, description, external_url, name, attributes = [], image = "") {
    return JSON.stringify({
      description,
      external_url,
      name,
      logic,
      attributes,
      image
    });
  }

  uploadAndGenerateMetaData(logic, name, description, attributes = [], external_url, file) {
    return new Promise(async (resolve, reject) => {
      try {
        const data = {
          description,
          external_url,
          name,
          logic,
          attributes
        };

        if (file) data.image = new File([ file ], `${name}.png`, { type: 'image/png' });
        const cid = await client.store(data);

        return resolve(cid);
      } catch (e) {
        return reject(e);
      }
    });
  }

  deleteMetaData(cid, cb) {
    return new Promise(async (resolve, reject) => {
      try {
        const { image } = await this.http.get(cid);

        if (image) {
          await this.delete(image.split('/')[4]);
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
