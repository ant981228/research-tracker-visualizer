/**
 * Research Tracker Visualizer - Main Application
 */
document.addEventListener('DOMContentLoaded', () => {
    // Main application state
    const state = {
        isDataLoaded: false,
        currentView: 'timeline',  // 'timeline' or 'raw'
        data: null,
        detailsOpen: false,
        expandedSearches: new Set(), // Track which searches are expanded
        docLoaded: false
    };

    // DOM Elements
    const elements = {
        fileInput: document.getElementById('file-input'),
        fileName: document.getElementById('file-name'),
        importBtn: document.getElementById('import-btn'),
        sampleDataBtn: document.getElementById('sample-data-btn'),
        uploadSection: document.getElementById('upload-section'),
        visualizationContainer: document.getElementById('visualization-container'),
        viewButtons: document.querySelectorAll('.view-selector button'),
        viewPanes: document.querySelectorAll('.view-pane'),
        timelineSettings: {
            expandAllBtn: document.getElementById('expand-all-btn'),
            collapseAllBtn: document.getElementById('collapse-all-btn'),
            goHomeBtn: document.getElementById('go-home-btn')
        },
        detailsPanel: document.getElementById('details-panel'),
        closeDetails: document.getElementById('close-details'),
        detailsContent: document.getElementById('details-content'),
        docInput: document.getElementById('doc-input'),
        docName: document.getElementById('doc-name'),
        docStatus: document.getElementById('doc-status'),
        docSectionsContainer: document.getElementById('doc-sections-container'),
        docSectionsList: document.getElementById('doc-sections-list'),
        sectionsModal: document.getElementById('sections-modal'),
        sectionsModalTitle: document.getElementById('sections-modal-title'),
        sectionsModalSubtitle: document.getElementById('sections-modal-subtitle'),
        sectionsModalBody: document.getElementById('sections-modal-body'),
        sectionsModalClose: document.getElementById('sections-modal-close'),
        sectionsBackBtn: document.getElementById('sections-back-btn'),
        helpBtn: document.getElementById('help-btn'),
        helpModal: document.getElementById('help-modal'),
        helpModalClose: document.getElementById('help-modal-close')
    };

    // Initialize components
    const dataProcessor = new DataProcessor();
    const docProcessor = new DocProcessor();
    const timelineView = new TimelineView('timeline-container', showNodeDetails);
    const rawView = new RawView('session-info', 'raw-data');

    // Set up event listeners
    function setupEventListeners() {
        // File input change
        elements.fileInput.addEventListener('change', handleFileSelect);
        
        // Import button click
        elements.importBtn.addEventListener('click', importData);
        
        // Sample data button click
        elements.sampleDataBtn.addEventListener('click', loadSampleData);
        
        // View selector buttons
        elements.viewButtons.forEach(button => {
            button.addEventListener('click', () => switchView(button.getAttribute('data-view')));
        });
        
        // Timeline expand/collapse buttons
        if (elements.timelineSettings.expandAllBtn) {
            elements.timelineSettings.expandAllBtn.addEventListener('click', expandAllSearches);
        }
        
        if (elements.timelineSettings.collapseAllBtn) {
            elements.timelineSettings.collapseAllBtn.addEventListener('click', collapseAllSearches);
        }
        
        // Go Home button
        if (elements.timelineSettings.goHomeBtn) {
            elements.timelineSettings.goHomeBtn.addEventListener('click', goHome);
        }
        
        // Details panel close button
        elements.closeDetails.addEventListener('click', closeDetails);
        
        // Document input change
        elements.docInput.addEventListener('change', handleDocSelect);
        
        // Sections modal close button
        elements.sectionsModalClose.addEventListener('click', closeSectionsModal);
        
        // Sections back button
        elements.sectionsBackBtn.addEventListener('click', closeSectionsModal);
        
        // Add global keyboard listener for Escape key
        document.addEventListener('keydown', handleKeyPress);
        
        // Help button
        if (elements.helpBtn) {
            elements.helpBtn.addEventListener('click', showHelpModal);
        }
        
        // Help modal close button
        if (elements.helpModalClose) {
            elements.helpModalClose.addEventListener('click', closeHelpModal);
        }
    }
    
    /**
     * Show the help modal
     */
    function showHelpModal() {
        elements.helpModal.classList.add('active');
    }
    
    /**
     * Close the help modal
     */
    function closeHelpModal() {
        elements.helpModal.classList.remove('active');
    }
    
    /**
     * Handle keyboard events like Escape key
     * @param {KeyboardEvent} event - The keyboard event
     */
    function handleKeyPress(event) {
        // Check if Escape key was pressed
        if (event.key === 'Escape') {
            // Close any open panels or modals
            if (state.detailsOpen) {
                closeDetails();
            }
            
            // Close sections modal if open
            if (elements.sectionsModal.classList.contains('active')) {
                closeSectionsModal();
            }
            
            // Close help modal if open
            if (elements.helpModal.classList.contains('active')) {
                closeHelpModal();
            }
        }
    }

    /**
     * Handle file selection
     * @param {Event} event - Change event from file input
     */
    function handleFileSelect(event) {
        const file = event.target.files[0];
        
        if (file) {
            elements.fileName.textContent = file.name;
            elements.importBtn.disabled = false;
        } else {
            elements.fileName.textContent = 'No file selected';
            elements.importBtn.disabled = true;
        }
    }
    
    /**
     * Handle document selection
     * @param {Event} event - Change event from document input
     */
    async function handleDocSelect(event) {
        const file = event.target.files[0];
        
        if (file) {
            elements.docName.textContent = file.name;
            elements.docStatus.textContent = 'Processing document...';
            elements.docStatus.className = 'doc-status';
            elements.docSectionsContainer.classList.add('hidden');
            elements.docSectionsList.innerHTML = '';
            
            try {
                const success = await docProcessor.processDocument(file);
                
                if (success) {
                    state.docLoaded = true;
                    elements.docStatus.textContent = `Document processed successfully (${docProcessor.sections.length} sections found)`;
                    elements.docStatus.className = 'doc-status success';
                    
                    // Display the sections list
                    displayDocumentSections(docProcessor.sections);
                    
                    // If data is already loaded, update the content page entries with section buttons
                    // Use a slight delay to ensure DOM is ready
                    if (state.isDataLoaded) {
                        console.log("Data already loaded, updating content pages with sections");
                        setTimeout(() => {
                            updateContentPagesWithSections();
                        }, 100);
                    }
                } else {
                    elements.docStatus.textContent = 'Error processing document';
                    elements.docStatus.className = 'doc-status error';
                }
            } catch (error) {
                elements.docStatus.textContent = `Error: ${error.message}`;
                elements.docStatus.className = 'doc-status error';
                console.error('Error processing document:', error);
            }
        } else {
            elements.docName.textContent = 'No document selected';
            elements.docStatus.textContent = '';
            elements.docStatus.className = 'doc-status';
            elements.docSectionsContainer.classList.add('hidden');
            elements.docSectionsList.innerHTML = '';
        }
    }
    
    /**
     * Display the sections detected in the document
     * @param {Array} sections - Array of section objects
     */
    function displayDocumentSections(sections) {
        if (!sections || sections.length === 0) {
            elements.docSectionsContainer.classList.add('hidden');
            return;
        }
        
        elements.docSectionsList.innerHTML = '';
        
        // Create a section item for each section
        sections.forEach(section => {
            const sectionItem = document.createElement('div');
            sectionItem.className = 'doc-section-item';
            
            const sectionTitle = document.createElement('div');
            sectionTitle.className = `section-level-${section.level}`;
            sectionTitle.textContent = section.title;
            
            sectionItem.appendChild(sectionTitle);
            elements.docSectionsList.appendChild(sectionItem);
        });
        
        elements.docSectionsContainer.classList.remove('hidden');
    }

    /**
     * Import data from the selected file
     */
    async function importData() {
        try {
            const file = elements.fileInput.files[0];
            
            if (!file) {
                showError('Please select a file to import');
                return;
            }
            
            // Process the data
            const data = await dataProcessor.parseData(file);
            
            if (!data || !data.raw) {
                showError('Invalid data format');
                return;
            }
            
            // Store the data and update the UI
            state.data = data;
            state.isDataLoaded = true;
            
            // Show visualization and hide upload section
            showVisualization();
            
            // Initialize views with data
            initializeViews();
            
            // Update content pages with sections if document is loaded
            if (state.docLoaded) {
                console.log("Document already loaded, updating content pages with sections");
                // Use a slight delay to ensure views are fully initialized
                setTimeout(() => {
                    updateContentPagesWithSections();
                }, 300);
            }
        } catch (error) {
            showError(`Error importing data: ${error.message}`);
        }
    }

    /**
     * Load sample data
     */
    async function loadSampleData() {
        try {
            console.log('Loading sample data');
            // Use the correct path to the sample data
            const sampleData = {
              "id": "loj2zpmqr6bs3",
              "name": "Research on Climate Change",
              "startTime": "2025-05-18T19:30:45.123Z",
              "endTime": "2025-05-18T20:45:12.456Z",
              "searches": [
                {
                  "type": "search",
                  "engine": "GOOGLE",
                  "domain": "google.com",
                  "query": "climate change impact sea levels",
                  "params": {
                    "q": "climate change impact sea levels",
                    "tbm": "nws"
                  },
                  "url": "https://www.google.com/search?q=climate+change+impact+sea+levels&tbm=nws",
                  "timestamp": "2025-05-18T19:31:02.789Z",
                  "tabId": 12345,
                  "notes": [
                    {
                      "content": "Starting my research on sea level rise",
                      "timestamp": "2025-05-18T19:31:15.123Z"
                    }
                  ]
                },
                {
                  "type": "search",
                  "engine": "GOOGLE_SCHOLAR",
                  "domain": "scholar.google.com",
                  "query": "sea level rise projections 2025",
                  "params": {
                    "q": "sea level rise projections 2025"
                  },
                  "url": "https://scholar.google.com/scholar?q=sea+level+rise+projections+2025",
                  "timestamp": "2025-05-18T19:35:30.456Z",
                  "tabId": 12346
                },
                {
                  "type": "search",
                  "engine": "GOOGLE",
                  "domain": "google.com",
                  "query": "coastal cities at risk sea level rise",
                  "params": {
                    "q": "coastal cities at risk sea level rise"
                  },
                  "url": "https://www.google.com/search?q=coastal+cities+at+risk+sea+level+rise",
                  "timestamp": "2025-05-18T20:05:12.789Z",
                  "tabId": 12347
                }
              ],
              "contentPages": [
                {
                  "type": "pageVisit",
                  "url": "https://www.scientificamerican.com/article/sea-level-rise-projections/",
                  "title": "New Sea Level Rise Projections Alarm Scientists",
                  "timestamp": "2025-05-18T19:32:45.789Z",
                  "tabId": 12345,
                  "sourceSearch": {
                    "engine": "GOOGLE",
                    "query": "climate change impact sea levels",
                    "url": "https://www.google.com/search?q=climate+change+impact+sea+levels&tbm=nws",
                    "timestamp": "2025-05-18T19:31:02.789Z"
                  },
                  "metadata": {
                    "title": "New Sea Level Rise Projections Alarm Scientists",
                    "url": "https://www.scientificamerican.com/article/sea-level-rise-projections/",
                    "author": "Jane Smith",
                    "publishDate": "2025-05-10",
                    "description": "Recent studies show sea levels rising faster than previously predicted..."
                  },
                  "notes": [
                    {
                      "content": "Important data on acceleration of sea level rise",
                      "timestamp": "2025-05-18T19:35:12.456Z"
                    }
                  ]
                },
                {
                  "type": "pageVisit",
                  "url": "https://climate.nasa.gov/news/3021/2023-was-hottest-year-on-record/",
                  "title": "2023 Was Hottest Year on Record",
                  "timestamp": "2025-05-18T19:37:30.123Z",
                  "tabId": 12345,
                  "sourceSearch": {
                    "engine": "GOOGLE",
                    "query": "climate change impact sea levels",
                    "url": "https://www.google.com/search?q=climate+change+impact+sea+levels&tbm=nws",
                    "timestamp": "2025-05-18T19:31:02.789Z"
                  },
                  "metadata": {
                    "title": "2023 Was Hottest Year on Record",
                    "url": "https://climate.nasa.gov/news/3021/2023-was-hottest-year-on-record/",
                    "author": "NASA Climate Team",
                    "publishDate": "2024-01-15",
                    "description": "NASA and NOAA find that 2023 global temperatures set an all-time record high."
                  }
                },
                {
                  "type": "pageVisit",
                  "url": "https://www.nature.com/articles/s41586-024-07245-y",
                  "title": "Accelerated sea level rise in coastal regions",
                  "timestamp": "2025-05-18T19:40:15.456Z",
                  "tabId": 12346,
                  "sourceSearch": {
                    "engine": "GOOGLE_SCHOLAR",
                    "query": "sea level rise projections 2025",
                    "url": "https://scholar.google.com/scholar?q=sea+level+rise+projections+2025",
                    "timestamp": "2025-05-18T19:35:30.456Z"
                  },
                  "metadata": {
                    "title": "Accelerated sea level rise in coastal regions",
                    "url": "https://www.nature.com/articles/s41586-024-07245-y",
                    "author": "Robert Johnson et al.",
                    "publishDate": "2024-03-22",
                    "description": "New satellite measurements reveal faster than expected sea level rise in key coastal areas."
                  },
                  "notes": [
                    {
                      "content": "Key study for thesis - contains data on acceleration rates for Miami and NYC",
                      "timestamp": "2025-05-18T19:42:10.123Z"
                    }
                  ]
                },
                {
                  "type": "pageVisit",
                  "url": "https://www.pnas.org/doi/10.1073/pnas.2023423118",
                  "title": "Economic impacts of sea level rise on coastal infrastructure",
                  "timestamp": "2025-05-18T19:50:23.789Z",
                  "tabId": 12346,
                  "sourceSearch": {
                    "engine": "GOOGLE_SCHOLAR",
                    "query": "sea level rise projections 2025",
                    "url": "https://scholar.google.com/scholar?q=sea+level+rise+projections+2025",
                    "timestamp": "2025-05-18T19:35:30.456Z"
                  },
                  "metadata": {
                    "title": "Economic impacts of sea level rise on coastal infrastructure",
                    "url": "https://www.pnas.org/doi/10.1073/pnas.2023423118",
                    "author": "Sarah Williams, Michael Chen",
                    "publishDate": "2023-09-05",
                    "description": "Analysis of economic consequences of sea level rise on critical infrastructure in 25 major coastal cities."
                  }
                },
                {
                  "type": "pageVisit",
                  "url": "https://www.cnn.com/2024/05/01/us/miami-sea-level-rise-plan/index.html",
                  "title": "Miami unveils $5 billion sea level rise adaptation plan",
                  "timestamp": "2025-05-18T20:10:45.123Z",
                  "tabId": 12347,
                  "sourceSearch": {
                    "engine": "GOOGLE",
                    "query": "coastal cities at risk sea level rise",
                    "url": "https://www.google.com/search?q=coastal+cities+at+risk+sea+level+rise",
                    "timestamp": "2025-05-18T20:05:12.789Z"
                  },
                  "metadata": {
                    "title": "Miami unveils $5 billion sea level rise adaptation plan",
                    "url": "https://www.cnn.com/2024/05/01/us/miami-sea-level-rise-plan/index.html",
                    "author": "CNN Staff",
                    "publishDate": "2024-05-01",
                    "description": "Miami announces comprehensive plan to address rising sea levels with infrastructure improvements."
                  },
                  "notes": [
                    {
                      "content": "Great example of adaptation planning - cite in policy section",
                      "timestamp": "2025-05-18T20:12:30.456Z"
                    }
                  ]
                },
                {
                  "type": "pageVisit",
                  "url": "https://www.newyorker.com/magazine/2024/03/15/sinking-cities-sea-level-rise",
                  "title": "The Sinking Cities: How Sea Level Rise Is Claiming Urban Areas",
                  "timestamp": "2025-05-18T20:20:18.789Z",
                  "tabId": 12347,
                  "sourceSearch": {
                    "engine": "GOOGLE",
                    "query": "coastal cities at risk sea level rise",
                    "url": "https://www.google.com/search?q=coastal+cities+at+risk+sea+level+rise",
                    "timestamp": "2025-05-18T20:05:12.789Z"
                  },
                  "metadata": {
                    "title": "The Sinking Cities: How Sea Level Rise Is Claiming Urban Areas",
                    "url": "https://www.newyorker.com/magazine/2024/03/15/sinking-cities-sea-level-rise",
                    "author": "Elizabeth Kolbert",
                    "publishDate": "2024-03-15",
                    "description": "An in-depth look at how coastal cities worldwide are facing existential threats from rising seas."
                  }
                }
              ],
              "chronologicalEvents": [
                {
                  "type": "search",
                  "engine": "GOOGLE",
                  "domain": "google.com",
                  "query": "climate change impact sea levels",
                  "params": {
                    "q": "climate change impact sea levels",
                    "tbm": "nws"
                  },
                  "url": "https://www.google.com/search?q=climate+change+impact+sea+levels&tbm=nws",
                  "timestamp": "2025-05-18T19:31:02.789Z",
                  "tabId": 12345,
                  "notes": [
                    {
                      "content": "Starting my research on sea level rise",
                      "timestamp": "2025-05-18T19:31:15.123Z"
                    }
                  ]
                },
                {
                  "type": "pageVisit",
                  "url": "https://www.scientificamerican.com/article/sea-level-rise-projections/",
                  "title": "New Sea Level Rise Projections Alarm Scientists",
                  "timestamp": "2025-05-18T19:32:45.789Z",
                  "tabId": 12345,
                  "sourceSearch": {
                    "engine": "GOOGLE",
                    "query": "climate change impact sea levels",
                    "url": "https://www.google.com/search?q=climate+change+impact+sea+levels&tbm=nws",
                    "timestamp": "2025-05-18T19:31:02.789Z"
                  },
                  "metadata": {
                    "title": "New Sea Level Rise Projections Alarm Scientists",
                    "url": "https://www.scientificamerican.com/article/sea-level-rise-projections/",
                    "author": "Jane Smith",
                    "publishDate": "2025-05-10",
                    "description": "Recent studies show sea levels rising faster than previously predicted..."
                  },
                  "notes": [
                    {
                      "content": "Important data on acceleration of sea level rise",
                      "timestamp": "2025-05-18T19:35:12.456Z"
                    }
                  ]
                },
                {
                  "type": "search",
                  "engine": "GOOGLE_SCHOLAR",
                  "domain": "scholar.google.com",
                  "query": "sea level rise projections 2025",
                  "params": {
                    "q": "sea level rise projections 2025"
                  },
                  "url": "https://scholar.google.com/scholar?q=sea+level+rise+projections+2025",
                  "timestamp": "2025-05-18T19:35:30.456Z",
                  "tabId": 12346
                },
                {
                  "type": "pageVisit",
                  "url": "https://climate.nasa.gov/news/3021/2023-was-hottest-year-on-record/",
                  "title": "2023 Was Hottest Year on Record",
                  "timestamp": "2025-05-18T19:37:30.123Z",
                  "tabId": 12345,
                  "sourceSearch": {
                    "engine": "GOOGLE",
                    "query": "climate change impact sea levels",
                    "url": "https://www.google.com/search?q=climate+change+impact+sea+levels&tbm=nws",
                    "timestamp": "2025-05-18T19:31:02.789Z"
                  },
                  "metadata": {
                    "title": "2023 Was Hottest Year on Record",
                    "url": "https://climate.nasa.gov/news/3021/2023-was-hottest-year-on-record/",
                    "author": "NASA Climate Team",
                    "publishDate": "2024-01-15",
                    "description": "NASA and NOAA find that 2023 global temperatures set an all-time record high."
                  }
                },
                {
                  "type": "pageVisit",
                  "url": "https://www.nature.com/articles/s41586-024-07245-y",
                  "title": "Accelerated sea level rise in coastal regions",
                  "timestamp": "2025-05-18T19:40:15.456Z",
                  "tabId": 12346,
                  "sourceSearch": {
                    "engine": "GOOGLE_SCHOLAR",
                    "query": "sea level rise projections 2025",
                    "url": "https://scholar.google.com/scholar?q=sea+level+rise+projections+2025",
                    "timestamp": "2025-05-18T19:35:30.456Z"
                  },
                  "metadata": {
                    "title": "Accelerated sea level rise in coastal regions",
                    "url": "https://www.nature.com/articles/s41586-024-07245-y",
                    "author": "Robert Johnson et al.",
                    "publishDate": "2024-03-22",
                    "description": "New satellite measurements reveal faster than expected sea level rise in key coastal areas."
                  },
                  "notes": [
                    {
                      "content": "Key study for thesis - contains data on acceleration rates for Miami and NYC",
                      "timestamp": "2025-05-18T19:42:10.123Z"
                    }
                  ]
                },
                {
                  "type": "pageVisit",
                  "url": "https://www.pnas.org/doi/10.1073/pnas.2023423118",
                  "title": "Economic impacts of sea level rise on coastal infrastructure",
                  "timestamp": "2025-05-18T19:50:23.789Z",
                  "tabId": 12346,
                  "sourceSearch": {
                    "engine": "GOOGLE_SCHOLAR",
                    "query": "sea level rise projections 2025",
                    "url": "https://scholar.google.com/scholar?q=sea+level+rise+projections+2025",
                    "timestamp": "2025-05-18T19:35:30.456Z"
                  },
                  "metadata": {
                    "title": "Economic impacts of sea level rise on coastal infrastructure",
                    "url": "https://www.pnas.org/doi/10.1073/pnas.2023423118",
                    "author": "Sarah Williams, Michael Chen",
                    "publishDate": "2023-09-05",
                    "description": "Analysis of economic consequences of sea level rise on critical infrastructure in 25 major coastal cities."
                  }
                },
                {
                  "type": "search",
                  "engine": "GOOGLE",
                  "domain": "google.com",
                  "query": "coastal cities at risk sea level rise",
                  "params": {
                    "q": "coastal cities at risk sea level rise"
                  },
                  "url": "https://www.google.com/search?q=coastal+cities+at+risk+sea+level+rise",
                  "timestamp": "2025-05-18T20:05:12.789Z",
                  "tabId": 12347
                },
                {
                  "type": "pageVisit",
                  "url": "https://www.cnn.com/2024/05/01/us/miami-sea-level-rise-plan/index.html",
                  "title": "Miami unveils $5 billion sea level rise adaptation plan",
                  "timestamp": "2025-05-18T20:10:45.123Z",
                  "tabId": 12347,
                  "sourceSearch": {
                    "engine": "GOOGLE",
                    "query": "coastal cities at risk sea level rise",
                    "url": "https://www.google.com/search?q=coastal+cities+at+risk+sea+level+rise",
                    "timestamp": "2025-05-18T20:05:12.789Z"
                  },
                  "metadata": {
                    "title": "Miami unveils $5 billion sea level rise adaptation plan",
                    "url": "https://www.cnn.com/2024/05/01/us/miami-sea-level-rise-plan/index.html",
                    "author": "CNN Staff",
                    "publishDate": "2024-05-01",
                    "description": "Miami announces comprehensive plan to address rising sea levels with infrastructure improvements."
                  },
                  "notes": [
                    {
                      "content": "Great example of adaptation planning - cite in policy section",
                      "timestamp": "2025-05-18T20:12:30.456Z"
                    }
                  ]
                },
                {
                  "type": "pageVisit",
                  "url": "https://www.newyorker.com/magazine/2024/03/15/sinking-cities-sea-level-rise",
                  "title": "The Sinking Cities: How Sea Level Rise Is Claiming Urban Areas",
                  "timestamp": "2025-05-18T20:20:18.789Z",
                  "tabId": 12347,
                  "sourceSearch": {
                    "engine": "GOOGLE",
                    "query": "coastal cities at risk sea level rise",
                    "url": "https://www.google.com/search?q=coastal+cities+at+risk+sea+level+rise",
                    "timestamp": "2025-05-18T20:05:12.789Z"
                  },
                  "metadata": {
                    "title": "The Sinking Cities: How Sea Level Rise Is Claiming Urban Areas",
                    "url": "https://www.newyorker.com/magazine/2024/03/15/sinking-cities-sea-level-rise",
                    "author": "Elizabeth Kolbert",
                    "publishDate": "2024-03-15",
                    "description": "An in-depth look at how coastal cities worldwide are facing existential threats from rising seas."
                  }
                }
              ]
            };
            
            console.log('Sample data loaded:', sampleData);
            
            // Process the data
            const data = await dataProcessor.parseData(sampleData);
            console.log('Data processed:', data);
            
            // Store the data and update the UI
            state.data = data;
            state.isDataLoaded = true;
            
            // Show visualization and hide upload section
            showVisualization();
            
            // Initialize views with data
            initializeViews();
            
            // Update content pages with sections if document is loaded
            if (state.docLoaded) {
                console.log("Document already loaded, updating content pages with sections");
                // Use a slight delay to ensure views are fully initialized
                setTimeout(() => {
                    updateContentPagesWithSections();
                }, 300);
            }
        } catch (error) {
            console.error('Error loading sample data:', error);
            showError(`Error loading sample data: ${error.message}`);
        }
    }

    /**
     * Initialize views with current data
     */
    function initializeViews() {
        if (!state.data) {
            console.warn('No data available to initialize views');
            return;
        }
        
        console.log('Initializing views with data');
        
        // Initialize all searches as expanded by default
        expandAllSearches();
        
        // Initialize timeline and raw views
        timelineView.update(state.data.timeline);
        timelineView.updateExpandedSearches(state.expandedSearches);
        rawView.update(state.data.raw);
        
        // Show the current view
        switchView(state.currentView);
    }

    /**
     * Switch between visualization views
     * @param {string} viewName - Name of the view to switch to
     */
    function switchView(viewName) {
        if (!viewName || !['timeline', 'raw'].includes(viewName)) {
            return;
        }
        
        console.log(`Switching to ${viewName} view`);
        
        // Update state
        state.currentView = viewName;
        
        // Update button active states
        elements.viewButtons.forEach(button => {
            if (button.getAttribute('data-view') === viewName) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
        
        // First make all view panes visible but with zero opacity for measurement
        elements.viewPanes.forEach(pane => {
            pane.classList.remove('hidden');
            pane.style.opacity = '0';
        });
        
        // Wait a moment for layout to calculate, then show only the active one
        setTimeout(() => {
            elements.viewPanes.forEach(pane => {
                if (pane.id === `${viewName}-view`) {
                    pane.style.opacity = '1';
                } else {
                    pane.classList.add('hidden');
                    pane.style.opacity = '1'; // Reset for next time
                }
            });
            
            // Special handling for specific views if needed in the future
            if (viewName === 'timeline') {
                // Ensure timeline is properly rendered
                if (state.data && state.data.timeline) {
                    timelineView.update(state.data.timeline);
                }
            }
        }, 50);
    }

    /**
     * Expand all search entries in the timeline
     */
    function expandAllSearches() {
        // Add all search URLs to the expanded set
        if (state.data && state.data.timeline) {
            state.data.timeline.forEach(event => {
                if (event.type === 'search') {
                    state.expandedSearches.add(event.url);
                }
            });
            
            // Update the timeline view
            timelineView.updateExpandedSearches(state.expandedSearches);
        }
    }
    
    /**
     * Collapse all search entries in the timeline
     */
    function collapseAllSearches() {
        // Clear all expanded searches
        state.expandedSearches.clear();
        
        // Update the timeline view
        if (state.data && state.data.timeline) {
            timelineView.updateExpandedSearches(state.expandedSearches);
        }
    }

    /**
     * Update content pages with section buttons
     */
    function updateContentPagesWithSections() {
        if (!state.docLoaded || !state.isDataLoaded) return;
        
        console.log("Updating content pages with sections...");
        
        const pageEntries = document.querySelectorAll('.timeline-entry.pageVisit');
        console.log(`Found ${pageEntries.length} page entries`);
        
        pageEntries.forEach(entry => {
            const url = entry.getAttribute('data-url');
            const title = entry.querySelector('h4')?.textContent;
            
            if (!url && !title) return;
            
            console.log(`Processing page: ${title || url}`);
            
            // Find matching page data
            const pageData = state.data.timeline.find(event => {
                return event.type === 'pageVisit' && 
                      (event.url === url || event.title === title);
            });
            
            if (!pageData) {
                console.log("No matching page data found");
                return;
            }
            
            // Find matching sections
            const matchingSections = docProcessor.findMatchingSections(pageData);
            console.log(`Found ${matchingSections.length} matching sections for: ${title || url}`);
            
            // Find the cards button
            const cardsButton = entry.querySelector('.view-cards-btn');
            if (!cardsButton) {
                console.log("No cards button found");
                return;
            }
            
            if (matchingSections.length > 0) {
                console.log(`Enabling cards button with ${matchingSections.length} cards`);
                // Update button text and enable it
                cardsButton.textContent = `View ${matchingSections.length} Card${matchingSections.length !== 1 ? 's' : ''}`;
                cardsButton.disabled = false;
                
                // Remove existing event listeners by cloning the node
                const newCardsButton = cardsButton.cloneNode(true);
                cardsButton.parentNode.replaceChild(newCardsButton, cardsButton);
                
                // Add click handler to the new button
                newCardsButton.addEventListener('click', () => {
                    console.log("Cards button clicked, showing sections");
                    showSections(pageData, matchingSections);
                });
                
                // Update styling to make it stand out
                newCardsButton.style.opacity = '1';
            } else {
                console.log("No matching sections, keeping button disabled");
                // Keep button disabled and show 0 Cards
                cardsButton.textContent = '0 Cards';
                cardsButton.disabled = true;
                cardsButton.style.opacity = '0.6';
            }
        });
        
        console.log("Finished updating content pages with sections");
    }
    
    /**
     * Show sections modal for a page
     * @param {Object} page - Page data
     * @param {Array} sections - Matching sections
     */
    function showSections(page, sections) {
        if (!page || !sections || sections.length === 0) return;
        
        // Set modal title and subtitle
        elements.sectionsModalTitle.textContent = page.title || 'Page Content';
        elements.sectionsModalSubtitle.textContent = `Found ${sections.length} matching section${sections.length !== 1 ? 's' : ''} in "${docProcessor.getDocumentName()}"`;
        
        // Clear modal body content
        elements.sectionsModalBody.innerHTML = '';
        
        // Add each section
        sections.forEach(section => {
            const sectionElement = document.createElement('div');
            sectionElement.className = 'section-item';
            
            const sectionHeader = document.createElement('div');
            sectionHeader.className = 'section-header';
            sectionHeader.textContent = section.title;
            
            const sectionContent = document.createElement('div');
            sectionContent.className = 'section-content';
            
            // Highlight matches in content
            let highlightedContent = section.content;
            
            // Highlight title matches
            if (page.title) {
                const titleRegex = new RegExp(escapeRegExp(page.title), 'gi');
                highlightedContent = highlightedContent.replace(titleRegex, 
                    match => `<span class="section-match-highlight">${match}</span>`);
            }
            
            // Highlight URL matches (if present in text)
            if (page.url) {
                // Extract domain for simpler matching
                const urlParts = page.url.split('/');
                const domain = urlParts[2]; // e.g., "www.example.com"
                
                if (domain) {
                    const domainRegex = new RegExp(escapeRegExp(domain), 'gi');
                    highlightedContent = highlightedContent.replace(domainRegex,
                        match => `<span class="section-match-highlight">${match}</span>`);
                }
            }
            
            sectionContent.innerHTML = highlightedContent;
            
            sectionElement.appendChild(sectionHeader);
            sectionElement.appendChild(sectionContent);
            
            elements.sectionsModalBody.appendChild(sectionElement);
        });
        
        // Show the modal
        elements.sectionsModal.classList.add('active');
    }
    
    /**
     * Close the sections modal
     */
    function closeSectionsModal() {
        elements.sectionsModal.classList.remove('active');
    }

    /**
     * Show node details in the details panel
     * @param {Object} node - Node data
     */
    function showNodeDetails(node) {
        if (!node) return;
        
        let content = '';
        
        if (node.type === 'search') {
            content = `
                <div class="details-header">
                    <h4>Search Query</h4>
                    <div class="details-type search">${getEngineName(node.engine)}</div>
                </div>
                <div class="details-body">
                    <div class="details-query">"${node.query}"</div>
                    <div class="details-timestamp">
                        <strong>Time:</strong> ${formatDate(node.timestamp)}
                    </div>
                    <div class="details-url-container">
                        <a href="${node.url}" class="visit-page-btn" target="_blank">Visit Search Page</a>
                    </div>
                </div>
            `;
            
            // Add notes if available
            if (node.notes && node.notes.length > 0) {
                content += '<div class="details-notes"><h4>Notes</h4>';
                
                node.notes.forEach(note => {
                    content += `
                        <div class="details-note">
                            <div class="note-content">${note.content}</div>
                            <div class="note-timestamp">${formatDate(note.timestamp)}</div>
                        </div>
                    `;
                });
                
                content += '</div>';
            }
        } 
        else if (node.type === 'page') {
            const metadata = node.metadata || {};
            
            content = `
                <div class="details-header">
                    <h4>Page Visit</h4>
                    <div class="details-type page">Web Page</div>
                </div>
                <div class="details-body">
                    <div class="details-title">${node.title || 'Untitled'}</div>
                    <div class="details-timestamp">
                        <strong>Visited:</strong> ${formatDate(node.timestamp)}
                    </div>
                    <div class="details-url-container">
                        <a href="${node.url}" class="visit-page-btn" target="_blank">Visit Page</a>
                    </div>
                </div>
            `;
            
            // Add metadata if available
            if (metadata) {
                content += '<div class="details-metadata">';
                
                if (metadata.author) {
                    content += `<div><strong>Author:</strong> ${metadata.author}</div>`;
                }
                
                if (metadata.publishDate) {
                    content += `<div><strong>Published:</strong> ${metadata.publishDate}</div>`;
                }
                
                if (metadata.description) {
                    content += `<div class="details-description">${metadata.description}</div>`;
                }
                
                content += '</div>';
            }
            
            // Add notes if available
            if (node.notes && node.notes.length > 0) {
                content += '<div class="details-notes"><h4>Notes</h4>';
                
                node.notes.forEach(note => {
                    content += `
                        <div class="details-note">
                            <div class="note-content">${note.content}</div>
                            <div class="note-timestamp">${formatDate(note.timestamp)}</div>
                        </div>
                    `;
                });
                
                content += '</div>';
            }
            
            // Add document sections button at the bottom if document is loaded
            if (state.docLoaded) {
                const matchingSections = docProcessor.findMatchingSections(node);
                
                if (matchingSections.length > 0) {
                    content += `
                        <div class="details-sections">
                            <button class="sections-btn" id="details-sections-btn" data-page-url="${node.url}">
                                View ${matchingSections.length} Card${matchingSections.length !== 1 ? 's' : ''}
                            </button>
                        </div>
                    `;
                }
            }
        } 
        else if (node.type === 'note') {
            content = `
                <div class="details-header">
                    <h4>Note</h4>
                    <div class="details-type note">Standalone Note</div>
                </div>
                <div class="details-body">
                    <div class="details-timestamp">
                        <strong>Added:</strong> ${formatDate(node.timestamp)}
                    </div>
                    <div class="details-content">${node.content}</div>
                </div>
            `;
            
            if (node.url) {
                content += `
                    <div class="details-url-container">
                        <a href="${node.url}" class="visit-page-btn" target="_blank">Visit Original Page</a>
                    </div>
                `;
            }
        }
        
        // Update the details content
        elements.detailsContent.innerHTML = content;
        
        // Set up the sections button if it exists
        const sectionsBtn = document.getElementById('details-sections-btn');
        if (sectionsBtn) {
            sectionsBtn.addEventListener('click', () => {
                const pageUrl = sectionsBtn.getAttribute('data-page-url');
                const matchingSections = docProcessor.findMatchingSections(node);
                
                if (matchingSections.length > 0) {
                    showSections(node, matchingSections);
                }
            });
        }
        
        // Show the details panel
        elements.detailsPanel.classList.add('open');
        state.detailsOpen = true;
    }

    /**
     * Close the details panel
     */
    function closeDetails() {
        elements.detailsPanel.classList.remove('open');
        state.detailsOpen = false;
    }

    /**
     * Show visualization and hide upload section
     */
    function showVisualization() {
        elements.uploadSection.classList.add('hidden');
        elements.visualizationContainer.classList.remove('hidden');
    }
    
    /**
     * Go back to the upload screen
     */
    function goHome() {
        // Hide visualization and show upload section
        elements.visualizationContainer.classList.add('hidden');
        elements.uploadSection.classList.remove('hidden');
        
        // Reset file inputs and status
        elements.fileInput.value = '';
        elements.fileName.textContent = 'No file selected';
        elements.importBtn.disabled = true;
        
        // Reset document input if present
        if (elements.docInput) {
            elements.docInput.value = '';
            elements.docName.textContent = 'No document selected';
            elements.docStatus.textContent = '';
            elements.docStatus.className = 'doc-status';
            elements.docSectionsContainer.classList.add('hidden');
            elements.docSectionsList.innerHTML = '';
        }
        
        // Reset state
        state.isDataLoaded = false;
        state.data = null;
        state.expandedSearches = new Set();
        state.docLoaded = false;
        
        // Reset processors
        docProcessor.reset();
        
        // Close any open panels
        closeDetails();
        closeSectionsModal();
    }

    /**
     * Show an error message to the user
     * @param {string} message - Error message
     */
    function showError(message) {
        alert(message);
        console.error(message);
    }

    /**
     * Format a timestamp as a readable date
     * @param {string} timestamp - ISO timestamp
     * @returns {string} - Formatted date and time
     */
    function formatDate(timestamp) {
        try {
            const date = new Date(timestamp);
            return date.toLocaleString();
        } catch (e) {
            return timestamp;
        }
    }

    /**
     * Get user-friendly name for search engine
     * @param {string} engineCode - Engine identifier (e.g., "GOOGLE")
     * @returns {string} - User-friendly engine name
     */
    function getEngineName(engineCode) {
        const engineMap = {
            'GOOGLE': 'Google Search',
            'GOOGLE_SCHOLAR': 'Google Scholar',
            'BING': 'Bing Search',
            'DUCKDUCKGO': 'DuckDuckGo',
            'GOOGLE_NEWS': 'Google News'
        };
        
        return engineMap[engineCode] || engineCode;
    }
    
    /**
     * Escape regular expression special characters
     * @param {string} string - String to escape
     * @returns {string} - Escaped string
     */
    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // Initialize application
    function init() {
        setupEventListeners();
        
        // Initialize all views with a small delay to ensure DOM is ready
        setTimeout(() => {
            console.log('Initializing views');
            timelineView.initialize();
            rawView.initialize();
        }, 100);
    }

    // Start the application
    init();
});