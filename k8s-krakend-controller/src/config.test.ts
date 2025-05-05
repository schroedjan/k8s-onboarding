import { KubeConfig, CoreV1Api, AppsV1Api } from '@kubernetes/client-node';
import { getApiClient } from './config';

jest.mock('@kubernetes/client-node', () => {
  const originalModule = jest.requireActual('@kubernetes/client-node');
  return {
    ...originalModule,
    KubeConfig: jest.fn().mockImplementation(() => ({
      loadFromDefault: jest.fn(),
      makeApiClient: jest.fn(),
    })),
  };
});

describe('getApiClient', () => {
  let kubeConfigMock: jest.Mocked<KubeConfig>;

  beforeEach(() => {
    kubeConfigMock = new KubeConfig() as jest.Mocked<KubeConfig>;
    kubeConfigMock.loadFromDefault.mockClear();
    kubeConfigMock.makeApiClient.mockClear();
  });

  it('should call loadFromDefault once when creating the first API client', () => {
    const coreV1ApiMock = new CoreV1Api();
    kubeConfigMock.makeApiClient.mockReturnValueOnce(coreV1ApiMock);

    const coreV1Api = getApiClient(CoreV1Api, kubeConfigMock);

    expect(kubeConfigMock.loadFromDefault).not.toHaveBeenCalled(); // Not called because we inject the mock
    expect(kubeConfigMock.makeApiClient).toHaveBeenCalledWith(CoreV1Api);
    expect(coreV1Api).toBe(coreV1ApiMock);
  });

  it('should cache the created API client', () => {
    const coreV1ApiMock = new CoreV1Api();
    kubeConfigMock.makeApiClient.mockReturnValueOnce(coreV1ApiMock);

    const coreV1Api = getApiClient(CoreV1Api, kubeConfigMock);
    const cachedCoreV1Api = getApiClient(CoreV1Api, kubeConfigMock);

    expect(kubeConfigMock.makeApiClient).toHaveBeenCalledTimes(1);
    expect(coreV1Api).toBe(cachedCoreV1Api);
  });

  it('should create and cache different API clients for different classes', () => {
    const coreV1ApiMock = new CoreV1Api();
    const appsV1ApiMock = new AppsV1Api();

    kubeConfigMock.makeApiClient
      .mockReturnValueOnce(coreV1ApiMock)
      .mockReturnValueOnce(appsV1ApiMock);

    const coreV1Api = getApiClient(CoreV1Api, kubeConfigMock);
    const appsV1Api = getApiClient(AppsV1Api, kubeConfigMock);

    expect(kubeConfigMock.makeApiClient).toHaveBeenCalledWith(CoreV1Api);
    expect(kubeConfigMock.makeApiClient).toHaveBeenCalledWith(AppsV1Api);
    expect(coreV1Api).not.toBe(appsV1Api);
  });
});
