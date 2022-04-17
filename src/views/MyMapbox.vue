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
      <div id="map" ref="map"></div>
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

//
<script setup>
// import { ref, reactive, onMounted, nextTick } from "vue";
// import { getCurrentInstance } from "@vue/runtime-core";
// import {
//   accessToken,
//   mapStyle,
//   mapCerter,
//   mapZoom,
//   mapBearing,
//   mapPitch,
// } from "@/consts/MapConfigConst";

// let value = ref("streets-v11");
// let value1 = ref("2019");
// let value2 = ref("全部");
// let value3 = ref("所有源");
// const currentInstance = getCurrentInstance();
// const childRef = ref();

// const init = () => {
//   mapboxgl.accessToken = accessToken;
//   let map = new mapboxgl.Map({
//     container: "map",
//     style: mapStyle.streets,
//     center: mapCerter,
//     zoom: mapZoom,
//     bearing: mapBearing,
//     pitch: mapPitch,
//   });
//   mapboxgl.setRTLTextPlugin(
//     "https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.2.3/mapbox-gl-rtl-text.js"
//   );
//   map.addControl(
//     new MapboxLanguage({
//       defaultLanguage: "zh-Hans", // zh-Hant
//     })
//   );

//   map.on("load", function () {
//     // props.mapOnLoadCB(map);
//     console.log(111);
//   });
// };
// onMounted(() => {
//   //   console.log(currentInstance.ctx.$refs.map);
//   init();
// });

//
</script>

<script>
import {
  accessToken,
  mapStyle,
  mapCerter,
  mapZoom,
  mapBearing,
  mapPitch,
} from "@/consts/MapConfigConst";
import { onMounted, toRefs, toRef } from "vue";

export default {
  name: "Mapbox",

  props: {
    mapOnLoadCB: {
      required: false,
      type: Function,
      default: () => {},
    },
  },

  setup(props) {
    let value = ref("streets-v11");

    let initMapInstance = () => {
      mapboxgl.accessToken = accessToken;

      let map = new mapboxgl.Map({
        container: "map",
        style: mapStyle.streets,
        center: mapCerter,
        zoom: mapZoom,
        bearing: mapBearing,
        pitch: mapPitch,
      });

      mapboxgl.setRTLTextPlugin(
        "https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.2.3/mapbox-gl-rtl-text.js"
      );
      map.addControl(
        new MapboxLanguage({
          defaultLanguage: "zh-Hans", // zh-Hant
        })
      );

      map.on("load", function () {
        props.mapOnLoadCB(map);
      });
    };

    onMounted(initMapInstance);

    return { value };
  },
};
</script>
<style scoped lang="scss">
.map-demo-wrap {
  position: absolute;
  left: 5px;
  top: 5px;
  background: #fff;
  width: 300px;
  height: calc(100% - 30px);
  text-align: left;
  padding: 10px;
  border-radius: 5px 0 5px 5px;
  transition: all ease 0.5s;
  &.fold {
    left: -320px;
  }
  .title {
    font-size: $font-lg;
    font-weight: bold;
    background-color: cadetblue;
    color: #fff;
    padding: 10px;
    border-radius: 5px;
  }
  .menu-list {
    width: 100%;
    height: calc(100% - 40px);
    overflow: auto;
    .menu {
      list-style: none;
      line-height: 24px;
      cursor: pointer;
      padding: 5px;
      border-radius: 5px;
      &.active,
      &:hover {
        background-color: darkcyan;
        color: #ffffff;
      }
    }
  }
  .collapse {
    position: absolute;
    right: -55px;
    top: 0;
    background-color: #fff;
    padding: 5px 10px;
    border-radius: 0 10px 10px 0;
    font-size: 12px;
    cursor: pointer;
    i {
      margin-right: 5px;
    }
  }
  .clear-demo {
    position: absolute;
    right: 21px;
    top: 21px;
    cursor: pointer;
    font-weight: bold;
    color: #fff;
  }
}
</style>
