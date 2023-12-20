'use strict';

// Code from https://gist.github.com/banksean/300494 for seeded rand.
/*
  I've wrapped Makoto Matsumoto and Takuji Nishimura's code in a namespace
  so it's better encapsulated. Now you can have multiple random number generators
  and they won't stomp all over eachother's state.

  If you want to use this as a substitute for Math.random(), use the random()
  method like so:

  var m = new MersenneTwister();
  var randomNumber = m.random();

  You can also call the other genrand_{foo}() methods on the instance.
  If you want to use a specific seed in order to get a repeatable random
  sequence, pass an integer into the constructor:
  var m = new MersenneTwister(123);
  and that will always produce the same random sequence.
  Sean McCullough (banksean@gmail.com)
*/
/*
   A C-program for MT19937, with initialization improved 2002/1/26.
   Coded by Takuji Nishimura and Makoto Matsumoto.

   Before using, initialize the state by using init_genrand(seed)
   or init_by_array(init_key, key_length).

   Copyright (C) 1997 - 2002, Makoto Matsumoto and Takuji Nishimura,
   All rights reserved.

   Redistribution and use in source and binary forms, with or without
   modification, are permitted provided that the following conditions
   are met:

     1. Redistributions of source code must retain the above copyright
        notice, this list of conditions and the following disclaimer.

     2. Redistributions in binary form must reproduce the above copyright
        notice, this list of conditions and the following disclaimer in the
        documentation and/or other materials provided with the distribution.

     3. The names of its contributors may not be used to endorse or promote
        products derived from this software without specific prior written
        permission.

   THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
   "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
   LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
   A PARTICULAR PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL THE COPYRIGHT OWNER OR
   CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
   EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
   PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
   PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
   LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
   NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
   SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.


   Any feedback is very welcome.
   http://www.math.sci.hiroshima-u.ac.jp/~m-mat/MT/emt.html
   email: m-mat @ math.sci.hiroshima-u.ac.jp (remove space)
*/
class MersenneTwister {
    constructor(seed) {
        if (seed == undefined) {
            seed = new Date().getTime();
        }
        /* Period parameters */
        this.N = 624;
        this.M = 397;
        this.MATRIX_A = 0x9908b0df; /* constant vector a */
        this.UPPER_MASK = 0x80000000; /* most significant w-r bits */
        this.LOWER_MASK = 0x7fffffff; /* least significant r bits */
        this.mt = new Array(this.N); /* the array for the state vector */
        this.mti = this.N + 1; /* mti==N+1 means mt[N] is not initialized */
        this.init_genrand(seed);
    }
    /* initializes mt[N] with a seed */
    init_genrand(s) {
        this.mt[0] = s >>> 0;
        for (this.mti = 1; this.mti < this.N; this.mti++) {
            var s = this.mt[this.mti - 1] ^ (this.mt[this.mti - 1] >>> 30);
            this.mt[this.mti] =
                ((((s & 0xffff0000) >>> 16) * 1812433253) << 16) +
                    (s & 0x0000ffff) * 1812433253 +
                    this.mti;
            /* See Knuth TAOCP Vol2. 3rd Ed. P.106 for multiplier. */
            /* In the previous versions, MSBs of the seed affect   */
            /* only MSBs of the array mt[].                        */
            /* 2002/01/09 modified by Makoto Matsumoto             */
            this.mt[this.mti] >>>= 0;
            /* for >32 bit machines */
        }
    }
    /* initialize by an array with array-length */
    /* init_key is the array for initializing keys */
    /* key_length is its length */
    /* slight change for C++, 2004/2/26 */
    init_by_array(init_key, key_length) {
        var i, j, k;
        this.init_genrand(19650218);
        i = 1;
        j = 0;
        k = this.N > key_length ? this.N : key_length;
        for (; k; k--) {
            var s = this.mt[i - 1] ^ (this.mt[i - 1] >>> 30);
            this.mt[i] =
                (this.mt[i] ^
                    (((((s & 0xffff0000) >>> 16) * 1664525) << 16) +
                        (s & 0x0000ffff) * 1664525)) +
                    init_key[j] +
                    j; /* non linear */
            this.mt[i] >>>= 0; /* for WORDSIZE > 32 machines */
            i++;
            j++;
            if (i >= this.N) {
                this.mt[0] = this.mt[this.N - 1];
                i = 1;
            }
            if (j >= key_length)
                j = 0;
        }
        for (k = this.N - 1; k; k--) {
            var s = this.mt[i - 1] ^ (this.mt[i - 1] >>> 30);
            this.mt[i] =
                (this.mt[i] ^
                    (((((s & 0xffff0000) >>> 16) * 1566083941) << 16) +
                        (s & 0x0000ffff) * 1566083941)) -
                    i; /* non linear */
            this.mt[i] >>>= 0; /* for WORDSIZE > 32 machines */
            i++;
            if (i >= this.N) {
                this.mt[0] = this.mt[this.N - 1];
                i = 1;
            }
        }
        this.mt[0] = 0x80000000; /* MSB is 1; assuring non-zero initial array */
    }
    /* generates a random number on [0,0xffffffff]-interval */
    genrand_int32() {
        var y;
        var mag01 = new Array(0x0, this.MATRIX_A);
        /* mag01[x] = x * MATRIX_A  for x=0,1 */
        if (this.mti >= this.N) {
            /* generate N words at one time */
            var kk;
            if (this.mti == this.N + 1)
                /* if init_genrand() has not been called, */
                this.init_genrand(5489); /* a default initial seed is used */
            for (kk = 0; kk < this.N - this.M; kk++) {
                y =
                    (this.mt[kk] & this.UPPER_MASK) | (this.mt[kk + 1] & this.LOWER_MASK);
                this.mt[kk] = this.mt[kk + this.M] ^ (y >>> 1) ^ mag01[y & 0x1];
            }
            for (; kk < this.N - 1; kk++) {
                y =
                    (this.mt[kk] & this.UPPER_MASK) | (this.mt[kk + 1] & this.LOWER_MASK);
                this.mt[kk] =
                    this.mt[kk + (this.M - this.N)] ^ (y >>> 1) ^ mag01[y & 0x1];
            }
            y =
                (this.mt[this.N - 1] & this.UPPER_MASK) |
                    (this.mt[0] & this.LOWER_MASK);
            this.mt[this.N - 1] = this.mt[this.M - 1] ^ (y >>> 1) ^ mag01[y & 0x1];
            this.mti = 0;
        }
        y = this.mt[this.mti++];
        /* Tempering */
        y ^= y >>> 11;
        y ^= (y << 7) & 0x9d2c5680;
        y ^= (y << 15) & 0xefc60000;
        y ^= y >>> 18;
        return y >>> 0;
    }
}

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

var sha512 = {exports: {}};

function commonjsRequire(path) {
	throw new Error('Could not dynamically require "' + path + '". Please configure the dynamicRequireTargets or/and ignoreDynamicRequires option of @rollup/plugin-commonjs appropriately for this require call to work.');
}

var core = {exports: {}};

var hasRequiredCore;

