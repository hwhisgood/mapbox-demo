<template>
  <el-container>
    <el-header>
      <el-row class="boxoption">
        <el-select v-model="value" id="menu" clearable>
          <el-option id="streets-v11" label="3D地图" value="streets-v11"></el-option>
          <el-option id="satellite-v9" label="卫星地图" value="satellite-v9"></el-option>
          <el-option id="light-v10" label="平面地图" value="light-v10"></el-option>
        </el-select>
      </el-row>
    </el-header>
    <el-main>
      <div id="map1"></div>
      <div id="distance3" class="distance-container3">
        <span>单击地图上的点:</span>
      </div>
      <div class="calculation-box3">
        <p><strong>范围内面积:</strong></p>
        <div id="calculated-area3"></div>
      </div>
    </el-main>
    <div></div>
  </el-container>
</template>
<script setup>
// import "@/assets/js/mapboxgl-control-minimap.js";
// import mapboxgl from "mapbox-gl";
// import MapboxLanguage from "@mapbox/mapbox-gl-language";
// import "mapbox-gl/dist/mapbox-gl.css";
// import MapboxGeocoder3 from "@mapbox/mapbox-gl-geocoder";
// import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
// import MapboxDraw3 from "@mapbox/mapbox-gl-draw";
// import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
// import * as turf3 from "@turf/turf";
import { onMounted } from "vue";

const value2 = "全部";
const value3 = "所有源";
const value1 = 2019;
const value = "streets-v11";

onMounted(this.init());

