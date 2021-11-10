import { Asset } from "./assets";

interface PromiseStaler<T> {
    resolve: (result: T) => void;
    reject: (err: any) => void;
}


const alreadyLoaded = new Map<Asset, HTMLImageElement>();
const loading = new Map<Asset, PromiseStaler<HTMLImageElement>[]>()

export function imageLoader(asset: Asset) {
    return new Promise<HTMLImageElement>(async (resolve, reject) => {
        const loadedImage = alreadyLoaded.get(asset);
        if (loadedImage) {
            return resolve(loadedImage);
        }
        const promiseObservers = loading.get(asset);
        const promiseStaler: PromiseStaler<HTMLImageElement> = {
            resolve, reject
        }

        const emit = (res?: HTMLImageElement, err?: any) => {
            const ob = loading.get(asset);
            if (ob) {
                for (const pr of ob) {
                    if (res) {
                        pr.resolve(res);
                    } else {
                        pr.reject(err || new Error('Unknown error'))
                    }
                }
                loading.delete(asset);
            }

        }

        if (promiseObservers) {
            promiseObservers.push(promiseStaler);
            loading.set(asset, promiseObservers);
        } else {
            try {
                loading.set(asset, [promiseStaler]);
                const image = await loadImageAsset(asset);
                alreadyLoaded.set(asset, image);
                emit(image);
            } catch (error) {
                emit(undefined, error);
            }
        }
    });
}


function loadImageAsset(asset: Asset): Promise<HTMLImageElement> {
    return new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image;
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', reject);
        image.src = `data:image/${asset.ex};base64,${asset.data}`;
    });
}