function requireCore () {
	if (hasRequiredCore) return core.exports;
	hasRequiredCore = 1;
	(function (module, exports) {
(function (root, factory) {
			{
				// CommonJS
				module.exports = factory();
			}
		}(commonjsGlobal, function () {

			/*globals window, global, require*/

			/**
			 * CryptoJS core components.
			 */
			var CryptoJS = CryptoJS || (function (Math, undefined$1) {

			    var crypto;

			    // Native crypto from window (Browser)
			    if (typeof window !== 'undefined' && window.crypto) {
			        crypto = window.crypto;
			    }

			    // Native crypto in web worker (Browser)
			    if (typeof self !== 'undefined' && self.crypto) {
			        crypto = self.crypto;
			    }

			    // Native crypto from worker
			    if (typeof globalThis !== 'undefined' && globalThis.crypto) {
			        crypto = globalThis.crypto;
			    }

			    // Native (experimental IE 11) crypto from window (Browser)
			    if (!crypto && typeof window !== 'undefined' && window.msCrypto) {
			        crypto = window.msCrypto;
			    }

			    // Native crypto from global (NodeJS)
			    if (!crypto && typeof commonjsGlobal !== 'undefined' && commonjsGlobal.crypto) {
			        crypto = commonjsGlobal.crypto;
			    }

			    // Native crypto import via require (NodeJS)
			    if (!crypto && typeof commonjsRequire === 'function') {
			        try {
			            crypto = require('crypto');
			        } catch (err) {}
			    }

			    /*
			     * Cryptographically secure pseudorandom number generator
			     *
			     * As Math.random() is cryptographically not safe to use
			     */
			    var cryptoSecureRandomInt = function () {
			        if (crypto) {
			            // Use getRandomValues method (Browser)
			            if (typeof crypto.getRandomValues === 'function') {
			                try {
			                    return crypto.getRandomValues(new Uint32Array(1))[0];
			                } catch (err) {}
			            }

			            // Use randomBytes method (NodeJS)
			            if (typeof crypto.randomBytes === 'function') {
			                try {
			                    return crypto.randomBytes(4).readInt32LE();
			                } catch (err) {}
			            }
			        }

			        throw new Error('Native crypto module could not be used to get secure random number.');
			    };

			    /*
			     * Local polyfill of Object.create

			     */
			    var create = Object.create || (function () {
			        function F() {}

			        return function (obj) {
			            var subtype;

			            F.prototype = obj;

			            subtype = new F();

			            F.prototype = null;

			            return subtype;
			        };
			    }());

			    /**
			     * CryptoJS namespace.
			     */
			    var C = {};

			    /**
			     * Library namespace.
			     */
			    var C_lib = C.lib = {};

			    /**
			     * Base object for prototypal inheritance.
			     */
			    var Base = C_lib.Base = (function () {


			        return {
			            /**
			             * Creates a new object that inherits from this object.
			             *
			             * @param {Object} overrides Properties to copy into the new object.
			             *
			             * @return {Object} The new object.
			             *
			             * @static
			             *
			             * @example
			             *
			             *     var MyType = CryptoJS.lib.Base.extend({
			             *         field: 'value',
			             *
			             *         method: function () {
			             *         }
			             *     });
			             */
			            extend: function (overrides) {
			                // Spawn
			                var subtype = create(this);

			                // Augment
			                if (overrides) {
			                    subtype.mixIn(overrides);
			                }

			                // Create default initializer
			                if (!subtype.hasOwnProperty('init') || this.init === subtype.init) {
			                    subtype.init = function () {
			                        subtype.$super.init.apply(this, arguments);
			                    };
			                }

			                // Initializer's prototype is the subtype object
			                subtype.init.prototype = subtype;

			                // Reference supertype
			                subtype.$super = this;

			                return subtype;
			            },

			            /**
			             * Extends this object and runs the init method.
			             * Arguments to create() will be passed to init().
			             *
			             * @return {Object} The new object.
			             *
			             * @static
			             *
			             * @example
			             *
			             *     var instance = MyType.create();
			             */
			            create: function () {
			                var instance = this.extend();
			                instance.init.apply(instance, arguments);

			                return instance;
			            },

			            /**
			             * Initializes a newly created object.
			             * Override this method to add some logic when your objects are created.
			             *
			             * @example
			             *
			             *     var MyType = CryptoJS.lib.Base.extend({
			             *         init: function () {
			             *             // ...
			             *         }
			             *     });
			             */
			            init: function () {
			            },

			            /**
			             * Copies properties into this object.
			             *
			             * @param {Object} properties The properties to mix in.
			             *
			             * @example
			             *
			             *     MyType.mixIn({
			             *         field: 'value'
			             *     });
			             */
			            mixIn: function (properties) {
			                for (var propertyName in properties) {
			                    if (properties.hasOwnProperty(propertyName)) {
			                        this[propertyName] = properties[propertyName];
			                    }
			                }

			                // IE won't copy toString using the loop above
			                if (properties.hasOwnProperty('toString')) {
			                    this.toString = properties.toString;
			                }
			            },

			            /**
			             * Creates a copy of this object.
			             *
			             * @return {Object} The clone.
			             *
			             * @example
			             *
			             *     var clone = instance.clone();
			             */
			            clone: function () {
			                return this.init.prototype.extend(this);
			            }
			        };
			    }());

			    /**
			     * An array of 32-bit words.
			     *
			     * @property {Array} words The array of 32-bit words.
			     * @property {number} sigBytes The number of significant bytes in this word array.
			     */
			    var WordArray = C_lib.WordArray = Base.extend({
			        /**
			         * Initializes a newly created word array.
			         *
			         * @param {Array} words (Optional) An array of 32-bit words.
			         * @param {number} sigBytes (Optional) The number of significant bytes in the words.
			         *
			         * @example
			         *
			         *     var wordArray = CryptoJS.lib.WordArray.create();
			         *     var wordArray = CryptoJS.lib.WordArray.create([0x00010203, 0x04050607]);
			         *     var wordArray = CryptoJS.lib.WordArray.create([0x00010203, 0x04050607], 6);
			         */
			        init: function (words, sigBytes) {
			            words = this.words = words || [];

			            if (sigBytes != undefined$1) {
			                this.sigBytes = sigBytes;
			            } else {
			                this.sigBytes = words.length * 4;
			            }
			        },

			        /**
			         * Converts this word array to a string.
			         *
			         * @param {Encoder} encoder (Optional) The encoding strategy to use. Default: CryptoJS.enc.Hex
			         *
			         * @return {string} The stringified word array.
			         *
			         * @example
			         *
			         *     var string = wordArray + '';
			         *     var string = wordArray.toString();
			         *     var string = wordArray.toString(CryptoJS.enc.Utf8);
			         */
			        toString: function (encoder) {
			            return (encoder || Hex).stringify(this);
			        },

			        /**
			         * Concatenates a word array to this word array.
			         *
			         * @param {WordArray} wordArray The word array to append.
			         *
			         * @return {WordArray} This word array.
			         *
			         * @example
			         *
			         *     wordArray1.concat(wordArray2);
			         */
			        concat: function (wordArray) {
			            // Shortcuts
			            var thisWords = this.words;
			            var thatWords = wordArray.words;
			            var thisSigBytes = this.sigBytes;
			            var thatSigBytes = wordArray.sigBytes;

			            // Clamp excess bits
			            this.clamp();

			            // Concat
			            if (thisSigBytes % 4) {
			                // Copy one byte at a time
			                for (var i = 0; i < thatSigBytes; i++) {
			                    var thatByte = (thatWords[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
			                    thisWords[(thisSigBytes + i) >>> 2] |= thatByte << (24 - ((thisSigBytes + i) % 4) * 8);
			                }
			            } else {
			                // Copy one word at a time
			                for (var j = 0; j < thatSigBytes; j += 4) {
			                    thisWords[(thisSigBytes + j) >>> 2] = thatWords[j >>> 2];
			                }
			            }
			            this.sigBytes += thatSigBytes;

			            // Chainable
			            return this;
			        },

			        /**
			         * Removes insignificant bits.
			         *
			         * @example
			         *
			         *     wordArray.clamp();
			         */
			        clamp: function () {
			            // Shortcuts
			            var words = this.words;
			            var sigBytes = this.sigBytes;

			            // Clamp
			            words[sigBytes >>> 2] &= 0xffffffff << (32 - (sigBytes % 4) * 8);
			            words.length = Math.ceil(sigBytes / 4);
			        },

			        /**
			         * Creates a copy of this word array.
			         *
			         * @return {WordArray} The clone.
			         *
			         * @example
			         *
			         *     var clone = wordArray.clone();
			         */
			        clone: function () {
			            var clone = Base.clone.call(this);
			            clone.words = this.words.slice(0);

			            return clone;
			        },

			        /**
			         * Creates a word array filled with random bytes.
			         *
			         * @param {number} nBytes The number of random bytes to generate.
			         *
			         * @return {WordArray} The random word array.
			         *
			         * @static
			         *
			         * @example
			         *
			         *     var wordArray = CryptoJS.lib.WordArray.random(16);
			         */
			        random: function (nBytes) {
			            var words = [];

			            for (var i = 0; i < nBytes; i += 4) {
			                words.push(cryptoSecureRandomInt());
			            }

			            return new WordArray.init(words, nBytes);
			        }
			    });

			    /**
			     * Encoder namespace.
			     */
			    var C_enc = C.enc = {};

			    /**
			     * Hex encoding strategy.
			     */
			    var Hex = C_enc.Hex = {
			        /**
			         * Converts a word array to a hex string.
			         *
			         * @param {WordArray} wordArray The word array.
			         *
			         * @return {string} The hex string.
			         *
			         * @static
			         *
			         * @example
			         *
			         *     var hexString = CryptoJS.enc.Hex.stringify(wordArray);
			         */
			        stringify: function (wordArray) {
			            // Shortcuts
			            var words = wordArray.words;
			            var sigBytes = wordArray.sigBytes;

			            // Convert
			            var hexChars = [];
			            for (var i = 0; i < sigBytes; i++) {
			                var bite = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
			                hexChars.push((bite >>> 4).toString(16));
			                hexChars.push((bite & 0x0f).toString(16));
			            }

			            return hexChars.join('');
			        },

			        /**
			         * Converts a hex string to a word array.
			         *
			         * @param {string} hexStr The hex string.
			         *
			         * @return {WordArray} The word array.
			         *
			         * @static
			         *
			         * @example
			         *
			         *     var wordArray = CryptoJS.enc.Hex.parse(hexString);
			         */
			        parse: function (hexStr) {
			            // Shortcut
			            var hexStrLength = hexStr.length;

			            // Convert
			            var words = [];
			            for (var i = 0; i < hexStrLength; i += 2) {
			                words[i >>> 3] |= parseInt(hexStr.substr(i, 2), 16) << (24 - (i % 8) * 4);
			            }

			            return new WordArray.init(words, hexStrLength / 2);
			        }
			    };

			    /**
			     * Latin1 encoding strategy.
			     */
			    var Latin1 = C_enc.Latin1 = {
			        /**
			         * Converts a word array to a Latin1 string.
			         *
			         * @param {WordArray} wordArray The word array.
			         *
			         * @return {string} The Latin1 string.
			         *
			         * @static
			         *
			         * @example
			         *
			         *     var latin1String = CryptoJS.enc.Latin1.stringify(wordArray);
			         */
			        stringify: function (wordArray) {
			            // Shortcuts
			            var words = wordArray.words;
			            var sigBytes = wordArray.sigBytes;

			            // Convert
			            var latin1Chars = [];
			            for (var i = 0; i < sigBytes; i++) {
			                var bite = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
			                latin1Chars.push(String.fromCharCode(bite));
			            }

			            return latin1Chars.join('');
			        },

			        /**
			         * Converts a Latin1 string to a word array.
			         *
			         * @param {string} latin1Str The Latin1 string.
			         *
			         * @return {WordArray} The word array.
			         *
			         * @static
			         *
			         * @example
			         *
			         *     var wordArray = CryptoJS.enc.Latin1.parse(latin1String);
			         */
			        parse: function (latin1Str) {
			            // Shortcut
			            var latin1StrLength = latin1Str.length;

			            // Convert
			            var words = [];
			            for (var i = 0; i < latin1StrLength; i++) {
			                words[i >>> 2] |= (latin1Str.charCodeAt(i) & 0xff) << (24 - (i % 4) * 8);
			            }

			            return new WordArray.init(words, latin1StrLength);
			        }
			    };

			    /**
			     * UTF-8 encoding strategy.
			     */
			    var Utf8 = C_enc.Utf8 = {
			        /**
			         * Converts a word array to a UTF-8 string.
			         *
			         * @param {WordArray} wordArray The word array.
			         *
			         * @return {string} The UTF-8 string.
			         *
			         * @static
			         *
			         * @example
			         *
			         *     var utf8String = CryptoJS.enc.Utf8.stringify(wordArray);
			         */
			        stringify: function (wordArray) {
			            try {
			                return decodeURIComponent(escape(Latin1.stringify(wordArray)));
			            } catch (e) {
			                throw new Error('Malformed UTF-8 data');
			            }
			        },

			        /**
			         * Converts a UTF-8 string to a word array.
			         *
			         * @param {string} utf8Str The UTF-8 string.
			         *
			         * @return {WordArray} The word array.
			         *
			         * @static
			         *
			         * @example
			         *
			         *     var wordArray = CryptoJS.enc.Utf8.parse(utf8String);
			         */
			        parse: function (utf8Str) {
			            return Latin1.parse(unescape(encodeURIComponent(utf8Str)));
			        }
			    };

			    /**
			     * Abstract buffered block algorithm template.
			     *
			     * The property blockSize must be implemented in a concrete subtype.
			     *
			     * @property {number} _minBufferSize The number of blocks that should be kept unprocessed in the buffer. Default: 0
			     */
			    var BufferedBlockAlgorithm = C_lib.BufferedBlockAlgorithm = Base.extend({
			        /**
			         * Resets this block algorithm's data buffer to its initial state.
			         *
			         * @example
			         *
			         *     bufferedBlockAlgorithm.reset();
			         */
			        reset: function () {
			            // Initial values
			            this._data = new WordArray.init();
			            this._nDataBytes = 0;
			        },

			        /**
			         * Adds new data to this block algorithm's buffer.
			         *
			         * @param {WordArray|string} data The data to append. Strings are converted to a WordArray using UTF-8.
			         *
			         * @example
			         *
			         *     bufferedBlockAlgorithm._append('data');
			         *     bufferedBlockAlgorithm._append(wordArray);
			         */
			        _append: function (data) {
			            // Convert string to WordArray, else assume WordArray already
			            if (typeof data == 'string') {
			                data = Utf8.parse(data);
			            }

			            // Append
			            this._data.concat(data);
			            this._nDataBytes += data.sigBytes;
			        },

			        /**
			         * Processes available data blocks.
			         *
			         * This method invokes _doProcessBlock(offset), which must be implemented by a concrete subtype.
			         *
			         * @param {boolean} doFlush Whether all blocks and partial blocks should be processed.
			         *
			         * @return {WordArray} The processed data.
			         *
			         * @example
			         *
			         *     var processedData = bufferedBlockAlgorithm._process();
			         *     var processedData = bufferedBlockAlgorithm._process(!!'flush');
			         */
			        _process: function (doFlush) {
			            var processedWords;

			            // Shortcuts
			            var data = this._data;
			            var dataWords = data.words;
			            var dataSigBytes = data.sigBytes;
			            var blockSize = this.blockSize;
			            var blockSizeBytes = blockSize * 4;

			            // Count blocks ready
			            var nBlocksReady = dataSigBytes / blockSizeBytes;
			            if (doFlush) {
			                // Round up to include partial blocks
			                nBlocksReady = Math.ceil(nBlocksReady);
			            } else {
			                // Round down to include only full blocks,
			                // less the number of blocks that must remain in the buffer
			                nBlocksReady = Math.max((nBlocksReady | 0) - this._minBufferSize, 0);
			            }

			            // Count words ready
			            var nWordsReady = nBlocksReady * blockSize;

			            // Count bytes ready
			            var nBytesReady = Math.min(nWordsReady * 4, dataSigBytes);

			            // Process blocks
			            if (nWordsReady) {
			                for (var offset = 0; offset < nWordsReady; offset += blockSize) {
			                    // Perform concrete-algorithm logic
			                    this._doProcessBlock(dataWords, offset);
			                }

			                // Remove processed words
			                processedWords = dataWords.splice(0, nWordsReady);
			                data.sigBytes -= nBytesReady;
			            }

			            // Return processed words
			            return new WordArray.init(processedWords, nBytesReady);
			        },

			        /**
			         * Creates a copy of this object.
			         *
			         * @return {Object} The clone.
			         *
			         * @example
			         *
			         *     var clone = bufferedBlockAlgorithm.clone();
			         */
			        clone: function () {
			            var clone = Base.clone.call(this);
			            clone._data = this._data.clone();

			            return clone;
			        },

			        _minBufferSize: 0
			    });

			    /**
			     * Abstract hasher template.
			     *
			     * @property {number} blockSize The number of 32-bit words this hasher operates on. Default: 16 (512 bits)
			     */
			    C_lib.Hasher = BufferedBlockAlgorithm.extend({
			        /**
			         * Configuration options.
			         */
			        cfg: Base.extend(),

			        /**
			         * Initializes a newly created hasher.
			         *
			         * @param {Object} cfg (Optional) The configuration options to use for this hash computation.
			         *
			         * @example
			         *
			         *     var hasher = CryptoJS.algo.SHA256.create();
			         */
			        init: function (cfg) {
			            // Apply config defaults
			            this.cfg = this.cfg.extend(cfg);

			            // Set initial values
			            this.reset();
			        },

			        /**
			         * Resets this hasher to its initial state.
			         *
			         * @example
			         *
			         *     hasher.reset();
			         */
			        reset: function () {
			            // Reset data buffer
			            BufferedBlockAlgorithm.reset.call(this);

			            // Perform concrete-hasher logic
			            this._doReset();
			        },

			        /**
			         * Updates this hasher with a message.
			         *
			         * @param {WordArray|string} messageUpdate The message to append.
			         *
			         * @return {Hasher} This hasher.
			         *
			         * @example
			         *
			         *     hasher.update('message');
			         *     hasher.update(wordArray);
			         */
			        update: function (messageUpdate) {
			            // Append
			            this._append(messageUpdate);

			            // Update the hash
			            this._process();

			            // Chainable
			            return this;
			        },

			        /**
			         * Finalizes the hash computation.
			         * Note that the finalize operation is effectively a destructive, read-once operation.
			         *
			         * @param {WordArray|string} messageUpdate (Optional) A final message update.
			         *
			         * @return {WordArray} The hash.
			         *
			         * @example
			         *
			         *     var hash = hasher.finalize();
			         *     var hash = hasher.finalize('message');
			         *     var hash = hasher.finalize(wordArray);
			         */
			        finalize: function (messageUpdate) {
			            // Final message update
			            if (messageUpdate) {
			                this._append(messageUpdate);
			            }

			            // Perform concrete-hasher logic
			            var hash = this._doFinalize();

			            return hash;
			        },

			        blockSize: 512/32,

			        /**
			         * Creates a shortcut function to a hasher's object interface.
			         *
			         * @param {Hasher} hasher The hasher to create a helper for.
			         *
			         * @return {Function} The shortcut function.
			         *
			         * @static
			         *
			         * @example
			         *
			         *     var SHA256 = CryptoJS.lib.Hasher._createHelper(CryptoJS.algo.SHA256);
			         */
			        _createHelper: function (hasher) {
			            return function (message, cfg) {
			                return new hasher.init(cfg).finalize(message);
			            };
			        },

			        /**
			         * Creates a shortcut function to the HMAC's object interface.
			         *
			         * @param {Hasher} hasher The hasher to use in this HMAC helper.
			         *
			         * @return {Function} The shortcut function.
			         *
			         * @static
			         *
			         * @example
			         *
			         *     var HmacSHA256 = CryptoJS.lib.Hasher._createHmacHelper(CryptoJS.algo.SHA256);
			         */
			        _createHmacHelper: function (hasher) {
			            return function (message, key) {
			                return new C_algo.HMAC.init(hasher, key).finalize(message);
			            };
			        }
			    });

			    /**
			     * Algorithm namespace.
			     */
			    var C_algo = C.algo = {};

			    return C;
			}(Math));


			return CryptoJS;

		})); 
	} (core));
	return core.exports;
}

var x64Core = {exports: {}};

var hasRequiredX64Core;

function requireX64Core () {
	if (hasRequiredX64Core) return x64Core.exports;
	hasRequiredX64Core = 1;
	(function (module, exports) {
(function (root, factory) {
			{
				// CommonJS
				module.exports = factory(requireCore());
			}
		}(commonjsGlobal, function (CryptoJS) {

			(function (undefined$1) {
			    // Shortcuts
			    var C = CryptoJS;
			    var C_lib = C.lib;
			    var Base = C_lib.Base;
			    var X32WordArray = C_lib.WordArray;

			    /**
			     * x64 namespace.
			     */
			    var C_x64 = C.x64 = {};

			    /**
			     * A 64-bit word.
			     */
			    C_x64.Word = Base.extend({
			        /**
			         * Initializes a newly created 64-bit word.
			         *
			         * @param {number} high The high 32 bits.
			         * @param {number} low The low 32 bits.
			         *
			         * @example
			         *
			         *     var x64Word = CryptoJS.x64.Word.create(0x00010203, 0x04050607);
			         */
			        init: function (high, low) {
			            this.high = high;
			            this.low = low;
			        }

			        /**
			         * Bitwise NOTs this word.
			         *
			         * @return {X64Word} A new x64-Word object after negating.
			         *
			         * @example
			         *
			         *     var negated = x64Word.not();
			         */
			        // not: function () {
			            // var high = ~this.high;
			            // var low = ~this.low;

			            // return X64Word.create(high, low);
			        // },

			        /**
			         * Bitwise ANDs this word with the passed word.
			         *
			         * @param {X64Word} word The x64-Word to AND with this word.
			         *
			         * @return {X64Word} A new x64-Word object after ANDing.
			         *
			         * @example
			         *
			         *     var anded = x64Word.and(anotherX64Word);
			         */
			        // and: function (word) {
			            // var high = this.high & word.high;
			            // var low = this.low & word.low;

			            // return X64Word.create(high, low);
			        // },

			        /**
			         * Bitwise ORs this word with the passed word.
			         *
			         * @param {X64Word} word The x64-Word to OR with this word.
			         *
			         * @return {X64Word} A new x64-Word object after ORing.
			         *
			         * @example
			         *
			         *     var ored = x64Word.or(anotherX64Word);
			         */
			        // or: function (word) {
			            // var high = this.high | word.high;
			            // var low = this.low | word.low;

			            // return X64Word.create(high, low);
			        // },

			        /**
			         * Bitwise XORs this word with the passed word.
			         *
			         * @param {X64Word} word The x64-Word to XOR with this word.
			         *
			         * @return {X64Word} A new x64-Word object after XORing.
			         *
			         * @example
			         *
			         *     var xored = x64Word.xor(anotherX64Word);
			         */
			        // xor: function (word) {
			            // var high = this.high ^ word.high;
			            // var low = this.low ^ word.low;

			            // return X64Word.create(high, low);
			        // },

			        /**
			         * Shifts this word n bits to the left.
			         *
			         * @param {number} n The number of bits to shift.
			         *
			         * @return {X64Word} A new x64-Word object after shifting.
			         *
			         * @example
			         *
			         *     var shifted = x64Word.shiftL(25);
			         */
			        // shiftL: function (n) {
			            // if (n < 32) {
			                // var high = (this.high << n) | (this.low >>> (32 - n));
			                // var low = this.low << n;
			            // } else {
			                // var high = this.low << (n - 32);
			                // var low = 0;
			            // }

			            // return X64Word.create(high, low);
			        // },

			        /**
			         * Shifts this word n bits to the right.
			         *
			         * @param {number} n The number of bits to shift.
			         *
			         * @return {X64Word} A new x64-Word object after shifting.
			         *
			         * @example
			         *
			         *     var shifted = x64Word.shiftR(7);
			         */
			        // shiftR: function (n) {
			            // if (n < 32) {
			                // var low = (this.low >>> n) | (this.high << (32 - n));
			                // var high = this.high >>> n;
			            // } else {
			                // var low = this.high >>> (n - 32);
			                // var high = 0;
			            // }

			            // return X64Word.create(high, low);
			        // },

			        /**
			         * Rotates this word n bits to the left.
			         *
			         * @param {number} n The number of bits to rotate.
			         *
			         * @return {X64Word} A new x64-Word object after rotating.
			         *
			         * @example
			         *
			         *     var rotated = x64Word.rotL(25);
			         */
			        // rotL: function (n) {
			            // return this.shiftL(n).or(this.shiftR(64 - n));
			        // },

			        /**
			         * Rotates this word n bits to the right.
			         *
			         * @param {number} n The number of bits to rotate.
			         *
			         * @return {X64Word} A new x64-Word object after rotating.
			         *
			         * @example
			         *
			         *     var rotated = x64Word.rotR(7);
			         */
			        // rotR: function (n) {
			            // return this.shiftR(n).or(this.shiftL(64 - n));
			        // },

			        /**
			         * Adds this word with the passed word.
			         *
			         * @param {X64Word} word The x64-Word to add with this word.
			         *
			         * @return {X64Word} A new x64-Word object after adding.
			         *
			         * @example
			         *
			         *     var added = x64Word.add(anotherX64Word);
			         */
			        // add: function (word) {
			            // var low = (this.low + word.low) | 0;
			            // var carry = (low >>> 0) < (this.low >>> 0) ? 1 : 0;
			            // var high = (this.high + word.high + carry) | 0;

			            // return X64Word.create(high, low);
			        // }
			    });

			    /**
			     * An array of 64-bit words.
			     *
			     * @property {Array} words The array of CryptoJS.x64.Word objects.
			     * @property {number} sigBytes The number of significant bytes in this word array.
			     */
			    C_x64.WordArray = Base.extend({
			        /**
			         * Initializes a newly created word array.
			         *
			         * @param {Array} words (Optional) An array of CryptoJS.x64.Word objects.
			         * @param {number} sigBytes (Optional) The number of significant bytes in the words.
			         *
			         * @example
			         *
			         *     var wordArray = CryptoJS.x64.WordArray.create();
			         *
			         *     var wordArray = CryptoJS.x64.WordArray.create([
			         *         CryptoJS.x64.Word.create(0x00010203, 0x04050607),
			         *         CryptoJS.x64.Word.create(0x18191a1b, 0x1c1d1e1f)
			         *     ]);
			         *
			         *     var wordArray = CryptoJS.x64.WordArray.create([
			         *         CryptoJS.x64.Word.create(0x00010203, 0x04050607),
			         *         CryptoJS.x64.Word.create(0x18191a1b, 0x1c1d1e1f)
			         *     ], 10);
			         */
			        init: function (words, sigBytes) {
			            words = this.words = words || [];

			            if (sigBytes != undefined$1) {
			                this.sigBytes = sigBytes;
			            } else {
			                this.sigBytes = words.length * 8;
			            }
			        },

			        /**
			         * Converts this 64-bit word array to a 32-bit word array.
			         *
			         * @return {CryptoJS.lib.WordArray} This word array's data as a 32-bit word array.
			         *
			         * @example
			         *
			         *     var x32WordArray = x64WordArray.toX32();
			         */
			        toX32: function () {
			            // Shortcuts
			            var x64Words = this.words;
			            var x64WordsLength = x64Words.length;

			            // Convert
			            var x32Words = [];
			            for (var i = 0; i < x64WordsLength; i++) {
			                var x64Word = x64Words[i];
			                x32Words.push(x64Word.high);
			                x32Words.push(x64Word.low);
			            }

			            return X32WordArray.create(x32Words, this.sigBytes);
			        },

			        /**
			         * Creates a copy of this word array.
			         *
			         * @return {X64WordArray} The clone.
			         *
			         * @example
			         *
			         *     var clone = x64WordArray.clone();
			         */
			        clone: function () {
			            var clone = Base.clone.call(this);

			            // Clone "words" array
			            var words = clone.words = this.words.slice(0);

			            // Clone each X64Word object
			            var wordsLength = words.length;
			            for (var i = 0; i < wordsLength; i++) {
			                words[i] = words[i].clone();
			            }

			            return clone;
			        }
			    });
			}());


			return CryptoJS;

		})); 
	} (x64Core));
	return x64Core.exports;
}

(function (module, exports) {
(function (root, factory, undef) {
		{
			// CommonJS
			module.exports = factory(requireCore(), requireX64Core());
		}
	}(commonjsGlobal, function (CryptoJS) {

		(function () {
		    // Shortcuts
		    var C = CryptoJS;
		    var C_lib = C.lib;
		    var Hasher = C_lib.Hasher;
		    var C_x64 = C.x64;
		    var X64Word = C_x64.Word;
		    var X64WordArray = C_x64.WordArray;
		    var C_algo = C.algo;

		    function X64Word_create() {
		        return X64Word.create.apply(X64Word, arguments);
		    }

		    // Constants
		    var K = [
		        X64Word_create(0x428a2f98, 0xd728ae22), X64Word_create(0x71374491, 0x23ef65cd),
		        X64Word_create(0xb5c0fbcf, 0xec4d3b2f), X64Word_create(0xe9b5dba5, 0x8189dbbc),
		        X64Word_create(0x3956c25b, 0xf348b538), X64Word_create(0x59f111f1, 0xb605d019),
		        X64Word_create(0x923f82a4, 0xaf194f9b), X64Word_create(0xab1c5ed5, 0xda6d8118),
		        X64Word_create(0xd807aa98, 0xa3030242), X64Word_create(0x12835b01, 0x45706fbe),
		        X64Word_create(0x243185be, 0x4ee4b28c), X64Word_create(0x550c7dc3, 0xd5ffb4e2),
		        X64Word_create(0x72be5d74, 0xf27b896f), X64Word_create(0x80deb1fe, 0x3b1696b1),
		        X64Word_create(0x9bdc06a7, 0x25c71235), X64Word_create(0xc19bf174, 0xcf692694),
		        X64Word_create(0xe49b69c1, 0x9ef14ad2), X64Word_create(0xefbe4786, 0x384f25e3),
		        X64Word_create(0x0fc19dc6, 0x8b8cd5b5), X64Word_create(0x240ca1cc, 0x77ac9c65),
		        X64Word_create(0x2de92c6f, 0x592b0275), X64Word_create(0x4a7484aa, 0x6ea6e483),
		        X64Word_create(0x5cb0a9dc, 0xbd41fbd4), X64Word_create(0x76f988da, 0x831153b5),
		        X64Word_create(0x983e5152, 0xee66dfab), X64Word_create(0xa831c66d, 0x2db43210),
		        X64Word_create(0xb00327c8, 0x98fb213f), X64Word_create(0xbf597fc7, 0xbeef0ee4),
		        X64Word_create(0xc6e00bf3, 0x3da88fc2), X64Word_create(0xd5a79147, 0x930aa725),
		        X64Word_create(0x06ca6351, 0xe003826f), X64Word_create(0x14292967, 0x0a0e6e70),
		        X64Word_create(0x27b70a85, 0x46d22ffc), X64Word_create(0x2e1b2138, 0x5c26c926),
		        X64Word_create(0x4d2c6dfc, 0x5ac42aed), X64Word_create(0x53380d13, 0x9d95b3df),
		        X64Word_create(0x650a7354, 0x8baf63de), X64Word_create(0x766a0abb, 0x3c77b2a8),
		        X64Word_create(0x81c2c92e, 0x47edaee6), X64Word_create(0x92722c85, 0x1482353b),
		        X64Word_create(0xa2bfe8a1, 0x4cf10364), X64Word_create(0xa81a664b, 0xbc423001),
		        X64Word_create(0xc24b8b70, 0xd0f89791), X64Word_create(0xc76c51a3, 0x0654be30),
		        X64Word_create(0xd192e819, 0xd6ef5218), X64Word_create(0xd6990624, 0x5565a910),
		        X64Word_create(0xf40e3585, 0x5771202a), X64Word_create(0x106aa070, 0x32bbd1b8),
		        X64Word_create(0x19a4c116, 0xb8d2d0c8), X64Word_create(0x1e376c08, 0x5141ab53),
		        X64Word_create(0x2748774c, 0xdf8eeb99), X64Word_create(0x34b0bcb5, 0xe19b48a8),
		        X64Word_create(0x391c0cb3, 0xc5c95a63), X64Word_create(0x4ed8aa4a, 0xe3418acb),
		        X64Word_create(0x5b9cca4f, 0x7763e373), X64Word_create(0x682e6ff3, 0xd6b2b8a3),
		        X64Word_create(0x748f82ee, 0x5defb2fc), X64Word_create(0x78a5636f, 0x43172f60),
		        X64Word_create(0x84c87814, 0xa1f0ab72), X64Word_create(0x8cc70208, 0x1a6439ec),
		        X64Word_create(0x90befffa, 0x23631e28), X64Word_create(0xa4506ceb, 0xde82bde9),
		        X64Word_create(0xbef9a3f7, 0xb2c67915), X64Word_create(0xc67178f2, 0xe372532b),
		        X64Word_create(0xca273ece, 0xea26619c), X64Word_create(0xd186b8c7, 0x21c0c207),
		        X64Word_create(0xeada7dd6, 0xcde0eb1e), X64Word_create(0xf57d4f7f, 0xee6ed178),
		        X64Word_create(0x06f067aa, 0x72176fba), X64Word_create(0x0a637dc5, 0xa2c898a6),
		        X64Word_create(0x113f9804, 0xbef90dae), X64Word_create(0x1b710b35, 0x131c471b),
		        X64Word_create(0x28db77f5, 0x23047d84), X64Word_create(0x32caab7b, 0x40c72493),
		        X64Word_create(0x3c9ebe0a, 0x15c9bebc), X64Word_create(0x431d67c4, 0x9c100d4c),
		        X64Word_create(0x4cc5d4be, 0xcb3e42b6), X64Word_create(0x597f299c, 0xfc657e2a),
		        X64Word_create(0x5fcb6fab, 0x3ad6faec), X64Word_create(0x6c44198c, 0x4a475817)
		    ];

		    // Reusable objects
		    var W = [];
		    (function () {
		        for (var i = 0; i < 80; i++) {
		            W[i] = X64Word_create();
		        }
		    }());

		    /**
		     * SHA-512 hash algorithm.
		     */
		    var SHA512 = C_algo.SHA512 = Hasher.extend({
		        _doReset: function () {
		            this._hash = new X64WordArray.init([
		                new X64Word.init(0x6a09e667, 0xf3bcc908), new X64Word.init(0xbb67ae85, 0x84caa73b),
		                new X64Word.init(0x3c6ef372, 0xfe94f82b), new X64Word.init(0xa54ff53a, 0x5f1d36f1),
		                new X64Word.init(0x510e527f, 0xade682d1), new X64Word.init(0x9b05688c, 0x2b3e6c1f),
		                new X64Word.init(0x1f83d9ab, 0xfb41bd6b), new X64Word.init(0x5be0cd19, 0x137e2179)
		            ]);
		        },

		        _doProcessBlock: function (M, offset) {
		            // Shortcuts
		            var H = this._hash.words;

		            var H0 = H[0];
		            var H1 = H[1];
		            var H2 = H[2];
		            var H3 = H[3];
		            var H4 = H[4];
		            var H5 = H[5];
		            var H6 = H[6];
		            var H7 = H[7];

		            var H0h = H0.high;
		            var H0l = H0.low;
		            var H1h = H1.high;
		            var H1l = H1.low;
		            var H2h = H2.high;
		            var H2l = H2.low;
		            var H3h = H3.high;
		            var H3l = H3.low;
		            var H4h = H4.high;
		            var H4l = H4.low;
		            var H5h = H5.high;
		            var H5l = H5.low;
		            var H6h = H6.high;
		            var H6l = H6.low;
		            var H7h = H7.high;
		            var H7l = H7.low;

		            // Working variables
		            var ah = H0h;
		            var al = H0l;
		            var bh = H1h;
		            var bl = H1l;
		            var ch = H2h;
		            var cl = H2l;
		            var dh = H3h;
		            var dl = H3l;
		            var eh = H4h;
		            var el = H4l;
		            var fh = H5h;
		            var fl = H5l;
		            var gh = H6h;
		            var gl = H6l;
		            var hh = H7h;
		            var hl = H7l;

		            // Rounds
		            for (var i = 0; i < 80; i++) {
		                var Wil;
		                var Wih;

		                // Shortcut
		                var Wi = W[i];

		                // Extend message
		                if (i < 16) {
		                    Wih = Wi.high = M[offset + i * 2]     | 0;
		                    Wil = Wi.low  = M[offset + i * 2 + 1] | 0;
		                } else {
		                    // Gamma0
		                    var gamma0x  = W[i - 15];
		                    var gamma0xh = gamma0x.high;
		                    var gamma0xl = gamma0x.low;
		                    var gamma0h  = ((gamma0xh >>> 1) | (gamma0xl << 31)) ^ ((gamma0xh >>> 8) | (gamma0xl << 24)) ^ (gamma0xh >>> 7);
		                    var gamma0l  = ((gamma0xl >>> 1) | (gamma0xh << 31)) ^ ((gamma0xl >>> 8) | (gamma0xh << 24)) ^ ((gamma0xl >>> 7) | (gamma0xh << 25));

		                    // Gamma1
		                    var gamma1x  = W[i - 2];
		                    var gamma1xh = gamma1x.high;
		                    var gamma1xl = gamma1x.low;
		                    var gamma1h  = ((gamma1xh >>> 19) | (gamma1xl << 13)) ^ ((gamma1xh << 3) | (gamma1xl >>> 29)) ^ (gamma1xh >>> 6);
		                    var gamma1l  = ((gamma1xl >>> 19) | (gamma1xh << 13)) ^ ((gamma1xl << 3) | (gamma1xh >>> 29)) ^ ((gamma1xl >>> 6) | (gamma1xh << 26));

		                    // W[i] = gamma0 + W[i - 7] + gamma1 + W[i - 16]
		                    var Wi7  = W[i - 7];
		                    var Wi7h = Wi7.high;
		                    var Wi7l = Wi7.low;

		                    var Wi16  = W[i - 16];
		                    var Wi16h = Wi16.high;
		                    var Wi16l = Wi16.low;

		                    Wil = gamma0l + Wi7l;
		                    Wih = gamma0h + Wi7h + ((Wil >>> 0) < (gamma0l >>> 0) ? 1 : 0);
		                    Wil = Wil + gamma1l;
		                    Wih = Wih + gamma1h + ((Wil >>> 0) < (gamma1l >>> 0) ? 1 : 0);
		                    Wil = Wil + Wi16l;
		                    Wih = Wih + Wi16h + ((Wil >>> 0) < (Wi16l >>> 0) ? 1 : 0);

		                    Wi.high = Wih;
		                    Wi.low  = Wil;
		                }

		                var chh  = (eh & fh) ^ (~eh & gh);
		                var chl  = (el & fl) ^ (~el & gl);
		                var majh = (ah & bh) ^ (ah & ch) ^ (bh & ch);
		                var majl = (al & bl) ^ (al & cl) ^ (bl & cl);

		                var sigma0h = ((ah >>> 28) | (al << 4))  ^ ((ah << 30)  | (al >>> 2)) ^ ((ah << 25) | (al >>> 7));
		                var sigma0l = ((al >>> 28) | (ah << 4))  ^ ((al << 30)  | (ah >>> 2)) ^ ((al << 25) | (ah >>> 7));
		                var sigma1h = ((eh >>> 14) | (el << 18)) ^ ((eh >>> 18) | (el << 14)) ^ ((eh << 23) | (el >>> 9));
		                var sigma1l = ((el >>> 14) | (eh << 18)) ^ ((el >>> 18) | (eh << 14)) ^ ((el << 23) | (eh >>> 9));

		                // t1 = h + sigma1 + ch + K[i] + W[i]
		                var Ki  = K[i];
		                var Kih = Ki.high;
		                var Kil = Ki.low;

		                var t1l = hl + sigma1l;
		                var t1h = hh + sigma1h + ((t1l >>> 0) < (hl >>> 0) ? 1 : 0);
		                var t1l = t1l + chl;
		                var t1h = t1h + chh + ((t1l >>> 0) < (chl >>> 0) ? 1 : 0);
		                var t1l = t1l + Kil;
		                var t1h = t1h + Kih + ((t1l >>> 0) < (Kil >>> 0) ? 1 : 0);
		                var t1l = t1l + Wil;
		                var t1h = t1h + Wih + ((t1l >>> 0) < (Wil >>> 0) ? 1 : 0);

		                // t2 = sigma0 + maj
		                var t2l = sigma0l + majl;
		                var t2h = sigma0h + majh + ((t2l >>> 0) < (sigma0l >>> 0) ? 1 : 0);

		                // Update working variables
		                hh = gh;
		                hl = gl;
		                gh = fh;
		                gl = fl;
		                fh = eh;
		                fl = el;
		                el = (dl + t1l) | 0;
		                eh = (dh + t1h + ((el >>> 0) < (dl >>> 0) ? 1 : 0)) | 0;
		                dh = ch;
		                dl = cl;
		                ch = bh;
		                cl = bl;
		                bh = ah;
		                bl = al;
		                al = (t1l + t2l) | 0;
		                ah = (t1h + t2h + ((al >>> 0) < (t1l >>> 0) ? 1 : 0)) | 0;
		            }

		            // Intermediate hash value
		            H0l = H0.low  = (H0l + al);
		            H0.high = (H0h + ah + ((H0l >>> 0) < (al >>> 0) ? 1 : 0));
		            H1l = H1.low  = (H1l + bl);
		            H1.high = (H1h + bh + ((H1l >>> 0) < (bl >>> 0) ? 1 : 0));
		            H2l = H2.low  = (H2l + cl);
		            H2.high = (H2h + ch + ((H2l >>> 0) < (cl >>> 0) ? 1 : 0));
		            H3l = H3.low  = (H3l + dl);
		            H3.high = (H3h + dh + ((H3l >>> 0) < (dl >>> 0) ? 1 : 0));
		            H4l = H4.low  = (H4l + el);
		            H4.high = (H4h + eh + ((H4l >>> 0) < (el >>> 0) ? 1 : 0));
		            H5l = H5.low  = (H5l + fl);
		            H5.high = (H5h + fh + ((H5l >>> 0) < (fl >>> 0) ? 1 : 0));
		            H6l = H6.low  = (H6l + gl);
		            H6.high = (H6h + gh + ((H6l >>> 0) < (gl >>> 0) ? 1 : 0));
		            H7l = H7.low  = (H7l + hl);
		            H7.high = (H7h + hh + ((H7l >>> 0) < (hl >>> 0) ? 1 : 0));
		        },

		        _doFinalize: function () {
		            // Shortcuts
		            var data = this._data;
		            var dataWords = data.words;

		            var nBitsTotal = this._nDataBytes * 8;
		            var nBitsLeft = data.sigBytes * 8;

		            // Add padding
		            dataWords[nBitsLeft >>> 5] |= 0x80 << (24 - nBitsLeft % 32);
		            dataWords[(((nBitsLeft + 128) >>> 10) << 5) + 30] = Math.floor(nBitsTotal / 0x100000000);
		            dataWords[(((nBitsLeft + 128) >>> 10) << 5) + 31] = nBitsTotal;
		            data.sigBytes = dataWords.length * 4;

		            // Hash final blocks
		            this._process();

		            // Convert hash to 32-bit word array before returning
		            var hash = this._hash.toX32();

		            // Return final computed hash
		            return hash;
		        },

		        clone: function () {
		            var clone = Hasher.clone.call(this);
		            clone._hash = this._hash.clone();

		            return clone;
		        },

		        blockSize: 1024/32
		    });

		    /**
		     * Shortcut function to the hasher's object interface.
		     *
		     * @param {WordArray|string} message The message to hash.
		     *
		     * @return {WordArray} The hash.
		     *
		     * @static
		     *
		     * @example
		     *
		     *     var hash = CryptoJS.SHA512('message');
		     *     var hash = CryptoJS.SHA512(wordArray);
		     */
		    C.SHA512 = Hasher._createHelper(SHA512);

		    /**
		     * Shortcut function to the HMAC's object interface.
		     *
		     * @param {WordArray|string} message The message to hash.
		     * @param {WordArray|string} key The secret key.
		     *
		     * @return {WordArray} The HMAC.
		     *
		     * @static
		     *
		     * @example
		     *
		     *     var hmac = CryptoJS.HmacSHA512(message, key);
		     */
		    C.HmacSHA512 = Hasher._createHmacHelper(SHA512);
		}());


		return CryptoJS.SHA512;

	})); 
} (sha512));

var sha512Exports = sha512.exports;
var SHA512 = /*@__PURE__*/getDefaultExportFromCjs(sha512Exports);

/*UTF8 encode and decode from http://ixti.net/development/javascript/2011/11/11/base64-encodedecode-of-utf8-in-browser-with-js.html */
function utf8Decode(bytes) {
    var chars = [], offset = 0, length = bytes.length, c, c2, c3;
    while (offset < length) {
        c = bytes[offset];
        c2 = bytes[offset + 1];
        c3 = bytes[offset + 2];
        if (128 > c) {
            chars.push(String.fromCharCode(c));
            offset += 1;
        }
        else if (191 < c && c < 224) {
            chars.push(String.fromCharCode(((c & 31) << 6) | (c2 & 63)));
            offset += 2;
        }
        else {
            chars.push(String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63)));
            offset += 3;
        }
    }
    return chars.join('');
}
function utf8Encode(str) {
    var bytes = [], offset = 0, length, char;
    str = encodeURI(str);
    length = str.length;
    while (offset < length) {
        char = str[offset];
        offset += 1;
        if ('%' !== char) {
            bytes.push(char.charCodeAt(0));
        }
        else {
            char = str[offset] + str[offset + 1];
            bytes.push(parseInt(char, 16));
            offset += 2;
        }
    }
    return bytes;
}

