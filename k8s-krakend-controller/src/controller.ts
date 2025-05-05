import { CoreV1Api, V1ConfigMap } from '@kubernetes/client-node'
import { getApiClient } from './config'

// Function to recursively find the 'endpoints' key
function findEndpoints(obj: unknown): unknown[] | null {
  if (typeof obj !== 'object' || obj === null) return null

  if (Array.isArray(obj)) {
    for (const item of obj) {
      const result = findEndpoints(item)
      if (result) return result
    }
  } else {
    for (const key of Object.keys(obj)) {
      if (
        key === 'endpoints' &&
        Array.isArray((obj as Record<string, unknown>)[key])
      ) {
        return (obj as Record<string, unknown>)[key] as unknown[]
      }
      const result = findEndpoints((obj as Record<string, unknown>)[key])
      if (result) return result
    }
  }
  return null
}

// Reconcile function
export async function reconcileConfigMap(obj: V1ConfigMap): Promise<void> {
  const name = obj.metadata?.name
  const namespace = obj.metadata?.namespace

  if (!name || !namespace) {
    console.error('Invalid ConfigMap object: missing name or namespace.')
    return
  }
  const coreApi = getApiClient(CoreV1Api)
  // Fetch the ConfigMap
  try {
    const configMap = await coreApi.readNamespacedConfigMap(name, namespace)
    console.log(`ConfigMap ${name} in namespace ${namespace} exists.`)
    const data = configMap.body.data

    if (data) {
      // Parse each key in the ConfigMap as JSON and search for 'endpoints'
      for (const key of Object.keys(data)) {
        try {
          const parsedData = JSON.parse(data[key])
          const endpoints = findEndpoints(parsedData)
          console.log(`Found endpoints for key ${key}:`, endpoints)
        } catch (err) {
          console.warn(
            `Failed to parse key ${key} in ConfigMap ${name} as JSON.`
          )
        }
      }
    }
  } catch (err) {
    console.error(
      `Error fetching ConfigMap ${name} in namespace ${namespace}:`,
      err
    )
  }
}
