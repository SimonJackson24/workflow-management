// core/sdk/testing/PluginTestKit.ts

import { PluginSDK } from '../PluginSDK';
import { MockContext } from './mocks';

export class PluginTestKit {
  private sdk: PluginSDK;
  private mocks: MockContext;

  constructor(pluginConfig: any = {}) {
    this.mocks = new MockContext();
    this.sdk = new PluginSDK(this.mocks.createContext(pluginConfig));
  }

  // Test Utilities
  async simulateEvent(eventName: string, data: any): Promise<void> {
    await this.sdk.getAPI().events.emit(eventName, data);
  }

  async simulateUserAction(action: string, data: any): Promise<void> {
    await this.mocks.simulateUserAction(action, data);
  }

  async simulateAPIResponse(endpoint: string, response: any): Promise<void> {
    this.mocks.setAPIResponse(endpoint, response);
  }

  // Assertions
  async expectEventEmitted(eventName: string): Promise<void> {
    const events = this.mocks.getEmittedEvents();
    expect(events).toContainEqual(expect.objectContaining({ name: eventName }));
  }

  async expectAPICall(endpoint: string, method: string): Promise<void> {
    const calls = this.mocks.getAPICalls();
    expect(calls).toContainEqual(expect.objectContaining({ endpoint, method }));
  }

  async expectStorageSet(key: string, value: any): Promise<void> {
    const storage = await this.mocks.getStorage();
    expect(storage[key]).toEqual(value);
  }

  // Cleanup
  async cleanup(): Promise<void> {
    await this.mocks.cleanup();
  }
}
