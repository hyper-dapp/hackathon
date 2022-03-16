import m from 'mithril'
import {cc} from 'mithril-cc'
import IPFSStorageManager, { Attribute } from '../lib/IPFS'

type Attrs = {
  cortexCode: string
  onDismiss(): void
}

export const UploadModal = cc<Attrs>(function($attrs) {
  let cid: any
  let config = {};

  const executePublish = async () => {
    console.log(import.meta.env);
    const ipfs = new IPFSStorageManager(import.meta.env.VITE_NFT_STORAGE_API_KEY as string);
    const pl = $attrs().cortexCode

    const attributes: Attribute[] = [
      {
        "trait_type": "version",
        "value": '1.0.0'
      },
      {
        "trait_type": "platform",
        "value": 'HyperDapp'
      },
      {
        "trait_type": "flow version",
        "value": '1.0.0'
      }
    ];

    try {
      const {
        name,
        description,
        external_url,
        image_url
      } = config;

      if (name && description) {
        const metaData = ipfs.createNFTMetaDataTemplate(pl, description, external_url, name, attributes, image_url);
        cid = await ipfs.storeDataBlob(metaData);

        console.log(cid);
      } else {
        console.error('Name and Description are required');
      }

      return;
    } catch (e) {
      return console.error(e);
    }
  }

  const dismissClicked = e => {
    console.log(config);
    $attrs().onDismiss();
  }

  const uploadForm = () => {
    return (
      <div>
        <div>
          <div class="mt-3 text-center sm:mt-5">
            <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">Publish Workflow</h3>
            <div class="mt-2">
              <p class="text-sm text-gray-500">{}</p>
            </div>
          </div>
        </div>

        <div>
          <label for="name" class="ml-px pl-4 block text-sm font-medium text-gray-700">Name</label>
          <div class="mt-1">
            <input type="text" onchange={e => config.name = e.target.value} name="name" id="name" class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 px-4 rounded-full" placeholder="dApp Name" />
          </div>
        </div>
        <br />
        <div>
          <label for="name" class="ml-px pl-4 block text-sm font-medium text-gray-700">Description</label>
          <div class="mt-1">
            <input type="text" onchange={e => config.description = e.target.value} name="description" id="description" class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 px-4 rounded-full" placeholder="dApp Description" />
          </div>
        </div>
        <br />
        <div>
          <label for="external_url" class="ml-px pl-4 block text-sm font-medium text-gray-700">External URL</label>
          <div class="mt-1">
            <input type="text" onchange={e => config.external_url = e.target.value} name="external url" id="external_url" class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 px-4 rounded-full" placeholder="External URL" />
          </div>
        </div>
        <br />
        <div>
          <label for="image_url" class="ml-px pl-4 block text-sm font-medium text-gray-700">Image URL</label>
          <div class="mt-1">
            <input type="text" onchange={e => config.image_url = e.target.value} name="image url" id="image_url" class="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 px-4 rounded-full" placeholder="Image URL" />
          </div>
        </div>

        <div class="mt-5 sm:mt-6">
          <button type="button" onclick={executePublish} class="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm">Upload</button>
        </div>
      </div>
    );
  }

  const submissionSuccess = (cid) => {
    return (
      <div>
        <div>
          <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg class="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div class="mt-3 text-center sm:mt-5">
            <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">Upload successful</h3>
            <div class="mt-2">
              <p class="text-sm text-gray-500">{cid}</p>
            </div>
          </div>
        </div>

        <div class="mt-5 sm:mt-6">
          <button type="button" onclick={dismissClicked} class="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm">Close</button>
        </div>
      </div>
    );
  }

  return () => {
    return (
      <div class="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
        <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
          <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
          <div class="relative inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">


          <div class="hidden sm:block absolute top-0 right-0 pt-4 pr-4">
            <button onclick={dismissClicked} type="button" class="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              <span class="sr-only">Close</span>
              <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          { cid ? submissionSuccess(cid) : uploadForm() }
          </div>
        </div>
      </div>
    );
  }
})
