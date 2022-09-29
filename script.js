let height = 6; // the number of tries.
let width;// Length of the combined hangul
let disassembledWidth; // Length of the separate hangul

let row = 0; // current row; different from height.

let gameOver = false;
let word; // correct answer.
// size of the square of the combined hangul.
let squareSize;
let oneThirdSquare;
let twoThirdSquare;
let letterIndex = 0;
let shiftPressed = false;

function initialize() {
    // get answer
    word = WORDS[Math.floor(Math.random() * WORDS.length)];
    console.log(word);
    // 단어 길이(조합된 한글)
    width = word.length;
    // 단어 길이(자모)
    disassembledWidth = Hangul.disassemble(word).length;

    let spaceBetweenRects = 5;
    
    let screenWidth = window.innerWidth;
    squareSize = (screenWidth * 0.15) / width - spaceBetweenRects;
    oneThirdSquare = squareSize / 3;
    twoThirdSquare = squareSize / 3 * 2;
    // find the element with the id board
    let board = document.getElementById('board');
    // set the height of the board
    board.style.height = (height * squareSize + spaceBetweenRects * (height - 1) + 15).toString() + 'px';
    // set the width of the board
    board.style.width = (width * squareSize + spaceBetweenRects * (width - 1) + 15).toString() + 'px';
    // draw the border of the board.
    board.style.border = '2px solid black';
    let jamoIndex = 0;
    let offsetLeft = board.offsetLeft + 10;
    let offsetTop = board.offsetTop + 10;

    for (let r = 0; r < height; r++) 
    {
        for(let combineIndex = 0; combineIndex < width; combineIndex++) 
        {
            // get the coordinate of the combined hangul.            
            let combinedLettterCoordinate = getCombinedLetterCoordinate(r, combineIndex, spaceBetweenRects, squareSize);
            // get the coordinate of the each separate hangul jamo of the combined one.
            let separateJamo = Hangul.disassemble(word[combineIndex]);
            for (let c = 0; c < separateJamo.length; c++) 
            {
                let jamoRect = getJamoRect(squareSize, separateJamo[c], c);
                // make a tile.
                let tile = document.createElement('div');
                tile.classList.add("tile");
                
                // append to the board
                board.appendChild(tile);
                tile.style.position = 'absolute';
                tile.style.height = jamoRect[3].toString() + 'px';
                tile.style.width = jamoRect[2].toString() + 'px';
                tile.style.top = (offsetTop + combinedLettterCoordinate[1] + jamoRect[1]).toString() + 'px';
                tile.style.left = (offsetLeft + combinedLettterCoordinate[0] + jamoRect[0]).toString() + 'px';
                // set the id of the tile ; the id contains the row number and jamo index.
                tile.id = r.toString() + "-" + jamoIndex.toString();
                tile.innerText = "";
                jamoIndex++;
            }
        }
        jamoIndex = 0;
    }
    // 키 입력 
	document.addEventListener("keyup", (e) => {
        keyup(e);
    });       
}

function toggleKeyboardShift()
{
    // get the virtual keyboard
    let keyboard = document.getElementById("keyboard-cont");
    // from each key, get the text content, and toggle its double-single consonant state, and change the button text accordingly.
    for(let i = 0; i < keyboard.children.length; i++)
    {
        let row = keyboard.children[i];
        // each key in the row
        for(let j = 0; j < row.children.length; j++)
        {
            let key = row.children[j];
            let text = key.value;
            if(shiftPressed)
            {
                key.value = convertToDoubleConsonant(text);
            }
            else
            {
                key.value = convertToSingleConsonant(text);
            }
        }
    }
}

function virtualKeyboardPressed(key)
{
    if(key === "Del") {
        keyup({code: "Backspace"});
    }
    else if(key === "Enter") {
        keyup({code: "Enter"});
    }
    else if(key === "Shift")
    {
        shiftPressed = !shiftPressed;
        toggleKeyboardShift();

    }
    else{
        if(shiftPressed)
        {
            key = convertToDoubleConsonant(key);
        }
        else
        {
            key = convertToSingleConsonant(key);
        }
        keyup({code: "Key" + key, key: key});
    }
}

