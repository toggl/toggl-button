const CopyPlugin = require('copy-webpack-plugin');
const FileManagerPlugin = require('filemanager-webpack-plugin');
const fs = require('fs');
const path = require('path');
const { BugsnagSourceMapUploaderPlugin } = require('webpack-bugsnag-plugins');
const { CleanWebpackPlugin: CleanPlugin } = require('clean-webpack-plugin');
const { EnvironmentPlugin } = require('webpack');

const log = require('webpack-log')({ name: 'wds' });
const pkg = require('./package.json');

// Resolve environment settings for webpack.
const config = f => (
  { development, production, release } = {
    development: true
  }
) => {
  const env = {
    development: Boolean(development),
    bugsnagApiKey: process.env.BUTTON_BUGSNAG_API_KEY || '7419717b29de539ab0fbe35dcd7ca19d',
    production: Boolean(production),
    release: Boolean(release),
    version: pkg.version
  };

  log.info(`Environment settings`);
  log.info(env);

  return f(env);
};

module.exports = config(({ development, bugsnagApiKey, production, release, version }) => ({
  target: 'web',
  context: path.resolve(__dirname, 'src'),
  devtool: 'source-map',
  entry: {
    ...entry('background'),
    ...entry('common'),
    ...entry('login', 'ts'),
    ...entry('popup'),
    ...entry('settings'),
    ...entryContentScripts()
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js'
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx']
  },
  node: {
    global: false
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: 'ts-loader'
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: 'babel-loader'
      },
      {
        test: /\.svg$/,
        loader: 'svg-url-loader'
      }
    ]
  },
  plugins: [
    new EnvironmentPlugin({
      API_URL: 'https://toggl.com/api',
      TOGGL_WEB_HOST: 'https://toggl.com',
      BUGSNAG_API_KEY: bugsnagApiKey,
      DEBUG: development,
      GA_TRACKING_ID: 'UA-3215787-22',
      VERSION: version
    }),
    new CleanPlugin(),
    new CopyPlugin([
      ...copy({
        from: 'html/',
        to: 'html/'
      }),
      ...copy({
        from: 'images/',
        to: 'images/'
      }),
      ...copy({
        from: 'sounds/',
        to: 'sounds/'
      }),
      ...copy({
        from: 'styles/',
        to: 'styles/'
      }),
      {
        from: 'chrome-manifest.json',
        to: 'chrome/manifest.json',
        transform: transformManifest('chrome')
      },
      {
        from: 'firefox-manifest.json',
        to: 'firefox/manifest.json',
        transform: transformManifest('firefox')
      }
    ], { copyUnmodified: true }),
    production && release &&
      new BugsnagSourceMapUploaderPlugin({
        apiKey: bugsnagApiKey,
        appVersion: version,
        publicPath: 'togglbutton://',
        overwrite: true /* Overwrites existing sourcemaps for this version */
      }),
    new FileManagerPlugin({
      onEnd: [
        {
          copy: [
            { source: 'dist/scripts/**/*', destination: 'dist/chrome/scripts' },
            { source: 'dist/scripts/**/*', destination: 'dist/firefox/scripts' }
          ]
        },
        production && {
          delete: [
            'dist/**/*.js.map'
          ],
          archive: [
            {
              source: 'dist/chrome',
              destination: `dist/toggl-button-chrome-${version}.zip`
            },
            {
              source: 'dist/firefox',
              destination: `dist/toggl-button-firefox-${version}.zip`
            }
          ]
        }
      ]
    })
  ].filter(Boolean)
}));

function entry (name, ext = 'js') {
  return {
    [`scripts/${name}`]: `./scripts/${name}.${ext}`
  };
}

function entryContentScripts () {
  const contentScriptFiles = fs.readdirSync('./src/scripts/content/');
  return contentScriptFiles.reduce((entries, file) => {
    const name = file.replace('.js', '');
    return Object.assign(entries, entry(`content/${name}`));
  }, {});
}

function copy (o) {
  return [
    {
      ...o,
      to: `chrome/${o.to}`
    },
    {
      ...o,
      to: `firefox/${o.to}`
    }
  ];
}

function transformManifest (browser) {
  return function (content) {
    const manifest = JSON.parse(content.toString());

    if (process.env.TOGGL_API_HOST) {
      manifest.permissions = [
        ...manifest.permissions,
        process.env.TOGGL_API_HOST
      ];
      if (browser === 'chrome') {
        manifest.externally_connectable.matches = [
          ...manifest.externally_connectable.matches,
          process.env.TOGGL_API_HOST
        ];
      }
    }

    manifest.version = pkg.version;

    return Buffer.from(JSON.stringify(manifest, undefined, 2));
  };
}
