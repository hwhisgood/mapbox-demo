/**
 * Created by baidm in 2021/7/18 on 8:35
 */
import MapLayerConst from "@/consts/MapLayerConst"
import {mapCerter, mapZoom, mapBearing, mapPitch} from "@/consts/MapConfigConst"

class MapboxCommonService {
    constructor() {

    }

    hasMap(map) {
        if (!map) {
            console.error("map is error!", map);
            return false;
        }
        if (!_.isObject(map)) {
            console.error("map is error!", map);
            return false;
        }
        this.setCZBP(map);
        return true
    }

    /**
     * 移除图层
     * @param map
     * @param layerId
     */
    removeLayer(map, layerId) {
        if (!this.hasMap(map)) return;

        map.getLayer(layerId) && map.removeLayer(layerId);
        return map;
    }

    /**
     * 移除图像
     * @param map
     * @param imageId
     */
    removeImage(map, imageId) {
        if (!this.hasMap(map)) return;

        map.hasImage(imageId) && map.removeImage(imageId);
        return map;
    }

    /**
     * 移除数据源
     * @param map
     * @param sourceId
     */
    removeSource(map, sourceId) {
        if (!this.hasMap(map)) return;

        map.getSource(sourceId) && map.removeSource(sourceId);
        return map;
    }

    /**
     * 计算边界
     * @param coordsArr
     * @returns {*[]|*}
     */
    computeMinMaxCoords(coordsArr) {
        if (coordsArr.length > 1) {
            let minX, minY, maxX, maxY;
            _.forEach(coordsArr, coords => {
                if (minX > 0 && minY > 0 && maxX > 0 && maxY > 0) {
                    minX = minX < coords[0] ? minX : coords[0];
                    minY = minY < coords[1] ? minY : coords[1];
                    maxX = maxX > coords[0] ? maxX : coords[0];
                    maxY = maxY > coords[1] ? maxY : coords[1];
                } else {
                    [minX, minY] = coords;
                    [maxX, maxY] = coords;
                }
            });
            return [minX, minY, maxX, maxY]
        }
        return coordsArr;
    }

    /**
     * 设置中心点、层级、方位角、倾斜度
     * @param map
     * @param coords
     * @param zoom
     * @param bearing
     * @param pitch
     * @returns {*}
     */
    setCZBP(map, coords = mapCerter, zoom = mapZoom, bearing = mapBearing, pitch = mapPitch) {
        map.setCenter(coords);
        map.setZoom(zoom);
        map.setBearing(bearing);
        map.setPitch(pitch);
        return map;
    }

    /**
     * 设置视野
     * @param map
     * @param coordsArr
     * @param options
     * @returns {*}
     */
    setViewWithCoords(map, coordsArr, options = {}) {
        let resCoordsArr = this.computeMinMaxCoords(coordsArr);
        if (resCoordsArr.length > 1) {
            map.fitBounds(resCoordsArr, {
                padding: {top: 25, bottom: 25, left: 15, right: 15},
                linear: true,
                offset: options.offset || [0, 0]
            });
        } else if (resCoordsArr.length === 1) {
            this.setCZBP(map, ...resCoordsArr);
        }
        return map;
    }