function rgb2ycbcr(r, g, b) {
    /* RGB to Y Cb Cr space */
    return [0.299 * r + 0.587 * g + 0.114 * b, 128 - 0.168736 * r - 0.331264 * g + 0.5 * b, 128 + 0.5 * r - 0.418688 * g - 0.081312 * b];
}
function ycbcr2rgb(y, cb, cr) {
    /* Y Cb Cr to RGB space */
    return [y + 1.402 * (cr - 128), y - 0.344136 * (cb - 128) - 0.714136 * (cr - 128), y + 1.772 * (cb - 128)];
}
function get_hashed_order(password, arr_len) {
    // O(arr_len) algorithm
    var orders = Array.from(Array(arr_len).keys());
    var result = [];
    var loc;
    var seed = SHA512(password).words.reduce(function (total, num) { return total + Math.abs(num); }, 0);
    var rnd = new MersenneTwister(seed);
    for (var i = arr_len; i > 0; i--) {
        loc = rnd.genrand_int32() % i;
        result.push(orders[loc]);
        orders[loc] = orders[i - 1];
    }
    return result;
}
function dct(dataArray) {
    // Apply DCT to a 8*8 data array (64). Expected input is [8*8]
    // input 8*8 | x,y loc x*8+y
    // output 8*8| u,v loc u*8+v
    var result = Array(64).fill(0);
    var cu, cv, sum;
    for (var u = 0; u < 8; u++)
        for (var v = 0; v < 8; v++) {
            cu = (u == 0) ? 1 / Math.sqrt(2) : 1;
            cv = (v == 0) ? 1 / Math.sqrt(2) : 1;
            sum = 0;
            for (var x = 0; x < 8; x++)
                for (var y = 0; y < 8; y++) {
                    sum += dataArray[x * 8 + y] * Math.cos((2 * x + 1) * u * Math.PI / 16) * Math.cos((2 * y + 1) * v * Math.PI / 16);
                }
            result[u * 8 + v] = (1 / 4) * cu * cv * sum;
        }
    return result;
}
function idct(dataArray) {
    // Apply inverse DCT to a 8*8 data array (64). Expected output is [8*8] -> Y Cb Cr
    //input 8*8*3 | u,v loc u*8+v
    //output 8*8*3| x,y loc x*8+y
    const result = Array(64).fill(0);
    var cu, cv, sum;
    for (var x = 0; x < 8; x++)
        for (var y = 0; y < 8; y++) {
            sum = 0;
            for (var u = 0; u < 8; u++)
                for (var v = 0; v < 8; v++) {
                    cu = (u == 0) ? 1 / Math.sqrt(2) : 1;
                    cv = (v == 0) ? 1 / Math.sqrt(2) : 1;
                    sum += cu * cv * dataArray[u * 8 + v] * Math.cos((2 * x + 1) * u * Math.PI / 16) * Math.cos((2 * y + 1) * v * Math.PI / 16);
                }
            result[x * 8 + y] = (1 / 4) * sum;
        }
    return result;
}
function quantization_matrix(multiply) {
    /*
    return a quantization matrix with given multiply. pre-defined Q from
    https://en.wikipedia.org/wiki/Quantization_(image_processing)#Quantization_matrices
    */
    var Q = [
        16, 11, 10, 16, 24, 40, 51, 61,
        12, 12, 14, 19, 26, 58, 60, 55,
        14, 13, 16, 24, 40, 57, 69, 56,
        14, 17, 22, 29, 51, 87, 80, 62,
        18, 22, 37, 56, 68, 109, 103, 77,
        24, 35, 55, 64, 81, 104, 113, 92,
        49, 64, 78, 87, 103, 121, 120, 101,
        72, 92, 95, 98, 112, 100, 103, 99,
    ];
    for (var i = 0; i < 64; i++) {
        Q[i] *= multiply;
    }
    return Q;
}
function quantize_diff(multiply, loc, mat, encode_bits) {
    /* quantize the size 64 (8*8) matrix.
    Input:
        multiply (int): the multiply for quantization matrix Q. Larger value is more robust but changes more image details.
        loc (array): where to apply quantization.
        mat (array of size 64): the matrix.
        encode_bits (0/1 bit array with same size as loc)
    Output:
        diff (array of size 64): the diff to be added to original array for stego
    */
    if (loc.length != encode_bits.length)
        throw "LOC and ENCODE_BITS have different sizes! This is a bug in code!";
    var Q = quantization_matrix(multiply);
    var result = Array(64).fill(0);
    var div_Q, low, high;
    for (var i = 0; i < loc.length; i++) {
        div_Q = mat[loc[i]] / Q[loc[i]];
        low = Math.floor(div_Q);
        if (Math.abs(low % 2) != encode_bits[i])
            low -= 1;
        high = Math.ceil(div_Q);
        if (Math.abs(high % 2) != encode_bits[i])
            high += 1;
        if (div_Q - low > high - div_Q)
            low = high;
        result[loc[i]] = low * Q[loc[i]] - mat[loc[i]];
    }
    return result;
}
function get_bit_from_quantized(multiply, loc, quantized_mat) {
    /* get bits from quantized size 64 (8*8) matrix.
    Input:
        multiply (int): the multiply for quantization matrix Q. Larger value is more robust but changes more image details.
        loc (array): where quantization is applied.
        quantized_mat (array of size 64): the matrix.
    Output:
        bits (array of size loc.length): the extracted bits
    */
    var Q = quantization_matrix(multiply);
    var result = [];
    for (var i = 0; i < loc.length; i++) {
        result.push(Math.abs(Math.round(quantized_mat[loc[i]] / Q[loc[i]]) % 2));
    }
    return result;
}
function img_16x16_to_8x8(mat) {
    /* Resize image from 16 * 16 to 8 * 8
    Input:
        mat (size 256)
    Output:
        out_mat (size 64)
    */
    var result = Array(64);
    for (var i = 0; i < 8; i++)
        for (var j = 0; j < 8; j++) {
            result[i * 8 + j] = (mat[i * 2 * 8 + j * 2] + mat[(i * 2 + 1) * 8 + j * 2] + mat[i * 2 * 8 + j * 2 + 1] + mat[(i * 2 + 1) * 8 + j * 2 + 1]) / 4;
        }
    return result;
}
function img_8x8_to_16x16(mat) {
    /* Resize image from 8 * 8 to 16 * 16
    Input:
        mat (size 64)
    Output:
        out_mat (size 256)
    */
    var result = Array(256);
    for (var i = 0; i < 16; i++)
        for (var j = 0; j < 16; j++) {
            result[i * 16 + j] = mat[Math.floor(i / 2) * 8 + Math.floor(j / 2)];
        }
    return result;
}
function rgbclip(a) {
    a = Math.round(a);
    a = (a > 255) ? 255 : a;
    return (a < 0) ? 0 : a;
}
function str_to_bits(str, num_copy) {
    var utf8array = utf8Encode(str);
    var result = Array();
    var utf8strlen = utf8array.length;
    for (var i = 0; i < utf8strlen; i++) {
        for (var j = 128; j > 0; j = Math.floor(j / 2)) {
            if (Math.floor(utf8array[i] / j)) {
                for (var cp = 0; cp < num_copy; cp++)
                    result.push(1);
                utf8array[i] -= j;
            }
            else
                for (var cp = 0; cp < num_copy; cp++)
                    result.push(0);
        }
    }
    for (var j = 0; j < 24; j++)
        for (var i = 0; i < num_copy; i++) {
            result.push(1);
        }
    return result;
}
function bits_to_str(bitarray, num_copy) {
    function merge_bits(bits) {
        var bits_len = bits.length;
        var bits_sum = 0;
        for (var i = 0; i < bits_len; i++)
            bits_sum += bits[i];
        return Math.round(bits_sum / bits_len);
    }
    var msg_array = Array();
    var data, tmp;
    var msg_array_len = Math.floor(Math.floor(bitarray.length / num_copy) / 8);
    for (var i = 0; i < msg_array_len; i++) {
        data = 0;
        tmp = 128;
        for (var j = 0; j < 8; j++) {
            data += merge_bits(bitarray.slice((i * 8 + j) * num_copy, (i * 8 + j + 1) * num_copy)) * tmp;
            tmp = Math.floor(tmp / 2);
        }
        if (data == 255)
            break; //END NOTATION
        msg_array.push(data);
    }
    return utf8Decode(msg_array);
}
function extract_block(mat, block_size, x_min, y_min, img_num_col) {
    var result = Array(block_size * block_size);
    for (var i = 0; i < block_size; i++)
        for (var j = 0; j < block_size; j++) {
            result[i * block_size + j] = mat[(x_min + i) * img_num_col + y_min + j];
        }
    return result;
}
function replace_block(mat, block_size, x_min, y_min, img_num_col, new_data) {
    for (var i = 0; i < block_size; i++)
        for (var j = 0; j < block_size; j++) {
            mat[(x_min + i) * img_num_col + y_min + j] = new_data[i * block_size + j];
        }
}

