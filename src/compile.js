/* Copyright (c) 2016, Art Compiler LLC */
/* @flow */

import {assert, message, messages, reserveCodeRange} from "./assert.js"
import * as mjAPI from "mathjax-node/lib/mj-single.js"

reserveCodeRange(1000, 1999, "compile");
messages[1001] = "Node ID %1 not found in pool.";
messages[1002] = "Invalid tag in node with Node ID %1.";
messages[1003] = "No async callback provided.";
messages[1004] = "No visitor method defined for '%1'.";

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
      let data = options.data;
      resume(err, data);
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
let render = (function() {
  function render(val, resume) {
    // Do some rendering here.
    mapListToObject(Object.keys(val), (key, resume) => { 
      let v = val[key];
      let itemID = v.id;
      let title = v.title
      if (v.index) {
        fn(v.index, data => {
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
          });
        } else {
          let svgObj = {};
          mapListToObject(Object.keys(obj), (key, resume) => {
            let val = obj[key];
            tex2SVG(key, (err, svgKey) => {
              fn(val, data => {
                svgObj[escapeXML(svgKey)] = data;
                resume(svgObj);
              });
            });
          }, resume);
        }
      }
    }, resume);
    function mapList(lst, fn, resume) {
      if (lst && lst.length > 1) {
        fn(lst[0], val1 => {
          mapList(lst.slice(1), fn, function (val2) {
            var val = [].concat(val2);
            if (val1 !== null) {
              val.unshift(val1);
            }
            resume(val);
          });
        });
      } else if (lst && lst.length > 0) {
        fn(lst[0], val1 => {
          let val = [];
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
      let obj = {};
      if (o1 && o2 &&
          typeof o1 === "object" &&
          typeof o2 === "object") {
        Object.keys(o1).forEach(k => {
          // Merge properties in o1.
          if (typeof o1[k] === "object" && typeof o2[k] === "object") {
            obj[k] = merge(o1[k], o2[k]);
          } else {
            obj[k] = o1[k];
          }
        });
        Object.keys(o2).forEach(k => {
          // Now add the o2 only properties.
          if (!obj[k]) {
            obj[k] = o2[k];
          }
        });
      } else if (o1 && typeof o1 === "object") {
        Object.keys(o2).forEach(k => {
          obj[k] = o1[k];
        });
      } else if (o2 && typeof o2 === "object") {
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
    try {
      let options = {
        data: data
      };
      transform(code, options, function (err, val) {
        if (err.length) {
          resume(err, val);
        } else {
          render(val, function (val) {
            tex2SVG("\\ldots", (e, svg) => {
              let root = {};
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
  }
})();

