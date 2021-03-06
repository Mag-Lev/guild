
/* GRAMMAR
Root =
  (DiceRoll / Constant)*

Constant
  = sign:Sign? value:Integer {
    return { type: 'Constant', sign: sign || "+", value, syntax: text() }
  }

DiceRoll
  = sign:Sign? count:Integer "d" sides:Integer {
    return { type: 'DiceRoll', sign: sign || '+', count, sides, syntax: text() }
  }

Sign = "-" / "+"

Integer "integer"
  = [0-9]+ { return parseInt(text(), 10) }
*/

// parser.parse(input) -> throws ResultObject
// err.message for the human-friendly-enough parser error text
var parser = (function() {
  "use strict";

  /*
   * Generated by PEG.js 0.9.0.
   *
   * http://pegjs.org/
   */

  function peg$subclass(child, parent) {
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
  }

  function peg$SyntaxError(message, expected, found, location) {
    this.message  = message;
    this.expected = expected;
    this.found    = found;
    this.location = location;
    this.name     = "SyntaxError";

    if (typeof Error.captureStackTrace === "function") {
      Error.captureStackTrace(this, peg$SyntaxError);
    }
  }

  peg$subclass(peg$SyntaxError, Error);

  function peg$parse(input) {
    var options = arguments.length > 1 ? arguments[1] : {},
        parser  = this,

        peg$FAILED = {},

        peg$startRuleFunctions = { Root: peg$parseRoot },
        peg$startRuleFunction  = peg$parseRoot,

        peg$c0 = function(sign, value) {
            return { type: 'Constant', sign: sign || "+", value, syntax: text() }
          },
        peg$c1 = "d",
        peg$c2 = { type: "literal", value: "d", description: "\"d\"" },
        peg$c3 = function(sign, count, sides) {
            return { type: 'DiceRoll', sign: sign || '+', count, sides, syntax: text() }
          },
        peg$c4 = "-",
        peg$c5 = { type: "literal", value: "-", description: "\"-\"" },
        peg$c6 = "+",
        peg$c7 = { type: "literal", value: "+", description: "\"+\"" },
        peg$c8 = { type: "other", description: "integer" },
        peg$c9 = /^[0-9]/,
        peg$c10 = { type: "class", value: "[0-9]", description: "[0-9]" },
        peg$c11 = function() { return parseInt(text(), 10) },

        peg$currPos          = 0,
        peg$savedPos         = 0,
        peg$posDetailsCache  = [{ line: 1, column: 1, seenCR: false }],
        peg$maxFailPos       = 0,
        peg$maxFailExpected  = [],
        peg$silentFails      = 0,

        peg$result;

    if ("startRule" in options) {
      if (!(options.startRule in peg$startRuleFunctions)) {
        throw new Error("Can't start parsing from rule \"" + options.startRule + "\".");
      }

      peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
    }

    function text() {
      return input.substring(peg$savedPos, peg$currPos);
    }

    function location() {
      return peg$computeLocation(peg$savedPos, peg$currPos);
    }

    function expected(description) {
      throw peg$buildException(
        null,
        [{ type: "other", description: description }],
        input.substring(peg$savedPos, peg$currPos),
        peg$computeLocation(peg$savedPos, peg$currPos)
      );
    }

    function error(message) {
      throw peg$buildException(
        message,
        null,
        input.substring(peg$savedPos, peg$currPos),
        peg$computeLocation(peg$savedPos, peg$currPos)
      );
    }

    function peg$computePosDetails(pos) {
      var details = peg$posDetailsCache[pos],
          p, ch;

      if (details) {
        return details;
      } else {
        p = pos - 1;
        while (!peg$posDetailsCache[p]) {
          p--;
        }

        details = peg$posDetailsCache[p];
        details = {
          line:   details.line,
          column: details.column,
          seenCR: details.seenCR
        };

        while (p < pos) {
          ch = input.charAt(p);
          if (ch === "\n") {
            if (!details.seenCR) { details.line++; }
            details.column = 1;
            details.seenCR = false;
          } else if (ch === "\r" || ch === "\u2028" || ch === "\u2029") {
            details.line++;
            details.column = 1;
            details.seenCR = true;
          } else {
            details.column++;
            details.seenCR = false;
          }

          p++;
        }

        peg$posDetailsCache[pos] = details;
        return details;
      }
    }

    function peg$computeLocation(startPos, endPos) {
      var startPosDetails = peg$computePosDetails(startPos),
          endPosDetails   = peg$computePosDetails(endPos);

      return {
        start: {
          offset: startPos,
          line:   startPosDetails.line,
          column: startPosDetails.column
        },
        end: {
          offset: endPos,
          line:   endPosDetails.line,
          column: endPosDetails.column
        }
      };
    }

    function peg$fail(expected) {
      if (peg$currPos < peg$maxFailPos) { return; }

      if (peg$currPos > peg$maxFailPos) {
        peg$maxFailPos = peg$currPos;
        peg$maxFailExpected = [];
      }

      peg$maxFailExpected.push(expected);
    }

    function peg$buildException(message, expected, found, location) {
      function cleanupExpected(expected) {
        var i = 1;

        expected.sort(function(a, b) {
          if (a.description < b.description) {
            return -1;
          } else if (a.description > b.description) {
            return 1;
          } else {
            return 0;
          }
        });

        while (i < expected.length) {
          if (expected[i - 1] === expected[i]) {
            expected.splice(i, 1);
          } else {
            i++;
          }
        }
      }

      function buildMessage(expected, found) {
        function stringEscape(s) {
          function hex(ch) { return ch.charCodeAt(0).toString(16).toUpperCase(); }

          return s
            .replace(/\\/g,   '\\\\')
            .replace(/"/g,    '\\"')
            .replace(/\x08/g, '\\b')
            .replace(/\t/g,   '\\t')
            .replace(/\n/g,   '\\n')
            .replace(/\f/g,   '\\f')
            .replace(/\r/g,   '\\r')
            .replace(/[\x00-\x07\x0B\x0E\x0F]/g, function(ch) { return '\\x0' + hex(ch); })
            .replace(/[\x10-\x1F\x80-\xFF]/g,    function(ch) { return '\\x'  + hex(ch); })
            .replace(/[\u0100-\u0FFF]/g,         function(ch) { return '\\u0' + hex(ch); })
            .replace(/[\u1000-\uFFFF]/g,         function(ch) { return '\\u'  + hex(ch); });
        }

        var expectedDescs = new Array(expected.length),
            expectedDesc, foundDesc, i;

        for (i = 0; i < expected.length; i++) {
          expectedDescs[i] = expected[i].description;
        }

        expectedDesc = expected.length > 1
          ? expectedDescs.slice(0, -1).join(", ")
              + " or "
              + expectedDescs[expected.length - 1]
          : expectedDescs[0];

        foundDesc = found ? "\"" + stringEscape(found) + "\"" : "end of input";

        return "Expected " + expectedDesc + " but " + foundDesc + " found.";
      }

      if (expected !== null) {
        cleanupExpected(expected);
      }

      return new peg$SyntaxError(
        message !== null ? message : buildMessage(expected, found),
        expected,
        found,
        location
      );
    }

    function peg$parseRoot() {
      var s0, s1;

      s0 = [];
      s1 = peg$parseDiceRoll();
      if (s1 === peg$FAILED) {
        s1 = peg$parseConstant();
      }
      while (s1 !== peg$FAILED) {
        s0.push(s1);
        s1 = peg$parseDiceRoll();
        if (s1 === peg$FAILED) {
          s1 = peg$parseConstant();
        }
      }

      return s0;
    }

    function peg$parseConstant() {
      var s0, s1, s2;

      s0 = peg$currPos;
      s1 = peg$parseSign();
      if (s1 === peg$FAILED) {
        s1 = null;
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseInteger();
        if (s2 !== peg$FAILED) {
          peg$savedPos = s0;
          s1 = peg$c0(s1, s2);
          s0 = s1;
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseDiceRoll() {
      var s0, s1, s2, s3, s4;

      s0 = peg$currPos;
      s1 = peg$parseSign();
      if (s1 === peg$FAILED) {
        s1 = null;
      }
      if (s1 !== peg$FAILED) {
        s2 = peg$parseInteger();
        if (s2 !== peg$FAILED) {
          if (input.charCodeAt(peg$currPos) === 100) {
            s3 = peg$c1;
            peg$currPos++;
          } else {
            s3 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c2); }
          }
          if (s3 !== peg$FAILED) {
            s4 = peg$parseInteger();
            if (s4 !== peg$FAILED) {
              peg$savedPos = s0;
              s1 = peg$c3(s1, s2, s4);
              s0 = s1;
            } else {
              peg$currPos = s0;
              s0 = peg$FAILED;
            }
          } else {
            peg$currPos = s0;
            s0 = peg$FAILED;
          }
        } else {
          peg$currPos = s0;
          s0 = peg$FAILED;
        }
      } else {
        peg$currPos = s0;
        s0 = peg$FAILED;
      }

      return s0;
    }

    function peg$parseSign() {
      var s0;

      if (input.charCodeAt(peg$currPos) === 45) {
        s0 = peg$c4;
        peg$currPos++;
      } else {
        s0 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c5); }
      }
      if (s0 === peg$FAILED) {
        if (input.charCodeAt(peg$currPos) === 43) {
          s0 = peg$c6;
          peg$currPos++;
        } else {
          s0 = peg$FAILED;
          if (peg$silentFails === 0) { peg$fail(peg$c7); }
        }
      }

      return s0;
    }

    function peg$parseInteger() {
      var s0, s1, s2;

      peg$silentFails++;
      s0 = peg$currPos;
      s1 = [];
      if (peg$c9.test(input.charAt(peg$currPos))) {
        s2 = input.charAt(peg$currPos);
        peg$currPos++;
      } else {
        s2 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c10); }
      }
      if (s2 !== peg$FAILED) {
        while (s2 !== peg$FAILED) {
          s1.push(s2);
          if (peg$c9.test(input.charAt(peg$currPos))) {
            s2 = input.charAt(peg$currPos);
            peg$currPos++;
          } else {
            s2 = peg$FAILED;
            if (peg$silentFails === 0) { peg$fail(peg$c10); }
          }
        }
      } else {
        s1 = peg$FAILED;
      }
      if (s1 !== peg$FAILED) {
        peg$savedPos = s0;
        s1 = peg$c11();
      }
      s0 = s1;
      peg$silentFails--;
      if (s0 === peg$FAILED) {
        s1 = peg$FAILED;
        if (peg$silentFails === 0) { peg$fail(peg$c8); }
      }

      return s0;
    }

    peg$result = peg$startRuleFunction();

    if (peg$result !== peg$FAILED && peg$currPos === input.length) {
      return peg$result;
    } else {
      if (peg$result !== peg$FAILED && peg$currPos < input.length) {
        peg$fail({ type: "end", description: "end of input" });
      }

      throw peg$buildException(
        null,
        peg$maxFailExpected,
        peg$maxFailPos < input.length ? input.charAt(peg$maxFailPos) : null,
        peg$maxFailPos < input.length
          ? peg$computeLocation(peg$maxFailPos, peg$maxFailPos + 1)
          : peg$computeLocation(peg$maxFailPos, peg$maxFailPos)
      );
    }
  }

  return {
    SyntaxError: peg$SyntaxError,
    parse:       peg$parse
  };
})();

