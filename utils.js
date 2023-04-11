const fs = require('fs');
const util = require('util');
const fetch = require('cross-fetch');

// utils.js
class Utils {
    constructor(errorMessage) {
        this.errorMessage = errorMessage;
        console.log(this.errorMessage);
    }

    writeFile = util.promisify(fs.writeFile);

    throwErrorIfNull(value) {
        if (value === null || value === undefined) {
            throw new Error(this.errorMessage);
        }
    }

    async createFileFromUrl(url, filePath) {
        try {
            const response = await fetch(url);
            const buffer = await response.buffer();
            await this.writeFile(filePath, buffer);
            console.log(`File ${filePath} created successfully from ${url}`);
        } catch (error) {
            console.error(`Error creating file from ${url}: ${error}`);
        }
    }
}

module.exports = Utils;