function prepare_write_data(data_bits, enc_key, encode_len) {
    var data_bits_len = data_bits.length;
    if (data_bits.length > encode_len)
        throw "Can not hold this many data!";
    var result = Array(encode_len);
    for (var i = 0; i < encode_len; i++) {
        result[i] = Math.floor(Math.random() * 2); //obfuscation
    }
    var order = get_hashed_order(enc_key, encode_len);
    for (var i = 0; i < data_bits_len; i++)
        result[order[i]] = data_bits[i];
    return result;
}
function write_dct_y(channel_data, channel_width, channel_length, setdata, multiply, loc) {
    /* write a DCT manipulated Y channel from original Y channel
    Input:
        channel_data (1D array of size (channel_width * channel_length)): original Y data
        channel_width (int): channel width
        channel_length (int): channel length
        setdata (1D array of bits 0/1 array): data to stego
        multiply (int): int for Q matrix to be multiplied
        loc (1D array of int): which location on block to stego on.
    */
    var row_block = Math.floor(channel_length / 8);
    var col_block = Math.floor(channel_width / 8);
    var num_block_bits = loc.length;
    if (num_block_bits * (row_block * col_block - 1) != setdata.length)
        throw "Image size does not match data size (Y channel)";
    var reference_dct_block = [];
    for (var i = 0; i < row_block; i++)
        for (var j = 0; j < col_block; j++) {
            var block_y = extract_block(channel_data, 8, i * 8, j * 8, channel_width);
            var dct_y = dct(block_y);
            if (i == 0 && j == 0) {
                reference_dct_block = dct_y;
                continue;
            }
            var dct_diff = dct_y.map(function (num, idx) { return num - reference_dct_block[idx]; });
            var qdiff = quantize_diff(multiply, loc, dct_diff, setdata.slice(num_block_bits * (i * col_block + j - 1), num_block_bits * (i * col_block + j)));
            dct_y = dct_y.map(function (num, idx) { return num + qdiff[idx]; });
            block_y = idct(dct_y);
            //replace original block with stego Y
            replace_block(channel_data, 8, i * 8, j * 8, channel_width, block_y);
        }
}
function write_dct_CbCr(channel_data, channel_width, channel_length, setdata, multiply, loc) {
    /* get a DCT manipulated Cb or Cr channel from original channel
    Input:
        channel_data (1D array of size (channel_width * channel_length)): original CbCr data
        channel_width (int): channel width
        channel_length (int): channel length
        setdata (1D array of bits 0/1 array): data to stego
        multiply (int): int for Q matrix to be multiplied
        loc (1D array of int): which location on block to stego on.
    */
    var row_block = Math.floor(channel_length / 16);
    var col_block = Math.floor(channel_width / 16);
    var num_block_bits = loc.length;
    if (num_block_bits * (row_block * col_block - 1) != setdata.length)
        throw "Image size does not match data size (CbCr channel)";
    var reference_dct_block = [];
    for (var i = 0; i < row_block; i++)
        for (var j = 0; j < col_block; j++) {
            var block_y = extract_block(channel_data, 16, i * 16, j * 16, channel_width);
            var block_y_8x8 = img_16x16_to_8x8(block_y);
            var dct_y = dct(block_y_8x8);
            if (i == 0 && j == 0) {
                reference_dct_block = dct_y;
                continue;
            }
            var dct_diff = dct_y.map(function (num, idx) { return num - reference_dct_block[idx]; });
            var qdiff = quantize_diff(multiply, loc, dct_diff, setdata.slice(num_block_bits * (i * col_block + j - 1), num_block_bits * (i * col_block + j)));
            dct_y = dct_y.map(function (num, idx) { return num + qdiff[idx]; });
            var block_y_stego = idct(dct_y);
            var stego_diff = block_y_stego.map(function (num, idx) { return num - block_y_8x8[idx]; });
            stego_diff = img_8x8_to_16x16(stego_diff);
            block_y = block_y.map(function (num, idx) { return num + stego_diff[idx]; });
            //replace original block with stego Y
            replace_block(channel_data, 16, i * 16, j * 16, channel_width, block_y);
        }
}
function write_lsb(imgData, setdata) {
    function unsetbit(k) {
        return (k % 2 == 1) ? k - 1 : k;
    }
    function setbit(k) {
        return (k % 2 == 1) ? k : k + 1;
    }
    var j = 0;
    for (var i = 0; i < imgData.data.length; i += 4) {
        imgData.data[i] = (setdata[j]) ? setbit(imgData.data[i]) : unsetbit(imgData.data[i]);
        imgData.data[i + 1] = (setdata[j + 1]) ? setbit(imgData.data[i + 1]) : unsetbit(imgData.data[i + 1]);
        imgData.data[i + 2] = (setdata[j + 2]) ? setbit(imgData.data[i + 2]) : unsetbit(imgData.data[i + 2]);
        imgData.data[i + 3] = 255;
        j += 3;
    }
}
function dct_data_capacity(channel_width, channel_length, loc, use_y, use_downsampling) {
    var y_data_len = (use_y) ? (Math.floor(channel_length / 8) * Math.floor(channel_width / 8) - 1) * loc.length : 0;
    var cblock = (use_downsampling) ? 16 : 8;
    var cbcr_data_len = (Math.floor(channel_length / cblock) * Math.floor(channel_width / cblock) - 1) * loc.length;
    return [y_data_len, cbcr_data_len];
}
function write_dct(imgData, channel_width, channel_length, setdata, multiply, loc, use_y, use_downsampling) {
    /* Write Stego to imgData using DCT
    Input:
        imgData: to manipulate
        channel_width (int): channel width
        channel_length (int): channel length
        setdata (1D array of bits 0/1 array): data to stego
        multiply (int): int for Q matrix to be multiplied
        loc (1D array of int): which location on block to stego on.
        use_y (bool): whether to manipulate y channel
        use_downsampling (bool): whether to downsample on CrCb
    */
    var data_capacity = dct_data_capacity(channel_width, channel_length, loc, use_y, use_downsampling);
    var y_data_len = data_capacity[0];
    var cbcr_data_len = data_capacity[1];
    var y = Array(), cb = Array(), cr = Array();
    for (var i = 0; i < imgData.data.length; i += 4) {
        var ycbcr = rgb2ycbcr(imgData.data[i], imgData.data[i + 1], imgData.data[i + 2]);
        y.push(ycbcr[0]);
        cb.push(ycbcr[1]);
        cr.push(ycbcr[2]);
    }
    if (use_y)
        write_dct_y(y, channel_width, channel_length, setdata.slice(0, y_data_len), multiply, loc);
    var cbcr_func = (use_downsampling) ? write_dct_CbCr : write_dct_y;
    cbcr_func(cb, channel_width, channel_length, setdata.slice(y_data_len, y_data_len + cbcr_data_len), multiply, loc);
    cbcr_func(cr, channel_width, channel_length, setdata.slice(y_data_len + cbcr_data_len, y_data_len + cbcr_data_len + cbcr_data_len), multiply, loc);
    var j = 0;
    for (var i = 0; i < imgData.data.length; i += 4) {
        var rgb = ycbcr2rgb(y[j], cb[j], cr[j]);
        imgData.data[i] = rgbclip(rgb[0]);
        imgData.data[i + 1] = rgbclip(rgb[1]);
        imgData.data[i + 2] = rgbclip(rgb[2]);
        j += 1;
    }
}
// main function
function writeMsgToCanvas_base(canvasid, msg, enc_key = "", use_dct = false, num_copy = 5, multiply = 30, loc = [1, 2, 8, 9, 10, 16, 17], use_y = true, use_downsampling = true) {
    /* Write message to canvas
    Input:
        canvasid: Canvas ID to read/write data
        msg (string): message to stego
        enc_key (string): encryption key for msg
        use_dct (bool): use true for DCT, false for LSB
        num_copy (int): how many copies of each bit to write into image. Larger value is more robust but reduces capacity.

        -- below only valid for use_dct=true --


        multiply (int): int for Q matrix to be multiplied
        loc (1D array of int): which location on block to stego on.
        use_y (bool): whether to manipulate y channel
        use_downsampling(bool): whether to downsample on CrCb
    Output:
        isSuccess: === true: success, otherwise, a string with error message.
    */
    try {
        var c = document.getElementById(canvasid);
        var ctx = c.getContext("2d");
        var imgData = ctx.getImageData(0, 0, c.width, c.height);
        var encode_len = Math.floor(imgData.data.length / 4) * 3;
        if (use_dct) {
            var cap = dct_data_capacity(c.width, c.height, loc, use_y, use_downsampling);
            encode_len = cap[0] + 2 * cap[1];
        }
        // prepare data
        var bit_stream = str_to_bits(msg, num_copy);
        bit_stream = prepare_write_data(bit_stream, enc_key, encode_len);
        if (use_dct) {
            write_dct(imgData, c.width, c.height, bit_stream, multiply, loc, use_y, use_downsampling);
        }
        else
            write_lsb(imgData, bit_stream);
        ctx === null || ctx === void 0 ? void 0 : ctx.putImageData(imgData, 0, 0);
        return true;
    }
    catch (err) {
        return err;
    }
}

