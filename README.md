# Research Tracker Visualizer

A web-based tool for visualizing research sessions recorded with the Research Tracker Chrome extension. This visualizer provides interactive views of your research process, showing the chronological progression of searches, visited pages, and notes.

## Features

- **Timeline View**: Chronological timeline of your research activities, with collapsible search groups
- **Raw Data View**: Inspect the complete data structure with syntax highlighting and session summary
- **Details Panel**: View detailed information about any element in your research session
- **Local Processing**: All data processing happens in your browser - no server upload required

## Getting Started

### Opening the Visualizer

1. Download this repository to your computer
2. Open the `index.html` file in a modern web browser (Chrome, Firefox, Edge, or Safari)

### Importing Data

The visualizer can import data in the JSON format exported by the Research Tracker Chrome extension. To import your data:

1. Click "Choose a file" and select your exported JSON file
2. Click "Import Data" to load and visualize the data

Alternatively, you can click "Load Sample Data" to try the visualizer with a demo dataset.

### Using the Visualizer

Once your data is loaded, you can:

- **Switch Views**: Use the buttons at the top to switch between Timeline and Raw Data views
- **Timeline View**:
  - Scroll through your research activities in chronological order
  - Expand or collapse search groups using the arrow icons
  - Use the "Expand All" or "Collapse All" buttons to quickly change the view
  - Click on any entry to see detailed information in the side panel
- **Raw Data View**: 
  - View session summary information (number of searches, pages, etc.)
  - Examine the complete data structure with syntax highlighting

## Data Structure

The visualizer works with the export format from the Research Tracker extension, which includes:

- **Searches**: Search queries performed on various search engines
- **Content Pages**: Web pages visited during research
- **Notes**: Notes added to searches or pages
- **Chronological Events**: A timeline of all activities

## Requirements

- Modern web browser with JavaScript enabled
- No internet connection required after initial download

## Troubleshooting

- **File won't import**: Make sure the file is in the correct JSON format from the Research Tracker extension
- **Elements are missing or not displaying properly**: Try refreshing the page or using a different browser

## Technology Stack

This project uses:
- Plain JavaScript (ES6+)
- D3.js for data visualization
- highlight.js for syntax highlighting

No build process is required - this is a simple, standalone web application.

## License

MIT License