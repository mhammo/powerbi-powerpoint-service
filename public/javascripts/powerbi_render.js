function setAllSlicers(slicers) {
  report.getPages().then(function (pages) {
      for (var x = 0; x < pages.length; x++) {
          var pageName = pages[x].name;
          pages[x].getVisuals().then(function (visuals) {
              for (var y = 0; y < visuals.length; y++) {
                  var slicer = slicers.getById("slicer", visuals[y].name);
                  if (visuals[y].type === "slicer" && slicer) {
                      visuals[y].setSlicerState(slicer.state)
                          .then(function () { console.log("Applied Filter Successfully"); })
                          .catch(function (err) { console.error(err) });
                  }
              }
          });

      }
  });
}

// Get models. models contains enums that can be used.
var models = window['powerbi-client'].models;

// Embed configuration used to describe the what and how to embed.
// This object is used when calling powerbi.embed.
// This also includes settings and options such as filters.
// You can find more information at https://github.com/Microsoft/PowerBI-JavaScript/wiki/Embed-Configuration-Details.
var config = {
  type: 'report',
  tokenType: models.TokenType.Embed,
  accessToken: accessToken,
  embedUrl: embedUrl,
  id: embedReportId,
  permissions: models.Permissions.All,
  settings: {
      filterPaneEnabled: false,
      navContentPaneEnabled: false
  }
};

// Get a reference to the embedded report HTML element
var reportContainer = $('#reportContainer')[0];

var report = powerbi.embed(reportContainer, config);

if (pageFilters) {
  report.on('loaded', function () {
    applyGlobalFilters();
  });
}

function applyGlobalFilters() {
  report.getPages().then(function (pages) {
      //applyPageFilters(pages, 0);
      for (var i = 0; i < pages.length; i++) {
          if (pageFilters[pages[i].name] !== null && pageFilters[pages[i].name].length > 0) {
              pages[i].setFilters(pageFilters[pages[i].name]);
          }
      }
  });
}

function applyPageFilters(pages, i) {
  if (i < pages.length) return new Promise(function (resolve, reject) {
      if (pageFilters[pages[i].name] !== null && pageFilters[pages[i].name].length > 0) {
          pages[i].setFilters(pageFilters[pages[i].name]).then(function () { resolve(); });
      }
  }).then(applyPageFilters.bind(null, pages, i + 1));
  else return Promise.resolve();
}

function addAdvancedFilter(table, column, logicaloperator, conditions) {
  var advFilter = {
      $schema: "http://powerbi.com/product/schema#advanced",
      target: {
          table: table,
          column: column
      },
      logicalOperator: logicaloperator,
      conditions: conditions,
      filterType: models.FilterType.Advanced
  };

  addFilter(advFilter);
}

function addBasicFilter(table, column, operator, values) {
  var basicFilter = {
      $schema: "http://powerbi.com/product/schema#basic",
      target: {
          table: table,
          column: column
      },
      operator: operator,
      values: values,
      filterType: models.FilterType.Basic
  };

  addFilter(basicFilter);
}

function addFilter(filter) {
  report.getFilters().then(function (allReportFilters) {

      //if a filter for this table and column already exists, remove it before applying the new filter
      var newFilters = allReportFilters.filter(function (f) {
          return f.target.table !== filter.target.table ||
              f.target.column !== filter.target.column;
      });

      newFilters.push(filter);

      // Set filters
      // https://microsoft.github.io/PowerBI-JavaScript/interfaces/_src_ifilterable_.ifilterable.html#setfilters
      report.setFilters(newFilters);
  });
}

function removeFilter(table, column) {
  report.getFilters().then(function (allReportFilters) {

      //if a filter for this table and column already exists, remove it before applying the new filter
      var newFilters = allReportFilters.filter(function (f) {
          return f.target.table !== table ||
              f.target.column !== column;
      });

      // Set filters
      // https://microsoft.github.io/PowerBI-JavaScript/interfaces/_src_ifilterable_.ifilterable.html#setfilters
      report.setFilters(newFilters);
  });
}

function getSlicerJSON() {
  return getAllSlicers().then(function (i) { return JSON.stringify(i); });
}

function getPageSlicers(pages, slicers, i) {
  if (i < pages.length) return new Promise(function (resolve, reject) {
      var pageName = pages[i].name;
      pages[i].getVisuals()
          .then(function (visuals) {
              getSlicerState(visuals, slicers, pageName, 0).then(function (i) { resolve(i); });
          });
  }).then(getSlicerState.bind(null, pages, slicers, i + 1));
  else return Promise.resolve(slicers);
}

function getSlicerState(visuals, slicers, page, i) {
  //console.log("counter: " + i);
  if (i < visuals.length) return new Promise(function (resolve, reject) {
      var visualName = visuals[i].name;

      if (visuals[i].type === "slicer") {
          return visuals[i].getSlicerState()
              .then(function (state) {
                  if (!state.message)
                      slicers.push({ page: page, slicer: visualName, state: state });
                  resolve(slicers);
              })
              .catch(function (err) {
                  if (err.message !== 'visualConfigIsNotInitialized')
                      console.log(err);
                  resolve(slicers);
              });
      }
      else {
          resolve(slicers);
      }
  }).then(getSlicerState.bind(null, visuals, slicers, page, i + 1));
  else return Promise.resolve(slicers);

}

function getAllSlicers() {
  var pageSlicers = [];
  return report.getPages().then(function (pages) {            
      return getPageSlicers(pages, pageSlicers, 0);
  });
}

Array.prototype.checkIfExists = function (property, value) {
  return this.map(function (i) { return i[property] }).indexOf(value) === -1 ? false : true;
};

Array.prototype.getById = function (property, value) {
  return this.find(function (i) { return i[property] === value; });
};