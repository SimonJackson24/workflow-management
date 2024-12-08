// src/utils/serviceWorker.ts

class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null;

  async register(): Promise<void> {
    if (!('serviceWorker' in navigator) || !import.meta.env.PROD) {
      return;
    }

    try {
      this.registration = await navigator.serviceWorker.register(
        '/service-worker.js',
        { scope: '/' }
      );

      this.registration.addEventListener('updatefound', () => {
        this.handleUpdateFound();
      });

      // Check for updates immediately
      if (this.registration.active) {
        await this.registration.update();
      }
    } catch (error) {
      console.error('Service worker registration failed:', error);
    }
  }

  private handleUpdateFound(): void {
    const newWorker = this.registration?.installing;
    if (!newWorker) return;

    newWorker.addEventListener('statechange', () => {
      if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
        this.dispatchUpdateEvent();
      }
    });
  }

  private dispatchUpdateEvent(): void {
    const event = new CustomEvent('serviceWorkerUpdate', {
      detail: {
        registration: this.registration
      }
    });
    window.dispatchEvent(event);
  }

  async unregister(): Promise<void> {
    if (!this.registration) return;

    try {
      await this.registration.unregister();
      this.registration = null;
    } catch (error) {
      console.error('Service worker unregistration failed:', error);
    }
  }

  async update(): Promise<void> {
    if (!this.registration) return;

    try {
      await this.registration.update();
    } catch (error) {
      console.error('Service worker update failed:', error);
    }
  }
}

export const serviceWorker = new ServiceWorkerManager();
