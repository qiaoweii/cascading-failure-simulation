const path = require("path");

module.exports = {
  mode: "development",
  devtool: "eval-source-map",
  entry: "./static/js/network_animation.js",
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
    ],
  },
  resolve: {
    extensions: ["*", ".js", ".css"],
  },
  devServer: {
    contentBase: "./templates",
  },
  output: {
    path: path.resolve(__dirname, "templates"),
    filename: "bundle.js",
  },
};
