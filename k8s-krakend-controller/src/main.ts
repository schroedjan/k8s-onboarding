import {
  KubeConfig,
  Watch,
  V1ConfigMap,
} from '@kubernetes/client-node'
import { reconcileConfigMap } from './controller'
import { getKubeConfig } from './config'

// Load Kubernetes configuration
const kc: KubeConfig = getKubeConfig()

const watch = new Watch(kc)

// Label selector for ConfigMaps
const labelSelector = 'api-gateway=icp'
// Start watching for ConfigMap changes
watch.watch(
  `/api/v1/configmaps`,
  { labelSelector },
  async (type: string, obj: V1ConfigMap) => {
    console.log(`Event type: ${type}`)
    if (type === 'ADDED' || type === 'MODIFIED') {
      await reconcileConfigMap(obj)
    } else if (type === 'DELETED') {
      console.log(`ConfigMap deleted: ${obj.metadata?.name}`)
    }
  },
  (err: unknown) => {
    console.error('Error watching ConfigMaps:', err)
  }
)
