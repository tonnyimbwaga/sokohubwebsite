const fs = require('fs');
const path = require('path');

function listFiles(dir, prefix = '') {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    // List files first
    for (const entry of entries) {
        if (entry.isFile()) {
            const fullPath = path.join(dir, entry.name);
            const stats = fs.statSync(fullPath);
            console.log(`${prefix}📄 ${entry.name} (${(stats.size / 1024).toFixed(2)} KB)`);
        }
    }

    // Then list directories
    for (const entry of entries) {
        if (entry.isDirectory()) {
            console.log(`${prefix}📁 ${entry.name}/`);
            // Only recurse deeper if it's not a huge folder or specify depth
            if (prefix.length < 4) {
                listFiles(path.join(dir, entry.name), prefix + '  ');
            }
        }
    }
}

const target = process.argv[2] || '.open-next';
console.log(`\n--- Listing files in ${target} ---`);
try {
    if (fs.existsSync(target)) {
        listFiles(target);
    } else {
        console.log(`Directory ${target} not found.`);
    }
} catch (err) {
    console.error(`Error listing files: ${err.message}`);
}
console.log(`--- End of listing ---\n`);
