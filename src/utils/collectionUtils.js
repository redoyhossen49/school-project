// Collection utility functions for localStorage and API integration

const COLLECTION_STORAGE_KEY = "school_collections";

/**
 * Get all collections from localStorage
 * @returns {Array} Array of collection objects
 */
export const getCollectionsFromStorage = () => {
  try {
    const stored = localStorage.getItem(COLLECTION_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Error reading collections from localStorage:", error);
  }
  return [];
};

/**
 * Save collections to localStorage
 * @param {Array} collections - Array of collection objects
 */
export const saveCollectionsToStorage = (collections) => {
  try {
    localStorage.setItem(COLLECTION_STORAGE_KEY, JSON.stringify(collections));
    return true;
  } catch (error) {
    console.error("Error saving collections to localStorage:", error);
    return false;
  }
};

/**
 * Add a new collection to localStorage
 * @param {Object} collectionData - Collection object to add
 * @returns {Object} The saved collection with generated ID
 */
export const addCollectionToStorage = (collectionData) => {
  const collections = getCollectionsFromStorage();
  
  // Generate new serial number (sl)
  const maxSl = collections.length > 0 
    ? Math.max(...collections.map(c => c.sl || 0))
    : 0;
  
  const newCollection = {
    ...collectionData,
    sl: maxSl + 1,
    id: `COL-${Date.now()}`, // Unique ID for API use
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  
  collections.push(newCollection);
  saveCollectionsToStorage(collections);
  
  // Dispatch event to notify other components (e.g., StudentList)
  window.dispatchEvent(new Event('collectionsUpdated'));
  
  return newCollection;
};

/**
 * Update an existing collection in localStorage
 * @param {number|string} sl - Serial number or ID of collection to update
 * @param {Object} updatedData - Updated collection data
 * @returns {Object|null} Updated collection or null if not found
 */
export const updateCollectionInStorage = (sl, updatedData) => {
  const collections = getCollectionsFromStorage();
  const index = collections.findIndex(c => c.sl === sl || c.id === sl);
  
  if (index === -1) return null;
  
  collections[index] = {
    ...collections[index],
    ...updatedData,
    updated_at: new Date().toISOString(),
  };
  
  saveCollectionsToStorage(collections);
  
  // Dispatch event to notify other components
  window.dispatchEvent(new Event('collectionsUpdated'));
  
  return collections[index];
};

/**
 * Delete a collection from localStorage
 * @param {number|string} sl - Serial number or ID of collection to delete
 * @returns {boolean} True if deleted, false if not found
 */
export const deleteCollectionFromStorage = (sl) => {
  const collections = getCollectionsFromStorage();
  const filtered = collections.filter(c => c.sl !== sl && c.id !== sl);
  
  if (filtered.length === collections.length) return false;
  
  saveCollectionsToStorage(filtered);
  
  // Dispatch event to notify other components
  window.dispatchEvent(new Event('collectionsUpdated'));
  
  return true;
};

/**
 * Initialize collections with default data if storage is empty
 * @param {Array} defaultData - Default collection data to use
 */
export const initializeCollectionsStorage = (defaultData = []) => {
  const existing = getCollectionsFromStorage();
  if (existing.length === 0 && defaultData.length > 0) {
    // Add IDs and timestamps to default data
    const initialized = defaultData.map((item, index) => ({
      ...item,
      id: `COL-${Date.now()}-${index}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
    saveCollectionsToStorage(initialized);
    return initialized;
  }
  return existing;
};

// ==================== API READY FUNCTIONS ====================

/**
 * API-ready function to save collection
 * Replace this with actual API call when backend is ready
 * @param {Object} collectionData - Collection data to save
 * @returns {Promise<Object>} Saved collection data
 */
export const saveCollectionAPI = async (collectionData) => {
  // TODO: Replace with actual API call
  // Example:
  // const response = await fetch('/api/collections', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(collectionData)
  // });
  // return await response.json();
  
  // For now, use localStorage
  return addCollectionToStorage(collectionData);
};

/**
 * API-ready function to get all collections
 * Replace this with actual API call when backend is ready
 * @returns {Promise<Array>} Array of collections
 */
export const getCollectionsAPI = async () => {
  // TODO: Replace with actual API call
  // Example:
  // const response = await fetch('/api/collections');
  // return await response.json();
  
  // For now, use localStorage
  return getCollectionsFromStorage();
};

/**
 * API-ready function to update collection
 * Replace this with actual API call when backend is ready
 * @param {number|string} id - Collection ID
 * @param {Object} updatedData - Updated collection data
 * @returns {Promise<Object>} Updated collection
 */
export const updateCollectionAPI = async (id, updatedData) => {
  // TODO: Replace with actual API call
  // Example:
  // const response = await fetch(`/api/collections/${id}`, {
  //   method: 'PUT',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(updatedData)
  // });
  // return await response.json();
  
  // For now, use localStorage
  return updateCollectionInStorage(id, updatedData);
};

/**
 * API-ready function to delete collection
 * Replace this with actual API call when backend is ready
 * @param {number|string} id - Collection ID
 * @returns {Promise<boolean>} True if deleted
 */
export const deleteCollectionAPI = async (id) => {
  // TODO: Replace with actual API call
  // Example:
  // const response = await fetch(`/api/collections/${id}`, {
  //   method: 'DELETE'
  // });
  // return await response.json();
  
  // For now, use localStorage
  return deleteCollectionFromStorage(id);
};
