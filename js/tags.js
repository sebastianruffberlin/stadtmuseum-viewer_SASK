// christopher pietsch
// cpietsch@gmail.com
// V2 updated for stadtmuseum-viewer to handle flat_tags and nested_keywords

function Tags() {
  var state = {
    active: [],
    scope: [],
  };

  var dispatch = d3.dispatch("change");
  var data, config;
  var tagsContainer;

  function tags(selection) {
    tagsContainer = selection;
    tags.update();
  }

  tags.init = function (_data, _config) {
    data = _data;
    config = _config;
    tags.update();
  };

  tags.update = function () {
    //
    // NEUE LOGIK: Verarbeitet `flat_tags` und `nested_keywords`
    //
    var allTags = new Map();

    data.forEach(function (d) {
      // 1. Verarbeite `flat_tags`
      if (d.flat_tags) {
        const flatTags = d.flat_tags.split(',').map(t => t.trim());
        flatTags.forEach(tag => {
          if (!tag) return;
          if (!allTags.has(tag)) {
            allTags.set(tag, { isNested: false, items: new Set() });
          }
        });
      }

      // 2. Verarbeite `nested_keywords`
      if (d.nested_keywords) {
        const nestedKeywords = d.nested_keywords.split(';').map(t => t.trim());
        nestedKeywords.forEach(pair => {
          if (!pair) return;
          const parts = pair.split('>');
          if (parts.length !== 2) return;
          const category = parts[0].trim();
          const value = parts[1].trim();
          
          if (!allTags.has(category)) {
            allTags.set(category, { isNested: true, items: new Set() });
          }
          allTags.get(category).items.add(value);
        });
      }
    });
    
    //
    // UI ERSTELLEN
    //
    tagsContainer = d3.select('.filter').html(""); // Leert den alten Filter-Container

    allTags.forEach((tagData, tagName) => {
        
      const outer = tagsContainer.append('div').attr('class', 'topfilter');
      outer.append('div').attr('class', 'title').text(tagName);
      const itemsContainer = outer.append('div').attr('class', 'items');

      if (tagData.isNested) {
          // Erstelle Unter-Buttons für verschachtelte Keywords
          const sortedItems = Array.from(tagData.items).sort();
          sortedItems.forEach(item => {
              const el = itemsContainer.append('div')
                  .attr('class', 'item')
                  .attr('data-tag', `${tagName}>${item}`)
                  .text(item);

              el.on('click', function () {
                  tags.toggle(this, `${tagName}>${item}`);
              });
          });
      } else {
          // Erstelle einen einzelnen An/Aus-Button für flache Tags
          const el = itemsContainer.append('div')
              .attr('class', 'item')
              .attr('data-tag', tagName)
              .text(tagName); // oder ein anderer Text

          el.on('click', function () {
              tags.toggle(this, tagName);
          });
      }
    });
  };

  tags.toggle = function (element, tag) {
    var e = d3.select(element);
    var alreadyActive = e.classed("active");
    e.classed("active", !alreadyActive);

    var tagIndex = state.active.indexOf(tag);
    if (tagIndex != -1) {
      state.active.splice(tagIndex, 1);
    } else {
      state.active.push(tag);
    }
    dispatch.change(state);
  };

  tags.reset = function () {
    state.active = [];
    d3.selectAll(".item").classed("active", false);
    dispatch.change(state);
  };
  
  d3.rebind(tags, dispatch, "on");
  return tags;
}
