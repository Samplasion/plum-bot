// Generated automatically by nearley, version undefined
// http://github.com/Hardmath123/nearley
(function () {
function id(x) { return x[0]; }
var grammar = {
    Lexer: undefined,
    ParserRules: [
    {"name": "MAIN", "symbols": ["SENTENCE"]},
    {"name": "SENTENCE$string$1", "symbols": [{"literal":"i"}, {"literal":"n"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "SENTENCE", "symbols": ["any", {"literal":" ","pos":12}, "SENTENCE$string$1", "_", "DURATION", "_", "any"]},
    {"name": "DURATION$ebnf$1$subexpression$1", "symbols": ["int", "_", "NAME"]},
    {"name": "DURATION$ebnf$1", "symbols": ["DURATION$ebnf$1$subexpression$1"]},
    {"name": "DURATION$ebnf$1$subexpression$2", "symbols": ["int", "_", "NAME"]},
    {"name": "DURATION$ebnf$1", "symbols": ["DURATION$ebnf$1$subexpression$2", "DURATION$ebnf$1"], "postprocess": function arrconcat(d) {return [d[0]].concat(d[1]);}},
    {"name": "DURATION", "symbols": ["DURATION$ebnf$1"]},
    {"name": "NAME$string$1", "symbols": [{"literal":"d"}, {"literal":"a"}, {"literal":"y"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "NAME$ebnf$1", "symbols": [{"literal":"s","pos":43}], "postprocess": id},
    {"name": "NAME$ebnf$1", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "NAME", "symbols": ["NAME$string$1", "NAME$ebnf$1"]},
    {"name": "NAME$string$2", "symbols": [{"literal":"h"}, {"literal":"o"}, {"literal":"u"}, {"literal":"r"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "NAME$ebnf$2", "symbols": [{"literal":"s","pos":50}], "postprocess": id},
    {"name": "NAME$ebnf$2", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "NAME", "symbols": ["NAME$string$2", "NAME$ebnf$2"]},
    {"name": "NAME$string$3", "symbols": [{"literal":"m"}, {"literal":"i"}, {"literal":"n"}, {"literal":"u"}, {"literal":"t"}, {"literal":"e"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "NAME$ebnf$3", "symbols": [{"literal":"s","pos":57}], "postprocess": id},
    {"name": "NAME$ebnf$3", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "NAME", "symbols": ["NAME$string$3", "NAME$ebnf$3"]},
    {"name": "NAME$string$4", "symbols": [{"literal":"s"}, {"literal":"e"}, {"literal":"c"}, {"literal":"o"}, {"literal":"n"}, {"literal":"d"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "NAME$ebnf$4", "symbols": [{"literal":"s","pos":64}], "postprocess": id},
    {"name": "NAME$ebnf$4", "symbols": [], "postprocess": function(d) {return null;}},
    {"name": "NAME", "symbols": ["NAME$string$4", "NAME$ebnf$4"]},
    {"name": "NAME$string$5", "symbols": [{"literal":"m"}, {"literal":"i"}, {"literal":"l"}, {"literal":"l"}, {"literal":"i"}, {"literal":"s"}], "postprocess": function joiner(d) {return d.join('');}},
    {"name": "NAME", "symbols": ["NAME$string$5"]},
    {"name": "any$ebnf$1", "symbols": []},
    {"name": "any$ebnf$1", "symbols": [/[A-Za-z0-9.,:;_\- \?\=\!\"\Â£\$\%\&\/\(\)]/, "any$ebnf$1"], "postprocess": function arrconcat(d) {return [d[0]].concat(d[1]);}},
    {"name": "any", "symbols": ["any$ebnf$1"], "postprocess": function(d) {return d[0].join("")}},
    {"name": "int$ebnf$1", "symbols": [/[0-9]/]},
    {"name": "int$ebnf$1", "symbols": [/[0-9]/, "int$ebnf$1"], "postprocess": function arrconcat(d) {return [d[0]].concat(d[1]);}},
    {"name": "int", "symbols": ["int$ebnf$1"], "postprocess": function(d) {return parseInt(d[0].join(""))}},
    {"name": "_$ebnf$1", "symbols": []},
    {"name": "_$ebnf$1", "symbols": [/[\s]/, "_$ebnf$1"], "postprocess": function arrconcat(d) {return [d[0]].concat(d[1]);}},
    {"name": "_", "symbols": ["_$ebnf$1"], "postprocess": function(d) {return " " }}
]
  , ParserStart: "MAIN"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();