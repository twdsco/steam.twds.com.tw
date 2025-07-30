# TWDS Steam Cache 提供範圍確認

A web application to check if an IP address is within the TWDS Steam Cache service range.

## Features

- **IP Address Lookup**: Enter any IPv4 or IPv6 address to check
- **Current IP Detection**: Automatically detect and check your current IP
- **Steam Cache Status**: Shows whether the IP is within TWDS Steam Cache service range
- **Geolocation Data**: Displays country and ISP information
- **BGP Information**: Shows AS path and BGP communities with translations
- **Real-time Validation**: Live IP address validation with visual feedback

## Files Structure

```
├── index.html              # Main HTML file
├── script.js               # JavaScript functionality
├── styles.css              # CSS styles
├── data/
│   ├── steam-cache-v4.json # IPv4 Steam cache data
│   ├── steam-cache-v6.json # IPv6 Steam cache data
│   └── communities.json    # BGP communities translations
├── .github/workflows/
│   └── deploy.yml          # GitHub Actions deployment workflow
└── README.md               # This file
```

## Deployment

This application is automatically deployed to GitHub Pages using GitHub Actions.

### Deployment Process

1. **Trigger**: Pushes to `main` or `master` branch
2. **Build**: Copies required files to deployment directory
3. **Deploy**: Publishes to GitHub Pages with custom domain

### Deployed Files

- `index.html` - Main application
- `script.js` - Application logic
- `styles.css` - Styling
- `data/*.json` - Steam cache data and translations
- `CNAME` - Custom domain configuration

### Custom Domain

The application is configured to use the custom domain: `steam.twds.com.tw`

## Local Development

To run the application locally:

1. Clone the repository
2. Open `index.html` in a web browser
3. The application will load Steam cache data from the `data/` directory

## Data Sources

- **Steam Cache Data**: Converted from BGP routing table exports
- **Geolocation**: ipapi.co API
- **Current IP**: ipify.org API
- **BGP Communities**: Custom translations for TWDS-specific communities

## Technical Details

- **No Dependencies**: Pure HTML, CSS, and JavaScript
- **Responsive Design**: Works on desktop and mobile devices
- **Longest Prefix Match**: Proper routing table lookup algorithm
- **Real-time Validation**: Client-side IP address validation
- **Error Handling**: Comprehensive error handling and user feedback

## API Endpoints Used

- `https://ipapi.co/{ip}/json/` - IP geolocation data
- `https://api.ipify.org?format=json` - Current IP detection

## License

This project is part of the TWDS Steam Cache service. 