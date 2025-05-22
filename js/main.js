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
        docLoaded: false,
        teacherNotes: new Map(), // Map of page URLs to teacher notes
        currentEditingPage: null // Track which page is being edited
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
            exportNotesBtn: document.getElementById('export-notes-btn'),
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
        helpModalClose: document.getElementById('help-modal-close'),
        editModal: document.getElementById('edit-modal'),
        editModalClose: document.getElementById('edit-modal-close'),
        editForm: document.getElementById('edit-form'),
        editSaveBtn: document.getElementById('edit-save-btn'),
        editCancelBtn: document.getElementById('edit-cancel-btn'),
        addNoteModal: document.getElementById('add-note-modal'),
        addNoteModalClose: document.getElementById('add-note-modal-close'),
        addNoteForm: document.getElementById('add-note-form'),
        noteSaveBtn: document.getElementById('note-save-btn'),
        noteCancelBtn: document.getElementById('note-cancel-btn')
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
        
        // Export Notes button
        if (elements.timelineSettings.exportNotesBtn) {
            elements.timelineSettings.exportNotesBtn.addEventListener('click', exportNotes);
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
        
        // Edit modal event listeners
        if (elements.editModalClose) {
            elements.editModalClose.addEventListener('click', closeEditModal);
        }
        if (elements.editSaveBtn) {
            elements.editSaveBtn.addEventListener('click', saveMetadataChanges);
        }
        if (elements.editCancelBtn) {
            elements.editCancelBtn.addEventListener('click', closeEditModal);
        }
        
        // Add note modal event listeners
        if (elements.addNoteModalClose) {
            elements.addNoteModalClose.addEventListener('click', closeAddNoteModal);
        }
        if (elements.noteSaveBtn) {
            elements.noteSaveBtn.addEventListener('click', saveTeacherNote);
        }
        if (elements.noteCancelBtn) {
            elements.noteCancelBtn.addEventListener('click', closeAddNoteModal);
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
            
            // Close edit modal if open
            if (elements.editModal.classList.contains('active')) {
                closeEditModal();
            }
            
            // Close add note modal if open
            if (elements.addNoteModal.classList.contains('active')) {
                closeAddNoteModal();
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
        
        // Get all page entries in the timeline
        const pageEntries = document.querySelectorAll('.timeline-entry.pageVisit');
        console.log(`Found ${pageEntries.length} page entries`);
        
        // Get content pages from timeline data
        const contentPages = state.data.timeline.filter(event => 
            event.type === 'pageVisit'
        );
        
        // Use the docProcessor to assign sections to their best matching content pages
        const pageToSectionsMap = docProcessor.assignSectionsToBestPages(contentPages);
        
        // Update each page entry in the UI
        pageEntries.forEach(entry => {
            const url = entry.getAttribute('data-url');
            const title = entry.querySelector('h4')?.textContent;
            
            if (!url && !title) return;
            
            console.log(`Processing page: ${title || url}`);
            
            // Find matching page data
            const pageData = contentPages.find(page => 
                (page.url === url || page.title === title)
            );
            
            if (!pageData) {
                console.log("No matching page data found");
                return;
            }
            
            // Get sections exclusively assigned to this page
            const matchingSections = pageToSectionsMap.get(pageData) || [];
            console.log(`Found ${matchingSections.length} exclusively matching sections for: ${title || url}`);
            
            // Find the cards button
            const cardsButton = entry.querySelector('.view-cards-btn');
            if (!cardsButton) {
                console.log("No cards button found");
                return;
            }
            
            if (matchingSections.length > 0) {
                console.log(`Enabling cards button with ${matchingSections.length} exclusive cards`);
                // Update button text and enable it
                cardsButton.textContent = `View ${matchingSections.length} Card${matchingSections.length !== 1 ? 's' : ''}`;
                cardsButton.disabled = false;
                
                // Remove existing event listeners by cloning the node
                const newCardsButton = cardsButton.cloneNode(true);
                cardsButton.parentNode.replaceChild(newCardsButton, cardsButton);
                
                // Add click handler to the new button
                newCardsButton.addEventListener('click', () => {
                    console.log("Cards button clicked, showing exclusive sections");
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
     * @param {Array} sections - Matching sections with scores
     */
    function showSections(page, sections) {
        if (!page || !sections || sections.length === 0) return;
        
        // Set modal title and subtitle
        elements.sectionsModalTitle.textContent = page.title || 'Page Content';
        elements.sectionsModalSubtitle.textContent = `Found ${sections.length} matching section${sections.length !== 1 ? 's' : ''} in "${docProcessor.getDocumentName()}"`;
        
        // Clear modal body content
        elements.sectionsModalBody.innerHTML = '';
        
        // Add each section
        sections.forEach((section, index) => {
            const sectionElement = document.createElement('div');
            sectionElement.className = 'section-item';
            
            const sectionHeader = document.createElement('div');
            sectionHeader.className = 'section-header';
            
            // Show match score if available
            let headerContent = section.title;
            if (section.matchScore !== undefined) {
                headerContent += ` <span class="match-score">(Match score: ${section.matchScore})</span>`;
            }
            
            sectionHeader.innerHTML = headerContent;
            
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
                try {
                    // Use proper URL parsing
                    const url = new URL(page.url);
                    const domain = url.hostname;
                    
                    // Highlight domain
                    if (domain) {
                        const domainRegex = new RegExp(escapeRegExp(domain), 'gi');
                        highlightedContent = highlightedContent.replace(domainRegex,
                            match => `<span class="section-match-highlight">${match}</span>`);
                    }
                    
                    // Highlight path segments
                    const pathSegments = url.pathname.split('/')
                        .filter(segment => segment.length > 0);
                        
                    for (const segment of pathSegments) {
                        if (segment.length > 3) { // Only highlight significant segments
                            const segmentRegex = new RegExp(escapeRegExp(segment), 'gi');
                            highlightedContent = highlightedContent.replace(segmentRegex,
                                match => `<span class="section-match-highlight url-segment">${match}</span>`);
                        }
                    }
                } catch (e) {
                    // Fallback to simpler domain extraction
                    const urlParts = page.url.split('/');
                    const domain = urlParts[2]; // e.g., "www.example.com"
                    
                    if (domain) {
                        const domainRegex = new RegExp(escapeRegExp(domain), 'gi');
                        highlightedContent = highlightedContent.replace(domainRegex,
                            match => `<span class="section-match-highlight">${match}</span>`);
                    }
                }
            }
            
            // Add match details if available
            if (section.matchDetails) {
                const matchDetailsDiv = document.createElement('div');
                matchDetailsDiv.className = 'match-details';
                
                let matchDetailsHTML = '<h4>Match Details:</h4><ul>';
                
                if (section.matchDetails.exactTitleMatch) {
                    matchDetailsHTML += '<li>Exact title match</li>';
                }
                
                if (section.matchDetails.cleanTitleMatch) {
                    matchDetailsHTML += '<li>Clean title match</li>';
                }
                
                if (section.matchDetails.titleWordMatch) {
                    const wordMatch = section.matchDetails.titleWordMatch;
                    matchDetailsHTML += `<li>Title word match: ${wordMatch.matched}/${wordMatch.total} words (${Math.round(wordMatch.ratio * 100)}%)</li>`;
                }
                
                if (section.matchDetails.fullUrlMatch) {
                    matchDetailsHTML += '<li>Full URL match</li>';
                }
                
                if (section.matchDetails.urlComponentMatch) {
                    const urlMatch = section.matchDetails.urlComponentMatch;
                    matchDetailsHTML += `<li>URL component match: "${urlMatch.component}"${urlMatch.isDomainOnly ? ' (domain only)' : ''}</li>`;
                }
                
                if (section.matchDetails.authorMatch) {
                    matchDetailsHTML += '<li>Author match</li>';
                }
                
                if (section.matchDetails.descriptionMatch) {
                    const descMatch = section.matchDetails.descriptionMatch;
                    matchDetailsHTML += `<li>Description match: ${descMatch.matched} key terms</li>`;
                }
                
                if (section.matchDetails.dateMatch) {
                    matchDetailsHTML += '<li>Publication date match</li>';
                }
                
                matchDetailsHTML += '</ul>';
                matchDetailsDiv.innerHTML = matchDetailsHTML;
                
                // Add the match details before the content
                sectionElement.appendChild(sectionHeader);
                sectionElement.appendChild(matchDetailsDiv);
                sectionElement.appendChild(sectionContent);
            } else {
                sectionElement.appendChild(sectionHeader);
                sectionElement.appendChild(sectionContent);
            }
            
            sectionContent.innerHTML = highlightedContent;
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
            
            // Prioritize metadata.title (more accurate) over node.title, show URL separately if we have a title
            const displayTitle = metadata.title || node.title;
            const displayUrl = node.url;
            
            content = `
                <div class="details-header">
                    <h4>Page Visit</h4>
                    <div class="details-type page">Web Page</div>
                </div>
                <div class="details-body">
                    <div class="details-title">${displayTitle || displayUrl}</div>
                    <div class="details-timestamp">
                        <strong>Visited:</strong> ${formatDate(node.timestamp)}
                    </div>
                    <div class="details-url-container">
                        <a href="${node.url}" class="visit-page-btn" target="_blank">Visit Page</a>
                    </div>
                </div>
            `;
            
            // Add comprehensive metadata section if available
            if (metadata && Object.keys(metadata).length > 0) {
                content += '<div class="details-metadata"><h4>Metadata</h4>';
                
                if (metadata.author) {
                    content += `<div class="details-metadata-item"><strong>Author:</strong> ${metadata.author}</div>`;
                }
                
                if (metadata.publisher) {
                    content += `<div class="details-metadata-item"><strong>Publisher:</strong> ${metadata.publisher}</div>`;
                }
                
                if (metadata.publishDate) {
                    content += `<div class="details-metadata-item"><strong>Published:</strong> ${metadata.publishDate}</div>`;
                }
                
                if (metadata.description) {
                    content += `<div class="details-metadata-item details-description"><strong>Description:</strong> ${metadata.description}</div>`;
                }
                
                // Add any other metadata fields that might be present
                Object.keys(metadata).forEach(key => {
                    if (!['title', 'url', 'author', 'publisher', 'publishDate', 'description'].includes(key)) {
                        const value = metadata[key];
                        if (value && typeof value === 'string') {
                            const capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1);
                            content += `<div class="details-metadata-item"><strong>${capitalizedKey}:</strong> ${value}</div>`;
                        }
                    }
                });
                
                content += '</div>';
            }
            
            // Add notes if available
            if (node.notes && node.notes.length > 0) {
                content += '<div class="details-notes"><h4>Student Notes</h4>';
                
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
            
            // Add teacher notes if available
            const teacherNotes = state.teacherNotes.get(node.url) || [];
            if (teacherNotes.length > 0) {
                content += '<div class="details-notes teacher-notes"><h4>Teacher Notes</h4>';
                
                teacherNotes.forEach(note => {
                    content += `
                        <div class="details-note teacher-note">
                            <div class="note-content">${note.content}</div>
                            <div class="note-timestamp">${formatDate(note.timestamp)}</div>
                        </div>
                    `;
                });
                
                content += '</div>';
            }
            
            // Add teacher action buttons
            content += `
                <div class="teacher-actions">
                    <button class="edit-metadata-btn" data-page-url="${node.url}">Edit Metadata</button>
                    <button class="add-note-btn" data-page-url="${node.url}">Add Teacher Note</button>
                </div>
            `;
            
            // Add document sections button at the bottom if document is loaded
            if (state.docLoaded) {
                // Find the exact matching content page from the timeline data
                const exactPage = state.data.timeline.find(event => 
                    event.type === 'pageVisit' && 
                    (event.url === node.url || event.title === node.title)
                );
                
                if (exactPage) {
                    // Get all content pages from timeline data
                    const contentPages = state.data.timeline.filter(event => 
                        event.type === 'pageVisit'
                    );
                    
                    // Get all page-to-sections assignments (for exclusive matches)
                    const pageToSectionsMap = docProcessor.assignSectionsToBestPages(contentPages);
                    
                    // Get sections exclusively assigned to this page
                    const exclusiveSections = pageToSectionsMap.get(exactPage) || [];
                    
                    // Always show the button in details view, but disable it if there are no sections
                    content += `
                        <div class="details-sections">
                            <button class="sections-btn" id="details-sections-btn" data-page-url="${node.url}" 
                                ${exclusiveSections.length === 0 ? 'disabled' : ''}>
                                View ${exclusiveSections.length} Card${exclusiveSections.length !== 1 ? 's' : ''}
                            </button>
                        </div>
                    `;
                } else {
                    // Fallback if no exact page is found (should not happen)
                    content += `
                        <div class="details-sections">
                            <button class="sections-btn" id="details-sections-btn" disabled>
                                View 0 Cards
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
                // Don't do anything if button is disabled (no sections)
                if (sectionsBtn.disabled) return;
                
                const pageUrl = sectionsBtn.getAttribute('data-page-url');
                
                // Find the exact matching content page from the timeline data
                const exactPage = state.data.timeline.find(event => 
                    event.type === 'pageVisit' && 
                    (event.url === node.url || event.title === node.title)
                );
                
                if (exactPage) {
                    // Get all content pages from timeline data
                    const contentPages = state.data.timeline.filter(event => 
                        event.type === 'pageVisit'
                    );
                    
                    // Get all page-to-sections assignments
                    const pageToSectionsMap = docProcessor.assignSectionsToBestPages(contentPages);
                    
                    // Get sections exclusively assigned to this page
                    const exclusiveSections = pageToSectionsMap.get(exactPage) || [];
                    
                    if (exclusiveSections.length > 0) {
                        showSections(exactPage, exclusiveSections);
                    }
                }
            });
        }

        // Add event listeners for teacher action buttons
        document.querySelectorAll('.edit-metadata-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const pageUrl = this.getAttribute('data-page-url');
                showEditModal(pageUrl);
            });
        });

        document.querySelectorAll('.add-note-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const pageUrl = this.getAttribute('data-page-url');
                showAddNoteModal(pageUrl);
            });
        });
        
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

    /**
     * Show the edit metadata modal for a page
     * @param {string} pageUrl - URL of the page to edit
     */
    function showEditModal(pageUrl) {
        // Find the page data from timeline
        const pageData = state.data.timeline.find(event => 
            event.type === 'pageVisit' && event.url === pageUrl
        );
        
        if (!pageData) {
            showError('Page data not found');
            return;
        }
        
        // Store the page being edited
        state.currentEditingPage = pageData;
        
        // Pre-populate the form with existing metadata
        const metadata = pageData.metadata || {};
        
        const titleField = document.getElementById('edit-title');
        const authorField = document.getElementById('edit-author');
        const publisherField = document.getElementById('edit-publisher');
        const publishDateField = document.getElementById('edit-publish-date');
        const descriptionField = document.getElementById('edit-description');
        
        if (titleField) titleField.value = metadata.title || pageData.title || '';
        if (authorField) authorField.value = metadata.author || '';
        if (publisherField) publisherField.value = metadata.publisher || '';
        if (publishDateField) publishDateField.value = metadata.publishDate || '';
        if (descriptionField) descriptionField.value = metadata.description || '';
        
        // Show the modal
        elements.editModal.classList.add('active');
    }

    /**
     * Close the edit metadata modal
     */
    function closeEditModal() {
        elements.editModal.classList.remove('active');
        state.currentEditingPage = null;
    }

    /**
     * Save metadata changes
     */
    function saveMetadataChanges() {
        if (!state.currentEditingPage) {
            showError('No page selected for editing');
            return;
        }
        
        // Get form values
        const titleField = document.getElementById('edit-title');
        const authorField = document.getElementById('edit-author');
        const publisherField = document.getElementById('edit-publisher');
        const publishDateField = document.getElementById('edit-publish-date');
        const descriptionField = document.getElementById('edit-description');
        
        // Update the page metadata
        if (!state.currentEditingPage.metadata) {
            state.currentEditingPage.metadata = {};
        }
        
        const metadata = state.currentEditingPage.metadata;
        
        // Update metadata fields
        if (titleField) metadata.title = titleField.value.trim();
        if (authorField) metadata.author = authorField.value.trim();
        if (publisherField) metadata.publisher = publisherField.value.trim();
        if (publishDateField) metadata.publishDate = publishDateField.value.trim();
        if (descriptionField) metadata.description = descriptionField.value.trim();
        
        // Update URL in metadata (this is read-only but keep it consistent)
        metadata.url = state.currentEditingPage.url;
        
        // Close the modal
        closeEditModal();
        
        // Refresh the details panel if it's showing this page
        if (state.detailsOpen) {
            // Check if the details panel is showing the page we just edited
            const detailsTitle = elements.detailsContent.querySelector('.details-title');
            if (detailsTitle && state.currentEditingPage.url) {
                // Refresh the details view
                showNodeDetails({
                    type: 'page',
                    url: state.currentEditingPage.url,
                    title: state.currentEditingPage.title,
                    timestamp: state.currentEditingPage.timestamp,
                    metadata: state.currentEditingPage.metadata,
                    notes: state.currentEditingPage.notes
                });
            }
        }
        
        // Refresh the timeline view to show updated metadata
        if (state.data && state.data.timeline) {
            timelineView.update(state.data.timeline);
            timelineView.updateExpandedSearches(state.expandedSearches);
        }
    }

    /**
     * Show the add teacher note modal for a page
     * @param {string} pageUrl - URL of the page to add note to
     */
    function showAddNoteModal(pageUrl) {
        // Store the page URL for the note
        state.currentEditingPage = { url: pageUrl };
        
        // Clear the textarea
        const noteContentField = document.getElementById('note-content');
        if (noteContentField) {
            noteContentField.value = '';
        }
        
        // Show the modal
        elements.addNoteModal.classList.add('active');
    }

    /**
     * Close the add note modal
     */
    function closeAddNoteModal() {
        elements.addNoteModal.classList.remove('active');
        state.currentEditingPage = null;
    }

    /**
     * Save teacher note
     */
    function saveTeacherNote() {
        if (!state.currentEditingPage || !state.currentEditingPage.url) {
            showError('No page selected for note');
            return;
        }
        
        const noteContentField = document.getElementById('note-content');
        if (!noteContentField) {
            showError('Note content field not found');
            return;
        }
        
        const noteContent = noteContentField.value.trim();
        if (!noteContent) {
            showError('Please enter a note');
            return;
        }
        
        const pageUrl = state.currentEditingPage.url;
        
        // Get or create teacher notes array for this page
        if (!state.teacherNotes.has(pageUrl)) {
            state.teacherNotes.set(pageUrl, []);
        }
        
        const teacherNotes = state.teacherNotes.get(pageUrl);
        
        // Add the new note with timestamp
        teacherNotes.push({
            content: noteContent,
            timestamp: new Date().toISOString()
        });
        
        // Close the modal
        closeAddNoteModal();
        
        // Refresh the details panel if it's showing this page
        if (state.detailsOpen) {
            const pageData = state.data.timeline.find(event => 
                event.type === 'pageVisit' && event.url === pageUrl
            );
            
            if (pageData) {
                showNodeDetails({
                    type: 'page',
                    url: pageData.url,
                    title: pageData.title,
                    timestamp: pageData.timestamp,
                    metadata: pageData.metadata,
                    notes: pageData.notes
                });
            }
        }
    }

    /**
     * Export all teacher notes as TXT
     */
    function exportNotes() {
        if (state.teacherNotes.size === 0) {
            showError('No teacher notes to export');
            return;
        }
        
        // Create text content
        let textContent = '';
        textContent += `TEACHER NOTES EXPORT\n`;
        textContent += `=====================\n\n`;
        textContent += `Session: ${state.data.raw.name || 'Research Session'}\n`;
        textContent += `Session ID: ${state.data.raw.id}\n`;
        textContent += `Session Start: ${formatDate(state.data.raw.startTime)}\n`;
        textContent += `Session End: ${formatDate(state.data.raw.endTime)}\n`;
        textContent += `Export Date: ${formatDate(new Date().toISOString())}\n`;
        textContent += `\n${'='.repeat(60)}\n\n`;
        
        // Add notes for each page
        for (const [pageUrl, notes] of state.teacherNotes) {
            // Find the page data to include title and metadata
            const pageData = state.data.timeline.find(event => 
                event.type === 'pageVisit' && event.url === pageUrl
            );
            
            const pageTitle = pageData ? (pageData.metadata?.title || pageData.title) : 'Unknown Page';
            
            textContent += `PAGE: ${pageTitle}\n`;
            textContent += `URL: ${pageUrl}\n`;
            textContent += `${'-'.repeat(40)}\n`;
            
            notes.forEach((note, index) => {
                textContent += `Note ${index + 1} (${formatDate(note.timestamp)}):\n`;
                textContent += `${note.content}\n\n`;
            });
            
            textContent += `${'='.repeat(60)}\n\n`;
        }
        
        // Create and download the file
        const dataBlob = new Blob([textContent], { type: 'text/plain' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `teacher-notes-${state.data.raw.id || 'session'}-${new Date().toISOString().split('T')[0]}.txt`;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the object URL
        URL.revokeObjectURL(link.href);
    }

    /**
     * Remove a content page from the timeline
     * @param {string} pageUrl - URL of the page to remove
     */
    function removeContentPage(pageUrl) {
        if (!pageUrl || !state.data || !state.data.timeline) {
            return;
        }
        
        // Find and remove the page from timeline data
        const pageIndex = state.data.timeline.findIndex(event => 
            event.type === 'pageVisit' && event.url === pageUrl
        );
        
        if (pageIndex !== -1) {
            // Remove from timeline data
            state.data.timeline.splice(pageIndex, 1);
            
            // Also remove from chronological events if it exists there
            if (state.data.raw && state.data.raw.chronologicalEvents) {
                const chronoIndex = state.data.raw.chronologicalEvents.findIndex(event => 
                    event.type === 'pageVisit' && event.url === pageUrl
                );
                if (chronoIndex !== -1) {
                    state.data.raw.chronologicalEvents.splice(chronoIndex, 1);
                }
            }
            
            // Also remove from contentPages array if it exists
            if (state.data.raw && state.data.raw.contentPages) {
                const contentIndex = state.data.raw.contentPages.findIndex(page => 
                    page.url === pageUrl
                );
                if (contentIndex !== -1) {
                    state.data.raw.contentPages.splice(contentIndex, 1);
                }
            }
            
            // Remove any teacher notes for this page
            if (state.teacherNotes.has(pageUrl)) {
                state.teacherNotes.delete(pageUrl);
            }
            
            // Close details panel if it's showing the removed page
            if (state.detailsOpen) {
                const detailsTitle = elements.detailsContent.querySelector('.details-title');
                if (detailsTitle) {
                    closeDetails();
                }
            }
            
            // Update the timeline view
            timelineView.update(state.data.timeline);
            timelineView.updateExpandedSearches(state.expandedSearches);
            
            // Update content pages with sections if document is loaded
            if (state.docLoaded) {
                setTimeout(() => {
                    updateContentPagesWithSections();
                }, 100);
            }
        }
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

    // Expose functions globally for access from other components
    window.showAddNoteModal = showAddNoteModal;

    // Start the application
    init();
});