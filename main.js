import './style.css';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON.js';

import { fromLonLat } from 'ol/proj';

import Style from 'ol/style/Style.js';
import Stroke from 'ol/style/Stroke.js';
import Fill from 'ol/style/Fill.js';
import CircleStyle from 'ol/style/Circle.js';

import Text from 'ol/style/Text.js';

import Overlay from 'ol/Overlay.js';

//-----------------------------------------------------------DEFINOVANIE STYLOV-------------------------------------------------------
//styl pre geomorfologicke celky
const style_g1 = function (feature) {

  const geocelok = feature.get('gc');

  return new Style({
    stroke: new Stroke({
      color: '#6d4500',
      width: 2,
    }),
    text: new Text({
      text: feature.get('gc'),
      font: '20px Calibri,sans-serif',
      fill: new Fill({
        color: '#572a06',
      }),
      stroke: new Stroke({
        color: '#ffffff',
        width: 3,
      }),
    }),
  });
};

//styl pre geomorfologicke jednotky
const style_g11 = function (feature) {

  const jednotka = feature.get('gac');

  return new Style({
    stroke: new Stroke({
      color: '#6a4607',
      width: 0.7,
    }),
    fill: new Fill({
      color: 'rgba(0,0,0,0)',
    }),
    text: new Text({
      text: feature.get('gac'),
      font: '12px Calibri,sans-serif',
      fill: new Fill({
        color: '#000000',
      }),
      stroke: new Stroke({
        color: '#ffffff',
        width: 3,
      }),
    }),
  });
};

//styl pre geologicke oblasti
const farby = {
  "Bradlové pásmo": "#659adfd2",
  "Flyšové pásmo": "#ebb64bd9",
  "Gemerské pásmo": "#eb6f6fd8",
  "Jadrové pásmo": "#8a5a3cd7",
  "Neogénne kotliny": "#67e853dc",
  "Neovulkanické pohoria": "#e8605be7",
  "Veporské pásmo": "#d9e14c",
  "Vnútrokarpatský paleogén": "#e69655"
};

const style_g2 = function (feature) {
  const geocelok = feature.get('geocelok');
  return new Style({
    fill: new Fill({
      color: farby[geocelok] || 'rgba(200,200,200,0.5)',
    }),
  });
};

//styl pre obce
const style_obce = function (feature) {
  return new Style({
    image: new CircleStyle({
      radius: 5,
      fill: new Fill({
        color: '#ffffff',
      }),
      stroke: new Stroke({
        color: '#000000',
        width: 1,
      }),
    }),
    text: new Text({
      text: feature.get('OBEC'),
      font: '14px Calibri,sans-serif',
      offsetY: -15,
      fill: new Fill({
        color: '#000000',
      }),
      stroke: new Stroke({
        color: '#ffffff',
        width: 3,
      }),
    }),
  });
};

//-----------------------------------------------------------DEFINOVANIE VRSTIEV-------------------------------------------------------
//geomorfologia
const geomorfologicke_celky = new VectorLayer({
  source: new VectorSource({
    url: import.meta.env.BASE_URL + '/geomorfologicke_celky-atlas.geojson',
    format: new GeoJSON(),
  }),
  style: style_g1,
  title: 'Geomorfologické celky',
  visible: true,
  opacity: 1,
  minResolution: 0,
  maxResolution: 500,
});

const geomorfologicke_jednotky = new VectorLayer({
  source: new VectorSource({
    url: import.meta.env.BASE_URL + '/geomorfologicke_jednotky.geojson',
    format: new GeoJSON(),
  }),
  style: style_g11,
  title: 'Geomorfologické jednotky',
  visible: true,
  opacity: 1,
  minResolution: 0,
  maxResolution: 200,
});

const geologicke_oblasti = new VectorLayer({
  source: new VectorSource({
    url: import.meta.env.BASE_URL + '/geomorfologicke_oblasti.geojson',
    format: new GeoJSON(),
  }),
  style: style_g2,
  title: 'Geologické pásma',
  visible: true,
  opacity: 0.5,
});

//osm
const osm = new TileLayer({
  source: new OSM(),
  title: 'Open Street Map',
});

//suradnice
const coords = fromLonLat([17.1077, 48.1486], 'EPSG:3857') //coords je pole s prevedenymi suradnicami z kartezskych na sfericke
const obce_sur = { //objekt s mestami a ich sferickymi suradnicami
  topolcany: fromLonLat([18.1769, 48.5607]),
  lucenec: fromLonLat([19.6694, 48.3307]),
  dvorany: fromLonLat([18.1175, 48.4894]),
  lovinobana: fromLonLat([19.5912, 48.4376]),
}

//------------------------------------------------------------------------VIEW----------------------------------------------------------------
const view = new View({
  center: obce_sur.topolcany,
  zoom: 9,
  minZoom: 7,
});


//------------------------------------------------------------------------MAPA----------------------------------------------------------------
const map = new Map({
  target: 'map',
  layers: [
    osm,
    geologicke_oblasti,
    geomorfologicke_celky,
    geomorfologicke_jednotky,
  ],
  view: view,
});

geomorfologicke_celky.getSource().on('featuresloadend', function () {
  console.log(
    geomorfologicke_celky.getSource().getFeatures().length
  );
});