    /**
     * 添加 custom point
     * @param map
     * @param coords
     * @param options
     */
    addCustomPoint(map, coords = mapCerter, options = {}) {
        if (!this.hasMap(map)) return;

        let size = 200;
        let pulsingDot = {
            width: size,
            height: size,
            data: new Uint8Array(size * size * 4),

            onAdd: function () {
                let canvas = document.createElement("canvas");
                canvas.width = this.width;
                canvas.height = this.height;
                this.context = canvas.getContext("2d");
            },

            render: function () {
                let duration = 1000;
                let t = (performance.now() % duration) / duration;

                let radius = size / 2 * 0.3;
                let outerRadius = size / 2 * 0.7 * t + radius;
                let context = this.context;

                // draw outer circle
                context.clearRect(0, 0, this.width, this.height);
                context.beginPath();
                context.arc(this.width / 2, this.height / 2, outerRadius, 0, Math.PI * 2);
                context.fillStyle = "rgba(255, 200, 200," + (1 - t) + ")";
                context.fill();

                // draw inner circle
                context.beginPath();
                context.arc(this.width / 2, this.height / 2, radius, 0, Math.PI * 2);
                context.fillStyle = "rgba(255, 100, 100, 1)";
                context.strokeStyle = "white";
                context.lineWidth = 2 + 4 * (1 - t);
                context.fill();
                context.stroke();

                // update this image"s data with data from the canvas
                this.data = context.getImageData(0, 0, this.width, this.height).data;

                // keep the map repainting
                map.triggerRepaint();

                // return `true` to let the map know that the image was updated
                return true;
            }
        };

        let imageId = "custom-point-image";
        !map.hasImage(imageId) && map.addImage(imageId, pulsingDot, {pixelRatio: 2});

        let sourceId = "custom-point-source";
        !map.getSource(sourceId) && map.addSource(sourceId, {
            "type": "geojson",
            "data": {
                "type": "FeatureCollection",
                "features": [
                    {
                        "type": "Feature",
                        "geometry": {
                            "type": "Point",
                            "coordinates": coords
                        }
                    }
                ]
            }
        });

        let layerId = options.layerId || MapLayerConst.CUSTOM_POINT_LAYER_ID;
        map.addLayer({
            "id": layerId,
            "type": "symbol",
            "source": sourceId,
            "layout": {
                "icon-image": imageId
            }
        });

        this.setViewWithCoords(map, [coords]);

        return {
            map, imageId, sourceId, layerId
        }
    }

    /**
     * 添加 icon point
     * @param map
     * @param coordsArr
     * @param options
     * @returns {{sourceId: string, layerId: (string|*), map: *}}
     */
    addIconPoint(map, coordsArr, options = {}) {
        if (!this.hasMap(map)) return;

        let sourceId = "icon-point-source";
        !map.getSource(sourceId) && map.addSource(sourceId, {
            "type": "geojson",
            "data": {
                "type": "FeatureCollection",
                "features": _.map(coordsArr, item => {
                    return {
                        "type": "Feature",
                        "geometry": {
                            "type": "Point",
                            "coordinates": item.coords
                        },
                        "properties": {
                            "title": item.title,
                            "icon": item.icon
                        }
                    }
                })
            }
        });

        let layerId = options.layerId || MapLayerConst.ICON_POINT_LAYER_ID;
        map.addLayer({
            "id": layerId,
            "type": "symbol",
            "source": sourceId,
            "layout": {
                "icon-image": "{icon}-15",
                "text-field": "{title}",
                "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
                "text-offset": [0, 0.6],
                "text-anchor": "top"
            },
        });

        // 更新视图
        this.setViewWithCoords(map, _.map(coordsArr, item => item.coords));

        return {
            map, sourceId, layerId
        }
    }

    /**
     * 添加 circle point
     * @param map
     * @param coords
     * @param options
     * @returns {{sourceId: string, layerId: (string|*), map: *}}
     */
    addCirclePoint(map, coords = mapCerter, options = {}) {
        if (!this.hasMap(map)) return;

        let sourceId = "circle-point-source";
        !map.getSource(sourceId) && map.addSource(sourceId, {
            "type": "geojson",
            "data": {
                "type": "Point",
                "coordinates": coords
            }
        });

        let layerId = options.layerId || MapLayerConst.CIRCLE_POINT_LAYER_ID;
        map.addLayer({
            "id": layerId,
            "source": sourceId,
            "type": "circle",
            "paint": {
                "circle-radius": 10,
                "circle-color": "#007cbf",
                "circle-opacity": 0.8
            }
        });

        this.setViewWithCoords(map, [coords]);

        return {
            map, sourceId, layerId
        }
    }

