/**
 * DocProcessor class
 * Handles processing .docx files, extracting sections, and matching them to content pages
 */
class DocProcessor {
    constructor() {
        this.sections = [];
        this.documentLoaded = false;
        this.fileName = '';
    }

    /**
     * Load and process a .docx file
     * @param {File} file - The .docx file to process
     * @returns {Promise} - Promise that resolves when processing is complete
     */
    async processDocument(file) {
        this.fileName = file.name;
        
        try {
            const arrayBuffer = await file.arrayBuffer();
            const result = await this.extractSectionsFromDocx(arrayBuffer);
            this.sections = result;
            this.documentLoaded = true;
            return true;
        } catch (error) {
            console.error('Error processing document:', error);
            return false;
        }
    }

    /**
     * Extract sections from a .docx file based on headings
     * @param {ArrayBuffer} arrayBuffer - The .docx file content as ArrayBuffer
     * @returns {Array} - Array of sections with their content and heading level
     */
    async extractSectionsFromDocx(arrayBuffer) {
        try {
            // Use mammoth.js to extract document content with styles as HTML
            const result = await mammoth.convertToHtml({
                arrayBuffer: arrayBuffer,
                styleMap: [
                    "p[style-name='Heading 1'] => h1",
                    "p[style-name='Heading 2'] => h2", 
                    "p[style-name='Heading 3'] => h3",
                    "p[style-name='Heading 4'] => h4",
                    "p[style-name='heading 1'] => h1",
                    "p[style-name='heading 2'] => h2",
                    "p[style-name='heading 3'] => h3",
                    "p[style-name='heading 4'] => h4",
                    // Also map default Word heading styles
                    "p[style-name='Title'] => h1",
                    "p[style-name='Subtitle'] => h2",
                    "p[style-name='Normal'] => p"
                ]
            });
            
            console.log("Mammoth extraction complete. Found messages:", result.messages);
            
            // Get the HTML content
            const html = result.value;
            console.log("HTML content first 200 chars:", html.substring(0, 200));
            
            // Look for heading elements in the HTML
            const headingCount = (html.match(/<h[1-4]/g) || []).length;
            console.log(`Found ${headingCount} heading elements in HTML output`);
            
            // Process the HTML to extract sections
            const sections = this.splitIntoSections(html);
            return sections;
        } catch (error) {
            console.error('Error extracting sections:', error);
            throw error;
        }
    }

    /**
     * Split document text into sections based on headers
     * @param {string} text - The document text with HTML headers
     * @returns {Array} - Array of section objects
     */
    splitIntoSections(text) {
        console.log("Processing document text:", text.substring(0, 200) + "...");
        
        // Approach: We'll use a more direct regex-based approach to extract heading tags
        const sections = [];
        
        // First, replace any sequence of newlines with a single newline to normalize the text
        text = text.replace(/\n\s*\n/g, '\n');
        
        // Find all heading tags and their positions
        const headingRegex = /<h([1-4])>(.*?)<\/h\1>/gi;
        const headings = [];
        let match;
        
        while ((match = headingRegex.exec(text)) !== null) {
            headings.push({
                level: parseInt(match[1]),
                title: match[2].trim(),
                index: match.index,
                length: match[0].length,
                endIndex: match.index + match[0].length
            });
        }
        
        console.log(`Found ${headings.length} heading elements in the document`);
        
        // If no headings were found, create a single default section
        if (headings.length === 0) {
            // Try to find the title using a different approach - maybe it's a DOCX without heading styles
            // Look for paragraphs that could be headings (short and followed by paragraphs)
            const paragraphs = text.split('<p>').filter(p => p.trim().length > 0);
            
            if (paragraphs.length > 0) {
                // Use the first paragraph as the title
                let title = paragraphs[0].replace(/<\/p>.*$/s, '').trim();
                if (title.length > 100) {
                    title = title.substring(0, 100) + '...'; // Trim very long titles
                }
                
                sections.push({
                    title: title,
                    level: 1,
                    content: text,
                    id: 'section-0'
                });
                
                console.log('Created a single section from the document content');
            }
            
            return sections;
        }
        
        // Process each heading and extract content up to the next heading
        for (let i = 0; i < headings.length; i++) {
            const heading = headings[i];
            const nextHeading = headings[i + 1];
            
            // Determine where this section ends
            const sectionEndIndex = nextHeading ? nextHeading.index : text.length;
            
            // Extract the section content (including the heading)
            let sectionContent = text.substring(heading.index, sectionEndIndex).trim();
            
            // Clean up HTML tags for plain text content
            let plainTextContent = heading.title + '\n';
            
            // Extract paragraph content
            const paragraphRegex = /<p>(.*?)<\/p>/gi;
            let paragraphMatch;
            
            while ((paragraphMatch = paragraphRegex.exec(sectionContent)) !== null) {
                plainTextContent += paragraphMatch[1].trim() + '\n';
            }
            
            // Create the section object
            sections.push({
                title: heading.title,
                level: heading.level,
                content: plainTextContent,
                html: sectionContent,
                id: `section-${i}`
            });
        }
        
        console.log(`Created ${sections.length} sections from document headings`);
        return sections;
    }

