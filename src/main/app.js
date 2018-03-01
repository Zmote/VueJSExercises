import Vue from "vue"
import Portfolio from "./vue/portfolio-manager.vue"

Vue.component("portfolio", Portfolio);

new Vue({
    el: "#app",
    components: {Portfolio}
});

// Beachte, auch app.js wird mit webpack ins bundle.js (oder was auch immer target file)
// reinkopiert, Pfade müssen dann relativ zu diesem Szenario angegeben werden
if('serviceWorker' in navigator){
    navigator.serviceWorker.register("/service_worker.js",{
        scope:'/'
    }).then(function(registration){
        console.log('Registration successful, scope is:', registration.scope);
    })
    .catch(function(error){
      console.log("Uh oh, something went wrong!")
    });
}