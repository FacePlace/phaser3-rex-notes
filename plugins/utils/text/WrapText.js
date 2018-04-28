import Pool from './../object/Pool.js';
import CONST from './const.js';

const GetValue = Phaser.Utils.GetValue;
const NO_NEWLINE = CONST.NO_NEWLINE;
const RAW_NEWLINE = CONST.RAW_NEWLINE;
const WRAPPED_NEWLINE = CONST.WRAPPED_NEWLINE;
const NO_WRAP = CONST.NO_WRAP;
const WORD_WRAP = CONST.WORD_WRAP;
const CHAR_WRAP = CONST.CHAR_WRAP;
const splitRegExp = CONST.SPLITREGEXP;

var WRAP_RESULT = [];
var WrapText = function (text, getTextWidth, wrapMode, wrapWidth, offset) {
    var retLines = WRAP_RESULT;
    LinesPool.freeArr(retLines);

    if (!text || !text.length) {
        return retLines;
    }

    var lines = text.split(splitRegExp),
        line, remainWidth, isLaseLine, newLineMode;
    for (var i = 0, linesLen = lines.length; i < linesLen; i++) {
        line = lines[i];
        newLineMode = (i === (linesLen - 1)) ? NO_NEWLINE : RAW_NEWLINE;

        if (i === 0) {
            remainWidth = wrapWidth - offset;
        } else {
            remainWidth = wrapWidth;
        }


        if (wrapMode === NO_WRAP) {
            var textWidth = getTextWidth(line);
            retLines.push(LinesPool.newline(line, textWidth, newLineMode));
            continue;
        }

        // short string testing
        if (line.length <= 100) {
            var textWidth = getTextWidth(line);
            if (textWidth <= remainWidth) {
                retLines.push(LinesPool.newline(line, textWidth, newLineMode));
                continue;
            }
        }

        // character mode
        var tokenArray;
        if (wrapMode === WORD_WRAP) {
            // word mode
            tokenArray = line.split(' ');
        } else {
            tokenArray = line;
        }
        var token;
        var curLineText = '',
            lineText = '',
            currLineWidth, lineWidth = 0;
        for (var j = 0, tokenLen = tokenArray.length; j < tokenLen; j++) {
            token = tokenArray[j];

            if ((wrapMode === WORD_WRAP) && (j > 0)) {
                // word mode
                curLineText += (' ' + token);
            } else {
                curLineText += token;
            }

            currLineWidth = getTextWidth(curLineText);
            if ((j > 0) && (currLineWidth > remainWidth)) {
                retLines.push(LinesPool.newline(lineText, lineWidth, WRAPPED_NEWLINE));
                remainWidth = wrapWidth;

                // new line
                curLineText = token;
                currLineWidth = getTextWidth(curLineText);
            }

            lineText = curLineText;
            lineWidth = currLineWidth;
        } // for token in tokenArray

        // flush remain text
        retLines.push(LinesPool.newline(lineText, lineWidth, newLineMode));

    } // for each line in lines

    return retLines;
};

var LinesPool = new Pool();
LinesPool.newline = function (text, width, newLineMode) {
    var l = this.allocate();
    if (l === null) {
        l = {};
    }
    l.text = text;
    l.width = width;
    l.newLineMode = newLineMode;
    return l;
};

export default WrapText;