let vm = new Vue({
    el: "#app",
    data: {
        data: [],
        coins: [],
        uuid:"",
        userInput: ""
    },
    created: function () {
        fetch("https://api.coinmarketcap.com/v1/ticker/?limit=10")
            .then(response => response.json())
            .then(body => {
                this.data = body;
            });
        if (!window.location.hash) {
            fetch("http://localhost:8080/portfolio")
                .then(response => response.json())
                .then(body => {
                    this.uuid = body.uuid;
                    //so you can refresh with the current uuid
                    window.location.hash = this.uuid;
                });
        }else{
            this.uuid =  window.location.hash.substring(1);
        }
    },
    methods: {
        addCurrency() {
            for (let currency of this.data) {
                if (currency.symbol === this.userInput) {
                    this.coins.push(currency);
                    this.userInput = "";
                    return;
                }
            }
            alert(this.userInput + " not found");
        },
        removeCurrency(input) {
            for (let [index, value] of this.coins.entries()) {
                if (value.symbol === input) {
                    this.coins.splice(index, 1);
                    return;
                }
            }
        }
    },
    watch: {
        uuid(newUuid, oldUuid) {
            fetch("http://localhost:8080/portfolio/" + newUuid)
                .then(response => response.json())
                .then(body => {
                    this.coins = body;
                });
        },
        coins: {
            handler: function (newCoins) {
                fetch("http://localhost:8080/portfolio/" + this.uuid, {method: "POST", body: JSON.stringify(newCoins)});
            },
            deep: true
        } // the deep watch, ie deep:true, causes a watch-update when some field in the coins array itself changes, else it only updates if the
         // array entirely changes, ie. if this.coins is set on array level entirely
    }
});