import assert from "node:assert/strict"
import test from "node:test"
import { createRequire } from "node:module"
import { readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { runInNewContext } from "node:vm"

const require = createRequire(import.meta.url)
const React = require("react")
const { renderToStaticMarkup } = require("react-dom/server")
const ts = require("typescript")
const directory = dirname(fileURLToPath(import.meta.url))
const layoutPath = resolve(directory, "../components/dashboard/dashboard-layout.tsx")
const rootPath = resolve(directory, "../app/layout.tsx")
const licencesLoadingPath = resolve(directory, "../app/licences/loading.tsx")

function loadDashboardLayout() {
  const navigationContext = React.createContext(null)
  const passthrough = ({ children }) => React.createElement(React.Fragment, null, children)
  const modules = {
    react: React,
    "react/jsx-runtime": require("react/jsx-runtime"),
    "next/navigation": { usePathname: () => "/licences" },
    "./dashboard-navigation-context": { DashboardNavigationProvider: navigationContext.Provider },
    "./sidebar": {
      Sidebar: () => React.createElement("aside", null, "Navigation"),
    },
    "@/components/ui/sheet": {
      Sheet: passthrough,
      SheetContent: () => null,
      SheetTitle: () => null,
      SheetDescription: () => null,
    },
  }
  const source = readFileSync(layoutPath, "utf8")
  const module = { exports: {} }
  const js = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText
  runInNewContext(js, {
    module,
    exports: module.exports,
    require: (name) => {
      assert.ok(name in modules, `Unknown dependency: ${name}`)
      return modules[name]
    },
  })
  return module.exports
}

function loadLicencesLoading() {
  const modules = {
    "react/jsx-runtime": require("react/jsx-runtime"),
    "@/components/ui/skeleton": {
      Skeleton: ({ className }) => React.createElement("div", { "data-skeleton": className }),
    },
    "@/components/dashboard/header": {
      Header: ({ title, subtitle }) => React.createElement(
        "header",
        null,
        React.createElement("h1", null, title),
        React.createElement("p", null, subtitle),
        React.createElement("div", { role: "status" }, "FEACO status banner"),
      ),
    },
  }
  const source = readFileSync(licencesLoadingPath, "utf8")
  const module = { exports: {} }
  const js = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText
  runInNewContext(js, {
    module,
    exports: module.exports,
    require: (name) => {
      assert.ok(name in modules, `Unknown dependency: ${name}`)
      return modules[name]
    },
  })
  return module.exports.default
}

test("the root owns one persistent dashboard frame around legacy route wrappers", () => {
  const root = readFileSync(rootPath, "utf8")
  assert.match(root, /<DashboardShell>\{children\}<\/DashboardShell>/)

  const { DashboardShell, DashboardLayout } = loadDashboardLayout()
  assert.equal(typeof DashboardShell, "function")
  const html = renderToStaticMarkup(
    React.createElement(
      DashboardShell,
      null,
      React.createElement(DashboardLayout, null, "licences"),
    ),
  )
  assert.equal((html.match(/<aside>/g) ?? []).length, 1)
  assert.match(html, /licences/)
})

test("the licences loading fallback keeps the page header and status banner visible", () => {
  const Loading = loadLicencesLoading()
  const html = renderToStaticMarkup(React.createElement(Loading))
  assert.match(html, /<h1>Licences des athlètes<\/h1>/)
  assert.match(html, /role="status">FEACO status banner<\/div>/)
  assert.match(html, /data-skeleton=/)
})
