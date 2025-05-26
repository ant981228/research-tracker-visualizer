# Research Tracker Visualizer

An interactive web-based visualization tool for exploring and analyzing research sessions captured by the Research Tracker Extension.

## Overview

The Research Tracker Visualizer transforms exported research data into interactive visualizations, helping you:
- Explore your research journey through timeline and graph views
- Analyze patterns in your search behavior
- Review and organize visited content
- Export formatted citations for your research

## Features

### 📊 Interactive Visualizations
- **Timeline View**: See your research chronologically with all searches, visits, and notes
- **Graph View**: Explore connections between searches and discovered content
- **Dual-View Mode**: Use timeline and graph views simultaneously

### 🔍 Search & Filter
- Filter by content type (searches, pages, notes)
- Search within your research data
- Filter by date ranges
- Domain-based filtering

### 📑 Citation Management
- View metadata for all visited pages
- Copy formatted citations (APA, MLA, Chicago styles)
- Export citation lists
- Edit metadata when needed

### 📈 Analytics
- Research session statistics
- Search pattern analysis
- Domain frequency insights
- Time-based activity charts

## Getting Started

### Quick Start
1. Open `index.html` in a modern web browser
2. Click "Import Research Data"
3. Select a JSON export file from the Research Tracker Extension
4. Explore your research using the various visualization modes

### System Requirements
- Modern web browser (Chrome, Firefox, Safari, Edge)
- JavaScript enabled
- No installation or server required - runs entirely in your browser

## Usage Guide

### Importing Data
1. Export your research session from the Research Tracker Extension as JSON
2. In the visualizer, click "Import Research Data"
3. Select your exported JSON file
4. The visualizer will load and display your research data

### Timeline View
- Scroll through your research chronologically
- Click on any event to see details
- Use filters to focus on specific types of content
- Hover over items for quick previews

### Graph View
- Nodes represent searches and visited pages
- Edges show the connections between searches and discoveries
- Drag nodes to rearrange the layout
- Click nodes to view details
- Use zoom controls to navigate large graphs

### Working with Citations
1. Click on any visited page in the timeline or graph
2. View the metadata panel
3. Choose your citation format
4. Click "Copy Citation" to copy to clipboard
5. Edit metadata if corrections are needed

### Exporting Results
- Export filtered views as new JSON files
- Copy individual citations
- Export citation lists in various formats
- Save visualization screenshots

## Interface Overview

### Main Components
- **Header**: Import button, view toggles, search bar
- **Sidebar**: Filters, statistics, and options
- **Main View**: Timeline or graph visualization
- **Detail Panel**: Shows information about selected items

### Keyboard Shortcuts
- `Space`: Play/pause timeline animation
- `←/→`: Navigate timeline
- `+/-`: Zoom in/out on graph
- `Esc`: Close detail panels

## Data Privacy

- All processing happens in your browser
- No data is uploaded to any server
- Your research data remains completely private
- Files are processed locally using JavaScript

## Troubleshooting

### Common Issues

**Import fails or shows error**
- Ensure you're importing a JSON file (not TXT)
- Check that the file is from Research Tracker Extension
- Try refreshing the page and importing again

**Visualization is slow or unresponsive**
- Large research sessions may take time to render
- Try filtering to show fewer items
- Use a modern browser for best performance

**Citations appear incomplete**
- Some websites don't provide complete metadata
- You can manually edit metadata in the detail panel
- Check the original page for missing information

## Technical Details

### Technologies Used
- HTML5, CSS3, JavaScript (ES6+)
- D3.js for graph visualizations
- No external dependencies or frameworks

### Browser Compatibility
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### File Structure
```
Research Tracker Visualizer/
├── index.html          # Main application file
├── style.css          # Styling and layout
├── visualizer.js      # Core visualization logic
└── README.md          # This file
```

## Future Enhancements

Planned features include:
- Advanced analytics and insights
- Collaborative research sharing
- Custom visualization themes
- Export to research management tools
- Integration with citation managers

## Contributing

To contribute to the visualizer:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly across browsers
5. Submit a pull request

## Support

For help or questions:
- Check this README first
- Review the Research Tracker Extension documentation
- Report issues on GitHub (if applicable)

## License

MIT License