    /**
     * 添加 marker，支持可拖动
     * @param map
     * @param coords
     * @param options
     * @returns {{marker: *, map: *}}
     */
    addMarker(map, coords = mapCerter, options = {}) {
        if (!this.hasMap(map)) return;

        let marker = new mapboxgl.Marker({draggable: true}).setLngLat(coords).addTo(map);

        marker.on("dragend", function () {
            let lngLat = marker.getLngLat();
            console.log(`Longitude: ${lngLat.lng}，Latitude: ${lngLat.lat}`);
        });

        this.setViewWithCoords(map, [coords]);

        return {
            map, marker
        }
    }

    /**
     * 添加 line
     * @param map
     * @param coordsArr
     * @param options
     * @returns {{layerId: (string), animation: number}}
     */
    addLine(map, coordsArr, options = {}) {
        if (!this.hasMap(map)) return;

        let sourceId = "line-source";
        !map.getSource(sourceId) && map.addSource(sourceId, {
            "type": "geojson",
            "data": {
                "type": "FeatureCollection",
                "features": [
                    {
                        "type": "Feature",
                        "properties": {
                            "color": "#ed6498"
                        },
                        "geometry": {
                            "type": "LineString",
                            "coordinates": coordsArr
                        }
                    }
                ]
            }
        });

        let layerId = options.layerId || MapLayerConst.LINE_LAYER_ID;
        map.addLayer({
            "id": layerId,
            "type": "line",
            "source": sourceId,
            "layout": {
                "line-cap": "round",
                "line-join": "round"
            },
            "paint": {
                // "line-color": "#ed6498",
                "line-width": 5,
                "line-color": ["get", "color"],
                "line-opacity": .8
            }
        });

        // 更新视图
        this.setViewWithCoords(map, coordsArr);

        return {
            map, sourceId, layerId
        }
    }

    /**
     * 添加渐变 line
     * @param map
     * @param coordsArr
     * @param options
     * @returns {{sourceId: string, layerId: (string|*), map: *}}
     */
    addGradientLine(map, coordsArr, options = {}) {
        if (!this.hasMap(map)) return;

        // "line-gradient" can only be used with GeoJSON sources
        // and the source must have the "lineMetrics" option set to true
        let sourceId = "gradient-line-source";
        !map.getSource(sourceId) && map.addSource(sourceId, {
            type: "geojson",
            lineMetrics: true,
            data: {
                "type": "FeatureCollection",
                "features": [{
                    "type": "Feature",
                    "properties": {},
                    "geometry": {
                        "coordinates": coordsArr,
                        "type": "LineString"
                    }
                }]
            }
        });

        // the layer must be of type "line"
        let layerId = options.layerId || MapLayerConst.LINE_GRADIENT_LAYER_ID;
        map.addLayer({
            id: layerId,
            type: "line",
            source: sourceId,
            paint: {
                "line-color": "red",
                "line-width": 14,
                // "line-gradient" must be specified using an expression
                // with the special "line-progress" property
                "line-gradient": [
                    "interpolate",
                    ["linear"],
                    ["line-progress"],
                    0, "blue",
                    0.1, "royalblue",
                    0.3, "cyan",
                    0.5, "lime",
                    0.7, "yellow",
                    1, "red"
                ]
            },
            layout: {
                "line-cap": "round",
                "line-join": "round"
            }
        });

        // 更新视图
        this.setViewWithCoords(map, coordsArr);

        return {
            map, sourceId, layerId
        }
    }

