// Main JavaScript file for Lost & Found app

// Navigation functions
function navigateTo(page) {
  window.location.href = page;
}

// Image preview functionality
function handleImagePreview(input, previewContainer) {
  const file = input.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const img = document.createElement('img');
      img.src = e.target.result;
      img.className = 'w-full h-auto max-h-96 object-contain bg-muted rounded-lg';
      previewContainer.innerHTML = '';
      previewContainer.appendChild(img);
    };
    reader.readAsDataURL(file);
  }
}

// Camera capture functionality
function openCamera(input) {
  input.setAttribute('capture', 'environment');
  input.click();
}

// Loading animation
function showLoading(container, message = 'Loading...') {
  container.innerHTML = `
    <div class="flex flex-col items-center justify-center space-y-4 p-8">
      <div class="loading-spinner"></div>
      <p class="text-muted-foreground">${message}</p>
    </div>
  `;
}

// Filter functionality for search results
function filterItems(searchQuery, categoryFilter, colorFilter) {
  const items = document.querySelectorAll('.item-card');
  items.forEach(item => {
    const name = item.dataset.name.toLowerCase();
    const category = item.dataset.category;
    const color = item.dataset.color;
    const location = item.dataset.location.toLowerCase();

    const matchesSearch = !searchQuery ||
      name.includes(searchQuery.toLowerCase()) ||
      location.includes(searchQuery.toLowerCase());
    const matchesCategory = !categoryFilter || categoryFilter === 'all' || category === categoryFilter;
    const matchesColor = !colorFilter || colorFilter === 'all' || color === colorFilter;

    if (matchesSearch && matchesCategory && matchesColor) {
      item.style.display = 'block';
    } else {
      item.style.display = 'none';
    }
  });
}

// Form validation
function validateForm(form) {
  const requiredFields = form.querySelectorAll('[required]');
  let isValid = true;

  requiredFields.forEach(field => {
    if (!field.value.trim()) {
      field.classList.add('border-destructive');
      isValid = false;
    } else {
      field.classList.remove('border-destructive');
    }
  });

  return isValid;
}

// Multi-step form navigation
function nextStep(currentStep, totalSteps) {
  if (currentStep < totalSteps) {
    document.getElementById(`step-${currentStep}`).style.display = 'none';
    document.getElementById(`step-${currentStep + 1}`).style.display = 'block';
    updateProgress(currentStep + 1, totalSteps);
  }
}

function prevStep(currentStep, totalSteps) {
  if (currentStep > 1) {
    document.getElementById(`step-${currentStep}`).style.display = 'none';
    document.getElementById(`step-${currentStep - 1}`).style.display = 'block';
    updateProgress(currentStep - 1, totalSteps);
  }
}

function updateProgress(currentStep, totalSteps) {
  const progress = (currentStep / totalSteps) * 100;
  const progressBar = document.getElementById('progress-bar');
  if (progressBar) {
    progressBar.style.width = `${progress}%`;
  }
}

// Modal functionality
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
  }
}

// Ripple effect for buttons
function createRipple(event) {
  const button = event.currentTarget;
  const ripple = document.createElement('span');
  const rect = button.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;

  ripple.style.cssText = `
    position: absolute;
    width: ${size}px;
    height: ${size}px;
    left: ${x}px;
    top: ${y}px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.6);
    transform: scale(0);
    animation: ripple-animation 0.6s ease-out;
    pointer-events: none;
  `;

  button.appendChild(ripple);
  setTimeout(() => ripple.remove(), 600);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Add fade-in animation to elements
  const animatedElements = document.querySelectorAll('.fade-in, .slide-up, .slide-in-left, .slide-in-right, .scale-in, .stagger-item');
  animatedElements.forEach((element, index) => {
    element.style.animationDelay = `${index * 0.1}s`;
  });

  // Add ripple effect to buttons
  document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', createRipple);
  });

  // Handle mobile menu toggle
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  if (mobileMenuToggle && mobileMenu) {
    mobileMenuToggle.addEventListener('click', function() {
      mobileMenu.classList.toggle('hidden');
    });
  }

  // Handle search functionality
  const searchInput = document.getElementById('search-input');
  const categoryFilter = document.getElementById('category-filter');
  const colorFilter = document.getElementById('color-filter');

  if (searchInput) {
    searchInput.addEventListener('input', function() {
      filterItems(
        this.value,
        categoryFilter ? categoryFilter.value : null,
        colorFilter ? colorFilter.value : null
      );
    });
  }

  if (categoryFilter) {
    categoryFilter.addEventListener('change', function() {
      filterItems(
        searchInput ? searchInput.value : '',
        this.value,
        colorFilter ? colorFilter.value : null
      );
    });
  }

  if (colorFilter) {
    colorFilter.addEventListener('change', function() {
      filterItems(
        searchInput ? searchInput.value : '',
        categoryFilter ? categoryFilter.value : null,
        this.value
      );
    });
  }

  // Handle form submissions
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      if (validateForm(this)) {
        // Simulate form submission
        const submitBtn = this.querySelector('button[type="submit"]');
        if (submitBtn) {
          submitBtn.textContent = 'Submitting...';
          submitBtn.disabled = true;
        }

        setTimeout(() => {
          alert('Form submitted successfully!');
          // Redirect or show success message
        }, 2000);
      }
    });
  });

  // Handle image uploads
  const imageInputs = document.querySelectorAll('input[type="file"][accept="image/*"]');
  imageInputs.forEach(input => {
    input.addEventListener('change', function() {
      const preview = document.getElementById(`${this.id}-preview`);
      if (preview) {
        handleImagePreview(this, preview);
      }
    });
  });

  // Lazy load images
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in');
          imageObserver.unobserve(entry.target);
        }
      });
    });

    document.querySelectorAll('img').forEach(img => imageObserver.observe(img));
  }

  // Smooth progress bar
  const progressBar = document.getElementById('progress-bar');
  if (progressBar) {
    progressBar.style.transition = 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
  }

  console.log('Lost & Found app initialized with enhanced UX');
});

// Add ripple animation CSS
const style = document.createElement('style');
style.textContent = `
  @keyframes ripple-animation {
    to { transform: scale(4); opacity: 0; }
  }
`;
document.head.appendChild(style);