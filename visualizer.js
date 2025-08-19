let sessionData = null;
let viewMode = 'teacher'; // Always teacher view
let commentData = {};
let removedPages = new Set();
let removedSearches = new Set(); // Store removed searches
let lastAction = null; // For undo functionality
let editedMetadata = {}; // Store edited metadata
let unlinkedCards = new Set(); // Store unlinked card-page combinations (format: "cardIndex-pageUrl")
let unlinkedFromAllCards = new Set(); // Store cards that are unlinked from all pages (format: "cardIndex")
let importedCardMatchingHistory = null; // Store card matching history from imported JSON

// Sample data for demonstration
const sampleData = {
    "id": "demo-session-001",
    "name": "Sample Research Session",
    "startTime": "2025-05-26T14:00:00.000Z",
    "endTime": "2025-05-26T16:30:00.000Z",
    "searches": [
        {
            "type": "search",
            "engine": "GOOGLE",
            "domain": "google.com",
            "query": "climate change policy initiatives",
            "url": "https://www.google.com/search?q=climate+change+policy+initiatives",
            "timestamp": "2025-05-26T14:00:30.000Z",
            "tabId": 12345
        },
        {
            "type": "search",
            "engine": "GOOGLE_SCHOLAR",
            "domain": "scholar.google.com",
            "query": "renewable energy peer review studies",
            "url": "https://scholar.google.com/scholar?q=renewable+energy+peer+review+studies",
            "timestamp": "2025-05-26T14:15:00.000Z",
            "tabId": 12346
        },
        {
            "type": "search",
            "engine": "GOOGLE",
            "domain": "google.com",
            "query": "IPCC report 2025 summary",
            "url": "https://www.google.com/search?q=IPCC+report+2025+summary",
            "timestamp": "2025-05-26T14:30:00.000Z",
            "tabId": 12347
        },
        {
            "type": "search",
            "engine": "GOOGLE",
            "domain": "google.com",
            "query": "economic impact climate change developing nations",
            "url": "https://www.google.com/search?q=economic+impact+climate+change+developing+nations",
            "timestamp": "2025-05-26T15:00:00.000Z",
            "tabId": 12348
        }
    ],
    "contentPages": [
        // Government sources
        {
            "type": "pageVisit",
            "url": "https://www.epa.gov/climate-change/climate-change-impacts",
            "title": "Climate Change Impacts | US EPA",
            "timestamp": "2025-05-26T14:02:00.000Z",
            "sourceSearch": {
                "engine": "GOOGLE",
                "query": "climate change policy initiatives"
            },
            "metadata": {
                "title": "Climate Change Impacts by Sector",
                "publisher": "Environmental Protection Agency",
                "publishDate": "2025-04-15",
                "contentType": "report"
            }
        },
        {
            "type": "pageVisit",
            "url": "https://www.noaa.gov/climate/2025-state-of-climate",
            "title": "2025 State of the Climate Report | NOAA",
            "timestamp": "2025-05-26T14:04:00.000Z",
            "sourceSearch": {
                "engine": "GOOGLE",
                "query": "climate change policy initiatives"
            },
            "metadata": {
                "title": "2025 State of the Climate",
                "publisher": "National Oceanic and Atmospheric Administration",
                "publishDate": "2025-05-01"
            }
        },
        
        // Journal articles
        {
            "type": "pageVisit",
            "url": "https://www.nature.com/articles/s41558-025-01234-5",
            "title": "Accelerating renewable energy transition in developing economies",
            "timestamp": "2025-05-26T14:18:00.000Z",
            "sourceSearch": {
                "engine": "GOOGLE_SCHOLAR",
                "query": "renewable energy peer review studies"
            },
            "metadata": {
                "title": "Accelerating renewable energy transition in developing economies",
                "authors": ["Chen, L.", "Smith, J.", "Kumar, P."],
                "journal": "Nature Climate Change",
                "publishDate": "2025-03-12",
                "doi": "10.1038/s41558-025-01234-5",
                "contentType": "journal-article"
            }
        },
        {
            "type": "pageVisit",
            "url": "https://www.sciencedirect.com/science/article/pii/S0360544225001234",
            "title": "Grid integration challenges for renewable energy systems",
            "timestamp": "2025-05-26T14:20:00.000Z",
            "sourceSearch": {
                "engine": "GOOGLE_SCHOLAR",
                "query": "renewable energy peer review studies"
            },
            "metadata": {
                "title": "Grid integration challenges for renewable energy systems: A comprehensive review",
                "authors": ["Johnson, M.", "Williams, K.", "Zhang, W."],
                "journal": "Energy",
                "publishDate": "2025-04-01",
                "doi": "10.1016/j.energy.2025.01234",
                "pmid": "38234567",
                "contentType": "journal-article"
            }
        },
        
        // Preprints
        {
            "type": "pageVisit",
            "url": "https://arxiv.org/abs/2505.12345",
            "title": "Machine Learning Applications in Climate Modeling",
            "timestamp": "2025-05-26T14:22:00.000Z",
            "sourceSearch": {
                "engine": "GOOGLE_SCHOLAR",
                "query": "renewable energy peer review studies"
            },
            "metadata": {
                "title": "Machine Learning Applications in Climate Modeling: A Systematic Approach",
                "authors": ["Patel, R.", "Thompson, A."],
                "publishDate": "2025-05-10",
                "arxivId": "2505.12345",
                "contentType": "preprint"
            }
        },
        {
            "type": "pageVisit",
            "url": "https://papers.ssrn.com/sol3/papers.cfm?abstract_id=4567890",
            "title": "Economic Policy Responses to Climate Change",
            "timestamp": "2025-05-26T15:05:00.000Z",
            "sourceSearch": {
                "engine": "GOOGLE",
                "query": "economic impact climate change developing nations"
            },
            "metadata": {
                "title": "Economic Policy Responses to Climate Change in Emerging Markets",
                "author": "Martinez, C.",
                "publishDate": "2025-05-20",
                "doi": "10.2139/ssrn.4567890",
                "contentType": "preprint"
            }
        },
        
        // Think tanks
        {
            "type": "pageVisit",
            "url": "https://www.brookings.edu/articles/climate-policy-2025-outlook/",
            "title": "Climate Policy in 2025: Global Outlook | Brookings",
            "timestamp": "2025-05-26T14:06:00.000Z",
            "sourceSearch": {
                "engine": "GOOGLE",
                "query": "climate change policy initiatives"
            },
            "metadata": {
                "title": "Climate Policy in 2025: A Global Outlook",
                "author": "Sarah Johnson",
                "publisher": "Brookings Institution",
                "publishDate": "2025-05-05"
            }
        },
        {
            "type": "pageVisit",
            "url": "https://www.rand.org/pubs/research_reports/RRA2025-1.html",
            "title": "National Security Implications of Climate Change",
            "timestamp": "2025-05-26T14:08:00.000Z",
            "sourceSearch": {
                "engine": "GOOGLE",
                "query": "climate change policy initiatives"
            },
            "metadata": {
                "title": "National Security Implications of Climate Change: A 2025 Assessment",
                "authors": ["Davis, M.", "Roberts, J."],
                "publisher": "RAND Corporation",
                "publishDate": "2025-04-20",
                "contentType": "report"
            }
        },
        
        // News organizations
        {
            "type": "pageVisit",
            "url": "https://www.nytimes.com/2025/05/15/climate/renewable-energy-milestone.html",
            "title": "U.S. Reaches Historic Renewable Energy Milestone",
            "timestamp": "2025-05-26T14:10:00.000Z",
            "sourceSearch": {
                "engine": "GOOGLE",
                "query": "climate change policy initiatives"
            },
            "metadata": {
                "title": "U.S. Reaches Historic Renewable Energy Milestone",
                "author": "Lisa Chen",
                "publisher": "The New York Times",
                "publishDate": "2025-05-15"
            }
        },
        {
            "type": "pageVisit",
            "url": "https://www.bbc.com/news/science-environment-67890123",
            "title": "Climate summit agrees on new emissions targets",
            "timestamp": "2025-05-26T14:32:00.000Z",
            "sourceSearch": {
                "engine": "GOOGLE",
                "query": "IPCC report 2025 summary"
            },
            "metadata": {
                "title": "Climate summit agrees on new emissions targets",
                "publisher": "BBC News",
                "publishDate": "2025-05-22"
            }
        },
        
        // Science media
        {
            "type": "pageVisit",
            "url": "https://www.scientificamerican.com/article/climate-tipping-points-2025/",
            "title": "Climate Tipping Points: What We Know in 2025",
            "timestamp": "2025-05-26T14:35:00.000Z",
            "sourceSearch": {
                "engine": "GOOGLE",
                "query": "IPCC report 2025 summary"
            },
            "metadata": {
                "title": "Climate Tipping Points: What We Know in 2025",
                "author": "Michael Brown",
                "publisher": "Scientific American",
                "publishDate": "2025-05-18"
            }
        },
        
        // Database
        {
            "type": "pageVisit",
            "url": "https://www.jstor.org/stable/10.2307/48678901",
            "title": "Historical Climate Data Analysis 1850-2025",
            "timestamp": "2025-05-26T14:25:00.000Z",
            "sourceSearch": {
                "engine": "GOOGLE_SCHOLAR",
                "query": "renewable energy peer review studies"
            },
            "metadata": {
                "title": "Historical Climate Data Analysis 1850-2025",
                "authors": ["Wilson, R.", "Garcia, M."],
                "journal": "Journal of Climate History",
                "publishDate": "2025-02-15",
                "jstorId": "48678901"
            }
        },
        
        // University
        {
            "type": "pageVisit",
            "url": "https://climate.mit.edu/research/renewable-energy-storage",
            "title": "Renewable Energy Storage Solutions | MIT Climate",
            "timestamp": "2025-05-26T14:28:00.000Z",
            "sourceSearch": {
                "engine": "GOOGLE_SCHOLAR",
                "query": "renewable energy peer review studies"
            },
            "metadata": {
                "title": "Advances in Renewable Energy Storage Solutions",
                "publisher": "MIT Climate Portal",
                "publishDate": "2025-04-30"
            }
        },
        
        // Encyclopedia
        {
            "type": "pageVisit",
            "url": "https://www.britannica.com/science/climate-change-2025-update",
            "title": "Climate Change | Britannica",
            "timestamp": "2025-05-26T14:38:00.000Z",
            "sourceSearch": {
                "engine": "GOOGLE",
                "query": "IPCC report 2025 summary"
            },
            "metadata": {
                "title": "Climate Change - 2025 Update",
                "publisher": "Encyclopedia Britannica",
                "publishDate": "2025-05-01"
            }
        },
        
        // Wikipedia
        {
            "type": "pageVisit",
            "url": "https://en.wikipedia.org/wiki/Paris_Agreement",
            "title": "Paris Agreement - Wikipedia",
            "timestamp": "2025-05-26T14:40:00.000Z",
            "sourceSearch": {
                "engine": "GOOGLE",
                "query": "IPCC report 2025 summary"
            },
            "metadata": {
                "title": "Paris Agreement",
                "publisher": "Wikipedia"
            }
        },
        
        // Blog
        {
            "type": "pageVisit",
            "url": "https://medium.com/@climateexpert/future-of-renewable-energy-2025",
            "title": "The Future of Renewable Energy in 2025 and Beyond",
            "timestamp": "2025-05-26T15:10:00.000Z",
            "sourceSearch": {
                "engine": "GOOGLE",
                "query": "economic impact climate change developing nations"
            },
            "metadata": {
                "title": "The Future of Renewable Energy in 2025 and Beyond",
                "author": "Alex Thompson",
                "publisher": "Medium",
                "publishDate": "2025-05-10"
            }
        },
        
        // Social media
        {
            "type": "pageVisit",
            "url": "https://twitter.com/UN/status/1234567890123456789",
            "title": "UN Climate Action on X",
            "timestamp": "2025-05-26T15:15:00.000Z",
            "sourceSearch": {
                "engine": "GOOGLE",
                "query": "economic impact climate change developing nations"
            },
            "metadata": {
                "title": "UN announces new climate fund for developing nations",
                "publisher": "Twitter/X",
                "publishDate": "2025-05-25"
            }
        },
        
        // Direct visits (orphaned pages)
        {
            "type": "pageVisit",
            "url": "https://www.ipcc.ch/report/ar7/wg1/",
            "title": "IPCC Seventh Assessment Report",
            "timestamp": "2025-05-26T15:45:00.000Z",
            "metadata": {
                "title": "Climate Change 2025: The Physical Science Basis",
                "publisher": "Intergovernmental Panel on Climate Change",
                "publishDate": "2025-03-01",
                "contentType": "report"
            }
        },
        {
            "type": "pageVisit",
            "url": "https://www.worldbank.org/en/topic/climatechange/report/2025",
            "title": "Climate Change Action Plan 2025-2030",
            "timestamp": "2025-05-26T16:00:00.000Z",
            "metadata": {
                "title": "Climate Change Action Plan 2025-2030",
                "publisher": "World Bank",
                "publishDate": "2025-04-10",
                "contentType": "report"
            }
        }
    ],
    "chronologicalEvents": []
};

// Initialize the visualizer
document.addEventListener('DOMContentLoaded', function() {
    // Initialize button states
    disableUndoButton();
    disableRestoreButton();
    
    document.getElementById('fileInput').addEventListener('change', function(e) {
        // Update filename display
        const fileName = e.target.files[0]?.name || 'No JSON file chosen';
        document.getElementById('fileInputName').textContent = fileName;
        
        // Handle the file upload
        if (e.target.files[0]) {
            handleFileUpload(e);
        }
    });
    
    document.getElementById('docxInput').addEventListener('change', function(e) {
        // Update filename display
        const fileName = e.target.files[0]?.name || 'No DOCX file chosen';
        document.getElementById('docxInputName').textContent = fileName;
        
        // Reset progress and sections display
        hideDocxProgress();
        document.getElementById('parsedSectionsLink').classList.add('hidden');
        
        // Handle the DOCX file upload
        if (e.target.files[0]) {
            parseDOCXFile(e.target.files[0]);
        }
    });
    
    document.getElementById('loadSample').addEventListener('click', loadSampleData);
    
    // Unload buttons
    document.getElementById('unloadDOCX').addEventListener('click', unloadDOCX);
    document.getElementById('unloadJSON').addEventListener('click', unloadJSON);
    document.getElementById('viewUnmatchedCards').addEventListener('click', showUnmatchedCardsModal);
    
    // Tab switching
    document.querySelectorAll('.tab-button').forEach(function(button) {
        button.addEventListener('click', switchTab);
    });
    
    // Timeline filters
    document.getElementById('showPages').addEventListener('change', updateTimeline);
    document.getElementById('showMetadata').addEventListener('change', updateTimeline);
    document.getElementById('showNotes').addEventListener('change', updateTimeline);
    document.getElementById('showComments').addEventListener('change', updateTimeline);
    
    // Export buttons
    document.getElementById('exportComments').addEventListener('click', exportComments);
    document.getElementById('exportModified').addEventListener('click', exportModifiedData);
    
    // Expand/Collapse buttons
    document.getElementById('expandAll').addEventListener('click', expandAll);
    document.getElementById('collapseAll').addEventListener('click', collapseAll);
    
    // Undo and restore buttons
    document.getElementById('undoBtn').addEventListener('click', performUndo);
    document.getElementById('restorePages').addEventListener('click', restoreAllRemovedPages);
    document.getElementById('rematchCards').addEventListener('click', function() {
        const rematchBtn = event.target;
        showInlineConfirmation(rematchBtn, () => {
            rematchCardsToPages();
        }, false, true); // false = not restore, true = rematch (blue)
    });
    
    // Sidebar toggle
    document.getElementById('sidebarToggle').addEventListener('click', toggleSidebar);
    
    // Font selector buttons
    document.querySelectorAll('.font-btn').forEach(function(button) {
        button.addEventListener('click', function() {
            setFont(this.dataset.font);
        });
    });
    
    // Load saved data from localStorage
    loadSavedComments();
    loadRemovedPages();
    loadRemovedSearches();
    loadEditedMetadata();
    loadSavedFont();
    loadSavedSidebarState();
});

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            sessionData = JSON.parse(e.target.result);
            processSessionData();
        } catch (error) {
            alert('Error parsing JSON file: ' + error.message);
        }
    };
    reader.readAsText(file);
}

function loadSampleData() {
    // Clear file input when loading sample data
    const fileInput = document.getElementById('fileInput');
    fileInput.value = '';
    document.getElementById('fileInputName').textContent = 'No JSON file chosen';
    
    sessionData = sampleData;
    
    // Clear localStorage for sample data to ensure clean reset every time
    if (sessionData.id) {
        localStorage.removeItem(`edited-metadata-${sessionData.id}`);
        localStorage.removeItem(`comments-${sessionData.id}`);
        localStorage.removeItem(`removed-pages-${sessionData.id}`);
        localStorage.removeItem(`removed-searches-${sessionData.id}`);
    }
    
    // Build chronological events from searches and pages
    sessionData.chronologicalEvents = sessionData.searches.concat(sessionData.contentPages).sort(function(a, b) {
        return new Date(a.timestamp) - new Date(b.timestamp);
    });
    
    processSessionData();
}

function processSessionData() {
    if (!sessionData) return;
    
    // Clear previous session data
    removedPages.clear();
    removedSearches.clear();
    commentData = {};
    editedMetadata = {};
    
    // Ensure all existing cards have cardIndex properties for backward compatibility
    if (sessionData.contentPages) {
        sessionData.contentPages.forEach(page => {
            if (page.cards) {
                page.cards.forEach((card, index) => {
                    if (card.cardIndex === undefined) {
                        card.cardIndex = index;
                    }
                });
            }
        });
    }
    
    // Load teacher comments from imported JSON if available
    if (sessionData.teacherComments) {
        commentData = { ...sessionData.teacherComments };
        console.log('Loaded teacher comments from JSON:', Object.keys(commentData).length, 'comments');
    }
    
    // Load card matching history if available
    if (sessionData.cardMatchingHistory) {
        importedCardMatchingHistory = sessionData.cardMatchingHistory;
        const unlinkedCount = importedCardMatchingHistory.unlinkedCards?.length || 0;
        const unlinkedFromAllCount = importedCardMatchingHistory.unlinkedFromAllCards?.length || 0;
        const manualMovesCount = importedCardMatchingHistory.manualCardMoves?.length || 0;
        console.log('Loaded card matching history:', 
            unlinkedCount, 'unlinked cards,',
            unlinkedFromAllCount, 'unlinked from all cards,',
            manualMovesCount, 'manual moves');
    } else {
        importedCardMatchingHistory = null;
    }
    
    // Load saved data for this session (this will override JSON comments if localStorage has newer data)
    loadSavedComments();
    loadRemovedPages();
    loadRemovedSearches();
    loadEditedMetadata();
    
    // Update restore button state based on removed items
    if (removedPages.size === 0 && removedSearches.size === 0) {
        disableRestoreButton();
    } else {
        enableRestoreButton();
    }
    
    // Match cards to pages if DOCX was loaded
    if (parsedCards.length > 0) {
        matchCardsToPages();
    }
    
    // Show visualization sections
    document.getElementById('sessionInfo').classList.remove('hidden');
    document.getElementById('actionsBox').classList.remove('hidden');
    document.getElementById('visualization').classList.remove('hidden');
    
    // Update session info
    updateSessionInfo();
    
    // Update all views
    updateTimeline();
    updateStatistics();
}

function updateSessionInfo() {
    document.getElementById('sessionName').textContent = sessionData.name;
    
    const startTime = new Date(sessionData.startTime);
    const endTime = new Date(sessionData.endTime);
    const duration = Math.round((endTime - startTime) / 1000 / 60); // minutes
    
    document.getElementById('sessionDuration').textContent = `Duration: ${duration} minutes`;
    document.getElementById('searchCount').textContent = `Searches: ${sessionData.searches.length}`;
    document.getElementById('pageCount').textContent = `Pages visited: ${sessionData.contentPages.length}`;
    
    const noteCount = sessionData.searches.reduce((count, search) => count + (search.notes?.length || 0), 0) +
                     sessionData.contentPages.reduce((count, page) => count + (page.notes?.length || 0), 0);
    document.getElementById('noteCount').textContent = `Notes: ${noteCount}`;
}

function updateTimeline() {
    const showPages = document.getElementById('showPages').checked;
    const showMetadata = document.getElementById('showMetadata').checked;
    const showNotes = document.getElementById('showNotes').checked;
    const showComments = document.getElementById('showComments').checked;
    
    const timelineContent = document.getElementById('timelineContent');
    timelineContent.innerHTML = '';
    
    // Update restore button state
    if (removedPages.size === 0 && removedSearches.size === 0) {
        disableRestoreButton();
    } else {
        enableRestoreButton();
    }
    
    // Group searches and their related pages
    const searchGroups = groupSearchesAndPages();
    
    // Create timeline items for each search group
    searchGroups.forEach((group, groupIndex) => {
        const searchContainer = createSearchContainer(group, groupIndex, showPages, showNotes, showComments, showMetadata);
        timelineContent.appendChild(searchContainer);
    });
    
    // Add orphaned pages (pages without a source search, excluding removed and filtered pages)
    // Also handle case where there are no searches at all - all pages should be treated as direct visits
    const orphanedPages = sessionData.contentPages.filter(page => !page.sourceSearch && !shouldFilterPage(page));
    const orphanedPagesFiltered = [];
    orphanedPages.forEach((page, index) => {
        const pageId = `orphan-${index}`;
        if (!removedPages.has(pageId)) {
            orphanedPagesFiltered.push({ page, pageId });
        }
    });
    
    // If there are no searches at all, treat all pages as direct visits
    if ((!sessionData.searches || sessionData.searches.length === 0) && sessionData.contentPages && sessionData.contentPages.length > 0) {
        const allPagesFiltered = [];
        sessionData.contentPages.forEach((page, index) => {
            if (!shouldFilterPage(page)) {
                const pageId = `direct-${index}`;
                if (!removedPages.has(pageId)) {
                    allPagesFiltered.push({ page, pageId });
                }
            }
        });
        
        if (showPages && allPagesFiltered.length > 0) {
            const directContainer = document.createElement('div');
            directContainer.className = 'search-group';
            
            const directHeader = document.createElement('div');
            directHeader.className = 'orphan-header';
            directHeader.innerHTML = '<strong>Direct Page Visits</strong>';
            directContainer.appendChild(directHeader);
            
            allPagesFiltered.forEach(({ page, pageId }) => {
                const pageItem = createPageItem(page, pageId, showNotes, showComments, showMetadata);
                directContainer.appendChild(pageItem);
            });
            
            timelineContent.appendChild(directContainer);
        }
    } else if (showPages && orphanedPagesFiltered.length > 0) {
        // Normal case: show orphaned pages when there are searches
        const orphanContainer = document.createElement('div');
        orphanContainer.className = 'search-group';
        
        const orphanHeader = document.createElement('div');
        orphanHeader.className = 'orphan-header';
        orphanHeader.innerHTML = '<strong>Direct Page Visits</strong>';
        orphanContainer.appendChild(orphanHeader);
        
        orphanedPagesFiltered.forEach(({ page, pageId }) => {
            const pageItem = createPageItem(page, pageId, showNotes, showComments, showMetadata);
            orphanContainer.appendChild(pageItem);
        });
        
        timelineContent.appendChild(orphanContainer);
    }
}

function createTimelineItem(event, index) {
    const item = document.createElement('div');
    item.className = 'timeline-item';
    item.dataset.eventIndex = index;
    
    const eventId = `${event.type}-${index}`;
    const comment = commentData[eventId];
    
    if (comment) {
        item.classList.add('has-comment');
        if (comment.quality === 'excellent') {
            item.classList.add('excellent-source');
        }
    }
    
    const time = document.createElement('div');
    time.className = 'timeline-time';
    time.textContent = formatTime(event.timestamp);
    
    const icon = document.createElement('div');
    icon.className = 'timeline-icon';
    
    const content = document.createElement('div');
    content.className = 'timeline-content';
    
    if (event.type === 'search') {
        item.classList.add('search-event');
        icon.textContent = '🔍';
        
        const titleDiv = document.createElement('div');
        const title = document.createElement('span');
        title.className = 'event-title';
        title.textContent = `Search: "${event.query}"`;
        titleDiv.appendChild(title);
        
        const details = document.createElement('div');
        details.className = 'event-details';
        details.textContent = `${event.engine} - ${event.domain}`;
        
        content.appendChild(titleDiv);
        content.appendChild(details);
        
        if (event.notes && event.notes.length > 0) {
            event.notes.forEach(note => {
                const noteDiv = document.createElement('div');
                noteDiv.className = 'event-note';
                noteDiv.textContent = `Note: ${note.content}`;
                content.appendChild(noteDiv);
            });
        }
    } else if (event.type === 'pageVisit') {
        item.classList.add('page-event');
        icon.textContent = '📄';
        
        const titleDiv = document.createElement('div');
        const title = document.createElement('span');
        title.className = 'event-title';
        // Prefer metadata.title over top-level title as it's usually more accurate
        let pageTitle = (event.metadata && event.metadata.title) || event.title;
        
        // If no title available, show a cleaned-up version of the URL
        if (!pageTitle || pageTitle.trim() === '') {
            const url = new URL(event.url);
            // Remove common prefixes and clean up the path
            pageTitle = url.pathname.split('/').filter(p => p).pop() || url.hostname;
            pageTitle = pageTitle.replace(/[-_]/g, ' ').replace(/\.\w+$/, ''); // Remove file extensions
            pageTitle = pageTitle.charAt(0).toUpperCase() + pageTitle.slice(1); // Capitalize
        }
        
        title.textContent = pageTitle;
        title.title = event.url; // Add URL as tooltip
        titleDiv.appendChild(title);
        
        // Add source type indicator for pages
        if (event.metadata && viewMode === 'teacher') {
            const sourceType = assessSourceType(event);
            const typeBadge = document.createElement('span');
            typeBadge.className = `source-type type-${sourceType}`;
            typeBadge.textContent = getSourceTypeLabel(sourceType);
            titleDiv.appendChild(typeBadge);
        }
        
        const details = document.createElement('div');
        details.className = 'event-details';
        const domain = new URL(event.url).hostname;
        details.textContent = domain;
        
        if (event.sourceSearch) {
            details.textContent += ` (from search: "${event.sourceSearch.query}")`;
        }
        
        content.appendChild(titleDiv);
        content.appendChild(details);
        
        // Add metadata section for pages
        if (event.metadata && Object.keys(event.metadata).length > 0) {
            const metadataSection = document.createElement('div');
            metadataSection.className = 'metadata-section';
            
            if (event.metadata.author) {
                const authorDiv = document.createElement('div');
                authorDiv.className = 'metadata-item';
                authorDiv.innerHTML = `<span class="metadata-label">Author:</span><span class="metadata-value">${event.metadata.author}</span>`;
                metadataSection.appendChild(authorDiv);
            }
            
            if (event.metadata.publishDate) {
                const dateDiv = document.createElement('div');
                dateDiv.className = 'metadata-item';
                dateDiv.innerHTML = `<span class="metadata-label">Published:</span><span class="metadata-value">${event.metadata.publishDate}</span>`;
                metadataSection.appendChild(dateDiv);
            }
            
            if (event.metadata.publisher) {
                const publisherDiv = document.createElement('div');
                publisherDiv.className = 'metadata-item';
                publisherDiv.innerHTML = `<span class="metadata-label">Publisher:</span><span class="metadata-value">${event.metadata.publisher}</span>`;
                metadataSection.appendChild(publisherDiv);
            }
            
            if (event.metadata.journal) {
                const journalDiv = document.createElement('div');
                journalDiv.className = 'metadata-item';
                journalDiv.innerHTML = `<span class="metadata-label">Journal:</span><span class="metadata-value">${event.metadata.journal}</span>`;
                metadataSection.appendChild(journalDiv);
            }
            
            if (event.metadata.doi) {
                const doiDiv = document.createElement('div');
                doiDiv.className = 'metadata-item';
                doiDiv.innerHTML = `<span class="metadata-label">Identifier:</span><span class="metadata-value">${event.metadata.doi}</span>`;
                metadataSection.appendChild(doiDiv);
            }
            
            if (event.metadata.quals) {
                const qualsDiv = document.createElement('div');
                qualsDiv.className = 'metadata-item';
                qualsDiv.innerHTML = `<span class="metadata-label">Quals:</span><span class="metadata-value">${event.metadata.quals}</span>`;
                metadataSection.appendChild(qualsDiv);
            }
            
            content.appendChild(metadataSection);
        }
        
        if (event.notes && event.notes.length > 0) {
            event.notes.forEach(note => {
                const noteDiv = document.createElement('div');
                noteDiv.className = 'event-note';
                noteDiv.textContent = `Note: ${note.content}`;
                content.appendChild(noteDiv);
            });
        }
    } else if (event.type === 'note') {
        item.classList.add('note-event');
        icon.textContent = '📝';
        
        const title = document.createElement('div');
        title.className = 'event-title';
        title.textContent = 'Note';
        
        const noteContent = document.createElement('div');
        noteContent.className = 'event-note';
        noteContent.textContent = event.content;
        
        content.appendChild(title);
        content.appendChild(noteContent);
    }
    
    // Add comment section
    const showComments = document.getElementById('showComments').checked;
    if (showComments && (viewMode === 'teacher' || comment)) {
        if (comment) {
            const commentDiv = createCommentDisplay(comment, eventId);
            content.appendChild(commentDiv);
        }
        
        if (viewMode === 'teacher' && !comment) {
            const addCommentBtn = document.createElement('button');
            addCommentBtn.className = 'add-comment-btn';
            addCommentBtn.textContent = 'Add Comment';
            addCommentBtn.onclick = () => showCommentForm(eventId, event);
            content.appendChild(addCommentBtn);
        }
    }
    
    item.appendChild(time);
    item.appendChild(icon);
    item.appendChild(content);
    
    return item;
}

function formatTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
    });
}


function updateStatistics() {
    const statsContent = document.getElementById('statsContent');
    statsContent.innerHTML = '';
    
    // Session duration
    const durationCard = createStatCard('Session Duration', calculateDuration(), 'minutes');
    statsContent.appendChild(durationCard);
    
    // Total events
    const totalEvents = sessionData.chronologicalEvents.length;
    const eventsCard = createStatCard('Total Events', totalEvents, 'events');
    statsContent.appendChild(eventsCard);
    
    // Average pages per search
    // Group searches by query and engine to deduplicate
    const searchGroups = new Map();
    sessionData.searches.forEach(search => {
        const key = `${search.engine}-${search.query}`;
        if (!searchGroups.has(key)) {
            searchGroups.set(key, true);
        }
    });
    const totalUniqueSearches = searchGroups.size;
    
    // Count only pages associated with searches (exclude direct visits, filtered pages, and removed pages)
    const groups = groupSearchesAndPages();
    let pagesFromSearches = 0;
    
    // Count pages from search groups that aren't filtered or removed
    groups.forEach((group, groupIndex) => {
        group.pages.forEach((page, pageIndex) => {
            const pageId = `page-${groupIndex}-${pageIndex}`;
            if (!removedPages.has(pageId)) {
                pagesFromSearches++;
            }
        });
    });
    
    const avgPages = totalUniqueSearches > 0 ? (pagesFromSearches / totalUniqueSearches).toFixed(1) : 0;
    const avgPagesCard = createStatCard('Average Pages per Search', avgPages, 'pages');
    statsContent.appendChild(avgPagesCard);
    
    // Search engines used
    const searchEngines = {};
    sessionData.searches.forEach(search => {
        searchEngines[search.engine] = (searchEngines[search.engine] || 0) + 1;
    });
    
    const enginesCard = document.createElement('div');
    enginesCard.className = 'stat-card';
    enginesCard.innerHTML = '<h3>Search Engines Used</h3>';
    const enginesList = document.createElement('ul');
    enginesList.className = 'search-engine-list';
    
    Object.entries(searchEngines).forEach(([engine, count]) => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${engine}</span><span>${count}</span>`;
        enginesList.appendChild(li);
    });
    
    enginesCard.appendChild(enginesList);
    statsContent.appendChild(enginesCard);
    
    // Top domains visited
    const domains = {};
    sessionData.contentPages.forEach(page => {
        const domain = new URL(page.url).hostname;
        domains[domain] = (domains[domain] || 0) + 1;
    });
    
    const sortedDomains = Object.entries(domains)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
    
    const domainsCard = document.createElement('div');
    domainsCard.className = 'stat-card';
    domainsCard.innerHTML = '<h3>Top Domains Visited</h3>';
    const domainsList = document.createElement('ul');
    domainsList.className = 'domain-list';
    
    sortedDomains.forEach(([domain, count]) => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${domain}</span><span>${count}</span>`;
        domainsList.appendChild(li);
    });
    
    domainsCard.appendChild(domainsList);
    statsContent.appendChild(domainsCard);
    
    // Source types pie chart
    const sourceTypesCard = createSourceTypesChart();
    statsContent.appendChild(sourceTypesCard);
}

function createStatCard(label, value, unit) {
    const card = document.createElement('div');
    card.className = 'stat-card';
    card.innerHTML = `
        <h3>${label}</h3>
        <div class="stat-value">${value}</div>
        <div class="stat-label">${unit}</div>
    `;
    return card;
}

function calculateDuration() {
    const startTime = new Date(sessionData.startTime);
    const endTime = new Date(sessionData.endTime);
    return Math.round((endTime - startTime) / 1000 / 60);
}

function createSourceTypesChart() {
    // Count source types
    var sourceTypes = {};
    sessionData.contentPages.forEach(function(page) {
        if (!shouldFilterPage(page)) {
            var sourceType = assessSourceType(page);
            var label = getSourceTypeLabel(sourceType);
            sourceTypes[label] = (sourceTypes[label] || 0) + 1;
        }
    });
    
    // Create card
    var card = document.createElement('div');
    card.className = 'stat-card source-types-card';
    card.innerHTML = '<h3>Source Types</h3>';
    
    if (Object.keys(sourceTypes).length === 0) {
        card.innerHTML += '<p class="no-data">No source data available</p>';
        return card;
    }
    
    // Create pie chart container
    var chartContainer = document.createElement('div');
    chartContainer.className = 'pie-chart-container';
    
    var pieChart = document.createElement('div');
    pieChart.className = 'pie-chart';
    
    var legend = document.createElement('div');
    legend.className = 'chart-legend';
    
    // Calculate total and create pie chart using conic-gradient
    var total = Object.keys(sourceTypes).reduce(function(sum, key) {
        return sum + sourceTypes[key];
    }, 0);
    
    // Vivid colors for different source types
    var colors = [
        '#27ae60', '#3498db', '#e74c3c', '#f39c12', '#9b59b6',
        '#1abc9c', '#e67e22', '#2ecc71', '#34495e', '#f1c40f',
        '#e91e63', '#ff5722', '#607d8b', '#795548'
    ];
    
    // Create conic-gradient string
    var gradientParts = [];
    var currentAngle = 0;
    var index = 0;
    
    Object.keys(sourceTypes).forEach(function(type) {
        var count = sourceTypes[type];
        var percentage = (count / total) * 100;
        var angle = (count / total) * 360;
        var color = colors[index % colors.length];
        
        gradientParts.push(color + ' ' + currentAngle + 'deg ' + (currentAngle + angle) + 'deg');
        
        // Create legend item
        var legendItem = document.createElement('div');
        legendItem.className = 'legend-item';
        legendItem.innerHTML = '<div class="legend-color" style="background-color: ' + color + '"></div>' +
                              '<span class="legend-label">' + type + '</span>' +
                              '<span class="legend-value">' + count + ' (' + percentage.toFixed(1) + '%)</span>';
        legend.appendChild(legendItem);
        
        currentAngle += angle;
        index++;
    });
    
    // Apply the complete conic-gradient to the pie chart
    pieChart.style.background = 'conic-gradient(' + gradientParts.join(', ') + ')';
    
    // Add tooltip functionality
    var tooltip = document.createElement('div');
    tooltip.className = 'pie-tooltip';
    tooltip.style.display = 'none';
    card.appendChild(tooltip);
    
    // Store slice data for hover detection
    var sliceData = [];
    currentAngle = 0;
    Object.keys(sourceTypes).forEach(function(type) {
        var count = sourceTypes[type];
        var percentage = (count / total) * 100;
        var angle = (count / total) * 360;
        sliceData.push({
            type: type,
            count: count,
            percentage: percentage,
            startAngle: currentAngle,
            endAngle: currentAngle + angle
        });
        currentAngle += angle;
    });
    
    // Add mouse event listeners for tooltip
    pieChart.addEventListener('mousemove', function(e) {
        var rect = pieChart.getBoundingClientRect();
        var centerX = rect.width / 2;
        var centerY = rect.height / 2;
        var x = e.clientX - rect.left - centerX;
        var y = e.clientY - rect.top - centerY;
        
        // Calculate angle from center
        var angle = Math.atan2(y, x) * 180 / Math.PI;
        if (angle < 0) angle += 360;
        // Adjust for CSS conic-gradient starting point (top)
        angle = (angle + 90) % 360;
        
        // Find which slice this angle belongs to
        var hoveredSlice = null;
        for (var i = 0; i < sliceData.length; i++) {
            if (angle >= sliceData[i].startAngle && angle < sliceData[i].endAngle) {
                hoveredSlice = sliceData[i];
                break;
            }
        }
        
        if (hoveredSlice) {
            var pageText = hoveredSlice.count === 1 ? 'page' : 'pages';
            tooltip.innerHTML = '<strong>' + hoveredSlice.type + '</strong><br>' +
                               hoveredSlice.count + ' ' + pageText + ' (' + hoveredSlice.percentage.toFixed(1) + '%)';
            tooltip.style.display = 'block';
            tooltip.style.left = (e.pageX - 100) + 'px';
            tooltip.style.top = (e.pageY - 50) + 'px';
        }
    });
    
    pieChart.addEventListener('mouseleave', function() {
        tooltip.style.display = 'none';
    });
    
    chartContainer.appendChild(pieChart);
    chartContainer.appendChild(legend);
    card.appendChild(chartContainer);
    
    return card;
}

function switchTab(event) {
    const targetTab = event.target.getAttribute('data-tab');
    
    // Update button states
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Update content visibility
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(targetTab).classList.add('active');
}

// Text utility functions
function isTextContent(content) {
    if (!content || typeof content !== 'string') {
        return false;
    }
    
    // Check if content looks like image data
    if (content.startsWith('data:image/') || content.startsWith('data:video/') || 
        content.startsWith('data:audio/') || content.startsWith('data:application/pdf')) {
        return false;
    }
    
    // Check if content is mostly binary data (has many non-printable characters)
    const printableRegex = /[\x20-\x7E\s]/;
    const printableChars = content.split('').filter(char => printableRegex.test(char)).length;
    const printableRatio = printableChars / content.length;
    
    return printableRatio > 0.8; // At least 80% printable characters
}

function truncateText(text, maxLength = 150) {
    if (!text || typeof text !== 'string') {
        return '';
    }
    
    // Only show text content
    if (!isTextContent(text)) {
        return '[Non-text content]';
    }
    
    if (text.length <= maxLength) {
        return text;
    }
    
    // Try to truncate at word boundary
    const truncated = text.substring(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    
    if (lastSpace > maxLength * 0.8) {
        return truncated.substring(0, lastSpace) + '...';
    }
    
    return truncated + '...';
}

function createExpandableText(text, maxLength = 150) {
    if (!text || typeof text !== 'string') {
        return document.createTextNode('');
    }
    
    if (!isTextContent(text)) {
        const span = document.createElement('span');
        span.textContent = '[Non-text content]';
        span.className = 'non-text-content';
        return span;
    }
    
    if (text.length <= maxLength) {
        return document.createTextNode(text);
    }
    
    const container = document.createElement('span');
    container.className = 'expandable-text';
    
    const truncated = truncateText(text, maxLength);
    const truncatedSpan = document.createElement('span');
    truncatedSpan.textContent = truncated;
    
    const expandBtn = document.createElement('button');
    expandBtn.className = 'expand-text-btn';
    expandBtn.textContent = 'Show more';
    expandBtn.onclick = function() {
        if (truncatedSpan.textContent === truncated) {
            truncatedSpan.textContent = text;
            expandBtn.textContent = 'Show less';
        } else {
            truncatedSpan.textContent = truncated;
            expandBtn.textContent = 'Show more';
        }
    };
    
    container.appendChild(truncatedSpan);
    container.appendChild(document.createTextNode(' '));
    container.appendChild(expandBtn);
    
    return container;
}

// Content type mapping function for DOI API consolidation
function mapContentType(apiType) {
    const mapping = {
        // CrossRef API types
        'journal-article': 'journal-article',
        'book-chapter': 'book-chapter',
        'book': 'book',
        'monograph': 'monograph',
        'report': 'report',
        'thesis': 'thesis',
        'conference-paper': 'conference-paper',
        'proceedings-article': 'proceedings-article',
        'dataset': 'dataset',
        'reference-entry': 'reference-entry',
        'posted-content': 'preprint',
        'dissertation': 'dissertation',
        
        // CSL JSON types
        'article-journal': 'journal-article',
        'article-magazine': 'article-magazine',
        'article-newspaper': 'article-newspaper',
        'chapter': 'book-chapter',
        'paper-conference': 'conference-paper',
        'webpage': 'webpage',
        'post-weblog': 'webpage',
        'post': 'webpage',
        'manuscript': 'preprint',
        'interview': 'interview',
        'personal_communication': 'personal-communication',
        'speech': 'speech',
        'treaty': 'treaty',
        'legal_case': 'legal-case',
        'legislation': 'legislation',
        'law-review': 'law-review',
        'entry-dictionary': 'book-chapter',
        'entry-encyclopedia': 'book-chapter',
        
        // Legacy mappings for backwards compatibility
        'news-article': 'article-newspaper',
        'encyclopedia-article': 'book-chapter',
        'social-media-post': 'webpage',
        'website': 'webpage',
        'other': 'webpage'
    };
    
    return mapping[apiType] || 'webpage';
}

// Comment functions
function assessSourceType(page) {
    const url = page.url.toLowerCase();
    let domain = new URL(page.url).hostname.toLowerCase();
    const metadata = page.metadata || {};
    
    // Helper function to check if domain matches (including proxy versions)
    const domainMatches = (checkDomain, pattern) => {
        // Check original domain
        if (checkDomain.includes(pattern)) return true;
        
        // Normalize both domain and pattern by removing punctuation
        const normalizedDomain = checkDomain.replace(/[-_.]/g, '');
        const normalizedPattern = pattern.replace(/[-_.]/g, '');
        
        // Check if normalized domain contains normalized pattern
        return normalizedDomain.includes(normalizedPattern);
    };
    
    // Check content type from metadata first - use mapped content type directly
    if (metadata.contentType) {
        const mappedType = mapContentType(metadata.contentType);
        return mappedType;
    }
    
    // Check for specific academic identifiers
    if (metadata.arxivId || domainMatches(domain, 'arxiv.org')) return 'preprint';
    if (metadata.doi && domainMatches(domain, 'ssrn.com')) return 'preprint';
    
    // Legal databases - default to law review for Lexis
    if (domainMatches(domain, 'lexis.com') || domainMatches(domain, 'lexisnexis.com') || 
        domainMatches(domain, 'advance.lexis.com')) {
        return 'law-review';
    }
    
    // Government sources - map to report since they typically publish reports
    const normalizedDomain = domain.replace(/-/g, '.');
    if (domain.endsWith('.gov') || normalizedDomain.endsWith('.gov')) {
        return 'report';
    }
    
    // Academic journals and publishers
    if (metadata.doi || metadata.pmid || metadata.jstorId ||
        domainMatches(domain, 'nature.com') || domainMatches(domain, 'sciencedirect.com') ||
        domainMatches(domain, 'springer.com') || domainMatches(domain, 'wiley.com') ||
        domainMatches(domain, 'elsevier.com') || domainMatches(domain, 'sagepub.com') ||
        domainMatches(domain, 'tandfonline.com') || domainMatches(domain, 'cambridge.org') ||
        domainMatches(domain, 'oxford.ac') || domainMatches(domain, 'oup.com') ||
        domainMatches(domain, 'dukeupress.edu') || domainMatches(domain, 'doi.org')) {
        return 'journal-article';
    }
    
    // Research databases - treat as reference entries
    if (domainMatches(domain, 'jstor.org') || domainMatches(domain, 'pubmed') ||
        domainMatches(domain, 'ncbi.nlm.nih.gov') || domainMatches(domain, 'scholar.google')) {
        return 'reference-entry';
    }
    
    // Think tanks and research organizations - typically publish reports
    if (domainMatches(domain, 'brookings.edu') || domainMatches(domain, 'rand.org') ||
        domainMatches(domain, 'pewresearch.org') || domainMatches(domain, 'cato.org') ||
        domainMatches(domain, 'heritage.org') || domainMatches(domain, 'urban.org') ||
        domainMatches(domain, 'bakerinstitute.org') || domainMatches(domain, 'carnegieendowment.org') ||
        domainMatches(domain, 'americanprogress.org') || domainMatches(domain, 'atlanticcouncil.org') ||
        domainMatches(domain, 'hudson.org') || domainMatches(domain, 'cnas.org') ||
        domainMatches(domain, 'taxpolicycenter.org') || domainMatches(domain, 'rff.org') || 
        domainMatches(domain, 'resources.org') || domainMatches(domain, 'hoover.org') ||
        domainMatches(domain, 'fpri.org') || domainMatches(domain, 'reason.org') ||
        domainMatches(domain, 'cbpp.org') || domainMatches(domain, 'mercatus.org') ||
        domainMatches(domain, 'epi.org') || domainMatches(domain, 'milkeninstitute.org') ||
        domainMatches(domain, 'thirdway.org') || domainMatches(domain, 'cei.org') ||
        domainMatches(domain, 'rstreet.org') || domainMatches(domain, 'aspeninstitute.org') ||
        domainMatches(domain, 'nber.org')) {
        return 'report';
    }
    
    // News organizations
    if (domain.includes('nytimes.com') || domain.includes('washingtonpost.com') ||
        domain.includes('bbc.com') || domain.includes('reuters.com') ||
        domain.includes('apnews.com') || domain.includes('npr.org') ||
        domain.includes('theguardian.com') || domain.includes('wsj.com') || 
        domain.includes('bloomberg.com') || domain.includes('cnn.com') || 
        domain.includes('cnbc.com') || domain.includes('cbsnews.com') || 
        domain.includes('abcnews.go.com') || domain.includes('nbcnews.com') || 
        domain.includes('latimes.com') || domain.includes('theglobeandmail.com') || 
        domain.includes('nypost.com') || domain.includes('usnews.com') || 
        domain.includes('dw.com') || domain.includes('timesofindia.indiatimes.com') || 
        domain.includes('indianexpress.com') || domain.includes('hindustantimes.com') || 
        domain.includes('thehill.com') || domain.includes('thedailybeast.com') || 
        domain.includes('newsweek.com') || domain.includes('bangkokpost.com') || 
        domain.includes('japantimes.co.jp') || domain.includes('economist.com') || 
        domain.includes('ft.com') || domain.includes('nationalreview.com') || 
        domain.includes('vox.com')) {
        return 'article-newspaper';
    }
    
    // Science media
    if (domain.includes('scientificamerican.com') || domain.includes('sciencenews.org') ||
        domain.includes('phys.org') || domain.includes('sciencedaily.com')) {
        return 'article-magazine';
    }
    
    // Encyclopedia and reference sources
    if (domain.includes('britannica.com') || domain.includes('stanford.edu/entries')) {
        return 'reference-entry';
    }
    
    // Wikipedia
    if (domain.includes('wikipedia.org')) {
        return 'reference-entry';
    }
    
    // Social media
    if (domain.includes('reddit.com') || domain.includes('twitter.com') || 
        domain.includes('x.com') || domain.includes('facebook.com') || 
        domain.includes('youtube.com') || domain.includes('instagram.com') || 
        domain.includes('tiktok.com')) {
        return 'webpage';
    }
    
    // Blogs
    if (domain.includes('blogspot.com') || domain.includes('wordpress.com') ||
        domain.includes('medium.com') || domain.includes('substack.com')) {
        return 'webpage';
    }
    
    // University (general .edu that aren't journals or think tanks)
    if (domain.endsWith('.edu') || normalizedDomain.endsWith('.edu')) {
        return 'webpage';
    }
    
    // Default
    return 'webpage';
}

function getSourceTypeLabel(type) {
    const labels = {
        'journal-article': 'Journal Article',
        'book-chapter': 'Book Chapter',
        'book': 'Book',
        'monograph': 'Monograph',
        'report': 'Report',
        'thesis': 'Thesis',
        'conference-paper': 'Conference Paper',
        'proceedings-article': 'Proceedings Article',
        'dataset': 'Dataset',
        'reference-entry': 'Reference Entry',
        'preprint': 'Preprint',
        'dissertation': 'Dissertation',
        'article-magazine': 'Magazine Article',
        'article-newspaper': 'Newspaper Article',
        'webpage': 'Webpage',
        'interview': 'Interview',
        'personal-communication': 'Personal Communication',
        'speech': 'Speech',
        'treaty': 'Treaty',
        'legal-case': 'Legal Case',
        'legislation': 'Legislation',
        'law-review': 'Law Review'
    };
    return labels[type] || 'Website';
}

function createCommentDisplay(comment, eventId) {
    const commentDiv = document.createElement('div');
    commentDiv.className = 'teacher-comment';
    
    const header = document.createElement('div');
    header.className = 'comment-header';
    
    const label = document.createElement('div');
    label.className = 'comment-label';
    label.textContent = 'Comment:';
    header.appendChild(label);
    
    if (viewMode === 'teacher') {
        const buttonContainer = document.createElement('div');
        buttonContainer.style.display = 'flex';
        buttonContainer.style.gap = '10px';
        
        const editBtn = document.createElement('button');
        editBtn.className = 'edit-comment-btn';
        editBtn.textContent = 'Edit';
        editBtn.onclick = function() { showCommentForm(eventId, null, comment, this); };
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-comment-btn';
        deleteBtn.textContent = 'Delete';
        deleteBtn.onclick = () => deleteComment(eventId);
        
        buttonContainer.appendChild(editBtn);
        buttonContainer.appendChild(deleteBtn);
        header.appendChild(buttonContainer);
    }
    
    const content = document.createElement('div');
    content.className = 'comment-content';
    
    const commentElement = createExpandableText(comment.content, 150);
    if (commentElement.nodeType === Node.TEXT_NODE) {
        content.textContent = comment.content;
    } else {
        content.appendChild(commentElement);
    }
    
    commentDiv.appendChild(header);
    commentDiv.appendChild(content);
    
    return commentDiv;
}

function showCommentForm(eventId, event, existingComment = null, buttonElement = null) {
    const form = document.createElement('div');
    form.className = 'comment-form';
    form.id = `comment-form-${eventId}`;
    
    const textarea = document.createElement('textarea');
    textarea.className = 'comment-textarea';
    textarea.placeholder = 'Enter your comment here...';
    if (existingComment) {
        textarea.value = existingComment.content;
    }
    
    const actions = document.createElement('div');
    actions.className = 'comment-actions';
    
    const saveBtn = document.createElement('button');
    saveBtn.className = 'save-comment-btn';
    saveBtn.textContent = 'Save Comment';
    saveBtn.onclick = () => saveComment(eventId, textarea.value, event);
    
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'cancel-comment-btn';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.onclick = () => {
        form.remove();
        updateTimeline();
    };
    
    actions.appendChild(saveBtn);
    actions.appendChild(cancelBtn);
    
    form.appendChild(textarea);
    form.appendChild(actions);
    
    // If we have a button element reference, use it directly
    if (buttonElement) {
        if (existingComment) {
            // For edit button, replace the parent comment div
            const commentDiv = buttonElement.closest('.teacher-comment');
            if (commentDiv) {
                commentDiv.replaceWith(form);
            }
        } else {
            // For add button, replace the button itself
            buttonElement.replaceWith(form);
        }
    } else {
        // Fallback to the old method if no button reference provided
        updateTimeline();
    }
}

function saveComment(eventId, content, event) {
    if (!content.trim()) return;
    
    // Save previous state for undo
    const previousComment = commentData[eventId] ? { ...commentData[eventId] } : null;
    
    commentData[eventId] = {
        content: content.trim(),
        timestamp: new Date().toISOString(),
        sourceType: event && event.type === 'pageVisit' ? assessSourceType(event) : null
    };
    
    // Track action for undo
    lastAction = {
        type: 'comment',
        eventId: eventId,
        previousValue: previousComment,
        newValue: { ...commentData[eventId] }
    };
    enableUndoButton();
    
    // Save to localStorage
    localStorage.setItem(`comments-${sessionData.id}`, JSON.stringify(commentData));
    
    // Refresh timeline
    updateTimeline();
}

function loadSavedComments() {
    if (sessionData && sessionData.id) {
        const saved = localStorage.getItem(`comments-${sessionData.id}`);
        if (saved) {
            const savedComments = JSON.parse(saved);
            // Merge saved comments with imported comments, prioritizing localStorage
            commentData = { ...commentData, ...savedComments };
            console.log('Merged localStorage comments with imported comments');
        } else if (Object.keys(commentData).length > 0) {
            console.log('Using imported comments from JSON file');
        }
    }
}

// Helper function to show inline confirmation buttons
function showInlineConfirmation(originalButton, confirmCallback, isRestore = false, isRematch = false) {
    const originalText = originalButton.textContent;
    const originalClass = originalButton.className;
    
    // Get original button dimensions
    const originalRect = originalButton.getBoundingClientRect();
    const originalStyles = window.getComputedStyle(originalButton);
    const originalWidth = originalButton.offsetWidth;
    const originalHeight = originalButton.offsetHeight;
    
    // Create confirmation buttons container
    const confirmContainer = document.createElement('div');
    confirmContainer.className = 'confirm-buttons';
    
    // Create confirm button (checkmark)
    const confirmBtn = document.createElement('button');
    let classModifier = '';
    if (isRestore) classModifier = ' restore';
    else if (isRematch) classModifier = ' rematch';
    confirmBtn.className = `confirm-btn confirm-yes${classModifier}`;
    confirmBtn.textContent = '✓';
    confirmBtn.title = 'Confirm';
    
    // Create cancel button (X)
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'confirm-btn confirm-no';
    cancelBtn.textContent = '×';
    cancelBtn.title = 'Cancel';
    
    // Size the buttons to split the original button's width
    const buttonWidth = Math.floor(originalWidth / 2) - 2; // -2 for gap
    const buttonHeight = originalHeight;
    
    confirmBtn.style.width = `${buttonWidth}px`;
    confirmBtn.style.height = `${buttonHeight}px`;
    confirmBtn.style.minWidth = 'auto';
    
    cancelBtn.style.width = `${buttonWidth}px`;
    cancelBtn.style.height = `${buttonHeight}px`;
    cancelBtn.style.minWidth = 'auto';
    
    // Add event listeners
    confirmBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        confirmCallback();
        // Restore original button after confirmation
        originalButton.textContent = originalText;
        originalButton.className = originalClass;
        originalButton.style.display = 'inline-block';
        confirmContainer.remove();
    });
    
    cancelBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        // Restore original button
        originalButton.textContent = originalText;
        originalButton.className = originalClass;
        originalButton.style.display = 'inline-block';
        confirmContainer.remove();
    });
    
    // Add buttons to container
    confirmContainer.appendChild(confirmBtn);
    confirmContainer.appendChild(cancelBtn);
    
    // Hide original button and insert confirmation buttons
    originalButton.style.display = 'none';
    originalButton.parentNode.insertBefore(confirmContainer, originalButton.nextSibling);
}

