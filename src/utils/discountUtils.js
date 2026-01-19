// Discount utility functions for localStorage and API integration

const DISCOUNT_STORAGE_KEY = "school_discounts";

/**
 * Get all discounts from localStorage
 * @returns {Array} Array of discount objects
 */
export const getDiscountsFromStorage = () => {
  try {
    const stored = localStorage.getItem(DISCOUNT_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Error reading discounts from localStorage:", error);
  }
  return [];
};

/**
 * Save discounts to localStorage
 * @param {Array} discounts - Array of discount objects
 */
export const saveDiscountsToStorage = (discounts) => {
  try {
    localStorage.setItem(DISCOUNT_STORAGE_KEY, JSON.stringify(discounts));
    return true;
  } catch (error) {
    console.error("Error saving discounts to localStorage:", error);
    return false;
  }
};

/**
 * Add a new discount to localStorage
 * @param {Object} discountData - Discount object to add
 * @returns {Object} The saved discount with generated ID
 */
export const addDiscountToStorage = (discountData) => {
  const discounts = getDiscountsFromStorage();
  
  // Generate new serial number (sl)
  const maxSl = discounts.length > 0 
    ? Math.max(...discounts.map(d => d.sl || 0))
    : 0;
  
  const newDiscount = {
    ...discountData,
    sl: maxSl + 1,
    id: `DIS-${Date.now()}`, // Unique ID for API use
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  
  discounts.push(newDiscount);
  saveDiscountsToStorage(discounts);
  
  // Dispatch event to notify other components
  window.dispatchEvent(new Event('discountsUpdated'));
  
  return newDiscount;
};

/**
 * Update an existing discount in localStorage
 * @param {number|string} sl - Serial number or ID of discount to update
 * @param {Object} updatedData - Updated discount data
 * @returns {Object|null} Updated discount or null if not found
 */
export const updateDiscountInStorage = (sl, updatedData) => {
  const discounts = getDiscountsFromStorage();
  const index = discounts.findIndex(d => d.sl === sl || d.id === sl);
  
  if (index === -1) return null;
  
  discounts[index] = {
    ...discounts[index],
    ...updatedData,
    updated_at: new Date().toISOString(),
  };
  
  saveDiscountsToStorage(discounts);
  
  // Dispatch event to notify other components
  window.dispatchEvent(new Event('discountsUpdated'));
  
  return discounts[index];
};

/**
 * Delete a discount from localStorage
 * @param {number|string} sl - Serial number or ID of discount to delete
 * @returns {boolean} True if deleted, false if not found
 */
export const deleteDiscountFromStorage = (sl) => {
  const discounts = getDiscountsFromStorage();
  const filtered = discounts.filter(d => d.sl !== sl && d.id !== sl);
  
  if (filtered.length === discounts.length) return false;
  
  saveDiscountsToStorage(filtered);
  
  // Dispatch event to notify other components
  window.dispatchEvent(new Event('discountsUpdated'));
  
  return true;
};

/**
 * Initialize discounts with default data if storage is empty
 * @param {Array} defaultData - Default discount data to use
 */
export const initializeDiscountsStorage = (defaultData = []) => {
  const existing = getDiscountsFromStorage();
  if (existing.length === 0 && defaultData.length > 0) {
    // Add IDs and timestamps to default data
    const initialized = defaultData.map((item, index) => ({
      ...item,
      id: `DIS-${Date.now()}-${index}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
    saveDiscountsToStorage(initialized);
    return initialized;
  }
  return existing;
};

// ==================== API READY FUNCTIONS ====================

/**
 * API-ready function to save discount
 * Replace this with actual API call when backend is ready
 * @param {Object} discountData - Discount data to save
 * @returns {Promise<Object>} Saved discount data
 */
export const saveDiscountAPI = async (discountData) => {
  // TODO: Replace with actual API call
  // Example:
  // const response = await fetch('/api/discounts', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(discountData)
  // });
  // return await response.json();
  
  // For now, use localStorage
  return addDiscountToStorage(discountData);
};

/**
 * API-ready function to get all discounts
 * Replace this with actual API call when backend is ready
 * @returns {Promise<Array>} Array of discounts
 */
export const getDiscountsAPI = async () => {
  // TODO: Replace with actual API call
  // Example:
  // const response = await fetch('/api/discounts');
  // return await response.json();
  
  // For now, use localStorage
  return getDiscountsFromStorage();
};

/**
 * API-ready function to update discount
 * Replace this with actual API call when backend is ready
 * @param {number|string} id - Discount ID
 * @param {Object} updatedData - Updated discount data
 * @returns {Promise<Object>} Updated discount
 */
export const updateDiscountAPI = async (id, updatedData) => {
  // TODO: Replace with actual API call
  // Example:
  // const response = await fetch(`/api/discounts/${id}`, {
  //   method: 'PUT',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(updatedData)
  // });
  // return await response.json();
  
  // For now, use localStorage
  return updateDiscountInStorage(id, updatedData);
};

/**
 * API-ready function to delete discount
 * Replace this with actual API call when backend is ready
 * @param {number|string} id - Discount ID
 * @returns {Promise<boolean>} True if deleted
 */
export const deleteDiscountAPI = async (id) => {
  // TODO: Replace with actual API call
  // Example:
  // const response = await fetch(`/api/discounts/${id}`, {
  //   method: 'DELETE'
  // });
  // return await response.json();
  
  // For now, use localStorage
  return deleteDiscountFromStorage(id);
};
