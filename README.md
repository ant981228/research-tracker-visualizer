# Research Tracker Visualizer

A web-based tool for visualizing research sessions recorded with the Research Tracker Chrome extension. This visualizer provides interactive views of your research process, showing the connections between searches, visited pages, and notes.

## Features

- **Graph View**: Interactive force-directed graph showing relationships between searches and pages
- **Timeline View**: Chronological timeline of your research activities
- **Raw Data View**: Inspect the complete data structure with syntax highlighting
- **Details Panel**: View detailed information about any element in your research session
- **Filtering Options**: Control which elements appear in the visualization
- **Local Processing**: All data processing happens in your browser - no server upload required

## Getting Started

### Opening the Visualizer

1. Download this folder to your computer
2. Open the `index.html` file in a modern web browser (Chrome, Firefox, Edge, or Safari)

### Importing Data

The visualizer can import data in the JSON format exported by the Research Tracker Chrome extension. To import your data:

1. Click "Choose a file" and select your exported JSON file
2. Click "Import Data" to load and visualize the data

Alternatively, you can click "Load Sample Data" to try the visualizer with a demo dataset.

### Using the Visualizer

Once your data is loaded, you can:

- **Switch Views**: Use the buttons at the top to switch between Graph, Timeline, and Raw Data views
- **Graph Controls**: 
  - Click and drag to move nodes
  - Scroll to zoom in/out
  - Hover over nodes to see tooltips with basic information
  - Click on nodes to see detailed information in the side panel
  - Use the checkboxes to filter which types of nodes are displayed
- **Timeline View**:
  - Scroll through your research activities in chronological order
  - Click on any entry to see detailed information
- **Raw Data View**: 
  - Examine the complete data structure with syntax highlighting
  - Useful for advanced users who want to understand the data format

## Data Structure

The visualizer works with the export format from the Research Tracker extension, which includes:

- **Searches**: Search queries performed on various search engines
- **Content Pages**: Web pages visited during research
- **Notes**: Notes added to searches or pages
- **Metadata**: Additional information about pages, such as authors and publication dates
- **Chronological Events**: A timeline of all activities

For more details on the data format, see the `EXPORT_SPECIFICATION.md` file in the Research Tracker extension documentation.

## Requirements

- Modern web browser with JavaScript enabled
- No internet connection required after initial download
- Works with large research sessions containing hundreds of events

## Troubleshooting

- **File won't import**: Make sure the file is in the correct JSON format from the Research Tracker extension
- **Graph doesn't appear**: Try refreshing the page or using a different browser
- **Elements are missing**: Check the filter checkboxes to ensure all elements are set to display

## Development

This project uses:
- Plain JavaScript (ES6+)
- D3.js for data visualization
- Force-Graph library for interactive network visualization

To modify or extend the visualizer:
1. Edit the HTML, CSS, or JavaScript files
2. Refresh the page to see your changes

No build process is required - this is a simple, standalone web application.

## License

MIT License - See LICENSE file for details