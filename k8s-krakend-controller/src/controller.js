const k8s = require('@kubernetes/client-node');

// Load Kubernetes configuration
const kc = new k8s.KubeConfig();
kc.loadFromDefault();

const coreApi = kc.makeApiClient(k8s.CoreV1Api);
const watch = new k8s.Watch(kc);

// Label selector for ConfigMaps
const labelSelector = 'api-gateway=icp';

// Function to recursively find the 'endpoints' key
function findEndpoints(obj) {
  if (typeof obj !== 'object' || obj === null) return null;

  if (Array.isArray(obj)) {
    for (const item of obj) {
      const result = findEndpoints(item);
      if (result) return result;
    }
  } else {
    for (const key of Object.keys(obj)) {
      if (key === 'endpoints' && Array.isArray(obj[key])) {
        return obj[key];
      }
      const result = findEndpoints(obj[key]);
      if (result) return result;
    }
  }
  return null;
}

// Reconcile function
async function reconcileConfigMap(obj) {
  const name = obj.metadata.name;
  const namespace = obj.metadata.namespace;

  // Fetch the ConfigMap
  try {
    const configMap = await coreApi.readNamespacedConfigMap(name, namespace);
    console.log(`ConfigMap ${name} in namespace ${namespace} exists.`);
    const data = configMap.body.data;
    // Parse each key in the ConfigMap as JSON and search for 'endpoints'
    for (const key of Object.keys(data)) {
      try {
        const parsedData = JSON.parse(data[key]);
        const endpoints = findEndpoints(parsedData);
        console.log(`Found endpoints for key ${key}:`, endpoints);
      } catch (err) {
        console.warn(`Failed to parse key ${key} in ConfigMap ${obj.metadata.name} as JSON.`);
      }
    }
  } catch (err) {
    // if (err.response.statusCode === 404) {
    //   console.log(`ConfigMap ${name} in namespace ${namespace} not found.`);
    //   // Handle the case where the ConfigMap does not exist
    // } else {
    //   console.error('Error fetching ConfigMap:', err);
    // }
    console.error(`Error fetching ConfigMap ${name} in namespace ${namespace}:`, err);
  }
}

// Start watching for ConfigMap changes
watch.watch(
  `/api/v1/configmaps`,
  { labelSelector },
  async (type, obj) => {
    console.log(`Event type: ${type}`);
    if (type === 'ADDED' || type === 'MODIFIED') {
      await reconcileConfigMap(obj);
    } else if (type === 'DELETED') {
      console.log(`ConfigMap deleted: ${obj.metadata.name}`);
    }
  },
  (err) => {
    console.error('Error watching ConfigMaps:', err);
  }
);

