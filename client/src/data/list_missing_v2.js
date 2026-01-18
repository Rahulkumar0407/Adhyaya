
const fs = require('fs');

try {
    const filePath = 'd:\\Adhyaya\\Adhyaya\\client\\src\\data\\dsaPatterns.js';
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    let currentTitle = '';
    const missing = [];

    lines.forEach(line => {
        // Capture title
        if (line.includes('"title":')) {
            const match = line.match(/"title": "(.*?)"/);
            if (match) currentTitle = match[1];
        }

        // Check for TODO
        if (line.includes('TODO: Implement')) {
            if (currentTitle) missing.push(currentTitle);
        }
    });

    const unique = [...new Set(missing)];
    console.log(`Found ${unique.length} problems with missing solutions:`);
    console.log(unique.join('\n'));
} catch (e) {
    console.error(e);
}
