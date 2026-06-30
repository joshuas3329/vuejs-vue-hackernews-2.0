// babel.config.js — Babel 7 configuration
//
// CVE-2023-45133 fix: the old unscoped babel-traverse@6 (used by babel-core@6
// and babel-preset-env@1) has an arbitrary-code-execution vulnerability with
// no available patch (Babel 6 is end-of-life).  Migrated to Babel 7 scoped
// packages (@babel/core, @babel/preset-env) which pull in
// @babel/traverse>=7.23.2 — the first version that contains the security fix.
//
// Migration notes (Babel 6 -> Babel 7):
//   babel-core                        -> @babel/core
//   babel-preset-env                  -> @babel/preset-env
//   babel-plugin-syntax-dynamic-import -> @babel/plugin-syntax-dynamic-import
//   babel-loader@7                    -> babel-loader@8  (Babel 7 compatible)
//
// The preset/plugin shorthand names changed: Babel 7 resolves "env" as
// "@babel/preset-env" but using the full scoped name is explicit and safe.
module.exports = {
  presets: [
    ['@babel/preset-env', { modules: false }]
  ],
  plugins: [
    '@babel/plugin-syntax-dynamic-import'
  ]
}
