/**
 * Created by baidm in 2021/7/17 on 18:16
 */
// 地图访问令牌
// export const accessToken = "pk.eyJ1IjoibWFvcmV5IiwiYSI6ImNqNWhrenIwcDFvbXUyd3I2bTJxYzZ4em8ifQ.KHZIehQuWW9AsMaGtATdwA";
export const accessToken = "pk.eyJ1IjoibHVrYXNtYXJ0aW5lbGxpIiwiYSI6ImNpem85dmhwazAyajIyd284dGxhN2VxYnYifQ.HQCmyhEXZUTz3S98FMrVAQ";

// 地图图层样式
export const mapStyle = {
    light: "mapbox://styles/mapbox/light-v10",
    dark: "mapbox://styles/mapbox/dark-v10",
    streets: "mapbox://styles/mapbox/streets-v11",
    streetsOptimize: "mapbox://styles/mapbox/streets-v11?optimize=true",
    outdoors: "mapbox://styles/mapbox/outdoors-v11",
    satellite: "mapbox://styles/mapbox/satellite-v9",
    satelliteStreets: "mapbox://styles/mapbox/satellite-streets-v10",
    navigationPreviewDay: "mapbox://styles/mapbox/navigation-preview-day-v2",
    navigationPreviewNight: "mapbox://styles/mapbox/navigation-preview-night-v2",
    navigationGuidanceDay: "mapbox://styles/mapbox/navigation-guidance-day-v2",
    navigationGuidanceNight: "mapbox://styles/mapbox/navigation-guidance-night-v2",
    trafficDay: "mapbox://styles/mapbox/traffic-day-v2",
    trafficNight: "mapbox://styles/mapbox/traffic-night-v2",
    custom: {
        "version": 8,
        "name": "Mapbox Streets",
        "sprite": "mapbox://sprites/mapbox/streets-v8",
        "glyphs": "mapbox://fonts/mapbox/{fontstack}/{range}.pbf",
        "sources": {
            "osm-tiles": {
                "type": "raster",
                "tiles": [
                    "http://c.tile.openstreetmap.org/{z}/{x}/{y}.png"
                ],
                "tileSize": 256
            }
        },
        "layers": [
            {
                "id": "123",
                "type": "raster",
                "source": "osm-tiles",
                "source-layer": "osmtiles"
            }
        ]
    }
};

// 地图中心经纬度
export const mapCerter = [121.472644, 31.231706];

// 地图层级
export const mapZoom = 10;

// 地图初始化时的方位角（旋转角度），以正北方的逆时针转动度数计量
export const mapBearing = 0;

// 地图初始化时的倾角，按偏离屏幕水平面的度数计量（0-60）
export const mapPitch = 0;