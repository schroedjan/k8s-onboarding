import {
  KubeConfig,
  Watch,
  V1ConfigMap,
} from '@kubernetes/client-node'
import { initConfigMap, updateIndexKey, triggerRollingUpdate, handleConfigMapAdded, handleConfigMapDeleted } from './controller'
import { getConfig, getKubeConfig } from './config'

// Initialize Controller
console.log('Starting Kubernetes ConfigMap Controller')
initConfigMap()

// Load Kubernetes configuration
const watch = new Watch(getKubeConfig())
const labelSelector = getConfig().labelSelector
// Label selector for ConfigMaps
// Start watching for ConfigMap changes
watch.watch(
  `/api/v1/configmaps`,
  { labelSelector },
  async (type: string, obj: V1ConfigMap) => {
    console.log(`Event type: ${type}`)
    if (type === 'ADDED' || type === 'MODIFIED') {
      await handleConfigMapAdded(obj)
      await updateIndexKey()
      await triggerRollingUpdate()

    } else if (type === 'DELETED') {
      await handleConfigMapDeleted(obj)
      await updateIndexKey()
      await triggerRollingUpdate()
    }
  },
  (err: unknown) => {
    console.error('Error watching ConfigMaps:', err)
  }
)
