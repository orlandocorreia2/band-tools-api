/**
 * Insertion-ordered collection used by in-memory repositories.
 * Insertion order stands in for `created_at ASC`, the default ordering of the TypeORM repositories.
 */
export class InMemoryCollection<T> {
  private items: T[] = [];

  add(item: T): void {
    this.items.push(item);
  }

  findOne(predicate: (item: T) => boolean): T | null {
    return this.items.find(predicate) ?? null;
  }

  filter(predicate: (item: T) => boolean): T[] {
    return this.items.filter(predicate);
  }

  some(predicate: (item: T) => boolean): boolean {
    return this.items.some(predicate);
  }

  all(): T[] {
    return [...this.items];
  }

  clear(): void {
    this.items = [];
  }
}
