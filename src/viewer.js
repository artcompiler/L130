/* Copyright (c) 2016, Art Compiler LLC */
/* @flow */
import {assert, message, messages, reserveCodeRange} from "./assert";
import * as React from "react";
import * as d3 from "d3";

window.gcexports.viewer = (function () {
  function capture(el) {
    return null;
  }
  function loadScript(src, resume) {
    var script = document.createElement("script");
    script.onload = resume;
    script.src = src;
    script.type = "text/javascript";
    document.getElementsByTagName("head")[0].appendChild(script);
  }
  function loadStyle(src, resume) {
    var link = document.createElement("link");
    link.onload = resume;
    link.href = src;
    link.rel = "stylesheet";
    document.getElementsByTagName("head")[0].appendChild(link);
  }
  function render(nodes, props) {
    let elts = [];
    if (!(nodes instanceof Array)) {
      // HACK not all arguments are arrays. Not sure they should be.
      nodes = [nodes];
    }
    nodes.forEach((n, i) => {
      let args = [];
      if (n.args) {
        args = render.call(this, n.args, props);
      }
      if (typeof n === "object") {
        n.style = n.style ? n.style : {};
      }
      switch (n.type) {
      case "grid":
        elts.push(
          <div className="container" key={i} style={n.style} {...n.attrs}>
            {args}
          </div>
        );
        break;
      case "table":
        elts.push(
          <table key={i} style={n.style} {...n.attrs}>
            {args}
          </table>
        );
        break;
      case "thead":
        elts.push(
          <thead key={i} style={n.style} {...n.attrs}>
            {args}
          </thead>
        );
        break;
      case "tbody":
        elts.push(
          <tbody className="container" key={i} style={n.style} {...n.attrs}>
            {args}
          </tbody>
        );
        break;
      case "tr":
        elts.push(
          <tr key={i} style={n.style} {...n.attrs}>
            {args}
          </tr>
        );
        break;
      case "th":
        elts.push(
          <th key={i} style={n.style} {...n.attrs}>
            {args}
          </th>
        );
        break;
      case "td":
        elts.push(
          <td key={i} style={n.style} {...n.attrs}>
            {args}
          </td>
        );
        break;
      case "row":
        elts.push(
          <div className="row" key={i} style={n.style} {...n.attrs}>
            {args}
          </div>
        );
        break;
      case "oneColumn":
        elts.push(
          <div className="one column" key={i} style={n.style} {...n.attrs}>
            {args}
          </div>
        );
        break;
      case "twoColumns":
        elts.push(
          <div className="two columns" key={i} style={n.style} {...n.attrs}>
            {args}
          </div>
        );
        break;
      case "threeColumns":
        elts.push(
          <div className="three columns" key={i} style={n.style} {...n.attrs}>
            {args}
          </div>
        );
        break;
      case "fourColumns":
        elts.push(
          <div className="four columns" key={i} style={n.style} {...n.attrs}>
            {args}
          </div>
        );
        break;
      case "fiveColumns":
        elts.push(
          <div className="five columns" key={i} style={n.style} {...n.attrs}>
            {args}
          </div>
        );
        break;
      case "sixColumns":
        elts.push(
          <div className="six columns" key={i} style={n.style} {...n.attrs}>
            {args}
          </div>
        );
        break;
      case "sevenColumns":
        elts.push(
          <div className="seven columns" key={i} style={n.style} {...n.attrs}>
            {args}
          </div>
        );
        break;
      case "eightColumns":
        elts.push(
          <div className="eight columns" key={i} style={n.style} {...n.attrs}>
            {args}
          </div>
        );
        break;
      case "nineColumns":
        elts.push(
          <div className="nine columns" key={i} style={n.style} {...n.attrs}>
            {args}
          </div>
        );
        break;
      case "tenColumns":
        elts.push(
          <div className="ten columns" key={i} style={n.style} {...n.attrs}>
            {args}
          </div>
        );
        break;
      case "elevenColumns":
        elts.push(
          <div className="eleven columns" key={i} style={n.style} {...n.attrs}>
            {args}
          </div>
        );
        break;
      case "twelveColumns":
        if (n.id === "math") {
          elts.push(
            <div className="twelve columns" key={i} style={n.style} {...n.attrs}>
              <ProblemViewer {...props} />
            </div>
          );
        } else {
          elts.push(
            <div className="twelve columns" key={i} style={n.style} {...n.attrs}>
              {args}
            </div>
          );
        }
        break;
      case "oneThirdColumn":
        elts.push(
          <div className="one-third column" key={i} style={n.style} {...n.attrs}>
            {args}
          </div>
        );
        break;
      case "twoThirdsColumn":
        elts.push(
          <div className="two-thirds column" key={i} style={n.style} {...n.attrs}>
            {args}
          </div>
        );
        break;
      case "oneHalfColumn":
        elts.push(
          <div className="one-half column" key={i} style={n.style} {...n.attrs}>
            {args}
          </div>
        );
        break;
      case "h1":
        elts.push(
          <h1 key={i} style={n.style} {...n.attrs}>
            {args}
          </h1>
        );
        break;
      case "h2":
        elts.push(
          <h2 key={i} style={n.style} {...n.attrs}>
            {args}
          </h2>
        );
        break;
      case "h3":
        elts.push(
          <h3 key={i} style={n.style} {...n.attrs}>
            {args}
          </h3>
        );
        break;
      case "h4":
        if (n.attrs.id === "title" && props.obj.title) {
          elts.push(
              <h4 key={i} style={n.style} {...n.attrs}>
              {splitValue(props.obj.title)}
            </h4>
          );
        } else {
          elts.push(
              <h4 key={i} style={n.style} {...n.attrs}>
              {args}
            </h4>
          );
        }
        break;
      case "h5":
        elts.push(
          <h5 key={i} style={n.style} {...n.attrs}>
            {args}
          </h5>
        );
        break;
      case "h6":
        if (n.attrs.id === "notes" && props.obj.notes) {
          elts.push(
              <h6 key={i} style={n.style} {...n.attrs}>
              {splitValue(props.obj.notes)}
            </h6>
          );
        } else {
          elts.push(
              <h6 key={i} style={n.style} {...n.attrs}>
              {args}
            </h6>
          );
        }
        break;
      case "br":
        elts.push(
          <br />
        );
        break;
      case "code":
        n.style.fontSize = n.style && n.style.fontSize ? n.style.fontSize : "90%";
        elts.push(
          <pre key={i} style={n.style} {...n.attrs}><code>
            {args}
          </code></pre>
        );
        break;
      case "cspan":
        elts.push(
          <code key={i} style={n.style} {...n.attrs}>
            {args}
          </code>
        );
        break;
      case "textarea":
        if (n.attrs.id === "context" && props.obj.context) {
          elts.push(
              <textarea className="u-full-width" key={i} rows="2"
                onBlur={onUpdate}
                onChange={onChange}
                style={n.style} {...n.attrs}
//                defaultValue={props.obj.context}
              >
              </textarea>
          );
        } else {
          elts.push(
            <textarea className="u-full-width" key={i} rows="1"
                    onBlur={onUpdate}
                    onChange={onChange}
                    style={n.style} {...n.attrs}>
            </textarea>
          );
        }
        break;
      case "button":
        elts.push(
          <button
            key={i}
            onClick={this.clickHandler}
            style={n.style}
            {...n.attrs}>
            {args}
          </button>
        );
        break;
      case "ul":
        elts.push(
          <ul key={i} style={n.style} {...n.attrs}>
            {args}
          </ul>
        );
        break;
      case "ol":
        elts.push(
          <ol key={i} style={n.style} {...n.attrs}>
            {args}
          </ol>
        );
        break;
      case "li":
        elts.push(
          <li key={i} style={n.style} {...n.attrs}>
            {args}
          </li>
        );
        break;
      case "img":
        elts.push(
          <img key={i} style={n.style} {...n.attrs}/>
        );
        break;
      case "a":
        elts.push(
          <a key={i} style={n.style} {...n.attrs}>
            {args}
          </a>
        );
        break;
      case "title":
        document.title = n.value;
        break;
      case "graffito":
        // elts.push(
        //   <div key={i} style={{"position": "relative"}}>
        //     <iframe style={n.style} {...n.attrs}/>
        //     <a href={n.attrs.src} target="L116-CHILD" style={{
        //       "position": "absolute",
        //       "top": 0,
        //       "left": 0,
        //       "display": "inline-block",
        //       "width": "100%",
        //       "height": "100%",
        //       "zIndex": 5}}></a>
        //   </div>
        // );
        elts.push(
          <div key={i} style={{"position": "relative"}}>
            <iframe style={n.style} {...n.attrs}/>
          </div>
        );
        break;
      case "str":
        elts.push(<span className="u-full-width" key={i} style={n.style}>{""+n.value}</span>);
        break;
      default:
        // Not a node, so push the value.
        elts.push(n);
        break;
      }
    });
    return elts;
  }

  // Graffiticode looks for this React class named Viewer. The compiled code is
  // passed via props in the renderer.
  var Viewer = React.createClass({
    componentDidMount () {
      var width = 960,
          height = 500;
      var x = d3.scaleLinear()
        .range([0, width]);
      var y = d3.scaleLinear()
        .range([0, height]);
      var color = d3.scaleOrdinal(d3.schemeCategory20c);
      var partition = d3.partition()
        .size([width, height])
        .padding(0)
        .round(true);
      var svg = d3.select(".container").append("svg")
        .attr("width", width)
        .attr("height", height);

      let data = this.props.obj;

      let root = d3.hierarchy(d3.entries(data)[0], (d) => {
          return d3.entries(d.value.id ? d.value.id : d.value)
        })
        .sum(function(d) {
          return d.value.id === undefined ? d.value : 1;
        })
        .sort(function(a, b) {
          return b.value - a.value;
        });

      partition(root);

      let cell =
        svg.selectAll(".node")
        .data(root.descendants())
        .enter().append("g")
        .attr("class", "node");

      cell.append("rect")
        .attr("x", function(d) { return d.x0; })
        .attr("y", function(d) { return d.y0; })
        .attr("width", function(d) { return d.x1 - d.x0; })
        .attr("height", function(d) { return d.y1 - d.y0; })
        .attr("stroke", "#fff")
        .attr("fill", (d) => { return "#B0C4DE"; })
        .on("click", clicked);

      cell.append("title")
        .text(d => {
          return d.data.value.title ? d.data.value.title : "";
        });

      let size = 10;
      cell.append("image")
        .attr("x", function(d) { return d.x0 + (d.x1 - d.x0 - getWidth(d.data.key)) / 2; })
        .attr("y", function(d) { return d.y0 + (d.y1 - d.y0 - getHeight(d.data.key)) / 2; })
        .attr("width", function(d) {
          return getWidth(d.data.key)
        })
        .attr("height", function(d) { return getHeight(d.data.key); })
        .attr("href", (d) => {
          let href = "data:image/svg+xml;utf8," + unescapeXML(d.data.key);
          return href;
        })
        .style("opacity", function(d) {
          return getWidth(d.data.key) < d.x1 - d.x0 ? 1 : 0;
        })
        .on("click", clicked);


      function getWidth(str) {
        var EX = 6; // px
        var unit = 1;
        var begin = str.indexOf("width=") + 12;  // width=&quot;
        str = str.substring(begin);
        var end = str.indexOf("px");
        if (end < 0) {
          end = str.indexOf("ex");
          unit = EX;
        }
        str = str.substring(0, end);
        return +str * unit;
      }

      function getHeight(str) {
        var EX = 6; // px
        var unit = 1;
        var begin = str.indexOf("height") + 13;  // height=&quot;
        str = str.substring(begin);
        var end = str.indexOf("px");
        if (end < 0) {
          end = str.indexOf("ex");
          unit = EX;
        }
        str = str.substring(0, end);
        return +str * unit;
      }

      function unescapeXML(str) {
        return String(str)
          .replace(/&amp;/g, "&")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&quot;/g, "'");
      }

      function clicked(d) {
        if (d.data.value.id !== undefined) {
          // We have a leaf node.
          window.open("/item?id=0+" + d.data.value.id + "+0+" + "vwbHbKv4Sg", "/lang?id=122");
        } else {
          x.domain([d.x0, d.x1]);
          y.domain([d.y0, height]).range([d.depth ? 20 : 0, height]);
          cell.selectAll("rect")
            .transition()
            .duration(250)
            .attr("x", function(d) { return x(d.x0); })
            .attr("y", function(d) { return y(d.y0); })
            .attr("width", function(d) { return x(d.x1) - x(d.x0); })
            .attr("height", function(d) { return y(d.y1) - y(d.y0); });
          cell.selectAll("image")
            .transition()
            .duration(250)
            .attr("x", function(d) {
              return x(d.x0) + (x(d.x1) - x(d.x0) - getWidth(d.data.key)) / 2;
            })
            .attr("y", function(d) {
              return y(d.y0) + (y(d.y1) - y(d.y0) - getHeight(d.data.key)) / 2;
            })
            .style("opacity", function(d) {
              return (
                getWidth(d.data.key) > x(d.x1) - x(d.x0) ||
                  getHeight(d.data.key) > y(d.y1) - y(d.y0) ? 0 : 1
              );
            })
        }
      }
    },
    render: function () {
      // If you have nested components, make sure you send the props down to the
      // owned components.
      let props = this.props;
      var elts = []; //render.call(this, this.ui, props, this.dirty);
      return (
        <div className="section">
          <div className="container">
            {elts}
          </div>
        </div>
      );
    },
  });
  return {
    capture: capture,
    Viewer: Viewer
  };
})();

