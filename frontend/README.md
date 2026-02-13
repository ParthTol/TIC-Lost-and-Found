# Lost & Found - AI-Powered Recovery

A pure HTML, CSS, and JavaScript frontend for a lost and found system using Bootstrap for responsive design.

## Features

- **AI-Powered Item Recognition**: Upload photos for intelligent matching
- **Responsive Design**: Mobile-first approach with Bootstrap 5
- **Multi-Page Navigation**: Separate pages for different functionalities
- **Image Upload & Preview**: Support for camera and file uploads
- **Advanced Filtering**: Filter items by category, color, and search terms
- **Form Validation**: Client-side validation for all forms
- **Smooth Animations**: CSS transitions and Bootstrap utilities

## Pages

1. **Home (index.html)**: Landing page with hero section, features, and statistics
2. **Find Item (finder.html)**: Upload or capture photos for AI analysis
3. **Search Results (search.html)**: Browse and filter found items
4. **Report Lost Item (report.html)**: Multi-step form to report lost items

## Technologies Used

- **HTML5**: Semantic markup
- **CSS3**: Custom styles with CSS variables
- **JavaScript (ES6)**: Vanilla JS for interactivity
- **Bootstrap 5**: Responsive grid system and components
- **Google Fonts**: Inter and Poppins font families

## File Structure

```
frontend/
│── index.html              # Home/Landing page
│── finder.html             # Find lost item page
│── search.html             # Search results page
│── report.html             # Report lost item page
│── assets/
│   ├── css/
│   │   └── main.css        # Custom styles and utilities
│   ├── js/
│   │   └── main.js         # Main JavaScript functionality
│   └── images/             # Image assets (if any)
└── README.md               # This file
```

## Getting Started

1. Clone or download the project
2. Open `index.html` in any modern web browser
3. Navigate through the different pages using the navigation

## Browser Support

- Chrome 70+
- Firefox 65+
- Safari 12+
- Edge 79+

## Features Overview

### Navigation
- Responsive top navigation for desktop
- Bottom navigation for mobile devices
- Smooth page transitions

### Image Handling
- Drag & drop upload
- Camera capture support
- Image preview functionality
- File validation

### Search & Filtering
- Real-time search
- Category and color filters
- Dynamic results updating

### Forms
- Multi-step form wizard
- Input validation
- Progress indicators
- Success/error feedback

### Responsive Design
- Mobile-first approach
- Bootstrap grid system
- Flexible layouts
- Touch-friendly interfaces

## Development Notes

- All styles are custom CSS, no CSS frameworks except Bootstrap
- JavaScript is vanilla ES6, no external libraries
- Images use Unsplash for demonstration
- Form data is handled client-side only
- No backend integration included

## Customization

### Colors
Modify CSS variables in `main.css`:
```css
:root {
  --primary: #1E3A8A;
  --secondary: #14B8A6;
  --accent: #F59E0B;
  /* ... */
}
```

### Fonts
Update font imports in `main.css`:
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@600;700&display=swap');
```

### Bootstrap CDN
Update Bootstrap version in HTML files:
```html
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
```

## License

This project is for educational purposes. Images are from Unsplash and are used for demonstration only.