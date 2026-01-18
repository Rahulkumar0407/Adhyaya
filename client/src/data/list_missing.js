
const fs = require('fs');

const filePath = 'd:\\Adhyaya\\Adhyaya\\client\\src\\data\\dsaPatterns.js';
const content = fs.readFileSync(filePath, 'utf8');

// Regex to find items with TODO in code
// Pattern: "id": "...", ... "title": "...", ... "code": { ... "TODO: Implement" ... }
// This matches across lines, so we need careful regex or state machine.

// Simpler: Split by "items": [ ... ] content is hard because of nesting.
// Let's split by `        "id": "` which usually starts an item definition in this file.

const items = content.split(/^\s{6}"id": "/m); // indent 6 spaces usually for items in this file

const missing = [];

items.forEach((block, idx) => {
    if (idx === 0) return; // garbage before first item

    // Extract title
    const titleMatch = block.match(/"title": "(.*?)",/);
    const title = titleMatch ? titleMatch[1] : `Unknown Item ${idx}`;

    // Check for TODO
    if (block.includes('TODO: Implement')) {
        // Check if it has ANY implemented solution? 
        // If "TODO: Implement" appears, it likely means at least one language is missing.
        // User asked for "not code solution", implying completely missing or specific languages.
        // Let's list it if it has TODO.
        missing.push(title);
    }
});

console.log(`Found ${missing.length} problems with missing solutions.`);
// Print unique names
const uniqueMissing = [...new Set(missing)];
console.log(uniqueMissing.join('\n'));
