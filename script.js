// Function to shuffle and download numbers
function shuffleAndDownload() {
    const inputNumbers = document.getElementById('inputNumber').value.trim().split(',');

    // Validate input
    if (inputNumbers.length > 500) {
        alert("Please enter up to 50 numbers.");
        return;
    }

    for (let num of inputNumbers) {
        if (num.length !== 10 || !/^\d{10}$/.test(num)) {
            alert("Please ensure all numbers are valid 10-digit numbers.");
            return;
        }
    }

    const prefixes = ["050", "055", "054", "056",];
    const numUniqueNumbers = 1500;

    // Additional digits to incorporate in shuffling
    const additionalDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

    // Mapping for interesting patterns
    const patternMapping = {
        '0': '00', '1': '11', '2': '22', '3': '33', '4': '44',
        '5': '55', '6': '66', '7': '77', '8': '88', '9': '99', '12': '21', '123': '321'
    };

    // Generate a batch of shuffled numbers
    function generateBatch(inputNumber) {
        let shuffledNumbers = new Set();
        let numGenerated = 0;

        while (shuffledNumbers.size < numUniqueNumbers) {
            prefixes.forEach(prefix => {
                const shuffledNumber = shuffleNumber(inputNumber, prefix, additionalDigits, patternMapping);
                if (!shuffledNumbers.has(shuffledNumber)) {
                    shuffledNumbers.add(shuffledNumber);
                }
                if (shuffledNumbers.size >= numUniqueNumbers) {
                    return;
                }
            });
        }
        return Array.from(shuffledNumbers);
    }

    // Start generating batches for each input number
    Promise.all(inputNumbers.map(num => generateBatch(num))).then(allShuffledNumbers => {
        const data = [];

        // Prepare the data for each column
        inputNumbers.forEach((num, index) => {
            const columnData = [[`**${num}**`], ...allShuffledNumbers[index].map(shuffledNum => [shuffledNum])];
            if (data.length === 0) {
                columnData.forEach((row, rowIndex) => {
                    data[rowIndex] = row;
                });
            } else {
                columnData.forEach((row, rowIndex) => {
                    if (data[rowIndex]) {
                        data[rowIndex].push(row[0]);
                    } else {
                        data[rowIndex] = ['', ...Array(index).fill(''), row[0]];
                    }
                });
            }
        });

        // Create Excel workbook and sheet
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, 'ShuffledNumbers');

        // Save Excel file
        try {
            XLSX.writeFile(wb, 'ShuffledNumbers.xlsx');
        } catch (e) {
            console.error('Error saving file:', e);
        }
    });
}

// Function to check if a number has consecutive digits more than 3 times
function hasConsecutiveDigits(number) {
    const consecutiveRegex = /(.)\1{3}/; // Regex to match any digit repeated more than 3 times consecutively
    return consecutiveRegex.test(number);
}

// Function to shuffle digits
function shuffleNumber(number, prefix, additionalDigits, patternMapping) {
    const prefixLength = prefix.length;
    const remainingDigits = number.slice(prefixLength);

    // Convert remaining digits into an array and apply pattern mapping
    let shuffledDigits = remainingDigits.split('').map(digit => patternMapping[digit] || digit);

    // First pass: Remove consecutive duplicates before shuffling
    shuffledDigits = removeConsecutiveDuplicates(shuffledDigits);

    // Append additional random digits
    for (let i = 0; i < additionalDigits.length; i++) {
        // Add additional digit if not already present
        if (!shuffledDigits.includes(additionalDigits[i])) {
            shuffledDigits.push(additionalDigits[i]);
        }
    }

    // Second pass: Remove consecutive duplicates after appending additional digits
    shuffledDigits = removeConsecutiveDuplicates(shuffledDigits);

    // Shuffle the array again to mix additional digits
    shuffledDigits = shuffleArray(shuffledDigits);

    // Combine prefix and shuffled digits
    let shuffledNumber = prefix + shuffledDigits.join('');

    // Ensure the shuffled number is exactly 10 digits long
    if (shuffledNumber.length > 10) {
        shuffledNumber = shuffledNumber.slice(0, 10); // Truncate to 10 digits
    } else if (shuffledNumber.length < 10) {
        const remainingLength = 10 - shuffledNumber.length;
        shuffledNumber += additionalDigits.slice(0, remainingLength).join(''); // Pad with additional digits
    }

    return shuffledNumber;
}

// Function to shuffle the last seven digits with one another taken 2, 3, 4 digits at a time
function shuffleLastSevenDigits(number) {
    const lastSevenDigits = number.slice(-7);
    let results = [];

    // Helper to shuffle in groups
    function shuffleInGroups(digits, groupSize) {
        for (let i = 0; i <= digits.length - groupSize; i += groupSize) {
            let group = digits.slice(i, i + groupSize).split('');
            results.push(shuffleArray(group).join(''));
        }
    }

    // Shuffle in groups of 2, 3, and 4
    shuffleInGroups(lastSevenDigits, 2);
    shuffleInGroups(lastSevenDigits, 3);
    shuffleInGroups(lastSevenDigits, 4);

    return results;
}

// Helper function to remove consecutive duplicate digits
function removeConsecutiveDuplicates(digits) {
    let filteredDigits = [];
    let count = 0;

    for (let i = 0; i < digits.length; i++) {
        if (i === 0 || digits[i] !== digits[i - 1]) {
            filteredDigits.push(digits[i]);
            count = 1;
        } else {
            count++;
            if (count <= 3) {
                filteredDigits.push(digits[i]);
            }
        }
    }

    return filteredDigits;
}

// Helper function to shuffle array elements
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
