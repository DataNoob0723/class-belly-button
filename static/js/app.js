async function buildMetadata(sample) {

  // @TODO: Complete the following function that builds the metadata panel

  // Use `d3.json` to fetch the metadata for a sample
  let metaData = await d3.json(`/metadata/${sample}`);
  // console.log(metaData);
    // Use d3 to select the panel with id of `#sample-metadata`
  let panel = d3.select("#sample-metadata");
    // Use `.html("") to clear any existing metadata
  panel.html("");
    // Use `Object.entries` to add each key and value pair to the panel
    // Hint: Inside the loop, you will need to use d3 to append new
    // tags for each key-value in the metadata.
  for (key in metaData){
    let h6Tag = panel.append("h6");
    h6Tag.text(`${key}: ${metaData[key]}`);
  }

    // BONUS: Build the Gauge Chart
    // buildGauge(data.WFREQ);
  let wfreqData = metaData.WFREQ;
  // console.log(wfreqData);
  let level = wfreqData * 20;

// Trig to calc meter point
  let degrees = 180 - level,
      radius = .5;
  let radians = degrees * Math.PI / 180;
  let x = radius * Math.cos(radians);
  let y = radius * Math.sin(radians);

// Path: may have to change to create a better triangle
  let mainPath = 'M -.0 -0.025 L .0 0.025 L ',
      pathX = String(x),
      space = ' ',
      pathY = String(y),
      pathEnd = ' Z';
  let path = mainPath.concat(pathX, space, pathY, pathEnd);

  let textStr = '';
  if (wfreqData === null){
    textStr = "null";
  }
  else {
    textStr = wfreqData;
  }

  let data = [{ type: 'scatter',
    x: [0], y:[0],
    marker: {size: 28, color:'850000'},
    showlegend: false,
    name: 'WFREQ',
    text: textStr,
    hoverinfo: 'text+name'},
    { values: [50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50],
      rotation: 90,
      text: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '1-2', '0-1', ''],
      textinfo: 'text',
      textposition:'inside',
      marker: {colors:['rgba(14, 127, 0, .5)', 'rgba(110, 154, 22, .5)',
          'rgba(170, 202, 42, .5)', 'rgba(202, 209, 95, .5)',
          'rgba(210, 206, 145, .5)', 'rgba(232, 226, 202, .5)',
          'rgba(152, 120, 0, .5)', 'rgba(160, 182, 193, .5)', 'rgba(180, 180, 120, 0.5)',
          'rgba(255, 255, 255, 0)']},
      labels: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '1-2', '0-1', ''],
      hoverinfo: 'label',
      hole: .5,
      type: 'pie',
      showlegend: false
    }];

  let layout = {
    shapes:[{
      type: 'path',
      path: path,
      fillcolor: '850000',
      line: {
        color: '850000'
      }
    }],
    title: '<b>Belly Button Washing Frequency</b> <br> Scrubs per Week',
    height: 500,
    width: 500,
    xaxis: {zeroline:false, showticklabels:false,
      showgrid: false, range: [-1, 1]},
    yaxis: {zeroline:false, showticklabels:false,
      showgrid: false, range: [-1, 1]}
  };

  Plotly.newPlot('gauge', data, layout);
}

async function buildCharts(sample) {

  // @TODO: Use `d3.json` to fetch the sample data for the plots
  let plotData = await d3.json(`/samples/${sample}`);
  console.log(plotData);

    // @TODO: Build a Bubble Chart using the sample data
  let bubbleData = [{
    x: plotData["otu_ids"],
    y: plotData["sample_values"],
    text: plotData["otu_labels"],
    mode: 'markers',
    marker: {
      size: plotData['sample_values'],
      color: plotData['otu_ids'],
      colorscale: "RdBu",
    }
  }];

  const bubbleLayout = {
    margin: { t: 5, l: 300, r: 300},
    hovermode: 'closest',
    xaxis: { title: 'OTU ID' },
    autosize: true
  };

  Plotly.newPlot("bubble", bubbleData, bubbleLayout);

  function sortIndex(dataArray){
    let len = dataArray.length;
    let indices = new Array(len);
    for (let i = 0; i < len; ++i){
      indices[i] = i;
    }
    indices.sort(function (a, b) {
      return dataArray[a] < dataArray[b] ? 1 : dataArray[a] > dataArray[b] ? -1 : 0;
    }
    );
    return indices;
  }

  function arrayReorder(dataArray, indices){
    let reorderedArray = [];
    let len = dataArray.length;
    for (let i = 0; i < len; ++i){
      reorderedArray[i] = dataArray[indices[i]];
    }
    return reorderedArray;
  }

    // @TODO: Build a Pie Chart
    // HINT: You will need to use slice() to grab the top 10 sample_values,
    // otu_ids, and labels (10 each).

    // Sort data first
    let indices = sortIndex(plotData['sample_values']);
    let sortedSV = arrayReorder(plotData['sample_values'], indices);
    let sortedOI = arrayReorder(plotData['otu_ids'], indices);
    let sortedOL = arrayReorder(plotData['otu_labels'], indices);

  let pieData = [{
    values: sortedSV.slice(0, 10),
    labels: sortedOI.slice(0, 10),
    hovertext: sortedOL.slice(0, 10),
    hoverinfo: 'hovertext',
    hole: .4,
    type: 'pie'
  }];

  const pieLayout = {
    title: {
      text: '<b>Top 10 Operational Taxonomic Units (OTUs) samples</b>',
      font: {
        size: 14
      },
    },
    margin: { t: 25, l: 60 },
    annotations: [{
        font: {
          size: 20
        },
        showarrow: false,
        text: 'OTUs',
        x: 0.5,
        y: 0.5
      }],
    height: 450,
    width: 450
  };

  Plotly.newPlot("pie", pieData, pieLayout);

}

function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    console.log(firstSample);
    buildMetadata(firstSample);
    buildCharts(firstSample);
  });
}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildMetadata(newSample);
  buildCharts(newSample);
}

// Initialize the dashboard
init();