    /**
     * 添加 area
     * @param map
     * @param options
     */
    addArea(map, options = {}) {
        if (!this.hasMap(map)) return;

        let layers = map.getStyle().layers;
        // Find the index of the first symbol layer in the map style
        let firstSymbolId;
        for (let i = 0; i < layers.length; i++) {
            if (layers[i].type === "symbol") {
                firstSymbolId = layers[i].id;
                break;
            }
        }

        let sourceId = "area-source";
        !map.getSource(sourceId) && map.addSource(sourceId, {
            "type": "geojson",
            "data": "https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_urban_areas.geojson"
        });

        let layerId = options.layerId || MapLayerConst.AREA_LAYER_ID;
        map.addLayer({
            "id": layerId,
            "type": "fill",
            "source": sourceId,
            "layout": {},
            "paint": {
                "fill-color": "#f08",
                "fill-opacity": 0.4
            }
            // This is the important part of this example: the addLayer
            // method takes 2 arguments: the layer as an object, and a string
            // representing another layer"s name. if the other layer
            // exists in the stylesheet already, the new layer will be positioned
            // right before that layer in the stack, making it possible to put
            // "overlays" anywhere in the layer stack.
            // Insert the layer beneath the first symbol layer.
        }, firstSymbolId);

        // 更新视图
        this.setViewWithCoords(map, [mapCerter]);

        return {
            map, sourceId, layerId
        }
    }

    /**
     * 添加 polygon
     * @param map
     * @param coordsArr
     * @param options
     * @returns {{sourceId: string, layerId: (string|*), map: *}}
     */
    addPolygon(map, coordsArr, options = {}) {
        if (!this.hasMap(map)) return;

        let sourceId = "polygon-source";
        !map.getSource(sourceId) && map.addSource(sourceId, {
            "type": "geojson",
            "data": {
                "type": "Feature",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": coordsArr
                }
            },
        });

        let layerId = options.layerId || MapLayerConst.POLYGON_LAYER_ID;
        map.addLayer({
            "id": layerId,
            "type": "fill",
            "source": sourceId,
            "layout": {},
            "paint": {
                "fill-color": "#ed6498",
                "fill-opacity": 0.4
            }
        });

        // 更新视图
        this.setViewWithCoords(map, _.flatten(coordsArr));

