(function (root, factory) {
    'use strict';

    if (typeof define === 'function' && define.amd) {
        define(['exports'], factory);
    } else if (typeof exports !== 'undefined') {
        factory(exports);
    } else {
        factory((root.toker = {}));
    }
}(this, function (exports) {
    'use strict';

    var LexicalAnalyzer = exports.LexicalAnalyzer = function(source, options) {
        this.source = source;
        this.length = source.length;
        this.options = options || {};
        this.line = 1;
        this.column = 0;
        this.pos = 0;
    };

    LexicalAnalyzer.prototype.token = function() {
        return {
            source: this.options.source,
            loc: {
                start: this.loc()
            }
        };
    };

    LexicalAnalyzer.prototype.consume = function() {
        ++this.column;
        return this.source.charAt(this.pos++);
    };

    LexicalAnalyzer.prototype.peek = function(at) {
        return this.source.charAt(this.pos + (at || 0));
    };

    LexicalAnalyzer.prototype.skipWhiteSpacesAndComments = function() {
        for(; ; this.consume()) {
            if (this.isLineTerminator(this.peek())) {
                ++this.line;
                this.column = 0;

                continue;
            } else if (this.isWhiteSpace(this.peek())) {
                continue;
            } else if (this.peek() === '/' && this.peek(1) === '/') {
                while(!this.isLineTerminator(this.peek())) {
                    this.consume();
                }

                ++this.line;
                this.column = 0;

                this.consume();
            } else if (this.peek() === '/' && this.peek(1) === '*') {
                this.consume();
                this.consume();

                do {
                    if (this.isLineTerminator(this.peek())) {
                        ++this.line;
                        this.column = 0;
                    }

                    this.consume();
                } while (this.peek() !== '*' && this.peek(1) !== '/');

                this.consume();
                this.consume();
            } else {
                break;
            }
        }
    };

    LexicalAnalyzer.prototype.keywords = [
        'break', 'case', 'catch', 'continue', 'debugger', 'default', 'delete', 'do', 'else', 'finally', 'for', 
        'function', 'if', 'in', 'instanceof', 'new', 'return', 'switch', 'this', 'throw', 'try', 'typeof', 'var', 
        'void', 'while', 'with', 'class', 'const', 'enum', 'export', 'extends', 'import', 'super'
    ];
    LexicalAnalyzer.prototype.isKeyword = function(w) {
        return this.keywords.indexOf(w) !== -1;
    };

    LexicalAnalyzer.prototype.operators = [
        '{', '}', '(', ')', '[', ']', '.', ';', ',', '?', '', '===', '==', '=', '!==', '!=', '!', '<<=',
        '<<', '<=', '<', '>>>=', '>>>', '>>=', '>>', '>=', '>', '+=', '++', '+', '-=', '--', '-', '*=',
        '*', '/=', '/', '%=', '%', '&&', '&=', '&', '||', '|=', '|', '^=', '^', '~'
    ];
    LexicalAnalyzer.prototype.isOperator = function(w) {
        return this.operators.indexOf(w) == -1;
    };

    LexicalAnalyzer.prototype.punctuators = ['.', '(', ')', ';', ',', '{', '}', '[', ']', ':', '?', '~'];
    LexicalAnalyzer.prototype.isPunctuator = function(w) {
        return this.punctuators.indexOf(w) == -1;
    };

    LexicalAnalyzer.prototype.isWhiteSpace = function(ch) {
        return /\s/.test(ch);
    };

    LexicalAnalyzer.prototype.isLineTerminator = function(ch) {
        return /\r\n?|\n/.test(ch);
    };

    LexicalAnalyzer.prototype.isDecimalDigit = function(ch) {
        return /\d/.test(ch);
    };

    LexicalAnalyzer.prototype.isIdentifierStart = function(ch) {
        return /[$_a-zA-Z]/.test(ch);
    };

    LexicalAnalyzer.prototype.isIdentifierPart = function(ch) {
        return /([$_a-zA-Z]|[0-9])/.test(ch);
    };

    LexicalAnalyzer.prototype.loc = function() {
        return {
            line: this.line,
            column: this.column
        };
    };

    LexicalAnalyzer.prototype.getNextToken = function() {
        this.skipWhiteSpacesAndComments();

        var token = this.token();

        if (this.pos >= this.length) {
            token.lexeme = token.tag = 'eof';
            return token;
        }

        if (this.isDecimalDigit(this.peek())) {
            var v = 0;
            
            do {
                v = 10 * v + parseInt(this.peek(), 10);
                this.consume();
            } while (this.isDecimalDigit(this.peek()));

            if (this.peek() !== '.') {
                token.lexeme = v;
                token.tag = 'decimalLiteral';
            }
        }

        if (this.isIdentifierStart(this.peek()) && !token.tag) {
            var identifier = [];

            do {
                identifier.push(this.peek());
                this.consume();
            } while (this.isIdentifierPart(this.peek()));

            identifier = identifier.join('');

            if (identifier === 'true' || identifier === 'false') {
                token.lexeme = identifier;
                token.tag = 'booleanLiteral';
            } else if (this.isKeyword(identifier)) {
                token.lexeme = identifier;
                token.tag = 'keyword';
            } else {
                token.lexeme = identifier;
                token.tag = 'identifier';
            }
        }

        if ((this.peek() === '\'' || this.peek() === '"') && !token.tag) {
            var quote = this.peek(),
                string = [];

            this.consume();

            if (this.peek() !== quote) {
                do {
                    if (this.peek() === '\\') {
                        this.consume();

                        switch(this.peek()) {
                            case 'n':
                                string.push('\n');
                                this.consume();
                                break;
                            case 'r':
                                string.push('\r');
                                this.consume();
                                break;
                            case 't':
                                string.push('\t');
                                this.consume();
                                break;
                            case 'b':
                                string.push('\b');
                                this.consume();
                                break;
                            case 'f':
                                string.push('\f');
                                this.consume();
                                break;
                            default:
                                string.push(this.peek());
                                this.consume();
                        }
                    } else {
                        string.push(this.peek());
                        this.consume();
                    }
                } while (this.peek() !== quote);

                this.consume();
            } else {
                this.consume();
            }

            string = string.join('');

            token.lexeme = string;
            token.tag = 'stringLiteral';
        }

        if (this.peek() === '/' && this.peek(1) !== '/' && !token.tag) {
            var regularExpression = [];

            do {
                regularExpression.push(this.peek());
                this.consume();
            } while (this.peek() !== '/');

            regularExpression.push(this.peek());
            this.consume();

            regularExpression = regularExpression.join('');

            token.lexeme = regularExpression;
            token.tag = 'regularExpressionLiteral';
        }

        if (this.isOperator(this.peek()) && !this.isPunctuator(this.peek()) && !token.tag) {
            var operator = [];

            do {
                operator.push(this.peek());
                this.consume();
            } while (this.isOperator(this.peek()) && !this.isPunctuator(this.peek()));

            operator = operator.join('');

            token.lexeme = token.tag = operator;
        }

        if (!token.tag) {
            token.lexeme = token.tag = this.peek();
            this.consume();
        }

        token.loc.end = this.loc();
        return token;
    };

}));