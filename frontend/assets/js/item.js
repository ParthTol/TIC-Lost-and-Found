/* =========================
   Item Data (Mock Database)
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
   Read URL Parameter
   ========================= */

const params = new URLSearchParams(window.location.search);
const itemName = params.get("item");

/* =========================
   Populate Item Page
   ========================= */

function loadItemDetails() {
  // Try to load from localStorage first
  const foundItems = JSON.parse(localStorage.getItem('foundItems') || '[]');
  const lostItems = JSON.parse(localStorage.getItem('lostItems') || '[]');
  const allItems = [...foundItems, ...lostItems];
  
  // Find item by name from localStorage or hardcoded data
  let item = allItems.find(i => i.name === itemName);
  
  // Fallback to hardcoded items
  if (!item && items[itemName]) {
    item = items[itemName];
  }
  
  if (!itemName || !item) {
    showErrorState();
    return;
  }
  
  // Handle both data formats
  const itemData = {
    image: item.image || 'https://placehold.co/400x300/e5e7eb/6b7280?text=No+Image',
    category: item.category || 'Unknown',
    location: item.location || 'Unknown',
    date: item.date || 'Unknown',
    color: item.color || 'Unknown',
    colorHex: item.colorHex || '#6b7280',
    match: item.match || item.confidence ? `${item.confidence}%` : '85%',
    description: item.description || 'No description available.'
  };

  document.getElementById("item-image").src = itemData.image;
  document.getElementById("item-image").alt = itemName;

  document.getElementById("item-name").innerText = itemName;
  document.getElementById("item-category").innerText = itemData.category;
  document.getElementById("item-location").innerText = itemData.location;
  document.getElementById("item-date").innerText = itemData.date;
  document.getElementById("item-color").innerText = itemData.color;
  document.getElementById("item-description").innerText = itemData.description;

  document.getElementById("match-badge").innerText = `${itemData.match} Match`;
  document.getElementById("item-color-dot").style.backgroundColor = itemData.colorHex;
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