        return {
            map, sourceId, layerId
        }
    }

    /**
     * 添加 heat map
     * @param map
     * @param options
     * @returns {{heatPointLayerId: string, map: *, heatLayerId: string}}
     */
    addHeatMap(map, options = {}) {
        if (!this.hasMap(map)) return;

        // Add a geojson point source.
        // Heatmap layers also work with a vector tile source.
        let sourceId = "heat-map-source";
        !map.getSource(sourceId) && map.addSource(sourceId, {
            "type": "geojson",
            "data": "https://docs.mapbox.com/mapbox-gl-js/assets/earthquakes.geojson"
        });

        let layerId = options.layerId || MapLayerConst.HEAT_LAYER_ID;
        map.addLayer({
            "id": layerId,
            "type": "heatmap",
            "source": sourceId,
            "maxzoom": 9,
            "paint": {
                // Increase the heatmap weight based on frequency and property magnitude
                "heatmap-weight": [
                    "interpolate",
                    ["linear"],
                    ["get", "mag"],
                    0, 0,
                    6, 1
                ],
                // Increase the heatmap color weight weight by zoom level
                // heatmap-intensity is a multiplier on top of heatmap-weight
                "heatmap-intensity": [
                    "interpolate",
                    ["linear"],
                    ["zoom"],
                    0, 1,
                    9, 3
                ],
                // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
                // Begin color ramp at 0-stop with a 0-transparancy color
                // to create a blur-like effect.
                "heatmap-color": [
                    "interpolate",
                    ["linear"],
                    ["heatmap-density"],
                    0, "rgba(33,102,172,0)",
                    0.2, "rgb(103,169,207)",
                    0.4, "rgb(209,229,240)",
                    0.6, "rgb(253,219,199)",
                    0.8, "rgb(239,138,98)",
                    1, "rgb(178,24,43)"
                ],
                // Adjust the heatmap radius by zoom level
                "heatmap-radius": [
                    "interpolate",
                    ["linear"],
                    ["zoom"],
                    0, 2,
                    9, 20
                ],
                // Transition from heatmap to circle layer by zoom level
                "heatmap-opacity": [
                    "interpolate",
                    ["linear"],
                    ["zoom"],
                    7, 1,
                    9, 0
                ],
            }
        }, "waterway-label");

        this.removeLayer(map, `${layerId}_point`);
        map.addLayer({
            "id": `${layerId}_point`,
            "type": "circle",
            "source": sourceId,
            "minzoom": 7,
            "paint": {
                // Size circle radius by earthquake magnitude and zoom level
                "circle-radius": [
                    "interpolate",
                    ["linear"],
                    ["zoom"],
                    7, [
                        "interpolate",
                        ["linear"],
                        ["get", "mag"],
                        1, 1,
                        6, 4
                    ],
                    16, [
                        "interpolate",
                        ["linear"],
                        ["get", "mag"],
                        1, 5,
                        6, 50
                    ]
                ],
                // Color circle by earthquake magnitude
                "circle-color": [
                    "interpolate",
                    ["linear"],
                    ["get", "mag"],
                    1, "rgba(33,102,172,0)",
                    2, "rgb(103,169,207)",
                    3, "rgb(209,229,240)",
                    4, "rgb(253,219,199)",
                    5, "rgb(239,138,98)",
                    6, "rgb(178,24,43)"
                ],
                "circle-stroke-color": "white",
                "circle-stroke-width": 1,
                // Transition from heatmap to circle layer by zoom level
                "circle-opacity": [
                    "interpolate",
                    ["linear"],
                    ["zoom"],
                    7, 0,
                    8, 1
                ]
            }
        }, "waterway-label");

        map.easeTo({center: [-120, 50], zoom: 2});

        return {
            map, layerId
        }
    }

    /**
     * 添加 cluster
     * @param map
     * @param options
     * @returns {{layerId: (string|*), map: *}}
     */
    addCluster(map, options = {}) {
        if (!this.hasMap(map)) return;

        // Add a new source from our GeoJSON data and set the
        // "cluster" option to true. GL-JS will add the point_count property to your source data.
        let sourceId = "cluster-source";
        !map.getSource(sourceId) && map.addSource(sourceId, {
            type: "geojson",
            // Point to GeoJSON data. This example visualizes all M1.0+ earthquakes
            // from 12/22/15 to 1/21/16 as logged by USGS" Earthquake hazards program.
            data: "https://docs.mapbox.com/mapbox-gl-js/assets/earthquakes.geojson",
            cluster: true,
            clusterMaxZoom: 14, // Max zoom to cluster points on
            clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
        });

        let layerId = options.layerId || MapLayerConst.CLUSTER_LAYER_ID;
        map.addLayer({
            id: layerId,
            type: "circle",
            source: sourceId,
            filter: ["has", "point_count"],
            paint: {
                // Use step expressions (https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
                // with three steps to implement three types of circles:
                //   * Blue, 20px circles when point count is less than 100
                //   * Yellow, 30px circles when point count is between 100 and 750
                //   * Pink, 40px circles when point count is greater than or equal to 750
                "circle-color": [
                    "step",
                    ["get", "point_count"],
                    "#51bbd6",
                    100,
                    "#f1f075",
                    750,
                    "#f28cb1"
                ],
                "circle-radius": [
                    "step",
                    ["get", "point_count"],
                    20,
                    100,
                    30,
                    750,
                    40
                ]
            }
        });

        this.removeLayer(map, `${layerId}_count`);
        map.addLayer({
            id: `${layerId}_count`,
            type: "symbol",
            source: sourceId,
            filter: ["has", "point_count"],
            layout: {
                "text-field": "{point_count_abbreviated}",
                "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
                "text-size": 12
            }
        });

        this.removeLayer(map, `un${layerId}_point`);
        map.addLayer({
            id: `un${layerId}_point`,
            type: "circle",
            source: sourceId,
            filter: ["!", ["has", "point_count"]],
            paint: {
                "circle-color": "#11b4da",
                "circle-radius": 4,
                "circle-stroke-width": 1,
                "circle-stroke-color": "#fff"
            }
        });

        // inspect a cluster on click
        map.on("click", layerId, function (e) {
            let features = map.queryRenderedFeatures(e.point, {layers: [layerId]});
            let clusterId = features[0].properties.cluster_id;
            map.getSource(sourceId).getClusterExpansionZoom(clusterId, function (err, zoom) {
                if (err) return;

                map.easeTo({center: features[0].geometry.coordinates, zoom});
            });
        });

        map.on("mouseenter", layerId, function () {
            map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", layerId, function () {
            map.getCanvas().style.cursor = "";
        });

        map.easeTo({center: [-103.59179687498357, 40.66995747013945], zoom: 2});

        return {
            map, layerId
        }
    }

    /**
     * 添加建筑物
     * @param map
     * @param options
     */
    add3DBuidings(map, options = {}) {
        if (!this.hasMap(map)) return;

        let layers = map.getStyle().layers;

        let textLayerId;
        for (let i = 0; i < layers.length; i++) {
            if (layers[i].type === "symbol" && layers[i].layout["text-field"]) {
                textLayerId = layers[i].id;
                break;
            }
        }
        // 将3D建筑物图层添加在textLayerId图层之前
        let layerId = options.layerId || MapLayerConst.BUILDINGS_LAYER_ID;
        map.addLayer({
            "id": layerId,
            "source": "composite",
            "source-layer": "building",
            "filter": ["==", "extrude", "true"],
            "type": "fill-extrusion",
            "minzoom": 15,
            "paint": {
                "fill-extrusion-color": "#aaa",

                // use an "interpolate" expression to add a smooth transition effect to the buildings as the user zooms in
                "fill-extrusion-height": [
                    "interpolate", ["linear"], ["zoom"],
                    15, 0,
                    15.05, ["get", "height"]
                ],
                "fill-extrusion-base": [
                    "interpolate", ["linear"], ["zoom"],
                    15, 0,
                    15.05, ["get", "min_height"]
                ],
                "fill-extrusion-opacity": .6
            }
        }, textLayerId);

        map.easeTo({zoom: 15.5, pitch: 45});

        return {
            map, layerId
        }
    }

    /**
     * 添加 3D 室内地图
     * @param map
     * @param options
     */
    add3DRoom(map, options = {}) {
        if (!this.hasMap(map)) return;

        let sourceId = "room-source";
        !map.getSource(sourceId) && map.addSource(sourceId, {
            // GeoJSON Data source used in vector tiles, documented at
            // https://gist.github.com/ryanbaumann/a7d970386ce59d11c16278b90dde094d
            "type": "geojson",
            "data": "https://docs.mapbox.com/mapbox-gl-js/assets/indoor-3d-map.geojson"
        });

        let layerId = options.layerId || MapLayerConst.ROOM_BUILDINGS_LAYER_ID;
        map.addLayer({
            "id": layerId,
            "type": "fill-extrusion",
            "source": sourceId,
            "paint": {
                // See the Mapbox Style Specification for details on data expressions.
                // https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions

                // Get the fill-extrusion-color from the source "color" property.
                "fill-extrusion-color": ["get", "color"],

                // Get fill-extrusion-height from the source "height" property.
                "fill-extrusion-height": ["get", "height"],

                // Get fill-extrusion-base from the source "base_height" property.
                "fill-extrusion-base": ["get", "base_height"],

                // Make extrusions slightly opaque for see through indoor walls.
                "fill-extrusion-opacity": 0.5
            }
        });

        map.easeTo({center: [-87.61694, 41.86625], zoom: 15.99, pitch: 40, bearing: 20});

        return {
            map, sourceId, layerId
        }
    }

    /**
     * 添加 3D 模型
     * @param map
     * @param options
     */
    add3DModel(map, options = {}) {
        if (!this.hasMap(map)) return;

        // parameters to ensure the model is georeferenced correctly on the map
        let modelOrigin = [148.98190, -35.39847];
        let modelAltitude = 0;
        let modelRotate = [Math.PI / 2, 0, 0];
        let modelScale = 5.41843220338983e-8;

        // transformation parameters to position, rotate and scale the 3D model onto the map
        let modelTransform = {
            translateX: mapboxgl.MercatorCoordinate.fromLngLat(modelOrigin, modelAltitude).x,
            translateY: mapboxgl.MercatorCoordinate.fromLngLat(modelOrigin, modelAltitude).y,
            translateZ: mapboxgl.MercatorCoordinate.fromLngLat(modelOrigin, modelAltitude).z,
            rotateX: modelRotate[0],
            rotateY: modelRotate[1],
            rotateZ: modelRotate[2],
            scale: modelScale
        };

        let THREE = window.THREE;

        // configuration of the custom layer for a 3D model per the CustomLayerInterface
        let layerId = options.layerId || MapLayerConst.MODEL_LAYER_ID;
        let customLayer = {
            id: layerId,
            type: "custom",
            renderingMode: "3d",
            onAdd: function (map, gl) {
                this.camera = new THREE.Camera();
                this.scene = new THREE.Scene();

                // create two three.js lights to illuminate the model
                let directionalLight = new THREE.DirectionalLight(0xffffff);
                directionalLight.position.set(0, -70, 100).normalize();
                this.scene.add(directionalLight);

                let directionalLight2 = new THREE.DirectionalLight(0xffffff);
                directionalLight2.position.set(0, 70, 100).normalize();
                this.scene.add(directionalLight2);

                // use the three.js GLTF loader to add the 3D model to the three.js scene
                let loader = new THREE.GLTFLoader();
                loader.load("https://docs.mapbox.com/mapbox-gl-js/assets/34M_17/34M_17.gltf", (function (gltf) {
                    this.scene.add(gltf.scene);
                }).bind(this));
                this.map = map;

                // use the Mapbox GL JS map canvas for three.js
                this.renderer = new THREE.WebGLRenderer({
                    canvas: map.getCanvas(),
                    context: gl
                });

                this.renderer.autoClear = false;
            },
            render: function (gl, matrix) {
                let rotationX = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(1, 0, 0), modelTransform.rotateX);
                let rotationY = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 1, 0), modelTransform.rotateY);
                let rotationZ = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(0, 0, 1), modelTransform.rotateZ);

                let m = new THREE.Matrix4().fromArray(matrix);
                let l = new THREE.Matrix4().makeTranslation(modelTransform.translateX, modelTransform.translateY, modelTransform.translateZ)
                    .scale(new THREE.Vector3(modelTransform.scale, -modelTransform.scale, modelTransform.scale))
                    .multiply(rotationX)
                    .multiply(rotationY)
                    .multiply(rotationZ);

                this.camera.projectionMatrix.elements = matrix;
                this.camera.projectionMatrix = m.multiply(l);
                this.renderer.state.reset();
                this.renderer.render(this.scene, this.camera);
                this.map.triggerRepaint();
            }
        };

        map.addLayer(customLayer, "waterway-label");

        map.easeTo({center: [148.9819, -35.3981], zoom: 17.5, pitch: 60});

        return {
            map, layerId
        }
    }

    /**
     * 添加 animate image
     * @param map
     * @param coordsArr
     * @param options
     * @returns {{layerId: (string|*), map: *}}
     */
    addAnimateImage(map, coordsArr, options = {}) {
        if (!this.hasMap(map)) return;

        let currentImage = 0;
        let frameCount = 5;
        let getPath = function () {
            return `https://docs.mapbox.com/mapbox-gl-js/assets/radar${currentImage}.gif`
        };

        let sourceId = "animate-image-source";
        !map.getSource(sourceId) && map.addSource(sourceId, {
            type: "image",
            url: getPath(),
            coordinates: coordsArr
        });

        let layerId = options.layerId || MapLayerConst.ANIMATE_IMAGE_LAYER_ID;
        map.addLayer({
            "id": layerId,
            "type": "raster",
            "source": sourceId,
            "paint": {
                "raster-fade-duration": 0
            }
        });

        setInterval(function () {
            currentImage = (currentImage + 1) % frameCount;
            map.getSource(sourceId).updateImage({url: getPath()});
        }, 500);

        map.easeTo({center: [-75.789, 41.874], zoom: 5});

        return {
            map, layerId
        }
    }

    /**
     * 添加 track play
     * @param map
     * @param coordsArr
     * @param options
     * @returns {{layerId: (string|*), map: *}}
     */
    addTrackPlay(map, coordsArr, options = {}) {
        if (!this.hasMap(map)) return;

        let data = {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "geometry": {
                        "type": "LineString",
                        "coordinates": [coordsArr[0]]
                    }
                }
            ]
        };

        let sourceId = "track-source";
        !map.getSource(sourceId) && map.addSource(sourceId, {
            type: "geojson",
            data: data
        });

        let layerId = options.layerId || MapLayerConst.TRACK_LAYER_ID;
        map.addLayer({
            "id": layerId,
            "type": "line",
            "source": sourceId,
            "paint": {
                "line-color": "#f00",
                "line-opacity": 0.75,
                "line-width": 8
            }
        });

        // setup the viewport
        map.jumpTo({"center": coordsArr[0], "zoom": 14});
        map.setPitch(30);

        // on a regular basis, add more coordinates from the saved list and update the map
        let i = 0;
        let timer = setInterval(function () {
            if (i < coordsArr.length) {
                data.features[0].geometry.coordinates.push(coordsArr[i]);
                map.getSource(sourceId).setData(data);
                map.panTo(coordsArr[i]);
                i++;
            } else {
                clearInterval(timer);
            }
        }, 10);

        return {
            map, layerId
        }
    }

    /**
     * 添加鼠标悬停效果
     * @param map
     * @param options
     * @returns {{layerId: (string|*), map: *}}
     */
    addHoverFill(map, options = {}) {
        if (!this.hasMap(map)) return;

        let hoveredStateId = null;

        let sourceId = "state-source";
        !map.getSource(sourceId) && map.addSource(sourceId, {
            "type": "geojson",
            "data": "https://docs.mapbox.com/mapbox-gl-js/assets/us_states.geojson"
        });

        // The feature-state dependent fill-opacity expression will render the hover effect
        // when a feature"s hover state is set to true.
        let layerId = options.layerId || MapLayerConst.HOVER_FILL_LAYER_ID;
        map.addLayer({
            "id": layerId,
            "type": "fill",
            "source": sourceId,
            "layout": {},
            "paint": {
                "fill-color": "#627BC1",
                "fill-opacity": [
                    "case",
                    ["boolean", ["feature-state", "hover"], false],
                    1,
                    0.5
                ]
            }
        });

        this.removeLayer(map, `${layerId}_border`);
        map.addLayer({
            "id": `${layerId}_border`,
            "type": "line",
            "source": sourceId,
            "layout": {},
            "paint": {
                "line-color": "#627BC1",
                "line-width": 2
            }
        });

        // When the user moves their mouse over the state-fill layer, we"ll update the
        // feature state for the feature under the mouse.
        map.on("mousemove", layerId, function (e) {
            if (e.features.length > 0) {
                if (hoveredStateId) {
                    map.setFeatureState({source: sourceId, id: hoveredStateId}, {hover: false});
                }
                hoveredStateId = e.features[0].id;
                map.setFeatureState({source: sourceId, id: hoveredStateId}, {hover: true});
            }
        });

        // When the mouse leaves the state-fill layer, update the feature state of the
        // previously hovered feature.
        map.on("mouseleave", layerId, function () {
            if (hoveredStateId) {
                map.setFeatureState({source: sourceId, id: hoveredStateId}, {hover: false});
            }
            hoveredStateId = null;
        });

        this.setCZBP(map, [-100.486052, 37.830348], 2);

        return {
            map, layerId
        }
    }

    /**
     * 获取地图元素的属性
     * @param map
     * @param options
     * @returns {{map: *}}
     */
    queryEntryProperty(map, options = {}) {
        if (!this.hasMap(map)) return;

        map.on("click", function (e) {
            let features = map.queryRenderedFeatures(e.point);
            $("#features").html(JSON.stringify(features, null, 2));
        });

        this.setCZBP(map);
        return {
            map
        }
    }
}

export default new MapboxCommonService()