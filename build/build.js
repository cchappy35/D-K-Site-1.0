// Pre-builds the homepage.
//   in:  src/index.template.html, src/app.jsx, tweaks-panel.jsx
//   out: index.html (pre-rendered markup), app.js (compiled + minified), vendor/react*.js
// Run from this folder:  npm install && node build.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const babel = require('@babel/core');
const { minify } = require('terser');
const React = require('react');
const ReactDOMServer = require('react-dom/server');

const ROOT = path.resolve(__dirname, '..');
const read = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');

function compile(code, filename) {
  return babel.transformSync(code, {
    filename, babelrc: false, configFile: false,
    presets: [[require.resolve('@babel/preset-react'), { runtime: 'classic' }]],
  }).code;
}

(async () => {
  const bundleSrc = '(function(){\n' + compile(read('tweaks-panel.jsx'), 'tweaks-panel.jsx') + '\n' +
    compile(read('src/app.jsx'), 'app.jsx') + '\n})();\n';

  // 1) Pre-render the markup on the server so the page has real content before any JS runs.
  const noop = () => {};
  const windowStub = { parent: { postMessage: noop }, addEventListener: noop, removeEventListener: noop,
    innerWidth: 1280, innerHeight: 800, scrollY: 0, pageYOffset: 0, scrollTo: noop };
  const ctx = { React, console, window: windowStub, document: { getElementById: () => null, body: { classList: { add: noop, remove: noop } } } };
  ctx.window.window = ctx.window;
  vm.createContext(ctx);
  // Object.assign(window, ...) in tweaks-panel needs globals visible on window and vice versa
  vm.runInContext('var self = window;', ctx);
  vm.runInContext(bundleSrc, ctx);
  const App = ctx.window.__DK_APP__;
  if (!App) throw new Error('App not exported');
  const html = ReactDOMServer.renderToString(React.createElement(App));

  // 2) Client bundle: hydrate the pre-rendered markup.
  const boot = "\n;(function(){var el=document.getElementById('root');var app=React.createElement(window.__DK_APP__);" +
    "if(el.firstElementChild){ReactDOM.hydrateRoot(el,app);}else{ReactDOM.createRoot(el).render(app);}})();\n";
  const min = await minify(bundleSrc + boot, { compress: true, mangle: true, format: { comments: false } });
  fs.writeFileSync(path.join(ROOT, 'app.js'), '/* Built from src/app.jsx + tweaks-panel.jsx by build/build.js — do not edit directly. */\n' + min.code);

  // 3) Self-hosted production React (no CDN dependency).
  fs.mkdirSync(path.join(ROOT, 'vendor'), { recursive: true });
  const pkgDir = (name) => path.dirname(require.resolve(name + '/package.json'));
  fs.copyFileSync(path.join(pkgDir('react'), 'umd/react.production.min.js'), path.join(ROOT, 'vendor/react.production.min.js'));
  fs.copyFileSync(path.join(pkgDir('react-dom'), 'umd/react-dom.production.min.js'), path.join(ROOT, 'vendor/react-dom.production.min.js'));

  // 4) index.html
  const scripts = '<script defer src="/vendor/react.production.min.js"></script>\n' +
    '<script defer src="/vendor/react-dom.production.min.js"></script>\n' +
    '<script defer src="/app.js"></script>';
  const out = read('src/index.template.html').replace('%%SSR%%', html).replace('%%BOOT%%', scripts);
  fs.writeFileSync(path.join(ROOT, 'index.html'), '<!-- Built by build/build.js from src/ — edit src/index.template.html or src/app.jsx, not this file. -->\n' + out);
  console.log('built: index.html', out.length, 'bytes; app.js', min.code.length, 'bytes; markup', html.length, 'bytes');
})().catch((e) => { console.error(e); process.exit(1); });