    /**
     * Find the best matching section for a content page based on multiple criteria
     * @param {Object} page - The content page object
     * @param {boolean} [respectExclusivity=false] - If true, respects exclusive section assignments
     * @returns {Array} - Array of matching section objects with scores
     */
    findMatchingSections(page, respectExclusivity = false) {
        if (!this.documentLoaded || !this.sections.length) {
            return [];
        }
        
        // Create normalized versions for matching
        const pageTitle = (page.title || '').toLowerCase();
        const pageUrl = (page.url || '').toLowerCase();
        const pageMeta = page.metadata || {};
        
        // Extract metadata for matching
        const metaAuthor = (pageMeta.author || '').toLowerCase();
        const metaDescription = (pageMeta.description || '').toLowerCase();
        const metaDate = (pageMeta.publishDate || '').toLowerCase();
        
        // Extract URL components for better matching
        let urlComponents = [];
        let domain = '';
        let pathSegments = [];
        
        if (pageUrl) {
            try {
                const url = new URL(pageUrl);
                domain = url.hostname; // e.g., "www.example.com"
                
                // Get path segments (excluding empty segments)
                pathSegments = url.pathname.split('/')
                    .filter(segment => segment.length > 0);
                
                // Store full domain and all path segments for matching
                urlComponents = [domain, ...pathSegments];
                
                console.log(`URL components for ${pageUrl}:`, urlComponents);
            } catch (e) {
                console.warn("Could not parse URL components:", pageUrl, e);
                // If URL parsing fails, still try to extract domain conventionally
                const urlParts = pageUrl.split('/');
                if (urlParts.length > 2) {
                    domain = urlParts[2]; // e.g., "www.example.com"
                    urlComponents = [domain];
                }
            }
        }
        
        // For titles, create a clean version for matching (remove common words)
        const cleanPageTitle = pageTitle
            .replace(/\b(the|a|an|and|or|but|in|on|at|to|for|with|by|of)\b/gi, ' ')
            .replace(/\s+/g, ' ').trim();
            
        // Get important words from the title (>3 chars, not common words)
        const titleWords = cleanPageTitle.split(' ')
            .filter(word => word.length > 3)
            .map(word => word.toLowerCase());
            
        console.log(`Important title words for "${pageTitle}":`, titleWords);
        
        // Score all sections based on match quality
        const scoredSections = this.sections.map(section => {
            const sectionContent = section.content.toLowerCase();
            let score = 0;
            const matchDetails = {};
            
            // Skip if this section has already been assigned to another page with higher score
            // and we're respecting exclusivity
            if (respectExclusivity && 
                section.bestMatchPage && 
                section.bestMatchPage.url !== page.url && 
                section.bestMatchScore > 0) {
                return {
                    section,
                    score: 0,
                    matchDetails: {
                        excludedDueToExclusivity: true,
                        assignedToPage: section.bestMatchPage.title || section.bestMatchPage.url
                    }
                };
            }
            
            // 1. Title matching (highest priority)
            if (pageTitle) {
                // Exact title match (highest score)
                if (sectionContent.includes(pageTitle)) {
                    score += 100;
                    matchDetails.exactTitleMatch = true;
                } 
                // Clean title match
                else if (cleanPageTitle && sectionContent.includes(cleanPageTitle)) {
                    score += 90;
                    matchDetails.cleanTitleMatch = true;
                }
                // Partial title matching with important words
                else if (titleWords.length > 0) {
                    const matchedWords = titleWords.filter(word => sectionContent.includes(word));
                    const wordMatchRatio = matchedWords.length / titleWords.length;
                    
                    if (wordMatchRatio > 0) {
                        // Scale score up to 80 points based on % of words matched
                        const titleWordScore = Math.floor(80 * wordMatchRatio);
                        score += titleWordScore;
                        matchDetails.titleWordMatch = {
                            matched: matchedWords.length,
                            total: titleWords.length,
                            ratio: wordMatchRatio
                        };
                    }
                }
            }
            
            // 2. URL matching (second priority, weighted by specificity)
            if (pageUrl && urlComponents.length > 0) {
                // Score based on the longest URL component found
                let bestUrlMatch = '';
                let bestUrlMatchLength = 0;
                
                // Check full URL exact match first
                if (sectionContent.includes(pageUrl)) {
                    score += 75;
                    matchDetails.fullUrlMatch = true;
                } else {
                    // Check for URL component matches
                    for (const component of urlComponents) {
                        if (component.length > bestUrlMatchLength && sectionContent.includes(component)) {
                            bestUrlMatch = component;
                            bestUrlMatchLength = component.length;
                        }
                    }
                    
                    if (bestUrlMatchLength > 0) {
                        // Domain-only matches get fewer points
                        const isDomainOnlyMatch = bestUrlMatch === domain;
                        const urlMatchScore = isDomainOnlyMatch ? 20 : 40;
                        
                        // Adjust score based on how specific the match is
                        // (longer matches are more specific and get more points)
                        const specificityBonus = Math.min(30, bestUrlMatch.length / 2);
                        
                        score += urlMatchScore + specificityBonus;
                        matchDetails.urlComponentMatch = {
                            component: bestUrlMatch,
                            isDomainOnly: isDomainOnlyMatch
                        };
                    }
                }
            }
            
            // 3. Metadata matching (additional points)
            if (metaAuthor && sectionContent.includes(metaAuthor)) {
                score += 15;
                matchDetails.authorMatch = true;
            }
            
            if (metaDescription) {
                const descWords = metaDescription.split(' ')
                    .filter(word => word.length > 4);
                    
                const matchedDescWords = descWords.filter(word => sectionContent.includes(word));
                if (matchedDescWords.length > 0) {
                    const descMatchScore = Math.min(20, matchedDescWords.length * 2);
                    score += descMatchScore;
                    matchDetails.descriptionMatch = {
                        matched: matchedDescWords.length,
                        total: descWords.length
                    };
                }
            }
            
            if (metaDate && sectionContent.includes(metaDate)) {
                score += 10;
                matchDetails.dateMatch = true;
            }
            
            // Only consider sections with some level of matching
            return {
                section,
                score,
                matchDetails
            };
        }).filter(item => item.score > 0)
          .sort((a, b) => b.score - a.score);
        
        // Group sections by similar content (to handle duplicates)
        const uniqueSections = this._getUniqueBestSections(scoredSections);
        
        console.log(`Found ${uniqueSections.length} matching sections for page: ${page.title || page.url}`);
        
        // If we're not respecting exclusivity, update the best match info for each section
        if (!respectExclusivity) {
            uniqueSections.forEach(item => {
                const section = item.section;
                const score = item.score;
                
                // Only update if this is a better match than what was previously found
                if (!section.bestMatchScore || score > section.bestMatchScore) {
                    section.bestMatchScore = score;
                    section.bestMatchPage = page;
                }
            });
        }
        
        // Return the final sorted sections with their scores
        return uniqueSections.map(item => ({
            ...item.section,
            matchScore: item.score,
            matchDetails: item.matchDetails
        }));
    }
    
