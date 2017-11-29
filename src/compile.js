/* Copyright (c) 2016, Art Compiler LLC */
/* @flow */

import {assert, message, messages, reserveCodeRange} from "./assert.js"
import * as mjAPI from "mathjax-node/lib/mj-single.js"
import * as https from "https";
import * as http from "http";
reserveCodeRange(1000, 1999, "compile");
messages[1001] = "Node ID %1 not found in pool.";
messages[1002] = "Invalid tag in node with Node ID %1.";
messages[1003] = "No async callback provided.";
messages[1004] = "No visitor method defined for '%1'.";
const log = console.log;
const stringify = JSON.stringify;
function getGCHost() {
  const LOCAL = global.port === 5130;
  if (LOCAL) {
    return "localhost";
  } else {
    return "www.graffiticode.com";
  }
}
function getGCPort() {
  const LOCAL = global.port === 5130;
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
    path: "/data/?id=" + id + (refresh ? "&refresh=true" : ""),
  };
  const LOCAL = global.port === 5130;
  const protocol = LOCAL ? http : https;
  var req = protocol.get(options, function(res) {
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
  let encodedData = JSON.stringify({
    src: JSON.stringify(obj) + "..",
    ast: "",
    obj: JSON.stringify(obj),
    img: "",
    language: "L113",
    label: "L130 data",
    caller: "L130 compile",
  });
  var options = {
    host: getGCHost(),
    port: getGCPort(),
    path: "/code",
    method: "PUT",
    headers: {
      'Content-Type': 'text/plain',
      'Content-Length': Buffer.byteLength(encodedData),
    },
  };
  const LOCAL = global.port === 5130;
  const protocol = LOCAL ? http : https;
  var req = protocol.request(options);
  req.on("response", (res) => {
    var data = "";
    res.on('data', function (chunk) {
      data += chunk;
    }).on('end', function () {
      try {
        let id = JSON.parse(data).id;
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
  req.on('error', function(err) {
    console.log("ERROR " + err);
    resume(err);
  });
}
let transform = (function() {
  let table = [{
    // v0
    "PROG" : program,
    "EXPRS" : exprs,
    "STR": str,
    "NUM": num,
    "IDENT": ident,
    "BOOL": bool,
    "LIST": list,
    "RECORD": record,
    "BINDING": binding,
    "ADD" : add,
    "MUL" : mul,
    "STYLE" : style,
  }, {
    // v1
    "PROG" : program,
    "EXPRS" : exprs,
    "STR": str,
    "NUM": num,
    "IDENT": ident,
    "BOOL": bool,
    "LIST": list,
    "RECORD": record,
    "BINDING": binding,
    "ADD" : add,
    "MUL" : mul,
    "VAL" : val,
    "KEY" : key,
    "LEN" : len,
    "STYLE" : styleV1,
    "CONCAT" : concat,
    "ARG" : arg,
    "LAMBDA" : lambda,
    "PAREN" : paren,
    "APPLY" : apply,
    "ICICLE" : icicle,
    "LABEL" : label,
    "MAP" : map,
    "ROOT": root,
  }];
  let nodePool;
  let version;
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
      nid: nid,
    };
  }
  function visit(nid, options, resume) {
    assert(typeof resume === "function", message(1003));
    // Get the node from the pool of nodes.
    let node;
    if (typeof nid === "object") {
      node = nid;
    } else {
      node = nodePool[nid];
    }
    assert(node, message(1001, [nid]));
    assert(node.tag, message(1001, [nid]));
    assert(typeof table[version][node.tag] === "function", message(1004, [JSON.stringify(node.tag)]));
    return table[version][node.tag](node, options, resume);
  }
  // BEGIN VISITOR METHODS
  function str(node, options, resume) {
    let val = node.elts[0];
    resume([], val);
  }
  function num(node, options, resume) {
    let val = node.elts[0];
    resume([], +val);
  }
  function ident(node, options, resume) {
    let val = node.elts[0];
    resume([], val);
  }
  function bool(node, options, resume) {
    let val = node.elts[0];
    resume([], !!val);
  }
  function concat(node, options, resume) {
    visit(node.elts[0], options, function (err1, val1) {
      let str = "";
      if (val1 instanceof Array) {
        val1.forEach(v => {
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
          elts: node.elts.slice(1),
        };
        list(node, options, function (err2, val2) {
          let val = [].concat(val2);
          val.unshift(val1);
          resume([].concat(err1).concat(err2), val);
        });
      });
    } else if (node.elts && node.elts.length > 0) {
      visit(node.elts[0], options, function (err1, val1) {
        let val = [val1];
        resume([].concat(err1), val);
      });
    } else {
      resume([], []);
    }
  }
  function icicle(node, options, resume) {
    resume([], {
      type: icicle,
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
      let key = val1;
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
      let errs = [];
      let vals = [];
      val1.forEach((val) => {
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
        resume([].concat(err1).concat(err2), {key: val1, val: val2});
      });
    });
  }
  function record(node, options, resume) {
    if (node.elts && node.elts.length > 1) {
      visit(node.elts[0], options, function (err1, val1) {
        node = {
          tag: "RECORD",
          elts: node.elts.slice(1),
        };
        record(node, options, function (err2, val2) {
          val2[val1.key] = val1.val;
          resume([].concat(err1).concat(err2), val2);
        });
      });
    } else if (node.elts && node.elts.length > 0) {
      visit(node.elts[0], options, function (err1, val1) {
        let val = {};
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
          elts: node.elts.slice(1),
        };
        exprs(node, options, function (err2, val2) {
          let val = [].concat(val2);
          val.unshift(val1);
          resume([].concat(err1).concat(err2), val);
        });
      });
    } else if (node.elts && node.elts.length > 0) {
      visit(node.elts[0], options, function (err1, val1) {
        let val = [val1];
        resume([].concat(err1), val);
      });
    } else {
      resume([], []);
    }
  }
  function program(node, options, resume) {
    if (!options) {
      options = {
      };
    }
    if (!options.data) {
      options.data = {};
    }
    visit(node.elts[0], options, function (err, val) {
      val =
        val &&
        val.length > 0 &&
        typeof val[val.length - 1] === "object" ? val[val.length - 1] : {};
      val.data = options.data;
      console.log("program() items.length=" + items.length);
      getData("Vp6sQ6YriJ", options.data.REFRESH, (err, items) => {
        if (err.length > 0) {
          console.log("ERROR err=" + err);
          resume(err, null);
        } else {
          console.log("program() items.length=" + items.length);
          // L131 query for L131 entries
          let saveIDs = {};
          let recordIDs = {};
          items.forEach(item => {
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
      let key = val1;
      if (false) {
        err1 = err1.concat(error("Argument must be a number.", node.elts[0]));
      }
      visit(node.elts[1], options, function (err2, val2) {
        let obj = val2;
        if (false) {
          err2 = err2.concat(error("Argument must be a number.", node.elts[1]));
        }
        resume([].concat(err1).concat(err2), Object.keys(obj)[key]);
      });
    });
  }
  function val(node, options, resume) {
    visit(node.elts[0], options, function (err1, val1) {
      let key = val1;
      if (false) {
        err1 = err1.concat(error("Argument must be a number.", node.elts[0]));
      }
      visit(node.elts[1], options, function (err2, val2) {
        let obj = val2;
        if (false) {
          err2 = err2.concat(error("Argument must be a number.", node.elts[1]));
        }
        resume([].concat(err1).concat(err2), obj[key]);
      });
    });
  }
  function len(node, options, resume) {
    visit(node.elts[0], options, function (err1, val1) {
      let obj = val1;
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
          style: val2,
        });
      });
    });
  }
  function styleV1(node, options, resume) {
    visit(node.elts[0], options, function (err1, val1) {
      visit(node.elts[1], options, function (err2, val2) {
        resume([].concat(err1).concat(err2), {
          style: val1,
          value: val2,
        });
      });
    });
  }
  return transform;
})();
mjAPI.config({
  MathJax: {
    SVG: {
      font: "Tex",
    }
  }
});
mjAPI.start();
function escapeXML(str) {
  return String(str)
    .replace(/&(?!\w+;)/g, "&amp;")
    .replace(/\n/g, " ")
    .replace(/\\/g, "\\\\")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
function tex2SVG(str, resume) {
  mjAPI.typeset({
    math: str,
    format: "inline-TeX",
    svg: true,
    ex: 6,
    width: 60,
    linebreaks: true,
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
    fn(lst[0], val1 => {
      mapList(lst.slice(1), fn, function (val2) {
        var val = [].concat(val1).concat(val2);
        resume(val);
      });
    });
  } else if (lst && lst.length > 0) {
    fn(lst[0], val1 => {
      let val = [];
      if (val1 !== null) {
        val = val.concat(val1);
      }
      resume(val);
    });
  } else {
    resume([]);
  }
}
let render = (function() {
  function render(val, resume) {
    // Do some rendering here.
    let data = val.data;
    let root = val.root;
    mapListToObject(Object.keys(data), (key, resume) => {
      let v = data[key];
      let itemID = v.id;
      let title = v.title;
      let notes = v.notes;
      if (v.index) {
        let index;
        if (root) {
          index = v.index[root];
          if (!index) {
            index = {};
          }
        } else {
          index = v.index;
        }
        fn(index, data => {
          resume(data);
        });
      } else {
        resume({});
      }
      function fn (obj, resume) {
        if (typeof obj !== "object") {
          resume({
            id: itemID,
            title: title,
            notes: notes,
          });
        } else {
          let svgObj = {
          };
          mapListToObject(Object.keys(obj), (key, resume) => {
            let val = obj[key];
            tex2SVG(key, (err, svgKey) => {
              fn(val, data => {
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
      let obj = {
      };
      if (o1 && o2 &&
          typeof o1 === "object" &&
          typeof o2 === "object") {
        Object.keys(o1).forEach(k => {
          // Merge properties in o1.
          if (typeof o1[k] === "object" && typeof o2[k] === "object") {
            // Both are objects so merge them.
            obj[k] = merge(o1[k], o2[k]);
          } else {
            // One ore both children are not objects, so assign o1 child here
            // and o2 child later.
            obj[k] = o1[k];
          }
        });
        Object.keys(o2).forEach(k => {
          // Now add the o2 only properties.
          if (!obj[k]) {
            // Don't have this property yet, so assign o2 child.
            obj[k] = o2[k];
          }
        });
      } else if (o1 && typeof o1 === "object") {
        assert(false);
        Object.keys(o2).forEach(k => {
          obj[k] = o1[k];
        });
      } else if (o2 && typeof o2 === "object") {
        assert(false);
        Object.keys(o2).forEach(k => {
          obj[k] = o2[k];
        });
      }
      return obj;
    }
    function mapListToObject(lst, fn, resume) {
      if (lst && lst.length > 1) {
        fn(lst[0], val1 => {
          mapListToObject(lst.slice(1), fn, val2 => {
            if (val1 !== null) {
              val2 = merge(val1, val2);
            }
            resume(val2);
          });
        });
      } else if (lst && lst.length > 0) {
        fn(lst[0], val1 => {
          resume(val1);
        });
      } else {
        resume({});
      }
    }
  }
  return render;
})();
export let compiler = (function () {
  exports.version = "v1.0.0";
  exports.compile = function compile(code, data, resume) {
    // Compiler takes an AST in the form of a node pool and transforms it into
    // an object to be rendered on the client by the viewer for this language.
    function setIDs(node, saveIDs, recordIDs, resume) {
      let ids = [];
      if (node !== null && typeof node === "object") {
        let index = node.index;
        delete node.index;
        let keys = Object.keys(node);
        mapList(keys, (k, resume) => {
          // Iterate over properties of node populating a list according to
          // this function.
          if (node[k].id) {
            resume([node[k].id]);
          } else {
            // If not leaf, drill down.
            setIDs(node[k], saveIDs, recordIDs, (ids) => {
              resume(ids);
            });
          };
        }, (ids) => {
          // Got codeIDs for children of current node. Now create a map of
          // saveIDs and codeIDs.
          let idMap = [];
          ids.forEach((id) => {
            // Always include the default, unsaved generator.
            idMap.push({
              isCode: true,
              saveID: "122+" + id + "+0",
              codeID: id,
            });
            if (saveIDs && saveIDs[id]) {
              saveIDs[id].forEach(saveID => {
                // for each saveID create a map from it to its codeID.
                idMap.push({
                  saveID: saveID,
                  codeID: id,
                  recordIDs: recordIDs[saveID],
                });
              });
            }
          });
          putData(idMap, (id) => {
            // Compile idMap using L113 and store its ID.
            node.link = id;
            node.index = index;
            resume(ids);
          });
        })
      }
    }
    try {
      let options = {
        data: data
      };
      transform(code, options, function (err, val) {
        if (err.length) {
          resume(err, val);
        } else {
          let data = val.data;
          let saveIDs = val.saveIDs;
          let recordIDs = val.recordIDs;
          let root = val.root;
          render(val, val => {
            setIDs(val, saveIDs, recordIDs, (ids) => {
              tex2SVG(root || "\\ldots", (e, svg) => {
                let root = {};
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
  }
})();

