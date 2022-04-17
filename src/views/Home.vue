<template>
    <Mapbox :mapOnLoadCB="mapOnLoadCB"></Mapbox>

    <div class="map-demo-wrap" :class="{'fold':!menuStatus}">
        <p class="title">mapbox demo</p>
        <ul class="menu-list">
            <li class="menu" :class="{'active':activeMenu===menu.id}" v-for="(menu,index) in mapDemoFuncList"
                :key="menu.id" @click="showMenuFun(menu)">
                {{index+1}}、{{menu.name}}
            </li>
        </ul>
        <span class="collapse" @click="menuStatus=!menuStatus">
            <i class="fa" :class="{'fa-angle-double-left':menuStatus,'fa-angle-double-right':!menuStatus}"></i>{{menuStatus?"收起":"展开"}}
        </span>
        <span class="clear-demo" title="清空地图" @click="clearDemo"><i class="fa fa-trash"></i></span>
    </div>
</template>

<script>
    import cityCoords from "@/data/cityCoords"
    import trackCoords from "@/data/trackCoords"
    import MapLayerConst from "@/consts/MapLayerConst"
    import Mapbox from "@/common/Mapbox.component.vue"
    import MapboxCommonService from "@/service/map/MapboxCommonService"
    import {ref, reactive} from "vue"

    export default {
        name: "Home",
        components: {
            Mapbox
        },

        setup(props, {attrs, slots, emit}) {

            let menuStatus = ref(true);

            let mapDemoFuncList = reactive([
                {name: "添加 custom point", id: MapLayerConst.CUSTOM_POINT_LAYER_ID},
                {name: "添加 icon point", id: MapLayerConst.ICON_POINT_LAYER_ID},
                {name: "添加 circle point", id: MapLayerConst.CIRCLE_POINT_LAYER_ID},
                {name: "添加 marker", id: MapLayerConst.CIRCLE_MARKER_LAYER_ID},
                {name: "添加 line", id: MapLayerConst.LINE_LAYER_ID},
                {name: "添加 gradient line", id: MapLayerConst.LINE_GRADIENT_LAYER_ID},
                {name: "添加 area", id: MapLayerConst.AREA_LAYER_ID},
                {name: "添加 polygon", id: MapLayerConst.POLYGON_LAYER_ID},
                {name: "添加 heat map", id: MapLayerConst.HEAT_LAYER_ID},
                {name: "添加 cluster", id: MapLayerConst.CLUSTER_LAYER_ID},
                {name: "添加建筑物", id: MapLayerConst.BUILDINGS_LAYER_ID},
                {name: "添加 3D 室内地图", id: MapLayerConst.ROOM_BUILDINGS_LAYER_ID},
                {name: "添加 3D 模型", id: MapLayerConst.MODEL_LAYER_ID},
                {name: "图像添加动画效果", id: MapLayerConst.ANIMATE_IMAGE_LAYER_ID},
                {name: "添加轨迹播放效果", id: MapLayerConst.TRACK_LAYER_ID},
                {name: "添加鼠标悬停效果", id: MapLayerConst.HOVER_FILL_LAYER_ID},
                {name: "显示地图元素的属性", id: MapLayerConst.HOVER_SHOW_ENTRY_PROPERTY}
            ]);

            // 当前激活的map demo
            let activeMenu = ref("");

            // map对象
            let mapStore = reactive({});
            let mapOnLoadCB = (map) => {
                mapStore.value = map;
            };

            // 缓存map上的marker
            let markerList = reactive([]);

            return {
                menuStatus,
                activeMenu,
                mapDemoFuncList,
                mapStore,
                mapOnLoadCB,
                markerList
            }
        },

        methods: {
            clearDemo() {
                this.clearMap();
                this.activeMenu = "";

                // 移除并清空所有marker
                _.forEach(this.markerList, marker => marker.remove());
                this.markerList = [];

                this.$notify({
                    type: "success",
                    message: "clear success!"
                })
            },
            /**
             * 清除map的layer
             */
            clearMap() {
                let map = this.mapStore.value;
                MapboxCommonService.removeLayer(map, MapLayerConst.CUSTOM_POINT_LAYER_ID);
                MapboxCommonService.removeLayer(map, MapLayerConst.ICON_POINT_LAYER_ID);
                MapboxCommonService.removeLayer(map, MapLayerConst.CIRCLE_POINT_LAYER_ID);
                MapboxCommonService.removeLayer(map, MapLayerConst.LINE_LAYER_ID);
                MapboxCommonService.removeLayer(map, MapLayerConst.LINE_GRADIENT_LAYER_ID);
                MapboxCommonService.removeLayer(map, MapLayerConst.AREA_LAYER_ID);
                MapboxCommonService.removeLayer(map, MapLayerConst.POLYGON_LAYER_ID);
                MapboxCommonService.removeLayer(map, MapLayerConst.HEAT_LAYER_ID);
                MapboxCommonService.removeLayer(map, MapLayerConst.CLUSTER_LAYER_ID);
                MapboxCommonService.removeLayer(map, MapLayerConst.BUILDINGS_LAYER_ID);
                MapboxCommonService.removeLayer(map, MapLayerConst.ROOM_BUILDINGS_LAYER_ID);
                MapboxCommonService.removeLayer(map, MapLayerConst.MODEL_LAYER_ID);
                MapboxCommonService.removeLayer(map, MapLayerConst.ANIMATE_IMAGE_LAYER_ID);
                MapboxCommonService.removeLayer(map, MapLayerConst.TRACK_LAYER_ID);
                MapboxCommonService.removeLayer(map, MapLayerConst.HOVER_FILL_LAYER_ID);
                $("#features").css("display", "none");
                MapboxCommonService.setCZBP(map);
            },
            /**
             * 切换展示demo
             * @param menu
             */
            showMenuFun(menu) {
                this.clearMap();
                let map = this.mapStore.value;
                this.activeMenu = menu.id;
                let coordsArr = [];
                switch (menu.id) {
                    case MapLayerConst.CUSTOM_POINT_LAYER_ID:
                        MapboxCommonService.addCustomPoint(map);
                        break;
                    case MapLayerConst.ICON_POINT_LAYER_ID:
                        coordsArr = [
                            {coords: [121.473598, 31.207282], title: "长包房", icon: "harbor"}
                        ];
                        MapboxCommonService.addIconPoint(map, coordsArr);
                        break;
                    case MapLayerConst.CIRCLE_POINT_LAYER_ID:
                        MapboxCommonService.addCirclePoint(map);
                        break;
                    case MapLayerConst.CIRCLE_MARKER_LAYER_ID:
                        let {marker} = MapboxCommonService.addMarker(map);
                        this.markerList.push(marker);
                        break;
                    case MapLayerConst.LINE_LAYER_ID:
                        coordsArr = [
                            [121.452929, 31.211292], [121.454222, 31.212712], [121.45451, 31.216233],
                            [121.455084, 31.217963], [121.457456, 31.220001], [121.479447, 31.228956],
                        ];
                        MapboxCommonService.addLine(map, coordsArr);
                        break;
                    case MapLayerConst.LINE_GRADIENT_LAYER_ID:
                        coordsArr = [
                            [121.452929, 31.211292], [121.454222, 31.212712], [121.45451, 31.216233],
                            [121.455084, 31.217963], [121.457456, 31.220001], [121.479447, 31.228956],
                        ];
                        MapboxCommonService.addGradientLine(map, coordsArr);
                        break;
                    case MapLayerConst.AREA_LAYER_ID:
                        MapboxCommonService.addArea(map);
                        break;
                    case MapLayerConst.POLYGON_LAYER_ID:
                        coordsArr = Object.values(cityCoords);
                        MapboxCommonService.addPolygon(map, [coordsArr[0]]);
                        break;
                    case MapLayerConst.HEAT_LAYER_ID:
                        MapboxCommonService.addHeatMap(map);
                        break;
                    case MapLayerConst.CLUSTER_LAYER_ID:
                        MapboxCommonService.addCluster(map);
                        break;
                    case MapLayerConst.BUILDINGS_LAYER_ID:
                        MapboxCommonService.add3DBuidings(map);
                        break;
                    case MapLayerConst.ROOM_BUILDINGS_LAYER_ID:
                        MapboxCommonService.add3DRoom(map);
                        break;
                    case MapLayerConst.MODEL_LAYER_ID:
                        MapboxCommonService.add3DModel(map);
                        break;
                    case MapLayerConst.ANIMATE_IMAGE_LAYER_ID:
                        coordsArr = [
                            [-80.425, 46.437], [-71.516, 46.437], [-71.516, 37.936], [-80.425, 37.936]
                        ];
                        MapboxCommonService.addAnimateImage(map, coordsArr);
                        break;
                    case MapLayerConst.TRACK_LAYER_ID:
                        MapboxCommonService.addTrackPlay(map, trackCoords);
                        break;
                    case MapLayerConst.HOVER_FILL_LAYER_ID:
                        MapboxCommonService.addHoverFill(map);
                        break;
                    case MapLayerConst.HOVER_SHOW_ENTRY_PROPERTY:
                        $("#features").css("display", "block");
                        MapboxCommonService.queryEntryProperty(map);
                        break;
                }
            }
        }
    }
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
            left: -320px
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
                &.active, &:hover {
                    background-color: darkcyan;
                    color: #ffffff
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
                margin-right: 5px
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