export const DATABASE_RELOAD_PORT = Symbol('DATABASE_RELOAD_PORT');

export interface DatabaseReloadPort {
  reloadFromSource(): Promise<void>;
}
