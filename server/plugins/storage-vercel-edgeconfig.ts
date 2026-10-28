import {normalizeKey, joinKeys, type Driver} from "unstorage";
import {GlobalConfigClient, createClient} from "@vercel/global-config";
import {definePlugin} from "nitro";
import {useRuntimeConfig} from "nitro/runtime-config";
import {useStorage} from "nitro/storage";

export default definePlugin(() => {
    if (useRuntimeConfig().platform === "vercel")
        useStorage().mount("config", storageDriver({}))
})

type GlobalConfigDriverOptions = {
    base?: string,
    url?: string
}

const storageDriver = (opts: GlobalConfigDriverOptions): Driver<GlobalConfigDriverOptions, GlobalConfigClient> => {
    const base = normalizeKey(opts?.base)
    const r = (...keys: string[]) => joinKeys(base, ...keys)

    let _client: GlobalConfigClient
    const getClient = () => {
        if (!_client) {
            const url = opts.url || process.env.GLOBAL_CONFIG || process.env.EDGE_CONFIG
            if (!url)
                throw new Error("[unstorage] No Global Config connection URL provided")
            _client = createClient(url)
        }
        return _client
    }

    return {
        name: "vercel-global-config",
        getInstance: getClient,
        hasItem: (key) => getClient().has(r(key)),
        getItem: (key) => getClient().get(r(key)),
        getKeys: (_base) => getClient().getAll()
    }
}
