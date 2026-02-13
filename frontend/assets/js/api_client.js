const API_BASE_URL = 'http://localhost:5000';  // Change for production

async function handleResponse(response) {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'An error occurred');
  }
  return data;
}

const LostFoundAPI = {
  
  async healthCheck() {
    try {
      const response = await fetch(`${API_BASE_URL}/`);
      return await handleResponse(response);
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  },

  async analyzeImage(imageFile) {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await fetch(`${API_BASE_URL}/api/analyze-image`, {
        method: 'POST',
        body: formData
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Image analysis failed:', error);
      throw error;
    }
  },

  async reportLostItem(itemData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/report-lost`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(itemData)
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Failed to report lost item:', error);
      throw error;
    }
  },

  async reportFoundItem(itemData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/report-found`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(itemData)
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Failed to report found item:', error);
      throw error;
    }
  },

  async getLostItems(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const url = `${API_BASE_URL}/api/items/lost${queryParams ? '?' + queryParams : ''}`;
      
      const response = await fetch(url);
      return await handleResponse(response);
    } catch (error) {
      console.error('Failed to get lost items:', error);
      throw error;
    }
  },

  async getFoundItems(filters = {}) {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const url = `${API_BASE_URL}/api/items/found${queryParams ? '?' + queryParams : ''}`;
      
      const response = await fetch(url);
      return await handleResponse(response);
    } catch (error) {
      console.error('Failed to get found items:', error);
      throw error;
    }
  },

  async getItemDetails(itemType, itemId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/items/${itemType}/${itemId}`);
      return await handleResponse(response);
    } catch (error) {
      console.error('Failed to get item details:', error);
      throw error;
    }
  },

  async matchItems(matchData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/match-items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(matchData)
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Failed to match items:', error);
      throw error;
    }
  },

  async getStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/stats`);
      return await handleResponse(response);
    } catch (error) {
      console.error('Failed to get statistics:', error);
      throw error;
    }
  }
};