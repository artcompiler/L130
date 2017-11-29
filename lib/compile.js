"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.compiler = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; /* Copyright (c) 2016, Art Compiler LLC */


var _assert = require("./assert.js");

var _mjSingle = require("mathjax-node/lib/mj-single.js");

var mjAPI = _interopRequireWildcard(_mjSingle);

var _https = require("https");

var https = _interopRequireWildcard(_https);

var _http = require("http");

var http = _interopRequireWildcard(_http);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

(0, _assert.reserveCodeRange)(1000, 1999, "compile");
_assert.messages[1001] = "Node ID %1 not found in pool.";
_assert.messages[1002] = "Invalid tag in node with Node ID %1.";
_assert.messages[1003] = "No async callback provided.";
_assert.messages[1004] = "No visitor method defined for '%1'.";
var log = console.log;
var stringify = JSON.stringify;
function getGCHost() {
  var LOCAL = global.port === 5130;
  if (LOCAL) {
    return "localhost";
  } else {
    return "www.graffiticode.com";
  }
}
function getGCPort() {
  var LOCAL = global.port === 5130;
  if (LOCAL) {
    return "3000";
  } else {
    return "443";
  }
}
function getData(id, refresh, resume) {
  var options = {
    method: "GET",
    host: getGCHost(),
    port: getGCPort(),
    path: "/data/?id=" + id + (refresh ? "&refresh=true" : "")
  };
  var LOCAL = global.port === 5130;
  var protocol = LOCAL ? http : https;
  var req = protocol.get(options, function (res) {
    var data = "";
    res.on('data', function (chunk) {
      data += chunk;
    }).on('end', function () {
      try {
        resume([], JSON.parse(data));
      } catch (e) {
        console.log("ERROR " + data);
        console.log(e.stack);
        resume([e], null);
      }
    }).on("error", function () {
      console.log("error() status=" + res.statusCode + " data=" + data);
    });
  });
}
function putData(obj, resume) {
  var encodedData = JSON.stringify({
    src: JSON.stringify(obj) + "..",
    ast: "",
    obj: JSON.stringify(obj),
    img: "",
    language: "L113",
    label: "L130 data",
    caller: "L130 compile"
  });
  var options = {
    host: getGCHost(),
    port: getGCPort(),
    path: "/code",
    method: "PUT",
    headers: {
      'Content-Type': 'text/plain',
      'Content-Length': Buffer.byteLength(encodedData)
    }
  };
  var LOCAL = global.port === 5130;
  var protocol = LOCAL ? http : https;
  var req = protocol.request(options);
  req.on("response", function (res) {
    var data = "";
    res.on('data', function (chunk) {
      data += chunk;
    }).on('end', function () {
      try {
        var id = JSON.parse(data).id;
        resume(id);
      } catch (e) {
        console.log("ERROR " + data);
        console.log(e.stack);
      }
    }).on("error", function () {
      console.log("error() status=" + res.statusCode + " data=" + data);
    });
  });
  req.end(encodedData);
  req.on('error', function (err) {
    console.log("ERROR " + err);
    resume(err);
  });
}
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
    "LAMBDA": lambda,
    "PAREN": paren,
    "APPLY": apply,
    "ICICLE": icicle,
    "LABEL": label,
    "MAP": map,
    "ROOT": root
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
  function icicle(node, options, resume) {
    resume([], {
      type: icicle
    });
  }
  function label(node, options, resume) {
    // Return a function value.
    visit(node.elts[0], options, function (err1, val1) {
      visit(node.elts[1], options, function (err2, val2) {
        val2.label = val1;
        resume([].concat(err1).concat(err2), val2);
      });
    });
  }
  function root(node, options, resume) {
    // Return a function value.
    visit(node.elts[0], options, function (err1, val1) {
      visit(node.elts[1], options, function (err2, val2) {
        val2.root = val1;
        resume([].concat(err1).concat(err2), val2);
      });
    });
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
      val = val && val.length > 0 && _typeof(val[val.length - 1]) === "object" ? val[val.length - 1] : {};
      val.data = options.data;
      getData("Vp6sQ6YriJ", options.data.REFRESH, function (err, items) {
        if (err.length > 0) {
          console.log("ERROR err=" + err);
          resume(err, null);
        } else {
          console.log("program() items.length=" + items.length);
          // L131 query for L131 entries
          var saveIDs = {};
          var recordIDs = {};
          items.forEach(function (item) {
            // Make a map for codeIDs to a list of saveIDs.
            if (!saveIDs[item.codeID]) {
              saveIDs[item.codeID] = [];
            }
            if (!saveIDs[item.codeID].includes(item.saveID)) {
              saveIDs[item.codeID].push(item.saveID);
            }
            // Make a map of saveIDs to save recordIDs.
            if (!recordIDs[item.saveID]) {
              recordIDs[item.saveID] = [];
            }
            if (!recordIDs[item.saveID].includes(item.id)) {
              recordIDs[item.saveID].push(item.id);
            }
          });
          val.saveIDs = saveIDs;
          val.recordIDs = recordIDs;
          resume(err, val);
        }
      });
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
function mapList(lst, fn, resume) {
  if (lst && lst.length > 1) {
    fn(lst[0], function (val1) {
      mapList(lst.slice(1), fn, function (val2) {
        var val = [].concat(val1).concat(val2);
        resume(val);
      });
    });
  } else if (lst && lst.length > 0) {
    fn(lst[0], function (val1) {
      var val = [];
      if (val1 !== null) {
        val = val.concat(val1);
      }
      resume(val);
    });
  } else {
    resume([]);
  }
}
var render = function () {
  function render(val, resume) {
    // Do some rendering here.
    var data = val.data;
    var root = val.root;
    mapListToObject(Object.keys(data), function (key, resume) {
      var v = data[key];
      var itemID = v.id;
      var title = v.title;
      var notes = v.notes;
      if (v.index) {
        var index = void 0;
        if (root) {
          index = v.index[root];
          if (!index) {
            index = {};
          }
        } else {
          index = v.index;
        }
        fn(index, function (data) {
          resume(data);
        });
      } else {
        resume({});
      }
      function fn(obj, resume) {
        if ((typeof obj === "undefined" ? "undefined" : _typeof(obj)) !== "object") {
          resume({
            id: itemID,
            title: title,
            notes: notes
          });
        } else {
          var svgObj = {};
          mapListToObject(Object.keys(obj), function (key, resume) {
            var val = obj[key];
            tex2SVG(key, function (err, svgKey) {
              fn(val, function (data) {
                data.index = key;
                svgObj[escapeXML(svgKey)] = data;
                resume(svgObj);
              });
            });
          }, resume);
        }
      }
    }, resume);
    function merge(o1, o2) {
      var obj = {};
      if (o1 && o2 && (typeof o1 === "undefined" ? "undefined" : _typeof(o1)) === "object" && (typeof o2 === "undefined" ? "undefined" : _typeof(o2)) === "object") {
        Object.keys(o1).forEach(function (k) {
          // Merge properties in o1.
          if (_typeof(o1[k]) === "object" && _typeof(o2[k]) === "object") {
            // Both are objects so merge them.
            obj[k] = merge(o1[k], o2[k]);
          } else {
            // One ore both children are not objects, so assign o1 child here
            // and o2 child later.
            obj[k] = o1[k];
          }
        });
        Object.keys(o2).forEach(function (k) {
          // Now add the o2 only properties.
          if (!obj[k]) {
            // Don't have this property yet, so assign o2 child.
            obj[k] = o2[k];
          }
        });
      } else if (o1 && (typeof o1 === "undefined" ? "undefined" : _typeof(o1)) === "object") {
        (0, _assert.assert)(false);
        Object.keys(o2).forEach(function (k) {
          obj[k] = o1[k];
        });
      } else if (o2 && (typeof o2 === "undefined" ? "undefined" : _typeof(o2)) === "object") {
        (0, _assert.assert)(false);
        Object.keys(o2).forEach(function (k) {
          obj[k] = o2[k];
        });
      }
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
    function setIDs(node, saveIDs, recordIDs, resume) {
      var ids = [];
      if (node !== null && (typeof node === "undefined" ? "undefined" : _typeof(node)) === "object") {
        var index = node.index;
        delete node.index;
        var keys = Object.keys(node);
        mapList(keys, function (k, resume) {
          // Iterate over properties of node populating a list according to
          // this function.
          if (node[k].id) {
            resume([node[k].id]);
          } else {
            // If not leaf, drill down.
            setIDs(node[k], saveIDs, recordIDs, function (ids) {
              resume(ids);
            });
          };
        }, function (ids) {
          // Got codeIDs for children of current node. Now create a map of
          // saveIDs and codeIDs.
          var idMap = [];
          ids.forEach(function (id) {
            // Always include the default, unsaved generator.
            idMap.push({
              isCode: true,
              saveID: "122+" + id + "+0",
              codeID: id
            });
            if (saveIDs && saveIDs[id]) {
              saveIDs[id].forEach(function (saveID) {
                // for each saveID create a map from it to its codeID.
                idMap.push({
                  saveID: saveID,
                  codeID: id,
                  recordIDs: recordIDs[saveID]
                });
              });
            }
          });
          putData(idMap, function (id) {
            // Compile idMap using L113 and store its ID.
            node.link = id;
            node.index = index;
            resume(ids);
          });
        });
      }
    }
    try {
      var options = {
        data: data
      };
      transform(code, options, function (err, val) {
        if (err.length) {
          resume(err, val);
        } else {
          var _data = val.data;
          var saveIDs = val.saveIDs;
          var recordIDs = val.recordIDs;
          var root = val.root;
          render(val, function (val) {
            setIDs(val, saveIDs, recordIDs, function (ids) {
              tex2SVG(root || "\\ldots", function (e, svg) {
                var root = {};
                root[escapeXML(svg)] = val;
                resume(err, root);
              });
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