let height = 5; // the number of tries.
let width;// Length of the combined hangul
let disassembledWidth; // Length of the separate hangul

let row = 0; // current row; different from height.

let gameOver = false;
let word; // correct answer.
// size of the square of the combined hangul.
let squareSize = 90;
let oneThirdSquare = squareSize / 3;
let twoThirdSquare = squareSize / 3 * 2;
let letterIndex = 0;

window.onload = function() {
    initialize();
};

function initialize() {
    // get answer
    word = WORDS[Math.floor(Math.random() * WORDS.length)];
    console.log(word);
    // 단어 길이(조합된 한글)
    width = word.length;
    // 단어 길이(자모)
    disassembledWidth = Hangul.disassemble(word).length;

    let spaceBetweenRects = 10;
    // find the element with the id board
    let board = document.getElementById('board');
    // set the height of the board
    board.style.height = (height * squareSize + spaceBetweenRects * height + 20).toString() + 'px';
    // set the width of the board
    board.style.width = (width * squareSize + spaceBetweenRects * width + 20).toString() + 'px';
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
                tile.style.height = jamoRect[3].toString() + 'px';
                tile.style.width = jamoRect[2].toString() + 'px';
                tile.style.position = 'absolute';
                tile.style.top = (offsetTop + combinedLettterCoordinate[1] + jamoRect[1]).toString() + 'px';
                tile.style.left = (offsetLeft + combinedLettterCoordinate[0] + jamoRect[0]).toString() + 'px';
                // set the id of the tile ; the id contains the row number and jamo index.
                tile.id = r.toString() + "-" + jamoIndex.toString();
                tile.innerText = "";
                // append to the board
                board.appendChild(tile);
                jamoIndex++;
            }
        }
        jamoIndex = 0;
    }
    // 키 입력 
	document.addEventListener("keyup", (e) => {
        keyup(e);
    });       
    // 가상 키보드 키 입력
    document.getElementById("keyboard-cont").addEventListener("click", (e) => {
        if(e.target.textContent === "Del") {
            keyup({code: "Backspace"});
        }
        else if(e.target.textContent === "Enter") {
            keyup({code: "Enter"});
        }
        else{
            keyup({code: "Key" + e.target.textContent, key: e.target.textContent});
        }
    });
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
    if(!WORDS.includes(str)) 
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


function isVowel(letter)
{
    let vowels = ['ㅏ', 'ㅑ', 'ㅓ', 'ㅕ', 'ㅗ', 'ㅛ', 'ㅜ', 'ㅠ', 'ㅡ', 'ㅣ', 'ㅐ', 'ㅔ', 'ㅒ', 'ㅖ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅢ'];
    return vowels.includes(letter);
}

function isRightVowel(letter)
{
    // if the letter is either ㅏ ㅑ ㅓ ㅕ ㅐ ㅔ ㅣ, it's a right vowel.
    if (letter === 'ㅏ' || letter === 'ㅑ' || letter === 'ㅓ' || letter === 'ㅕ' || letter === 'ㅐ' || letter === 'ㅔ' || letter === 'ㅣ')
    {
        return true;
    }
    else
    {
        return false;
    }
}

function update(disassembledStr) 
{
    let correct = 0;
    let rowElements = getRow(row);
    let disassembledAnswer = Hangul.disassemble(word);
    let disassembledWidth = disassembledStr.length;

    for (let c = 0; c < disassembledWidth; c++) {
        
        let currTile = rowElements[c];
        let letter = disassembledStr[c];

        // At the right position
        if (disassembledAnswer[c] === letter) {
            // sets the color of the currTile as green.
            currTile.style.backgroundColor = "green";
            correct += 1;
        } // At the wrong position
        else if (disassembledAnswer.includes(letter)) {
            // sets the color of the currTile as brown.
            currTile.style.backgroundColor = "brown";
        } // Not in the answer
        else {
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
    document.getElementById("popup").style.display = "none";
}