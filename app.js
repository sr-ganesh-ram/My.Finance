// wwwroot/js/app.js

// Function to initialize Highlight.js
window.initHighlightJs = () => {
    console.log("Initializing Highlight.js...");
    if (typeof hljs !== 'undefined') {
        hljs.highlightAll();
        console.log("Highlight.js initialized.");
    } else {
        console.error("Highlight.js not loaded.");
    }
};

// Function to initialize Mermaid.js
window.initMermaidJs = () => {
    console.log("Initializing Mermaid.js...");
    if (typeof mermaid !== 'undefined') {
        mermaid.initialize({
            startOnLoad: false, // We will manually trigger it after Blazor render
            theme: 'dark' // Or 'default' or 'forest' etc., based on your preference
        });
        // Manually render the mermaid elements if startOnLoad is false
        // This is important because Blazor renders dynamically
        mermaid.init(undefined, document.querySelectorAll('.mermaid'));
        console.log("Mermaid.js initialized.");
    } else {
        console.error("Mermaid.js not loaded.");
    }
};

// A generic function to log a message (for demonstration)
window.logMessage = (message) => {
    console.log(`Blazor says: ${message}`);
};
