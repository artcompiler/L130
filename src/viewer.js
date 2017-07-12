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

  let data = {
    "flare": {
      "analytics": {
        "cluster": {
          "AgglomerativeCluster": 3938,
          "CommunityStructure": 3812,
          "HierarchicalCluster": 6714,
          "MergeEdge": 743
        },
        "graph": {
          "BetweennessCentrality": 3534,
          "LinkDistance": 5731,
          "MaxFlowMinCut": 7840,
          "ShortestPaths": 5914,
          "SpanningTree": 3416
        },
        "optimization": {
          "AspectRatioBanker": 7074
        }
      },
      "animate": {
        "Easing": 17010,
        "FunctionSequence": 5842,
        "interpolate": {
          "ArrayInterpolator": 1983,
          "ColorInterpolator": 2047,
          "DateInterpolator": 1375,
          "Interpolator": 8746,
          "MatrixInterpolator": 2202,
          "NumberInterpolator": 1382,
          "ObjectInterpolator": 1629,
          "PointInterpolator": 1675,
          "RectangleInterpolator": 2042
        },
        "ISchedulable": 1041,
        "Parallel": 5176,
        "Pause": 449,
        "Scheduler": 5593,
        "Sequence": 5534,
        "Transition": 9201,
        "Transitioner": 19975,
        "TransitionEvent": 1116,
        "Tween": 6006
      },
      "data": {
        "converters": {
          "Converters": 721,
          "DelimitedTextConverter": 4294,
          "GraphMLConverter": 9800,
          "IDataConverter": 1314,
          "JSONConverter": 2220
        },
        "DataField": 1759,
        "DataSchema": 2165,
        "DataSet": 586,
        "DataSource": 3331,
        "DataTable": 772,
        "DataUtil": 3322
      },
      "display": {
        "DirtySprite": 8833,
        "LineSprite": 1732,
        "RectSprite": 3623,
        "TextSprite": 10066
      },
      "flex": {
        "FlareVis": 4116
      },
      "physics": {
        "DragForce": 1082,
        "GravityForce": 1336,
        "IForce": 319,
        "NBodyForce": 10498,
        "Particle": 2822,
        "Simulation": 9983,
        "Spring": 2213,
        "SpringForce": 1681
      },
      "query": {
        "AggregateExpression": 1616,
        "And": 1027,
        "Arithmetic": 3891,
        "Average": 891,
        "BinaryExpression": 2893,
        "Comparison": 5103,
        "CompositeExpression": 3677,
        "Count": 781,
        "DateUtil": 4141,
        "Distinct": 933,
        "Expression": 5130,
        "ExpressionIterator": 3617,
        "Fn": 3240,
        "If": 2732,
        "IsA": 2039,
        "Literal": 1214,
        "Match": 3748,
        "Maximum": 843,
        "methods": {
          "add": 593,
          "and": 330,
          "average": 287,
          "count": 277,
          "distinct": 292,
          "div": 595,
          "eq": 594,
          "fn": 460,
          "gt": 603,
          "gte": 625,
          "iff": 748,
          "isa": 461,
          "lt": 597,
          "lte": 619,
          "max": 283,
          "min": 283,
          "mod": 591,
          "mul": 603,
          "neq": 599,
          "not": 386,
          "or": 323,
          "orderby": 307,
          "range": 772,
          "select": 296,
          "stddev": 363,
          "sub": 600,
          "sum": 280,
          "update": 307,
          "variance": 335,
          "where": 299,
          "xor": 354,
          "_": 264
        },
        "Minimum": 843,
        "Not": 1554,
        "Or": 970,
        "Query": 13896,
        "Range": 1594,
        "StringUtil": 4130,
        "Sum": 791,
        "Variable": 1124,
        "Variance": 1876,
        "Xor": 1101
      },
      "scale": {
        "IScaleMap": 2105,
        "LinearScale": 1316,
        "LogScale": 3151,
        "OrdinalScale": 3770,
        "QuantileScale": 2435,
        "QuantitativeScale": 4839,
        "RootScale": 1756,
        "Scale": 4268,
        "ScaleType": 1821,
        "TimeScale": 5833
      },
      "util": {
        "Arrays": 8258,
        "Colors": 10001,
        "Dates": 8217,
        "Displays": 12555,
        "Filter": 2324,
        "Geometry": 10993,
        "heap": {
          "FibonacciHeap": 9354,
          "HeapNode": 1233
        },
        "IEvaluable": 335,
        "IPredicate": 383,
        "IValueProxy": 874,
        "math": {
          "DenseMatrix": 3165,
          "IMatrix": 2815,
          "SparseMatrix": 3366
        },
        "Maths": 17705,
        "Orientation": 1486,
        "palette": {
          "ColorPalette": 6367,
          "Palette": 1229,
          "ShapePalette": 2059,
          "SizePalette": 2291
        },
        "Property": 5559,
        "Shapes": 19118,
        "Sort": 6887,
        "Stats": 6557,
        "Strings": 22026
      },
      "vis": {
        "axis": {
          "Axes": 1302,
          "Axis": 24593,
          "AxisGridLine": 652,
          "AxisLabel": 636,
          "CartesianAxes": 6703
        },
        "controls": {
          "AnchorControl": 2138,
          "ClickControl": 3824,
          "Control": 1353,
          "ControlList": 4665,
          "DragControl": 2649,
          "ExpandControl": 2832,
          "HoverControl": 4896,
          "IControl": 763,
          "PanZoomControl": 5222,
          "SelectionControl": 7862,
          "TooltipControl": 8435
        },
        "data": {
          "Data": 20544,
          "DataList": 19788,
          "DataSprite": 10349,
          "EdgeSprite": 3301,
          "NodeSprite": 19382,
          "render": {
            "ArrowType": 698,
            "EdgeRenderer": 5569,
            "IRenderer": 353,
            "ShapeRenderer": 2247
          },
          "ScaleBinding": 11275,
          "Tree": 7147,
          "TreeBuilder": 9930
        },
        "events": {
          "DataEvent": 2313,
          "SelectionEvent": 1880,
          "TooltipEvent": 1701,
          "VisualizationEvent": 1117
        },
        "legend": {
          "Legend": 20859,
          "LegendItem": 4614,
          "LegendRange": 10530
        },
        "operator": {
          "distortion": {
            "BifocalDistortion": 4461,
            "Distortion": 6314,
            "FisheyeDistortion": 3444
          },
          "encoder": {
            "ColorEncoder": 3179,
            "Encoder": 4060,
            "PropertyEncoder": 4138,
            "ShapeEncoder": 1690,
            "SizeEncoder": 1830
          },
          "filter": {
            "FisheyeTreeFilter": 5219,
            "GraphDistanceFilter": 3165,
            "VisibilityFilter": 3509
          },
          "IOperator": 1286,
          "label": {
            "Labeler": 9956,
            "RadialLabeler": 3899,
            "StackedAreaLabeler": 3202
          },
          "layout": {
            "AxisLayout": 6725,
            "BundledEdgeRouter": 3727,
            "CircleLayout": 9317,
            "CirclePackingLayout": 12003,
            "DendrogramLayout": 4853,
            "ForceDirectedLayout": 8411,
            "IcicleTreeLayout": 4864,
            "IndentedTreeLayout": 3174,
            "Layout": 7881,
            "NodeLinkTreeLayout": 12870,
            "PieLayout": 2728,
            "RadialTreeLayout": 12348,
            "RandomLayout": 870,
            "StackedAreaLayout": 9121,
            "TreeMapLayout": 9191
          },
          "Operator": 2490,
          "OperatorList": 5248,
          "OperatorSequence": 4190,
          "OperatorSwitch": 2581,
          "SortOperator": 2023
        },
        "Visualization": 16540
      }
    }
  };

  // Graffiticode looks for this React class named Viewer. The compiled code is
  // passed via props in the renderer.
  var Viewer = React.createClass({
    componentDidMount () {
    },
    componentDidUpdate () {
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

      let root = d3.hierarchy(d3.entries(data)[0], function(d) {
          return d3.entries(d.value)
        })
        .sum(function(d) { return d.value })
        .sort(function(a, b) { return b.value - a.value; });

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
        .attr("fill", function(d) { return color((d.children ? d : d.parent).data.key); })
        .on("click", clicked);

      cell.append("image")
        .attr("x", function(d) { return d.x0; })
        .attr("y", function(d) { return d.y0; })
        .attr("width", function(d) { return d.x1 - d.x0; })
        .attr("height", function(d) { return d.y1 - d.y0; })
        .attr("href", (d) => {
          let href = "data:image/svg+xml;utf8," +
            "<svg width='100%' height='100%' xmlns='http://www.w3.org/2000/svg'>" +
            "<rect width='100%' height='100%' stroke='#fff' " +
                  "fill='" + color((d.children ? d : d.parent).data.key) +
            "'/>" +
            "</svg>"
          return href;
        })
        .on("click", clicked);

      function clicked(d) {
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
          .attr("x", function(d) { return x(d.x0); })
          .attr("y", function(d) { return y(d.y0); })
          .attr("width", function(d) { return x(d.x1) - x(d.x0); })
          .attr("height", function(d) { return y(d.y1) - y(d.y0); });
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

