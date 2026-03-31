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
│   └── communities.json    # BGP communities translations
├── scripts/
│   └── fetch_bird_data.sh  # Remote BIRD2 export helper for CI
├── .github/workflows/
│   ├── deploy.yml          # GitHub Pages deployment workflow
│   └── fetch-bird-data.yml # Raw BIRD data refresh workflow
└── README.md               # This file
```

## Deployment

This application is automatically deployed to GitHub Pages using GitHub Actions.
The raw BIRD exports are stored separately on the `bird-data` branch and are not tracked on the main code branch.

### Deployment Process

1. **Raw data refresh**: A scheduled or manual workflow connects to `user@103.147.22.10`, runs `sudo birdc`, and commits updated `steam-cache-v4.txt` / `steam-cache-v6.txt` files to `bird-data`
2. **Deploy trigger**: Pushes to the default code branch or successful completion of the raw data refresh workflow
3. **Build**: The deploy workflow checks out the default code branch, restores raw text dumps from `bird-data`, converts them to JSON, and copies required files to the deployment directory
4. **Deploy**: Publishes to GitHub Pages with custom domain

### Deployed Files

- `index.html` - Main application
- `script.js` - Application logic
- `styles.css` - Styling
- `data/*.json` - Steam cache data and translations
- `CNAME` - Custom domain configuration

### Required GitHub Secret

- `SSH_PRIVKEY` - Private key used by GitHub Actions to SSH to `user@103.147.22.10`

The remote account must be able to run `sudo birdc` non-interactively.

### Custom Domain

The application is configured to use the custom domain: `steam.twds.com.tw`

## Local Development

To run the application locally:

1. Clone the repository
2. Open `index.html` in a web browser
3. If you want to build JSON locally, place `steam-cache-v4.txt` and `steam-cache-v6.txt` under `data/`
4. The application will load Steam cache data from the generated JSON files in the `data/` directory

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
