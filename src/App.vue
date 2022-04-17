<template>
  <!--elementPlus国际化语言设置-->
  <el-config-provider :locale="locale">
    <!-- <MyMapbox></MyMapbox> -->
    <Home></Home>
  </el-config-provider>
</template>

<script>
import { ElConfigProvider } from "element-plus";
import zhCn from "element-plus/lib/locale/lang/zh-cn";
import Home from "@/views/Home.vue";
// import MyMapbox from "@/views/MyMapbox.vue";

export default {
  name: "APP",
  components: {
    // MyMapbox,
    ElConfigProvider,
    Home,
  },
  setup() {
    return {
      locale: zhCn,
    };
  },
};
</script>

<style lang="scss">
/*@import "@/common/css/custom.style.scss";*/
* {
  padding: 0;
  margin: 0;
}
html,
body {
  width: 100%;
  height: 100%;
}
#app {
  width: 100%;
  height: 100%;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: $text-color;
  font-size: $font-sm;
}
</style>