function keyup(e) {
    if(gameOver) return; 
    var hangul = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;
    var hangulLetter = convertAlphabetKeyStrokeToHangul(e.key);
    if (hangul.test(hangulLetter))
    {
        insert(hangulLetter);
    }
    else if (e.code === "Backspace") 
    {
        backspace();
    }
    else if (e.code === "Enter" && letterIndex === disassembledWidth) 
    {
        checkGuess();
    }
    if (!gameOver && row === height) 
    {
        gameOver = true;
        document.getElementById("answer").innerText = word;
        alert("Game Over!");
    }
}

function getCombinedLetterCoordinate(row, col, space, squareSize) {
    let x = col * squareSize + space * col;
    let y = row * squareSize + space * row;
    return [x, y];
}

function insert(hangulLetter)
{
    if (letterIndex < disassembledWidth) {
        let currTile = document.getElementById(row.toString() + '-' + letterIndex.toString());
        if (currTile.innerText === "") {
          currTile.innerText = hangulLetter;
          letterIndex += 1;
        }
      }
}

function checkGuess()
{
    var str = "";
    for(let c = 0; c < disassembledWidth; c++) {
        let currTile = document.getElementById(row.toString() + '-' + c.toString());
        str += currTile.innerText;
    }
    var disassembledStr = str;
    str = Hangul.assemble(str);
    if(!ALL_WORDS.includes(str)) 
    {
        alert(str + "은 단어 목록에 없습니다.");
        return;
    }
    update(disassembledStr);
    // carriage return
    row++;
    letterIndex = 0;
}

function backspace() {
    if (0 < letterIndex && letterIndex <= disassembledWidth) {
      letterIndex -= 1;
    }
    let currTile = document.getElementById(row.toString() + '-' + letterIndex.toString());
    currTile.innerText = "";
}

function getJamoRect(squareSize, letter, jamoIndex)
{
    // if the letter is a vowel,
    if(isVowel(letter))
    {
        return getVowelRect(squareSize, letter);
    }
    // if the letter is a consonant,
    else
    {
        return getConsonantRect(squareSize, jamoIndex);
    }
}

function getConsonantRect(squareSize, jamoIndex)
{
    if(jamoIndex === 0)
    {
        return [0, 0, twoThirdSquare, oneThirdSquare];
    }
    else
    {
        return [0, twoThirdSquare, squareSize, oneThirdSquare];
    }
}

function getVowelRect(squareSize, letter)
{
    // if it's a right vowel, the x coordinate is at the right half of the square.
    if(isRightVowel(letter))
    {
        return [twoThirdSquare, 0, oneThirdSquare, twoThirdSquare];
    }
    // otherwise, it's right beneath the consonant.
    else
    {
        return [0, oneThirdSquare, twoThirdSquare, oneThirdSquare];
    }
}

// 영타를 한글로
function convertAlphabetKeyStrokeToHangul(keyStroke) 
{
    switch(keyStroke) {
        case "Q": return "ㅃ";
        case "q": return "ㅂ";
        case "W": return "ㅉ";
        case "w": return "ㅈ";
        case "E": return "ㄸ";
        case "e": return "ㄷ";
        case "R": return "ㄲ";
        case "r": return "ㄱ";
        case "T": return "ㅆ";
        case "t": return "ㅅ";
        case "y": return "ㅛ";
        case "u": return "ㅕ";
        case "i": return "ㅑ";
        case "o": return "ㅐ";
        case "p": return "ㅔ";
        case "a": return "ㅁ";
        case "s": return "ㄴ";
        case "d": return "ㅇ";
        case "f": return "ㄹ";
        case "g": return "ㅎ";
        case "h": return "ㅗ";
        case "j": return "ㅓ";
        case "k": return "ㅏ";
        case "l": return "ㅣ";
        case "z": return "ㅋ";
        case "x": return "ㅌ";
        case "c": return "ㅊ";
        case "v": return "ㅍ";
        case "b": return "ㅠ";
        case "n": return "ㅜ";
        case "m": return "ㅡ";
        default: return keyStroke;
    }
}

// function : determines if the character is consonant or vowel
function isConsonant(letter) {
    if (letter === "ㄱ" || letter === "ㄴ" || letter === "ㄷ" || letter === "ㄹ" || letter === "ㅁ" || letter === "ㅂ" || letter === "ㅅ" || letter === "ㅇ" || letter === "ㅈ" || letter === "ㅊ" || letter === "ㅋ" || letter === "ㅌ" || letter === "ㅍ" || letter === "ㅎ") {
        return true;
    }
    // also true when the letter is a double consonant.
    else if (letter === "ㄲ" || letter === "ㄸ" || letter === "ㅃ" || letter === "ㅆ" || letter === "ㅉ") {
        return true;
    }
    return false;
}