function prepare_read_data(data_bits, enc_key) {
    var data_bits_len = data_bits.length;
    var result = Array(data_bits_len);
    var order = get_hashed_order(enc_key, data_bits_len);
    for (var i = 0; i < data_bits_len; i++)
        result[i] = data_bits[order[i]];
    return result;
}
function get_bits_lsb(imgData) {
    var result = Array();
    for (var i = 0; i < imgData.data.length; i += 4) {
        result.push((imgData.data[i] % 2 == 1) ? 1 : 0);
        result.push((imgData.data[i + 1] % 2 == 1) ? 1 : 0);
        result.push((imgData.data[i + 2] % 2 == 1) ? 1 : 0);
    }
    return result;
}
function get_dct_y(channel_data, channel_width, channel_length, multiply, loc) {
    /* get bits from Y channel
    Input:
        channel_data (1D array of size (channel_width * channel_length)): manipulated data
        channel_width (int): channel width
        channel_length (int): channel length
        multiply (int): int for Q matrix to be multiplied
        loc (1D array of int): which location on block to stego on.
    Output:
        bits_stream.
    */
    var row_block = Math.floor(channel_length / 8);
    var col_block = Math.floor(channel_width / 8);
    loc.length;
    var result = Array();
    var reference_dct_block = [];
    for (var i = 0; i < row_block; i++)
        for (var j = 0; j < col_block; j++) {
            var block_y = extract_block(channel_data, 8, i * 8, j * 8, channel_width);
            var dct_y = dct(block_y);
            if (i == 0 && j == 0) {
                reference_dct_block = dct_y;
                continue;
            }
            result.push(get_bit_from_quantized(multiply, loc, dct_y.map(function (num, idx) { return num - reference_dct_block[idx]; })));
        }
    return [].concat.apply([], result);
}
function get_dct_CbCr(channel_data, channel_width, channel_length, multiply, loc) {
    /* get bits from CbCr channel
    Input:
        channel_data (1D array of size (channel_width * channel_length)): manipulated data
        channel_width (int): channel width
        channel_length (int): channel length
        multiply (int): int for Q matrix to be multiplied
        loc (1D array of int): which location on block to stego on.
    Output:
        bits_stream.
    */
    var row_block = Math.floor(channel_length / 16);
    var col_block = Math.floor(channel_width / 16);
    loc.length;
    var result = Array();
    var reference_dct_block = [];
    for (var i = 0; i < row_block; i++)
        for (var j = 0; j < col_block; j++) {
            var block_y = extract_block(channel_data, 16, i * 16, j * 16, channel_width);
            block_y = img_16x16_to_8x8(block_y);
            var dct_y = dct(block_y);
            if (i == 0 && j == 0) {
                reference_dct_block = dct_y;
                continue;
            }
            result.push(get_bit_from_quantized(multiply, loc, dct_y.map(function (num, idx) { return num - reference_dct_block[idx]; })));
        }
    return [].concat.apply([], result);
}
function get_bits_dct(imgData, channel_width, channel_length, multiply, loc, use_y, use_downsampling) {
    /* Get Stego from imgData using DCT
    Input:
        imgData: manipulated data
        channel_width (int): channel width
        channel_length (int): channel length
        multiply (int): int for Q matrix to be multiplied
        loc (1D array of int): which location on block to stego on.
        use_y (bool): whether to manipulate y channel
        use_downsampling(bool): whether to downsample on CrCb
    Output:
        bit_stream
    */
    var y = Array(), cb = Array(), cr = Array(), result = Array();
    for (var i = 0; i < imgData.data.length; i += 4) {
        var ycbcr = rgb2ycbcr(imgData.data[i], imgData.data[i + 1], imgData.data[i + 2]);
        y.push(ycbcr[0]);
        cb.push(ycbcr[1]);
        cr.push(ycbcr[2]);
    }
    if (use_y)
        result.push(get_dct_y(y, channel_width, channel_length, multiply, loc));
    var cbcr_func = (use_downsampling) ? get_dct_CbCr : get_dct_y;
    result.push(cbcr_func(cb, channel_width, channel_length, multiply, loc));
    result.push(cbcr_func(cr, channel_width, channel_length, multiply, loc));
    return [].concat.apply([], result);
}
// main function
function readMsgFromCanvas_base(canvasid, enc_key = "", use_dct = false, num_copy = 5, multiply = 30, loc = [1, 2, 8, 9, 10, 16, 17], use_y = true, use_downsampling = true) {
    /* Read message from canvas
    Input:
        canvasid: Canvas ID to read/write data
        enc_key (string): encryption key for msg
        use_dct (bool): use true for DCT, false for LSB
        num_copy (int): how many copies of each bit to write into image. Larger value is more robust but reduces capacity.

        -- below only valid for use_dct=true --

        multiply (int): int for Q matrix to be multiplied
        loc (1D array of int): which location on block to stego on.
        use_y (bool): whether to manipulate y channel
        use_downsampling(bool): whether to downsample on CrCb
    Output:
        [status, message]: status is a boolean: true means success and false means failure.
            On success, message is the decrypted message and on failure, message is the error message.
    */
    var c, ctx, imgData;
    try {
        c = document.getElementById(canvasid);
        ctx = c === null || c === void 0 ? void 0 : c.getContext("2d");
        imgData = ctx.getImageData(0, 0, c.width, c.height);
    }
    catch (err) {
        return [false, err];
    }
    try {
        var bits_stream = (use_dct) ? get_bits_dct(imgData, c.width, c.height, multiply, loc, use_y, use_downsampling) : get_bits_lsb(imgData);
        bits_stream = prepare_read_data(bits_stream, enc_key);
        var msg = bits_to_str(bits_stream, num_copy);
        if (msg == null)
            return [false,
                "Message does not decrypt. Maybe due to (1) wrong password / enc method. (2) corrupted file"];
        return [true, msg];
    }
    catch (err) {
        return [false, "Message does not decrypt. Maybe due to (1) wrong password / enc method. (2) corrupted file"];
    }
}