//---------------------------------------------------------PANEL S VRSTVAMI------------------------------------------------------------
const layerPanelEl = document.getElementById('panel');
/**
 * Creates a single UI control set (checkbox, layer title, opacity slider) for a given OpenLayers layer.
 * @param {import('ol/layer/Layer').default} layer The OpenLayers layer object.
 * @returns {HTMLParagraphElement} A paragraph element containing the layer controls.
 */
function createLayerControl(layer) {
  const p = document.createElement('p'); // Container for layer controls

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.checked = layer.getVisible(); // Reflect layer's initial visibility

  const titleSpan = document.createElement('span');
  titleSpan.innerText = layer.get('title'); // Display layer's title

  const opacitySlider = document.createElement('input');
  opacitySlider.type = 'range';
  opacitySlider.min = 0;
  opacitySlider.max = 1;
  opacitySlider.step = 0.1;
  opacitySlider.value = layer.getOpacity(); // Reflect layer's initial opacity
  opacitySlider.style.width = '200px';
  opacitySlider.style.cursor = 'pointer';

  // --- Event Listeners for UI interaction ---

  // When opacity slider is moved, update the layer
  opacitySlider.addEventListener('input', () => {
    const opacity = Number(opacitySlider.value);
    layer.setOpacity(opacity);
    // If opacity is > 0, the layer should be visible. If 0, it should be hidden.
    layer.setVisible(opacity > 0);
  });

  // When checkbox is toggled, update the layer
  checkbox.addEventListener('change', () => {
    const isChecked = checkbox.checked;
    layer.setVisible(isChecked);
    // If checking the box and opacity is 0, set to 1. If unchecking, set opacity to 0.
    if (isChecked && layer.getOpacity() === 0) {
      layer.setOpacity(1);
    } else if (!isChecked) {
      layer.setOpacity(0);
    }
  });

  // --- Event Listeners for Layer property changes ---
  // These listeners ensure the UI stays in sync if the layer is changed programmatically.

  // Update slider position if layer opacity changes
  layer.on('change:opacity', () => {
    opacitySlider.value = layer.getOpacity();
  });

  // Update checkbox state if layer visibility changes
  layer.on('change:visible', () => {
    checkbox.checked = layer.getVisible();
  });

  // Append controls to the paragraph element
  p.appendChild(checkbox);
  p.appendChild(titleSpan);
  p.appendChild(opacitySlider);
  return p;
}

//pridanie panela do mapy
initLayerPanel(map);

/**
* Renders or re-renders the layer control panel based on the current map layers.
* Clears existing panel content and rebuilds it.
* @param {import('ol/Map').default} map The OpenLayers map instance.
*/
function renderLayerPanel(map) {
  if (!layerPanelEl) return; // Exit if panel element not found
  layerPanelEl.innerHTML = ''; // Clear previous controls
  map.getLayers().forEach(layer => {
    const control = createLayerControl(layer);
    layerPanelEl.appendChild(control);
  });
}

/**
 * Initializes the layer control panel and sets up an event listener
 * to automatically re-render the panel when the number of layers on the map changes.
 * @param {import('ol/Map').default} map The OpenLayers map instance.
 */
export function initLayerPanel(map) {
  renderLayerPanel(map); // Initial rendering of the panel
  // Re-render panel if layers are added or removed from the map
  map.getLayers().on('change:length', () => renderLayerPanel(map));
}

//-----------------------------------------------------------------INTERAKCIE---------------------------------------------------------
const nazvyAtributov = {
  objectid: "ID",
  s: "Sústava",
  ps: "Podsústava",
  p: "Provincia",
  sp: "Subprovincia",
  go: "Oblasť",
  gc: "Celok",
  gp: "Podcelok",
  gac: "Jednotka",
};

map.on('singleclick', function (evt) {

  let foundFeature = null;

  map.forEachFeatureAtPixel(evt.pixel, function (feature, layer) {

    if (layer === geomorfologicke_jednotky) {
      foundFeature = feature;
      return true;
    }

  });


  if (foundFeature) {

    const properties = foundFeature.getProperties();

    let table = `
      <h3>Geomorfologická jednotka</h3>
      <table>
    `;


    Object.keys(properties).forEach(key => {

      if (key !== 'geometry') {
        table += `
          <tr>
            <th>${nazvyAtributov[key] || key}</th>
            <td>${properties[key]}</td>
          </tr>
        `;
      }

    });


    table += '</table>';

    popupContent.innerHTML = table;

    popupOverlay.setPosition(evt.coordinate);

  } else {

    popupOverlay.setPosition(undefined);

  }

});

//---------------------------------------------------------------POP-UP--------------------------------------------------------------
const popupContainer = document.getElementById('popup');
const popupContent = document.getElementById('popup-content');
const popupCloser = document.getElementById('popup-closer');

const popupOverlay = new Overlay({
  element: popupContainer,
  autoPan: {
    animation: {
      duration: 250,
    },
  },
});

map.addOverlay(popupOverlay);


popupCloser.onclick = function () {
  popupOverlay.setPosition(undefined);
  popupCloser.blur();
  return false;
};

//----------------------------------------------------------------------------INFO-------------------------------------------------------------
const sourceButton = document.getElementById('source-button');
const sourcePanel = document.getElementById('source-panel');
const closeSource = document.getElementById('close-source');


sourceButton.addEventListener('click', () => {
  sourcePanel.classList.remove('hidden');
});


closeSource.addEventListener('click', () => {
  sourcePanel.classList.add('hidden');
});