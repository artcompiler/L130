"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.compiler = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; /* Copyright (c) 2016, Art Compiler LLC */


var _assert = require("./assert.js");

var _mjSingle = require("mathjax-node/lib/mj-single.js");

var mjAPI = _interopRequireWildcard(_mjSingle);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

(0, _assert.reserveCodeRange)(1000, 1999, "compile");
_assert.messages[1001] = "Node ID %1 not found in pool.";
_assert.messages[1002] = "Invalid tag in node with Node ID %1.";
_assert.messages[1003] = "No async callback provided.";
_assert.messages[1004] = "No visitor method defined for '%1'.";

var transform = function () {
  var table = [{
    // v0
    "PROG": program,
    "EXPRS": exprs,
    "STR": str,
    "NUM": num,
    "IDENT": ident,
    "BOOL": bool,
    "LIST": list,
    "RECORD": record,
    "BINDING": binding,
    "ADD": add,
    "MUL": mul,
    "STYLE": style
  }, {
    // v1
    "PROG": program,
    "EXPRS": exprs,
    "STR": str,
    "NUM": num,
    "IDENT": ident,
    "BOOL": bool,
    "LIST": list,
    "RECORD": record,
    "BINDING": binding,
    "ADD": add,
    "MUL": mul,
    "VAL": val,
    "KEY": key,
    "LEN": len,
    "STYLE": styleV1,
    "CONCAT": concat,
    "ARG": arg,
    "IN": inData,
    "LAMBDA": lambda,
    "PAREN": paren,
    "APPLY": apply,
    "MAP": map
  }];
  var nodePool = void 0;
  var version = void 0;
  function getVersion(pool) {
    return pool.version ? +pool.version : 0;
  }
  function transform(code, data, resume) {
    nodePool = code;
    version = getVersion(code);
    return visit(code.root, data, resume);
  }
  function error(str, nid) {
    return {
      str: str,
      nid: nid
    };
  }
  function visit(nid, options, resume) {
    (0, _assert.assert)(typeof resume === "function", (0, _assert.message)(1003));
    // Get the node from the pool of nodes.
    var node = void 0;
    if ((typeof nid === "undefined" ? "undefined" : _typeof(nid)) === "object") {
      node = nid;
    } else {
      node = nodePool[nid];
    }
    (0, _assert.assert)(node, (0, _assert.message)(1001, [nid]));
    (0, _assert.assert)(node.tag, (0, _assert.message)(1001, [nid]));
    (0, _assert.assert)(typeof table[version][node.tag] === "function", (0, _assert.message)(1004, [JSON.stringify(node.tag)]));
    return table[version][node.tag](node, options, resume);
  }
  // BEGIN VISITOR METHODS
  function str(node, options, resume) {
    var val = node.elts[0];
    resume([], val);
  }
  function num(node, options, resume) {
    var val = node.elts[0];
    resume([], +val);
  }
  function ident(node, options, resume) {
    var val = node.elts[0];
    resume([], val);
  }
  function bool(node, options, resume) {
    var val = node.elts[0];
    resume([], !!val);
  }
  function concat(node, options, resume) {
    visit(node.elts[0], options, function (err1, val1) {
      var str = "";
      if (val1 instanceof Array) {
        val1.forEach(function (v) {
          str += v;
        });
      } else {
        str = val1.toString();
      }
      resume(err1, str);
    });
  }
  function paren(node, options, resume) {
    visit(node.elts[0], options, function (err1, val1) {
      resume(err1, val1);
    });
  }
  function list(node, options, resume) {
    if (node.elts && node.elts.length > 1) {
      visit(node.elts[0], options, function (err1, val1) {
        node = {
          tag: "LIST",
          elts: node.elts.slice(1)
        };
        list(node, options, function (err2, val2) {
          var val = [].concat(val2);
          val.unshift(val1);
          resume([].concat(err1).concat(err2), val);
        });
      });
    } else if (node.elts && node.elts.length > 0) {
      visit(node.elts[0], options, function (err1, val1) {
        var val = [val1];
        resume([].concat(err1), val);
      });
    } else {
      resume([], []);
    }
  }
  function inData(node, options, resume) {
    var data = options.data ? options.data : [];
    resume([], data);
  }
  function arg(node, options, resume) {
    visit(node.elts[0], options, function (err1, val1) {
      var key = val1;
      if (false) {
        err1 = err1.concat(error("Argument must be a number.", node.elts[0]));
      }
      resume([].concat(err1), options.args[key]);
    });
  }
  function args(node, options, resume) {
    resume([], options.args);
  }
  function lambda(node, options, resume) {
    // Return a function value.
    visit(node.elts[0], options, function (err1, val1) {
      visit(node.elts[1], options, function (err2, val2) {
        resume([].concat(err1).concat(err2), val2);
      });
    });
  }
  function apply(node, options, resume) {
    // Apply a function to arguments.
    visit(node.elts[1], options, function (err1, val1) {
      // args
      options.args = [val1];
      visit(node.elts[0], options, function (err0, val0) {
        // fn
        resume([].concat(err1).concat(err0), val0);
      });
    });
  }
  function map(node, options, resume) {
    // Apply a function to arguments.
    visit(node.elts[1], options, function (err1, val1) {
      // args
      var errs = [];
      var vals = [];
      val1.forEach(function (val) {
        options.args = [val];
        visit(node.elts[0], options, function (err0, val0) {
          vals.push(val0);
          errs = errs.concat(err0);
        });
      });
      resume(errs, vals);
    });
  }
  function binding(node, options, resume) {
    visit(node.elts[0], options, function (err1, val1) {
      visit(node.elts[1], options, function (err2, val2) {
        resume([].concat(err1).concat(err2), { key: val1, val: val2 });
      });
    });
  }
  function record(node, options, resume) {
    if (node.elts && node.elts.length > 1) {
      visit(node.elts[0], options, function (err1, val1) {
        node = {
          tag: "RECORD",
          elts: node.elts.slice(1)
        };
        record(node, options, function (err2, val2) {
          val2[val1.key] = val1.val;
          resume([].concat(err1).concat(err2), val2);
        });
      });
    } else if (node.elts && node.elts.length > 0) {
      visit(node.elts[0], options, function (err1, val1) {
        var val = {};
        val[val1.key] = val1.val;
        resume([].concat(err1), val);
      });
    } else {
      resume([], {});
    }
  }
  function exprs(node, options, resume) {
    if (node.elts && node.elts.length > 1) {
      visit(node.elts[0], options, function (err1, val1) {
        node = {
          tag: "EXPRS",
          elts: node.elts.slice(1)
        };
        exprs(node, options, function (err2, val2) {
          var val = [].concat(val2);
          val.unshift(val1);
          resume([].concat(err1).concat(err2), val);
        });
      });
    } else if (node.elts && node.elts.length > 0) {
      visit(node.elts[0], options, function (err1, val1) {
        var val = [val1];
        resume([].concat(err1), val);
      });
    } else {
      resume([], []);
    }
  }
  function program(node, options, resume) {
    if (!options) {
      options = {};
    }
    if (!options.data) {
      options.data = {};
    }
    visit(node.elts[0], options, function (err, val) {
      var data = options.data;
      resume(err, data);
    });
  }
  function key(node, options, resume) {
    visit(node.elts[0], options, function (err1, val1) {
      var key = val1;
      if (false) {
        err1 = err1.concat(error("Argument must be a number.", node.elts[0]));
      }
      visit(node.elts[1], options, function (err2, val2) {
        var obj = val2;
        if (false) {
          err2 = err2.concat(error("Argument must be a number.", node.elts[1]));
        }
        resume([].concat(err1).concat(err2), Object.keys(obj)[key]);
      });
    });
  }
  function val(node, options, resume) {
    visit(node.elts[0], options, function (err1, val1) {
      var key = val1;
      if (false) {
        err1 = err1.concat(error("Argument must be a number.", node.elts[0]));
      }
      visit(node.elts[1], options, function (err2, val2) {
        var obj = val2;
        if (false) {
          err2 = err2.concat(error("Argument must be a number.", node.elts[1]));
        }
        resume([].concat(err1).concat(err2), obj[key]);
      });
    });
  }
  function len(node, options, resume) {
    visit(node.elts[0], options, function (err1, val1) {
      var obj = val1;
      if (false) {
        err1 = err1.concat(error("Argument must be a number.", node.elts[0]));
      }
      resume([].concat(err1), obj.length);
    });
  }
  function add(node, options, resume) {
    visit(node.elts[0], options, function (err1, val1) {
      val1 = +val1;
      if (isNaN(val1)) {
        err1 = err1.concat(error("Argument must be a number.", node.elts[0]));
      }
      visit(node.elts[1], options, function (err2, val2) {
        val2 = +val2;
        if (isNaN(val2)) {
          err2 = err2.concat(error("Argument must be a number.", node.elts[1]));
        }
        resume([].concat(err1).concat(err2), val1 + val2);
      });
    });
  }
  function mul(node, options, resume) {
    visit(node.elts[0], options, function (err1, val1) {
      val1 = +val1;
      if (isNaN(val1)) {
        err1 = err1.concat(error("Argument must be a number.", node.elts[0]));
      }
      visit(node.elts[1], options, function (err2, val2) {
        val2 = +val2;
        if (isNaN(val2)) {
          err2 = err2.concat(error("Argument must be a number.", node.elts[1]));
        }
        resume([].concat(err1).concat(err2), val1 * val2);
      });
    });
  }
  function style(node, options, resume) {
    visit(node.elts[0], options, function (err1, val1) {
      visit(node.elts[1], options, function (err2, val2) {
        resume([].concat(err1).concat(err2), {
          value: val1,
          style: val2
        });
      });
    });
  }
  function styleV1(node, options, resume) {
    visit(node.elts[0], options, function (err1, val1) {
      visit(node.elts[1], options, function (err2, val2) {
        resume([].concat(err1).concat(err2), {
          style: val1,
          value: val2
        });
      });
    });
  }
  return transform;
}();
mjAPI.config({
  MathJax: {
    SVG: {
      font: "Tex"
    }
  }
});
mjAPI.start();
function escapeXML(str) {
  return String(str).replace(/&(?!\w+;)/g, "&amp;").replace(/\n/g, " ").replace(/\\/g, "\\\\").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function tex2SVG(str, resume) {
  mjAPI.typeset({
    math: str,
    format: "inline-TeX",
    svg: true,
    ex: 6,
    width: 60,
    linebreaks: true
  }, function (data) {
    if (!data.errors) {
      resume(null, data.svg);
    } else {
      resume(null, "");
    }
  });
}
var render = function () {
  function render(val, resume) {
    // Do some rendering here.
    mapListToObject(Object.keys(val), function (key, resume) {
      var v = val[key];
      if (v.index) {
        fn(v.index, function (data) {
          resume(data);
        });
      } else {
        resume({});
      }
    }, resume);
    function fn(obj, resume) {
      if ((typeof obj === "undefined" ? "undefined" : _typeof(obj)) !== "object") {
        resume(1);
      } else {
        var svgObj = {};
        mapListToObject(Object.keys(obj), function (key, resume) {
          var val = obj[key];
          tex2SVG(key, function (err, svgKey) {
            fn(val, function (data) {
              svgObj[escapeXML(svgKey)] = data;
              resume(svgObj);
            });
          });
        }, resume);
      }
    }
    function mapList(lst, fn, resume) {
      if (lst && lst.length > 1) {
        fn(lst[0], function (val1) {
          mapList(lst.slice(1), fn, function (val2) {
            var val = [].concat(val2);
            if (val1 !== null) {
              val.unshift(val1);
            }
            resume(val);
          });
        });
      } else if (lst && lst.length > 0) {
        fn(lst[0], function (val1) {
          var val = [];
          if (val1 !== null) {
            val.push(val1);
          }
          resume(val);
        });
      } else {
        resume([]);
      }
    }
    function merge(o1, o2) {
      console.log("merge() o1=" + JSON.stringify(o1, null, 2));
      console.log("merge() o2=" + JSON.stringify(o2, null, 2));
      var obj = {};
      if (o1 && o2 && (typeof o1 === "undefined" ? "undefined" : _typeof(o1)) === "object" && (typeof o2 === "undefined" ? "undefined" : _typeof(o2)) === "object") {
        Object.keys(o1).forEach(function (k) {
          // Merge properties in o1.
          if (_typeof(o1[k]) === "object" && _typeof(o2[k]) === "object") {
            obj[k] = merge(o1[k], o2[k]);
          } else {
            obj[k] = o1[k];
          }
        });
        Object.keys(o2).forEach(function (k) {
          // Now add the o2 only properties.
          if (!obj[k]) {
            obj[k] = o2[k];
          }
        });
      } else if (o1 && (typeof o1 === "undefined" ? "undefined" : _typeof(o1)) === "object") {
        Object.keys(o2).forEach(function (k) {
          obj[k] = o1[k];
        });
      } else if (o2 && (typeof o2 === "undefined" ? "undefined" : _typeof(o2)) === "object") {
        Object.keys(o2).forEach(function (k) {
          obj[k] = o2[k];
        });
      }
      console.log("merge() obj=" + JSON.stringify(obj, null, 2));
      return obj;
    }
    function mapListToObject(lst, fn, resume) {
      if (lst && lst.length > 1) {
        fn(lst[0], function (val1) {
          mapListToObject(lst.slice(1), fn, function (val2) {
            if (val1 !== null) {
              val2 = merge(val1, val2);
            }
            resume(val2);
          });
        });
      } else if (lst && lst.length > 0) {
        fn(lst[0], function (val1) {
          resume(val1);
        });
      } else {
        resume({});
      }
    }
  }
  return render;
}();
var compiler = exports.compiler = function () {
  exports.version = "v1.0.0";
  exports.compile = function compile(code, data, resume) {
    // Compiler takes an AST in the form of a node pool and transforms it into
    // an object to be rendered on the client by the viewer for this language.
    try {
      var options = {
        data: data
      };
      transform(code, options, function (err, val) {
        if (err.length) {
          resume(err, val);
        } else {
          render(val, function (val) {
            console.log("compile() val=" + JSON.stringify(val, null, 2));
            tex2SVG("\\text{root}", function (e, svg) {
              var root = {};
              root[escapeXML(svg)] = val;
              resume(err, root);
            });
          });
        }
      });
    } catch (x) {
      console.log("ERROR with code");
      console.log(x.stack);
      resume(["Compiler error"], {
        score: 0
      });
    }
  };
}();
var data = {
  "&lt;svg xmlns:xlink=&quot;http://www.w3.org/1999/xlink&quot; width=&quot;4.722ex&quot; height=&quot;2.009ex&quot; style=&quot;vertical-align: -0.338ex;&quot; viewBox=&quot;0 -719.6 2033 865.1&quot; role=&quot;img&quot; focusable=&quot;false&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;&gt; &lt;defs&gt; &lt;path stroke-width=&quot;1&quot; id=&quot;E1-MJMAIN-72&quot; d=&quot;M36 46H50Q89 46 97 60V68Q97 77 97 91T98 122T98 161T98 203Q98 234 98 269T98 328L97 351Q94 370 83 376T38 385H20V408Q20 431 22 431L32 432Q42 433 60 434T96 436Q112 437 131 438T160 441T171 442H174V373Q213 441 271 441H277Q322 441 343 419T364 373Q364 352 351 337T313 322Q288 322 276 338T263 372Q263 381 265 388T270 400T273 405Q271 407 250 401Q234 393 226 386Q179 341 179 207V154Q179 141 179 127T179 101T180 81T180 66V61Q181 59 183 57T188 54T193 51T200 49T207 48T216 47T225 47T235 46T245 46H276V0H267Q249 3 140 3Q37 3 28 0H20V46H36Z&quot;&gt;&lt;/path&gt; &lt;path stroke-width=&quot;1&quot; id=&quot;E1-MJMAIN-6F&quot; d=&quot;M28 214Q28 309 93 378T250 448Q340 448 405 380T471 215Q471 120 407 55T250 -10Q153 -10 91 57T28 214ZM250 30Q372 30 372 193V225V250Q372 272 371 288T364 326T348 362T317 390T268 410Q263 411 252 411Q222 411 195 399Q152 377 139 338T126 246V226Q126 130 145 91Q177 30 250 30Z&quot;&gt;&lt;/path&gt; &lt;path stroke-width=&quot;1&quot; id=&quot;E1-MJMAIN-74&quot; d=&quot;M27 422Q80 426 109 478T141 600V615H181V431H316V385H181V241Q182 116 182 100T189 68Q203 29 238 29Q282 29 292 100Q293 108 293 146V181H333V146V134Q333 57 291 17Q264 -10 221 -10Q187 -10 162 2T124 33T105 68T98 100Q97 107 97 248V385H18V422H27Z&quot;&gt;&lt;/path&gt; &lt;/defs&gt; &lt;g stroke=&quot;currentColor&quot; fill=&quot;currentColor&quot; stroke-width=&quot;0&quot; transform=&quot;matrix(1 0 0 -1 0 0)&quot;&gt;  &lt;use xlink:href=&quot;#E1-MJMAIN-72&quot;&gt;&lt;/use&gt;  &lt;use xlink:href=&quot;#E1-MJMAIN-6F&quot; x=&quot;392&quot; y=&quot;0&quot;&gt;&lt;/use&gt;  &lt;use xlink:href=&quot;#E1-MJMAIN-6F&quot; x=&quot;893&quot; y=&quot;0&quot;&gt;&lt;/use&gt;  &lt;use xlink:href=&quot;#E1-MJMAIN-74&quot; x=&quot;1393&quot; y=&quot;0&quot;&gt;&lt;/use&gt; &lt;/g&gt; &lt;/svg&gt;": {
    "&lt;svg xmlns:xlink=&quot;http://www.w3.org/1999/xlink&quot; width=&quot;1.808ex&quot; height=&quot;2.176ex&quot; style=&quot;vertical-align: -0.505ex;&quot; viewBox=&quot;0 -719.6 778.5 936.9&quot; role=&quot;img&quot; focusable=&quot;false&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;&gt; &lt;defs&gt; &lt;path stroke-width=&quot;1&quot; id=&quot;E1-MJMAIN-2B&quot; d=&quot;M56 237T56 250T70 270H369V420L370 570Q380 583 389 583Q402 583 409 568V270H707Q722 262 722 250T707 230H409V-68Q401 -82 391 -82H389H387Q375 -82 369 -68V230H70Q56 237 56 250Z&quot;&gt;&lt;/path&gt; &lt;/defs&gt; &lt;g stroke=&quot;currentColor&quot; fill=&quot;currentColor&quot; stroke-width=&quot;0&quot; transform=&quot;matrix(1 0 0 -1 0 0)&quot;&gt;  &lt;use xlink:href=&quot;#E1-MJMAIN-2B&quot; x=&quot;0&quot; y=&quot;0&quot;&gt;&lt;/use&gt; &lt;/g&gt; &lt;/svg&gt;": {
      "&lt;svg xmlns:xlink=&quot;http://www.w3.org/1999/xlink&quot; width=&quot;6.348ex&quot; height=&quot;2.343ex&quot; style=&quot;vertical-align: -0.505ex;&quot; viewBox=&quot;0 -791.3 2732.9 1008.6&quot; role=&quot;img&quot; focusable=&quot;false&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;&gt; &lt;defs&gt; &lt;path stroke-width=&quot;1&quot; id=&quot;E1-MJMATHI-41&quot; d=&quot;M208 74Q208 50 254 46Q272 46 272 35Q272 34 270 22Q267 8 264 4T251 0Q249 0 239 0T205 1T141 2Q70 2 50 0H42Q35 7 35 11Q37 38 48 46H62Q132 49 164 96Q170 102 345 401T523 704Q530 716 547 716H555H572Q578 707 578 706L606 383Q634 60 636 57Q641 46 701 46Q726 46 726 36Q726 34 723 22Q720 7 718 4T704 0Q701 0 690 0T651 1T578 2Q484 2 455 0H443Q437 6 437 9T439 27Q443 40 445 43L449 46H469Q523 49 533 63L521 213H283L249 155Q208 86 208 74ZM516 260Q516 271 504 416T490 562L463 519Q447 492 400 412L310 260L413 259Q516 259 516 260Z&quot;&gt;&lt;/path&gt; &lt;path stroke-width=&quot;1&quot; id=&quot;E1-MJMAIN-2B&quot; d=&quot;M56 237T56 250T70 270H369V420L370 570Q380 583 389 583Q402 583 409 568V270H707Q722 262 722 250T707 230H409V-68Q401 -82 391 -82H389H387Q375 -82 369 -68V230H70Q56 237 56 250Z&quot;&gt;&lt;/path&gt; &lt;path stroke-width=&quot;1&quot; id=&quot;E1-MJMATHI-42&quot; d=&quot;M231 637Q204 637 199 638T194 649Q194 676 205 682Q206 683 335 683Q594 683 608 681Q671 671 713 636T756 544Q756 480 698 429T565 360L555 357Q619 348 660 311T702 219Q702 146 630 78T453 1Q446 0 242 0Q42 0 39 2Q35 5 35 10Q35 17 37 24Q42 43 47 45Q51 46 62 46H68Q95 46 128 49Q142 52 147 61Q150 65 219 339T288 628Q288 635 231 637ZM649 544Q649 574 634 600T585 634Q578 636 493 637Q473 637 451 637T416 636H403Q388 635 384 626Q382 622 352 506Q352 503 351 500L320 374H401Q482 374 494 376Q554 386 601 434T649 544ZM595 229Q595 273 572 302T512 336Q506 337 429 337Q311 337 310 336Q310 334 293 263T258 122L240 52Q240 48 252 48T333 46Q422 46 429 47Q491 54 543 105T595 229Z&quot;&gt;&lt;/path&gt; &lt;/defs&gt; &lt;g stroke=&quot;currentColor&quot; fill=&quot;currentColor&quot; stroke-width=&quot;0&quot; transform=&quot;matrix(1 0 0 -1 0 0)&quot;&gt;  &lt;use xlink:href=&quot;#E1-MJMATHI-41&quot; x=&quot;0&quot; y=&quot;0&quot;&gt;&lt;/use&gt;  &lt;use xlink:href=&quot;#E1-MJMAIN-2B&quot; x=&quot;972&quot; y=&quot;0&quot;&gt;&lt;/use&gt;  &lt;use xlink:href=&quot;#E1-MJMATHI-42&quot; x=&quot;1973&quot; y=&quot;0&quot;&gt;&lt;/use&gt; &lt;/g&gt; &lt;/svg&gt;": 1,
      "&lt;svg xmlns:xlink=&quot;http://www.w3.org/1999/xlink&quot; width=&quot;1.808ex&quot; height=&quot;2.176ex&quot; style=&quot;vertical-align: -0.505ex;&quot; viewBox=&quot;0 -719.6 778.5 936.9&quot; role=&quot;img&quot; focusable=&quot;false&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;&gt; &lt;defs&gt; &lt;path stroke-width=&quot;1&quot; id=&quot;E1-MJMAIN-2B&quot; d=&quot;M56 237T56 250T70 270H369V420L370 570Q380 583 389 583Q402 583 409 568V270H707Q722 262 722 250T707 230H409V-68Q401 -82 391 -82H389H387Q375 -82 369 -68V230H70Q56 237 56 250Z&quot;&gt;&lt;/path&gt; &lt;/defs&gt; &lt;g stroke=&quot;currentColor&quot; fill=&quot;currentColor&quot; stroke-width=&quot;0&quot; transform=&quot;matrix(1 0 0 -1 0 0)&quot;&gt;  &lt;use xlink:href=&quot;#E1-MJMAIN-2B&quot; x=&quot;0&quot; y=&quot;0&quot;&gt;&lt;/use&gt; &lt;/g&gt; &lt;/svg&gt;": {
        "&lt;svg xmlns:xlink=&quot;http://www.w3.org/1999/xlink&quot; width=&quot;10.954ex&quot; height=&quot;2.343ex&quot; style=&quot;vertical-align: -0.505ex;&quot; viewBox=&quot;0 -791.3 4716.4 1008.6&quot; role=&quot;img&quot; focusable=&quot;false&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;&gt; &lt;defs&gt; &lt;path stroke-width=&quot;1&quot; id=&quot;E1-MJMATHI-41&quot; d=&quot;M208 74Q208 50 254 46Q272 46 272 35Q272 34 270 22Q267 8 264 4T251 0Q249 0 239 0T205 1T141 2Q70 2 50 0H42Q35 7 35 11Q37 38 48 46H62Q132 49 164 96Q170 102 345 401T523 704Q530 716 547 716H555H572Q578 707 578 706L606 383Q634 60 636 57Q641 46 701 46Q726 46 726 36Q726 34 723 22Q720 7 718 4T704 0Q701 0 690 0T651 1T578 2Q484 2 455 0H443Q437 6 437 9T439 27Q443 40 445 43L449 46H469Q523 49 533 63L521 213H283L249 155Q208 86 208 74ZM516 260Q516 271 504 416T490 562L463 519Q447 492 400 412L310 260L413 259Q516 259 516 260Z&quot;&gt;&lt;/path&gt; &lt;path stroke-width=&quot;1&quot; id=&quot;E1-MJMAIN-2B&quot; d=&quot;M56 237T56 250T70 270H369V420L370 570Q380 583 389 583Q402 583 409 568V270H707Q722 262 722 250T707 230H409V-68Q401 -82 391 -82H389H387Q375 -82 369 -68V230H70Q56 237 56 250Z&quot;&gt;&lt;/path&gt; &lt;path stroke-width=&quot;1&quot; id=&quot;E1-MJMATHI-42&quot; d=&quot;M231 637Q204 637 199 638T194 649Q194 676 205 682Q206 683 335 683Q594 683 608 681Q671 671 713 636T756 544Q756 480 698 429T565 360L555 357Q619 348 660 311T702 219Q702 146 630 78T453 1Q446 0 242 0Q42 0 39 2Q35 5 35 10Q35 17 37 24Q42 43 47 45Q51 46 62 46H68Q95 46 128 49Q142 52 147 61Q150 65 219 339T288 628Q288 635 231 637ZM649 544Q649 574 634 600T585 634Q578 636 493 637Q473 637 451 637T416 636H403Q388 635 384 626Q382 622 352 506Q352 503 351 500L320 374H401Q482 374 494 376Q554 386 601 434T649 544ZM595 229Q595 273 572 302T512 336Q506 337 429 337Q311 337 310 336Q310 334 293 263T258 122L240 52Q240 48 252 48T333 46Q422 46 429 47Q491 54 543 105T595 229Z&quot;&gt;&lt;/path&gt; &lt;path stroke-width=&quot;1&quot; id=&quot;E1-MJMATHI-43&quot; d=&quot;M50 252Q50 367 117 473T286 641T490 704Q580 704 633 653Q642 643 648 636T656 626L657 623Q660 623 684 649Q691 655 699 663T715 679T725 690L740 705H746Q760 705 760 698Q760 694 728 561Q692 422 692 421Q690 416 687 415T669 413H653Q647 419 647 422Q647 423 648 429T650 449T651 481Q651 552 619 605T510 659Q484 659 454 652T382 628T299 572T226 479Q194 422 175 346T156 222Q156 108 232 58Q280 24 350 24Q441 24 512 92T606 240Q610 253 612 255T628 257Q648 257 648 248Q648 243 647 239Q618 132 523 55T319 -22Q206 -22 128 53T50 252Z&quot;&gt;&lt;/path&gt; &lt;/defs&gt; &lt;g stroke=&quot;currentColor&quot; fill=&quot;currentColor&quot; stroke-width=&quot;0&quot; transform=&quot;matrix(1 0 0 -1 0 0)&quot;&gt;  &lt;use xlink:href=&quot;#E1-MJMATHI-41&quot; x=&quot;0&quot; y=&quot;0&quot;&gt;&lt;/use&gt;  &lt;use xlink:href=&quot;#E1-MJMAIN-2B&quot; x=&quot;972&quot; y=&quot;0&quot;&gt;&lt;/use&gt;  &lt;use xlink:href=&quot;#E1-MJMATHI-42&quot; x=&quot;1973&quot; y=&quot;0&quot;&gt;&lt;/use&gt;  &lt;use xlink:href=&quot;#E1-MJMAIN-2Blet&quot; x=&quot;2955&quot; y=&quot;0&quot;&gt;&lt;/use&gt;  &lt;use xlink:href=&quot;#E1-MJMATHI-43&quot; x=&quot;3955&quot; y=&quot;0&quot;&gt;&lt;/use&gt; &lt;/g&gt; &lt;/svg&gt;": 1,
        "&lt;svg xmlns:xlink=&quot;http://www.w3.org/1999/xlink&quot; width=&quot;1.808ex&quot; height=&quot;2.176ex&quot; style=&quot;vertical-align: -0.505ex;&quot; viewBox=&quot;0 -719.6 778.5 936.9&quot; role=&quot;img&quot; focusable=&quot;false&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;&gt; &lt;defs&gt; &lt;path stroke-width=&quot;1&quot; id=&quot;E1-MJMAIN-2B&quot; d=&quot;M56 237T56 250T70 270H369V420L370 570Q380 583 389 583Q402 583 409 568V270H707Q722 262 722 250T707 230H409V-68Q401 -82 391 -82H389H387Q375 -82 369 -68V230H70Q56 237 56 250Z&quot;&gt;&lt;/path&gt; &lt;/defs&gt; &lt;g stroke=&quot;currentColor&quot; fill=&quot;currentColor&quot; stroke-width=&quot;0&quot; transform=&quot;matrix(1 0 0 -1 0 0)&quot;&gt;  &lt;use xlink:href=&quot;#E1-MJMAIN-2B&quot; x=&quot;0&quot; y=&quot;0&quot;&gt;&lt;/use&gt; &lt;/g&gt; &lt;/svg&gt;": {
          "&lt;svg xmlns:xlink=&quot;http://www.w3.org/1999/xlink&quot; width=&quot;15.719ex&quot; height=&quot;2.343ex&quot; style=&quot;vertical-align: -0.505ex;&quot; viewBox=&quot;0 -791.3 6767.8 1008.6&quot; role=&quot;img&quot; focusable=&quot;false&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;&gt; &lt;defs&gt; &lt;path stroke-width=&quot;1&quot; id=&quot;E1-MJMATHI-41&quot; d=&quot;M208 74Q208 50 254 46Q272 46 272 35Q272 34 270 22Q267 8 264 4T251 0Q249 0 239 0T205 1T141 2Q70 2 50 0H42Q35 7 35 11Q37 38 48 46H62Q132 49 164 96Q170 102 345 401T523 704Q530 716 547 716H555H572Q578 707 578 706L606 383Q634 60 636 57Q641 46 701 46Q726 46 726 36Q726 34 723 22Q720 7 718 4T704 0Q701 0 690 0T651 1T578 2Q484 2 455 0H443Q437 6 437 9T439 27Q443 40 445 43L449 46H469Q523 49 533 63L521 213H283L249 155Q208 86 208 74ZM516 260Q516 271 504 416T490 562L463 519Q447 492 400 412L310 260L413 259Q516 259 516 260Z&quot;&gt;&lt;/path&gt; &lt;path stroke-width=&quot;1&quot; id=&quot;E1-MJMAIN-2B&quot; d=&quot;M56 237T56 250T70 270H369V420L370 570Q380 583 389 583Q402 583 409 568V270H707Q722 262 722 250T707 230H409V-68Q401 -82 391 -82H389H387Q375 -82 369 -68V230H70Q56 237 56 250Z&quot;&gt;&lt;/path&gt; &lt;path stroke-width=&quot;1&quot; id=&quot;E1-MJMATHI-42&quot; d=&quot;M231 637Q204 637 199 638T194 649Q194 676 205 682Q206 683 335 683Q594 683 608 681Q671 671 713 636T756 544Q756 480 698 429T565 360L555 357Q619 348 660 311T702 219Q702 146 630 78T453 1Q446 0 242 0Q42 0 39 2Q35 5 35 10Q35 17 37 24Q42 43 47 45Q51 46 62 46H68Q95 46 128 49Q142 52 147 61Q150 65 219 339T288 628Q288 635 231 637ZM649 544Q649 574 634 600T585 634Q578 636 493 637Q473 637 451 637T416 636H403Q388 635 384 626Q382 622 352 506Q352 503 351 500L320 374H401Q482 374 494 376Q554 386 601 434T649 544ZM595 229Q595 273 572 302T512 336Q506 337 429 337Q311 337 310 336Q310 334 293 263T258 122L240 52Q240 48 252 48T333 46Q422 46 429 47Q491 54 543 105T595 229Z&quot;&gt;&lt;/path&gt; &lt;path stroke-width=&quot;1&quot; id=&quot;E1-MJMATHI-43&quot; d=&quot;M50 252Q50 367 117 473T286 641T490 704Q580 704 633 653Q642 643 648 636T656 626L657 623Q660 623 684 649Q691 655 699 663T715 679T725 690L740 705H746Q760 705 760 698Q760 694 728 561Q692 422 692 421Q690 416 687 415T669 413H653Q647 419 647 422Q647 423 648 429T650 449T651 481Q651 552 619 605T510 659Q484 659 454 652T382 628T299 572T226 479Q194 422 175 346T156 222Q156 108 232 58Q280 24 350 24Q441 24 512 92T606 240Q610 253 612 255T628 257Q648 257 648 248Q648 243 647 239Q618 132 523 55T319 -22Q206 -22 128 53T50 252Z&quot;&gt;&lt;/path&gt; &lt;path stroke-width=&quot;1&quot; id=&quot;E1-MJMATHI-44&quot; d=&quot;M287 628Q287 635 230 637Q207 637 200 638T193 647Q193 655 197 667T204 682Q206 683 403 683Q570 682 590 682T630 676Q702 659 752 597T803 431Q803 275 696 151T444 3L430 1L236 0H125H72Q48 0 41 2T33 11Q33 13 36 25Q40 41 44 43T67 46Q94 46 127 49Q141 52 146 61Q149 65 218 339T287 628ZM703 469Q703 507 692 537T666 584T629 613T590 629T555 636Q553 636 541 636T512 636T479 637H436Q392 637 386 627Q384 623 313 339T242 52Q242 48 253 48T330 47Q335 47 349 47T373 46Q499 46 581 128Q617 164 640 212T683 339T703 469Z&quot;&gt;&lt;/path&gt; &lt;/defs&gt; &lt;g stroke=&quot;currentColor&quot; fill=&quot;currentColor&quot; stroke-width=&quot;0&quot; transform=&quot;matrix(1 0 0 -1 0 0)&quot;&gt;  &lt;use xlink:href=&quot;#E1-MJMATHI-41&quot; x=&quot;0&quot; y=&quot;0&quot;&gt;&lt;/use&gt;  &lt;use xlink:href=&quot;#E1-MJMAIN-2B&quot; x=&quot;972&quot; y=&quot;0&quot;&gt;&lt;/use&gt;  &lt;use xlink:href=&quot;#E1-MJMATHI-42&quot; x=&quot;1973&quot; y=&quot;0&quot;&gt;&lt;/use&gt;  &lt;use xlink:href=&quot;#E1-MJMAIN-2B&quot; x=&quot;2955&quot; y=&quot;0&quot;&gt;&lt;/use&gt;  &lt;use xlink:href=&quot;#E1-MJMATHI-43&quot; x=&quot;3955&quot; y=&quot;0&quot;&gt;&lt;/use&gt;  &lt;use xlink:href=&quot;#E1-MJMAIN-2B&quot; x=&quot;4938&quot; y=&quot;0&quot;&gt;&lt;/use&gt;  &lt;use xlink:href=&quot;#E1-MJMATHI-44&quot; x=&quot;5939&quot; y=&quot;0&quot;&gt;&lt;/use&gt; &lt;/g&gt; &lt;/svg&gt;": 1
        }
      }
    },
    "&lt;svg xmlns:xlink=&quot;http://www.w3.org/1999/xlink&quot; width=&quot;1.808ex&quot; height=&quot;1.509ex&quot; style=&quot;vertical-align: 0.019ex;&quot; viewBox=&quot;0 -576.1 778.5 649.8&quot; role=&quot;img&quot; focusable=&quot;false&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;&gt; &lt;defs&gt; &lt;path stroke-width=&quot;1&quot; id=&quot;E1-MJMAIN-D7&quot; d=&quot;M630 29Q630 9 609 9Q604 9 587 25T493 118L389 222L284 117Q178 13 175 11Q171 9 168 9Q160 9 154 15T147 29Q147 36 161 51T255 146L359 250L255 354Q174 435 161 449T147 471Q147 480 153 485T168 490Q173 490 175 489Q178 487 284 383L389 278L493 382Q570 459 587 475T609 491Q630 491 630 471Q630 464 620 453T522 355L418 250L522 145Q606 61 618 48T630 29Z&quot;&gt;&lt;/path&gt; &lt;/defs&gt; &lt;g stroke=&quot;currentColor&quot; fill=&quot;currentColor&quot; stroke-width=&quot;0&quot; transform=&quot;matrix(1 0 0 -1 0 0)&quot;&gt;  &lt;use xlink:href=&quot;#E1-MJMAIN-D7&quot; x=&quot;0&quot; y=&quot;0&quot;&gt;&lt;/use&gt; &lt;/g&gt; &lt;/svg&gt;": {
      "&lt;svg xmlns:xlink=&quot;http://www.w3.org/1999/xlink&quot; width=&quot;6.348ex&quot; height=&quot;2.176ex&quot; style=&quot;vertical-align: -0.338ex;&quot; viewBox=&quot;0 -791.3 2732.9 936.9&quot; role=&quot;img&quot; focusable=&quot;false&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;&gt; &lt;defs&gt; &lt;path stroke-width=&quot;1&quot; id=&quot;E1-MJMATHI-41&quot; d=&quot;M208 74Q208 50 254 46Q272 46 272 35Q272 34 270 22Q267 8 264 4T251 0Q249 0 239 0T205 1T141 2Q70 2 50 0H42Q35 7 35 11Q37 38 48 46H62Q132 49 164 96Q170 102 345 401T523 704Q530 716 547 716H555H572Q578 707 578 706L606 383Q634 60 636 57Q641 46 701 46Q726 46 726 36Q726 34 723 22Q720 7 718 4T704 0Q701 0 690 0T651 1T578 2Q484 2 455 0H443Q437 6 437 9T439 27Q443 40 445 43L449 46H469Q523 49 533 63L521 213H283L249 155Q208 86 208 74ZM516 260Q516 271 504 416T490 562L463 519Q447 492 400 412L310 260L413 259Q516 259 516 260Z&quot;&gt;&lt;/path&gt; &lt;path stroke-width=&quot;1&quot; id=&quot;E1-MJMAIN-D7&quot; d=&quot;M630 29Q630 9 609 9Q604 9 587 25T493 118L389 222L284 117Q178 13 175 11Q171 9 168 9Q160 9 154 15T147 29Q147 36 161 51T255 146L359 250L255 354Q174 435 161 449T147 471Q147 480 153 485T168 490Q173 490 175 489Q178 487 284 383L389 278L493 382Q570 459 587 475T609 491Q630 491 630 471Q630 464 620 453T522 355L418 250L522 145Q606 61 618 48T630 29Z&quot;&gt;&lt;/path&gt; &lt;path stroke-width=&quot;1&quot; id=&quot;E1-MJMATHI-42&quot; d=&quot;M231 637Q204 637 199 638T194 649Q194 676 205 682Q206 683 335 683Q594 683 608 681Q671 671 713 636T756 544Q756 480 698 429T565 360L555 357Q619 348 660 311T702 219Q702 146 630 78T453 1Q446 0 242 0Q42 0 39 2Q35 5 35 10Q35 17 37 24Q42 43 47 45Q51 46 62 46H68Q95 46 128 49Q142 52 147 61Q150 65 219 339T288 628Q288 635 231 637ZM649 544Q649 574 634 600T585 634Q578 636 493 637Q473 637 451 637T416 636H403Q388 635 384 626Q382 622 352 506Q352 503 351 500L320 374H401Q482 374 494 376Q554 386 601 434T649 544ZM595 229Q595 273 572 302T512 336Q506 337 429 337Q311 337 310 336Q310 334 293 263T258 122L240 52Q240 48 252 48T333 46Q422 46 429 47Q491 54 543 105T595 229Z&quot;&gt;&lt;/path&gt; &lt;/defs&gt; &lt;g stroke=&quot;currentColor&quot; fill=&quot;currentColor&quot; stroke-width=&quot;0&quot; transform=&quot;matrix(1 0 0 -1 0 0)&quot;&gt;  &lt;use xlink:href=&quot;#E1-MJMATHI-41&quot; x=&quot;0&quot; y=&quot;0&quot;&gt;&lt;/use&gt;  &lt;use xlink:href=&quot;#E1-MJMAIN-D7&quot; x=&quot;972&quot; y=&quot;0&quot;&gt;&lt;/use&gt;  &lt;use xlink:href=&quot;#E1-MJMATHI-42&quot; x=&quot;1973&quot; y=&quot;0&quot;&gt;&lt;/use&gt; &lt;/g&gt; &lt;/svg&gt;": 1,
      "&lt;svg xmlns:xlink=&quot;http://www.w3.org/1999/xlink&quot; width=&quot;1.808ex&quot; height=&quot;1.509ex&quot; style=&quot;vertical-align: 0.019ex;&quot; viewBox=&quot;0 -576.1 778.5 649.8&quot; role=&quot;img&quot; focusable=&quot;false&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;&gt; &lt;defs&gt; &lt;path stroke-width=&quot;1&quot; id=&quot;E1-MJMAIN-D7&quot; d=&quot;M630 29Q630 9 609 9Q604 9 587 25T493 118L389 222L284 117Q178 13 175 11Q171 9 168 9Q160 9 154 15T147 29Q147 36 161 51T255 146L359 250L255 354Q174 435 161 449T147 471Q147 480 153 485T168 490Q173 490 175 489Q178 487 284 383L389 278L493 382Q570 459 587 475T609 491Q630 491 630 471Q630 464 620 453T522 355L418 250L522 145Q606 61 618 48T630 29Z&quot;&gt;&lt;/path&gt; &lt;/defs&gt; &lt;g stroke=&quot;currentColor&quot; fill=&quot;currentColor&quot; stroke-width=&quot;0&quot; transform=&quot;matrix(1 0 0 -1 0 0)&quot;&gt;  &lt;use xlink:href=&quot;#E1-MJMAIN-D7&quot; x=&quot;0&quot; y=&quot;0&quot;&gt;&lt;/use&gt; &lt;/g&gt; &lt;/svg&gt;": {
        "&lt;svg xmlns:xlink=&quot;http://www.w3.org/1999/xlink&quot; width=&quot;10.954ex&quot; height=&quot;2.176ex&quot; style=&quot;vertical-align: -0.338ex;&quot; viewBox=&quot;0 -791.3 4716.4 936.9&quot; role=&quot;img&quot; focusable=&quot;false&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;&gt; &lt;defs&gt; &lt;path stroke-width=&quot;1&quot; id=&quot;E1-MJMATHI-41&quot; d=&quot;M208 74Q208 50 254 46Q272 46 272 35Q272 34 270 22Q267 8 264 4T251 0Q249 0 239 0T205 1T141 2Q70 2 50 0H42Q35 7 35 11Q37 38 48 46H62Q132 49 164 96Q170 102 345 401T523 704Q530 716 547 716H555H572Q578 707 578 706L606 383Q634 60 636 57Q641 46 701 46Q726 46 726 36Q726 34 723 22Q720 7 718 4T704 0Q701 0 690 0T651 1T578 2Q484 2 455 0H443Q437 6 437 9T439 27Q443 40 445 43L449 46H469Q523 49 533 63L521 213H283L249 155Q208 86 208 74ZM516 260Q516 271 504 416T490 562L463 519Q447 492 400 412L310 260L413 259Q516 259 516 260Z&quot;&gt;&lt;/path&gt; &lt;path stroke-width=&quot;1&quot; id=&quot;E1-MJMAIN-D7&quot; d=&quot;M630 29Q630 9 609 9Q604 9 587 25T493 118L389 222L284 117Q178 13 175 11Q171 9 168 9Q160 9 154 15T147 29Q147 36 161 51T255 146L359 250L255 354Q174 435 161 449T147 471Q147 480 153 485T168 490Q173 490 175 489Q178 487 284 383L389 278L493 382Q570 459 587 475T609 491Q630 491 630 471Q630 464 620 453T522 355L418 250L522 145Q606 61 618 48T630 29Z&quot;&gt;&lt;/path&gt; &lt;path stroke-width=&quot;1&quot; id=&quot;E1-MJMATHI-42&quot; d=&quot;M231 637Q204 637 199 638T194 649Q194 676 205 682Q206 683 335 683Q594 683 608 681Q671 671 713 636T756 544Q756 480 698 429T565 360L555 357Q619 348 660 311T702 219Q702 146 630 78T453 1Q446 0 242 0Q42 0 39 2Q35 5 35 10Q35 17 37 24Q42 43 47 45Q51 46 62 46H68Q95 46 128 49Q142 52 147 61Q150 65 219 339T288 628Q288 635 231 637ZM649 544Q649 574 634 600T585 634Q578 636 493 637Q473 637 451 637T416 636H403Q388 635 384 626Q382 622 352 506Q352 503 351 500L320 374H401Q482 374 494 376Q554 386 601 434T649 544ZM595 229Q595 273 572 302T512 336Q506 337 429 337Q311 337 310 336Q310 334 293 263T258 122L240 52Q240 48 252 48T333 46Q422 46 429 47Q491 54 543 105T595 229Z&quot;&gt;&lt;/path&gt; &lt;path stroke-width=&quot;1&quot; id=&quot;E1-MJMATHI-43&quot; d=&quot;M50 252Q50 367 117 473T286 641T490 704Q580 704 633 653Q642 643 648 636T656 626L657 623Q660 623 684 649Q691 655 699 663T715 679T725 690L740 705H746Q760 705 760 698Q760 694 728 561Q692 422 692 421Q690 416 687 415T669 413H653Q647 419 647 422Q647 423 648 429T650 449T651 481Q651 552 619 605T510 659Q484 659 454 652T382 628T299 572T226 479Q194 422 175 346T156 222Q156 108 232 58Q280 24 350 24Q441 24 512 92T606 240Q610 253 612 255T628 257Q648 257 648 248Q648 243 647 239Q618 132 523 55T319 -22Q206 -22 128 53T50 252Z&quot;&gt;&lt;/path&gt; &lt;/defs&gt; &lt;g stroke=&quot;currentColor&quot; fill=&quot;currentColor&quot; stroke-width=&quot;0&quot; transform=&quot;matrix(1 0 0 -1 0 0)&quot;&gt;  &lt;use xlink:href=&quot;#E1-MJMATHI-41&quot; x=&quot;0&quot; y=&quot;0&quot;&gt;&lt;/use&gt;  &lt;use xlink:href=&quot;#E1-MJMAIN-D7&quot; x=&quot;972&quot; y=&quot;0&quot;&gt;&lt;/use&gt;  &lt;use xlink:href=&quot;#E1-MJMATHI-42&quot; x=&quot;1973&quot; y=&quot;0&quot;&gt;&lt;/use&gt;  &lt;use xlink:href=&quot;#E1-MJMAIN-D7&quot; x=&quot;2955&quot; y=&quot;0&quot;&gt;&lt;/use&gt;  &lt;use xlink:href=&quot;#E1-MJMATHI-43&quot; x=&quot;3955&quot; y=&quot;0&quot;&gt;&lt;/use&gt; &lt;/g&gt; &lt;/svg&gt;": 1,
        "&lt;svg xmlns:xlink=&quot;http://www.w3.org/1999/xlink&quot; width=&quot;1.808ex&quot; height=&quot;2.176ex&quot; style=&quot;vertical-align: -0.505ex;&quot; viewBox=&quot;0 -719.6 778.5 936.9&quot; role=&quot;img&quot; focusable=&quot;false&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;&gt; &lt;defs&gt; &lt;path stroke-width=&quot;1&quot; id=&quot;E1-MJMAIN-2B&quot; d=&quot;M56 237T56 250T70 270H369V420L370 570Q380 583 389 583Q402 583 409 568V270H707Q722 262 722 250T707 230H409V-68Q401 -82 391 -82H389H387Q375 -82 369 -68V230H70Q56 237 56 250Z&quot;&gt;&lt;/path&gt; &lt;/defs&gt; &lt;g stroke=&quot;currentColor&quot; fill=&quot;currentColor&quot; stroke-width=&quot;0&quot; transform=&quot;matrix(1 0 0 -1 0 0)&quot;&gt;  &lt;use xlink:href=&quot;#E1-MJMAIN-2B&quot; x=&quot;0&quot; y=&quot;0&quot;&gt;&lt;/use&gt; &lt;/g&gt; &lt;/svg&gt;": {
          "&lt;svg xmlns:xlink=&quot;http://www.w3.org/1999/xlink&quot; width=&quot;15.719ex&quot; height=&quot;2.343ex&quot; style=&quot;vertical-align: -0.505ex;&quot; viewBox=&quot;0 -791.3 6767.8 1008.6&quot; role=&quot;img&quot; focusable=&quot;false&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;&gt; &lt;defs&gt; &lt;path stroke-width=&quot;1&quot; id=&quot;E1-MJMATHI-41&quot; d=&quot;M208 74Q208 50 254 46Q272 46 272 35Q272 34 270 22Q267 8 264 4T251 0Q249 0 239 0T205 1T141 2Q70 2 50 0H42Q35 7 35 11Q37 38 48 46H62Q132 49 164 96Q170 102 345 401T523 704Q530 716 547 716H555H572Q578 707 578 706L606 383Q634 60 636 57Q641 46 701 46Q726 46 726 36Q726 34 723 22Q720 7 718 4T704 0Q701 0 690 0T651 1T578 2Q484 2 455 0H443Q437 6 437 9T439 27Q443 40 445 43L449 46H469Q523 49 533 63L521 213H283L249 155Q208 86 208 74ZM516 260Q516 271 504 416T490 562L463 519Q447 492 400 412L310 260L413 259Q516 259 516 260Z&quot;&gt;&lt;/path&gt; &lt;path stroke-width=&quot;1&quot; id=&quot;E1-MJMAIN-D7&quot; d=&quot;M630 29Q630 9 609 9Q604 9 587 25T493 118L389 222L284 117Q178 13 175 11Q171 9 168 9Q160 9 154 15T147 29Q147 36 161 51T255 146L359 250L255 354Q174 435 161 449T147 471Q147 480 153 485T168 490Q173 490 175 489Q178 487 284 383L389 278L493 382Q570 459 587 475T609 491Q630 491 630 471Q630 464 620 453T522 355L418 250L522 145Q606 61 618 48T630 29Z&quot;&gt;&lt;/path&gt; &lt;path stroke-width=&quot;1&quot; id=&quot;E1-MJMATHI-42&quot; d=&quot;M231 637Q204 637 199 638T194 649Q194 676 205 682Q206 683 335 683Q594 683 608 681Q671 671 713 636T756 544Q756 480 698 429T565 360L555 357Q619 348 660 311T702 219Q702 146 630 78T453 1Q446 0 242 0Q42 0 39 2Q35 5 35 10Q35 17 37 24Q42 43 47 45Q51 46 62 46H68Q95 46 128 49Q142 52 147 61Q150 65 219 339T288 628Q288 635 231 637ZM649 544Q649 574 634 600T585 634Q578 636 493 637Q473 637 451 637T416 636H403Q388 635 384 626Q382 622 352 506Q352 503 351 500L320 374H401Q482 374 494 376Q554 386 601 434T649 544ZM595 229Q595 273 572 302T512 336Q506 337 429 337Q311 337 310 336Q310 334 293 263T258 122L240 52Q240 48 252 48T333 46Q422 46 429 47Q491 54 543 105T595 229Z&quot;&gt;&lt;/path&gt; &lt;path stroke-width=&quot;1&quot; id=&quot;E1-MJMATHI-43&quot; d=&quot;M50 252Q50 367 117 473T286 641T490 704Q580 704 633 653Q642 643 648 636T656 626L657 623Q660 623 684 649Q691 655 699 663T715 679T725 690L740 705H746Q760 705 760 698Q760 694 728 561Q692 422 692 421Q690 416 687 415T669 413H653Q647 419 647 422Q647 423 648 429T650 449T651 481Q651 552 619 605T510 659Q484 659 454 652T382 628T299 572T226 479Q194 422 175 346T156 222Q156 108 232 58Q280 24 350 24Q441 24 512 92T606 240Q610 253 612 255T628 257Q648 257 648 248Q648 243 647 239Q618 132 523 55T319 -22Q206 -22 128 53T50 252Z&quot;&gt;&lt;/path&gt; &lt;path stroke-width=&quot;1&quot; id=&quot;E1-MJMAIN-2B&quot; d=&quot;M56 237T56 250T70 270H369V420L370 570Q380 583 389 583Q402 583 409 568V270H707Q722 262 722 250T707 230H409V-68Q401 -82 391 -82H389H387Q375 -82 369 -68V230H70Q56 237 56 250Z&quot;&gt;&lt;/path&gt; &lt;path stroke-width=&quot;1&quot; id=&quot;E1-MJMATHI-44&quot; d=&quot;M287 628Q287 635 230 637Q207 637 200 638T193 647Q193 655 197 667T204 682Q206 683 403 683Q570 682 590 682T630 676Q702 659 752 597T803 431Q803 275 696 151T444 3L430 1L236 0H125H72Q48 0 41 2T33 11Q33 13 36 25Q40 41 44 43T67 46Q94 46 127 49Q141 52 146 61Q149 65 218 339T287 628ZM703 469Q703 507 692 537T666 584T629 613T590 629T555 636Q553 636 541 636T512 636T479 637H436Q392 637 386 627Q384 623 313 339T242 52Q242 48 253 48T330 47Q335 47 349 47T373 46Q499 46 581 128Q617 164 640 212T683 339T703 469Z&quot;&gt;&lt;/path&gt; &lt;/defs&gt; &lt;g stroke=&quot;currentColor&quot; fill=&quot;currentColor&quot; stroke-width=&quot;0&quot; transform=&quot;matrix(1 0 0 -1 0 0)&quot;&gt;  &lt;use xlink:href=&quot;#E1-MJMATHI-41&quot; x=&quot;0&quot; y=&quot;0&quot;&gt;&lt;/use&gt;  &lt;use xlink:href=&quot;#E1-MJMAIN-D7&quot; x=&quot;972&quot; y=&quot;0&quot;&gt;&lt;/use&gt;  &lt;use xlink:href=&quot;#E1-MJMATHI-42&quot; x=&quot;1973&quot; y=&quot;0&quot;&gt;&lt;/use&gt;  &lt;use xlink:href=&quot;#E1-MJMAIN-D7&quot; x=&quot;2955&quot; y=&quot;0&quot;&gt;&lt;/use&gt;  &lt;use xlink:href=&quot;#E1-MJMATHI-43&quot; x=&quot;3955&quot; y=&quot;0&quot;&gt;&lt;/use&gt;  &lt;use xlink:href=&quot;#E1-MJMAIN-2B&quot; x=&quot;4938&quot; y=&quot;0&quot;&gt;&lt;/use&gt;  &lt;use xlink:href=&quot;#E1-MJMATHI-44&quot; x=&quot;5939&quot; y=&quot;0&quot;&gt;&lt;/use&gt; &lt;/g&gt; &lt;/svg&gt;": 1
        }
      }
    }
  }
};