// initialization
const init = function () {
  mapboxgl.accessToken =
    "pk.eyJ1IjoibHVrYXNtYXJ0aW5lbGxpIiwiYSI6ImNpem85dmhwazAyajIyd284dGxhN2VxYnYifQ.HQCmyhEXZUTz3S98FMrVAQ";
  // 英文标注转换为中文
  mapboxgl.setRTLTextPlugin(
    "https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.2.3/mapbox-gl-rtl-text.js"
  );
  let map1 = new mapboxgl.Map({
    style: "mapbox://styles/mapbox/streets-v10",
    center: [117.18, 34.27],
    zoom: 15.5,
    pitch: 45,
    bearing: -17.6,
    container: "map1",
  });
  map1.on("load", function () {
    map1.addControl(
      new mapboxgl.Minimap({
        center: [117.18, 34.27],
        zoom: 8,
        zoomLevels: [],
      }),
      "top-left"
    );
  });
  // 更换地图类型
  var inputs = document.querySelectorAll(".el-scrollbar__view >li");

  function switchLayer(layer) {
    var layerId = layer.target.id;
    map1.setStyle("mapbox://styles/mapbox/" + layerId);
  }

  for (var i = 0; i < inputs.length; i++) {
    inputs[i].onclick = switchLayer;
  }
  // 两点间距离
  var distanceContainer = document.getElementById("distance3");

  // GeoJSON object to hold our measurement features
  var geojson = {
    type: "FeatureCollection",
    features: [],
  };

  // Used to draw a line between points
  var linestring = {
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates: [],
    },
  };

  map1.on("load", function () {
    map1.addSource("geojson", {
      type: "geojson",
      data: geojson,
    });

    // Add styles to the map1
    map1.addLayer({
      id: "measure-points",
      type: "circle",
      source: "geojson",
      paint: {
        "circle-radius": 10,
        "circle-color": "#ff0000",
      },
      filter: ["in", "$type", "Point"],
    });
    map1.addLayer({
      id: "measure-lines",
      type: "line",
      source: "geojson",
      layout: {
        "line-cap": "round",
        "line-join": "round",
      },
      paint: {
        "line-color": "#ff0000",
        "line-width": 4.5,
      },
      filter: ["in", "$type", "LineString"],
    });

    map1.on("click", function (e) {
      var features = map1.queryRenderedFeatures(e.point, {
        layers: ["measure-points"],
      });

      // Remove the linestring from the group
      // So we can redraw it based on the points collection
      if (geojson.features.length > 1) geojson.features.pop();

      // Clear the Distance container to populate it with a new value
      distanceContainer.innerHTML = "选择：起点/终点";

      // If a feature was clicked, remove it from the map
      if (features.length) {
        var id = features[0].properties.id;
        geojson.features = geojson.features.filter(function (point) {
          return point.properties.id !== id;
        });
      } else {
        var point = {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [e.lngLat.lng, e.lngLat.lat],
          },
          properties: {
            id: String(new Date().getTime()),
          },
        };

        geojson.features.push(point);
      }

      if (geojson.features.length > 1) {
        linestring.geometry.coordinates = geojson.features.map(function (point) {
          return point.geometry.coordinates;
        });

        geojson.features.push(linestring);

        // Populate the distanceContainer with total distance
        var value = document.createElement("pre");
        value.textContent = "距离: " + turf3.length(linestring).toLocaleString() + "km";
        distanceContainer.appendChild(value);
      }

      map1.getSource("geojson").setData(geojson);
    });
  });

  //  map1.on('mousemove', function (e) {
  //    var features = map1.queryRenderedFeatures(e.point, {
  //      layers: ['measure-points']
  //    })
  // // UI indicator for clicking/hovering a point on the map
  //    map1.getCanvas().style.cursor = features.length
  //             ? 'pointer'
  //             : 'crosshair'
  //  })
  // 定位搜索
  var coordinatesGeocoder = function (query) {
    // match anything which looks like a decimal degrees coordinate pair
    var matches = query.match(
      /^[ ]*(?:Lat: )?(-?\d+\.?\d*)[, ]+(?:Lng: )?(-?\d+\.?\d*)[ ]*$/i
    );
    if (!matches) {
      return null;
    }

    function coordinateFeature(lng, lat) {
      return {
        center: [lng, lat],
        geometry: {
          type: "Point",
          coordinates: [lng, lat],
        },
        place_name: "Lat: " + lat + " Lng: " + lng, // eslint-disable-line camelcase
        place_type: ["coordinate"], // eslint-disable-line camelcase
        properties: {},
        type: "Feature",
      };
    }

    var coord1 = Number(matches[1]);
    var coord2 = Number(matches[2]);
    var geocodes = [];

    if (coord1 < -90 || coord1 > 90) {
      // must be lng, lat
      geocodes.push(coordinateFeature(coord1, coord2));
    }

    if (coord2 < -90 || coord2 > 90) {
      // must be lat, lng
      geocodes.push(coordinateFeature(coord2, coord1));
    }

    if (geocodes.length === 0) {
      // else could be either lng, lat or lat, lng
      geocodes.push(coordinateFeature(coord1, coord2));
      geocodes.push(coordinateFeature(coord2, coord1));
    }
    return geocodes;
  };
  map1.addControl(
    new MapboxGeocoder3({
      accessToken: mapboxgl.accessToken,
      localGeocoder: coordinatesGeocoder,
      zoom: 4,
      placeholder: "搜索",
      mapboxgl: mapboxgl,
    })
  );
  // 设置语言
  map1.addControl(
    new MapboxLanguage({
      defaultLanguage: "zh",
    })
  );
  // 范围内面积
  var draw = new MapboxDraw3({
    displayControlsDefault: false,
    controls: {
      polygon: true,
      trash: true,
    },
  });
  map1.addControl(draw);

  map1.on("draw.create", updateArea);
  map1.on("draw.delete", updateArea);
  map1.on("draw.update", updateArea);

  function updateArea(e) {
    var data = draw.getAll();
    var answer = document.getElementById("calculated-area3");
    if (data.features.length > 0) {
      var area = turf3.area(data);
      // restrict to area to 2 decimal points
      var roundedArea = Math.round(area * 100) / 100;
      answer.innerHTML =
        '<p style="margin: 5px"><strong>' +
        roundedArea +
        '</strong></p><p style="margin: 5px">单位/平方米</p>';
    } else {
      answer.innerHTML = "";
      if (e.type !== "draw.delete") {
        alert("Use the draw tools to draw a polygon!");
      }
    }
  }

  // 定位
  map1.addControl(
    new mapboxgl.GeolocateControl({
      positionOptions: {
        // true设备能够提供更准确的位置
        enableHighAccuracy: true,
        // enableHighAccuracy: false,
        timeout: 6000,
      },
      trackUserLocation: true,
      // 显示用户位置所在点
      showUserLocation: true,
    })
  );
  // 导航控件
  map1.addControl(new mapboxgl.NavigationControl());
  // 比例尺
  let scale = new mapboxgl.ScaleControl({
    maxWidth: 80,
    unit: "imperial",
  });
  map1.addControl(scale);
  scale.setUnit("metric");
  // 全图
  map1.addControl(new mapboxgl.FullscreenControl());
  // The 'building' layer in the mapbox-streets vector source contains building-height
  // data from OpenStreetMap.
  map1.on("load", () => {
    // Insert the layer beneath any symbol layer.
    let layers = map1.getStyle().layers;

    let labelLayerId;
    for (let i = 0; i < layers.length; i++) {
      if (layers[i].type === "symbol" && layers[i].layout["text-field"]) {
        labelLayerId = layers[i].id;
        break;
      }
    }

    // 增加一个空数据
    map1.addSource("currentBuildings", {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: [],
      },
    });
    // 增加一个图层，由于数据为空，所以不会展示东西。
    // map1.addLayer({
    //   'id': 'highlight',
    //   'source': 'currentBuildings',
    //   'type': 'line',
    //   'minzoom': 15,
    //   'paint': {
    //     'line-color': '#f00',
    //     'line-width': 5
    //   }
    // }, labelLayerId)
    // map1.on('click', '3d-buildings', function (e) {
    //   // 动态的设置 highlight  图层的数据源
    //   map1.getSource('currentBuildings').setData({
    //     'type': 'FeatureCollection',
    //     'features': e.features
    //   })
    // })
    map1.addLayer({
      id: "room-extrusion",
      type: "fill-extrusion",
      source: {
        type: "geojson",
        data: {
          features: [
            {
              type: "Feature",
              properties: {
                level: 1,
                name: "Bird Exhibit",
                height: 10,
                base_height: 0,
                color: "red",
              },
              geometry: {
                coordinates: [
                  [
                    [117.192402, 34.271805],
                    [117.197666, 34.272043],
                    [117.196858, 34.269612],
                    [117.194558, 34.269627],
                  ],
                ],
                type: "Polygon",
              },
              id: "08a10ab2bf15c4d14669b588062f7f08",
            },
            {
              type: "Feature",
              properties: {
                level: 1,
                name: "Ancient Egypt",
                height: 30,
                base_height: 0,
                color: "blue",
              },
              geometry: {
                coordinates: [
                  [
                    [117.192402, 34.271805],
                    [117.197666, 34.272043],
                    [117.196858, 34.269612],
                    [117.194558, 34.269627],
                  ],
                ],
                type: "Polygon",
              },
            },
          ],
          type: "FeatureCollection",
        },
      },
      paint: {
        "fill-extrusion-color": ["get", "color"],
        "fill-extrusion-height": ["get", "height"],
        "fill-extrusion-base": ["get", "base_height"],
        "fill-extrusion-opacity": 0.5,
      },
    });
    map1.addLayer(
      {
        id: "3d-buildings",
        source: "composite",
        "source-layer": "building",
        filter: ["==", "extrude", "true"],
        type: "fill-extrusion",
        minzoom: 15,
        paint: {
          "fill-extrusion-color": "#aaa",

          // use an 'interpolate' expression to add a smooth transition effect to the
          // buildings as the user zooms in
          "fill-extrusion-height": [
            "interpolate",
            ["linear"],
            ["zoom"],
            15,
            0,
            15.05,
            ["get", "height"],
          ],
          "fill-extrusion-base": [
            "interpolate",
            ["linear"],
            ["zoom"],
            15,
            0,
            15.05,
            ["get", "min_height"],
          ],
          "fill-extrusion-opacity": 0.6,
        },
      },
      labelLayerId
    );
  });
};
</script>

