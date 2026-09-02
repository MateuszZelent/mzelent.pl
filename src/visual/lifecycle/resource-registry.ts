export interface Disposable {
  dispose: () => void;
}

export class ResourceRegistry {
  private readonly resources = new Set<Disposable>();

  register<T extends Disposable>(resource: T): T {
    this.resources.add(resource);
    return resource;
  }

  unregister(resource: Disposable): void {
    this.resources.delete(resource);
  }

  disposeAll(): void {
    for (const resource of this.resources) {
      try {
        resource.dispose();
      } catch (err) {
        console.warn("[ResourceRegistry] Error disposing resource:", err);
      }
    }
    this.resources.clear();
  }

  get size(): number {
    return this.resources.size;
  }
}
