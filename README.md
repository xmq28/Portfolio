# Professional Portfolio Website

A modern, responsive portfolio website built with ASP.NET Core 10 showcasing enterprise-level software development work in aviation systems and operational platforms.

## Features

- **Modern Design**: Clean, professional tech-focused aesthetic with smooth animations
- **Fully Responsive**: Perfect display on mobile, tablet, and desktop devices
- **Smooth Animations**: Fade-in effects, hover transitions, and scroll-based interactions
- **Performance Optimized**: Fast loading with minimal dependencies
- **SEO Ready**: Semantic HTML structure

## Tech Stack

- ASP.NET Core 10 (Razor Pages)
- HTML5 / CSS3
- JavaScript (Vanilla)
- Font Awesome Icons
- Google Fonts (Inter)

## Getting Started

### Prerequisites

- .NET 10 SDK installed

### Running the Application

1. Navigate to the project directory:
```bash
cd PortfolioWebsite
```

2. Run the application:
```bash
dotnet run
```

3. Open your browser and navigate to:
```
https://localhost:5001
```
or
```
http://localhost:5000
```

### Building for Production

```bash
dotnet publish -c Release -o ./publish
```

## Customization

### Update Personal Information

Edit `Pages/Index.cshtml` to update:
- Your name and title in the hero section
- Project descriptions and details
- Skills and technologies
- Contact information (email and LinkedIn)

### Modify Colors

Edit `wwwroot/css/site.css` and update the CSS variables in the `:root` section:

```css
:root {
    --primary-color: #0a192f;      /* Main background */
    --secondary-color: #112240;     /* Section backgrounds */
    --accent-color: #64ffda;        /* Accent color (teal) */
    --accent-gold: #ffd700;         /* Secondary accent */
    --text-primary: #ccd6f6;        /* Main text */
    --text-secondary: #8892b0;      /* Secondary text */
}
```

### Add More Projects

In `Pages/Index.cshtml`, duplicate a project card block and update the content:

```html
<div class="project-card">
    <div class="project-icon">
        <i class="fas fa-your-icon"></i>
    </div>
    <h3 class="project-title">Your Project Name</h3>
    <p class="project-description">Description...</p>
    <!-- Add features and tech tags -->
</div>
```

## Project Structure

```
PortfolioWebsite/
├── Pages/
│   ├── Shared/
│   │   └── _Layout.cshtml      # Main layout with navigation
│   ├── Index.cshtml             # Homepage with all sections
│   └── Index.cshtml.cs          # Page model
├── wwwroot/
│   ├── css/
│   │   └── site.css             # All styling
│   └── js/
│       └── site.js              # Interactions and animations
└── Program.cs                   # Application entry point
```

## Sections

1. **Hero**: Eye-catching introduction with call-to-action
2. **About**: Professional summary and expertise
3. **Projects**: Showcase of featured work with details
4. **Skills**: Technical skills organized by category
5. **Contact**: Contact information and links

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is open source and available for personal use.

## Contact

Update the contact section in `Index.cshtml` with your actual:
- Email address
- LinkedIn profile URL
- GitHub profile (optional)
- Other social links (optional)
