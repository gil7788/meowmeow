// lib/memoryQueue.ts
import { TokenCreatedEvent } from "@/lib/types";

class MemoryQueue<T> {
  private queue: T[] = [];
  private readonly maxSize = 50;

  enqueue(item: T) {
    if (this.queue.length >= this.maxSize) {
      const evicted = this.queue.shift();
      console.log("[MemoryQueue] Evicted oldest item:", evicted);
      this.printState();
    }
    this.queue.push(item);
    console.log("[MemoryQueue] Enqueued item:", item);
    this.printState();
  }

  getByKey(predicate: (item: T) => boolean): T | undefined {
    const result = this.queue.find(predicate);
    console.log("[MemoryQueue] getByKey result:", result);
    this.printState();
    return result;
  }

  getAll(): T[] {
    console.log("[MemoryQueue] getAll() called. Current state:", this.queue);
    return [...this.queue];
  }

  private printState() {
    console.log(`[MemoryQueue] Current queue size: ${this.queue.length}`);
    console.log("[MemoryQueue] Queue contents:", this.queue);
  }
}

export const tokenEventQueue = new MemoryQueue<TokenCreatedEvent>();