    /**
     * Find each section's best matching content page
     * @param {Array} contentPages - Array of content page objects
     * @returns {Map} - Map of content pages to their matching sections
     */
    assignSectionsToBestPages(contentPages) {
        if (!this.documentLoaded || !this.sections.length || !contentPages || !contentPages.length) {
            return new Map();
        }
        
        console.log("Assigning sections to their best matching content pages...");
        
        // Reset all section best match info
        this.sections.forEach(section => {
            section.bestMatchScore = 0;
            section.bestMatchPage = null;
        });
        
        // First pass: Find best content page match for each section
        contentPages.forEach(page => {
            // This call will update each section's bestMatchPage and bestMatchScore
            this.findMatchingSections(page, false);
        });
        
        // Second pass: Get sections for each page, respecting exclusivity
        const pageToSectionsMap = new Map();
        
        contentPages.forEach(page => {
            const exclusiveSections = this.findMatchingSections(page, true);
            if (exclusiveSections.length > 0) {
                pageToSectionsMap.set(page, exclusiveSections);
            }
        });
        
        console.log(`Assigned sections to ${pageToSectionsMap.size} content pages`);
        return pageToSectionsMap;
    }
    
    /**
     * Process scored sections to get unique best matches
     * @param {Array} scoredSections - Array of sections with scores
     * @returns {Array} - Array of unique best section matches
     * @private
     */
    _getUniqueBestSections(scoredSections) {
        if (scoredSections.length <= 1) {
            return scoredSections;
        }
        
        // Map to track best section by content hash to avoid duplicates
        const bestSectionsByContent = new Map();
        
        // Create a simplified content hash to group similar sections
        for (const scoredSection of scoredSections) {
            const section = scoredSection.section;
            // Create a simple hash of the first 100 chars to identify similar content
            const contentHash = section.content.substring(0, 100);
            
            // Keep only the highest scoring section for similar content
            if (!bestSectionsByContent.has(contentHash) || 
                bestSectionsByContent.get(contentHash).score < scoredSection.score) {
                bestSectionsByContent.set(contentHash, scoredSection);
            }
        }
        
        // Convert map back to array and sort by score
        return Array.from(bestSectionsByContent.values())
            .sort((a, b) => b.score - a.score);
    }

    /**
     * Check if a document is loaded
     * @returns {boolean} - True if a document is loaded
     */
    isDocumentLoaded() {
        return this.documentLoaded;
    }

    /**
     * Get the name of the loaded document
     * @returns {string} - The document file name
     */
    getDocumentName() {
        return this.fileName;
    }

    /**
     * Reset the processor state
     */
    reset() {
        this.sections = [];
        this.documentLoaded = false;
        this.fileName = '';
    }
}