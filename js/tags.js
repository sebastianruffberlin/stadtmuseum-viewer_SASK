// christopher pietsch
// cpietsch@gmail.com
// V2.1 - Angepasst für die neue Flexbox-basierte CSS-Struktur

function Tags() {
  var state = {
    active: [],
    scope: [],
  };

  var dispatch = d3.dispatch("change");
  var data, config;
  var tagsContainer; // Diese Variable wird jetzt den richtigen Container referenzieren

  function tags(selection) {
    // Diese Funktion wird nicht mehr direkt genutzt, wir verwenden stattdessen tags.init
  }

  tags.init = function (_data, _config) {
    data = _data;
    config = _config;
    tags.update();
  };

  tags.update = function () {
    var allTags = new Map();

    // Ihre Logik zum Parsen der CSV-Daten ist bereits perfekt und bleibt unverändert.
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
    // ===== HIER IST DIE EINZIGE ÄNDERUNG =====
    // Wir wählen den korrekten Container '#filter-container' anstatt '.filter'.
    tagsContainer = d3.select('#filter-container').html(""); 

    // Die folgende Logik zum Erstellen der HTML-Elemente ist bereits perfekt
    // und erzeugt genau die Struktur, die unsere neue CSS-Datei erwartet.
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
          // Für flache Tags wird die Gruppe einfach nur einen Button haben.
          // Die CSS (Flexbox) sorgt dafür, dass es korrekt angezeigt wird.
          const el = itemsContainer.append('div')
              .attr('class', 'item')
              .attr('data-tag', tagName)
              .text(tagName);

          el.on('click', function () {
              tags.toggle(this, tagName);
          });
      }
    });
  };

  // Diese Funktion zum Umschalten der Filter ist perfekt und bleibt unverändert.
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

  // Diese Funktion zum Zurücksetzen ist ebenfalls perfekt.
  tags.reset = function () {
    state.active = [];
    d3.selectAll(".item").classed("active", false);
    dispatch.change(state);
  };
  
  d3.rebind(tags, dispatch, "on");
  return tags;
}
