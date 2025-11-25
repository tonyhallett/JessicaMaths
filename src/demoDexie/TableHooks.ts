import type { DexieEventSet, Transaction, DexieEvent } from "dexie";

export interface CreatingHookContext<TPKey> {
  onsuccess?: (primKey: TPKey) => void;
  onerror?: (err: any) => void;
}
export interface UpdatingHookContext<T> {
  onsuccess?: (updatedObj: T) => void;
  onerror?: (err: any) => void;
}
export interface DeletingHookContext<TPKey> {
  onsuccess?: (primKey: TPKey) => void;
  onerror?: (err: any) => void;
}

/*
  considerations
  add, put, update, delete result in these hooks
  when not add dexie does DBCoreTable.getMany for existing object.
*/

export interface TableHooks<TInsert, TExisting, TPKey> extends DexieEventSet {
  (
    eventName: "creating",
    subscriber: (
      this: CreatingHookContext<TPKey>,
      primKey: TPKey,
      insert: TInsert,
      transaction: Transaction
    ) => void | undefined | TPKey
  ): void;
  (eventName: "reading", subscriber: (obj: any) => any): void;
  (
    eventName: "updating",
    /*
       dexie merges the return value into the modifications for the
       next subscriber in the chain
       keyPaths are used on the return value but isn't that an issue with merging ?
    */
    subscriber: (
      this: UpdatingHookContext<TExisting>,
      modifications: Object,
      primKey: TPKey,
      existing: TExisting,
      transaction: Transaction
    ) => any
  ): void;
  (
    eventName: "deleting",
    subscriber: (
      this: DeletingHookContext<TPKey>,
      primKey: TPKey,
      existing: TExisting,
      transaction: Transaction
    ) => any
  ): void;
  creating: DexieEvent;
  reading: DexieEvent;
  updating: DexieEvent;
  deleting: DexieEvent;
}
