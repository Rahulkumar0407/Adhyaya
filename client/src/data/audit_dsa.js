
const fs = require('fs');
const path = require('path');

// Manually import the array from the file content since it's an ES module and we are running in node
// I'll read the file and eval the array part or just use a regex/parsing if simple enough.
// Actually, I can just require it if I change the syntax to valid CJS or use dynamic import.
// Given constraints, I'll read the text and parse it loosely or try to load it.

async function checkContent() {
    const filePath = 'd:\\Adhyaya\\Adhyaya\\client\\src\\data\\dsaPatterns.js';
    let content = fs.readFileSync(filePath, 'utf8');

    // Remove export const and make it just a variable or parsing
    // This is a bit risky with complex objects. 
    // Let's try to just use Regex to find items and check them.

    // Better approach: Create a temporary file that exports in CJS format and require it.
    const tempFile = 'd:\\Adhyaya\\Adhyaya\\client\\src\\data\\temp_audit.js';

    // Replace export const dsaPatterns with module.exports = 
    // and remove imports if any.
    let cjsContent = content.replace(/export const dsaPatterns =/, 'module.exports =')
        .replace(/import .*? from .*?;/g, '')
    // Remove helper functions dependencies if any or mock them
    // The file seems to have helper functions at the bottom.
    // I need to be careful.

    // Let's look at the file end.
    // Use grep to see if there are other exports.

    // Simpler: I will just use regex to find items that have "TODO: Implement" or missing fields.

    // Actually, let's try to just load it as ES module? Node might support it.
    // But invalid file ext for mjs.

    // Let's try to construct the object using eval in a safe context or just regex.
    // Regex is safer for "TODO" check.

    // Find all items
    const missingPython = [];
    const missingCpp = [];
    const missingJava = [];
    const missingNotes = [];

    // We can iterate over the file content assuming standard formatting
    // But matching braces is hard with regex.

    // Let's try the CJS conversion, it's usually robust enough for data files.
    cjsContent = cjsContent.replace('export const getAllItems', '//');
    cjsContent = cjsContent.replace('export const getPatternBySlug', '//');
    cjsContent = cjsContent.replace('export const getItemBySlug', '//');
    cjsContent = cjsContent.replace('export const calculateProgress', '//');

    fs.writeFileSync(tempFile, cjsContent);

    try {
        const patterns = require(tempFile);

        patterns.forEach(p => {
            p.items.forEach(item => {
                // Check solutions
                if (!item.solutions || !item.solutions.code) {
                    // console.log(`Missing all solutions: ${item.title}`);
                } else {
                    const code = item.solutions.code;
                    if (!code.python || code.python.includes('TODO: Implement')) missingPython.push(item.title);
                    if (!code.cpp || code.cpp.includes('TODO: Implement')) missingCpp.push(item.title);
                    if (!code.java || code.java.includes('TODO: Implement')) missingJava.push(item.title);
                }

                // Check notes
                if (!item.lectureNotesSvg && !item.lectureNotesPdf && (!p.lectureNotes || p.lectureNotes.length === 0)) {
                    // Start strict: item must have its own note or pattern must have note
                    // Actually getting the logic from DSAItemDetail:
                    // primaryNote = item.lectureNotesSvg || item.lectureNotesPdf 
                    // || (isTheory ? pattern.lectureNotes : null)

                    const hasItemNote = item.lectureNotesSvg || item.lectureNotesPdf;
                    const isTheory = item.difficulty === 'theory';
                    const hasPatternNote = p.lectureNotes && p.lectureNotes.length > 0;

                    if (!hasItemNote && (!isTheory || !hasPatternNote)) {
                        missingNotes.push(item.title);
                    }
                }
            });
        });

        console.log('--- Problems missing PYTHON solution ---');
        console.log(JSON.stringify(missingPython, null, 2));

        console.log('\n--- Problems missing CPP solution ---');
        console.log(JSON.stringify(missingCpp, null, 2));

        console.log('\n--- Problems missing JAVA solution ---');
        console.log(JSON.stringify(missingJava, null, 2));

        console.log('\n--- Problems missing NOTES ---');
        console.log(JSON.stringify(missingNotes, null, 2));

    } catch (e) {
        console.error("Error parsing:", e);
    } finally {
        if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
    }
}

checkContent();
