#toker

General purpose lexical analyzer

##Usage

	var toker = require('toker');

	var lex = new toker.LexicalAnalyzer('.p {color: #fff}', {
		keywords: ['@mixin', '@include', '@extend'],
		identifierStart: /[#@$_a-zA-Z]/,
		identifierPart: /([$_a-zA-Z-]|[0-9])/
	});

	console.log(lex.getTokens());
	
##Options

`identifierStart` and `identifierPart`

Default:

	identifierStart = /[$_a-zA-Z]/
	identifierPart = /([$_a-zA-Z]|[0-9])/;

Re to check is lexeme is an identifier

`keywords`

List of tokens to mark as keywords.

Default:

	'break', 'case', 'catch', 'continue', 'debugger', 'default', 'delete', 'do', 'else', 'finally', 'for', 'function', 'if', 'in', 'instanceof', 'new', 'return', 'switch', 'this', 'throw', 'try', 'typeof', 'var', 'void', 'while', 'with', 'class', 'const', 'enum', 'export', 'extends', 'import', 'super'
	
`operators`

List of operators.

Default:

        '{', '}', '(', ')', '[', ']', '.', ';', ',', '?', '', '===', '==', '=', '!==', '!=', '!', '<<=', '<<', '<=', '<', '>>>=', '>>>', '>>=', '>>', '>=', '>', '+=', '++', '+', '-=', '--', '-', '*=', '*', '/=', '/', '%=', '%', '&&', '&=', '&', '||', '|=', '|', '^=', '^', '~'
        
`punctuators`

Default:

	'.', '(', ')', ';', ',', '{', '}', '[', ']', ':', '?', '~'