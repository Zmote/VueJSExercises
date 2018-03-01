<template>
        <div class="col-md-8 mx-auto">
            <h1 class="mt-4">Cryptocurrency Convertor</h1>
            <table v-if="coins.length > 0" class="table table-striped">
                <thead>
                <tr>
                    <th>Cryptocurrency</th>
                    <th>Symbol</th>
                    <th>Conversion Rate</th>
                    <th>Input</th>
                    <th>Output</th>
                    <th></th>
                    <th></th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="item in coins">
                    <td>{{item.id.toUpperCase()}}</td>
                    <td>{{item.symbol}}</td>
                    <td>{{item.price_usd}}</td>
                    <td><input type="number" v-model="item.calculatedValue" placeholder="0"/></td>
                    <td>{{isNaN(item.calculatedValue)? (0).toPrecision(8) : (item.calculatedValue * item.price_usd).toPrecision(8)}}</td>
                    <td>USD</td>
                    <td><button @click="removeCurrency(item.symbol)" class="btn btn-info">Remove</button></td>
                </tr>
                </tbody>
            </table>
            <hr>
            <form class="form-inline" action="javascript:void(0)">
                <input class="form-control" type="text" placeholder="BTC" v-model="userInput"><button class="btn btn-primary" @click="addCurrency()">Add</button>
            </form>
        </div>
</template>
<style>

</style>
<script>
    export default {
        data() {
            return {
                data: [],
                coins: [],
                uuid: "",
                userInput: ""
            }
        },
        created: function () {
            this.fetchData();
            if (!window.location.hash) {
                fetch("http://localhost:8081/portfolio")
                    .then(response => response.json())
                    .then(body => {
                        this.uuid = body.uuid;
                        //so you can refresh with the current uuid
                        window.location.hash = this.uuid;
                    });
            } else {
                this.uuid = window.location.hash.substring(1);
            }
            this.updateInterval = setInterval(()=>{
                this.fetchData();
            },1000);
        },
        updateInterval: null,
        destroyed(){
            if(this.updateInterval !== null){
                clearInterval(this.updateInterval);
            }
        },
        methods: {
            fetchData(){
                fetch("https://api.coinmarketcap.com/v1/ticker/?limit=10")
                    .then(response => response.json())
                    .then(body => {
                        let newData = [];
                        for(let i = 0; i < body.length;i++){
                            let newCurrency = body[i];
                            let oldCurrency = this.getCoin(body[i].symbol);
                            if(oldCurrency !== null){
                                newCurrency.input = oldCurrency.input;
                                newCurrency.calculatedValue = oldCurrency.calculatedValue;
                            }
                            newData.push(newCurrency);
                        }
                        this.data = newData;
                    });
            },
            addCurrency() {
                for (let currency of this.data) {
                    if (currency.symbol === this.userInput) {
                        this.coins.push({
                            id: currency.id,
                            symbol: currency.symbol,
                            price_usd: currency.price_usd,
                            input: "",
                            calculatedValue: ""
                        });
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
            },
            getCoin(symbol){
                for(let currency of this.data){
                    if(currency.symbol === symbol){
                        return currency;
                    }
                }
                return null;
            }
        },
        watch: {
            data(newData){
                for(let i = 0; i < this.coins.length;i++){
                    let currency = this.getCoin(this.coins[i].symbol);
                    if(currency !== null){
                        if(currency.price_usd !== this.coins[i].price_usd){
                            this.coins[i] = {
                                id: currency.id,
                                symbol: currency.symbol,
                                price_usd: currency.price_usd,
                                input: this.coins[i].input,
                                calculatedValue: this.coins[i].calculatedValue
                            };
                            console.log("Change detected");
                        }
                    }
                }
            },
            uuid(newUuid, oldUuid) {
                fetch("http://localhost:8081/portfolio/" + newUuid)
                    .then(response => response.json())
                    .then(body => {
                        this.coins = body;
                    });
            },
            coins: {
                handler: function (newCoins) {
                    fetch("http://localhost:8081/portfolio/" + this.uuid, {method: "POST", body: JSON.stringify(newCoins)});
                },
                deep: true
            } // the deep watch, ie deep:true, causes a watch-update when some field in the coins array itself changes, else it only updates if the
            // array entirely changes, ie. if this.coins is set on array level entirely
        }
    }
</script>