<style scoped>
@import url("https://api.tiles.mapbox.com/mapbox-gl-js/v0.51.0/mapbox-gl.css");
.el-header,
.el-footer {
  color: #333;
  text-align: left;
  line-height: 40px;
  height: 150px;
}
.el-main {
  padding: 0;
}
#map1 {
  color: #333;
  text-align: left;
  min-height: 100vh;
  width: 100%;
  overflow: hidden;
  border: 0;
}

.body {
  margin: 0;
  padding: 0;
}
.year {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.boxoption {
  margin-top: 10px;
}
.distance-container3 {
  position: absolute;
  top: 50%;
  left: 4%;
  z-index: 100;
  background-color: rgba(0, 0, 0, 0.5);
  color: #fff;
  font-size: 14px;
  line-height: 18px;
  font-weight: bolder;
  display: block;
  margin: 0;
  padding: 5px 10px;
  border-radius: 3px;
}

.calculation-box3 {
  z-index: 100;
  border-radius: 3px;
  /*height: 75px;*/
  width: 122px;
  position: absolute;
  bottom: 50%;
  left: 4%;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 5px;
  text-align: center;
  color: #fff;
}

.calculation-box3 > p {
  font-family: "Open Sans";
  margin: 0;
  font-size: 13px;
}
</style>
