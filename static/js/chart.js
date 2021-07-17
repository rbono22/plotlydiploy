function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");
  // Use the list of sample names to populate the select options
  d3.json("samples.json").then((data) => {
    var sampleNames = data.names;
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });
    // Use the first sample from the list to build the initial plots
    var firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

// Initialize the dashboard
init();

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildMetadata(newSample);
  buildCharts(newSample);
  
}

// Demographics Panel 
function buildMetadata(sample) {
  d3.json("samples.json").then((data) => {
    var metadata = data.metadata;
    // Filter the data for the object with the desired sample number
    var resultArray = metadata.filter(sampleObj => sampleObj.id == sample);
    var result = resultArray[0];
    // Use d3 to select the panel with id of `#sample-metadata`
    var PANEL = d3.select("#sample-metadata");
    // Use `.html("") to clear any existing metadata
    PANEL.html("");
    // add each key and value pair to the panel
    Object.entries(result).forEach(([key, value]) => {
      PANEL.append("h6").text(`${key.toUpperCase()}: ${value}`);
    });
  });
}

// 1. Create the buildCharts function.
function buildCharts(sample) {
  // 2. Use d3.json to load and retrieve the samples.json file 
  d3.json("samples.json").then((data) => {
    // 3. Create a variable that holds the samples array. 
    var samples = data.samples;
    // 4. Create a variable that filters the samples for the object with the desired sample number.
    var chartArray = samples.filter(chartObj => chartObj.id == sample);
    // 1. Create a variable that filters the metadata array for the object with the desired sample number (for guage)
    var metadataArray = data.metadata.filter(chartObj => chartObj.id == sample);
    // 5. Create a variable that holds the first sample in the array.
    var chartResult = chartArray[0];
    // 2. Create a variable that holds the first sample in the metadata array (for guage)
    var guageResult= metadataArray[0];
    // 6. Create variables that hold the otu_ids, otu_labels, and sample_values.
    var otu_ids = chartResult.otu_ids;
    var otu_labels = chartResult.otu_labels;
    var sample_values = chartResult.sample_values;
    // 3. Create a variable that holds the washing frequency (for guage)
    var washingFreq = Math.round(guageResult.wfreq*100)/100;
    //---------------- Bar Chart ------------------
    // 7. Create the yticks for the bar chart. Get the the top 10 otu_ids and map them in descending order  
    var yticks =  otu_ids.slice(0, 10).map(otuID => `OTU ${otuID}`).reverse()
    // 8. Create the trace for the bar chart. 
    var barData = [{
      x: sample_values.slice(0,10).reverse(),
      y: yticks,
      text: yticks.map(row => row.otu_labels),
      type: "bar",
      orientation: "h"}
    ];
    // 9. Create the layout for the bar chart. 
    var barLayout = {
     title: "Top 10 Bacteria Cultures Found",
     margin: {
      l: 100,
      r: 100,
      t: 100,
      b: 30
      }
    };
    // 10. Use Plotly to plot the data with the layout. 
    Plotly.newPlot("bar", barData, barLayout);

    //---------------- Bubble Chart ------------------
    // 1. Create the trace for the bubble chart.
    var bubbleData = [{
      x: otu_ids,
      y: sample_values,
      text: otu_labels,
      mode: 'markers',
      marker: {
        size: sample_values,
        sizeref: 0.04,
        sizemode: 'area',
        color: otu_ids,
        colorscale: "Earth"
      }
    }];
    // 2. Create the layout for the bubble chart.
    var bubbleLayout = {
          title: "Bacteria Cultures Per Sample",
          xaxis: {
            title: {
              text: "OTU ID"}},
          hovermode: 'closest',
          height: 600,
          width: 1100
    };
    // 3. Use Plotly to plot the data with the layout.
    Plotly.newPlot("bubble", bubbleData, bubbleLayout);

    //---------------- Guage Chart ------------------
    // D2: 3. Use Plotly to plot the data with the layout.
    // 4. Create the trace for the gauge chart.
    var gaugeData = [{
      domain: { x: [0, 1], y: [0, 1] },
      type: 'indicator',
      mode: 'gauge+number',
      value: washingFreq,
      title: {
        text: '<b>Belly Button Washing Frequency</b> <br> Scrubs per week' 
        },
      gauge: {
        axis: {range: [null, 10]},
        bar: {color: 'black'},
        steps: [
          {range: [0, 2], color: "red"},
          {range: [2, 4], color: "orange"},
          {range: [4, 6], color: "yellow"},
          {range: [6, 8], color: "lime"},
          {range: [8, 10], color: "green"}
        ]
      },
    }];
    // 5. Create the layout for the gauge chart.
    var gaugeLayout = { 
     width: 600,
     height: 600
    };
    // 6. Use Plotly to plot the gauge data and layout.
    Plotly.newPlot("gauge", gaugeData, gaugeLayout);
  });
}