
const fs = require('fs');

try {
    const filePath = 'd:\\Adhyaya\\Adhyaya\\client\\src\\data\\dsaPatterns.js';
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    let currentTitle = '';
    const missingCpp = [];
    const missingJava = [];

    lines.forEach(line => {
        // Capture title
        if (line.includes('"title":')) {
            const match = line.match(/"title": "(.*?)"/);
            if (match) currentTitle = match[1];
        }

        // Check for TODO in C++
        if (line.includes('"cpp":') && line.includes('TODO: Implement')) {
            if (currentTitle) missingCpp.push(currentTitle);
        }

        // Check for TODO in Java
        if (line.includes('"java":') && line.includes('TODO: Implement')) {
            if (currentTitle) missingJava.push(currentTitle);
        }
    });

    console.log(`Missing C++ Solutions: ${missingCpp.length}`);
    console.log(missingCpp.join('\n'));

    console.log(`\nMissing Java Solutions: ${missingJava.length}`);
    console.log(missingJava.join('\n'));

} catch (e) {
    console.error(e);
}
