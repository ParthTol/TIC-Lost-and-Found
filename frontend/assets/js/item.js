/* =========================
   Fallback Item Data
   Used only when API fails or for legacy URL format (?item=name)
   Primary source is the backend API
   ========================= */

const items = {
  "Black Backpack": {
    image: "https://images.unsplash.com/photo-1535982330050-f1c2fb79ff78",
    category: "Bags",
    location: "Library - 2nd Floor",
    date: "Dec 15, 2025",
    color: "Black",
    colorHex: "#000000",
    match: "95%",
    description:
      "A black backpack found near the library on the second floor. It has multiple compartments and appears lightly used."
  },

  "iPhone 15 Pro": {
    image: "https://images.unsplash.com/photo-1741061963569-9d0ef54d10d2",
    category: "Electronics",
    location: "Cafeteria",
    date: "Dec 16, 2025",
    color: "Blue",
    colorHex: "#2563eb",
    match: "88%",
    description:
      "This iPhone 15 Pro was found at the cafeteria. The device appears to be in good condition and is currently secured."
  },

  "Key Set with Brown Leather Tag": {
    image: "https://images.unsplash.com/photo-1703355685886-8ef78d28ae9c",
    category: "Keys",
    location: "Parking Lot B",
    date: "Dec 14, 2025",
    color: "Silver",
    colorHex: "#9ca3af",
    match: "92%",
    description:
      "A set of keys attached to a brown leather tag found in Parking Lot B."
  },

  "MacBook Pro 16": {
    image: "https://images.unsplash.com/photo-1511385348-a52b4a160dc2",
    category: "Electronics",
    location: "Study Room 304",
    date: "Dec 17, 2025",
    color: "Gray",
    colorHex: "#6b7280",
    match: "85%",
    description:
      "A MacBook Pro 16-inch laptop found in Study Room 304. Appears clean and well-maintained."
  },

  "Sony WH-1000XM5 Headphones": {
    image: "https://images.unsplash.com/photo-1572119244337-bcb4aae995af",
    category: "Electronics",
    location: "Gym Locker Room",
    date: "Dec 13, 2025",
    color: "Black",
    colorHex: "#000000",
    match: "90%",
    description:
      "Sony WH-1000XM5 noise-cancelling headphones found in the gym locker room."
  },

  "Red Sports Water Bottle": {
    image: "https://images.unsplash.com/photo-1746484592922-b1dd99a7ff13",
    category: "Personal Items",
    location: "Basketball Court",
    date: "Dec 16, 2025",
    color: "Red",
    colorHex: "#dc2626",
    match: "78%",
    description:
      "A red sports water bottle found near the basketball court."
  }
};

/* =========================
   Read URL Parameters
   ========================= */

const params = new URLSearchParams(window.location.search);
const itemName = params.get("item");
const itemType = params.get("type");  // 'found' or 'lost'
const itemId = params.get("id");

/* =========================
   Populate Item Page
   ========================= */

async function loadItemDetails() {
  // If we have type and id, fetch from API
  if (itemType && itemId) {
    try {
      const result = await LostFoundAPI.getItemDetails(itemType, itemId);
      if (result && result.item) {
        displayItem(result.item);
        return;
      }
    } catch (error) {
      console.error('Failed to load item from API:', error);
      // Fall through to other methods
    }
  }
  
  // Try to load from localStorage
  const foundItems = JSON.parse(localStorage.getItem('foundItems') || '[]');
  const lostItems = JSON.parse(localStorage.getItem('lostItems') || '[]');
  const allItems = [...foundItems, ...lostItems];
  
  // Find item by name or id from localStorage
  let item = null;
  if (itemId) {
    item = allItems.find(i => i.id == itemId);
  }
  if (!item && itemName) {
    item = allItems.find(i => i.name === itemName || i.itemName === itemName);
  }
  
  // Fallback to hardcoded items
  if (!item && itemName && items[itemName]) {
    item = items[itemName];
    item.itemName = itemName;  // Add name for consistency
  }
  
  if (!item) {
    showErrorState();
    return;
  }
  
  displayItem(item);
}

function displayItem(item) {
  const name = item.itemName || item.name || 'Unknown Item';
  
  // Handle image URL - check if it's a relative path from API
  let imageUrl = item.image || 'https://placehold.co/400x300/e5e7eb/6b7280?text=No+Image';
  if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('data:')) {
    imageUrl = `${API_BASE_URL}/${imageUrl}`;
  }
  
  // Get color hex from color name
  const colorHexMap = {
    'Black': '#000000',
    'White': '#ffffff',
    'Red': '#dc2626',
    'Blue': '#2563eb',
    'Green': '#16a34a',
    'Yellow': '#eab308',
    'Orange': '#ea580c',
    'Purple': '#9333ea',
    'Pink': '#ec4899',
    'Gray': '#6b7280',
    'Brown': '#92400e',
    'Silver': '#9ca3af'
  };
  
  const itemData = {
    image: imageUrl,
    category: item.category || 'Unknown',
    location: item.location || 'Unknown',
    date: item.date || 'Unknown',
    color: item.color || 'Unknown',
    colorHex: item.colorHex || colorHexMap[item.color] || '#6b7280',
    match: item.match || (item.matchScore ? `${item.matchScore}%` : (item.confidence ? `${item.confidence}%` : '85%')),
    description: item.description || 'No description available.'
  };

  document.getElementById("item-image").src = itemData.image;
  document.getElementById("item-image").alt = name;

  document.getElementById("item-name").innerText = name;
  document.getElementById("item-category").innerText = itemData.category;
  document.getElementById("item-location").innerText = itemData.location;
  document.getElementById("item-date").innerText = typeof itemData.date === 'string' && itemData.date.includes('T') 
    ? new Date(itemData.date).toLocaleDateString() 
    : itemData.date;
  document.getElementById("item-color").innerText = itemData.color;
  document.getElementById("item-description").innerText = itemData.description;

  document.getElementById("match-badge").innerText = `${itemData.match} Match`;
  document.getElementById("item-color-dot").style.backgroundColor = itemData.colorHex;
  
  // Store contact info for verification
  if (item.contactInfo) {
    window.itemContactInfo = item.contactInfo;
  }
}

/* =========================
   Error Handling
   ========================= */

function showErrorState() {
  document.body.innerHTML = `
    <div class="container py-5 text-center">
      <h2 class="fw-bold mb-3">Item Not Found</h2>
      <p class="text-muted mb-4">
        The item you are looking for does not exist or the link is invalid.
      </p>
      <button class="btn btn-primary" onclick="window.location.href='search.html'">
        Back to Search
      </button>
    </div>
  `;
}

/* =========================
   Initialize Page
   ========================= */

document.addEventListener("DOMContentLoaded", loadItemDetails);
