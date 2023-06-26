const path = require('path');
module.exports = {
  mode: 'production',
//  mode: 'development',
  entry: {
    GCA_Viewer1D: './src/index.js',
    GCA_Utils: './src/modules/GCA_Utilities.js'
  },

 output: {
    filename: '[name].js',
    path: path.resolve('dist'),
//    path: __dirname + '/dist',
    library: '[name]',
    libraryTarget: "umd",
  },

  module: {
    rules: [
      {
        test: /\.(js)$/,
        exclude: /node_modules/,
        use: "babel-loader",
      },

      {
        test: /\.svg$/,
        use: [ 
          { 
            loader: 'svg-url-loader',
             options: {
               name: './Icons/[name].[ext]',
               outputPath: 'Icons/[name].[ext]',
            }
          }
        ]
      },


      { 
        test: /\.css$/, 
        use: ['style-loader']
      },

      {
        test: /\.css$/, 
        loader: "css-loader",
        options: {
          url: true,
          esModule: false
        }
      },

      {
        test: /\.md$/,
        use: 'raw-loader'
      },

      {
        test: /\.(png|jpe?g)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: 'help/images/[name].[ext]',
            }
          }
        ]
      },
   
    ]      
  },

  resolve: {
    extensions: ['.js'],
  },

}