// Constant :: { type: 'Constant', sign: "-" / "+", value: Int }
// DiceRoll :: { type: 'DiceRoll', sign: "-" / "+", count: Int, sides: Int }
//
// this function adds a .values property to all rolls
// 3d6 .values = [1, 6, 5]
// then we can reduce a sum across all .values for each roll term
//
// Returns { total: Int, rolls: RollObject }
exports.roll = function (syntax) {
  // throws if syntax is invalid
  let rolls;
  try {
    rolls = parser.parse(syntax);
  } catch (err) {
    throw err.message;
  }
  // === Validations
  // Ensure max of 5 terms
  if (rolls.length > 5) {
    throw 'Cannot have more than 5 roll terms';
  }
  rolls.forEach(validateRoll);
  // Now do actual rolls
  rolls.forEach(roll => {
    if (roll.type === 'DiceRoll') {
      roll.values = rollValues(roll.sign, roll.count, roll.sides);
    } else {
      roll.values = [roll.sign === '-' ? -roll.value : roll.value];
    }
  });
  const total = rolls.reduce(function (memo, roll) {
    return memo + sum(roll.values);
  }, 0);
  return { total, rolls };
};

////////////////////////////////////////////////////////////
// HELPERS
////////////////////////////////////////////////////////////

function sum (nums) {
  return nums.reduce(function (memo, num) {
    return memo + num;
  }, 0);
}

// 999 is chosen so <input> boxes can just have maxlength="999"
function validateRoll (roll) {
  // Constant rolls have a max of +/- 999
  if (roll.type === 'Constant' && roll.value > 999) {
    throw 'Constant roll value cannot exceed 1000';
  }
  // DiceRolls
  if (roll.sides > 999) {
    throw 'DiceRoll cannot have more than 999 sides';
  }
  if (roll.count > 999) {
    throw 'DiceRoll cannot roll more than 999 dice';
  }
}

// for '3d6', diceCount=3, sides=6, output=[1, 5, 6]
function rollValues (sign, diceCount, sides) {
  let values = [];
  for (let i = 0; i < diceCount; i++) {
    var val = Math.floor(Math.random() * sides) + 1;
    if (sign === '-') val = -val;
    values.push(val);
  }
  return values;
};
