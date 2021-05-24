Papa.parse( filename, {
  delimiter: " ",
  download: true,
  skipEmptyLines: true,
  dynamicTyping: true,
  header: true,
  complete: function(parsed){

    //----------------- Defining helper functions -------------------
    function unpack(rows, key){
      return rows.map( function(row){ return row[key]; } );
    }

    function getXY(arr){
      return{ x: unpack(arr, "key"), y: unpack(arr, "value") }
    }

    // ---------- Define charts ----------

    function makeBars(coords, range, onColor, offColor, tag=""){
      return{
        type: 'bar',
        x: coords.x,
        y: coords.y,
        marker: {
          opacity: coords.x.map( function(x) {
            return (range[0] < x && x < range[1]) ? 1.0 : 0.5;
          })
        },
        name: tag
      }
    }

    function makeShapes(range){
      return !isFinite(range[0]) ? null : [{
        type: 'rect',
        xref: 'x',
        yref: 'paper',
        x0: range[0],
        x1: range[1],
        y0: 0,
        y1: 1,
        fillcolor: '#d3d3d3',
        opacity: 0.2,
        line: { width:0 }
      }]
    }

    function makeTraces(group, range){
      const traces = [];
      for(const tag of tags){
        tagDimension.filter(tag);
        traces.push( makeBars(getXY(group.all()), range, in_all, in_here, tag) );
        tagDimension.filterAll();
      }
      return traces;
    }

    function makeChart(handle, group, range, title, varName) {
      Plotly.react( handle, makeTraces(group, range) , {
        title: title,
        yaxis: {"title": "count"},
        xaxis: {"title": varName},
        selectdirection: "h",
        barmode: "stack",
        hovermode: false,
        showlegend: true,
        dragmode: "select",
        shapes: makeShapes(range)
      });
    }

    function react() {
      makeChart(hist_mass, massGroup, massRange, "mass", "m");
      makeChart(hist_v1, v1Group, v1Range, "v1", "v1");
      makeChart(hist_v2, v2Group, v2Range, "v2", "v2");
      makeChart(hist_v3, v3Group, v3Range, "v3", "v3");
      makeChart(hist_v4, v4Group, v4Range, "v4", "v4");
      makeChart(hist_v5, v5Group, v5Range, "v5", "v5");
      makeChart(hist_v6, v6Group, v6Range, "v6", "v6");  
      Plotly.react(hist_count, [{
        type: 'bar',
        x: getXY(tagGroup.all()).y,
        y: getXY(tagGroup.all()).x,
        orientation: 'h'
      }]);
    }

    // Setting up selection listeners
    function hist_mass_select(e) {
      massRange = e ? [e.range.x[0], e.range.x[1]] : [-Infinity, Infinity];
      massDimension.filter(massRange);
      react();
    }

    function hist_v1_select(e) {
      v1Range = e ? [e.range.x[0], e.range.x[1]] : [-Infinity, Infinity];
      v1Dimension.filter(v1Range);
      react();
    }

    function hist_v2_select(e) {
      v2Range = e ? [e.range.x[0], e.range.x[1]] : [-Infinity, Infinity];
      v2Dimension.filter(v2Range);
      react();
    }

    function hist_v3_select(e) {
      v3Range = e ? [e.range.x[0], e.range.x[1]] : [-Infinity, Infinity];
      v3Dimension.filter(v3Range);
      react();
    }

    function hist_v4_select(e) {
      v4Range = e ? [e.range.x[0], e.range.x[1]] : [-Infinity, Infinity];
      v4Dimension.filter(v4Range);
      react();
    }

    function hist_v5_select(e) {
      v5Range = e ? [e.range.x[0], e.range.x[1]] : [-Infinity, Infinity];
      v5Dimension.filter(v5Range);
      react();
    }

    function hist_v6_select(e) {
      v6Range = e ? [e.range.x[0], e.range.x[1]] : [-Infinity, Infinity];
      v6Dimension.filter(v6Range);
      react();
    }

    window.resetFilters = function() {
      hist_mass_select();
      hist_v1_select();
      hist_v2_select();
      hist_v3_select();
      hist_v4_select();
      hist_v5_select();
      hist_v6_select();
    };

    // -----------------------------------------------------------------

    // setting up crossfilter
    const data = crossfilter(parsed.data);

    let massDimension = data.dimension(function(d) {return Math.floor(d.mass)}),
      massGroup = massDimension.group( (d)=>{return Math.floor(d/100)*100} ),
      v1Dimension = data.dimension(function(d) {return Math.floor(d.v1/50)*50}),
      v1Group = v1Dimension.group(),
      v2Dimension = data.dimension(function(d) {return Math.floor(d.v2/50)*50}),
      v2Group = v2Dimension.group(),
      v3Dimension = data.dimension(function(d) {return Math.floor(d.v3/50)*50}),
      v3Group = v3Dimension.group(),
      v4Dimension = data.dimension(function(d) {return Math.floor(d.v4/50)*50}),
      v4Group = v4Dimension.group(),
      v5Dimension = data.dimension(function(d) {return Math.floor(d.v5/50)*50}),
      v5Group = v5Dimension.group(),
      v6Dimension = data.dimension(function(d) {return Math.floor(d.v6/50)*50}),
      v6Group = v6Dimension.group(),
      tagDimension = data.dimension( function(d) {return d.tag}),
      tagGroup = tagDimension.group().reduceCount();

    const tags = unpack(tagGroup.all(),"key");

    // Getting DOM objects for renedering
    const hist_mass = document.getElementById("hist_mass"),
      hist_v1 = document.getElementById("hist_v1"),
      hist_v2 = document.getElementById("hist_v2"),
      hist_v3 = document.getElementById("hist_v3"),
      hist_v4 = document.getElementById("hist_v4"),
      hist_v5 = document.getElementById("hist_v5"),
      hist_v6 = document.getElementById("hist_v6");
      hist_count = document.getElementById("hist_count");

    // colors
    let in_all = "#66F",
        in_none = "#EEE",
        in_here = "#CCC",
        in_there = "#CCF";

    // Initializing ranges anc charts

    let massRange = [-Infinity, Infinity],
      v1Range = [-Infinity, Infinity],
      v2Range = [-Infinity, Infinity],
      v3Range = [-Infinity, Infinity],
      v4Range = [-Infinity, Infinity],
      v5Range = [-Infinity, Infinity],
      v6Range = [-Infinity, Infinity];

    react();

    // Define actions on charts
    hist_mass.on('plotly_selected', hist_mass_select);
    hist_mass.on('plotly_doubleclick', hist_mass_select);

    hist_v1.on('plotly_selected', hist_v1_select);
    hist_v1.on('plotly_doubleclick', hist_v1_select);

    hist_v2.on('plotly_selected', hist_v2_select);
    hist_v2.on('plotly_doubleclick', hist_v2_select);

    hist_v3.on('plotly_selected', hist_v3_select);
    hist_v3.on('plotly_doubleclick', hist_v3_select);

    hist_v4.on('plotly_selected', hist_v4_select);
    hist_v4.on('plotly_doubleclick', hist_v4_select);

    hist_v5.on('plotly_selected', hist_v5_select);
    hist_v5.on('plotly_doubleclick', hist_v5_select);

    hist_v6.on('plotly_selected', hist_v6_select);
    hist_v6.on('plotly_doubleclick', hist_v6_select);

    $('#binMass').change(()=>{
      let slider = document.getElementById('binMass');
      const bin = slider.value;
      massGroup = massDimension.group( (d)=>{return Math.floor(d/bin)*bin} );
      makeChart(hist_mass, massGroup, massRange, "mass", "m");
    })
    $('#binV1').change(()=>{
      let slider = document.getElementById('binV1');
      const bin = slider.value;
      v1Group = v1Dimension.group( (d)=>{return Math.floor(d/bin)*bin} );
      makeChart(hist_v1, v1Group, v1Range, "v1", "v1");
    })
    $('#binV2').change(()=>{
      let slider = document.getElementById('binV2');
      const bin = slider.value;
      v2Group = v2Dimension.group( (d)=>{return Math.floor(d/bin)*bin} );
      makeChart(hist_v2, v2Group, v2Range, "v2", "v2");
    })
    $('#binV3').change(()=>{
      let slider = document.getElementById('binV3');
      const bin = slider.value;
      v3Group = v3Dimension.group( (d)=>{return Math.floor(d/bin)*bin} );
      makeChart(hist_v3, v3Group, v3Range, "v3", "v3");
    })
    $('#binV4').change(()=>{
      let slider = document.getElementById('binV4');
      const bin = slider.value;
      v4Group = v4Dimension.group( (d)=>{return Math.floor(d/bin)*bin} );
      makeChart(hist_v4, v4Group, v4Range, "v4", "v4");
    })
    $('#binV5').change(()=>{
      let slider = document.getElementById('binV');
      const bin = slider.value;
      v5Group = v5Dimension.group( (d)=>{return Math.floor(d/bin)*bin} );
      makeChart(hist_v5, v5Group, v5Range, "v5", "v5");
    })
    $('#binV6').change(()=>{
      let slider = document.getElementById('binV6');
      const bin = slider.value;
      v6Group = v6Dimension.group( (d)=>{return Math.floor(d/bin)*bin} );
      makeChart(hist_v6, v6Group, v6Range, "v6", "v6");
    })
  }
});