//MAIN
// Parameters optimized according to tests.
function writeMsgToCanvas(canvasid, msg, pass, mode = 0) {
    mode = parseInt(mode.toString());
    var f = writeMsgToCanvas_base;
    switch (mode) {
        case 1: return f(canvasid, msg, pass, true, 23, 2, [2, 9, 16], true, false);
        case 2: return f(canvasid, msg, pass, true, 17, 3, [1, 8], true, false);
        case 3: return f(canvasid, msg, pass, true, 17, 5, [1, 8], true, false);
        case 4: return f(canvasid, msg, pass, true, 5, 5, [0], true, false);
        case 5: return f(canvasid, msg, pass, true, 5, 6, [0], true, true);
        case 0:
        default: return f(canvasid, msg, pass, false, 1);
    }
}
//Read msg from the image in canvasid.
//Return msg (null -> fail)
function readMsgFromCanvas(canvasid, pass, mode = 0) {
    mode = parseInt(mode.toString());
    var f = readMsgFromCanvas_base;
    switch (mode) {
        case 1: return f(canvasid, pass, true, 23, 2, [2, 9, 16], true, false)[1];
        case 2: return f(canvasid, pass, true, 17, 3, [1, 8], true, false)[1];
        case 3: return f(canvasid, pass, true, 17, 5, [1, 8], true, false)[1];
        case 4: return f(canvasid, pass, true, 5, 5, [0], true, false)[1];
        case 5: return f(canvasid, pass, true, 5, 6, [0], true, true)[1];
        case 0:
        default: return f(canvasid, pass, false, 1)[1];
    }
}
//load image from html5 input and execute callback() if successful
function loadIMGtoCanvas(inputid, canvasid, callback, maxsize) {
    maxsize = (maxsize === undefined) ? 0 : maxsize;
    var input = document.getElementById(inputid);
    if (input.files && input.files[0]) {
        var f = input === null || input === void 0 ? void 0 : input.files[0];
        var reader = new FileReader();
        reader.onload = function (e) {
            var _a;
            var data = (_a = e.target) === null || _a === void 0 ? void 0 : _a.result;
            var image = new Image();
            image.onload = function () {
                var w = image.width;
                var h = image.height;
                if (maxsize > 0) {
                    if (w > maxsize) {
                        h = h * (maxsize / w);
                        w = maxsize;
                    }
                    if (h > maxsize) {
                        w = w * (maxsize / h);
                        h = maxsize;
                    }
                    w = Math.floor(w);
                    h = Math.floor(h);
                }
                var canvas = document.createElement('canvas');
                canvas.id = canvasid;
                canvas.width = w;
                canvas.height = h;
                canvas.style.display = "none";
                var body = document.getElementsByTagName("body")[0];
                body.appendChild(canvas);
                var context = canvas.getContext('2d');
                context === null || context === void 0 ? void 0 : context.drawImage(image, 0, 0, image.width, image.height, 0, 0, w, h);
                callback();
                document.body.removeChild(canvas);
            };
            image.src = data;
        };
        reader.readAsDataURL(f);
    }
    else {
        alert('NO IMG FILE SELECTED');
        return 'ERROR PROCESSING IMAGE!';
    }
}

exports.loadIMGtoCanvas = loadIMGtoCanvas;
exports.readMsgFromCanvas = readMsgFromCanvas;
exports.writeMsgToCanvas = writeMsgToCanvas;