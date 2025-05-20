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
     * Find sections that match a content page (by title or URL)
     * @param {Object} page - The content page object
     * @returns {Array} - Array of matching section objects
     */
    findMatchingSections(page) {
        if (!this.documentLoaded || !this.sections.length) {
            return [];
        }
        
        // Create normalized versions for matching
        let pageTitle = (page.title || '').toLowerCase();
        const pageUrl = (page.url || '').toLowerCase();
        
        // Extract domain from URL for better matching
        let domain = '';
        if (pageUrl) {
            try {
                const urlParts = pageUrl.split('/');
                if (urlParts.length > 2) {
                    domain = urlParts[2]; // e.g., "www.example.com"
                }
            } catch (e) {
                console.warn("Could not extract domain from URL:", pageUrl);
            }
        }
        
        // For titles, create a simpler version for matching (remove common words)
        if (pageTitle) {
            // Remove articles and common words for better matching
            pageTitle = pageTitle.replace(/\b(the|a|an|and|or|but|in|on|at|to|for|with|by|of)\b/gi, ' ');
            // Clean up multiple spaces
            pageTitle = pageTitle.replace(/\s+/g, ' ').trim();
        }
        
        // Find matching sections
        const matchingSections = this.sections.filter(section => {
            const sectionContent = section.content.toLowerCase();
            
            // Check for exact title match
            if (pageTitle && sectionContent.includes(pageTitle)) {
                return true;
            }
            
            // Check for URL/domain match
            if ((pageUrl && sectionContent.includes(pageUrl)) || 
                (domain && sectionContent.includes(domain))) {
                return true;
            }
            
            // For titles with multiple words, check if most of the important words are present
            if (pageTitle && pageTitle.length > 10) {
                const words = pageTitle.split(' ').filter(w => w.length > 3); // Only consider significant words
                if (words.length > 1) {
                    // Count how many significant words are present
                    const matchCount = words.filter(word => sectionContent.includes(word)).length;
                    // If more than 60% of the significant words match, consider it a match
                    if (matchCount >= Math.ceil(words.length * 0.6)) {
                        return true;
                    }
                }
            }
            
            return false;
        });
        
        console.log(`Found ${matchingSections.length} matching sections for page: ${page.title || page.url}`);
        return matchingSections;
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