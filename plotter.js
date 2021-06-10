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

    function getXY(arr, xKey="key", yKey="value"){
      return{ x: unpack(arr, xKey), y: unpack(arr, yKey) }
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
        dimensions["tag"].filter(tag);
        traces.push( makeBars(getXY(group.all()), range, in_all, in_here, tag) );
        dimensions["tag"].filterAll();
      }
      return traces;
    }

    function makeChart(handle, group, range, title, varName) {
      Plotly.react( handle, makeTraces(group, range) , {
        title: title,
        yaxis: {title: "count", type:"log"},
        xaxis: {title: varName},
        selectdirection: "h",
        barmode: "stack",
        hovermode: false,
        showlegend: true,
        dragmode: "select",
        shapes: makeShapes(range)
      });
    }

    function react() {
      for( key of keys ){
        if(key!="tag"){ makeChart(hists[key], groups[key], ranges[key], key, key); }
      }
      Plotly.react(hists["tag"], [{
        type: 'bar',
        x: getXY(groups["tag"].all()).y,
        y: getXY(groups["tag"].all()).x,
        orientation: 'h'
      }]);
    }

    function rejectNullEntries(data){
      const keys = Object.keys(data[0]);
        fullKeys = [];
      keys.forEach( (value,i)=>{
        if(data[0][value]!="NA") fullKeys.push(value);
      });
      return fullKeys;
    }

    // Set up selection listeners


    //window.resetFilters = ()=>{
    //  for(key of keys){
    //    if(key!="tag"){ hist_select(which=key); }
    //  }
    //}

    // -----------------------------------------------------------------

    // setting up crossfilter
    const data = parsed.data;

    // Find NA entries
    const keys = rejectNullEntries(data);

    // Initializing variables
    let divs = [],
      hists = [],
      consoles = [],
      sliders = [],
      groups = [],
      dimensions = [],
      ranges = [];
      wrapper = document.getElementById("plot_wrapper"),

      filter = crossfilter(data);

    // colors
    let in_all = "#66F",
        in_none = "#EEE",
        in_here = "#CCC",
        in_there = "#CCF";

    for(key of keys){
      // Initialize crossfilter groups and dimensions
      if(key=="tag"){ 
        dimensions[key] = filter.dimension( (d)=>{ return d[key] } );
        groups[key] = dimensions[key].group().reduceCount(); 
      }
      else{ 
        dimensions[key] = filter.dimension( (d)=>{ return d[key] } );
        if(key.includes("eta")){groups[key] = dimensions[key].group( (d)=>{ return Math.floor(d/0.15)*0.15 } ); }
        else{ groups[key] = dimensions[key].group( (d)=>{ return Math.floor(d/100)*100 } ); }
        ranges[key] = [-Infinity,Infinity];
  
        // Generate DOM slots for plots and consoles
        divs[key] = document.createElement("div");
        divs[key].id = "div_"+key;

        hists[key] = document.createElement("div");
        hists[key].id = "hist_"+key;
        divs[key].appendChild(hists[key]);

        consoles[key] = document.createElement("div");
        consoles[key].id = "console_"+key;
        divs[key].appendChild(consoles[key]);

        wrapper.appendChild(divs[key]);

        // Adding sliders to console
        sliders[key] = document.createElement("input");
        sliders[key].class = "slider";
        sliders[key].type = "range";
        sliders[key].id = "bin_"+key;
        if(key.includes("eta")){
          sliders[key].min = 0.05;
          sliders[key].max = 0.5;
          sliders[key].step = 0.05;
          sliders[key].value = 0.1;
        }
        else{
          sliders[key].min = 2;
          sliders[key].max = 202;
          sliders[key].step = 10;
          sliders[key].value = 50;
        }
        consoles[key].appendChild(sliders[key]);
      }
    }

    // Initializing count chart

    divs["tag"] = document.createElement("div");
    divs["tag"].id = "div_tag";
    hists["tag"] = document.createElement("div");
    hists["tag"].id = "hist_tag";
    divs["tag"].appendChild(hists["tag"]);
    wrapper.appendChild(divs["tag"]);

    // Creating charts

    const tags = unpack(groups["tag"].all(),"key");

    react();

    // Defining actions on charts and consoles
    for(key of keys){
      if(key!="tag"){
        let input = {k: key}; // Passing extra arguments as object
        hists[key].on('plotly_selected', function(event,extra=input){
          ranges[extra.k] = event ? [event.range.x[0],event.range.x[1]] : [-Infinity, Infinity];
          dimensions[extra.k].filter(ranges[extra.k]);
          react();
        });
        hists[key].on('plotly_doubleclick', function(event,extra=input){
          ranges[extra.k] = event ? [event.range.x[0],event.range.x[1]] : [-Infinity, Infinity];
          dimensions[extra.k].filter(ranges[extra.k]);
          react();
        });
      }
    }

    console.log(keys);

    function change_slider(key){
      let bin = sliders[key].value;
      console.log(bin);
      groups[key] = dimensions[key].group( (d)=>{return Math.floor(d/bin)*bin} );
      makeChart( hists[key],groups[key], ranges[key], key , key );
    }

    function handle_sliders(j){
      return function(event){
        change_slider(j);
      }
    }

    for(key of keys){
      console.log(key!="tag");
      if(key!="tag"){
        $('#bin_'+key).change( handle_sliders(key) );
      }
    }

  }
});

