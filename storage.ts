import { Store } from '@tauri-apps/plugin-store';

// We use a "Lazy Loader" pattern here.
// Instead of creating the store immediately, we create a Promise that will resolve to the store.
let storePromise: Promise<Store> | null = null;

async function getDb() {
  if (!storePromise) {
    console.log("🔌 Connecting to Database...");
    // FIX: We use Store.load() instead of new Store()
    // This creates AND loads the file in one safe step.
    storePromise = Store.load('cafe_data.bin');
  }
  
  // Wait for the loader to finish and return the active store
  const store = await storePromise;
  return store;
}

export const db = {
  set: async (key: string, value: any) => {
    try {
      const store = await getDb(); // Wait for DB to be ready
      await store.set(key, value);
      await store.save(); // Save to hard drive
      console.log(`✅ Saved ${key}`);
    } catch (error) {
      alert("SAVE ERROR: " + JSON.stringify(error));
      console.error(error);
    }
  },

  get: async (key: string) => {
    try {
      const store = await getDb(); // Wait for DB to be ready
      const val = await store.get(key);
      return val;
    } catch (error) {
      console.error("Load failed:", error);
      return null;
    }
  },

  remove: async (key: string) => {
    try {
      const store = await getDb();
      await store.delete(key);
      await store.save();
    } catch (error) {
      console.error("Delete failed:", error);
    }
  }
};