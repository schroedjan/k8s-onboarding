import { KubeConfig, ApiType } from '@kubernetes/client-node'

let kc: KubeConfig
const apiClientCache = new Map<string, unknown>()
const config = loadConfig();

/**
 * Controller configuration options that can be set via environment variables
 */
interface ControllerConfig {
  /** Name of the ConfigMap containing KrakenD templates (env: TEMPLATES_CONFIGMAP_NAME) */
  templatesConfigMapName: string;
  /** Namespace of the ConfigMap containing KrakenD templates (env: TEMPLATES_CONFIGMAP_NAMESPACE) */
  templatesConfigMapNamespace: string;
  /** Key in the ConfigMap containing KrakenD summarized include directives (env: TEMPLATES_INDEX_KEY) */
  templatesIndexKey: string;
  /** Key in the ConfigMap containing KrakenD summarized include directives (env: TEMPLATES_INDEX_KEY) */
  templatesIndexMaxRetries?: number;
  /** Key in the ConfigMap containing KrakenD summarized include directives (env: TEMPLATES_INDEX_KEY) */
  templatesIndexBackoffDelay?: number;
  /** Name of the Gateway deployment (env: GATEWAY_DEPLOYMENT_NAME) */
  gatewayDeploymentName: string;
  /** Namespace of the Gateway deployment (env: GATEWAY_DEPLOYMENT_NAMESPACE) */
  gatewayDeploymentNamespace: string;
  /** Label selector for the Gateway deployment (env: LABEL_SELECTOR) */
  labelSelector: string;
}

/**
 * Loads controller configuration from environment variables with defaults
 * @returns {ControllerConfig} Configuration object with all settings
 */
function loadConfig(): ControllerConfig {
  return {
    templatesConfigMapName: process.env.TEMPLATES_CONFIGMAP_NAME ?? 'krakend-templates',
    templatesConfigMapNamespace: process.env.TEMPLATES_CONFIGMAP_NAMESPACE ?? 'api-gateway',
    templatesIndexKey: process.env.TEMPLATES_INDEX_KEY ?? 'endpoints.tmpl',
    templatesIndexMaxRetries: parseInt(process.env.TEMPLATES_INDEX_MAX_RETRIES ?? '5', 10) ?? 5,
    templatesIndexBackoffDelay: parseInt(process.env.TEMPLATES_INDEX_BACKOFF_DELAY ?? '1000', 10) ?? 1000,
    gatewayDeploymentName: process.env.GATEWAY_DEPLOYMENT_NAME ?? 'api-gateway',
    gatewayDeploymentNamespace: process.env.GATEWAY_DEPLOYMENT_NAMESPACE ?? 'api-gateway',
    labelSelector: process.env.LABEL_SELECTOR ?? 'api-gateway=icp',
  };
}

/**
 * Returns the controller configuration object
 * @returns {ControllerConfig} The controller configuration object
 */
export function getConfig(): ControllerConfig {
  return config
}

/**
 * Returns the KubeConfig object, loading it from default if not already loaded
 * @returns {KubeConfig} The KubeConfig object
 */
export function getKubeConfig(): KubeConfig {
  if (kc === undefined) {
    kc = new KubeConfig()
    kc.loadFromDefault()
  }
  return kc
}

/**
 * Returns a cached API client for the specified API class.
 * If the client is not already cached, it creates a new one and caches it.
 * @param ApiClass The API class to create a client for
 * @returns {T} The API client
 */
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
