let vm = new Vue({
    el: "#app",
    data: {
        data: ""
    },
    created: function () {
        fetch("https://api.coinmarketcap.com/v1/ticker/?limit=10")
            .then(response => response.json())
            .then(body => {
                console.log(body);
                this.data = body;
            });
    }
});