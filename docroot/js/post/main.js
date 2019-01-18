class CFDData {
  constructor(rawData) {
    this.readCFDData(rawData)
  }
  readCFDData(rawData) {
    const datas = rawData.trim().split(/[\s,="']+/);
    let colum_val =[];
    let zone = {};
    let r = 0;
    let plotType = '2D';

    if (!datas[0].toLowerCase().match(/^variables/)) {
      // Not plot3D type
      return -1;    
    } else { // plot3D type
      for(let i = 0; i < datas.length; i++) {
        if (datas[i].toLowerCase().match(/^variables/)) {
          let j = 0;
          while(!datas[i+1].toLowerCase().match(/^zone/)){
            i = i + 1;
            //console.log(datas[i])
            let replaced = datas[i].replace(/\W*/g,'').toLowerCase();
            //console.log(replaced)
            if ( replaced ) {
              colum_val[j++] = replaced;
            }
          }
        } else if (datas[i].toLowerCase().match('zone')){
          i=i+1;
          let i_flag = false, j_flag = false;
  
          //console.log(datas[i]);
          while ( datas[i].replace(/\W+/g,'').match(/^[a-zA-Z]/) ) {
            let key = datas[i].replace(/\W+/g,'').toLowerCase();
            let value = "";
            while ( ! value ) {
              value = datas[++i].replace(/\W+/g,'').toLowerCase();
            }
            if( key.match(/[i]/)){
              zone[key] = parseInt(value);
              i_flag = true;
            } else if( key.match(/[j]/)){
              zone[key] = parseInt(value);
              j_flag = true;
  
            } else if ( key.match(/[tf]/)) {
              zone[key] = value;
            }
            i++;
          }
          i--;
  
          if (i_flag && j_flag ) {
            plotType = '3D';
          } else {
            plotType = '2D';
            for (let p = 0; p < colum_val.length; p++) {
              this[colum_val[p]] = new Array();
            }
          }
        } else {     //read data
          if (plotType == '2D'){
            for (let p = 0; p < colum_val.length; p++) {
              this[colum_val[p]][r] = parseFloat(datas[i++]);
            }
            i--;  r++;
          } else if (plotType == '3D') {
            let rr=0;
  
            for (let k = 0; k < zone.j; k++) {
              //console.log(k);
              for (let q = 0; q < zone.i; q++) {
                for (let p = 0; p < colum_val.length; p++) {
                  if ((k==0) && (q==0) ){            // 객체 원소 생성
                    this[colum_val[p]] = new Array();
                  }
                  this[colum_val[p]][rr] = parseFloat(datas[i++]);
                }
                rr++;
              }
            }
            this.x_langth = zone.i;
            this.y_langth = zone.j;
  
          } else {
            return -1;
          }
        }
      }

      this.zone = zone;
      this.varlist = colum_val;
      this.plotType = plotType;
  
      const absMaxX = Math.max.apply(null, this[colum_val[0]].map(Math.abs));
      const absMaxY = Math.max.apply(null, this[colum_val[1]].map(Math.abs));
      this.maxSize = Math.max(absMaxX, absMaxY);
    }
  }
} //end class


class Chart {
  constructor(canvas, rltDatas){
    this.canvas = canvas;
    this.rltDatas = rltDatas;
    const firstValue = this.createSelectOption();
    this.draw(firstValue);
  }
  createSelectOption(){
    var  data = this.rltDatas[0].varlist;
    data = data.filter(el => el !== "x")
    data = data.filter(el => el !== "y")

    var select = d3.select('#contourSelect').on('change', onchange);
    select.selectAll('option')
          .data(data).enter()
          .append('option')
          .text(function (d) { return d; });
    return data[0];
  }

  draw (plotValue){
    this.createSvg();
    this.createScales();
    this.getThresholds(plotValue);
    this.addContours(plotValue);
//    this.addVectorfield();
    this.addZoom();
    this.initView();
  }
  redraw (plotValue){
    const svg = d3.select("#mainCanvas");
    this.getThresholds(plotValue);
    this.addContours(plotValue);

    var gX = this.gX;
    var gY = this.gY;

    this.zoom.on("zoom", zoomed);

    svg.call(this.zoom);

    var contourAll = svg.selectAll(".contour"); 
    var vectorAll = svg.selectAll(".vector");
    
    var x = this.x;
    var y = this.y;
    var xAxis = this.xAxis;
    var yAxis = this.yAxis;

    contourAll.attr("transform", zoomData);
    vectorAll.attr("transform", zoomData);
    gX.call(xAxis.scale(zoomData.rescaleX(x)));
    gY.call(yAxis.scale(zoomData.rescaleY(y)));

  
    function zoomed() {
      contourAll.attr("transform", d3.event.transform);
      vectorAll.attr("transform", d3.event.transform);
      gX.call(xAxis.scale(d3.event.transform.rescaleX(x)));
      gY.call(yAxis.scale(d3.event.transform.rescaleY(y)));
      zoomData = d3.event.transform;
    }
  }
  createScales() {        
 //   const width = this.winWidth - this.margin.left - this.margin.right,
 //        height = this.winHeight - this.margin.top - this.margin.bottom;
    const width = this.width;
    const height = this.height;

    const maxSize = d3.max(this.rltDatas.map( d => d.maxSize));

    this.canvasSize = maxSize * 4;
    this.ratioWH = width / height;

    this.x = d3.scaleLinear()
      .domain([-this.canvasSize * this.ratioWH, this.canvasSize * this.ratioWH])
      .range([0, width]);
    this.y = d3.scaleLinear()
      .domain([-this.canvasSize, this.canvasSize])
      .range([height, 0]);

    this.xAxis = d3.axisBottom(this.x)
      .ticks(width / height * 4) //
      .tickSize(height)
      .tickPadding(8 - height);
  
    this.yAxis = d3.axisRight(this.y)
      .ticks(4)
      .tickSize(width)
      .tickPadding(8 - width);
  }
  createSvg(){
    this.winWidth = parseInt(d3.select(this.canvas).style('width'));
    this.winHeight = parseInt(d3.select(this.canvas).style('height'));

    // set the dimensions and margins of the graph
    this.margin = {
      top: 0,
      right: 10,
      bottom: 10,
      left: 10
    };
    this.width = this.winWidth - this.margin.left - this.margin.right,
    this.height = this.winHeight - this.margin.top - this.margin.bottom;
 //   this.width = width;
 //   this.height = height;

    document.querySelector(this.canvas).innerHTML = '';  //canvas clean
    const svg = d3.select(this.canvas).append("svg")
      .attr("id", "mainCanvas")
      .attr("width", this.winWidth)
      .attr("height", this.winHeight);

    this.plot = svg.append("g")
      .attr("class", "chart")
      .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
    
    this.plot.append("defs")
      .append("clipPath")
      .attr("id", "clip")
      .append("rect")
      .attr("width", this.width)
      .attr("height", this.height);
  }

  initView (){
    const svg = d3.select("#mainCanvas");
    const width = this.winWidth - this.margin.left - this.margin.right,
          height = this.winHeight - this.margin.top - this.margin.bottom;
    const xMin = d3.min(this.rltDatas.map( (d) => d3.min(d.x))),
          xMax = d3.max(this.rltDatas.map( (d) => d3.max(d.x))),
          yMin = d3.min(this.rltDatas.map( (d) => d3.min(d.y))),
          yMax = d3.max(this.rltDatas.map( (d) => d3.max(d.y)));
    var zoom = this.zoom;
    var x = this.x, y = this.y;
    const dx = xMax - xMin,
          dy = yMax - yMin,
          xx = (xMax + xMin)/2,
          yy = (yMax + yMin)/2,
          scale = Math.min(0.9 * 2 * this.canvasSize / dx, 0.9 * 2 * this.canvasSize / dy),
          translate = [width / 2 - scale * x(xx), height / 2 - scale * y(yy)];
    svg.transition()
        .duration(0)
        .call(zoom.transform, d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale));
  }

  getThresholds (plotValue){
    const min = this.rltDatas.map(d => d3.min(d[plotValue]) );
    const max = this.rltDatas.map(d => d3.max(d[plotValue]) );

    this.thresholds = d3.range( d3.min(min), d3.max(max), (d3.max(max) - d3.min(min))/21) ;
  }
  addVectorfield(){
    var x = this.x;
    var y = this.y;

    for ( let ii in this.rltDatas ) {
      let rltData = this.rltDatas[ii];

      const id = 'vector' + ii;
      if (document.querySelector(id)) {
        var vectorGroup = d3.select(id);
        document.querySelector(id).innerHTML = "";
      } else{
        var vectorGroup = this.plot.append("g")
           .attr("id", id)
           .attr("class", "vector")
           .attr("clip-path", "url(#clip)");
      }
      
      for(let jj in rltData.x ){
        var d = {};
        d.x = rltData.x[jj];
        d.y = rltData.y[jj];
        d.u = rltData.u[jj];
        d.v = rltData.v[jj];
 //       d.magnitude = Math.sqrt(d.u*d.u + d.v*d.v);
 //       d.u /= d.magnitude;
 //       d.v /= d.magnitude;
        d.u *= 0.05;
        d.v *= 0.05;

        vectorGroup.append("path")
                  .attr("class", "vectorPath")
                  .attr("d", "M" + x(d.x) + " " + y(d.y) + " L" + x(d.x + d.u) + " " + y(d.y + d.v) );
      }

    }
    
  }

  addContours(plotValue){
    var x = this.x;
    var y = this.y;

    for ( let ii in this.rltDatas ) {
      let rltData = this.rltDatas[ii];

      const id = '#part' + ii;
      if (document.querySelector(id)) {
        var contourPath = d3.select(id);
        document.querySelector(id).innerHTML = "";
      } else{
        var contourPath = this.plot.append("g")
           .attr("id", "part" + ii)
           .attr("clip-path", "url(#clip)");
      }


//      document.querySelector(id).innerHTML = "";

      // Structured (n * m) grid of data. Point coordinates are (xgrid, ygrid) 
      var n = rltData.x_langth , m = rltData.y_langth;
      var values = rltData[plotValue];
      var xgrid = rltData.x;
      var ygrid = rltData.y;

      // configure a projection to map the contour coordinates returned by
      // d3.contours (px,py) to the input data (xgrid,ygrid)
      var projection = d3.geoTransform({
        point: function(px, py) {
          var xfrac, yfrac, xnow, ynow;
          var xidx, yidx, idx0, idx1, idx2, idx3;
          // remove the 0.5 offset that comes from d3-contour
          px=px-0.5;
          py=py-0.5;
          // clamp to the limits of the xgrid and ygrid arrays (removes "bevelling" from outer perimeter of contours)
          if ( px < 0) { px = 0;} // px < 0 ? px = 0 : px;
          if ( py < 0) { py = 0;} // py < 0 ? py = 0 : py;
          if ( px > (n-1) ) { px = n-1; } // px > (n-1) ? px = n-1 : px;
          if ( py > (m-1) ) { py = m-1; } // py > (m-1) ? py = m-1 : py;
          // xidx and yidx are the array indices of the "bottom left" corner
          // of the cell in which the point (px,py) resides
          xidx = Math.floor(px);
          yidx = Math.floor(py); 
          if ( xidx == (n-1) ) { xidx = n-2; } // xidx == (n-1) ? xidx = n-2 : xidx;
          if ( yidx == (m-1) ) { yidx = m-2; } // yidx == (m-1) ? yidx = m-2 : yidx;
          // xfrac and yfrac give the coordinates, between 0 and 1,
          // of the point within the cell 
          xfrac = px-xidx;
          yfrac = py-yidx;
          // indices of the 4 corners of the cell
          idx0 = xidx + yidx*n;
          idx1 = idx0 + 1;
          idx2 = idx0 + n;
          idx3 = idx2 + 1;
          // bilinear interpolation to find projected coordinates (xnow,ynow)
          // of the current contour coordinate
          xnow = (1-xfrac)*(1-yfrac)*xgrid[idx0] + xfrac*(1-yfrac)*xgrid[idx1] + yfrac*(1-xfrac)*xgrid[idx2] + xfrac*yfrac*xgrid[idx3];
          ynow = (1-xfrac)*(1-yfrac)*ygrid[idx0] + xfrac*(1-yfrac)*ygrid[idx1] + yfrac*(1-xfrac)*ygrid[idx2] + xfrac*yfrac*ygrid[idx3];
          this.stream.point(x(xnow), y(ynow));
        }
      });
        
      // array of threshold values 
      var thresholds = this.thresholds;

      // color scale  
      var color = d3.scaleLinear()
          .domain(d3.extent(thresholds))
          .interpolate(function() { return d3.interpolateRdBu; });  
        
      // initialise contours
      var contours = d3.contours()
          .size([n, m])
          .smooth(true)
          .thresholds(thresholds);
        
      // make and project the contours
      contourPath.selectAll("path")
          .data(contours(values))
          .enter().append("path")
          .attr("class", "contour")
              .attr("d", d3.geoPath(projection))
              .attr("fill", function(d) { return color(d.value); });

    } //for (let rltData of rltDatas ) 
  }

  addZoom(){
    const svg = d3.select("#mainCanvas");
    const width = this.winWidth - this.margin.left - this.margin.right,
          height = this.winHeight - this.margin.top - this.margin.bottom;

    var gX = this.plot.append("g")
      .attr("class", "axis")
      .call(this.xAxis);
    var gY = this.plot.append("g")
      .attr("class", "axis")
      .call(this.yAxis);
    
    this.gX = gX;
    this.gY = gY;

    this.zoom = d3.zoom()
      .scaleExtent([1, 1000])
      .translateExtent([
        [-100, -100],
        [width + 100, height + 100]
      ])
      .on("zoom", zoomed);

    svg.call(this.zoom);

    var x = this.x;
    var y = this.y;
    var xAxis = this.xAxis;
    var yAxis = this.yAxis;
    var contourAll = svg.selectAll(".contour"); 
    var vectorAll = svg.selectAll(".vector");

    function zoomed() {
      contourAll.attr("transform", d3.event.transform);
      vectorAll.attr("transform", d3.event.transform);
      gX.call(xAxis.scale(d3.event.transform.rescaleX(x)));
      gY.call(yAxis.scale(d3.event.transform.rescaleY(y)));
      zoomData = d3.event.transform;
    }
  }
}

/*
const filearray2 = [ "./result1/result_000.rlt", 
                    "./result1/result_001.rlt", 
                    "./result1/result_002.rlt"];

const filearray = [ "./result2/result_000.rlt", 
                    "./result2/result_001.rlt", 
                    "./result2/result_002.rlt", 
                    "./result2/result_003.rlt", 
                    "./result2/result_004.rlt"];

var fileContents = filearray.map( filepath => d3.text(filepath).then( text => text ) );
var chart;
var zoomData;

Promise.all( fileContents ).then( values => {
  var rltDatas = values.map( data => new CFDData(data) );
  chart = new Chart ("#canvas", rltDatas);
  console.log(chart);
  chart.createSelectOption();

});


d3.select(window).on('resize', windowResize);


d3.select("#resetButton")
    .on("click", () => {chart.initView();});

d3.select("#zoom_in").on("click", function() {
  const svg = d3.select("#mainCanvas");
  chart.zoom.scaleBy(svg.transition().duration(500), 2);
});
d3.select("#zoom_out").on("click", function() {
  const svg = d3.select("#mainCanvas");
  chart.zoom.scaleBy(svg.transition().duration(500), 0.5);
});

function onchange(){
  var selectValue = d3.select('#contourSelect').property('value');
  chart.redraw(selectValue);
//  console.log(d3.event.transform);
}

*/

function windowResize() {
  
  var rewinWidth = parseInt(d3.select('.wb-appFrame-ViewerColumn').style('width'));
  var rewinHeight = parseInt(d3.select('.wb-appFrame-ViewerColumn').style('height'));
  const width = chart.width,
        height = chart.height;

  const margin = chart.margin,
        canvasSize = chart.canvasSize, ratioWH = chart.ratioWH;

  var zoom = chart.zoom;
  const svg = d3.select("#mainCanvas"); 

  var rewidth = rewinWidth - margin.left - margin.right,
      reheight = rewinHeight - margin.top - margin.bottom;

  var diffWidth = (rewidth - width) / width;
  var diffHeight = (reheight - height) / height;

  var xCanvasSize = canvasSize * ratioWH + 2*canvasSize * ratioWH *  diffWidth;
  var yCanvasSize = canvasSize + 2*canvasSize*diffHeight;

  chart.x.domain([-canvasSize * ratioWH, xCanvasSize])
    .range([0, rewidth]);
  chart.y.domain([-yCanvasSize, canvasSize])
    .range([reheight, 0]);

  svg.attr("width", rewinWidth);
  svg.attr("height", rewinHeight);

  chart.plot.attr("width", rewidth)
            .attr("height", reheight);

  chart.plot.select("rect")
    .attr("width", rewidth)
    .attr("height", reheight);

  chart.xAxis.ticks(rewidth / reheight * 4) //
    .tickSize(reheight)
    .tickPadding(8 - reheight);

  chart.yAxis.tickSize(rewidth)
    .tickPadding(8 - rewidth);

  svg.transition();
  zoom.translateExtent([
    [-100, -100],
    [rewidth + 100, reheight + 100]
  ]);

  zoom.scaleBy(svg.transition(), 1);

  //currentWidth = rewidth;
  //currentHeight = reheight;
}