function convertToDoubleConsonant(letter) {
    switch(letter) {
        case "ㄱ": return "ㄲ";
        case "ㄷ": return "ㄸ";
        case "ㅂ": return "ㅃ";
        case "ㅅ": return "ㅆ";
        case "ㅈ": return "ㅉ";
        case "ㅐ": return "ㅒ";
        case "ㅔ": return "ㅖ";
        default: return letter;
    }
}

function convertToSingleConsonant(letter) {
    switch(letter) {
        case "ㄲ": return "ㄱ";
        case "ㄸ": return "ㄷ";
        case "ㅃ": return "ㅂ";
        case "ㅆ": return "ㅅ";
        case "ㅉ": return "ㅈ";
        case "ㅒ": return "ㅐ";
        case "ㅖ": return "ㅔ";
        default: return letter;
    }
}


function isVowel(letter)
{
    let vowels = ['ㅏ', 'ㅑ', 'ㅓ', 'ㅕ', 'ㅗ', 'ㅛ', 'ㅜ', 'ㅠ', 'ㅡ', 'ㅣ', 'ㅐ', 'ㅔ', 'ㅒ', 'ㅖ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅢ'];
    return vowels.includes(letter);
}

function isRightVowel(letter)
{
    if(letter === 'ㅗ' || letter === 'ㅜ' || letter === 'ㅡ' || letter === 'ㅛ' || letter === 'ㅠ')
    {
        return false;
    }
    else
    {
        return true;
    }
}

function update(disassembledStr) 
{
    let correct = 0;
    let rowElements = getRow(row);
    let disassembledAnswer = Hangul.disassemble(word);
    let disassembledWidth = disassembledStr.length;
    let letterCount = {};
    let brownIndexes = {};
    // get letter count from the right answer
    for(let i = 0; i < disassembledAnswer.length; i++)
    {
        let letter = disassembledAnswer[i];
        if(letterCount[letter] === undefined)
        {
            letterCount[letter] = 1;
        }
        else
        {
            letterCount[letter]++;
        }
    }
    for (let c = 0; c < disassembledWidth; c++) {
        let currTile = rowElements[c];
        let letter = disassembledStr[c];
        // At the right position
        if (disassembledAnswer[c] === letter) {
            // sets the color of the currTile as green.
            currTile.style.backgroundColor = "green";
            letterCount[letter] = letterCount[letter] - 1;
            console.log(letterCount[letter] + " " + letter);
            correct += 1;
        } // At the wrong position
        else if (disassembledAnswer.includes(letter)) {
            // if there isn't brownIndexes[letter]
            if (!brownIndexes[letter]) {
                brownIndexes[letter] = [];
            }
            brownIndexes[letter].push(c);
        } // Not in the answer
        else {
            currTile.style.backgroundColor = "gray";
        }
    }
    // 글자가 맞는데 위치가 틀렸으면서, 그 글자가 한번 더 나오는 경우, 타일을 브라운으로 바꿔준다.
    for (let letter in brownIndexes) {
        let indexes = brownIndexes[letter];
        let count = letterCount[letter] < indexes.length ? letterCount[letter] : indexes.length;
        console.log(letter + " " + count);
        for (let i = 0; i < count; i++) {
            let position = indexes[i];
            let currTile = rowElements[position];
            currTile.style.backgroundColor = "brown";
        }
        // 글자가 한번 더 나오지 않는 경우, 타일을 회색으로 바꿔준다.
        for (let i = count; i < indexes.length; i++) {
            let position = indexes[i];
            let currTile = rowElements[position];
            currTile.style.backgroundColor = "gray";
        }
    }
    // if all the letters are correct, then the word is correct.
    if (correct === disassembledWidth) 
    {
        gameOver = true;
        document.getElementById("answer").innerText = word;
        alert("정답입니다!");
    }
};

// function to get elements by id with the row number
function getRow(row) {
    let rowElements = [];
    for (let c = 0; c < disassembledWidth; c++) {
        rowElements.push(document.getElementById(row.toString() + '-' + c.toString()));
    }
    return rowElements;
};

function closePopup()
{
    document.getElementById("tutorial").style.display = "none";
    initialize();
}