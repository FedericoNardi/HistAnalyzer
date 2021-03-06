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
      return{ x: unpack(arr, xKey), y: unpack(arr, yKey) };
    }

    // ---------- Define charts ----------

    function makeBars(coords, range, onColor, offColor, tag=""){
      return{
        type: 'bar',
        x: coords.x,
        y: coords.y,
        marker: {
          opacity: coords.x.map( function(x) {
            return (range[0] <= x && x < range[1]) ? 1.0 : 0.5;
          })
        },
        name: textEncoder(tag)
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

    function lastBin(array){
      let i=array.length-1,
        sum = 0;
      while(sum==0){
        sum += array[i];
        i--;
      }
      return i+1;
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
        title: '',
        yaxis: {title: "count", type: checkboxes[varName].checked?"log":"lin"},
        xaxis: {title: textEncoder(varName,1), range: [0.-0.5*slideRanges[varName].value, getXY(group.all()).x[lastBin(getXY(group.all()).y)+1] ]},
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
      let yTicks = [];
      for(tick of getXY(groups["tag"].all()).x){
        yTicks.push(textEncoder(tick));
      }

      Plotly.react(hists["tag"], [{
        type: 'bar',
        x: getXY(groups["tag"].all()).y,
        y: getXY(groups["tag"].all()).x.map(textEncoder),
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

    function textEncoder(textIn, units=0, select=0){
      switch(textIn){
        case "g":
          return '&#947;';
        case "m":
          return '&mu;';
        case '4mm':
          return '4 &mu;';
        case '4ee':
          return '4 e';
        case '4me':
          return '4 &#947;e';
        case 'mll':
          if(units==1){return 'invariant mass [GeV]';}
          else{ return 'invariant mass'}; 
        case 'met':
          if(units==1){return 'missing transverse energy [GeV]';}
          else{ return 'missing transverse energy'}; 
        case 'pt1':
          if(units==1){return 'p<sub>T</sup><sup>1</sup> [GeV/c]';}
          else{ return 'p<sub>T</sup><sup>1</sup>'};
        case 'pt2':
          if(units==1){return 'p<sub>T</sup><sup>2</sup> [GeV/c]';}
          else{ return 'p<sub>2</sup><sup>1</sup>'};
        case 'eta1':
          return '&#951;<sub>1</sub>';
        case 'eta2':
          return '&#951;<sub>2</sub>';
        default: 
          return textIn;
      }
    }

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
      slideRanges = [],
      slideValues = [],

      switchContainers = [],
      switchTextA = [],
      switchTextB = [],
      switchText = [],
      switchLabels = [],
      checkboxes = [],
      switchSliders = [],

      buttons = [],
      fit_logs = [],

      groups = [],
      dimensions = [],
      ranges = [],

      binLabels = [],

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
        ranges[key] = [0,Infinity];
  
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

        // Adding slideRanges and buttons to console
        sliders[key] = document.createElement('div');
        sliders[key].setAttribute('class','slider');

        slideRanges[key] = document.createElement("input");
        slideRanges[key].setAttribute("class","slider-range");
        slideRanges[key].type = "range";
        slideRanges[key].id = "bin_"+key;
        if(key.includes("eta")){
          slideRanges[key].step = 0.01;
          slideRanges[key].min = 0.05;
          slideRanges[key].max = 0.5;
          slideRanges[key].value = 0.15;
        }
        else{
          slideRanges[key].min = 2;
          slideRanges[key].max = 200;
          slideRanges[key].value = 50;
        }
        slideValues[key] = document.createElement('span');
        slideValues[key].setAttribute('class','slider-value');
        slideValues[key].innerHTML = slideRanges[key].value;

        consoles[key].appendChild(sliders[key]);
        binLabels[key] = document.createElement('span');
        binLabels[key].innerHTML = "<b>Bin size:</b> ";
        binLabels[key].setAttribute('class','bin-label');
        sliders[key].appendChild(binLabels[key]);
        sliders[key].appendChild(slideRanges[key]);
        sliders[key].appendChild(slideValues[key]);

        buttons[key] = document.createElement("button");
        buttons[key].textContent = "Fit";
        buttons[key].setAttribute("id","fit_"+key);

        switchContainers[key] = document.createElement("span");
        switchContainers[key].setAttribute("class","switch-container");
        switchLabels[key] = document.createElement("label");
        switchLabels[key].setAttribute("class","switch");
        checkboxes[key] = document.createElement("input");
        checkboxes[key].setAttribute("type","checkbox");
        checkboxes[key].setAttribute("id","scale_"+key);
        switchSliders[key] = document.createElement("span");
        switchSliders[key].setAttribute("class","switch-slider round");
        switchLabels[key].appendChild(checkboxes[key]);
        switchLabels[key].appendChild(switchSliders[key]);

        switchTextA[key] = document.createElement("span");
        switchTextA[key].innerHTML = "LIN ";
        switchTextB[key] = document.createElement("span");
        switchTextB[key].innerHTML = " LOG";
        switchContainers[key].appendChild(switchTextA[key]);
        switchContainers[key].appendChild(switchLabels[key]);
        switchContainers[key].appendChild(switchTextB[key]);



        fit_logs[key] = document.createElement("div");
        fit_logs[key].setAttribute("class","fit-log");

        consoles[key].appendChild(buttons[key]);
        switchText[key] = document.createElement("span");
        switchText[key].setAttribute("class", 'switchLabel');
        switchText[key].innerHTML = "<b>y-axis scale: </b>";
        consoles[key].appendChild(switchText[key]);
        consoles[key].appendChild(switchContainers[key]);
        consoles[key].appendChild(fit_logs[key]);
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

    // Defining actions on charts
    for(key of keys){
      if(key!="tag"){
        let input = {k: key}; // Passing extra arguments as object
        hists[key].on('plotly_selected', function(event,extra=input){
          ranges[extra.k] = event ? [(event.range.x[0]<0 ? 0 : event.range.x[0]),event.range.x[1]] : [0, Infinity];
          dimensions[extra.k].filter(ranges[extra.k]);
          react();
        });
        hists[key].on('plotly_doubleclick', function(event,extra=input){
          ranges[extra.k] = event ? [event.range.x[0],event.range.x[1]] : [0, Infinity];
          dimensions[extra.k].filter(ranges[extra.k]);
          react();
        });
      }
    }

    function change_slider(key){
      let bin = slideRanges[key].value;
      slideValues[key].innerHTML = String(bin);
      groups[key] = dimensions[key].group( (d)=>{return Math.floor(d/bin)*bin} );
      makeChart( hists[key], groups[key], ranges[key], key , key );
    }

    function initFit(arr, xKey="key", yKey="value"){
      let vals = [],
        x = unpack(arr,xKey),
        y = unpack(arr,yKey);

      for(let i=0; i<x.length; i++){
        vals.push([x[i], Math.log(y[i])]);
      }

      return vals;
    }

    function gauss_fit(key){
      // filter data to match ranges
      let tmp = initFit(groups[key].all());
      let entries = [];
      
      for(let i=0; i<tmp.length; i++){
        if( tmp[i][0]>ranges[key][0] && tmp[i][0]<ranges[key][1] ){entries.push(tmp[i])} ;
      }
      delete tmp;

      const result = regression.polynomial(entries,{order:2, precision:8});

      const fit_traces = [];
      for(const tag of tags){
        dimensions["tag"].filter(tag);
        fit_traces.push( makeBars(getXY(groups[key].all()), ranges[key], in_all, in_here, tag) );
        dimensions["tag"].filterAll();
      }
      let fit_x = [],
        fit_y = [];

      for(let i=0; i<result.points.length; i++){
        fit_x.push(result.points[i][0]);
        fit_y.push(Math.exp(result.points[i][1]));
      }

      fit_traces.push({
        type: 'scatter',
        mode: 'marker+lines',
        x: fit_x,
        y: fit_y,
        name: "fit"
      });

      Plotly.react( "hist_"+key, fit_traces , {
        title: key,
        yaxis: {title: "count", type:checkboxes[key].checked?"log":"lin"},
        xaxis: {title: key, range: [0.-0.5*slideRanges[key].value, getXY(groups[key].all()).x[lastBin(getXY(groups[key].all()).y)+1] ]},
        selectdirection: "h",
        barmode: "stack",
        hovermode: false,
        showlegend: true,
        dragmode: "select",
        shapes: makeShapes(ranges[key])
      });

      fit_logs[key].innerHTML = 
        "<b>Fit Results:</b><br>"
        +"<b>Range:</b> ["+String(ranges[key][0])+" , "+String(ranges[key][1])+"] <br>"
        +"<b>Mean:</b> "+String(-result.equation[1]/(2*result.equation[0]))+"<br>"
        +"<b>Variance:</b> "+String(Math.sqrt(-1/result.equation[0]))+"<br>"
        +"<b>R^2:</b> "+String(-result.r2)+"<br>";
    }

    function handle_sliders(j){
      return function(event){
        change_slider(j);
      }
    }

    function handle_fit(j){
      return function(event){
        gauss_fit(j);
      }
    }

    function handle_switch(j){
      return function(event){
        refresh_scale(j);
      }
    }

    function refresh_scale(key){
      makeChart( hists[key], groups[key], ranges[key], key , key );    }

    for(key of keys){
      if(key!="tag"){
        $('#bin_'+key).change( handle_sliders(key) );
        $('#fit_'+key).click( handle_fit(key) );
        $('#scale_'+key).change( handle_switch(key) );
      }
    }

    for(const key of keys){
      if(key!="tag"){
        const optionX = document.createElement("option");
        optionX.value = key;
        optionX.text = key;
        document.getElementById('selectX').appendChild(optionX);
      }
    }

    for(const key of keys){
      if(key!="tag"){
        const optionY = document.createElement("option");
        optionY.value = key;
        optionY.text = key;
        document.getElementById('selectY').appendChild(optionY);
      }
    }

    function make2DPlot(){
      let selectX = document.getElementById('selectX').value,
        selectY = document.getElementById('selectY').value,
        entries = dimensions[selectX].top(Infinity),

        coords = {x: unpack(entries,selectX), y: unpack(entries,selectY)};

      Plotly.react('plot2D',
        [{
          x: coords.x,
          y: coords.y,
          marker:{size: 2},
          mode: 'markers',
          type: 'scatter'
        }],
        {
          hovermode:false,
          xaxis: {title: textEncoder(selectX,1)},
          yaxis: {title: textEncoder(selectY,1)}
        });
    }

    let button = document.getElementById('make2DPlot');
    button.onclick = make2DPlot;
  }
});

