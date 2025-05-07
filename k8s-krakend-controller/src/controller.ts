import { AppsV1Api, CoreV1Api, V1ConfigMap } from '@kubernetes/client-node'
import { getConfig, getApiClient } from './config'

/**
 * Handles the addition event for a Kubernetes ConfigMap.
 * This function is triggered when a new ConfigMap is added to the cluster.
 *
 * @param {V1ConfigMap} obj - The ConfigMap object that was added
 * @returns {Promise<void>} A promise that resolves when the handling is complete
 */
export async function handleConfigMapAdded(obj: V1ConfigMap): Promise<void> {
  const name = obj.metadata?.name
  const namespace = obj.metadata?.namespace

  if (!name || !namespace) {
    console.error('Invalid ConfigMap object: missing name or namespace.')
    return
  }

  const templateKeyName = getTemplateKeyName(obj)
  if (!templateKeyName) {
    console.error('Invalid ConfigMap object: missing template key name.')
    return
  }
  const v1CoreApi: CoreV1Api = getApiClient(CoreV1Api)
  const templatesConfigMap = await v1CoreApi.readNamespacedConfigMap({
    name: getConfig().templatesConfigMapName,
    namespace: getConfig().templatesConfigMapNamespace
  })
  if (templatesConfigMap.data) {
    // const templateKey = Object.keys(templatesConfigMap.data).find(key => key === templateKeyName)
    templatesConfigMap.data[templateKeyName] = extractAndConcatenateJsonObjects(obj) ?? ''
    await v1CoreApi.replaceNamespacedConfigMap({
      body: templatesConfigMap,
      name: getConfig().templatesConfigMapName,
      namespace: getConfig().templatesConfigMapNamespace,
    })
    console.log(`Added key ${templateKeyName} to ConfigMap ${getConfig().templatesConfigMapName}.`)
  } else {
    console.error('Invalid ConfigMap object: missing data.')
  }
}

/**
 * Handles the deletion event for a Kubernetes ConfigMap.
 * This function is triggered when a ConfigMap is deleted from the cluster.
 *
 * @param {V1ConfigMap} obj - The ConfigMap object that was deleted
 * @returns {Promise<void>} A promise that resolves when the handling is complete
 */
export async function handleConfigMapDeleted(obj: V1ConfigMap): Promise<void> {
  const name = obj.metadata?.name
  const namespace = obj.metadata?.namespace

  if (!name || !namespace) {
    console.error('Invalid ConfigMap object: missing name or namespace.')
    return
  }

  const templateKeyName = getTemplateKeyName(obj)
  const v1CoreApi: CoreV1Api = getApiClient(CoreV1Api)
  const templatesConfigMap = await v1CoreApi.readNamespacedConfigMap({
    name: getConfig().templatesConfigMapName,
    namespace: getConfig().templatesConfigMapNamespace
  })
  if (templatesConfigMap.data) {
    const templateKey = Object.keys(templatesConfigMap.data).find(key => key === templateKeyName)
    if (templateKey) {
      delete templatesConfigMap.data[templateKey]
      await v1CoreApi.replaceNamespacedConfigMap({
        body: templatesConfigMap,
        name: getConfig().templatesConfigMapName,
        namespace: getConfig().templatesConfigMapNamespace,
      })
      console.log(`Removed key ${templateKey} from ConfigMap ${getConfig().templatesConfigMapName}.`)
    } else {
      console.log(`Template key ${templateKeyName} not found in ConfigMap ${getConfig().templatesConfigMapName}.`)
    }
  } else {
    console.error('Invalid ConfigMap object: missing data.')
  }
}

/**
 * Initializes the ConfigMap by creating it if it doesn't exist.
 * This function is called when the controller starts up.
 * It ensures that the ConfigMap is present and ready for use.
 *
 * @async
 * @function initConfigMap
 * @throws Will throw an error if the ConfigMap creation fails.
 * @returns {Promise<void>} A promise that resolves when the ConfigMap is initialized.
 *
 **/
export async function initConfigMap() {
  const v1CoreApi: CoreV1Api = getApiClient(CoreV1Api)
  const configMapName = getConfig().templatesConfigMapName
  const configMapNamespace = getConfig().templatesConfigMapNamespace

  try {
    // Check if the ConfigMap already exists
    await v1CoreApi.readNamespacedConfigMap({
      name: configMapName,
      namespace: configMapNamespace
    })
    console.log(`ConfigMap ${configMapName} already exists in namespace ${configMapNamespace}.`)
  } catch (error) {
    if (error.code === 404) {
      // Create the ConfigMap if it doesn't exist
      const configMap = {
        apiVersion: 'v1',
        kind: 'ConfigMap',
        metadata: {
          name: configMapName,
          namespace: configMapNamespace,
        },
        data: {
          [getConfig().templatesIndexKey]: '',
        }
      }
      await v1CoreApi.createNamespacedConfigMap({
        body: configMap,
        namespace: configMapNamespace
      })
      console.log(`Created ConfigMap ${configMapName} in namespace ${configMapNamespace}.`)
    } else {
      console.error(`Failed to read or create ConfigMap ${configMapName}: ${error.message}`)
      throw error
    }
  }
}

/**
 * Updates the index key in a Kubernetes ConfigMap by aggregating all other keys in the ConfigMap.
 * The function ensures that the ConfigMap is only updated if it hasn't changed since it was read.
 * It also includes a retry mechanism with exponential backoff in case of failures.
 *
 * @async
 * @function updateIndexKey
 * @throws Will throw an error if the maximum number of retries is reached or if the ConfigMap is invalid.
 */
