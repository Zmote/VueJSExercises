import Vue from "vue"
import Portfolio from "./vue/portfolio-manager.vue"

Vue.component("portfolio", Portfolio);

new Vue({
    el: "#app",
    components: {Portfolio}
});
