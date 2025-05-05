import { CoreV1Api, V1ConfigMap, KubeConfig } from '@kubernetes/client-node'
import { reconcileConfigMap } from './controller'

jest.mock('@kubernetes/client-node', () => {
  const originalModule = jest.requireActual('@kubernetes/client-node')
  return {
    ...originalModule,
    KubeConfig: jest.fn().mockImplementation(() => ({
      loadFromDefault: jest.fn(),
      makeApiClient: jest.fn().mockReturnValue({
        readNamespacedConfigMap: jest.fn(),
      }),
    })),
    CoreV1Api: jest.fn(),
  }
})

describe('reconcileConfigMap', () => {
  let coreApi: jest.Mocked<CoreV1Api>

  beforeEach(() => {
    const kubeConfig = new KubeConfig()
    kubeConfig.loadFromDefault()
    coreApi = kubeConfig.makeApiClient(CoreV1Api) as jest.Mocked<CoreV1Api>
  })

  it('should log an error if ConfigMap object is missing name or namespace', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()

    const invalidConfigMap = {} as V1ConfigMap
    await reconcileConfigMap(invalidConfigMap)

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Invalid ConfigMap object: missing name or namespace.'
    )

    consoleErrorSpy.mockRestore()
  })

  it('should log endpoints if ConfigMap contains valid JSON with endpoints', async () => {
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation()

    const mockConfigMap: V1ConfigMap = {
      metadata: { name: 'test-configmap', namespace: 'default' },
      data: {
        key1: JSON.stringify({ endpoints: ['endpoint1', 'endpoint2'] }),
      },
    }

    coreApi.readNamespacedConfigMap.mockResolvedValueOnce({
      body: mockConfigMap,
    })

    await reconcileConfigMap(mockConfigMap)

    expect(consoleLogSpy).toHaveBeenCalledWith(
      'Found endpoints for key key1:',
      ['endpoint1', 'endpoint2']
    )

    consoleLogSpy.mockRestore()
  })

  it('should log a warning if a key in ConfigMap contains invalid JSON', async () => {
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation()

    const mockConfigMap: V1ConfigMap = {
      metadata: { name: 'test-configmap', namespace: 'default' },
      data: {
        key1: 'invalid-json',
      },
    }

    coreApi.readNamespacedConfigMap.mockResolvedValueOnce({
      body: mockConfigMap,
    })

    await reconcileConfigMap(mockConfigMap)

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Failed to parse key key1 in ConfigMap test-configmap as JSON.'
    )

    consoleWarnSpy.mockRestore()
  })
})
