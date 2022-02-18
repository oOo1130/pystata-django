const global_layout = {
  autosize: true,
  plot_bgcolor: "#3F3F3F",
  paper_bgcolor: "#3F3F3F",
  xaxis: {
    zerolinecolor: '#00F411',
    gridcolor: '#0C640A',
    color: '#00F411',
    type: 'category',
  },
  yaxis: {
    zerolinecolor: '#00F411',
    gridcolor: '#0C640A',
    color: '#00F411',
    type: 'category',
  },
  legend: {
    font: {
      color: '#00F411',
    }
  }
};

const global_large_layout = {
  autosize: true,
  plot_bgcolor: "#3F3F3F",
  paper_bgcolor: "#3F3F3F",
  xaxis: {
    zerolinecolor: '#00F411',
    gridcolor: '#0C640A',
    color: '#00F411',
    type: 'category',
  },
  yaxis: {
    zerolinecolor: '#00F411',
    gridcolor: '#0C640A',
    color: '#00F411',
    type: 'category',
  },
  legend: {
    font: {
      color: '#00F411',
    }
  },
  height: '850',
  width: '1600',
  margin: {
    l: 150,
    r: 50,
    b: 150,
    t: 50,
    pad: 4
  },
  updatemenus: [{
        x: 0.85,
        y: 1.15,
        xref: 'paper',
        yref: 'paper',
        yanchor: 'top',
        active: 0,
        showactive: false,
        buttons: [{
              method: 'restyle',
              args: ['transforms[0].aggregations[0].func', 'avg'],
              label: 'Avg'
          }, {
              method: 'restyle',
              args: ['transforms[0].aggregations[0].func', 'sum'],
              label: 'Sum'
          }, {
              method: 'restyle',
              args: ['transforms[0].aggregations[0].func', 'min'],
              label: 'Min'
          }, {
              method: 'restyle',
              args: ['transforms[0].aggregations[0].func', 'max'],
              label: 'Max'
          }, {
              method: 'restyle',
              args: ['transforms[0].aggregations[0].func', 'mode'],
              label: 'Mode'
          }, {
              method: 'restyle',
              args: ['transforms[0].aggregations[0].func', 'median'],
              label: 'Median'
          }, {
              method: 'restyle',
              args: ['transforms[0].aggregations[0].func', 'count'],
              label: 'Count'
          }, {
              method: 'restyle',
              args: ['transforms[0].aggregations[0].func', 'stddev'],
              label: 'Std.Dev'
          }, {
              method: 'restyle',
              args: ['transforms[0].aggregations[0].func', 'first'],
              label: 'First'
          }, {
              method: 'restyle',
              args: ['transforms[0].aggregations[0].func', 'last'],
              label: 'Last'
        }],
  }]
};

const global_3d_layout = {
  scene: {
    aspectmode: "manual",
    autosize: true,
    bgcolor: "#3F3F3F",
    xaxis: {
      zerolinecolor: '#00F411',
      gridcolor: '#0C640A',
      color: '#00F411',
      type: 'category',
    },
    yaxis: {
      zerolinecolor: '#00F411',
      gridcolor: '#0C640A',
      color: '#00F411',
      type: 'category',
    },
    zaxis: {
      zerolinecolor: '#00F411',
      gridcolor: '#0C640A',
      color: '#00F411',
      type: 'category',
    },
    legend: {
      font: {
        color: '#00F411',
      }
    },
  },
  height: '850',
  width: '1600',
  margin: {
    l: 150,
    r: 50,
    b: 150,
    t: 50,
    pad: 4
  },
  plot_bgcolor: "#3F3F3F",
  paper_bgcolor: "#3F3F3F",
    updatemenus: [{
        x: 0.85,
        y: 1.15,
        xref: 'paper',
        yref: 'paper',
        yanchor: 'top',
        active: 0,
        showactive: false,
        buttons: [{
              method: 'restyle',
              args: ['transforms[0].aggregations[0].func', 'avg'],
              label: 'Avg'
          }, {
              method: 'restyle',
              args: ['transforms[0].aggregations[0].func', 'sum'],
              label: 'Sum'
          }, {
              method: 'restyle',
              args: ['transforms[0].aggregations[0].func', 'min'],
              label: 'Min'
          }, {
              method: 'restyle',
              args: ['transforms[0].aggregations[0].func', 'max'],
              label: 'Max'
          }, {
              method: 'restyle',
              args: ['transforms[0].aggregations[0].func', 'mode'],
              label: 'Mode'
          }, {
              method: 'restyle',
              args: ['transforms[0].aggregations[0].func', 'median'],
              label: 'Median'
          }, {
              method: 'restyle',
              args: ['transforms[0].aggregations[0].func', 'count'],
              label: 'Count'
          }, {
              method: 'restyle',
              args: ['transforms[0].aggregations[0].func', 'stddev'],
              label: 'Std.Dev'
          }, {
              method: 'restyle',
              args: ['transforms[0].aggregations[0].func', 'first'],
              label: 'First'
          }, {
              method: 'restyle',
              args: ['transforms[0].aggregations[0].func', 'last'],
              label: 'Last'
        }],
  }]
};