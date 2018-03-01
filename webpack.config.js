module.exports ={
    context: __dirname + '/src',
    entry: {
        app: './main/app.js'
    },
    output:{
        path: __dirname + '/src/main/resources/static/dist',
        publicPath: '/dist/',
        filename:'bundle.js'
    },
    module:{
        loaders:[{
            test: /\.vue$/,
            loader: 'vue-loader',
        },]
    },
    resolve:{
        alias: {
            'vue$': 'vue/dist/vue.esm.js'
        }
    }
};