function deleteComment(eventId) {
    const deleteBtn = event.target;
    
    showInlineConfirmation(deleteBtn, () => {
        // Save previous state for undo
        const previousComment = commentData[eventId] ? { ...commentData[eventId] } : null;
        
        delete commentData[eventId];
        
        // Track action for undo
        lastAction = {
            type: 'deleteComment',
            eventId: eventId,
            previousValue: previousComment
        };
        enableUndoButton();
        
        // Save to localStorage
        localStorage.setItem(`comments-${sessionData.id}`, JSON.stringify(commentData));
        
        // Refresh timeline
        updateTimeline();
    });
}

// Research summary function removed - no longer needed

function exportComments() {
    if (!sessionData || Object.keys(commentData).length === 0) {
        alert('No comments to export');
        return;
    }
    
    let textContent = `RESEARCH COMMENTS\n`;
    textContent += `Session: ${sessionData.name}\n`;
    textContent += `Student: ${sessionData.studentName || 'Unknown Student'}\n`;
    textContent += `Export Date: ${new Date().toLocaleString()}\n`;
    textContent += `${'='.repeat(60)}\n\n`;
    
    let entryCount = 0;
    
    // Process search groups and their associated pages
    const searchGroups = groupSearchesAndPages();
    searchGroups.forEach((group, groupIndex) => {
        const searchId = `search-group-${groupIndex}`;
        const hasSearchComment = commentData[searchId];
        
        // Check if any pages in this group have comments
        const pagesWithComments = [];
        group.pages.forEach((page, pageIndex) => {
            const pageId = `page-${groupIndex}-${pageIndex}`;
            if (commentData[pageId]) {
                pagesWithComments.push({ page, pageId, pageIndex });
            }
        });
        
        // Only output if there are comments for this search or its pages
        if (hasSearchComment || pagesWithComments.length > 0) {
            entryCount++;
            textContent += `\nSEARCH #${entryCount}\n`;
            textContent += `Query: "${group.query}" on ${group.engine}\n`;
            textContent += `Time: ${new Date(group.firstTimestamp).toLocaleString()}\n`;
            
            if (hasSearchComment) {
                textContent += `\nSEARCH COMMENT:\n${commentData[searchId].content}\n`;
            }
            
            // Add associated pages with comments
            if (pagesWithComments.length > 0) {
                textContent += `\nASSOCIATED PAGES WITH COMMENTS:\n`;
                pagesWithComments.forEach(({ page, pageId }, idx) => {
                    textContent += `\n  Page ${idx + 1}: ${page.title || 'Untitled Page'}\n`;
                    textContent += `  URL: ${page.url}\n`;
                    textContent += `  Time: ${new Date(page.timestamp).toLocaleString()}\n`;
                    textContent += `  COMMENT: ${commentData[pageId].content}\n`;
                });
            }
            
            textContent += `\n${'-'.repeat(60)}\n`;
        }
    });
    
    // Process orphaned pages (pages without a source search)
    const orphanedPages = sessionData.contentPages.filter(page => !page.sourceSearch);
    let hasOrphanedComments = false;
    
    orphanedPages.forEach((page, index) => {
        const orphanId = `page-orphan-${index}`;
        if (commentData[orphanId]) {
            if (!hasOrphanedComments) {
                textContent += `\nDIRECT PAGE VISITS (No Associated Search)\n`;
                textContent += `${'='.repeat(40)}\n`;
                hasOrphanedComments = true;
            }
            
            entryCount++;
            textContent += `\nPAGE #${entryCount}\n`;
            textContent += `Title: ${page.title || 'Untitled Page'}\n`;
            textContent += `URL: ${page.url}\n`;
            textContent += `Time: ${new Date(page.timestamp).toLocaleString()}\n`;
            textContent += `\nCOMMENT:\n${commentData[orphanId].content}\n`;
            textContent += `\n${'-'.repeat(60)}\n`;
        }
    });
    
    if (entryCount === 0) {
        textContent += `\nNo comments found.\n`;
    }
    
    // Create and download the text file
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `comments-${sessionData.name.replace(/[^a-z0-9]/gi, '_')}-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
}

// New functions for hierarchical timeline
function shouldFilterPage(page) {
    const url = page.url.toLowerCase();
    const domain = new URL(page.url).hostname.toLowerCase();
    
    // Filter browser internal pages
    if (url.startsWith('chrome://') || 
        url.startsWith('about:') || 
        url.startsWith('edge://') || 
        url.startsWith('firefox://') ||
        url.startsWith('chrome-extension://') ||
        url.startsWith('moz-extension://')) {
        return true;
    }
    
    // Filter piracy/shadow library sites
    const pirateDomainsPatterns = [
        'sci-hub', 'scihub',
        'annas-archive', 'anna-archive',
        'z-lib', 'zlib', 'zlibrary', 'z-library',
        'libgen', 'library.lol',
        'bookfi', 'bookzz', 'b-ok',
        'pdfdrive', 'pdf-drive'
    ];
    
    if (pirateDomainsPatterns.some(pattern => domain.includes(pattern))) {
        return true;
    }
    
    // Filter download/file sharing sites
    const fileShareDomains = [
        'mediafire.com', 'mega.nz', 'megaupload.com',
        'rapidshare.com', 'uploaded.net', 'depositfiles.com',
        'sendspace.com', '4shared.com', 'wetransfer.com'
    ];
    
    if (fileShareDomains.includes(domain)) {
        return true;
    }
    
    // Filter URL shorteners (often used to hide actual destinations)
    const urlShorteners = [
        'bit.ly', 'tinyurl.com', 'goo.gl', 'ow.ly',
        'is.gd', 'buff.ly', 'short.link', 'shorte.st'
    ];
    
    if (urlShorteners.includes(domain)) {
        return true;
    }
    
    // Filter blank pages and error pages
    if (!page.title || 
        page.title === 'New Tab' || 
        page.title === 'Blank' ||
        page.title.includes('404') ||
        page.title.includes('Error') ||
        page.title.includes('Not Found')) {
        return true;
    }
    
    // Filter login/auth pages
    if (url.includes('/login') || 
        url.includes('/signin') || 
        url.includes('/auth') ||
        url.includes('/oauth') ||
        page.title.toLowerCase().includes('sign in') ||
        page.title.toLowerCase().includes('log in')) {
        return true;
    }
    
    // Filter specific domains
    const excludedDomains = [
        'www.library.dartmouth.edu',
        'library.dartmouth.edu',
        'search.library.dartmouth.edu'
    ];
    
    if (excludedDomains.includes(domain)) {
        return true;
    }
    
    return false;
}

function groupSearchesAndPages() {
    const groups = [];
    const searchMap = new Map();
    
    // Group searches by query and engine (excluding removed searches)
    sessionData.searches.forEach((search, index) => {
        const key = `${search.engine}-${search.query}`;
        
        // Skip if this search group was removed
        if (removedSearches.has(key)) return;
        
        if (!searchMap.has(key)) {
            searchMap.set(key, {
                searches: [],
                pages: [],
                firstTimestamp: search.timestamp,
                query: search.query,
                engine: search.engine,
                domain: search.domain
            });
        }
        const group = searchMap.get(key);
        group.searches.push({ ...search, originalIndex: index });
    });
    
    // Add pages to their corresponding search groups (excluding removed and filtered pages)
    sessionData.contentPages.forEach((page, index) => {
        if (!shouldFilterPage(page) && page.sourceSearch) {
            const key = `${page.sourceSearch.engine}-${page.sourceSearch.query}`;
            const group = searchMap.get(key);
            if (group) {
                group.pages.push({ ...page, originalIndex: index });
            }
        }
    });
    
    // Convert map to array and sort by first timestamp
    searchMap.forEach(group => groups.push(group));
    groups.sort((a, b) => new Date(a.firstTimestamp) - new Date(b.firstTimestamp));
    
    return groups;
}

function createSearchContainer(group, groupIndex, showPages, showNotes, showComments, showMetadata) {
    const container = document.createElement('div');
    container.className = 'search-group';
    container.dataset.groupIndex = groupIndex;
    
    // Create search header with toggle
    const searchHeader = document.createElement('div');
    searchHeader.className = 'search-header';
    
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'toggle-btn expanded';
    toggleBtn.onclick = () => toggleSearchGroup(groupIndex);
    
    const searchContent = document.createElement('div');
    searchContent.className = 'search-content';
    
    // Show first search timestamp
    const time = document.createElement('span');
    time.className = 'search-time';
    time.textContent = formatTime(group.firstTimestamp);
    
    const icon = document.createElement('span');
    icon.className = 'search-icon';
    icon.textContent = '🔍';
    
    const searchInfo = document.createElement('div');
    searchInfo.className = 'search-info';
    
    const query = document.createElement('div');
    query.className = 'search-query';
    // Use expandable text for search queries
    const searchQueryText = `Search: "${group.query}"`;
    const queryElement = createExpandableText(searchQueryText, 120);
    if (queryElement.nodeType === Node.TEXT_NODE) {
        query.textContent = searchQueryText;
    } else {
        query.appendChild(queryElement);
    }
    
    const details = document.createElement('div');
    details.className = 'search-details';
    details.textContent = `${group.engine} - ${group.domain}`;
    if (group.searches.length > 1) {
        details.textContent += ` (${group.searches.length} searches)`;
    }
    
    searchInfo.appendChild(query);
    searchInfo.appendChild(details);
    
    // Add notes from all searches in this group
    if (showNotes) {
        group.searches.forEach(search => {
            if (search.notes && search.notes.length > 0) {
                search.notes.forEach(note => {
                    const noteDiv = document.createElement('div');
                    noteDiv.className = 'event-note';
                    
                    const notePrefix = document.createElement('span');
                    notePrefix.textContent = 'Note: ';
                    noteDiv.appendChild(notePrefix);
                    
                    const noteElement = createExpandableText(note.content, 120);
                    if (noteElement.nodeType === Node.TEXT_NODE) {
                        noteDiv.appendChild(noteElement);
                    } else {
                        noteDiv.appendChild(noteElement);
                    }
                    
                    searchInfo.appendChild(noteDiv);
                });
            }
        });
    }
    
    // Add remove search button
    if (viewMode === 'teacher') {
        const searchActions = document.createElement('div');
        searchActions.className = 'search-actions';
        
        const removeSearchBtn = document.createElement('button');
        removeSearchBtn.className = 'remove-search-btn';
        removeSearchBtn.textContent = 'Remove Search & Pages';
        removeSearchBtn.onclick = () => removeSearchAndPages(groupIndex, group);
        searchActions.appendChild(removeSearchBtn);
        
        searchInfo.appendChild(searchActions);
    }
    
    // Add comment options
    const searchId = `search-group-${groupIndex}`;
    const comment = commentData[searchId];
    
    if (showComments && (viewMode === 'teacher' || comment)) {
        if (comment) {
            const commentDiv = createCommentDisplay(comment, searchId);
            searchInfo.appendChild(commentDiv);
        }
        
        if (viewMode === 'teacher' && !comment) {
            const addCommentBtn = document.createElement('button');
            addCommentBtn.className = 'add-comment-btn';
            addCommentBtn.textContent = 'Add Comment';
            addCommentBtn.onclick = function() { showCommentForm(searchId, group.searches[0], null, this); };
            searchInfo.appendChild(addCommentBtn);
        }
    }
    
    searchContent.appendChild(time);
    searchContent.appendChild(icon);
    searchContent.appendChild(searchInfo);
    
    searchHeader.appendChild(toggleBtn);
    searchHeader.appendChild(searchContent);
    container.appendChild(searchHeader);
    
    // Create pages container
    if (showPages && group.pages.length > 0) {
        const pagesContainer = document.createElement('div');
        pagesContainer.className = 'pages-container';
        pagesContainer.dataset.groupIndex = groupIndex;
        
        group.pages.forEach((page, pageIndex) => {
            const pageId = `page-${groupIndex}-${pageIndex}`;
            if (!removedPages.has(pageId)) {
                const pageItem = createPageItem(page, pageId, showNotes, showComments, showMetadata);
                pagesContainer.appendChild(pageItem);
            }
        });
        
        container.appendChild(pagesContainer);
    }
    
    return container;
}

function createPageItem(page, pageId, showNotes, showComments, showMetadata) {
    const item = document.createElement('div');
    item.className = 'page-item';
    
    const time = document.createElement('span');
    time.className = 'page-time';
    time.textContent = formatTime(page.timestamp);
    
    const icon = document.createElement('span');
    icon.className = 'page-icon';
    icon.textContent = '📄';
    
    const contentWrapper = document.createElement('div');
    contentWrapper.style.display = 'flex';
    contentWrapper.style.width = '100%';
    contentWrapper.style.alignItems = 'center';
    
    const content = document.createElement('div');
    content.className = 'page-content';
    
    const titleDiv = document.createElement('div');
    titleDiv.className = 'page-title-container';
    const title = document.createElement('span');
    title.className = 'page-title';
    
    // Check for edited metadata first
    const edited = editedMetadata[pageId];
    let pageTitle;
    
    if (edited && edited.title) {
        pageTitle = edited.title;
    } else {
        // Prefer metadata.title over top-level title as it's usually more accurate
        pageTitle = (page.metadata && page.metadata.title) || page.title;
    }
    
    // If no title available, show a cleaned-up version of the URL
    if (!pageTitle || pageTitle.trim() === '') {
        const url = new URL(page.url);
        // Remove common prefixes and clean up the path
        pageTitle = url.pathname.split('/').filter(p => p).pop() || url.hostname;
        pageTitle = pageTitle.replace(/[-_]/g, ' ').replace(/\.\w+$/, ''); // Remove file extensions
        pageTitle = pageTitle.charAt(0).toUpperCase() + pageTitle.slice(1); // Capitalize
    }
    
    // Use expandable text for titles
    const titleElement = createExpandableText(pageTitle, 200);
    if (titleElement.nodeType === Node.TEXT_NODE) {
        title.textContent = pageTitle;
        titleDiv.appendChild(title);
    } else {
        title.appendChild(titleElement);
        titleDiv.appendChild(title);
    }
    title.title = page.url; // Add URL as tooltip
    
    // Add source type indicator
    if (page.metadata && viewMode === 'teacher') {
        const sourceType = assessSourceType(page);
        const typeBadge = document.createElement('span');
        typeBadge.className = `source-type type-${sourceType}`;
        typeBadge.textContent = getSourceTypeLabel(sourceType);
        titleDiv.appendChild(typeBadge);
    }
    
    const details = document.createElement('div');
    details.className = 'page-details';
    const domain = new URL(page.url).hostname;
    details.textContent = domain;
    
    content.appendChild(titleDiv);
    content.appendChild(details);
    
    // Add metadata section
    const hasOriginalMetadata = page.metadata && Object.keys(page.metadata).length > 0;
    const hasEditedMetadata = edited && Object.keys(edited).length > 0;
    
    if (showMetadata && (hasOriginalMetadata || hasEditedMetadata)) {
        const metadataSection = document.createElement('div');
        metadataSection.className = 'metadata-section';
        
        // Use edited metadata if available, otherwise use original
        const metadata = page.metadata || {};
        const author = (edited && edited.author) || metadata.author;
        const authors = (edited && edited.authors) || metadata.authors;
        const publishDate = (edited && edited.publishDate) || metadata.publishDate;
        const publisher = (edited && edited.publisher) || metadata.publisher;
        const contentType = (edited && edited.contentType) || metadata.contentType;
        
        // Academic identifiers
        const doi = (edited && edited.doi) || metadata.doi;
        const pmid = (edited && edited.pmid) || metadata.pmid;
        const arxivId = (edited && edited.arxivId) || metadata.arxivId;
        const citationKey = (edited && edited.citationKey) || metadata.citationKey;
        const journal = (edited && edited.journal) || metadata.journal;
        const publicationInfo = (edited && edited.publicationInfo) || metadata.publicationInfo;
        const pages = (edited && edited.pages) || metadata.pages;
        
        // Display author(s)
        if (author || authors) {
            const authorDiv = document.createElement('div');
            authorDiv.className = 'metadata-item';
            const authorText = authors ? authors.join(', ') : author;
            const authorLabel = document.createElement('span');
            authorLabel.className = 'metadata-label';
            authorLabel.textContent = `Author${authors && authors.length > 1 ? 's' : ''}:`;
            
            const authorValue = document.createElement('span');
            authorValue.className = 'metadata-value';
            const authorElement = createExpandableText(authorText, 200);
            if (authorElement.nodeType === Node.TEXT_NODE) {
                authorValue.textContent = authorText;
            } else {
                authorValue.appendChild(authorElement);
            }
            
            authorDiv.appendChild(authorLabel);
            authorDiv.appendChild(authorValue);
            metadataSection.appendChild(authorDiv);
        }
        
        if (publishDate) {
            const dateDiv = document.createElement('div');
            dateDiv.className = 'metadata-item';
            dateDiv.innerHTML = `<span class="metadata-label">Published:</span><span class="metadata-value">${publishDate}</span>`;
            metadataSection.appendChild(dateDiv);
        }
        
        if (publisher) {
            const publisherDiv = document.createElement('div');
            publisherDiv.className = 'metadata-item';
            const publisherLabel = document.createElement('span');
            publisherLabel.className = 'metadata-label';
            publisherLabel.textContent = 'Publisher:';
            
            const publisherValue = document.createElement('span');
            publisherValue.className = 'metadata-value';
            const publisherElement = createExpandableText(publisher, 80);
            if (publisherElement.nodeType === Node.TEXT_NODE) {
                publisherValue.textContent = publisher;
            } else {
                publisherValue.appendChild(publisherElement);
            }
            
            publisherDiv.appendChild(publisherLabel);
            publisherDiv.appendChild(publisherValue);
            metadataSection.appendChild(publisherDiv);
        }
        
        if (journal) {
            const journalDiv = document.createElement('div');
            journalDiv.className = 'metadata-item';
            const journalLabel = document.createElement('span');
            journalLabel.className = 'metadata-label';
            journalLabel.textContent = 'Journal:';
            
            const journalValue = document.createElement('span');
            journalValue.className = 'metadata-value';
            const journalElement = createExpandableText(journal, 80);
            if (journalElement.nodeType === Node.TEXT_NODE) {
                journalValue.textContent = journal;
            } else {
                journalValue.appendChild(journalElement);
            }
            
            journalDiv.appendChild(journalLabel);
            journalDiv.appendChild(journalValue);
            metadataSection.appendChild(journalDiv);
        }
        
        if (publicationInfo) {
            const pubInfoDiv = document.createElement('div');
            pubInfoDiv.className = 'metadata-item';
            const pubInfoLabel = document.createElement('span');
            pubInfoLabel.className = 'metadata-label';
            pubInfoLabel.textContent = 'Publication Info:';
            
            const pubInfoValue = document.createElement('span');
            pubInfoValue.className = 'metadata-value';
            const pubInfoElement = createExpandableText(publicationInfo, 80);
            if (pubInfoElement.nodeType === Node.TEXT_NODE) {
                pubInfoValue.textContent = publicationInfo;
            } else {
                pubInfoValue.appendChild(pubInfoElement);
            }
            
            pubInfoDiv.appendChild(pubInfoLabel);
            pubInfoDiv.appendChild(pubInfoValue);
            metadataSection.appendChild(pubInfoDiv);
        }
        
        if (pages) {
            const pagesDiv = document.createElement('div');
            pagesDiv.className = 'metadata-item';
            pagesDiv.innerHTML = `<span class="metadata-label">Pages:</span><span class="metadata-value">${pages}</span>`;
            metadataSection.appendChild(pagesDiv);
        }
        
        if (contentType) {
            const typeDiv = document.createElement('div');
            typeDiv.className = 'metadata-item';
            typeDiv.innerHTML = `<span class="metadata-label">Type:</span><span class="metadata-value">${contentType}</span>`;
            metadataSection.appendChild(typeDiv);
        }
        
        // Show citation identifiers
        if (doi || pmid || arxivId || citationKey) {
            const citationDiv = document.createElement('div');
            citationDiv.className = 'metadata-item citation-ids';
            let citationHtml = '<span class="metadata-label">IDs:</span><span class="metadata-value">';
            const ids = [];
            if (doi) ids.push(`DOI: ${doi}`);
            if (pmid) ids.push(`PMID: ${pmid}`);
            if (arxivId) ids.push(`arXiv: ${arxivId}`);
            if (citationKey && !doi && !pmid && !arxivId) ids.push(citationKey);
            citationHtml += ids.join(' | ') + '</span>';
            citationDiv.innerHTML = citationHtml;
            metadataSection.appendChild(citationDiv);
        }
        
        // Show metadata status indicators  
        const statusDiv = createMetadataStatusIndicators(metadata, edited);
        if (statusDiv) {
            statusDiv.style.marginTop = '8px';
            metadataSection.appendChild(statusDiv);
        }
        
        content.appendChild(metadataSection);
    }
    
    // Add notes
    if (showNotes && page.notes && page.notes.length > 0) {
        page.notes.forEach(note => {
            const noteDiv = document.createElement('div');
            noteDiv.className = 'event-note';
            
            const notePrefix = document.createElement('span');
            notePrefix.textContent = 'Note: ';
            noteDiv.appendChild(notePrefix);
            
            const noteElement = createExpandableText(note.content, 120);
            if (noteElement.nodeType === Node.TEXT_NODE) {
                noteDiv.appendChild(noteElement);
            } else {
                noteDiv.appendChild(noteElement);
            }
            
            content.appendChild(noteDiv);
        });
    }
    
    // Add action buttons
    const actionButtons = document.createElement('div');
    actionButtons.className = 'page-actions';
    
    // Visit page button
    const visitBtn = document.createElement('button');
    visitBtn.className = 'visit-page-btn';
    visitBtn.textContent = 'Visit Page';
    visitBtn.onclick = () => window.open(page.url, '_blank');
    actionButtons.appendChild(visitBtn);
    
    // View cards button
    const viewCardsBtn = document.createElement('button');
    const cardCount = page.cards ? page.cards.length : 0;
    
    if (cardCount === 0) {
        viewCardsBtn.className = 'view-cards-btn disabled';
        viewCardsBtn.textContent = 'No Cards';
        viewCardsBtn.disabled = true;
    } else if (cardCount === 1) {
        viewCardsBtn.className = 'view-cards-btn';
        viewCardsBtn.textContent = 'View 1 Card';
        viewCardsBtn.onclick = () => viewCards(pageId, page);
    } else {
        viewCardsBtn.className = 'view-cards-btn';
        viewCardsBtn.textContent = `View ${cardCount} Cards`;
        viewCardsBtn.onclick = () => viewCards(pageId, page);
    }
    actionButtons.appendChild(viewCardsBtn);
    
    // Edit and Move buttons container
    const editMoveContainer = document.createElement('div');
    editMoveContainer.className = 'edit-move-container';
    
    // Edit metadata button (half size)
    const editMetaBtn = document.createElement('button');
    editMetaBtn.className = 'edit-meta-btn half-btn';
    editMetaBtn.textContent = 'Edit';
    editMetaBtn.onclick = function() { showMetadataForm(pageId, page, this); };
    editMoveContainer.appendChild(editMetaBtn);
    
    // Move page button (half size)
    const movePageBtn = document.createElement('button');
    movePageBtn.className = 'move-page-btn half-btn';
    movePageBtn.textContent = 'Move';
    movePageBtn.onclick = function() { showMovePageModal(pageId, page); };
    editMoveContainer.appendChild(movePageBtn);
    
    actionButtons.appendChild(editMoveContainer);
    
    // Remove button (teacher view only)
    if (viewMode === 'teacher') {
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-page-btn';
        removeBtn.textContent = 'Remove';
        removeBtn.onclick = () => removePage(pageId, page);
        actionButtons.appendChild(removeBtn);
    }
    
    // Don't append actionButtons to content anymore
    
    // Add comments
    const comment = commentData[pageId];
    
    if (showComments && (viewMode === 'teacher' || comment)) {
        if (comment) {
            const commentDiv = createCommentDisplay(comment, pageId);
            content.appendChild(commentDiv);
        }
        
        if (viewMode === 'teacher' && !comment) {
            const addCommentBtn = document.createElement('button');
            addCommentBtn.className = 'add-comment-btn';
            addCommentBtn.textContent = 'Add Comment';
            addCommentBtn.onclick = function() { showCommentForm(pageId, page, null, this); };
            content.appendChild(addCommentBtn);
        }
    }
    
    // Add content to wrapper
    contentWrapper.appendChild(content);
    contentWrapper.appendChild(actionButtons);
    
    // Check if content is too narrow and switch to vertical layout
    const checkLayout = () => {
        const contentWidth = content.offsetWidth;
        if (contentWidth < 400) {
            actionButtons.classList.add('vertical');
        } else {
            actionButtons.classList.remove('vertical');
        }
    };
    
    // Check layout after DOM updates
    setTimeout(checkLayout, 0);
    
    // Add resize observer to check layout on size changes
    if (window.ResizeObserver) {
        const resizeObserver = new ResizeObserver(checkLayout);
        resizeObserver.observe(content);
    }
    
    item.appendChild(time);
    item.appendChild(icon);
    item.appendChild(contentWrapper);
    
    return item;
}

function toggleSearchGroup(groupIndex) {
    const container = document.querySelector(`.pages-container[data-group-index="${groupIndex}"]`);
    const toggleBtn = document.querySelector(`.search-group[data-group-index="${groupIndex}"] .toggle-btn`);
    
    if (container) {
        if (container.style.display === 'none') {
            container.style.display = 'block';
            toggleBtn.classList.add('expanded');
        } else {
            container.style.display = 'none';
            toggleBtn.classList.remove('expanded');
        }
    }
}

function removePage(pageId, page) {
    const removeBtn = event.target;
    
    showInlineConfirmation(removeBtn, () => {
        removedPages.add(pageId);
        
        // Track action for undo
        lastAction = {
            type: 'removePage',
            pageId: pageId,
            pageData: page
        };
        enableUndoButton();
        enableRestoreButton();
        
        // Save to localStorage
        if (sessionData && sessionData.id) {
            localStorage.setItem(`removed-pages-${sessionData.id}`, JSON.stringify(Array.from(removedPages)));
        }
        
        // Refresh timeline
        updateTimeline();
    });
}

function loadRemovedPages() {
    if (sessionData && sessionData.id) {
        const saved = localStorage.getItem(`removed-pages-${sessionData.id}`);
        if (saved) {
            removedPages = new Set(JSON.parse(saved));
        }
    }
}

function clearRemovedPages() {
    removedPages.clear();
    if (sessionData && sessionData.id) {
        localStorage.removeItem(`removed-pages-${sessionData.id}`);
    }
    updateTimeline();
}

function clearRemovedSearches() {
    removedSearches.clear();
    if (sessionData && sessionData.id) {
        localStorage.removeItem(`removed-searches-${sessionData.id}`);
    }
    updateTimeline();
}


function enableUndoButton() {
    const undoBtn = document.getElementById('undoBtn');
    if (undoBtn) {
        undoBtn.disabled = false;
        // Update button text to show what will be undone
        if (lastAction) {
            switch (lastAction.type) {
                case 'comment':
                    undoBtn.textContent = 'Undo Comment';
                    break;
                case 'deleteComment':
                    undoBtn.textContent = 'Undo Delete';
                    break;
                case 'removePage':
                    undoBtn.textContent = 'Undo Remove';
                    break;
                case 'restoreAll':
                    undoBtn.textContent = 'Undo Restore';
                    break;
                case 'editMetadata':
                    undoBtn.textContent = 'Undo Edit';
                    break;
                case 'removeSearch':
                    undoBtn.textContent = 'Undo Remove Search';
                    break;
                case 'unlinkCard':
                    undoBtn.textContent = 'Undo Unlink';
                    break;
                case 'unlinkCardFromAll':
                    undoBtn.textContent = 'Undo Unlink from All';
                    break;
                case 'moveCard':
                    undoBtn.textContent = 'Undo Move';
                    break;
                case 'movePageToSearch':
                    undoBtn.textContent = 'Undo Move Page';
                    break;
                default:
                    undoBtn.textContent = 'Undo';
            }
        }
    }
}

function disableUndoButton() {
    const undoBtn = document.getElementById('undoBtn');
    if (undoBtn) {
        undoBtn.disabled = true;
        undoBtn.textContent = 'Undo';
    }
}

function enableRestoreButton() {
    const restoreBtn = document.getElementById('restorePages');
    if (restoreBtn) {
        restoreBtn.disabled = false;
    }
}

function disableRestoreButton() {
    const restoreBtn = document.getElementById('restorePages');
    if (restoreBtn) {
        restoreBtn.disabled = true;
    }
}

function performUndo() {
    if (!lastAction) return;
    
    switch (lastAction.type) {
        case 'comment':
            // Restore previous comment state
            if (lastAction.previousValue) {
                commentData[lastAction.eventId] = lastAction.previousValue;
            } else {
                delete commentData[lastAction.eventId];
            }
            localStorage.setItem(`comments-${sessionData.id}`, JSON.stringify(commentData));
            break;
            
        case 'deleteComment':
            // Restore deleted comment
            if (lastAction.previousValue) {
                commentData[lastAction.eventId] = lastAction.previousValue;
                localStorage.setItem(`comments-${sessionData.id}`, JSON.stringify(commentData));
            }
            break;
            
        case 'removePage':
            // Restore removed page
            removedPages.delete(lastAction.pageId);
            if (sessionData && sessionData.id) {
                localStorage.setItem(`removed-pages-${sessionData.id}`, JSON.stringify(Array.from(removedPages)));
            }
            break;
            
        case 'restoreAll':
            // Re-remove all previously removed pages and searches
            if (lastAction.previousRemovedPages) {
                removedPages = new Set(lastAction.previousRemovedPages);
                if (sessionData && sessionData.id) {
                    localStorage.setItem(`removed-pages-${sessionData.id}`, JSON.stringify(Array.from(removedPages)));
                }
            }
            if (lastAction.previousRemovedSearches) {
                removedSearches = new Set(lastAction.previousRemovedSearches);
                if (sessionData && sessionData.id) {
                    localStorage.setItem(`removed-searches-${sessionData.id}`, JSON.stringify(Array.from(removedSearches)));
                }
            }
            break;
            
        case 'editMetadata':
            // Restore previous metadata state
            if (lastAction.previousValue) {
                editedMetadata[lastAction.pageId] = lastAction.previousValue;
            } else {
                delete editedMetadata[lastAction.pageId];
            }
            if (sessionData && sessionData.id) {
                localStorage.setItem(`edited-metadata-${sessionData.id}`, JSON.stringify(editedMetadata));
            }
            break;
            
        case 'removeSearch':
            // Restore removed search
            removedSearches.delete(lastAction.searchKey);
            // Restore pages
            lastAction.removedPageIds.forEach(pageId => {
                removedPages.delete(pageId);
            });
            saveRemovedSearches();
            if (sessionData && sessionData.id) {
                localStorage.setItem(`removed-pages-${sessionData.id}`, JSON.stringify(Array.from(removedPages)));
            }
            break;
            
        case 'unlinkCard':
            // Restore the unlinked card to all affected pages
            lastAction.affectedPages.forEach(({page, pageId}) => {
                if (!page.cards) {
                    page.cards = [];
                }
                // Add the card back
                page.cards.push(lastAction.card);
                
                // Sort cards by score again to maintain order
                page.cards.sort((a, b) => b.matchScore - a.matchScore);
            });
            
            // If the cards modal is open for the primary page, refresh it
            const modal = document.getElementById('cardsModal');
            if (modal && modal.style.display === 'block' && lastAction.primaryPageId) {
                const primaryPage = lastAction.affectedPages.find(
                    ap => ap.pageId === lastAction.primaryPageId
                )?.page;
                if (primaryPage) {
                    showCardsModal(lastAction.primaryPageId, primaryPage);
                }
            }
            break;
            
        case 'unlinkCardFromAll':
            // Restore the card to all affected pages
            lastAction.affectedPages.forEach(({page, pageId, card}) => {
                if (!page.cards) {
                    page.cards = [];
                }
                // Add the card back
                page.cards.push(card);
                
                // Sort cards by score again to maintain order
                page.cards.sort((a, b) => b.matchScore - a.matchScore);
            });
            
            // Remove from unlinked from all set
            unlinkedFromAllCards.delete(lastAction.cardIndex.toString());
            break;
            
        case 'moveCard':
            // Restore card to original pages and remove from target pages
            if (lastAction.removedCardData && lastAction.addedCardData) {
                // Remove card from target pages
                lastAction.addedCardData.forEach(({page, pageId, card, cardIndex}) => {
                    const cardIdx = page.cards.findIndex(c => 
                        c.cardIndex === lastAction.originalCard.cardIndex
                    );
                    if (cardIdx !== -1) {
                        page.cards.splice(cardIdx, 1);
                    }
                });
                
                // Restore card to original pages
                lastAction.removedCardData.forEach(({page, pageId, card, cardIndex}) => {
                    if (!page.cards) {
                        page.cards = [];
                    }
                    // Insert the original card back
                    page.cards.push(lastAction.originalCard);
                    
                    // Sort cards by score to maintain order
                    page.cards.sort((a, b) => b.matchScore - a.matchScore);
                });
                
                // If the cards modal is open, refresh it for the source page
                const modal = document.getElementById('cardsModal');
                if (modal && modal.style.display === 'block' && lastAction.sourcePageId) {
                    const sourcePageData = lastAction.removedCardData.find(
                        data => data.pageId === lastAction.sourcePageId
                    );
                    if (sourcePageData) {
                        showCardsModal(lastAction.sourcePageId, sourcePageData.page);
                    }
                }
            }
            break;
            
        case 'movePageToSearch':
            // Restore the page's original sourceSearch
            if (lastAction.pageIndex !== undefined && sessionData.contentPages[lastAction.pageIndex]) {
                sessionData.contentPages[lastAction.pageIndex].sourceSearch = lastAction.originalSourceSearch;
            }
            break;
    }
    
    lastAction = null;
    disableUndoButton();
    updateTimeline();
}

function restoreAllRemovedPages() {
    const pageCount = removedPages.size;
    const searchCount = removedSearches.size;
    
    if (pageCount === 0 && searchCount === 0) {
        alert('No items have been removed.');
        return;
    }
    
    const restoreBtn = event.target;
    
    showInlineConfirmation(restoreBtn, () => {
        // Track action for undo (store all removed items)
        lastAction = {
            type: 'restoreAll',
            previousRemovedPages: new Set(removedPages),
            previousRemovedSearches: new Set(removedSearches)
        };
        enableUndoButton();
        
        clearRemovedPages();
        clearRemovedSearches();
        disableRestoreButton();
    }, true); // true indicates this is a restore action (green button)
}


function showMetadataForm(pageId, page, buttonElement) {
    const modal = document.getElementById('metadataModal');
    const formContainer = document.getElementById('metadataFormContainer');
    
    // Clear existing content and DOI flag
    formContainer.innerHTML = '';
    delete modal.dataset.filledFromDoi;
    
    // Store escape handler for cleanup
    let escapeHandler;
    
    const form = document.createElement('div');
    form.className = 'metadata-form';
    
    const edited = editedMetadata[pageId] || {};
    const original = page.metadata || {};
    
    // Create two columns for better organization
    const formColumns = document.createElement('div');
    formColumns.className = 'metadata-form-columns';
    formColumns.style.display = 'grid';
    formColumns.style.gridTemplateColumns = '1fr 1fr';
    formColumns.style.gap = '15px';
    
    const leftColumn = document.createElement('div');
    const rightColumn = document.createElement('div');
    
    // Title field (full width)
    const titleGroup = document.createElement('div');
    titleGroup.className = 'form-group';
    titleGroup.style.gridColumn = 'span 2';
    titleGroup.innerHTML = '<label>Title:</label>';
    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.className = 'metadata-input';
    titleInput.value = edited.title || original.title || page.title || '';
    titleInput.placeholder = 'Enter page title';
    titleGroup.appendChild(titleInput);
    
    // Author field
    const authorGroup = document.createElement('div');
    authorGroup.className = 'form-group';
    authorGroup.innerHTML = '<label>Author(s):</label>';
    const authorInput = document.createElement('input');
    authorInput.type = 'text';
    authorInput.className = 'metadata-input';
    // Handle authors array or single author
    const authorValue = edited.author || original.author || 
                       (original.authors ? original.authors.join(', ') : '') || '';
    authorInput.value = authorValue;
    authorInput.placeholder = 'Enter author name(s)';
    authorGroup.appendChild(authorInput);
    leftColumn.appendChild(authorGroup);
    
    // Publish date field
    const dateGroup = document.createElement('div');
    dateGroup.className = 'form-group';
    dateGroup.innerHTML = '<label>Publish Date:</label>';
    const dateInput = document.createElement('input');
    dateInput.type = 'text';
    dateInput.className = 'metadata-input';
    dateInput.value = edited.publishDate || original.publishDate || '';
    dateInput.placeholder = 'e.g., 2025-05-15';
    dateGroup.appendChild(dateInput);
    rightColumn.appendChild(dateGroup);
    
    // Publisher field
    const publisherGroup = document.createElement('div');
    publisherGroup.className = 'form-group';
    publisherGroup.innerHTML = '<label>Publisher:</label>';
    const publisherInput = document.createElement('input');
    publisherInput.type = 'text';
    publisherInput.className = 'metadata-input';
    publisherInput.value = edited.publisher || original.publisher || '';
    publisherInput.placeholder = 'Enter publisher name';
    publisherGroup.appendChild(publisherInput);
    leftColumn.appendChild(publisherGroup);
    
    // Journal field
    const journalGroup = document.createElement('div');
    journalGroup.className = 'form-group';
    journalGroup.innerHTML = '<label>Journal:</label>';
    const journalInput = document.createElement('input');
    journalInput.type = 'text';
    journalInput.className = 'metadata-input';
    journalInput.value = edited.journal || original.journal || '';
    journalInput.placeholder = 'Enter journal name';
    journalGroup.appendChild(journalInput);
    rightColumn.appendChild(journalGroup);
    
    // Publication Info field
    const pubInfoGroup = document.createElement('div');
    pubInfoGroup.className = 'form-group';
    pubInfoGroup.innerHTML = '<label>Publication Info:</label>';
    const pubInfoInput = document.createElement('input');
    pubInfoInput.type = 'text';
    pubInfoInput.className = 'metadata-input';
    pubInfoInput.value = edited.publicationInfo || original.publicationInfo || '';
    pubInfoInput.placeholder = 'e.g., Vol. 15, No. 3';
    pubInfoGroup.appendChild(pubInfoInput);
    leftColumn.appendChild(pubInfoGroup);
    
    // Pages field
    const pagesGroup = document.createElement('div');
    pagesGroup.className = 'form-group';
    pagesGroup.innerHTML = '<label>Pages:</label>';
    const pagesInput = document.createElement('input');
    pagesInput.type = 'text';
    pagesInput.className = 'metadata-input';
    pagesInput.value = edited.pages || original.pages || '';
    pagesInput.placeholder = 'e.g., 123-145';
    pagesGroup.appendChild(pagesInput);
    rightColumn.appendChild(pagesGroup);
    
    // DOI field
    const doiGroup = document.createElement('div');
    doiGroup.className = 'form-group';
    doiGroup.innerHTML = '<label>Identifier:</label>';
    const doiInput = document.createElement('input');
    doiInput.type = 'text';
    doiInput.className = 'metadata-input';
    doiInput.value = getDOI(edited) || getDOI(original) || '';
    doiInput.placeholder = 'DOI, ISBN, PMID, arXiv ID, etc.';
    doiGroup.appendChild(doiInput);
    leftColumn.appendChild(doiGroup);
    
    // Quals field (full width)
    const qualsGroup = document.createElement('div');
    qualsGroup.className = 'form-group';
    qualsGroup.style.gridColumn = 'span 2';
    qualsGroup.innerHTML = '<label>Quals:</label>';
    const qualsInput = document.createElement('textarea');
    qualsInput.className = 'metadata-input';
    qualsInput.value = edited.quals || original.quals || '';
    qualsInput.placeholder = 'Enter qualification information';
    qualsInput.rows = 3;
    qualsGroup.appendChild(qualsInput);
    
    // Content Type field
    const typeGroup = document.createElement('div');
    typeGroup.className = 'form-group';
    typeGroup.innerHTML = '<label>Content Type:</label>';
    const typeSelect = document.createElement('select');
    typeSelect.className = 'metadata-input';
    
    const typeOptions = [
        { value: '', label: '-- Select Type --' },
        // Common types (alphabetized)
        { value: 'book', label: 'Book' },
        { value: 'book-chapter', label: 'Book Chapter' },
        { value: 'journal-article', label: 'Journal Article' },
        { value: 'article-newspaper', label: 'Newspaper Article' },
        { value: 'report', label: 'Report' },
        { value: 'webpage', label: 'Webpage' },
        // Divider
        { value: '', label: '──────────────────────', disabled: true },
        // All other types (alphabetized)
        { value: 'conference-paper', label: 'Conference Paper' },
        { value: 'dataset', label: 'Dataset' },
        { value: 'dissertation', label: 'Dissertation' },
        { value: 'interview', label: 'Interview' },
        { value: 'law-review', label: 'Law Review' },
        { value: 'legal-case', label: 'Legal Case' },
        { value: 'legislation', label: 'Legislation' },
        { value: 'article-magazine', label: 'Magazine Article' },
        { value: 'monograph', label: 'Monograph' },
        { value: 'personal-communication', label: 'Personal Communication' },
        { value: 'preprint', label: 'Preprint' },
        { value: 'proceedings-article', label: 'Proceedings Article' },
        { value: 'reference-entry', label: 'Reference Entry' },
        { value: 'speech', label: 'Speech' },
        { value: 'thesis', label: 'Thesis' },
        { value: 'treaty', label: 'Treaty' }
    ];
    
    typeOptions.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt.value;
        option.textContent = opt.label;
        if (opt.disabled) {
            option.disabled = true;
            option.style.color = '#999';
            option.style.textAlign = 'center';
        }
        if ((edited.contentType || original.contentType || '') === opt.value) {
            option.selected = true;
        }
        typeSelect.appendChild(option);
    });
    
    typeGroup.appendChild(typeSelect);
    rightColumn.appendChild(typeGroup);
    
    // Actions
    const actions = document.createElement('div');
    actions.className = 'metadata-actions';
    actions.style.gridColumn = 'span 2';
    actions.style.marginTop = '15px';
    
    const saveBtn = document.createElement('button');
    saveBtn.className = 'save-metadata-btn';
    saveBtn.textContent = 'Save';
    saveBtn.onclick = () => {
        let newMetadata = {
            title: titleInput.value.trim(),
            author: authorInput.value.trim(),
            publishDate: dateInput.value.trim(),
            publisher: publisherInput.value.trim(),
            journal: journalInput.value.trim(),
            publicationInfo: pubInfoInput.value.trim(),
            pages: pagesInput.value.trim(),
            quals: qualsInput.value.trim(),
            contentType: typeSelect.value
        };
        
        // Handle DOI using new identifier system (with backward compatibility)
        const doiValue = doiInput.value.trim();
        if (doiValue) {
            newMetadata = setDOI(newMetadata, doiValue);
        }
        
        // Handle authors as array if multiple authors separated by commas
        if (newMetadata.author && newMetadata.author.includes(',')) {
            newMetadata.authors = newMetadata.author.split(',').map(a => a.trim());
        }
        
        // Preserve existing metadata flags and identifiers
        const existingMetadata = { ...original, ...edited };
        if (existingMetadata.extractorType) newMetadata.extractorType = existingMetadata.extractorType;
        if (existingMetadata.extractorSite) newMetadata.extractorSite = existingMetadata.extractorSite;
        if (existingMetadata.doiMetadata) newMetadata.doiMetadata = existingMetadata.doiMetadata; // Keep for backward compatibility
        if (existingMetadata.created) newMetadata.created = existingMetadata.created;
        if (existingMetadata.lastUpdated) newMetadata.lastUpdated = existingMetadata.lastUpdated;
        
        // Preserve existing identifiers and source tracking
        if (existingMetadata.identifiers) {
            // Merge existing identifiers with any new ones, avoiding duplicates
            const existingIds = existingMetadata.identifiers || [];
            const newIds = newMetadata.identifiers || [];
            const mergedIdentifiers = [...existingIds];
            
            // Add new identifiers that don't already exist
            newIds.forEach(newId => {
                if (!mergedIdentifiers.find(existing => existing.type === newId.type)) {
                    mergedIdentifiers.push(newId);
                }
            });
            
            newMetadata.identifiers = mergedIdentifiers;
        }
        // Only preserve existing sourceIdentifier if new metadata doesn't have one
        if (existingMetadata.sourceIdentifier && !newMetadata.sourceIdentifier) {
            newMetadata.sourceIdentifier = existingMetadata.sourceIdentifier;
        }
        
        // Check if this form was filled from smart lookup and mark accordingly
        if (modal.dataset.filledFromDoi === 'true') {
            newMetadata.doiMetadata = true; // Keep for backward compatibility
            
            // Retrieve sourceIdentifier and identifiers from the fetched metadata
            if (modal._fetchedMetadata) {
                if (modal._fetchedMetadata.sourceIdentifier) {
                    newMetadata.sourceIdentifier = modal._fetchedMetadata.sourceIdentifier;
                }
                if (modal._fetchedMetadata.identifiers) {
                    newMetadata.identifiers = modal._fetchedMetadata.identifiers;
                }
            }
            
            // Fallback to DOI if no sourceIdentifier from fetch
            if (!newMetadata.sourceIdentifier) {
                const doiValue = getDOI(newMetadata);
                if (doiValue) {
                    newMetadata.sourceIdentifier = { type: 'DOI', value: doiValue };
                }
            }
            
            // Clear the flags
            delete modal.dataset.filledFromDoi;
            delete modal._fetchedMetadata;
        }
        
        // Mark as manually edited
        newMetadata.manuallyEdited = true;
        newMetadata.editTimestamp = new Date().toISOString();
        
        // Remove empty fields
        Object.keys(newMetadata).forEach(key => {
            if (!newMetadata[key]) delete newMetadata[key];
        });
        
        saveMetadata(pageId, newMetadata, page);
        modal.style.display = 'none';
        document.removeEventListener('keydown', escapeHandler);
    };
    
    const fillFromDoiBtn = document.createElement('button');
    fillFromDoiBtn.className = 'fill-from-doi-btn';
    fillFromDoiBtn.textContent = 'Smart Lookup';
    fillFromDoiBtn.onclick = () => {
        showDoiInputModal(titleInput, authorInput, dateInput, publisherInput, journalInput, pubInfoInput, pagesInput, doiInput, qualsInput, typeSelect);
    };
    
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'cancel-metadata-btn';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.onclick = () => {
        modal.style.display = 'none';
        document.removeEventListener('keydown', escapeHandler);
    };
    
    actions.appendChild(saveBtn);
    actions.appendChild(fillFromDoiBtn);
    actions.appendChild(cancelBtn);
    
    // Assemble form
    form.appendChild(titleGroup);
    formColumns.appendChild(leftColumn);
    formColumns.appendChild(rightColumn);
    form.appendChild(formColumns);
    form.appendChild(qualsGroup);
    form.appendChild(actions);
    
    // Add metadata status indicators
    const statusDiv = createMetadataStatusIndicators(original, edited);
    if (statusDiv) {
        form.appendChild(statusDiv);
    }
    
    // Add form to modal and show it
    formContainer.appendChild(form);
    modal.style.display = 'block';
    
    // ESC key to close modal
    escapeHandler = function(e) {
        if (e.key === 'Escape' && modal.style.display === 'block') {
            modal.style.display = 'none';
            document.removeEventListener('keydown', escapeHandler);
        }
    };
    document.addEventListener('keydown', escapeHandler);
}

function saveMetadata(pageId, metadata, page) {
    // Save previous state for undo
    const previousMetadata = editedMetadata[pageId] ? { ...editedMetadata[pageId] } : null;
    
    if (Object.keys(metadata).length > 0) {
        editedMetadata[pageId] = metadata;
    } else {
        delete editedMetadata[pageId];
    }
    
    // Track action for undo
    lastAction = {
        type: 'editMetadata',
        pageId: pageId,
        previousValue: previousMetadata,
        newValue: metadata
    };
    enableUndoButton();
    
    // Save to localStorage
    if (sessionData && sessionData.id) {
        localStorage.setItem(`edited-metadata-${sessionData.id}`, JSON.stringify(editedMetadata));
    }
    
    // Refresh timeline
    updateTimeline();
}

function loadEditedMetadata() {
    if (sessionData && sessionData.id) {
        const saved = localStorage.getItem(`edited-metadata-${sessionData.id}`);
        if (saved) {
            editedMetadata = JSON.parse(saved);
        }
    }
}

function expandAll() {
    document.querySelectorAll('.pages-container').forEach(container => {
        container.style.display = 'block';
    });
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.classList.add('expanded');
    });
}

function collapseAll() {
    document.querySelectorAll('.pages-container').forEach(container => {
        container.style.display = 'none';
    });
    document.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.classList.remove('expanded');
    });
}

function removeSearchAndPages(groupIndex, group) {
    const removeBtn = event.target;
    
    showInlineConfirmation(removeBtn, () => {
        // Mark this search group as removed
        const searchKey = `${group.engine}-${group.query}`;
        removedSearches.add(searchKey);
        
        // Also remove all pages in this group
        group.pages.forEach((page, pageIndex) => {
            const pageId = `page-${groupIndex}-${pageIndex}`;
            removedPages.add(pageId);
        });
        
        // Track for undo
        lastAction = {
            type: 'removeSearch',
            searchKey: searchKey,
            groupData: group,
            removedPageIds: group.pages.map((page, pageIndex) => `page-${groupIndex}-${pageIndex}`)
        };
        enableUndoButton();
        enableRestoreButton();
        
        // Save to localStorage
        saveRemovedSearches();
        if (sessionData && sessionData.id) {
            localStorage.setItem(`removed-pages-${sessionData.id}`, JSON.stringify(Array.from(removedPages)));
        }
        
        // Refresh timeline
        updateTimeline();
    });
}

function saveRemovedSearches() {
    if (sessionData && sessionData.id) {
        localStorage.setItem(`removed-searches-${sessionData.id}`, JSON.stringify(Array.from(removedSearches)));
    }
}

function loadRemovedSearches() {
    if (sessionData && sessionData.id) {
        const saved = localStorage.getItem(`removed-searches-${sessionData.id}`);
        if (saved) {
            removedSearches = new Set(JSON.parse(saved));
        }
    }
}

function exportModifiedData() {
    // Create a deep copy of the session data
    const modifiedData = JSON.parse(JSON.stringify(sessionData));
    
    // Apply metadata edits
    modifiedData.contentPages.forEach((page, index) => {
        const pageId = page.sourceSearch ? 
            `page-${getGroupIndex(page.sourceSearch)}-${getPageIndexInGroup(page, index)}` : 
            `orphan-${index}`;
        
        if (editedMetadata[pageId]) {
            if (!page.metadata) page.metadata = {};
            Object.assign(page.metadata, editedMetadata[pageId]);
            
            // Also update top-level title if edited
            if (editedMetadata[pageId].title) {
                page.title = editedMetadata[pageId].title;
            }
        }
    });
    
    // Remove filtered searches and their pages
    modifiedData.searches = modifiedData.searches.filter(search => {
        const key = `${search.engine}-${search.query}`;
        return !removedSearches.has(key);
    });
    
    // Remove individually removed pages and pages from removed searches
    modifiedData.contentPages = modifiedData.contentPages.filter((page, index) => {
        // Check if page's search was removed
        if (page.sourceSearch) {
            const searchKey = `${page.sourceSearch.engine}-${page.sourceSearch.query}`;
            if (removedSearches.has(searchKey)) return false;
        }
        
        // Check if page was individually removed
        const pageId = page.sourceSearch ? 
            `page-${getGroupIndex(page.sourceSearch)}-${getPageIndexInGroup(page, index)}` : 
            `orphan-${index}`;
        return !removedPages.has(pageId);
    });
    
    // Rebuild chronological events
    modifiedData.chronologicalEvents = [
        ...modifiedData.searches,
        ...modifiedData.contentPages
    ].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    // Add teacher comments as a new field
    modifiedData.teacherComments = commentData;
    
    // Add card matching history BEFORE removing cards from pages
    const cardMatchingHistory = {
        unlinkedCards: [], // Will be populated with card signatures
        unlinkedFromAllCards: [], // Will be populated with card signatures
        manualCardMoves: []
    };
    
    // Convert unlinkedCards to use card signatures
    unlinkedCards.forEach(unlinkedKey => {
        const [cardIndexStr, pageUrl] = unlinkedKey.split('-');
        const cardIndex = parseInt(cardIndexStr);
        
        // Find the card in parsedCards to get its content
        if (parsedCards[cardIndex]) {
            const card = parsedCards[cardIndex];
            cardMatchingHistory.unlinkedCards.push({
                cardSignature: createCardSignature(card),
                pageUrl: pageUrl
            });
        }
    });
    
    // Convert unlinkedFromAllCards to use card signatures
    unlinkedFromAllCards.forEach(cardIndexStr => {
        const cardIndex = parseInt(cardIndexStr);
        
        // Find the card in parsedCards to get its content
        if (parsedCards[cardIndex]) {
            const card = parsedCards[cardIndex];
            cardMatchingHistory.unlinkedFromAllCards.push({
                cardSignature: createCardSignature(card)
            });
        }
    });
    
    // Track manual card moves by iterating through pages and finding manually moved cards
    modifiedData.contentPages.forEach((page) => {
        if (page.cards) {
            page.cards.forEach((card) => {
                if (card.matchDetails && card.matchDetails.weightingMethod === 'Manual') {
                    // Find the original card in parsedCards to get minimal info
                    const originalCard = parsedCards[card.cardIndex];
                    if (originalCard) {
                        cardMatchingHistory.manualCardMoves.push({
                            cardHeader: originalCard.header,
                            cardText: originalCard.contentText || originalCard.text,
                            cardIndex: card.cardIndex,
                            targetPageUrl: page.url,
                            matchScore: card.matchScore,
                            matchDetails: card.matchDetails
                        });
                    }
                }
            });
        }
    });
    
    modifiedData.cardMatchingHistory = cardMatchingHistory;
    
    // Remove cards from all pages to keep JSON small
    modifiedData.contentPages.forEach((page) => {
        delete page.cards;
    });
    
    // Export the modified data
    const blob = new Blob([JSON.stringify(modifiedData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `modified-${sessionData.name.replace(/[^a-z0-9]/gi, '_')}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

// Helper function to get group index for a search
function getGroupIndex(sourceSearch) {
    const groups = groupSearchesAndPages();
    const key = `${sourceSearch.engine}-${sourceSearch.query}`;
    return groups.findIndex(group => `${group.engine}-${group.query}` === key);
}

// Helper function to get page index within its group
function getPageIndexInGroup(page, originalIndex) {
    const groups = groupSearchesAndPages();
    if (page.sourceSearch) {
        const key = `${page.sourceSearch.engine}-${page.sourceSearch.query}`;
        const group = groups.find(g => `${g.engine}-${g.query}` === key);
        if (group) {
            return group.pages.findIndex(p => p.originalIndex === originalIndex);
        }
    }
    return originalIndex;
}

// Global variable to store parsed sections and cards
let parsedSections = [];
let parsedCards = [];

// Function to unload JSON and return to home screen
function unloadJSON() {
    // Clear all session data
    sessionData = null;
    parsedSections = [];
    parsedCards = [];
    
    // Clear all tracking data
    removedPages.clear();
    removedSearches.clear();
    commentData = {};
    editedMetadata = {};
    unlinkedCards.clear();
    importedCardMatchingHistory = null;
    lastAction = null;
    
    // Reset UI elements
    document.getElementById('fileInputName').textContent = 'No JSON file chosen';
    document.getElementById('fileInput').value = '';
    document.getElementById('docxInputName').textContent = 'No DOCX file chosen';
    document.getElementById('docxInput').value = '';
    document.getElementById('parsedSectionsLink').classList.add('hidden');
    document.getElementById('unloadDOCX').classList.add('hidden');
    
    // Hide all session-related UI
    document.getElementById('sessionInfo').classList.add('hidden');
    document.getElementById('actionsBox').classList.add('hidden');
    document.getElementById('visualization').classList.add('hidden');
    
    // Clear timeline content
    document.getElementById('timelineContent').innerHTML = '';
    
    // Disable buttons that require session data
    disableUndoButton();
    disableRestoreButton();
    
    console.log('JSON unloaded - returned to home screen');
}

// Function to unload DOCX and clear all cards
function unloadDOCX() {
    // Clear parsed sections and cards
    parsedSections = [];
    parsedCards = [];
    
    // Clear cards from all pages
    if (sessionData && sessionData.contentPages) {
        sessionData.contentPages.forEach(page => {
            delete page.cards;
        });
    }
    
    // Clear unlinked cards but DO NOT clear importedCardMatchingHistory
    // This preserves manual matches and unlinks for when DOCX is reloaded
    unlinkedCards.clear();
    unlinkedFromAllCards.clear();
    
    // Reset DOCX UI elements
    document.getElementById('docxInputName').textContent = 'No DOCX file chosen';
    document.getElementById('docxInput').value = '';
    document.getElementById('parsedSectionsLink').classList.add('hidden');
    document.getElementById('unloadDOCX').classList.add('hidden');
    document.getElementById('viewUnmatchedCards').classList.add('hidden');
    hideDocxProgress();
    
    // Update timeline to reflect no cards
    updateTimeline();
    
    console.log('DOCX unloaded and cards cleared (card matching history preserved)');
}

// Function to parse DOCX file
async function parseDOCXFile(file) {
    // Show progress indicator
    showDocxProgress();
    
    try {
        const arrayBuffer = await file.arrayBuffer();
        
        // Use mammoth to convert DOCX to HTML
        const result = await mammoth.convertToHtml({
            arrayBuffer: arrayBuffer
        });
        
        // Parse the HTML to extract sections
        const parser = new DOMParser();
        const doc = parser.parseFromString(result.value, 'text/html');
        
        // Reset parsed sections and cards
        parsedSections = [];
        parsedCards = [];
        
        // Find all headers (h1, h2, h3, h4)
        const headers = doc.querySelectorAll('h1, h2, h3, h4');
        
        headers.forEach((header, index) => {
            const level = parseInt(header.tagName[1]);
            const headerText = header.textContent.trim();
            
            // Get all content between this header and the next header
            let content = [];
            let currentElement = header.nextElementSibling;
            
            while (currentElement && !['H1', 'H2', 'H3', 'H4'].includes(currentElement.tagName)) {
                content.push(currentElement.outerHTML);
                currentElement = currentElement.nextElementSibling;
            }
            
            const section = {
                level: level,
                header: headerText,
                content: content.join(''),
                contentText: content.map(html => {
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = html;
                    return tempDiv.textContent || tempDiv.innerText || '';
                }).join(' '),
                index: index
            };
            
            parsedSections.push(section);
            
            // If this is a level 4 header, it's a card
            if (level === 4) {
                parsedCards.push(section);
            }
        });
        
        // Match cards to pages if session data exists
        if (sessionData) {
            matchCardsToPages();
        }
        
        // Show success state, then transition to final state
        showDocxSuccess();
        setTimeout(() => {
            hideDocxProgress();
            // Update the UI after success state is shown
            updateParsedSectionsUI();
        }, 1500); // Show success for 1.5 seconds
        
    } catch (error) {
        // Hide progress indicator on error
        hideDocxProgress();
        console.error('Error parsing DOCX file:', error);
        alert('Error parsing DOCX file. Please ensure it is a valid .docx file.');
    }
}

// Function to show DOCX parsing progress indicator
function showDocxProgress() {
    const progressDiv = document.getElementById('docxProgress');
    const sectionsLink = document.getElementById('parsedSectionsLink');
    
    if (progressDiv) {
        progressDiv.classList.remove('hidden');
    }
    
    // Hide the sections link while processing
    if (sectionsLink) {
        sectionsLink.classList.add('hidden');
    }
}

// Function to show DOCX parsing success state
function showDocxSuccess() {
    const progressDiv = document.getElementById('docxProgress');
    const spinner = progressDiv?.querySelector('.progress-spinner');
    const text = progressDiv?.querySelector('.progress-text');
    
    if (progressDiv && spinner && text) {
        progressDiv.classList.add('success');
        spinner.textContent = '✓';
        text.textContent = 'Parsing complete!';
    }
}

// Function to hide DOCX parsing progress indicator
function hideDocxProgress() {
    const progressDiv = document.getElementById('docxProgress');
    
    if (progressDiv) {
        progressDiv.classList.add('hidden');
        // Reset to default state
        progressDiv.classList.remove('success');
        const spinner = progressDiv.querySelector('.progress-spinner');
        const text = progressDiv.querySelector('.progress-text');
        if (spinner) spinner.textContent = '⏳';
        if (text) text.textContent = 'Parsing document sections...';
    }
}

// Function to update the parsed sections UI
function updateParsedSectionsUI() {
    const link = document.getElementById('parsedSectionsLink');
    const unloadBtn = document.getElementById('unloadDOCX');
    const viewUnmatchedBtn = document.getElementById('viewUnmatchedCards');
    const sectionCount = parsedSections.length;
    
    if (sectionCount > 0) {
        link.textContent = `Parsed ${sectionCount} Section${sectionCount !== 1 ? 's' : ''}`;
        link.classList.remove('hidden');
        unloadBtn.classList.remove('hidden');
        viewUnmatchedBtn.classList.remove('hidden');
    } else {
        link.classList.add('hidden');
        unloadBtn.classList.add('hidden');
        viewUnmatchedBtn.classList.add('hidden');
    }
}

// Function to show parsed sections modal
function showParsedSectionsModal() {
    const modal = document.getElementById('sectionsModal');
    const sectionsList = document.getElementById('sectionsList');
    
    // Clear existing content
    sectionsList.innerHTML = '';
    
    // Populate sections
    parsedSections.forEach(section => {
        const li = document.createElement('li');
        li.className = `section-item section-level-${section.level}`;
        li.innerHTML = `<div class="section-header">${section.header}</div>`;
        sectionsList.appendChild(li);
    });
    
    modal.style.display = 'block';
}

// Set up modal event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Parsed sections link click handler
    document.getElementById('parsedSectionsLink').addEventListener('click', function(e) {
        e.preventDefault();
        showParsedSectionsModal();
    });
    
    // Modal close buttons
    document.querySelectorAll('.close-modal').forEach(function(button) {
        button.addEventListener('click', function() {
            // Find the closest modal and close it
            const modal = this.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // Click outside modal to close
    document.getElementById('sectionsModal').addEventListener('click', function(e) {
        if (e.target === this) {
            this.style.display = 'none';
        }
    });
    
    document.getElementById('metadataModal').addEventListener('click', function(e) {
        if (e.target === this) {
            this.style.display = 'none';
        }
    });
});

// Function to calculate position-weighted match score
function calculateMatchScore(text, searchTerms, positionWeight = true, cutoffPosition = null) {
    if (!text || !searchTerms || searchTerms.length === 0) return 0;
    
    // If cutoffPosition is provided, only consider text up to that position
    const effectiveText = cutoffPosition !== null ? text.substring(0, cutoffPosition) : text;
    const lowerText = effectiveText.toLowerCase();
    const textLength = lowerText.length;
    let totalScore = 0;
    
    // Split text into paragraphs for position weighting
    const paragraphs = effectiveText.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    
    searchTerms.forEach(term => {
        if (!term) return;
        const lowerTerm = term.toLowerCase();
        let position = lowerText.indexOf(lowerTerm);
        
        if (position !== -1) {
            // Base score for finding the term
            let score = 1;
            
            if (positionWeight && cutoffPosition === null) {
                // Find which paragraph contains this match
                let currentPos = 0;
                let paragraphIndex = 0;
                
                for (let i = 0; i < paragraphs.length; i++) {
                    const paraLength = paragraphs[i].length;
                    if (position >= currentPos && position < currentPos + paraLength) {
                        paragraphIndex = i;
                        break;
                    }
                    currentPos += paraLength + 2; // +2 for paragraph break
                }
                
                // Apply weighting based on paragraph number
                let positionFactor = 1.0;
                if (paragraphIndex < 3) {
                    // First 3 paragraphs get full weight
                    positionFactor = 1.0;
                } else {
                    // After paragraph 3, rapid exponential decay
                    // Paragraph 4: factor ≈ 0.37
                    // Paragraph 5: factor ≈ 0.14
                    // Paragraph 6: factor ≈ 0.05
                    const paragraphsAfter3 = paragraphIndex - 2;
                    positionFactor = Math.exp(-paragraphsAfter3);
                }
                
                score *= positionFactor;
            }
            
            totalScore += score;
        }
    });
    
    return totalScore;
}

// Function to create a unique signature for a card based on its content
function createCardSignature(card) {
    // Use header and first/last portions of content to create a signature
    const headerNorm = card.header ? card.header.trim().toLowerCase() : '';
    const fullText = (card.contentText || card.text || '').trim().toLowerCase();
    
    // Get first 100 and last 100 characters
    const first100 = fullText.substring(0, 100);
    const last100 = fullText.length > 100 ? fullText.substring(fullText.length - 100) : '';
    
    return `${headerNorm}|||${first100}|||${last100}`;
}

// Function to find matching card from imported history
function findMatchingCardFromHistory(currentCard) {
    if (!importedCardMatchingHistory || !importedCardMatchingHistory.manualCardMoves) {
        return null;
    }
    
    const currentSignature = createCardSignature(currentCard);
    
    // Look for a matching card in the manual moves
    for (const move of importedCardMatchingHistory.manualCardMoves) {
        const moveSignature = createCardSignature({
            header: move.cardHeader,
            contentText: move.cardText
        });
        
        if (currentSignature === moveSignature) {
            return move;
        }
    }
    
    return null;
}

// Function to check if a card was unlinked from a specific page
function wasCardUnlinked(card, pageUrl) {
    if (!importedCardMatchingHistory || !importedCardMatchingHistory.unlinkedCards) {
        return false;
    }
    
    const cardSignature = createCardSignature(card);
    
    // Check if this card-page combination was unlinked
    for (const unlinkedEntry of importedCardMatchingHistory.unlinkedCards) {
        if (unlinkedEntry.cardSignature === cardSignature && unlinkedEntry.pageUrl === pageUrl) {
            return true;
        }
    }
    
    return false;
}

// Function to check if a card was unlinked from all pages
function wasCardUnlinkedFromAll(card) {
    if (!importedCardMatchingHistory || !importedCardMatchingHistory.unlinkedFromAllCards) {
        return false;
    }
    
    const cardSignature = createCardSignature(card);
    
    // Check if this card was unlinked from all pages
    for (const unlinkedEntry of importedCardMatchingHistory.unlinkedFromAllCards) {
        if (unlinkedEntry.cardSignature === cardSignature) {
            return true;
        }
    }
    
    return false;
}

// Function to match cards to pages
function matchCardsToPages() {
    if (!sessionData || !sessionData.contentPages || parsedCards.length === 0) return;
    
    console.log('Matching cards to pages...', parsedCards.length, 'cards,', sessionData.contentPages.length, 'pages');
    
    // Reset all page cards
    sessionData.contentPages.forEach(page => {
        page.cards = [];
    });
    
    // Clear the unlinkedCards set since we're rebuilding from scratch
    unlinkedCards.clear();
    
    // Clear the unlinkedFromAllCards set and populate it from imported history
    unlinkedFromAllCards.clear();
    if (importedCardMatchingHistory && importedCardMatchingHistory.unlinkedFromAllCards) {
        parsedCards.forEach((card, cardIndex) => {
            if (wasCardUnlinkedFromAll(card)) {
                unlinkedFromAllCards.add(cardIndex.toString());
            }
        });
    }
    
    // Create a map to track which cards have been assigned
    const cardAssignments = new Map(); // cardIndex -> {pageIndex, score}
    
    // For each card, find the best matching pages
    parsedCards.forEach((card, cardIndex) => {
        // Skip cards that are unlinked from all pages
        if (unlinkedFromAllCards.has(cardIndex.toString())) {
            return;
        }
        const cardText = card.contentText;
        const cardHeader = card.header;
        
        // First, check if this card has a manual assignment from imported history
        const manualAssignment = findMatchingCardFromHistory(card);
        if (manualAssignment) {
            // Find the page with the matching URL
            const targetPageIndex = sessionData.contentPages.findIndex(p => p.url === manualAssignment.targetPageUrl);
            if (targetPageIndex !== -1) {
                console.log(`Restoring manual assignment for card "${cardHeader}" to page ${manualAssignment.targetPageUrl}`);
                cardAssignments.set(cardIndex, {
                    pageIndex: targetPageIndex,
                    score: manualAssignment.matchScore,
                    page: sessionData.contentPages[targetPageIndex],
                    matchDetails: manualAssignment.matchDetails
                });
                return; // Skip automatic matching for this card
            }
        }
        
        // Detect URL in card text - look for http:// or https://
        const urlRegex = /https?:\/\/[^\s]+/;
        const urlMatch = cardText.match(urlRegex);
        const urlCutoffPosition = urlMatch ? urlMatch.index : null;
        
        if (cardIndex === 0) {
            console.log('Sample card text (first 200 chars):', cardText.substring(0, 200));
            if (urlCutoffPosition !== null) {
                console.log('URL found at position:', urlCutoffPosition);
            }
        }
        
        // Score each page
        const pageScores = sessionData.contentPages.map((page, pageIndex) => {
            // First check if this card was unlinked from all pages
            if (unlinkedFromAllCards.has(cardIndex.toString())) {
                // Skip this page - the card was unlinked from all pages
                return { pageIndex, page, score: 0, matchDetails: null };
            }
            
            // Check if this card was unlinked from this specific page
            if (wasCardUnlinked(card, page.url)) {
                // Skip this page - the card was manually unlinked from it
                return { pageIndex, page, score: 0, matchDetails: null };
            }
            
            let score = 0;
            const matchDetails = {
                urlMatch: false,
                titleMatch: false,
                authorMatch: false,
                dateMatch: false,
                publicationMatch: false,
                weightingMethod: urlCutoffPosition !== null ? 'URL cutoff' : 'Position-based'
            };
            
            // Get page metadata
            const edited = editedMetadata[`page-${pageIndex}-0`] || {};
            const metadata = page.metadata || {};
            const pageTitle = edited.title || metadata.title || page.title || '';
            const pageUrl = page.url || '';
            const author = edited.author || metadata.author || '';
            const authors = edited.authors || metadata.authors || [];
            const publishDate = edited.publishDate || metadata.publishDate || '';
            const publisher = edited.publisher || metadata.publisher || '';
            const journal = edited.journal || metadata.journal || '';
            const publicationInfo = edited.publicationInfo || metadata.publicationInfo || '';
            const pages = edited.pages || metadata.pages || '';
            
            if (cardIndex === 0 && pageIndex === 0) {
                console.log('Sample page metadata:', {
                    title: pageTitle,
                    url: pageUrl,
                    author: author,
                    authors: authors,
                    publishDate: publishDate,
                    publisher: publisher,
                    journal: journal
                });
            }
            
            // Check URL match (highest priority)
            if (pageUrl) {
                const urlParts = pageUrl.split(/[\/\-\._?#&=]/).filter(p => p.length > 3);
                const urlScore = calculateMatchScore(cardText, urlParts, true, urlCutoffPosition);
                if (urlScore > 0) {
                    score += urlScore * 3; // Triple weight for URL matches
                    matchDetails.urlMatch = true;
                }
            }
            
            // Check title match (high priority)
            if (pageTitle) {
                const titleWords = pageTitle.split(/\s+/).filter(w => w.length > 3);
                const titleScore = calculateMatchScore(cardText, titleWords, true, urlCutoffPosition);
                if (titleScore > 0) {
                    score += titleScore * 2; // Double weight for title matches
                    matchDetails.titleMatch = true;
                }
            }
            
            // Check author match
            const allAuthors = [author, ...authors].filter(a => a);
            if (allAuthors.length > 0) {
                const authorScore = calculateMatchScore(cardText, allAuthors, true, urlCutoffPosition);
                if (authorScore > 0) {
                    score += authorScore;
                    matchDetails.authorMatch = true;
                }
            }
            
            // Check date match
            if (publishDate) {
                const dateVariations = [
                    publishDate,
                    publishDate.replace(/-/g, '/'),
                    publishDate.replace(/-/g, ' ')
                ];
                const dateScore = calculateMatchScore(cardText, dateVariations, true, urlCutoffPosition);
                if (dateScore > 0) {
                    score += dateScore;
                    matchDetails.dateMatch = true;
                }
            }
            
            // Check publication match (publisher or journal)
            const publications = [publisher, journal].filter(p => p);
            if (publications.length > 0) {
                const pubScore = calculateMatchScore(cardText, publications, true, urlCutoffPosition);
                if (pubScore > 0) {
                    score += pubScore;
                    matchDetails.publicationMatch = true;
                }
            }
            
            // Strong bonuses for combinatorial matches
            if (matchDetails.authorMatch && matchDetails.dateMatch && matchDetails.publicationMatch) {
                score += 15; // Large bonus for author + date + publication match
            }
            
            if (matchDetails.urlMatch && matchDetails.titleMatch) {
                score += 20; // Very large bonus for URL + title match
            }
            
            return {
                pageIndex: pageIndex,
                page: page,
                score: score,
                matchDetails: matchDetails
            };
        });
        
        // Sort by score and get matches above threshold
        const threshold = 1.5; // Minimum score to consider a match
        const validMatches = pageScores
            .filter(ps => ps.score >= threshold)
            .sort((a, b) => b.score - a.score);
        
        if (validMatches.length > 0) {
            // Find the best match
            const bestMatch = validMatches[0];
            
            // Check if this card was already assigned to a different page
            const existingAssignment = cardAssignments.get(cardIndex);
            
            if (!existingAssignment || existingAssignment.score < bestMatch.score) {
                // This is a better match, update assignment
                cardAssignments.set(cardIndex, {
                    pageIndex: bestMatch.pageIndex,
                    score: bestMatch.score,
                    page: bestMatch.page,
                    matchDetails: bestMatch.matchDetails
                });
            }
        }
    });
    
    // Now assign cards to pages based on the best matches
    cardAssignments.forEach((assignment, cardIndex) => {
        const card = parsedCards[cardIndex];
        const page = assignment.page;
        
        if (!page.cards) {
            page.cards = [];
        }
        
        page.cards.push({
            header: card.header,
            content: card.content,
            contentText: card.contentText,
            matchScore: assignment.score,
            matchDetails: assignment.matchDetails,
            cardIndex: cardIndex // Store for potential unlinking
        });
    });
    
    // Group pages by URL to handle same-URL pages
    const pagesByUrl = new Map();
    sessionData.contentPages.forEach((page, index) => {
        const url = page.url;
        if (!pagesByUrl.has(url)) {
            pagesByUrl.set(url, []);
        }
        pagesByUrl.get(url).push({page, index});
    });
    
    // For pages with the same URL, ensure they have the same cards
    pagesByUrl.forEach((pages, url) => {
        if (pages.length > 1) {
            // Combine all cards from all pages with this URL
            const allCards = [];
            pages.forEach(({page}) => {
                if (page.cards) {
                    allCards.push(...page.cards);
                }
            });
            
            // Remove duplicates based on cardIndex
            const uniqueCards = Array.from(
                new Map(allCards.map(card => [card.cardIndex, card])).values()
            );
            
            // Assign the same cards to all pages with this URL
            pages.forEach(({page}) => {
                page.cards = [...uniqueCards];
            });
        }
    });
    
    // Apply quality filtering - if a page has very high matches, remove low quality ones
    sessionData.contentPages.forEach(page => {
        if (page.cards && page.cards.length > 0) {
            const maxScore = Math.max(...page.cards.map(c => c.matchScore));
            
            // If there's an extremely good match (>40), filter out weak matches
            if (maxScore > 40) {
                const threshold = maxScore * 0.7; // Keep only matches within 70% of the best
                page.cards = page.cards.filter(card => card.matchScore >= threshold);
            }
        }
    });
    
    // Log matching results
    let totalMatches = 0;
    sessionData.contentPages.forEach(page => {
        if (page.cards && page.cards.length > 0) {
            totalMatches += page.cards.length;
        }
    });
    console.log('Card matching complete. Total matches:', totalMatches);
    
    // Restore unlinked cards tracking based on imported history
    if (importedCardMatchingHistory && importedCardMatchingHistory.unlinkedCards) {
        parsedCards.forEach((card, cardIndex) => {
            const cardSignature = createCardSignature(card);
            importedCardMatchingHistory.unlinkedCards.forEach(unlinkedEntry => {
                if (unlinkedEntry.cardSignature === cardSignature) {
                    // Add to current unlinkedCards set using the new card index
                    unlinkedCards.add(`${cardIndex}-${unlinkedEntry.pageUrl}`);
                }
            });
        });
        console.log('Restored unlinked cards:', unlinkedCards.size);
    }
    
    // Update the timeline to reflect card counts
    updateTimeline();
}

// Function to rematch cards to pages with respect for manual moves and unlinks
function rematchCardsToPages() {
    if (!sessionData || !sessionData.contentPages || parsedCards.length === 0) {
        showRematchError('No session data or cards available for rematching.');
        return;
    }
    
    // Show progress indicator
    showRematchProgress();
    
    // Use setTimeout to allow UI to update before starting intensive work
    setTimeout(() => {
        try {
            console.log('Rematching cards to pages...');
    
    // Store current manual assignments before clearing
    const manualAssignments = new Map(); // cardIndex -> {pageUrl, matchScore, matchFields}
    
    sessionData.contentPages.forEach(page => {
        if (page.cards) {
            page.cards.forEach(card => {
                // Preserve manual moves
                if (card.matchDetails && card.matchDetails.weightingMethod === 'Manual') {
                    manualAssignments.set(card.cardIndex, {
                        pageUrl: page.url,
                        matchScore: card.matchScore,
                        matchFields: card.matchDetails
                    });
                }
            });
        }
    });
    
    // Clear all page cards
    sessionData.contentPages.forEach(page => {
        page.cards = [];
    });
    
    // Create a map to track which cards have been assigned
    const cardAssignments = new Map(); // cardIndex -> {pageIndex, score}
    
    // For each card, find the best matching pages
    parsedCards.forEach((card, cardIndex) => {
        // Check if this card has a manual assignment
        if (manualAssignments.has(cardIndex)) {
            const manualData = manualAssignments.get(cardIndex);
            // Find the page with matching URL
            const targetPage = sessionData.contentPages.find(p => p.url === manualData.pageUrl);
            if (targetPage) {
                const cardData = {
                    ...card,
                    cardIndex: cardIndex,
                    matchScore: manualData.matchScore,
                    matchDetails: manualData.matchFields
                };
                targetPage.cards.push(cardData);
                console.log(`Preserved manual assignment: Card ${cardIndex} to page ${manualData.pageUrl}`);
                return; // Skip automatic matching for this card
            }
        }
        
        // Perform automatic matching for non-manual cards
        const cardText = card.contentText;
        const cardHeader = card.header;
        
        // Detect URL in card text
        const urlRegex = /https?:\/\/[^\s]+/;
        const urlMatch = cardText.match(urlRegex);
        const urlCutoffPosition = urlMatch ? urlMatch.index : null;
        
        // Score each page
        const pageScores = sessionData.contentPages.map((page, pageIndex) => {
            // Check if this card-page combination was previously unlinked
            const unlinkedKey = `${cardIndex}-${page.url}`;
            if (unlinkedCards.has(unlinkedKey)) {
                return { pageIndex, score: -1, matchDetails: null }; // Exclude unlinked combinations
            }
            
            let score = 0;
            const matchDetails = {
                urlMatch: false,
                titleMatch: false,
                authorMatch: false,
                dateMatch: false,
                publicationMatch: false,
                weightingMethod: urlCutoffPosition !== null ? 'URL cutoff' : 'Position-based'
            };
            
            // Get page metadata (including edited metadata)
            const edited = editedMetadata[`page-${pageIndex}-0`] || {};
            const metadata = page.metadata || {};
            const pageTitle = edited.title || metadata.title || page.title || '';
            const pageUrl = page.url || '';
            const author = edited.author || metadata.author || '';
            const authors = edited.authors || metadata.authors || [];
            const publishDate = edited.publishDate || metadata.publishDate || '';
            const journal = edited.journal || metadata.journal || '';
            const publisher = edited.publisher || metadata.publisher || '';
            
            // URL matching logic (same as original)
            try {
                const cardUrlParts = cardHeader.toLowerCase().split(' ');
                const pageUrlObj = new URL(pageUrl);
                const pageDomain = pageUrlObj.hostname.toLowerCase();
                
                const hasUrlMatch = cardUrlParts.some(part => 
                    part.length > 3 && pageDomain.includes(part.replace(/[^a-z0-9]/g, ''))
                );
                
                if (hasUrlMatch) {
                    score += 3;
                    matchDetails.urlMatch = true;
                }
            } catch (e) {
                // Invalid URL, skip URL matching
            }
            
            // Title matching
            if (pageTitle && cardHeader) {
                const titleWords = pageTitle.toLowerCase().split(/\s+/);
                const cardWords = cardHeader.toLowerCase().split(/\s+/);
                
                let commonWords = 0;
                titleWords.forEach(word => {
                    if (word.length > 3 && cardWords.some(cWord => cWord.includes(word) || word.includes(cWord))) {
                        commonWords++;
                    }
                });
                
                if (commonWords > 0) {
                    score += Math.min(commonWords * 2, 8);
                    matchDetails.titleMatch = true;
                }
            }
            
            // Author matching
            const allAuthors = [author, ...authors].filter(Boolean);
            if (allAuthors.length > 0 && cardText) {
                const cardTextLower = cardText.toLowerCase();
                const hasAuthorMatch = allAuthors.some(authorName => {
                    const nameParts = authorName.toLowerCase().split(/\s+/);
                    return nameParts.some(part => part.length > 2 && cardTextLower.includes(part));
                });
                
                if (hasAuthorMatch) {
                    score += 4;
                    matchDetails.authorMatch = true;
                }
            }
            
            // Date matching
            if (publishDate && cardText) {
                const year = publishDate.substring(0, 4);
                if (year && cardText.includes(year)) {
                    score += 2;
                    matchDetails.dateMatch = true;
                }
            }
            
            // Publication matching
            const publications = [journal, publisher].filter(Boolean);
            if (publications.length > 0 && cardText) {
                const cardTextLower = cardText.toLowerCase();
                const hasPublicationMatch = publications.some(pub => {
                    const pubWords = pub.toLowerCase().split(/\s+/);
                    return pubWords.some(word => word.length > 3 && cardTextLower.includes(word));
                });
                
                if (hasPublicationMatch) {
                    score += 3;
                    matchDetails.publicationMatch = true;
                }
            }
            
            return { pageIndex, score, matchDetails };
        }).filter(result => result.score >= 0); // Filter out unlinked combinations
        
        // Find the best match
        if (pageScores.length > 0) {
            const bestMatch = pageScores.reduce((best, current) => current.score > best.score ? current : best);
            
            if (bestMatch.score >= 2) { // Minimum threshold
                cardAssignments.set(cardIndex, bestMatch);
            }
        }
    });
    
    // Apply the assignments
    cardAssignments.forEach((assignment, cardIndex) => {
        const page = sessionData.contentPages[assignment.pageIndex];
        const card = parsedCards[cardIndex];
        
        if (page && card) {
            const cardData = {
                ...card,
                cardIndex: cardIndex,
                matchScore: assignment.score,
                matchDetails: assignment.matchDetails
            };
            
            page.cards.push(cardData);
        }
    });
    
    // Update the timeline to reflect changes
    updateTimeline();
    
    // Show results
    let totalMatches = 0;
    let manualCount = manualAssignments.size;
    sessionData.contentPages.forEach(page => {
        if (page.cards && page.cards.length > 0) {
            totalMatches += page.cards.length;
        }
    });
    
            // Show success state, then hide after delay
            showRematchSuccess(totalMatches, manualCount, unlinkedCards.size);
            setTimeout(() => {
                hideRematchProgress();
            }, 3000); // Show success for 3 seconds
            
        } catch (error) {
            console.error('Error during rematch:', error);
            showRematchError('Error occurred during rematching. Please try again.');
        }
    }, 100); // Small delay to allow UI update
}

// Function to show rematch progress indicator
function showRematchProgress() {
    const progressDiv = document.getElementById('rematchProgress');
    const button = document.getElementById('rematchCards');
    
    if (progressDiv) {
        progressDiv.classList.remove('hidden', 'success', 'error');
        progressDiv.querySelector('.progress-text').textContent = 'Rematching cards to pages...';
        progressDiv.querySelector('.progress-spinner').textContent = '⏳';
    }
    
    if (button) {
        button.disabled = true;
    }
}

// Function to show rematch success state
function showRematchSuccess(totalMatches, manualCount, unlinkedCount) {
    const progressDiv = document.getElementById('rematchProgress');
    const spinner = progressDiv?.querySelector('.progress-spinner');
    const text = progressDiv?.querySelector('.progress-text');
    
    if (progressDiv && spinner && text) {
        progressDiv.classList.add('success');
        spinner.textContent = '✓';
        text.textContent = `Rematch complete! ${totalMatches} matches (${manualCount} manual preserved, ${unlinkedCount} unlinks respected)`;
    }
}

// Function to show rematch error state
function showRematchError(errorMessage) {
    const progressDiv = document.getElementById('rematchProgress');
    const spinner = progressDiv?.querySelector('.progress-spinner');
    const text = progressDiv?.querySelector('.progress-text');
    
    if (progressDiv && spinner && text) {
        progressDiv.classList.add('error');
        spinner.textContent = '✗';
        text.textContent = errorMessage;
    }
    
    // Auto-hide error after 5 seconds
    setTimeout(() => {
        hideRematchProgress();
    }, 5000);
}

// Function to hide rematch progress indicator
function hideRematchProgress() {
    const progressDiv = document.getElementById('rematchProgress');
    const button = document.getElementById('rematchCards');
    
    if (progressDiv) {
        progressDiv.classList.add('hidden');
        // Reset to default state
        progressDiv.classList.remove('success', 'error');
        progressDiv.querySelector('.progress-text').textContent = 'Rematching cards to pages...';
        progressDiv.querySelector('.progress-spinner').textContent = '⏳';
    }
    
    if (button) {
        button.disabled = false;
    }
}

// Function to view cards associated with a page
function viewCards(pageId, page) {
    if (!page.cards || page.cards.length === 0) {
        alert('No cards matched to this page.');
        return;
    }
    
    // Create and show modal with cards
    showCardsModal(pageId, page);
}

// Function to update page metadata display in cards modal
function updatePageMetadataDisplay(page, pageId) {
    const metadataContainer = document.getElementById('pageMetadataContent');
    if (!metadataContainer) return;
    
    metadataContainer.innerHTML = '';
    
    // Get metadata (including any edited metadata)
    const edited = editedMetadata[pageId] || {};
    const original = page.metadata || {};
    
    // Helper function to get the current value (edited or original)
    const getValue = (field) => edited[field] || original[field];
    
    // Create metadata items
    const metadataFields = [
        { key: 'title', label: 'Title' },
        { key: 'author', label: 'Author' },
        { key: 'authors', label: 'Authors' },
        { key: 'publishDate', label: 'Published' },
        { key: 'journal', label: 'Journal' },
        { key: 'publisher', label: 'Publisher' },
        { key: 'doi', label: 'Identifier' },
        { key: 'contentType', label: 'Type' }
    ];
    
    metadataFields.forEach(({ key, label }) => {
        const value = getValue(key);
        if (value) {
            const metadataItem = document.createElement('div');
            metadataItem.className = 'metadata-item-compact';
            
            const metadataLabel = document.createElement('span');
            metadataLabel.className = 'metadata-label-compact';
            metadataLabel.textContent = `${label}:`;
            
            const metadataValue = document.createElement('span');
            metadataValue.className = 'metadata-value-compact';
            
            // Handle arrays (like authors)
            const displayValue = Array.isArray(value) ? value.join(', ') : String(value);
            
            // Use expandable text for long values
            if (displayValue && displayValue.length > 150) {
                const expandableText = createExpandableText(displayValue, 150);
                metadataValue.appendChild(expandableText);
            } else {
                metadataValue.textContent = displayValue;
            }
            
            metadataItem.appendChild(metadataLabel);
            metadataItem.appendChild(metadataValue);
            metadataContainer.appendChild(metadataItem);
        }
    });
    
    // If no metadata available
    if (metadataContainer.children.length === 0) {
        const noMetadata = document.createElement('div');
        noMetadata.className = 'no-metadata';
        noMetadata.textContent = 'No metadata available';
        metadataContainer.appendChild(noMetadata);
    }
}

// Function to show cards modal
function showCardsModal(pageId, page) {
    // Create modal if it doesn't exist
    let modal = document.getElementById('cardsModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'cardsModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content cards-modal-content">
                <div class="modal-header">
                    <h3>Cards from: <span id="cardsPageTitle"></span></h3>
                    <button class="close-modal" onclick="document.getElementById('cardsModal').style.display='none'">&times;</button>
                </div>
                <div class="cards-modal-body">
                    <div class="cards-left-panel">
                        <div class="page-metadata-display" id="pageMetadataDisplay">
                            <h4>Page Metadata</h4>
                            <div id="pageMetadataContent" class="page-metadata-content"></div>
                        </div>
                        <nav class="cards-nav">
                            <h4>Cards</h4>
                            <ul id="cardsNavList"></ul>
                        </nav>
                    </div>
                    <div id="cardsContent" class="cards-content-area"></div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Click outside to close
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
        
        // Escape key to close
        const escapeHandler = function(e) {
            if (e.key === 'Escape' && modal.style.display === 'block') {
                modal.style.display = 'none';
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);
    }
    
    // Update modal content
    const pageTitle = (page.metadata && page.metadata.title) || page.title || 'Unknown Page';
    document.getElementById('cardsPageTitle').textContent = pageTitle;
    
    // Update page metadata display
    updatePageMetadataDisplay(page, pageId);
    
    const cardsContent = document.getElementById('cardsContent');
    cardsContent.innerHTML = '';
    
    // Sort cards by match score (highest first)
    const sortedCards = page.cards.slice().sort(function(a, b) { return b.matchScore - a.matchScore; });
    
    // Build navigation list
    const navList = document.getElementById('cardsNavList');
    navList.innerHTML = '';
    
    sortedCards.forEach((card, index) => {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card-item';
        cardDiv.id = `card-${index}`;
        
        // Add to navigation
        const navItem = document.createElement('li');
        navItem.className = 'cards-nav-item';
        navItem.innerHTML = `<a href="#card-${index}" onclick="document.getElementById('card-${index}').scrollIntoView({behavior: 'smooth', block: 'start'}); return false;">${card.header}</a>`;
        navList.appendChild(navItem);
        
        // Create match details string
        const matchTypes = [];
        if (card.matchDetails.urlMatch) matchTypes.push('URL');
        if (card.matchDetails.titleMatch) matchTypes.push('Title');
        if (card.matchDetails.authorMatch) matchTypes.push('Author');
        if (card.matchDetails.dateMatch) matchTypes.push('Date');
        if (card.matchDetails.publicationMatch) matchTypes.push('Publication');
        
        const weightingMethod = card.matchDetails.weightingMethod || 'Unknown';
        
        cardDiv.innerHTML = `
            <div class="card-header">
                <h4>${card.header}</h4>
                <div class="match-info">
                    <div class="match-details">
                        <span class="match-score">Score: ${card.matchScore.toFixed(2)}</span>
                        <span class="match-types">Matched: ${matchTypes.join(', ')}</span>
                        <span class="weighting-method">Method: ${weightingMethod}</span>
                    </div>
                    <div class="card-actions">
                        <button class="move-card-btn" data-page-id="${pageId}" data-card-index="${card.cardIndex !== undefined ? card.cardIndex : index}" data-card-header="${card.header.replace(/"/g, '&quot;')}">Move</button>
                        <button class="unlink-card-btn" onclick="unlinkCard('${pageId}', ${card.cardIndex !== undefined ? card.cardIndex : index})">Unlink from Page</button>
                        <button class="unlink-all-card-btn" onclick="unlinkCardFromAll('${pageId}', ${card.cardIndex !== undefined ? card.cardIndex : index})">Unlink from All</button>
                    </div>
                </div>
            </div>
            <div class="card-content">${card.content}</div>
        `;
        
        cardsContent.appendChild(cardDiv);
    });
    
    // Add event listeners for move buttons
    const moveButtons = cardsContent.querySelectorAll('.move-card-btn');
    moveButtons.forEach(button => {
        button.addEventListener('click', function() {
            const pageId = this.dataset.pageId;
            const cardIndex = parseInt(this.dataset.cardIndex);
            const cardHeader = this.dataset.cardHeader;
            showMoveCardModal(pageId, cardIndex, cardHeader);
        });
    });
    
    // Add escape key handler each time modal is shown
    const escapeHandler = function(e) {
        if (e.key === 'Escape') {
            modal.style.display = 'none';
            document.removeEventListener('keydown', escapeHandler);
        }
    };
    document.addEventListener('keydown', escapeHandler);
    
    modal.style.display = 'block';
}

// Function to unlink a card from a page
function unlinkCard(pageId, cardIndex) {
    // Find the page
    let targetPage = null;
    
    // Check if it's an orphaned page
    if (pageId.startsWith('orphan-')) {
        const orphanIndex = parseInt(pageId.split('-')[1]);
        targetPage = sessionData.contentPages.filter(p => !p.sourceSearch)[orphanIndex];
    } else {
        // It's a grouped page
        const [_, groupIndex, pageIndex] = pageId.split('-').map(Number);
        const groups = groupSearchesAndPages();
        if (groups[groupIndex] && groups[groupIndex].pages[pageIndex]) {
            targetPage = groups[groupIndex].pages[pageIndex];
        }
    }
    
    if (!targetPage || !targetPage.cards) {
        alert('Page not found.');
        return;
    }
    
    // Find the card by cardIndex (unique identifier) or use as array index for backward compatibility
    let cardIndexInPage;
    if (typeof cardIndex === 'number' && cardIndex < targetPage.cards.length && targetPage.cards[cardIndex].cardIndex === undefined) {
        // Legacy behavior: cardIndex is actually an array index
        cardIndexInPage = cardIndex;
    } else {
        // New behavior: cardIndex is a unique identifier
        cardIndexInPage = targetPage.cards.findIndex(card => card.cardIndex === cardIndex);
        if (cardIndexInPage === -1) {
            alert('Card not found.');
            return;
        }
    }
    
    // Store the card data for undo
    const removedCard = targetPage.cards[cardIndexInPage];
    const affectedPages = [];
    
    // Remove the card from the target page
    targetPage.cards.splice(cardIndexInPage, 1);
    affectedPages.push({
        page: targetPage,
        pageId: pageId
    });
    
    // If this page shares a URL with other pages, update them too
    const pageUrl = targetPage.url;
    sessionData.contentPages.forEach((page, idx) => {
        if (page !== targetPage && page.url === pageUrl && page.cards) {
            // Find and remove the same card from pages with the same URL
            const cardIndex = page.cards.findIndex(c => 
                c.cardIndex === removedCard.cardIndex
            );
            if (cardIndex !== -1) {
                page.cards.splice(cardIndex, 1);
                
                // Determine the pageId for this page
                let thisPageId;
                if (!page.sourceSearch) {
                    const orphanIndex = sessionData.contentPages.filter(p => !p.sourceSearch).indexOf(page);
                    thisPageId = `orphan-${orphanIndex}`;
                } else {
                    // Find this page in the grouped structure
                    const groups = groupSearchesAndPages();
                    for (let gIdx = 0; gIdx < groups.length; gIdx++) {
                        const pIdx = groups[gIdx].pages.indexOf(page);
                        if (pIdx !== -1) {
                            thisPageId = `page-${gIdx}-${pIdx}`;
                            break;
                        }
                    }
                }
                
                if (thisPageId) {
                    affectedPages.push({
                        page: page,
                        pageId: thisPageId
                    });
                }
            }
        }
    });
    
    // Track unlinked card-page combinations
    affectedPages.forEach(pageInfo => {
        const unlinkedKey = `${removedCard.cardIndex}-${pageInfo.page.url}`;
        unlinkedCards.add(unlinkedKey);
    });
    
    // Track action for undo
    lastAction = {
        type: 'unlinkCard',
        card: removedCard,
        affectedPages: affectedPages,
        primaryPageId: pageId
    };
    enableUndoButton();
    
    // Update the modal
    showCardsModal(pageId, targetPage);
    
    // Update the timeline to reflect the change
    updateTimeline();
}

// Function to unlink a card from all pages
function unlinkCardFromAll(pageId, cardIndex) {
    // Find the source page for modal refresh
    let targetPage = null;
    
    // Check if it's an orphaned page
    if (pageId.startsWith('orphan-')) {
        const orphanIndex = parseInt(pageId.split('-')[1]);
        targetPage = sessionData.contentPages.filter(p => !p.sourceSearch)[orphanIndex];
    } else {
        // It's a grouped page
        const [_, groupIndex, pageIndex] = pageId.split('-').map(Number);
        const groups = groupSearchesAndPages();
        if (groups[groupIndex] && groups[groupIndex].pages[pageIndex]) {
            targetPage = groups[groupIndex].pages[pageIndex];
        }
    }
    
    // Add to unlinked from all set
    unlinkedFromAllCards.add(cardIndex.toString());
    
    // Remove the card from all pages that have it
    const affectedPages = [];
    sessionData.contentPages.forEach((page, idx) => {
        if (page.cards) {
            const cardIndexInPage = page.cards.findIndex(c => c.cardIndex === cardIndex);
            if (cardIndexInPage !== -1) {
                const removedCard = page.cards[cardIndexInPage];
                page.cards.splice(cardIndexInPage, 1);
                
                // Determine the pageId for this page
                let pageId;
                if (!page.sourceSearch) {
                    const orphanIndex = sessionData.contentPages.filter(p => !p.sourceSearch).indexOf(page);
                    pageId = `orphan-${orphanIndex}`;
                } else {
                    // Find this page in the grouped structure
                    const groups = groupSearchesAndPages();
                    for (let gIdx = 0; gIdx < groups.length; gIdx++) {
                        const pIdx = groups[gIdx].pages.indexOf(page);
                        if (pIdx !== -1) {
                            pageId = `page-${gIdx}-${pIdx}`;
                            break;
                        }
                    }
                }
                
                affectedPages.push({
                    page: page,
                    pageId: pageId,
                    card: removedCard
                });
            }
        }
    });
    
    // Track action for undo
    lastAction = {
        type: 'unlinkCardFromAll',
        cardIndex: cardIndex,
        affectedPages: affectedPages
    };
    enableUndoButton();
    
    // Update the modal and timeline (same pattern as unlinkCard)
    if (targetPage) {
        showCardsModal(pageId, targetPage);
    }
    updateTimeline();
}

// Function to show unmatched cards modal
function showUnmatchedCardsModal() {
    if (!parsedCards || parsedCards.length === 0) {
        alert('No cards have been parsed from a DOCX file.');
        return;
    }
    
    // Check if modal already exists and remove it
    const existingModal = document.getElementById('unmatchedCardsModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Get all unmatched cards (cards not linked to any page)
    const unmatchedCards = parsedCards.filter((card, index) => {
        // Check if card is unlinked from all
        if (unlinkedFromAllCards.has(index.toString())) {
            return true;
        }
        
        // Check if card is linked to any page
        let isLinkedToAnyPage = false;
        if (sessionData && sessionData.contentPages) {
            sessionData.contentPages.forEach(page => {
                if (page.cards && page.cards.some(c => c.cardIndex === index)) {
                    isLinkedToAnyPage = true;
                }
            });
        }
        
        return !isLinkedToAnyPage;
    });
    
    if (unmatchedCards.length === 0) {
        alert('All cards are currently matched to pages.');
        return;
    }
    
    // Create the modal
    const modal = document.createElement('div');
    modal.id = 'unmatchedCardsModal';
    modal.className = 'modal';
    
    modal.innerHTML = `
        <div class="modal-content cards-modal-content">
            <div class="modal-header">
                <h3>Cards with No Match (${unmatchedCards.length})</h3>
                <button class="close-modal" onclick="document.getElementById('unmatchedCardsModal').style.display='none'">&times;</button>
            </div>
            <div class="cards-modal-body">
                <div class="cards-left-panel">
                    <nav class="cards-nav">
                        <h4>Cards</h4>
                        <ul id="unmatchedCardsNav"></ul>
                    </nav>
                </div>
                <div id="unmatchedCardsContent" class="cards-content-area"></div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close functionality (close button already has onclick in the HTML)
    
    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
    
    // Handle escape key
    const escapeHandler = (event) => {
        if (event.key === 'Escape') {
            modal.style.display = 'none';
            document.removeEventListener('keydown', escapeHandler);
        }
    };
    document.addEventListener('keydown', escapeHandler);
    
    // Populate cards
    const navList = document.getElementById('unmatchedCardsNav');
    const cardsContent = document.getElementById('unmatchedCardsContent');
    
    unmatchedCards.forEach((card, displayIndex) => {
        // Get the original card index
        const originalIndex = parsedCards.findIndex(c => c === card);
        
        // Create card element
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card-item';
        cardDiv.id = `unmatched-card-${displayIndex}`;
        
        // Add to navigation
        const navItem = document.createElement('li');
        navItem.className = 'cards-nav-item';
        navItem.innerHTML = `<a href="#unmatched-card-${displayIndex}" onclick="document.getElementById('unmatched-card-${displayIndex}').scrollIntoView({behavior: 'smooth', block: 'start'}); return false;">${card.header}</a>`;
        navList.appendChild(navItem);
        
        cardDiv.innerHTML = `
            <div class="card-header">
                <h4>${card.header}</h4>
                <div class="match-info">
                    <div class="match-details">
                        <span class="match-status">Status: Unmatched</span>
                    </div>
                    <div class="card-actions">
                        <button class="move-card-btn" data-card-index="${originalIndex}" data-card-header="${card.header.replace(/"/g, '&quot;')}">Link to Page</button>
                    </div>
                </div>
            </div>
            <div class="card-content">${card.content}</div>
        `;
        
        cardsContent.appendChild(cardDiv);
    });
    
    // Add event listeners for move buttons
    const moveButtons = cardsContent.querySelectorAll('.move-card-btn');
    moveButtons.forEach(button => {
        button.addEventListener('click', function() {
            const cardIndex = parseInt(this.dataset.cardIndex);
            const cardHeader = this.dataset.cardHeader;
            
            // Show move card modal
            showMoveCardModal(null, cardIndex, cardHeader, () => {
                // Refresh timeline and reopen the unmatched cards modal after move
                updateTimeline();
                // Small delay to ensure timeline is updated before reopening modal
                setTimeout(() => {
                    showUnmatchedCardsModal();
                }, 100);
            });
        });
    });
    
    // Show the modal
    modal.style.display = 'block';
}

// Function to create metadata tooltip content
function createMetadataTooltip(metadata, page) {
    const items = [];
    
    // Helper function to add metadata field if it exists
    const addField = (label, value) => {
        if (value && value.trim()) {
            // Limit each field to reasonable length for tooltip
            const truncatedValue = value.length > 100 ? value.substring(0, 97) + '...' : value;
            items.push(`${label}: ${truncatedValue}`);
        }
    };
    
    // Add metadata fields
    addField('Title', metadata.title);
    
    // Handle authors array or single author
    if (metadata.authors && Array.isArray(metadata.authors)) {
        addField('Authors', metadata.authors.join(', '));
    } else if (metadata.author) {
        addField('Author', metadata.author);
    }
    
    addField('Journal', metadata.journal);
    addField('Publisher', metadata.publisher);
    addField('Publication Date', metadata.publishDate);
    addField('DOI', metadata.doi);
    addField('Content Type', metadata.contentType);
    
    // Add URL as fallback
    if (items.length === 0) {
        try {
            const url = new URL(page.url);
            items.push(`URL: ${url.hostname}`);
        } catch (e) {
            items.push('No metadata available');
        }
    }
    
    return items.join('\n');
}

// Function to position tooltip near mouse cursor
function positionTooltip(event, tooltip) {
    const padding = 15;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Get tooltip dimensions
    const tooltipRect = tooltip.getBoundingClientRect();
    const tooltipWidth = tooltipRect.width;
    const tooltipHeight = tooltipRect.height;
    
    // Calculate position
    let left = event.clientX + padding;
    let top = event.clientY - tooltipHeight / 2;
    
    // Adjust if tooltip would go off screen to the right
    if (left + tooltipWidth > viewportWidth - padding) {
        left = event.clientX - tooltipWidth - padding;
    }
    
    // Adjust if tooltip would go off screen vertically
    if (top < padding) {
        top = padding;
    } else if (top + tooltipHeight > viewportHeight - padding) {
        top = viewportHeight - tooltipHeight - padding;
    }
    
    tooltip.style.left = left + 'px';
    tooltip.style.top = top + 'px';
}

// Function to extract the cite from a card based on matching method
function extractCardCite(card) {
    if (!card.content) {
        return '<em>No content available</em>';
    }
    
    // Create a temporary div to parse the HTML content
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = card.content;
    
    // Get all paragraphs
    const paragraphs = tempDiv.querySelectorAll('p');
    
    if (paragraphs.length === 0) {
        return '<em>No paragraphs found</em>';
    }
    
    // Always use first paragraph method for cite extraction
    return paragraphs[0].outerHTML;
}

// Function to show modal for moving a card to another page
function showMoveCardModal(sourcePageId, cardIndex, cardHeader, successCallback) {
    // Get the card data
    let sourceCard = null;
    let sourcePage = null;
    let cardArrayIndex = -1;
    
    // Handle case where card is unmatched (no source page)
    if (sourcePageId === null || sourcePageId === undefined) {
        // For unmatched cards, get the card from parsedCards
        sourceCard = parsedCards[cardIndex];
        cardArrayIndex = cardIndex; // For unmatched cards, use the cardIndex directly
        if (!sourceCard) {
            alert('Card not found.');
            return;
        }
    } else {
        // Find the source page and card
        if (sourcePageId.startsWith('orphan-')) {
            const orphanIndex = parseInt(sourcePageId.split('-')[1]);
            sourcePage = sessionData.contentPages.filter(p => !p.sourceSearch)[orphanIndex];
        } else {
            const [_, groupIndex, pageIndex] = sourcePageId.split('-').map(Number);
            const groups = groupSearchesAndPages();
            if (groups[groupIndex] && groups[groupIndex].pages[pageIndex]) {
                sourcePage = groups[groupIndex].pages[pageIndex];
            }
        }
        
        if (!sourcePage || !sourcePage.cards) {
            alert('Source page not found.');
            return;
        }
    }
    
    // Find the card by cardIndex (only for cards that are already linked to pages)
    if (sourcePage && sourcePage.cards) {
        if (typeof cardIndex === 'number' && cardIndex < sourcePage.cards.length && sourcePage.cards[cardIndex].cardIndex === undefined) {
            // Legacy behavior: cardIndex is actually an array index
            cardArrayIndex = cardIndex;
        } else {
            // New behavior: cardIndex is a unique identifier
            cardArrayIndex = sourcePage.cards.findIndex(card => card.cardIndex === cardIndex);
            if (cardArrayIndex === -1) {
                alert('Card not found.');
                return;
            }
        }
        
        sourceCard = sourcePage.cards[cardArrayIndex];
    }
    
    // At this point, sourceCard should be set either from sourcePage.cards or directly from parsedCards
    
    // Get all available pages and calculate match scores
    const availablePages = getAllPagesWithMatchScores(sourceCard, sourcePageId);
    
    if (availablePages.length === 0) {
        alert('No other pages available to move this card to.');
        return;
    }
    
    // Remove existing modal if it exists and create a new one
    let existingModal = document.getElementById('moveCardModal');
    if (existingModal) {
        document.body.removeChild(existingModal);
    }
    
    // Create modal
    let modal = document.createElement('div');
    modal.id = 'moveCardModal';
    modal.className = 'modal move-card-modal';
        modal.innerHTML = `
            <div class="modal-content move-card-modal-content">
                <div class="modal-header">
                    <h3>Move Card: <span id="moveCardTitle"></span></h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="move-card-body">
                    <div class="card-cite-display" id="cardCiteDisplay">
                        <h4>Card Cite:</h4>
                        <div id="cardCiteContent" class="card-cite-content"></div>
                    </div>
                    <p>Select the page you want to move this card to:</p>
                    <div class="page-selection-table-container">
                        <table class="page-selection-table">
                            <thead>
                                <tr>
                                    <th>Select</th>
                                    <th>Page Title</th>
                                    <th>Match Score</th>
                                    <th>Matching Fields</th>
                                </tr>
                            </thead>
                            <tbody id="pageSelectionTableBody">
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="modal-buttons">
                    <button id="confirmMoveBtn" class="confirm-move-btn">Move Card</button>
                    <button id="cancelMoveBtn" class="cancel-move-btn">Cancel</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Add event handlers
        modal.querySelector('.close-modal').onclick = () => {
            modal.style.display = 'none';
        };
        
        modal.querySelector('#cancelMoveBtn').onclick = () => {
            modal.style.display = 'none';
        };
        
        // Close on click outside
        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        };
        
        // Add escape key handler
        const escapeHandler = function(e) {
            if (e.key === 'Escape') {
                modal.style.display = 'none';
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);
        
        document.body.appendChild(modal);
    
    // Update modal content
    document.getElementById('moveCardTitle').textContent = cardHeader;
    
    // Extract and display card cite
    const cardCite = extractCardCite(sourceCard);
    document.getElementById('cardCiteContent').innerHTML = cardCite;
    
    const tableBody = document.getElementById('pageSelectionTableBody');
    tableBody.innerHTML = '';
    
    // Track selected page
    let selectedPageId = null;
    
    // Populate table with pages sorted by match quality
    availablePages.forEach((pageInfo, index) => {
        const row = document.createElement('tr');
        row.className = 'page-selection-row';
        row.dataset.pageId = pageInfo.pageId;
        
        // Create metadata tooltip content
        const metadata = pageInfo.page.metadata || {};
        const tooltipContent = createMetadataTooltip(metadata, pageInfo.page);
        
        // Radio button cell
        const selectCell = document.createElement('td');
        const radioInput = document.createElement('input');
        radioInput.type = 'radio';
        radioInput.name = 'targetPage';
        radioInput.value = pageInfo.pageId;
        radioInput.id = `page-option-${index}`;
        if (index === 0) {
            radioInput.checked = true;
            selectedPageId = pageInfo.pageId;
            row.classList.add('selected');
        }
        selectCell.appendChild(radioInput);
        
        // Title cell
        const titleCell = document.createElement('td');
        titleCell.className = 'page-title-cell';
        titleCell.textContent = pageInfo.title;
        
        // Score cell
        const scoreCell = document.createElement('td');
        scoreCell.className = 'page-score-cell';
        scoreCell.textContent = pageInfo.matchScore.toFixed(2);
        
        // Matching fields cell
        const fieldsCell = document.createElement('td');
        fieldsCell.className = 'page-fields-cell';
        fieldsCell.textContent = pageInfo.matchFields.length > 0 ? 
            pageInfo.matchFields.join(', ') : 'No matches';
        
        row.appendChild(selectCell);
        row.appendChild(titleCell);
        row.appendChild(scoreCell);
        row.appendChild(fieldsCell);
        
        // Add tooltip functionality
        if (tooltipContent) {
            let tooltip = null;
            
            // Store tooltip content without using title attribute
            row.dataset.tooltipContent = tooltipContent;
            
            row.addEventListener('mouseenter', function(e) {
                // Create tooltip element
                tooltip = document.createElement('div');
                tooltip.className = 'page-metadata-tooltip';
                tooltip.textContent = tooltipContent;
                document.body.appendChild(tooltip);
                
                // Position tooltip
                tooltip.style.display = 'block';
                positionTooltip(e, tooltip);
            });
            
            row.addEventListener('mousemove', function(e) {
                if (tooltip) {
                    positionTooltip(e, tooltip);
                }
            });
            
            row.addEventListener('mouseleave', function() {
                if (tooltip) {
                    document.body.removeChild(tooltip);
                    tooltip = null;
                }
            });
        }
        
        // Add click handler to row
        row.addEventListener('click', function() {
            radioInput.checked = true;
            document.querySelectorAll('.page-selection-row').forEach(r => r.classList.remove('selected'));
            row.classList.add('selected');
            selectedPageId = pageInfo.pageId;
        });
        
        // Add change handler to radio
        radioInput.addEventListener('change', function() {
            document.querySelectorAll('.page-selection-row').forEach(r => r.classList.remove('selected'));
            row.classList.add('selected');
            selectedPageId = pageInfo.pageId;
        });
        
        tableBody.appendChild(row);
    });
    
    // Set up confirm button
    document.getElementById('confirmMoveBtn').onclick = () => {
        const checkedRadio = document.querySelector('input[name="targetPage"]:checked');
        if (checkedRadio) {
            const targetPageId = checkedRadio.value;
            const selectedPage = availablePages.find(p => p.pageId === targetPageId);
            
            if (selectedPage) {
                moveCardToPage(sourcePageId, cardArrayIndex, targetPageId, selectedPage.matchScore, selectedPage.matchFields, successCallback);
                modal.style.display = 'none';
            }
        }
    };
    
    modal.style.display = 'block';
}

// Function to get all pages with calculated match scores for a card
function getAllPagesWithMatchScores(card, excludePageId) {
    const pages = [];
    
    // Helper function to calculate match score between card and page
    function calculateCardPageMatch(card, page) {
        let score = 0;
        const matchFields = [];
        
        // Get page metadata
        const metadata = page.metadata || {};
        const title = metadata.title || page.title || '';
        const author = metadata.author || '';
        const authors = metadata.authors || [];
        const publishDate = metadata.publishDate || '';
        const journal = metadata.journal || '';
        const publisher = metadata.publisher || '';
        
        // URL match (domain comparison)
        try {
            const cardUrlParts = card.header.toLowerCase().split(' ');
            const pageUrl = new URL(page.url);
            const pageDomain = pageUrl.hostname.toLowerCase();
            
            const hasUrlMatch = cardUrlParts.some(part => 
                part.length > 3 && pageDomain.includes(part.replace(/[^a-z0-9]/g, ''))
            );
            
            if (hasUrlMatch) {
                score += 3;
                matchFields.push('URL');
            }
        } catch (e) {
            // Invalid URL, skip URL matching
        }
        
        // Title match
        if (title && card.header) {
            const titleWords = title.toLowerCase().split(/\s+/);
            const cardWords = card.header.toLowerCase().split(/\s+/);
            
            let commonWords = 0;
            titleWords.forEach(word => {
                if (word.length > 3 && cardWords.some(cWord => cWord.includes(word) || word.includes(cWord))) {
                    commonWords++;
                }
            });
            
            if (commonWords > 0) {
                score += Math.min(commonWords * 2, 8);
                matchFields.push('Title');
            }
        }
        
        // Author match
        const allAuthors = [author, ...authors].filter(Boolean);
        if (allAuthors.length > 0 && card.contentText) {
            const cardText = card.contentText.toLowerCase();
            const hasAuthorMatch = allAuthors.some(authorName => {
                const nameParts = authorName.toLowerCase().split(/\s+/);
                return nameParts.some(part => part.length > 2 && cardText.includes(part));
            });
            
            if (hasAuthorMatch) {
                score += 4;
                matchFields.push('Author');
            }
        }
        
        // Date match
        if (publishDate && card.contentText) {
            const year = publishDate.substring(0, 4);
            if (year && card.contentText.includes(year)) {
                score += 2;
                matchFields.push('Date');
            }
        }
        
        // Publication match (journal or publisher)
        if ((journal || publisher) && card.contentText) {
            const pubName = (journal || publisher).toLowerCase();
            const pubWords = pubName.split(/\s+/);
            const cardText = card.contentText.toLowerCase();
            
            const hasPubMatch = pubWords.some(word => 
                word.length > 3 && cardText.includes(word)
            );
            
            if (hasPubMatch) {
                score += 3;
                matchFields.push('Publication');
            }
        }
        
        return { score, matchFields };
    }
    
    // Get all content pages
    sessionData.contentPages.forEach((page, index) => {
        if (shouldFilterPage(page)) return;
        
        // Calculate page IDs for both orphaned and grouped pages
        let pageId;
        if (!page.sourceSearch) {
            const orphanIndex = sessionData.contentPages.filter(p => !p.sourceSearch).indexOf(page);
            pageId = `orphan-${orphanIndex}`;
        } else {
            // Find this page in the grouped structure
            const groups = groupSearchesAndPages();
            for (let gIdx = 0; gIdx < groups.length; gIdx++) {
                const pIdx = groups[gIdx].pages.findIndex(p => p.url === page.url);
                if (pIdx !== -1) {
                    pageId = `page-${gIdx}-${pIdx}`;
                    break;
                }
            }
        }
        
        // Skip if this is the source page or if no pageId found
        if (!pageId || pageId === excludePageId) return;
        
        // Skip if page is removed
        if (removedPages.has(pageId)) return;
        
        const match = calculateCardPageMatch(card, page);
        const pageTitle = (page.metadata && page.metadata.title) || page.title || new URL(page.url).hostname;
        
        pages.push({
            pageId,
            page,
            title: pageTitle,
            matchScore: match.score,
            matchFields: match.matchFields
        });
    });
    
    // Sort by match score (highest first)
    pages.sort((a, b) => b.matchScore - a.matchScore);
    
    return pages;
}

// Function to move a card from one page to another
function moveCardToPage(sourcePageId, cardIndex, targetPageId, matchScore, matchFields, successCallback) {
    // Get source page and card
    let sourcePage = null;
    let sourceCard = null;
    let cardArrayIndex = -1;
    
    if (sourcePageId === null || sourcePageId === undefined) {
        // Handle unmatched cards - get card directly from parsedCards
        console.log('Unmatched card - cardIndex:', cardIndex, 'parsedCards.length:', parsedCards.length);
        sourceCard = parsedCards[cardIndex];
        console.log('Retrieved sourceCard:', sourceCard);
        if (!sourceCard) {
            alert('Source card not found.');
            return;
        }
    } else {
        // Handle cards that are already linked to a page
        if (sourcePageId.startsWith('orphan-')) {
            const orphanIndex = parseInt(sourcePageId.split('-')[1]);
            sourcePage = sessionData.contentPages.filter(p => !p.sourceSearch)[orphanIndex];
        } else {
            const [_, groupIndex, pageIndex] = sourcePageId.split('-').map(Number);
            const groups = groupSearchesAndPages();
            if (groups[groupIndex] && groups[groupIndex].pages[pageIndex]) {
                sourcePage = groups[groupIndex].pages[pageIndex];
            }
        }
        
        if (!sourcePage || !sourcePage.cards || !sourcePage.cards[cardIndex]) {
            alert('Source card not found.');
            return;
        }
        
        sourceCard = sourcePage.cards[cardIndex];
        cardArrayIndex = cardIndex;
    }
    
    // For any card being moved to a page, remove from unlinked from all set if it exists
    unlinkedFromAllCards.delete(cardIndex.toString());
    console.log('Removed card', cardIndex, 'from unlinkedFromAllCards. Set now contains:', Array.from(unlinkedFromAllCards));
    
    // Get target page
    let targetPage = null;
    if (targetPageId.startsWith('orphan-')) {
        const orphanIndex = parseInt(targetPageId.split('-')[1]);
        targetPage = sessionData.contentPages.filter(p => !p.sourceSearch)[orphanIndex];
    } else {
        const [_, groupIndex, pageIndex] = targetPageId.split('-').map(Number);
        const groups = groupSearchesAndPages();
        if (groups[groupIndex] && groups[groupIndex].pages[pageIndex]) {
            targetPage = groups[groupIndex].pages[pageIndex];
        }
    }
    
    if (!targetPage) {
        alert('Target page not found.');
        return;
    }
    
    // Get the card to move (already set as sourceCard above)
    
    // Create new card object with updated match info
    const newCard = {
        ...sourceCard,
        cardIndex: cardIndex, // Ensure cardIndex is preserved for matching
        matchScore: matchScore,
        matchDetails: {
            urlMatch: matchFields.includes('URL'),
            titleMatch: matchFields.includes('Title'),
            authorMatch: matchFields.includes('Author'),
            dateMatch: matchFields.includes('Date'),
            publicationMatch: matchFields.includes('Publication'),
            weightingMethod: 'Manual'
        }
    };
    
    // Remove card from source page (and any pages with same URL) - only if there's a source page
    const removedCardData = [];
    
    if (sourcePage) {
        const sourceUrl = sourcePage.url;
        
        sessionData.contentPages.forEach((page, idx) => {
            if (page.url === sourceUrl && page.cards) {
                const cardIdx = page.cards.findIndex(c => c.cardIndex === sourceCard.cardIndex);
            if (cardIdx !== -1) {
                const removedCard = page.cards.splice(cardIdx, 1)[0];
                
                // Determine pageId for undo tracking
                let pageId;
                if (!page.sourceSearch) {
                    const orphanIndex = sessionData.contentPages.filter(p => !p.sourceSearch).indexOf(page);
                    pageId = `orphan-${orphanIndex}`;
                } else {
                    const groups = groupSearchesAndPages();
                    for (let gIdx = 0; gIdx < groups.length; gIdx++) {
                        const pIdx = groups[gIdx].pages.indexOf(page);
                        if (pIdx !== -1) {
                            pageId = `page-${gIdx}-${pIdx}`;
                            break;
                        }
                    }
                }
                
                removedCardData.push({
                    page,
                    pageId,
                    card: removedCard,
                    cardIndex: cardIdx
                });
            }
        }
        });
    }
    
    // Add card to target page (and any pages with same URL)
    const targetUrl = targetPage.url;
    const addedCardData = [];
    
    sessionData.contentPages.forEach((page, idx) => {
        if (page.url === targetUrl) {
            if (!page.cards) page.cards = [];
            page.cards.push(newCard);
            
            // Determine pageId for undo tracking
            let pageId;
            if (!page.sourceSearch) {
                const orphanIndex = sessionData.contentPages.filter(p => !p.sourceSearch).indexOf(page);
                pageId = `orphan-${orphanIndex}`;
            } else {
                const groups = groupSearchesAndPages();
                for (let gIdx = 0; gIdx < groups.length; gIdx++) {
                    const pIdx = groups[gIdx].pages.indexOf(page);
                    if (pIdx !== -1) {
                        pageId = `page-${gIdx}-${pIdx}`;
                        break;
                    }
                }
            }
            
            addedCardData.push({
                page,
                pageId,
                card: newCard,
                cardIndex: page.cards.length - 1
            });
        }
    });
    
    // Track action for undo
    lastAction = {
        type: 'moveCard',
        sourcePageId,
        targetPageId,
        removedCardData,
        addedCardData,
        originalCard: sourceCard
    };
    enableUndoButton();
    
    // Update the cards modal if it's still showing the source page (only if there was a source page)
    const currentModal = document.getElementById('cardsModal');
    if (currentModal && currentModal.style.display === 'block' && sourcePage) {
        const currentPageTitle = document.getElementById('cardsPageTitle').textContent;
        const sourcePageTitle = (sourcePage.metadata && sourcePage.metadata.title) || sourcePage.title || 'Unknown Page';
        
        if (currentPageTitle === sourcePageTitle) {
            showCardsModal(sourcePageId, sourcePage);
        }
    }
    
    // Update timeline
    updateTimeline();
    
    // Call success callback if provided
    if (successCallback && typeof successCallback === 'function') {
        successCallback();
    }
    
    // Show success message in move modal
    showMoveSuccessMessage(matchScore);
}

// Function to show success message in move modal
function showMoveSuccessMessage(matchScore) {
    const modal = document.getElementById('moveCardModal');
    if (!modal) return;
    
    // Replace modal content with success message
    const modalContent = modal.querySelector('.move-card-modal-content');
    modalContent.innerHTML = `
        <div class="modal-header">
            <h3 style="color: #27ae60;">✓ Card Moved Successfully!</h3>
        </div>
        <div class="move-success-body">
            <div class="success-message">
                <p>The card has been moved to the selected page.</p>
                <p>New match score: <strong>${matchScore.toFixed(2)}</strong></p>
                <p>Method: <strong>Manual</strong></p>
            </div>
        </div>
        <div class="modal-buttons">
            <button id="closeSuccessBtn" class="confirm-move-btn">Close</button>
        </div>
    `;
    
    // Add close handler
    modal.querySelector('#closeSuccessBtn').onclick = () => {
        modal.style.display = 'none';
    };
    
    // Auto-close after 3 seconds
    setTimeout(() => {
        if (modal.style.display === 'block') {
            modal.style.display = 'none';
        }
    }, 3000);
}

// Font management functions
function setFont(fontType) {
    const root = document.documentElement;
    
    // Update CSS variable based on font type
    switch(fontType) {
        case 'sans-serif':
            root.style.setProperty('--font-family', 'var(--font-sans-serif)');
            break;
        case 'serif':
            root.style.setProperty('--font-family', 'var(--font-serif)');
            break;
        case 'monospace':
            root.style.setProperty('--font-family', 'var(--font-monospace)');
            break;
        case 'dyslexia':
            root.style.setProperty('--font-family', 'var(--font-dyslexia)');
            break;
        default:
            root.style.setProperty('--font-family', 'var(--font-sans-serif)');
    }
    
    // Update active button
    document.querySelectorAll('.font-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-font="${fontType}"]`).classList.add('active');
    
    // Save preference
    localStorage.setItem('selectedFont', fontType);
}

function loadSavedFont() {
    const savedFont = localStorage.getItem('selectedFont') || 'sans-serif';
    setFont(savedFont);
}

// Sidebar toggle functions
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const toggleIcon = document.querySelector('.toggle-icon');
    const isCollapsed = sidebar.classList.contains('collapsed');
    
    if (isCollapsed) {
        sidebar.classList.remove('collapsed');
        toggleIcon.textContent = '«';
        localStorage.setItem('sidebarCollapsed', 'false');
    } else {
        sidebar.classList.add('collapsed');
        toggleIcon.textContent = '»';
        localStorage.setItem('sidebarCollapsed', 'true');
    }
}

function loadSavedSidebarState() {
    const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    const toggleIcon = document.querySelector('.toggle-icon');
    
    if (isCollapsed) {
        document.getElementById('sidebar').classList.add('collapsed');
        toggleIcon.textContent = '»';
    } else {
        toggleIcon.textContent = '«';
    }
}

// Universal Identifier Management
function createIdentifierArray(identifierType, identifierValue) {
    return [{ type: identifierType, value: identifierValue }];
}

function addIdentifierToMetadata(metadata, identifierType, identifierValue) {
    if (!metadata.identifiers) {
        metadata.identifiers = [];
    }
    
    // Remove existing identifier of same type
    metadata.identifiers = metadata.identifiers.filter(id => id.type !== identifierType);
    
    // Add new identifier
    if (identifierValue) {
        metadata.identifiers.push({ type: identifierType, value: identifierValue });
    }
    
    return metadata;
}

function getIdentifierByType(metadata, identifierType) {
    if (!metadata.identifiers) return null;
    const identifier = metadata.identifiers.find(id => id.type === identifierType);
    return identifier ? identifier.value : null;
}

function hasIdentifier(metadata, identifierType) {
    return getIdentifierByType(metadata, identifierType) !== null;
}

function getAllIdentifiers(metadata) {
    return metadata.identifiers || [];
}

// Get primary identifier from either new format (sourceIdentifier) or old format (doi field)
function getDOI(metadata) {
    // First check if we have a sourceIdentifier (new format)
    if (metadata.sourceIdentifier && metadata.sourceIdentifier.value) {
        return metadata.sourceIdentifier.value;
    }
    // Then check if it's a DOI in the new identifiers array
    const doiFromArray = getIdentifierByType(metadata, 'DOI');
    if (doiFromArray) {
        return doiFromArray;
    }
    // Finally fall back to the legacy doi field
    return metadata.doi || null;
}

// Set identifier in both new and old format (handles any identifier type)
function setDOI(metadata, identifierValue) {
    if (!identifierValue) {
        // Clear identifier fields
        metadata.doi = '';
        metadata.sourceIdentifier = null;
        return metadata;
    }
    
    // Detect identifier type
    const detected = detectIdentifierType(identifierValue);
    if (detected) {
        // Set new format
        addIdentifierToMetadata(metadata, detected.type, detected.identifier);
        metadata.sourceIdentifier = { type: detected.type, value: detected.identifier };
        // Set legacy format for backward compatibility
        metadata.doi = detected.identifier;
    } else {
        // Unknown identifier type, treat as generic
        metadata.doi = identifierValue;
        metadata.sourceIdentifier = { type: 'Unknown', value: identifierValue };
    }
    
    return metadata;
}

// Smart Identifier Detection
function detectIdentifierType(input) {
    const trimmed = input.trim();
    
    // DOI: Starts with "10." or contains doi.org URL
    if (/^10\.\d{4,}(?:\.\d+)*\/[^\s]+/.test(trimmed) || 
        /(?:doi\.org|dx\.doi\.org)\/10\.\d{4,}/.test(trimmed)) {
        // Extract DOI from URL if needed
        const doiMatch = trimmed.match(/10\.\d{4,}(?:\.\d+)*\/[^\s]+/);
        return { type: 'DOI', identifier: doiMatch ? doiMatch[0] : trimmed };
    }
    
    // ISBN: 10 or 13 digits with optional hyphens/spaces
    const isbnDigits = trimmed.replace(/[\-\s]/g, '');
    if (/^(?:97[89])?\d{9}[\dX]$/i.test(isbnDigits)) {
        if (isbnDigits.length === 10 || isbnDigits.length === 13) {
            return { type: 'ISBN', identifier: isbnDigits };
        }
    }
    
    // PMID: Pure digits, typically 5-8 digits (but can be longer)
    if (/^\d{5,9}$/.test(trimmed)) {
        return { type: 'PMID', identifier: trimmed };
    }
    
    // arXiv: New format YYMM.NNNNN or old format archive/YYMMNNN
    if (/^\d{4}\.\d{4,5}(v\d+)?$/i.test(trimmed) || 
        /^[a-z\-]+(\.[A-Z]{2})?\/\d{7}(v\d+)?$/i.test(trimmed)) {
        return { type: 'arXiv', identifier: trimmed };
    }
    
    // ISSN: NNNN-NNNX (8 digits with optional hyphen)
    if (/^\d{4}\-?\d{3}[\dX]$/i.test(trimmed)) {
        return { type: 'ISSN', identifier: trimmed };
    }
    
    return null;
}

// DOI Autofill Functionality (now redirects to Smart Lookup)
function showDoiInputModal(titleInput, authorInput, dateInput, publisherInput, journalInput, pubInfoInput, pagesInput, doiInput, qualsInput, typeSelect) {
    const modal = document.getElementById('doiInputModal');
    const doiInputField = document.getElementById('doiInput');
    const fetchBtn = document.getElementById('fetchDoiBtn');
    const cancelBtn = document.getElementById('cancelDoiBtn');
    const closeBtn = document.querySelector('.close-doi-modal');
    
    // Clear previous input and status
    doiInputField.value = '';
    const statusDiv = document.getElementById('doiStatus');
    const typeDiv = document.getElementById('identifierType');
    if (statusDiv) {
        statusDiv.style.display = 'none';
        statusDiv.className = 'doi-status';
    }
    if (typeDiv) {
        typeDiv.style.display = 'none';
        typeDiv.textContent = '';
    }
    
    // Store references to form inputs for later use
    modal.formInputs = {
        titleInput, authorInput, dateInput, publisherInput, 
        journalInput, pubInfoInput, pagesInput, doiInput, 
        qualsInput, typeSelect
    };
    
    // Show modal
    modal.style.display = 'block';
    doiInputField.focus();
    
    // Set up event handlers
    const handleFetch = () => fetchMetadataFromIdentifier(modal.formInputs);
    const handleCancel = () => {
        modal.style.display = 'none';
        cleanup();
    };
    const handleClose = () => {
        modal.style.display = 'none';
        cleanup();
    };
    const handleKeydown = (e) => {
        if (e.key === 'Escape') {
            modal.style.display = 'none';
            cleanup();
        } else if (e.key === 'Enter' && doiInputField.value.trim()) {
            e.preventDefault();
            fetchMetadataFromIdentifier(modal.formInputs);
        }
    };
    const handleInput = (e) => {
        const typeDiv = document.getElementById('identifierType');
        const input = e.target.value.trim();
        if (input) {
            const detected = detectIdentifierType(input);
            if (detected) {
                typeDiv.textContent = `Detected: ${detected.type}`;
                typeDiv.style.display = 'block';
            } else {
                typeDiv.style.display = 'none';
            }
        } else {
            typeDiv.style.display = 'none';
        }
    };
    
    const cleanup = () => {
        fetchBtn.removeEventListener('click', handleFetch);
        cancelBtn.removeEventListener('click', handleCancel);
        closeBtn.removeEventListener('click', handleClose);
        document.removeEventListener('keydown', handleKeydown);
        doiInputField.removeEventListener('input', handleInput);
    };
    
    fetchBtn.addEventListener('click', handleFetch);
    cancelBtn.addEventListener('click', handleCancel);
    closeBtn.addEventListener('click', handleClose);
    document.addEventListener('keydown', handleKeydown);
    doiInputField.addEventListener('input', handleInput);
}

async function fetchMetadataFromIdentifier(formInputs) {
    const inputField = document.getElementById('doiInput');
    const fetchBtn = document.getElementById('fetchDoiBtn');
    const statusDiv = document.getElementById('doiStatus');
    const input = inputField.value.trim();
    
    // Clear previous status
    statusDiv.style.display = 'none';
    statusDiv.className = 'doi-status';
    
    if (!input) {
        showDoiStatus('Please enter an identifier', 'error');
        return;
    }
    
    // Detect identifier type
    const detected = detectIdentifierType(input);
    if (!detected) {
        showDoiStatus('Unable to detect identifier type. Please check your input.', 'error');
        return;
    }
    
    // Show loading state
    fetchBtn.disabled = true;
    fetchBtn.textContent = 'Fetching...';
    showDoiStatus(`🔄 Fetching metadata for ${detected.type}...`, 'loading');
    
    try {
        let metadata = null;
        
        switch (detected.type) {
            case 'DOI':
                metadata = await fetchDOIMetadata(detected.identifier);
                break;
            case 'ISBN':
                metadata = await fetchISBNMetadata(detected.identifier);
                break;
            case 'PMID':
                metadata = await fetchPMIDMetadata(detected.identifier);
                break;
            case 'arXiv':
                metadata = await fetchArxivMetadata(detected.identifier);
                break;
            default:
                throw new Error(`${detected.type} lookup not yet implemented`);
        }
        
        if (metadata) {
            // Show success briefly
            showDoiStatus('✓ Metadata fetched successfully!', 'success');
            
            // Fill the form with fetched metadata
            fillMetadataForm(metadata, formInputs);
            
            // Auto-close modal after short delay
            setTimeout(() => {
                document.getElementById('doiInputModal').style.display = 'none';
                // Clear the status for next time
                statusDiv.style.display = 'none';
            }, 1000);
            
        } else {
            showDoiStatus(`Failed to fetch metadata for this ${detected.type}. Please check the identifier and try again.`, 'error');
        }
    } catch (error) {
        console.error(`Error fetching ${detected.type} metadata:`, error);
        showDoiStatus('Error fetching metadata: ' + error.message, 'error');
    } finally {
        // Reset button state
        fetchBtn.disabled = false;
        fetchBtn.textContent = 'Fetch Metadata';
    }
}

// Keep the old function name for backward compatibility
async function fetchMetadataFromDoi(formInputs) {
    return fetchMetadataFromIdentifier(formInputs);
}

function showDoiStatus(message, type) {
    const statusDiv = document.getElementById('doiStatus');
    statusDiv.textContent = message;
    statusDiv.className = `doi-status ${type}`;
    statusDiv.style.display = 'block';
}

async function fetchDOIMetadata(doi) {
    try {
        console.log('Fetching metadata for DOI:', doi);
        
        // Method 1: Try CrossRef API directly (most reliable)
        try {
            console.log('Trying CrossRef API...');
            const response = await fetch(`https://api.crossref.org/works/${doi}`);
            
            if (response.ok) {
                const crossrefData = await response.json();
                if (crossrefData.status === 'ok' && crossrefData.message) {
                    console.log('CrossRef data received:', crossrefData.message);
                    return convertCrossRefToMetadata(crossrefData.message, doi);
                }
            }
        } catch (e) {
            console.log('CrossRef API failed:', e.message);
        }
        
        // Method 2: Try different CORS proxy
        try {
            console.log('Trying CORS proxy...');
            const proxyUrl = 'https://corsproxy.io/?';
            const targetUrl = `https://doi.org/${encodeURIComponent(doi)}`;
            
            const response = await fetch(proxyUrl + encodeURIComponent(targetUrl), {
                headers: {
                    'Accept': 'application/vnd.citationstyles.csl+json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                console.log('DOI metadata received via proxy:', data);
                return convertCSLToMetadata(data, doi);
            }
        } catch (e) {
            console.log('CORS proxy failed:', e.message);
        }
        
        // If both methods fail
        throw new Error('Unable to fetch DOI metadata. The DOI service may be unavailable.');
        
    } catch (error) {
        console.error('Error fetching DOI metadata:', error);
        return null;
    }
}

function convertCrossRefToMetadata(crossrefData, doi) {
    try {
        const metadata = {
            doi: doi, // Keep for backward compatibility
            title: crossrefData.title ? crossrefData.title[0] : null,
            authors: [],
            publishDate: null,
            journal: crossrefData['container-title'] ? crossrefData['container-title'][0] : null,
            publicationInfo: null,
            pages: crossrefData.page,
            abstract: crossrefData.abstract,
            contentType: mapCrossRefTypeToContentType(crossrefData.type),
            doiMetadata: true, // Keep for backward compatibility
            sourceIdentifier: { type: 'DOI', value: doi },
            identifiers: [{ type: 'DOI', value: doi }]
        };
        
        // Create publication info from volume and issue
        if (crossrefData.volume || crossrefData.issue) {
            const parts = [];
            if (crossrefData.volume) parts.push(`Vol. ${crossrefData.volume}`);
            if (crossrefData.issue) parts.push(`No. ${crossrefData.issue}`);
            metadata.publicationInfo = parts.join(', ');
        }
        
        // Process authors
        if (crossrefData.author && Array.isArray(crossrefData.author)) {
            metadata.authors = crossrefData.author.map(author => {
                if (author.given && author.family) {
                    return `${author.given} ${author.family}`;
                } else if (author.name) {
                    return author.name;
                } else if (author.family) {
                    return author.family;
                }
                return '';
            }).filter(name => name);
            
            metadata.author = metadata.authors.join(', ');
        }
        
        // Process publication date
        if (crossrefData.published && crossrefData.published['date-parts']) {
            const dateParts = crossrefData.published['date-parts'][0];
            if (dateParts && dateParts.length > 0) {
                const year = dateParts[0];
                const month = dateParts[1] || 1;
                const day = dateParts[2] || 1;
                metadata.publishDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            }
        } else if (crossrefData.issued && crossrefData.issued['date-parts']) {
            const dateParts = crossrefData.issued['date-parts'][0];
            if (dateParts && dateParts.length > 0) {
                const year = dateParts[0];
                const month = dateParts[1] || 1;
                const day = dateParts[2] || 1;
                metadata.publishDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            }
        }
        
        return metadata;
    } catch (error) {
        console.error('Error converting CrossRef data:', error);
        return null;
    }
}

function convertCSLToMetadata(data, doi) {
    try {
        // Convert CSL JSON to our metadata format
        const metadata = {
            doi: doi, // Keep for backward compatibility
            title: data.title,
            authors: [],
            publishDate: null,
            journal: data['container-title'],
            publicationInfo: null,
            pages: data.page,
            abstract: data.abstract,
            contentType: mapCSLTypeToContentType(data.type),
            doiMetadata: true, // Keep for backward compatibility
            sourceIdentifier: { type: 'DOI', value: doi },
            identifiers: [{ type: 'DOI', value: doi }]
        };
        
        // Create publication info from volume and issue
        if (data.volume || data.issue) {
            const parts = [];
            if (data.volume) parts.push(`Vol. ${data.volume}`);
            if (data.issue) parts.push(`No. ${data.issue}`);
            metadata.publicationInfo = parts.join(', ');
        }
        
        // Process authors
        if (data.author && Array.isArray(data.author)) {
            metadata.authors = data.author.map(author => {
                if (author.given && author.family) {
                    return `${author.given} ${author.family}`;
                } else if (author.name) {
                    return author.name;
                } else if (author.family) {
                    return author.family;
                }
                return '';
            }).filter(name => name);
            
            metadata.author = metadata.authors.join(', ');
        }
        
        // Process publication date
        if (data.published && data.published['date-parts']) {
            const dateParts = data.published['date-parts'][0];
            if (dateParts && dateParts.length > 0) {
                const year = dateParts[0];
                const month = dateParts[1] || 1;
                const day = dateParts[2] || 1;
                metadata.publishDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            }
        } else if (data.issued && data.issued['date-parts']) {
            const dateParts = data.issued['date-parts'][0];
            if (dateParts && dateParts.length > 0) {
                const year = dateParts[0];
                const month = dateParts[1] || 1;
                const day = dateParts[2] || 1;
                metadata.publishDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            }
        }
        
        return metadata;
    } catch (error) {
        console.error('Error converting CSL data:', error);
        return null;
    }
}

function mapCrossRefTypeToContentType(crossrefType) {
    const mapping = {
        'journal-article': 'journal-article',
        'book-chapter': 'book',
        'monograph': 'book',
        'report': 'report',
        'book': 'book',
        'thesis': 'thesis',
        'conference-paper': 'conference-paper',
        'proceedings-article': 'conference-paper'
    };
    
    return mapping[crossrefType] || 'other';
}

function mapCSLTypeToContentType(cslType) {
    const mapping = {
        'article-journal': 'journal-article',
        'article-magazine': 'magazine-article', 
        'article-newspaper': 'news-article',
        'book': 'book',
        'chapter': 'book-chapter',
        'paper-conference': 'conference-paper',
        'report': 'report',
        'thesis': 'thesis',
        'webpage': 'website',
        'post-weblog': 'blog-post'
    };
    
    return mapping[cslType] || 'other';
}

// ISBN Metadata Fetching
async function fetchISBNMetadata(isbn) {
    try {
        console.log('Fetching metadata for ISBN:', isbn);
        
        // Try Open Library API first (completely free, no auth required)
        try {
            console.log('Trying Open Library API...');
            const response = await fetch(`https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&jscmd=details&format=json`);
            
            if (response.ok) {
                const data = await response.json();
                const bookKey = `ISBN:${isbn}`;
                if (data[bookKey]) {
                    console.log('Open Library data received:', data[bookKey]);
                    return convertOpenLibraryToMetadata(data[bookKey], isbn);
                }
            }
        } catch (e) {
            console.log('Open Library API failed:', e.message);
        }
        
        // Try Google Books API as fallback
        try {
            console.log('Trying Google Books API...');
            const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`);
            
            if (response.ok) {
                const data = await response.json();
                if (data.totalItems > 0 && data.items && data.items[0]) {
                    console.log('Google Books data received:', data.items[0]);
                    return convertGoogleBooksToMetadata(data.items[0], isbn);
                }
            }
        } catch (e) {
            console.log('Google Books API failed:', e.message);
        }
        
        return null;
    } catch (error) {
        console.error('Error fetching ISBN metadata:', error);
        return null;
    }
}

function convertOpenLibraryToMetadata(data, isbn) {
    const details = data.details || {};
    const metadata = {
        title: details.title || '',
        author: '',
        publishDate: '',
        publisher: '',
        pages: '',
        isbn: isbn, // Keep for backward compatibility
        contentType: 'book',
        isbnMetadata: true, // Keep for backward compatibility
        sourceIdentifier: { type: 'ISBN', value: isbn },
        identifiers: [{ type: 'ISBN', value: isbn }]
    };
    
    // Process authors
    if (details.authors && details.authors.length > 0) {
        metadata.author = details.authors.map(a => a.name || '').join(', ');
    }
    
    // Process publication date
    if (details.publish_date) {
        metadata.publishDate = details.publish_date;
    }
    
    // Process publishers
    if (details.publishers && details.publishers.length > 0) {
        metadata.publisher = details.publishers.join(', ');
    }
    
    // Process page count
    if (details.number_of_pages) {
        metadata.pages = details.number_of_pages.toString();
    }
    
    return metadata;
}

function convertGoogleBooksToMetadata(data, isbn) {
    const volumeInfo = data.volumeInfo || {};
    const metadata = {
        title: volumeInfo.title || '',
        author: '',
        publishDate: '',
        publisher: volumeInfo.publisher || '',
        pages: '',
        isbn: isbn, // Keep for backward compatibility
        contentType: 'book',
        isbnMetadata: true, // Keep for backward compatibility
        sourceIdentifier: { type: 'ISBN', value: isbn },
        identifiers: [{ type: 'ISBN', value: isbn }]
    };
    
    // Process authors
    if (volumeInfo.authors && volumeInfo.authors.length > 0) {
        metadata.author = volumeInfo.authors.join(', ');
    }
    
    // Process publication date
    if (volumeInfo.publishedDate) {
        metadata.publishDate = volumeInfo.publishedDate;
    }
    
    // Process page count
    if (volumeInfo.pageCount) {
        metadata.pages = volumeInfo.pageCount.toString();
    }
    
    return metadata;
}

// PMID Metadata Fetching
async function fetchPMIDMetadata(pmid) {
    try {
        console.log('Fetching metadata for PMID:', pmid);
        
        // Use NCBI E-utilities API
        const response = await fetch(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${pmid}&retmode=json`);
        
        if (response.ok) {
            const data = await response.json();
            if (data.result && data.result[pmid]) {
                console.log('PubMed data received:', data.result[pmid]);
                return convertPubMedToMetadata(data.result[pmid], pmid);
            }
        }
        
        return null;
    } catch (error) {
        console.error('Error fetching PMID metadata:', error);
        return null;
    }
}

function convertPubMedToMetadata(data, pmid) {
    const metadata = {
        title: data.title || '',
        author: '',
        publishDate: '',
        journal: data.fulljournalname || data.source || '',
        publicationInfo: '',
        pages: data.pages || '',
        pmid: pmid, // Keep for backward compatibility
        contentType: 'journal-article',
        pmidMetadata: true, // Keep for backward compatibility
        sourceIdentifier: { type: 'PMID', value: pmid },
        identifiers: [{ type: 'PMID', value: pmid }]
    };
    
    // Process authors
    if (data.authors && data.authors.length > 0) {
        metadata.author = data.authors.map(a => a.name || '').join(', ');
    }
    
    // Process publication date
    if (data.pubdate) {
        metadata.publishDate = data.pubdate;
    } else if (data.epubdate) {
        metadata.publishDate = data.epubdate;
    }
    
    // Process publication info (volume, issue)
    const pubInfo = [];
    if (data.volume) pubInfo.push(`Vol. ${data.volume}`);
    if (data.issue) pubInfo.push(`No. ${data.issue}`);
    if (pubInfo.length > 0) {
        metadata.publicationInfo = pubInfo.join(', ');
    }
    
    // Add DOI if available
    if (data.elocationid) {
        const doiMatch = data.elocationid.match(/doi:\s*(.+)/);
        if (doiMatch) {
            const doiValue = doiMatch[1];
            metadata.doi = doiValue; // Keep for backward compatibility
            // Add DOI to identifiers array
            metadata.identifiers.push({ type: 'DOI', value: doiValue });
        }
    }
    
    return metadata;
}

// arXiv Metadata Fetching
async function fetchArxivMetadata(arxivId) {
    try {
        console.log('Fetching metadata for arXiv:', arxivId);
        
        // Use arXiv API
        const response = await fetch(`https://export.arxiv.org/api/query?id_list=${arxivId}`);
        
        if (response.ok) {
            const text = await response.text();
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(text, 'text/xml');
            
            const entry = xmlDoc.querySelector('entry');
            if (entry) {
                console.log('arXiv data received');
                return convertArxivToMetadata(entry, arxivId);
            }
        }
        
        return null;
    } catch (error) {
        console.error('Error fetching arXiv metadata:', error);
        return null;
    }
}

function convertArxivToMetadata(entry, arxivId) {
    const metadata = {
        title: '',
        author: '',
        publishDate: '',
        arxivId: arxivId, // Keep for backward compatibility
        contentType: 'preprint',
        arxivMetadata: true, // Keep for backward compatibility
        sourceIdentifier: { type: 'arXiv', value: arxivId },
        identifiers: [{ type: 'arXiv', value: arxivId }]
    };
    
    // Get title
    const titleElement = entry.querySelector('title');
    if (titleElement) {
        metadata.title = titleElement.textContent.trim();
    }
    
    // Get authors
    const authors = entry.querySelectorAll('author name');
    if (authors.length > 0) {
        metadata.author = Array.from(authors).map(a => a.textContent.trim()).join(', ');
    }
    
    // Get publication date
    const published = entry.querySelector('published');
    if (published) {
        const date = new Date(published.textContent);
        metadata.publishDate = date.toISOString().split('T')[0];
    }
    
    // Get abstract (could be useful for quals field)
    const summary = entry.querySelector('summary');
    if (summary) {
        metadata.abstract = summary.textContent.trim();
    }
    
    return metadata;
}

function fillMetadataForm(metadata, formInputs) {
    // Fill the form fields with the fetched metadata
    if (metadata.title) formInputs.titleInput.value = metadata.title;
    if (metadata.author) formInputs.authorInput.value = metadata.author;
    if (metadata.publishDate) formInputs.dateInput.value = metadata.publishDate;
    if (metadata.publisher) formInputs.publisherInput.value = metadata.publisher;
    if (metadata.journal) formInputs.journalInput.value = metadata.journal;
    if (metadata.publicationInfo) formInputs.pubInfoInput.value = metadata.publicationInfo;
    if (metadata.pages) formInputs.pagesInput.value = metadata.pages;
    
    // Handle DOI field - check both new and old formats
    const doiValue = getDOI(metadata);
    if (doiValue) formInputs.doiInput.value = doiValue;
    
    if (metadata.contentType) formInputs.typeSelect.value = metadata.contentType;
    
    // Mark that this form was filled from smart lookup (store on form container for save function to check)
    if (metadata.doiMetadata || metadata.sourceIdentifier) {
        const modal = document.getElementById('metadataModal');
        if (modal) {
            modal.dataset.filledFromDoi = 'true';
            // Store the complete fetched metadata for the save function to access
            modal._fetchedMetadata = metadata;
        }
    }
    
    // Note: We don't fill publisher or quals since they're typically not in DOI metadata
}

function createMetadataStatusIndicators(originalMetadata, editedMetadata) {
    const metadata = { ...originalMetadata, ...editedMetadata };
    const infoItems = [];
    
    // Check if metadata came from identifier API
    if (metadata.sourceIdentifier) {
        const sourceType = metadata.sourceIdentifier.type;
        const sourceText = sourceType === 'DOI' ? 'DOI registry' :
                          sourceType === 'ISBN' ? 'ISBN database' :
                          sourceType === 'PMID' ? 'PubMed database' :
                          sourceType === 'arXiv' ? 'arXiv repository' :
                          `${sourceType} database`;
        infoItems.push({
            text: `Metadata fetched from ${sourceText}`,
            color: '#2e7d32',
            icon: '✓'
        });
    }
    // Backward compatibility for old doiMetadata flag
    else if (metadata.doiMetadata) {
        infoItems.push({
            text: 'Metadata fetched from DOI registry',
            color: '#2e7d32',
            icon: '✓'
        });
    }
    // Check if this is from an automatic extractor
    else if (metadata.extractorType) {
        let extractorText = `Metadata extracted via ${metadata.extractorType}`;
        if (metadata.extractorSite) {
            extractorText += ` from ${metadata.extractorSite}`;
        }
        infoItems.push({
            text: extractorText,
            color: '#666',
            icon: '⚙'
        });
    }
    
    // Check if this is a repeat visit (has creation timestamp vs current visit)
    if (metadata.created && metadata.lastUpdated) {
        const created = new Date(metadata.created);
        const lastUpdated = new Date(metadata.lastUpdated);
        
        // If last updated is significantly after creation, this is likely a repeat visit
        if (lastUpdated.getTime() - created.getTime() > 60000) { // More than 1 minute difference
            infoItems.push({
                text: 'Metadata loaded from previous session',
                color: '#1976d2',
                icon: '↻'
            });
        }
    }
    
    // Check if manual edits were made
    if (metadata.manuallyEdited) {
        const editTime = metadata.editTimestamp ? new Date(metadata.editTimestamp) : null;
        let editText = 'Manual edits applied';
        if (editTime) {
            const now = new Date();
            const diffMinutes = Math.round((now.getTime() - editTime.getTime()) / 60000);
            if (diffMinutes < 1) {
                editText += ' (just now)';
            } else if (diffMinutes < 60) {
                editText += ` (${diffMinutes}m ago)`;
            } else if (diffMinutes < 1440) {
                editText += ` (${Math.round(diffMinutes / 60)}h ago)`;
            } else {
                editText += ` (${Math.round(diffMinutes / 1440)}d ago)`;
            }
        }
        infoItems.push({
            text: editText,
            color: '#f57c00',
            icon: '✏'
        });
    }
    
    // Render the info items
    if (infoItems.length > 0) {
        const infoDiv = document.createElement('div');
        infoDiv.className = 'metadata-status-info';
        infoDiv.style.border = '1px solid #e0e0e0';
        infoDiv.style.background = '#f9f9f9';
        infoDiv.style.padding = '8px';
        infoDiv.style.borderRadius = '4px';
        infoDiv.style.marginTop = '10px';
        infoDiv.style.fontSize = '0.85em';
        
        const infoHtml = infoItems.map(item => 
            `<div style="color: ${item.color}; margin: 2px 0; line-height: 1.3;">
                <span style="margin-right: 6px;">${item.icon}</span>${item.text}
            </div>`
        ).join('');
        
        infoDiv.innerHTML = infoHtml;
        return infoDiv;
    }
    
    return null;
}

// Function to show modal for moving a page to a different search
function showMovePageModal(pageId, page) {
    if (!sessionData || !sessionData.searches || sessionData.searches.length === 0) {
        alert('No searches available to move this page to.');
        return;
    }

    // Check if modal already exists and remove it
    const existingModal = document.getElementById('movePageModal');
    if (existingModal) {
        existingModal.remove();
    }

    // Create the modal
    const modal = document.createElement('div');
    modal.id = 'movePageModal';
    modal.className = 'modal';

    // Get current search info for comparison
    const currentSearch = page.sourceSearch;
    const currentSearchKey = currentSearch ? `${currentSearch.engine}-${currentSearch.query}` : null;

    // Group searches by engine-query combination and count pages
    const searchGroups = new Map();
    const groups = groupSearchesAndPages();
    
    groups.forEach(group => {
        const searchKey = `${group.engine}-${group.query}`;
        if (searchKey !== currentSearchKey) { // Exclude current search
            if (!searchGroups.has(searchKey)) {
                searchGroups.set(searchKey, {
                    engine: group.engine,
                    query: group.query,
                    firstTimestamp: group.firstTimestamp,
                    pageCount: group.pages.length
                });
            }
        }
    });

    // Convert to array and sort by timestamp (oldest to newest, like timeline)
    const availableSearches = Array.from(searchGroups.values())
        .sort((a, b) => new Date(a.firstTimestamp) - new Date(b.firstTimestamp));

    if (availableSearches.length === 0) {
        alert('No other searches available to move this page to.');
        return;
    }

    modal.innerHTML = `
        <div class="modal-content move-page-modal-content">
            <div class="modal-header">
                <h3>Move Page to Different Search</h3>
                <button class="close-modal">&times;</button>
            </div>
            <div class="move-page-body">
                <p>Select a search to move this page to:</p>
                <div class="current-page-info" style="background-color: #f8f9fa; padding: 10px; border-radius: 4px; margin-bottom: 15px;">
                    <strong>Moving page:</strong> ${page.title || new URL(page.url).hostname}<br>
                    <small style="color: #666;">${page.url}</small>
                    ${currentSearch ? `<br><strong>Current search:</strong> ${currentSearch.engine} - "${currentSearch.query}"` : '<br><strong>Currently:</strong> Direct page visit (no search)'}
                </div>
                <div class="search-selection-list" id="searchSelectionList">
                    ${availableSearches.map((search, index) => `
                        <div class="search-option" data-engine="${search.engine}" data-query="${search.query}" data-index="${index}">
                            <div class="search-info">
                                <div class="search-engine">${search.engine}</div>
                                <div class="search-query">"${search.query}"</div>
                            </div>
                            <div style="display: flex; align-items: center;">
                                <span class="search-timestamp">${formatTime(search.firstTimestamp)}</span>
                                <span class="search-pages-count">${search.pageCount} page${search.pageCount !== 1 ? 's' : ''}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="move-page-buttons">
                    <button class="move-page-cancel-btn">Cancel</button>
                    <button class="move-page-confirm-btn" disabled>Move Page</button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Handle search selection
    let selectedSearchIndex = null;
    const searchOptions = modal.querySelectorAll('.search-option');
    const confirmBtn = modal.querySelector('.move-page-confirm-btn');

    searchOptions.forEach((option, index) => {
        option.addEventListener('click', () => {
            // Remove previous selection
            searchOptions.forEach(opt => opt.classList.remove('selected'));
            
            // Add selection to clicked option
            option.classList.add('selected');
            selectedSearchIndex = index;
            
            // Enable confirm button
            confirmBtn.disabled = false;
        });
    });

    // Handle confirm button
    confirmBtn.addEventListener('click', () => {
        if (selectedSearchIndex !== null) {
            const selectedSearch = availableSearches[selectedSearchIndex];
            movePageToSearch(pageId, page, selectedSearch.engine, selectedSearch.query);
            modal.style.display = 'none';
        }
    });

    // Handle cancel button
    modal.querySelector('.move-page-cancel-btn').addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Handle close button
    modal.querySelector('.close-modal').addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Close on outside click
    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };

    // Handle escape key
    const escapeHandler = (event) => {
        if (event.key === 'Escape') {
            modal.style.display = 'none';
            document.removeEventListener('keydown', escapeHandler);
        }
    };
    document.addEventListener('keydown', escapeHandler);

    // Show the modal
    modal.style.display = 'block';
}

// Function to move a page to a different search
function movePageToSearch(pageId, page, targetEngine, targetQuery) {
    // Find the page in sessionData.contentPages using originalIndex or URL
    let pageIndex = -1;
    
    if (page.originalIndex !== undefined) {
        // Use originalIndex if available (from grouped pages)
        pageIndex = page.originalIndex;
    } else {
        // Fallback to finding by URL
        pageIndex = sessionData.contentPages.findIndex(p => p.url === page.url);
    }
    
    if (pageIndex === -1 || !sessionData.contentPages[pageIndex]) {
        console.error('Page not found. pageId:', pageId, 'originalIndex:', page.originalIndex, 'url:', page.url);
        alert('Page not found in session data.');
        return;
    }

    // Get the actual page from sessionData
    const actualPage = sessionData.contentPages[pageIndex];
    
    // Store original search info for undo
    const originalSourceSearch = actualPage.sourceSearch ? { ...actualPage.sourceSearch } : null;

    // Update the page's sourceSearch property
    actualPage.sourceSearch = {
        engine: targetEngine,
        query: targetQuery
    };

    // Track action for undo
    lastAction = {
        type: 'movePageToSearch',
        pageId: pageId,
        pageIndex: pageIndex,
        originalSourceSearch: originalSourceSearch,
        newSourceSearch: {
            engine: targetEngine,
            query: targetQuery
        }
    };
    enableUndoButton();

    // Update timeline to reflect the change
    updateTimeline();

    console.log(`Moved page "${actualPage.title || actualPage.url}" to search: ${targetEngine} - "${targetQuery}"`);
}