export async function updateIndexKey() {
  const v1CoreApi: CoreV1Api = getApiClient(CoreV1Api)
  const maxRetries = getConfig().templatesIndexMaxRetries ?? 5
  const backoffDelay = getConfig().templatesIndexBackoffDelay ?? 1000

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Read the Templates configMap and get all keys, omitting the index key
      const templatesConfigMap = await v1CoreApi.readNamespacedConfigMap({
        name: getConfig().templatesConfigMapName,
        namespace: getConfig().templatesConfigMapNamespace
      })

      if (templatesConfigMap.data) {
        const keys = Object.keys(templatesConfigMap.data).filter(key => key !== getConfig().templatesIndexKey)
        const indexKeyValue = keys.map((key, index) => {
          const isLast = index === keys.length - 1
          return `{{- template "${key}" . -}}${isLast ? '' : ','}`
        }).join('\n')
        templatesConfigMap.data[getConfig().templatesIndexKey] = indexKeyValue

        // Include resourceVersion to ensure the ConfigMap hasn't changed
        await v1CoreApi.replaceNamespacedConfigMap({
          body: {
            ...templatesConfigMap,
            metadata: {
              ...templatesConfigMap.metadata,
              resourceVersion: templatesConfigMap.metadata?.resourceVersion
            }
          },
          name: getConfig().templatesConfigMapName,
          namespace: getConfig().templatesConfigMapNamespace,
        })
        console.log(`Updated index key ${getConfig().templatesIndexKey} in ConfigMap ${getConfig().templatesConfigMapName}.`)
        return // Exit the function if the update succeeds
      } else {
        console.error('Invalid ConfigMap object: missing data.')
        return
      }
    } catch (error) {
      console.error(`Attempt ${attempt} failed: ${error.message}`)
      if (attempt < maxRetries) {
        const delay = backoffDelay * Math.pow(2, attempt - 1) // Exponential backoff
        console.log(`Retrying in ${delay}ms...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      } else {
        console.error('Max retries reached. Failed to update the ConfigMap.')
        throw error
      }
    }
  }
}

/**
 * Will trigger a rolling update of the api gateway deployment to pick up the new configMap values.
 *
 * @async
 * @function triggerRollingUpdate
 * @throws Will throw an error if the deployment is not found or if the update fails.
 * @returns {Promise<void>} A promise that resolves when the rolling update is triggered.
 *
 **/
export async function triggerRollingUpdate() {
  const v1AppsApi: AppsV1Api = getApiClient(AppsV1Api);
  const deploymentName = getConfig().gatewayDeploymentName;
  const namespace = getConfig().gatewayDeploymentNamespace;
  const maxRetries = getConfig().templatesRollingUpdateMaxRetries ?? 5;
  const backoffDelay = getConfig().templatesRollingUpdateBackoffDelay ?? 1000;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Fetch the latest version of the deployment
      const deploymentResponse = await v1AppsApi.readNamespacedDeployment({
        name: deploymentName,
        namespace: namespace
      });
      const deployment = deploymentResponse;

      // Ensure deployment.spec is defined
      if (!deployment.spec || !deployment.spec.template.metadata) {
        throw new Error(`Deployment ${deploymentName} is missing required fields.`);
      }

      // Add or update the 'kubectl.kubernetes.io/restartedAt' annotation
      deployment.spec.template.metadata.annotations = {
        ...deployment.spec.template.metadata.annotations,
        'kubectl.kubernetes.io/restartedAt': new Date().toISOString(),
      };

      // Update the deployment with the latest resourceVersion
      await v1AppsApi.replaceNamespacedDeployment({
        body: {
          ...deployment,
          metadata: {
            ...deployment.metadata,
            resourceVersion: deployment.metadata?.resourceVersion
          }
        },
        name: deploymentName,
        namespace: namespace,
      });
      console.log(`Triggered rolling update for deployment ${deploymentName}.`);
      return; // Exit the function if the update succeeds
    } catch (error) {
      console.error(`Attempt ${attempt} failed: ${error.message}`);
      if (attempt < maxRetries) {
        const delay = backoffDelay * Math.pow(2, attempt - 1); // Exponential backoff
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        console.error('Max retries reached. Failed to trigger rolling update.');
        throw error;
      }
    }
  }
}

/**
 * Extracts and concatenates all JSON objects from a ConfigMap
 * @param obj The Kubernetes ConfigMap object
 * @returns A string containing all concatenated JSON objects or undefined if no data
 */
export function extractAndConcatenateJsonObjects(obj: V1ConfigMap): string | undefined {
  if (!obj || !obj.data) {
    console.error('Invalid ConfigMap object: missing data.')
    return undefined
  }

  let concatenatedJson = ''

  // Process each key in the ConfigMap
  for (const key of Object.keys(obj.data)) {
    const value = obj.data[key]
    if (value) {
      // Append the value (which may contain multiple JSON objects)
      concatenatedJson += value
    }
  }

  return concatenatedJson.length > 0 ? concatenatedJson : undefined
}

/**
 * Generates a unique key name for a ConfigMap template based on its namespace and name.
 * This key is used to identify and store the different config values in the central krakend-templates ConfigMap.
 * @returns {string | undefined} A string in the format `${namespace}-${name}` or undefined if the ConfigMap is invalid
 */
export function getTemplateKeyName(cm: V1ConfigMap): string | undefined {
  const name = cm.metadata?.name
  const namespace = cm.metadata?.namespace

  if (!name || !namespace) {
    console.error('Invalid ConfigMap object: missing name or namespace.')
    return undefined
  }
  return `${namespace}-${name}.tmpl`
}
