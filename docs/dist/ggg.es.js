var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
var Syntax$2 = {
  Note: "Note",
  Rest: "Rest",
  Octave: "Octave",
  OctaveShift: "OctaveShift",
  NoteLength: "NoteLength",
  NoteVelocity: "NoteVelocity",
  NoteQuantize: "NoteQuantize",
  Tempo: "Tempo",
  InfiniteLoop: "InfiniteLoop",
  LoopBegin: "LoopBegin",
  LoopExit: "LoopExit",
  LoopEnd: "LoopEnd"
};
var DefaultParams$1 = {
  tempo: 120,
  octave: 4,
  length: 4,
  velocity: 100,
  quantize: 75,
  loopCount: 2
};
var _createClass$2 = function() {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor)
        descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }
  return function(Constructor, protoProps, staticProps) {
    if (protoProps)
      defineProperties(Constructor.prototype, protoProps);
    if (staticProps)
      defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();
function _classCallCheck$2(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
var Scanner$1 = function() {
  function Scanner2(source) {
    _classCallCheck$2(this, Scanner2);
    this.source = source;
    this.index = 0;
  }
  _createClass$2(Scanner2, [{
    key: "hasNext",
    value: function hasNext() {
      return this.index < this.source.length;
    }
  }, {
    key: "peek",
    value: function peek() {
      return this.source.charAt(this.index) || "";
    }
  }, {
    key: "next",
    value: function next() {
      return this.source.charAt(this.index++) || "";
    }
  }, {
    key: "forward",
    value: function forward() {
      while (this.hasNext() && this.match(/\s/)) {
        this.index += 1;
      }
    }
  }, {
    key: "match",
    value: function match(matcher) {
      if (matcher instanceof RegExp) {
        return matcher.test(this.peek());
      }
      return this.peek() === matcher;
    }
  }, {
    key: "expect",
    value: function expect(matcher) {
      if (!this.match(matcher)) {
        this.throwUnexpectedToken();
      }
      this.index += 1;
    }
  }, {
    key: "scan",
    value: function scan(matcher) {
      var target = this.source.substr(this.index);
      var result = null;
      if (matcher instanceof RegExp) {
        var matched = matcher.exec(target);
        if (matched && matched.index === 0) {
          result = matched[0];
        }
      } else if (target.substr(0, matcher.length) === matcher) {
        result = matcher;
      }
      if (result) {
        this.index += result.length;
      }
      return result;
    }
  }, {
    key: "throwUnexpectedToken",
    value: function throwUnexpectedToken() {
      var identifier = this.peek() || "ILLEGAL";
      throw new SyntaxError("Unexpected token: " + identifier);
    }
  }]);
  return Scanner2;
}();
var Scanner_1 = Scanner$1;
var _createClass$1 = function() {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor)
        descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }
  return function(Constructor, protoProps, staticProps) {
    if (protoProps)
      defineProperties(Constructor.prototype, protoProps);
    if (staticProps)
      defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();
function _classCallCheck$1(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
var Syntax$1 = Syntax$2;
var Scanner = Scanner_1;
var NOTE_INDEXES = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };
var MMLParser$1 = function() {
  function MMLParser2(source) {
    _classCallCheck$1(this, MMLParser2);
    this.scanner = new Scanner(source);
  }
  _createClass$1(MMLParser2, [{
    key: "parse",
    value: function parse() {
      var _this = this;
      var result = [];
      this._readUntil(";", function() {
        result = result.concat(_this.advance());
      });
      return result;
    }
  }, {
    key: "advance",
    value: function advance() {
      switch (this.scanner.peek()) {
        case "c":
        case "d":
        case "e":
        case "f":
        case "g":
        case "a":
        case "b":
          return this.readNote();
        case "[":
          return this.readChord();
        case "r":
          return this.readRest();
        case "o":
          return this.readOctave();
        case ">":
          return this.readOctaveShift(1);
        case "<":
          return this.readOctaveShift(-1);
        case "l":
          return this.readNoteLength();
        case "q":
          return this.readNoteQuantize();
        case "v":
          return this.readNoteVelocity();
        case "t":
          return this.readTempo();
        case "$":
          return this.readInfiniteLoop();
        case "/":
          return this.readLoop();
      }
      this.scanner.throwUnexpectedToken();
    }
  }, {
    key: "readNote",
    value: function readNote() {
      return {
        type: Syntax$1.Note,
        noteNumbers: [this._readNoteNumber(0)],
        noteLength: this._readLength()
      };
    }
  }, {
    key: "readChord",
    value: function readChord() {
      var _this2 = this;
      this.scanner.expect("[");
      var noteList = [];
      var offset = 0;
      this._readUntil("]", function() {
        switch (_this2.scanner.peek()) {
          case "c":
          case "d":
          case "e":
          case "f":
          case "g":
          case "a":
          case "b":
            noteList.push(_this2._readNoteNumber(offset));
            break;
          case ">":
            _this2.scanner.next();
            offset += 12;
            break;
          case "<":
            _this2.scanner.next();
            offset -= 12;
            break;
          default:
            _this2.scanner.throwUnexpectedToken();
        }
      });
      this.scanner.expect("]");
      return {
        type: Syntax$1.Note,
        noteNumbers: noteList,
        noteLength: this._readLength()
      };
    }
  }, {
    key: "readRest",
    value: function readRest() {
      this.scanner.expect("r");
      return {
        type: Syntax$1.Rest,
        noteLength: this._readLength()
      };
    }
  }, {
    key: "readOctave",
    value: function readOctave() {
      this.scanner.expect("o");
      return {
        type: Syntax$1.Octave,
        value: this._readArgument(/\d+/)
      };
    }
  }, {
    key: "readOctaveShift",
    value: function readOctaveShift(direction) {
      this.scanner.expect(/<|>/);
      return {
        type: Syntax$1.OctaveShift,
        direction: direction | 0,
        value: this._readArgument(/\d+/)
      };
    }
  }, {
    key: "readNoteLength",
    value: function readNoteLength() {
      this.scanner.expect("l");
      return {
        type: Syntax$1.NoteLength,
        noteLength: this._readLength()
      };
    }
  }, {
    key: "readNoteQuantize",
    value: function readNoteQuantize() {
      this.scanner.expect("q");
      return {
        type: Syntax$1.NoteQuantize,
        value: this._readArgument(/\d+/)
      };
    }
  }, {
    key: "readNoteVelocity",
    value: function readNoteVelocity() {
      this.scanner.expect("v");
      return {
        type: Syntax$1.NoteVelocity,
        value: this._readArgument(/\d+/)
      };
    }
  }, {
    key: "readTempo",
    value: function readTempo() {
      this.scanner.expect("t");
      return {
        type: Syntax$1.Tempo,
        value: this._readArgument(/\d+(\.\d+)?/)
      };
    }
  }, {
    key: "readInfiniteLoop",
    value: function readInfiniteLoop() {
      this.scanner.expect("$");
      return {
        type: Syntax$1.InfiniteLoop
      };
    }
  }, {
    key: "readLoop",
    value: function readLoop() {
      var _this3 = this;
      this.scanner.expect("/");
      this.scanner.expect(":");
      var loopBegin = { type: Syntax$1.LoopBegin };
      var loopEnd = { type: Syntax$1.LoopEnd };
      var result = [];
      result = result.concat(loopBegin);
      this._readUntil(/[|:]/, function() {
        result = result.concat(_this3.advance());
      });
      result = result.concat(this._readLoopExit());
      this.scanner.expect(":");
      this.scanner.expect("/");
      loopBegin.value = this._readArgument(/\d+/) || null;
      result = result.concat(loopEnd);
      return result;
    }
  }, {
    key: "_readUntil",
    value: function _readUntil(matcher, callback) {
      while (this.scanner.hasNext()) {
        this.scanner.forward();
        if (!this.scanner.hasNext() || this.scanner.match(matcher)) {
          break;
        }
        callback();
      }
    }
  }, {
    key: "_readArgument",
    value: function _readArgument(matcher) {
      var num = this.scanner.scan(matcher);
      return num !== null ? +num : null;
    }
  }, {
    key: "_readNoteNumber",
    value: function _readNoteNumber(offset) {
      var noteIndex = NOTE_INDEXES[this.scanner.next()];
      return noteIndex + this._readAccidental() + offset;
    }
  }, {
    key: "_readAccidental",
    value: function _readAccidental() {
      if (this.scanner.match("+")) {
        return 1 * this.scanner.scan(/\++/).length;
      }
      if (this.scanner.match("-")) {
        return -1 * this.scanner.scan(/\-+/).length;
      }
      return 0;
    }
  }, {
    key: "_readDot",
    value: function _readDot() {
      var len = (this.scanner.scan(/\.+/) || "").length;
      var result = new Array(len);
      for (var i = 0; i < len; i++) {
        result[i] = 0;
      }
      return result;
    }
  }, {
    key: "_readLength",
    value: function _readLength() {
      var result = [];
      result = result.concat(this._readArgument(/\d+/));
      result = result.concat(this._readDot());
      var tie = this._readTie();
      if (tie) {
        result = result.concat(tie);
      }
      return result;
    }
  }, {
    key: "_readTie",
    value: function _readTie() {
      this.scanner.forward();
      if (this.scanner.match("^")) {
        this.scanner.next();
        return this._readLength();
      }
      return null;
    }
  }, {
    key: "_readLoopExit",
    value: function _readLoopExit() {
      var _this4 = this;
      var result = [];
      if (this.scanner.match("|")) {
        this.scanner.next();
        var loopExit = { type: Syntax$1.LoopExit };
        result = result.concat(loopExit);
        this._readUntil(":", function() {
          result = result.concat(_this4.advance());
        });
      }
      return result;
    }
  }]);
  return MMLParser2;
}();
var MMLParser_1 = MMLParser$1;
var _createClass = function() {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor)
        descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }
  return function(Constructor, protoProps, staticProps) {
    if (protoProps)
      defineProperties(Constructor.prototype, protoProps);
    if (staticProps)
      defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();
function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
var Syntax = Syntax$2;
var DefaultParams = DefaultParams$1;
var MMLParser = MMLParser_1;
var ITERATOR = typeof Symbol !== "undefined" ? Symbol.iterator : "@@iterator";
var MMLIterator = function() {
  function MMLIterator2(source) {
    _classCallCheck(this, MMLIterator2);
    this.source = source;
    this._commands = new MMLParser(source).parse();
    this._commandIndex = 0;
    this._processedTime = 0;
    this._iterator = null;
    this._octave = DefaultParams.octave;
    this._noteLength = [DefaultParams.length];
    this._velocity = DefaultParams.velocity;
    this._quantize = DefaultParams.quantize;
    this._tempo = DefaultParams.tempo;
    this._infiniteLoopIndex = -1;
    this._loopStack = [];
    this._done = false;
  }
  _createClass(MMLIterator2, [{
    key: "hasNext",
    value: function hasNext() {
      return this._commandIndex < this._commands.length;
    }
  }, {
    key: "next",
    value: function next() {
      if (this._done) {
        return { done: true, value: null };
      }
      if (this._iterator) {
        var iterItem = this._iterator.next();
        if (!iterItem.done) {
          return iterItem;
        }
      }
      var command = this._forward(true);
      if (isNoteEvent(command)) {
        this._iterator = this[command.type](command);
      } else {
        this._done = true;
        return { done: false, value: { type: "end", time: this._processedTime } };
      }
      return this.next();
    }
  }, {
    key: ITERATOR,
    value: function value() {
      return this;
    }
  }, {
    key: "_forward",
    value: function _forward(forward) {
      while (this.hasNext() && !isNoteEvent(this._commands[this._commandIndex])) {
        var command = this._commands[this._commandIndex++];
        this[command.type](command);
      }
      if (forward && !this.hasNext() && this._infiniteLoopIndex !== -1) {
        this._commandIndex = this._infiniteLoopIndex;
        return this._forward(false);
      }
      return this._commands[this._commandIndex++] || {};
    }
  }, {
    key: "_calcDuration",
    value: function _calcDuration(noteLength) {
      var _this = this;
      if (noteLength[0] === null) {
        noteLength = this._noteLength.concat(noteLength.slice(1));
      }
      var prev = null;
      var dotted = 0;
      noteLength = noteLength.map(function(elem) {
        switch (elem) {
          case null:
            elem = prev;
            break;
          case 0:
            elem = dotted *= 2;
            break;
          default:
            prev = dotted = elem;
            break;
        }
        var length = elem !== null ? elem : DefaultParams.length;
        return 60 / _this._tempo * (4 / length);
      });
      return noteLength.reduce(function(a, b) {
        return a + b;
      }, 0);
    }
  }, {
    key: "_calcNoteNumber",
    value: function _calcNoteNumber(noteNumber) {
      return noteNumber + this._octave * 12 + 12;
    }
  }, {
    key: Syntax.Note,
    value: function value(command) {
      var _this2 = this;
      var type = "note";
      var time = this._processedTime;
      var duration = this._calcDuration(command.noteLength);
      var noteNumbers = command.noteNumbers.map(function(noteNumber) {
        return _this2._calcNoteNumber(noteNumber);
      });
      var quantize2 = this._quantize;
      var velocity = this._velocity;
      this._processedTime = this._processedTime + duration;
      return arrayToIterator(noteNumbers.map(function(noteNumber) {
        return { type, time, duration, noteNumber, velocity, quantize: quantize2 };
      }));
    }
  }, {
    key: Syntax.Rest,
    value: function value(command) {
      var duration = this._calcDuration(command.noteLength);
      this._processedTime = this._processedTime + duration;
    }
  }, {
    key: Syntax.Octave,
    value: function value(command) {
      this._octave = command.value !== null ? command.value : DefaultParams.octave;
    }
  }, {
    key: Syntax.OctaveShift,
    value: function value(command) {
      var value2 = command.value !== null ? command.value : 1;
      this._octave += value2 * command.direction;
    }
  }, {
    key: Syntax.NoteLength,
    value: function value(command) {
      var noteLength = command.noteLength.map(function(value2) {
        return value2 !== null ? value2 : DefaultParams.length;
      });
      this._noteLength = noteLength;
    }
  }, {
    key: Syntax.NoteVelocity,
    value: function value(command) {
      this._velocity = command.value !== null ? command.value : DefaultParams.velocity;
    }
  }, {
    key: Syntax.NoteQuantize,
    value: function value(command) {
      this._quantize = command.value !== null ? command.value : DefaultParams.quantize;
    }
  }, {
    key: Syntax.Tempo,
    value: function value(command) {
      this._tempo = command.value !== null ? command.value : DefaultParams.tempo;
    }
  }, {
    key: Syntax.InfiniteLoop,
    value: function value() {
      this._infiniteLoopIndex = this._commandIndex;
    }
  }, {
    key: Syntax.LoopBegin,
    value: function value(command) {
      var loopCount = command.value !== null ? command.value : DefaultParams.loopCount;
      var loopTopIndex = this._commandIndex;
      var loopOutIndex = -1;
      this._loopStack.push({ loopCount, loopTopIndex, loopOutIndex });
    }
  }, {
    key: Syntax.LoopExit,
    value: function value() {
      var looper = this._loopStack[this._loopStack.length - 1];
      var index = this._commandIndex;
      if (looper.loopCount <= 1 && looper.loopOutIndex !== -1) {
        index = looper.loopOutIndex;
      }
      this._commandIndex = index;
    }
  }, {
    key: Syntax.LoopEnd,
    value: function value() {
      var looper = this._loopStack[this._loopStack.length - 1];
      var index = this._commandIndex;
      if (looper.loopOutIndex === -1) {
        looper.loopOutIndex = this._commandIndex;
      }
      looper.loopCount -= 1;
      if (0 < looper.loopCount) {
        index = looper.loopTopIndex;
      } else {
        this._loopStack.pop();
      }
      this._commandIndex = index;
    }
  }]);
  return MMLIterator2;
}();
function arrayToIterator(array) {
  var index = 0;
  return {
    next: function next() {
      if (index < array.length) {
        return { done: false, value: array[index++] };
      }
      return { done: true };
    }
  };
}
function isNoteEvent(command) {
  return command.type === Syntax.Note || command.type === Syntax.Rest;
}
var MMLIterator_1 = MMLIterator;
var lib = MMLIterator_1;
let audioContext;
let tempo;
let playInterval;
let quantize;
let isStarted = false;
function init$2(_audioContext = void 0) {
  window.AudioContext = window.AudioContext || window.webkitAudioContext;
  audioContext = _audioContext == null ? new AudioContext() : _audioContext;
  setTempo();
  setQuantize();
}
function start() {
  if (isStarted) {
    return;
  }
  isStarted = true;
  playEmptyBuffer();
}
function setTempo(_tempo = 150) {
  tempo = _tempo;
  playInterval = 60 / tempo;
}
function setQuantize(noteLength = 8) {
  quantize = 4 / noteLength;
}
function getQuantizedTime(time) {
  const interval = playInterval * quantize;
  return interval > 0 ? Math.ceil(time / interval) * interval : time;
}
function playEmptyBuffer() {
  const bufferSource = audioContext.createBufferSource();
  bufferSource.start = bufferSource.start || bufferSource.noteOn;
  bufferSource.start();
}
let randomFunction = Math.random();
function setRandomFunction(func) {
  randomFunction = func;
}
var SQUARE = 0;
var SAWTOOTH = 1;
var SINE = 2;
var NOISE = 3;
var masterVolume = 1;
var OVERSAMPLING = 8;
function Params() {
  this.oldParams = true;
  this.wave_type = SQUARE;
  this.p_env_attack = 0;
  this.p_env_sustain = 0.3;
  this.p_env_punch = 0;
  this.p_env_decay = 0.4;
  this.p_base_freq = 0.3;
  this.p_freq_limit = 0;
  this.p_freq_ramp = 0;
  this.p_freq_dramp = 0;
  this.p_vib_strength = 0;
  this.p_vib_speed = 0;
  this.p_arp_mod = 0;
  this.p_arp_speed = 0;
  this.p_duty = 0;
  this.p_duty_ramp = 0;
  this.p_repeat_speed = 0;
  this.p_pha_offset = 0;
  this.p_pha_ramp = 0;
  this.p_lpf_freq = 1;
  this.p_lpf_ramp = 0;
  this.p_lpf_resonance = 0;
  this.p_hpf_freq = 0;
  this.p_hpf_ramp = 0;
  this.sound_vol = 0.5;
  this.sample_rate = 44100;
  this.sample_size = 8;
}
function sqr(x) {
  return x * x;
}
function cube(x) {
  return x * x * x;
}
var pow = Math.pow;
function frnd(range) {
  return randomFunction() * range;
}
function rndr(from, to) {
  return randomFunction() * (to - from) + from;
}
function rnd(max) {
  return Math.floor(randomFunction() * (max + 1));
}
function assembleFloat(sign, exponent, mantissa) {
  return sign << 31 | exponent << 23 | mantissa;
}
function floatToNumber(flt) {
  if (isNaN(flt))
    return assembleFloat(0, 255, 4919);
  var sign = flt < 0 ? 1 : 0;
  flt = Math.abs(flt);
  if (flt == 0)
    return assembleFloat(sign, 0, 0);
  var exponent = Math.floor(Math.log(flt) / Math.LN2);
  if (exponent > 127 || exponent < -126)
    return assembleFloat(sign, 255, 0);
  var mantissa = flt / Math.pow(2, exponent);
  return assembleFloat(sign, exponent + 127, mantissa * Math.pow(2, 23) & 8388607);
}
var b58alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
var params_order = [
  "wave_type",
  "p_env_attack",
  "p_env_sustain",
  "p_env_punch",
  "p_env_decay",
  "p_base_freq",
  "p_freq_limit",
  "p_freq_ramp",
  "p_freq_dramp",
  "p_vib_strength",
  "p_vib_speed",
  "p_arp_mod",
  "p_arp_speed",
  "p_duty",
  "p_duty_ramp",
  "p_repeat_speed",
  "p_pha_offset",
  "p_pha_ramp",
  "p_lpf_freq",
  "p_lpf_ramp",
  "p_lpf_resonance",
  "p_hpf_freq",
  "p_hpf_ramp"
];
Params.prototype.toB58 = function() {
  var convert = [];
  for (var pi in params_order) {
    var p = params_order[pi];
    if (p == "wave_type") {
      convert.push(this[p]);
    } else if (p.indexOf("p_") == 0) {
      var val = this[p];
      val = floatToNumber(val);
      convert.push(255 & val);
      convert.push(255 & val >> 8);
      convert.push(255 & val >> 16);
      convert.push(255 & val >> 24);
    }
  }
  return function(B, A) {
    var d = [], s = "", i, j, c, n;
    for (i in B) {
      j = 0, c = B[i];
      s += c || s.length ^ i ? "" : 1;
      while (j in d || c) {
        n = d[j];
        n = n ? n * 256 + c : c;
        c = n / 58 | 0;
        d[j] = n % 58;
        j++;
      }
    }
    while (j--)
      s += A[d[j]];
    return s;
  }(convert, b58alphabet);
};
Params.prototype.fromB58 = function(b58encoded) {
  this.fromJSON(sfxr.b58decode(b58encoded));
  return this;
};
Params.prototype.fromJSON = function(struct) {
  for (var p in struct) {
    if (struct.hasOwnProperty(p)) {
      this[p] = struct[p];
    }
  }
  return this;
};
Params.prototype.pickupCoin = function() {
  this.wave_type = SAWTOOTH;
  this.p_base_freq = 0.4 + frnd(0.5);
  this.p_env_attack = 0;
  this.p_env_sustain = frnd(0.1);
  this.p_env_decay = 0.1 + frnd(0.4);
  this.p_env_punch = 0.3 + frnd(0.3);
  if (rnd(1)) {
    this.p_arp_speed = 0.5 + frnd(0.2);
    this.p_arp_mod = 0.2 + frnd(0.4);
  }
  return this;
};
Params.prototype.laserShoot = function() {
  this.wave_type = rnd(2);
  if (this.wave_type === SINE && rnd(1))
    this.wave_type = rnd(1);
  if (rnd(2) === 0) {
    this.p_base_freq = 0.3 + frnd(0.6);
    this.p_freq_limit = frnd(0.1);
    this.p_freq_ramp = -0.35 - frnd(0.3);
  } else {
    this.p_base_freq = 0.5 + frnd(0.5);
    this.p_freq_limit = this.p_base_freq - 0.2 - frnd(0.6);
    if (this.p_freq_limit < 0.2)
      this.p_freq_limit = 0.2;
    this.p_freq_ramp = -0.15 - frnd(0.2);
  }
  if (this.wave_type === SAWTOOTH)
    this.p_duty = 1;
  if (rnd(1)) {
    this.p_duty = frnd(0.5);
    this.p_duty_ramp = frnd(0.2);
  } else {
    this.p_duty = 0.4 + frnd(0.5);
    this.p_duty_ramp = -frnd(0.7);
  }
  this.p_env_attack = 0;
  this.p_env_sustain = 0.1 + frnd(0.2);
  this.p_env_decay = frnd(0.4);
  if (rnd(1))
    this.p_env_punch = frnd(0.3);
  if (rnd(2) === 0) {
    this.p_pha_offset = frnd(0.2);
    this.p_pha_ramp = -frnd(0.2);
  }
  this.p_hpf_freq = frnd(0.3);
  return this;
};
Params.prototype.explosion = function() {
  this.wave_type = NOISE;
  if (rnd(1)) {
    this.p_base_freq = sqr(0.1 + frnd(0.4));
    this.p_freq_ramp = -0.1 + frnd(0.4);
  } else {
    this.p_base_freq = sqr(0.2 + frnd(0.7));
    this.p_freq_ramp = -0.2 - frnd(0.2);
  }
  if (rnd(4) === 0)
    this.p_freq_ramp = 0;
  if (rnd(2) === 0)
    this.p_repeat_speed = 0.3 + frnd(0.5);
  this.p_env_attack = 0;
  this.p_env_sustain = 0.1 + frnd(0.3);
  this.p_env_decay = frnd(0.5);
  if (rnd(1)) {
    this.p_pha_offset = -0.3 + frnd(0.9);
    this.p_pha_ramp = -frnd(0.3);
  }
  this.p_env_punch = 0.2 + frnd(0.6);
  if (rnd(1)) {
    this.p_vib_strength = frnd(0.7);
    this.p_vib_speed = frnd(0.6);
  }
  if (rnd(2) === 0) {
    this.p_arp_speed = 0.6 + frnd(0.3);
    this.p_arp_mod = 0.8 - frnd(1.6);
  }
  return this;
};
Params.prototype.powerUp = function() {
  if (rnd(1)) {
    this.wave_type = SAWTOOTH;
    this.p_duty = 1;
  } else {
    this.p_duty = frnd(0.6);
  }
  this.p_base_freq = 0.2 + frnd(0.3);
  if (rnd(1)) {
    this.p_freq_ramp = 0.1 + frnd(0.4);
    this.p_repeat_speed = 0.4 + frnd(0.4);
  } else {
    this.p_freq_ramp = 0.05 + frnd(0.2);
    if (rnd(1)) {
      this.p_vib_strength = frnd(0.7);
      this.p_vib_speed = frnd(0.6);
    }
  }
  this.p_env_attack = 0;
  this.p_env_sustain = frnd(0.4);
  this.p_env_decay = 0.1 + frnd(0.4);
  return this;
};
Params.prototype.hitHurt = function() {
  this.wave_type = rnd(2);
  if (this.wave_type === SINE)
    this.wave_type = NOISE;
  if (this.wave_type === SQUARE)
    this.p_duty = frnd(0.6);
  if (this.wave_type === SAWTOOTH)
    this.p_duty = 1;
  this.p_base_freq = 0.2 + frnd(0.6);
  this.p_freq_ramp = -0.3 - frnd(0.4);
  this.p_env_attack = 0;
  this.p_env_sustain = frnd(0.1);
  this.p_env_decay = 0.1 + frnd(0.2);
  if (rnd(1))
    this.p_hpf_freq = frnd(0.3);
  return this;
};
Params.prototype.jump = function() {
  this.wave_type = SQUARE;
  this.p_duty = frnd(0.6);
  this.p_base_freq = 0.3 + frnd(0.3);
  this.p_freq_ramp = 0.1 + frnd(0.2);
  this.p_env_attack = 0;
  this.p_env_sustain = 0.1 + frnd(0.3);
  this.p_env_decay = 0.1 + frnd(0.2);
  if (rnd(1))
    this.p_hpf_freq = frnd(0.3);
  if (rnd(1))
    this.p_lpf_freq = 1 - frnd(0.6);
  return this;
};
Params.prototype.blipSelect = function() {
  this.wave_type = rnd(1);
  if (this.wave_type === SQUARE)
    this.p_duty = frnd(0.6);
  else
    this.p_duty = 1;
  this.p_base_freq = 0.2 + frnd(0.4);
  this.p_env_attack = 0;
  this.p_env_sustain = 0.1 + frnd(0.1);
  this.p_env_decay = frnd(0.2);
  this.p_hpf_freq = 0.1;
  return this;
};
Params.prototype.synth = function() {
  this.wave_type = rnd(1);
  this.p_base_freq = [
    0.2723171360931539,
    0.19255692561524382,
    0.13615778746815113
  ][rnd(2)];
  this.p_env_attack = rnd(4) > 3 ? frnd(0.5) : 0;
  this.p_env_sustain = frnd(1);
  this.p_env_punch = frnd(1);
  this.p_env_decay = frnd(0.9) + 0.1;
  this.p_arp_mod = [0, 0, 0, 0, -0.3162, 0.7454, 0.7454][rnd(6)];
  this.p_arp_speed = frnd(0.5) + 0.4;
  this.p_duty = frnd(1);
  this.p_duty_ramp = rnd(2) == 2 ? frnd(1) : 0;
  this.p_lpf_freq = [1, frnd(1) * frnd(1)][rnd(1)];
  this.p_lpf_ramp = rndr(-1, 1);
  this.p_lpf_resonance = frnd(1);
  this.p_hpf_freq = rnd(3) == 3 ? frnd(1) : 0;
  this.p_hpf_ramp = rnd(3) == 3 ? frnd(1) : 0;
  return this;
};
Params.prototype.tone = function() {
  this.wave_type = SINE;
  this.p_base_freq = 0.35173364;
  this.p_env_attack = 0;
  this.p_env_sustain = 0.6641;
  this.p_env_decay = 0;
  this.p_env_punch = 0;
  return this;
};
Params.prototype.click = function() {
  const base = ["explosion", "hitHurt"][rnd(1)];
  this[base]();
  if (rnd(1)) {
    this.p_freq_ramp = -0.5 + frnd(1);
  }
  if (rnd(1)) {
    this.p_env_sustain = (frnd(0.4) + 0.2) * this.p_env_sustain;
    this.p_env_decay = (frnd(0.4) + 0.2) * this.p_env_decay;
  }
  if (rnd(3) == 0) {
    this.p_env_attack = frnd(0.3);
  }
  this.p_base_freq = 1 - frnd(0.25);
  this.p_hpf_freq = 1 - frnd(0.1);
  return this;
};
Params.prototype.random = function() {
  this.wave_type = rnd(3);
  if (rnd(1))
    this.p_base_freq = cube(frnd(2) - 1) + 0.5;
  else
    this.p_base_freq = sqr(frnd(1));
  this.p_freq_limit = 0;
  this.p_freq_ramp = Math.pow(frnd(2) - 1, 5);
  if (this.p_base_freq > 0.7 && this.p_freq_ramp > 0.2)
    this.p_freq_ramp = -this.p_freq_ramp;
  if (this.p_base_freq < 0.2 && this.p_freq_ramp < -0.05)
    this.p_freq_ramp = -this.p_freq_ramp;
  this.p_freq_dramp = Math.pow(frnd(2) - 1, 3);
  this.p_duty = frnd(2) - 1;
  this.p_duty_ramp = Math.pow(frnd(2) - 1, 3);
  this.p_vib_strength = Math.pow(frnd(2) - 1, 3);
  this.p_vib_speed = rndr(-1, 1);
  this.p_env_attack = cube(rndr(-1, 1));
  this.p_env_sustain = sqr(rndr(-1, 1));
  this.p_env_decay = rndr(-1, 1);
  this.p_env_punch = Math.pow(frnd(0.8), 2);
  if (this.p_env_attack + this.p_env_sustain + this.p_env_decay < 0.2) {
    this.p_env_sustain += 0.2 + frnd(0.3);
    this.p_env_decay += 0.2 + frnd(0.3);
  }
  this.p_lpf_resonance = rndr(-1, 1);
  this.p_lpf_freq = 1 - Math.pow(frnd(1), 3);
  this.p_lpf_ramp = Math.pow(frnd(2) - 1, 3);
  if (this.p_lpf_freq < 0.1 && this.p_lpf_ramp < -0.05)
    this.p_lpf_ramp = -this.p_lpf_ramp;
  this.p_hpf_freq = Math.pow(frnd(1), 5);
  this.p_hpf_ramp = Math.pow(frnd(2) - 1, 5);
  this.p_pha_offset = Math.pow(frnd(2) - 1, 3);
  this.p_pha_ramp = Math.pow(frnd(2) - 1, 3);
  this.p_repeat_speed = frnd(2) - 1;
  this.p_arp_speed = frnd(2) - 1;
  this.p_arp_mod = frnd(2) - 1;
  return this;
};
Params.prototype.mutate = function() {
  if (rnd(1))
    this.p_base_freq += frnd(0.1) - 0.05;
  if (rnd(1))
    this.p_freq_ramp += frnd(0.1) - 0.05;
  if (rnd(1))
    this.p_freq_dramp += frnd(0.1) - 0.05;
  if (rnd(1))
    this.p_duty += frnd(0.1) - 0.05;
  if (rnd(1))
    this.p_duty_ramp += frnd(0.1) - 0.05;
  if (rnd(1))
    this.p_vib_strength += frnd(0.1) - 0.05;
  if (rnd(1))
    this.p_vib_speed += frnd(0.1) - 0.05;
  if (rnd(1))
    this.p_vib_delay += frnd(0.1) - 0.05;
  if (rnd(1))
    this.p_env_attack += frnd(0.1) - 0.05;
  if (rnd(1))
    this.p_env_sustain += frnd(0.1) - 0.05;
  if (rnd(1))
    this.p_env_decay += frnd(0.1) - 0.05;
  if (rnd(1))
    this.p_env_punch += frnd(0.1) - 0.05;
  if (rnd(1))
    this.p_lpf_resonance += frnd(0.1) - 0.05;
  if (rnd(1))
    this.p_lpf_freq += frnd(0.1) - 0.05;
  if (rnd(1))
    this.p_lpf_ramp += frnd(0.1) - 0.05;
  if (rnd(1))
    this.p_hpf_freq += frnd(0.1) - 0.05;
  if (rnd(1))
    this.p_hpf_ramp += frnd(0.1) - 0.05;
  if (rnd(1))
    this.p_pha_offset += frnd(0.1) - 0.05;
  if (rnd(1))
    this.p_pha_ramp += frnd(0.1) - 0.05;
  if (rnd(1))
    this.p_repeat_speed += frnd(0.1) - 0.05;
  if (rnd(1))
    this.p_arp_speed += frnd(0.1) - 0.05;
  if (rnd(1))
    this.p_arp_mod += frnd(0.1) - 0.05;
  return this;
};
const sfxr = {};
function SoundEffect(ps) {
  this.init(ps);
}
SoundEffect.prototype.init = function(ps) {
  this.parameters = ps;
  this.initForRepeat();
  this.waveShape = parseInt(ps.wave_type);
  this.fltw = Math.pow(ps.p_lpf_freq, 3) * 0.1;
  this.enableLowPassFilter = ps.p_lpf_freq != 1;
  this.fltw_d = 1 + ps.p_lpf_ramp * 1e-4;
  this.fltdmp = 5 / (1 + Math.pow(ps.p_lpf_resonance, 2) * 20) * (0.01 + this.fltw);
  if (this.fltdmp > 0.8)
    this.fltdmp = 0.8;
  this.flthp = Math.pow(ps.p_hpf_freq, 2) * 0.1;
  this.flthp_d = 1 + ps.p_hpf_ramp * 3e-4;
  this.vibratoSpeed = Math.pow(ps.p_vib_speed, 2) * 0.01;
  this.vibratoAmplitude = ps.p_vib_strength * 0.5;
  this.envelopeLength = [
    Math.floor(ps.p_env_attack * ps.p_env_attack * 1e5),
    Math.floor(ps.p_env_sustain * ps.p_env_sustain * 1e5),
    Math.floor(ps.p_env_decay * ps.p_env_decay * 1e5)
  ];
  this.envelopePunch = ps.p_env_punch;
  this.flangerOffset = Math.pow(ps.p_pha_offset, 2) * 1020;
  if (ps.p_pha_offset < 0)
    this.flangerOffset = -this.flangerOffset;
  this.flangerOffsetSlide = Math.pow(ps.p_pha_ramp, 2) * 1;
  if (ps.p_pha_ramp < 0)
    this.flangerOffsetSlide = -this.flangerOffsetSlide;
  this.repeatTime = Math.floor(Math.pow(1 - ps.p_repeat_speed, 2) * 2e4 + 32);
  if (ps.p_repeat_speed === 0)
    this.repeatTime = 0;
  this.gain = Math.exp(ps.sound_vol) - 1;
  this.sampleRate = ps.sample_rate;
  this.bitsPerChannel = ps.sample_size;
};
SoundEffect.prototype.initForRepeat = function() {
  var ps = this.parameters;
  this.elapsedSinceRepeat = 0;
  this.period = 100 / (ps.p_base_freq * ps.p_base_freq + 1e-3);
  this.periodMax = 100 / (ps.p_freq_limit * ps.p_freq_limit + 1e-3);
  this.enableFrequencyCutoff = ps.p_freq_limit > 0;
  this.periodMult = 1 - Math.pow(ps.p_freq_ramp, 3) * 0.01;
  this.periodMultSlide = -Math.pow(ps.p_freq_dramp, 3) * 1e-6;
  this.dutyCycle = 0.5 - ps.p_duty * 0.5;
  this.dutyCycleSlide = -ps.p_duty_ramp * 5e-5;
  if (ps.p_arp_mod >= 0)
    this.arpeggioMultiplier = 1 - Math.pow(ps.p_arp_mod, 2) * 0.9;
  else
    this.arpeggioMultiplier = 1 + Math.pow(ps.p_arp_mod, 2) * 10;
  this.arpeggioTime = Math.floor(Math.pow(1 - ps.p_arp_speed, 2) * 2e4 + 32);
  if (ps.p_arp_speed === 1)
    this.arpeggioTime = 0;
};
SoundEffect.prototype.getRawBuffer = function() {
  var fltp = 0;
  var fltdp = 0;
  var fltphp = 0;
  var noise_buffer = Array(32);
  for (var i = 0; i < 32; ++i)
    noise_buffer[i] = randomFunction() * 2 - 1;
  var envelopeStage = 0;
  var envelopeElapsed = 0;
  var vibratoPhase = 0;
  var phase = 0;
  var ipp = 0;
  var flanger_buffer = Array(1024);
  for (var i = 0; i < 1024; ++i)
    flanger_buffer[i] = 0;
  var num_clipped = 0;
  var buffer = [];
  var sample_sum = 0;
  var num_summed = 0;
  var summands = Math.floor(44100 / this.sampleRate);
  for (var t = 0; ; ++t) {
    if (this.repeatTime != 0 && ++this.elapsedSinceRepeat >= this.repeatTime)
      this.initForRepeat();
    if (this.arpeggioTime != 0 && t >= this.arpeggioTime) {
      this.arpeggioTime = 0;
      this.period *= this.arpeggioMultiplier;
    }
    this.periodMult += this.periodMultSlide;
    this.period *= this.periodMult;
    if (this.period > this.periodMax) {
      this.period = this.periodMax;
      if (this.enableFrequencyCutoff)
        break;
    }
    var rfperiod = this.period;
    if (this.vibratoAmplitude > 0) {
      vibratoPhase += this.vibratoSpeed;
      rfperiod = this.period * (1 + Math.sin(vibratoPhase) * this.vibratoAmplitude);
    }
    var iperiod = Math.floor(rfperiod);
    if (iperiod < OVERSAMPLING)
      iperiod = OVERSAMPLING;
    this.dutyCycle += this.dutyCycleSlide;
    if (this.dutyCycle < 0)
      this.dutyCycle = 0;
    if (this.dutyCycle > 0.5)
      this.dutyCycle = 0.5;
    if (++envelopeElapsed > this.envelopeLength[envelopeStage]) {
      envelopeElapsed = 0;
      if (++envelopeStage > 2)
        break;
    }
    var env_vol;
    var envf = envelopeElapsed / this.envelopeLength[envelopeStage];
    if (envelopeStage === 0) {
      env_vol = envf;
    } else if (envelopeStage === 1) {
      env_vol = 1 + (1 - envf) * 2 * this.envelopePunch;
    } else {
      env_vol = 1 - envf;
    }
    this.flangerOffset += this.flangerOffsetSlide;
    var iphase = Math.abs(Math.floor(this.flangerOffset));
    if (iphase > 1023)
      iphase = 1023;
    if (this.flthp_d != 0) {
      this.flthp *= this.flthp_d;
      if (this.flthp < 1e-5)
        this.flthp = 1e-5;
      if (this.flthp > 0.1)
        this.flthp = 0.1;
    }
    var sample = 0;
    for (var si = 0; si < OVERSAMPLING; ++si) {
      var sub_sample = 0;
      phase++;
      if (phase >= iperiod) {
        phase %= iperiod;
        if (this.waveShape === NOISE)
          for (var i = 0; i < 32; ++i)
            noise_buffer[i] = randomFunction() * 2 - 1;
      }
      var fp = phase / iperiod;
      if (this.waveShape === SQUARE) {
        if (fp < this.dutyCycle)
          sub_sample = 0.5;
        else
          sub_sample = -0.5;
      } else if (this.waveShape === SAWTOOTH) {
        if (fp < this.dutyCycle)
          sub_sample = -1 + 2 * fp / this.dutyCycle;
        else
          sub_sample = 1 - 2 * (fp - this.dutyCycle) / (1 - this.dutyCycle);
      } else if (this.waveShape === SINE) {
        sub_sample = Math.sin(fp * 2 * Math.PI);
      } else if (this.waveShape === NOISE) {
        sub_sample = noise_buffer[Math.floor(phase * 32 / iperiod)];
      } else {
        throw "ERROR: Bad wave type: " + this.waveShape;
      }
      var pp = fltp;
      this.fltw *= this.fltw_d;
      if (this.fltw < 0)
        this.fltw = 0;
      if (this.fltw > 0.1)
        this.fltw = 0.1;
      if (this.enableLowPassFilter) {
        fltdp += (sub_sample - fltp) * this.fltw;
        fltdp -= fltdp * this.fltdmp;
      } else {
        fltp = sub_sample;
        fltdp = 0;
      }
      fltp += fltdp;
      fltphp += fltp - pp;
      fltphp -= fltphp * this.flthp;
      sub_sample = fltphp;
      flanger_buffer[ipp & 1023] = sub_sample;
      sub_sample += flanger_buffer[ipp - iphase + 1024 & 1023];
      ipp = ipp + 1 & 1023;
      sample += sub_sample * env_vol;
    }
    sample_sum += sample;
    if (++num_summed >= summands) {
      num_summed = 0;
      sample = sample_sum / summands;
      sample_sum = 0;
    } else {
      continue;
    }
    sample = sample / OVERSAMPLING * masterVolume;
    sample *= this.gain;
    if (this.bitsPerChannel === 8) {
      sample = Math.floor((sample + 1) * 128);
      if (sample > 255) {
        sample = 255;
        ++num_clipped;
      } else if (sample < 0) {
        sample = 0;
        ++num_clipped;
      }
      buffer.push(sample);
    } else {
      sample = Math.floor(sample * (1 << 15));
      if (sample >= 1 << 15) {
        sample = (1 << 15) - 1;
        ++num_clipped;
      } else if (sample < -(1 << 15)) {
        sample = -(1 << 15);
        ++num_clipped;
      }
      buffer.push(sample & 255);
      buffer.push(sample >> 8 & 255);
    }
  }
  return {
    buffer,
    clipped: num_clipped
  };
};
SoundEffect.prototype.generate = function() {
  var rendered = this.getRawBuffer();
  var normalized = _sfxr_getNormalized(rendered.buffer, this.bitsPerChannel);
  return {
    sampleRate: this.sampleRate,
    bitsPerChannel: this.bitsPerChannel,
    buffer: normalized,
    clipped: rendered.clipped
  };
};
var _sfxr_getNormalized = function(buffer, bitsPerChannel) {
  var normalized = new Float32Array(buffer.length);
  for (var b = 0; b < buffer.length; b++) {
    normalized[b] = 2 * buffer[b] / pow(2, bitsPerChannel) - 1;
  }
  return normalized;
};
class Random {
  constructor(seed = null) {
    __publicField(this, "x");
    __publicField(this, "y");
    __publicField(this, "z");
    __publicField(this, "w");
    this.setSeed(seed);
  }
  get(lowOrHigh = 1, high) {
    if (high == null) {
      high = lowOrHigh;
      lowOrHigh = 0;
    }
    return this.next() / 4294967295 * (high - lowOrHigh) + lowOrHigh;
  }
  getInt(lowOrHigh, high) {
    if (high == null) {
      high = lowOrHigh;
      lowOrHigh = 0;
    }
    const lowOrHighInt = Math.floor(lowOrHigh);
    const highInt = Math.floor(high);
    if (highInt === lowOrHighInt) {
      return lowOrHighInt;
    }
    return this.next() % (highInt - lowOrHighInt) + lowOrHighInt;
  }
  getPlusOrMinus() {
    return this.getInt(2) * 2 - 1;
  }
  select(values) {
    return values[this.getInt(values.length)];
  }
  setSeed(w, x = 123456789, y = 362436069, z = 521288629, loopCount = 32) {
    this.w = w != null ? w >>> 0 : Math.floor(Math.random() * 4294967295) >>> 0;
    this.x = x >>> 0;
    this.y = y >>> 0;
    this.z = z >>> 0;
    for (let i = 0; i < loopCount; i++) {
      this.next();
    }
    return this;
  }
  getState() {
    return { x: this.x, y: this.y, z: this.z, w: this.w };
  }
  next() {
    const t = this.x ^ this.x << 11;
    this.x = this.y;
    this.y = this.z;
    this.z = this.w;
    this.w = (this.w ^ this.w >>> 19 ^ (t ^ t >>> 8)) >>> 0;
    return this.w;
  }
}
const random = new Random();
function times(n, func) {
  let result = [];
  for (let i = 0; i < n; i++) {
    result.push(func(i));
  }
  return result;
}
const typeFunctionNames = {
  coin: "pickupCoin",
  laser: "laserShoot",
  explosion: "explosion",
  powerUp: "powerUp",
  hit: "hitHurt",
  jump: "jump",
  select: "blipSelect",
  synth: "synth",
  tone: "tone",
  click: "click",
  random: "random"
};
let soundEffects$1;
function init$1() {
  soundEffects$1 = [];
  setRandomFunction(() => random.get());
}
function play$1(soundEffect) {
  playSoundEffect$1(soundEffect);
}
function update$2() {
  const currentTime = audioContext.currentTime;
  soundEffects$1.forEach((se) => {
    updateSoundEffect(se, currentTime);
  });
}
function add(type, seed, count = 2, volume = 0.1, freq = void 0, attackRatio = 1, sustainRatio = 1) {
  const params = times(count, (i) => {
    random.setSeed(seed + i * 1063);
    let p = new Params();
    p[typeFunctionNames[type]]();
    if (freq != null) {
      p.p_base_freq = freq;
    }
    p.p_env_attack *= attackRatio;
    p.p_env_sustain *= sustainRatio;
    return p;
  });
  const se = fromJSON$1({ type, params, volume });
  soundEffects$1.push(se);
  return se;
}
function setVolume(soundEffect, volume) {
  soundEffect.gainNode.gain.value = volume;
}
function playSoundEffect$1(soundEffect) {
  soundEffect.isPlaying = true;
}
function updateSoundEffect(soundEffect, currentTime) {
  if (!soundEffect.isPlaying) {
    return;
  }
  soundEffect.isPlaying = false;
  const time = getQuantizedTime(currentTime);
  if (soundEffect.playedTime == null || time > soundEffect.playedTime) {
    playLater(soundEffect, time);
    soundEffect.playedTime = time;
  }
}
function playLater(soundEffect, when, detune = void 0) {
  soundEffect.bufferSourceNodes = [];
  soundEffect.buffers.forEach((b) => {
    const bufferSourceNode = audioContext.createBufferSource();
    bufferSourceNode.buffer = b;
    if (detune != null && bufferSourceNode.playbackRate != null) {
      const semitoneRatio = Math.pow(2, 1 / 12);
      bufferSourceNode.playbackRate.value = Math.pow(semitoneRatio, detune);
    }
    bufferSourceNode.start = bufferSourceNode.start || bufferSourceNode.noteOn;
    bufferSourceNode.connect(soundEffect.gainNode);
    bufferSourceNode.start(when);
    soundEffect.bufferSourceNodes.push(bufferSourceNode);
  });
}
function stop$1(soundEffect, when = void 0) {
  if (soundEffect.bufferSourceNodes != null) {
    soundEffect.bufferSourceNodes.forEach((n) => {
      if (when == null) {
        n.stop();
      } else {
        n.stop(when);
      }
    });
    soundEffect.bufferSourceNodes = void 0;
  }
}
function fromJSON$1(json) {
  const type = json.type;
  const params = json.params;
  const volume = json.volume;
  const buffers = params.map((p) => {
    const s = new SoundEffect(p).generate();
    if (s.buffer.length === 0) {
      return audioContext.createBuffer(1, 1, s.sampleRate);
    }
    const buffer = audioContext.createBuffer(1, s.buffer.length, s.sampleRate);
    var channelData = buffer.getChannelData(0);
    channelData.set(s.buffer);
    return buffer;
  });
  const gainNode = audioContext.createGain();
  gainNode.gain.value = volume;
  gainNode.connect(audioContext.destination);
  return {
    type,
    params,
    volume,
    buffers,
    bufferSourceNodes: void 0,
    gainNode,
    isPlaying: false,
    playedTime: void 0
  };
}
function get(mml, sequence, soundEffect2, isDrum, visualizer) {
  return {
    mml,
    sequence,
    soundEffect: soundEffect2,
    isDrum,
    noteIndex: 0,
    endStep: -1,
    visualizer
  };
}
function fromJSON(json, mmlToSequence) {
  return {
    mml: json.mml,
    sequence: mmlToSequence(json.mml, notesStepsCount),
    soundEffect: fromJSON$1(json.soundEffect),
    isDrum: json.isDrum,
    noteIndex: 0,
    endStep: -1
  };
}
let parts;
let notesStepsCount;
let notesStepsIndex;
let noteInterval;
let nextNotesTime;
let isPlaying = false;
function play(_parts, _notesStepsCount) {
  parts = _parts;
  notesStepsCount = _notesStepsCount;
  notesStepsIndex = 0;
  noteInterval = playInterval / 2;
  nextNotesTime = getQuantizedTime(audioContext.currentTime) - noteInterval;
  parts.forEach((p) => {
    p.noteIndex = 0;
  });
  isPlaying = true;
}
function stop() {
  isPlaying = false;
  parts.forEach((p) => {
    stop$1(p.soundEffect);
  });
}
function update$1() {
  if (!isPlaying) {
    return;
  }
  const currentTime = audioContext.currentTime;
  if (currentTime < nextNotesTime) {
    return;
  }
  nextNotesTime += noteInterval;
  if (nextNotesTime < currentTime) {
    nextNotesTime = getQuantizedTime(currentTime);
  }
  parts.forEach((p) => {
    updatePart(p, nextNotesTime);
  });
  notesStepsIndex++;
  if (notesStepsIndex >= notesStepsCount) {
    notesStepsIndex = 0;
  }
}
function updatePart(p, time) {
  const n = p.sequence.notes[p.noteIndex];
  if (n == null) {
    return;
  }
  if ((p.soundEffect.type === "synth" || p.soundEffect.type === "tone") && p.endStep === notesStepsIndex) {
    stop$1(p.soundEffect, time);
  }
  if (n.quantizedStartStep !== notesStepsIndex) {
    return;
  }
  if (p.soundEffect.type === "synth" || p.soundEffect.type === "tone") {
    stop$1(p.soundEffect);
  }
  if (p.isDrum) {
    playLater(p.soundEffect, time);
  } else {
    playLater(p.soundEffect, time, n.pitch - 69);
  }
  if (p.visualizer != null) {
    p.visualizer.redraw(n);
  }
  p.endStep = n.quantizedEndStep;
  if (p.endStep >= notesStepsCount) {
    p.endStep -= notesStepsCount;
  }
  p.noteIndex++;
  if (p.noteIndex >= p.sequence.notes.length) {
    p.noteIndex = 0;
  }
}
const mmlQuantizeInterval = 0.125;
let baseRandomSeed;
let soundEffects;
const isSafari = navigator.userAgent.indexOf("Safari") > -1 && navigator.userAgent.indexOf("Chrome") < 0;
function playMml(mmlData, volume = 0.1) {
  if (isSafari) {
    return;
  }
  const parts2 = mmlData.parts.map((dp) => {
    const p = fromJSON(dp, mmlToQuantizedSequence);
    setVolume(p.soundEffect, p.soundEffect.volume * volume / 0.2);
    return get(p.mml, p.sequence, p.soundEffect, p.isDrum);
  });
  play(parts2, mmlData.notesStepsCount);
}
function stopMml() {
  if (isSafari) {
    return;
  }
  stop();
}
function playSoundEffect(type, seed = void 0, count = 2, volume = 0.1, freq = void 0) {
  if (isSafari) {
    return;
  }
  const key = `${type}_${seed}_${count}_${volume}_${freq}`;
  if (soundEffects[key] == null) {
    soundEffects[key] = add(type, seed == null ? baseRandomSeed : seed, count, volume, freq);
  }
  play$1(soundEffects[key]);
}
function update() {
  if (isSafari) {
    return;
  }
  update$1();
  update$2();
}
function init(_baseRandomSeed = 1, audioContext2 = void 0) {
  if (isSafari) {
    return;
  }
  baseRandomSeed = _baseRandomSeed;
  init$2(audioContext2);
  init$1();
  soundEffects = {};
}
function mmlToQuantizedSequence(mml, notesStepsCount2) {
  const notes = [];
  const iter = new lib(mml);
  for (let ne of iter) {
    if (ne.type === "note") {
      let endStep = Math.floor(ne.time + ne.duration / mmlQuantizeInterval);
      if (endStep >= notesStepsCount2) {
        endStep -= notesStepsCount2;
      }
      notes.push({
        pitch: ne.noteNumber,
        quantizedStartStep: Math.floor(ne.time / mmlQuantizeInterval),
        endStep
      });
    }
  }
  return { notes };
}
export { init, playMml, playSoundEffect, setQuantize, setTempo, start as startAudio, stopMml, update };
