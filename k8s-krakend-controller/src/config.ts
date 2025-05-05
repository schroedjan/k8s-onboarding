import { KubeConfig, ApiType } from '@kubernetes/client-node'

let kc: KubeConfig
const apiClientCache = new Map<string, unknown>()

export function getKubeConfig(): KubeConfig {
  if (kc === undefined) {
    kc = new KubeConfig()
    kc.loadFromDefault()
  }
  return kc
}

export function getApiClient<T extends ApiType>(
  ApiClass: new (...args: any[]) => T
): T {
  const className = ApiClass.name

  if (!apiClientCache.has(className)) {
    const apiClient = getKubeConfig().makeApiClient(ApiClass)
    apiClientCache.set(className, apiClient)
  }

  return apiClientCache.get(className) as T
}
