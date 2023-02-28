
const runTimeDependencies = {
    "externals": {
        "@youwol/os-core": "^0.1.5",
        "@youwol/http-clients": "^2.0.2"
    },
    "includedInBundle": {}
}
const externals = {
    "@youwol/os-core": {
        "commonjs": "@youwol/os-core",
        "commonjs2": "@youwol/os-core",
        "root": "@youwol/os-core_APIv01"
    },
    "@youwol/http-clients": {
        "commonjs": "@youwol/http-clients",
        "commonjs2": "@youwol/http-clients",
        "root": "@youwol/http-clients_APIv2"
    }
}
const exportedSymbols = {
    "@youwol/os-core": {
        "apiKey": "01",
        "exportedSymbol": "@youwol/os-core"
    },
    "@youwol/http-clients": {
        "apiKey": "2",
        "exportedSymbol": "@youwol/http-clients"
    }
}

const mainEntry : {entryFile: string,loadDependencies:string[]} = {
    "entryFile": "./lib/index.ts",
    "loadDependencies": [
        "@youwol/os-core",
        "@youwol/http-clients"
    ]
}

const secondaryEntries : {[k:string]:{entryFile: string, name: string, loadDependencies:string[]}}= {}

const entries = {
     '@youwol/installer-potree': './lib/index.ts',
    ...Object.values(secondaryEntries).reduce( (acc,e) => ({...acc, [`@youwol/installer-potree/${e.name}`]:e.entryFile}), {})
}
export const setup = {
    name:'@youwol/installer-potree',
        assetId:'QHlvdXdvbC9pbnN0YWxsZXItcG90cmVl',
    version:'0.1.0-wip',
    shortDescription:"Installer potree",
    developerDocumentation:'https://platform.youwol.com/applications/@youwol/cdn-explorer/latest?package=@youwol/installer-potree',
    npmPackage:'https://www.npmjs.com/package/@youwol/installer-potree',
    sourceGithub:'https://github.com/youwol/installer-potree',
    userGuide:'https://l.youwol.com/doc/@youwol/installer-potree',
    apiVersion:'01',
    runTimeDependencies,
    externals,
    exportedSymbols,
    entries,
    secondaryEntries,
    getDependencySymbolExported: (module:string) => {
        return `${exportedSymbols[module].exportedSymbol}_APIv${exportedSymbols[module].apiKey}`
    },

    installMainModule: ({cdnClient, installParameters}:{
        cdnClient:{install:(unknown) => Promise<Window>},
        installParameters?
    }) => {
        const parameters = installParameters || {}
        const scripts = parameters.scripts || []
        const modules = [
            ...(parameters.modules || []),
            ...mainEntry.loadDependencies.map( d => `${d}#${runTimeDependencies.externals[d]}`)
        ]
        return cdnClient.install({
            ...parameters,
            modules,
            scripts,
        }).then(() => {
            return window[`@youwol/installer-potree_APIv01`]
        })
    },
    installAuxiliaryModule: ({name, cdnClient, installParameters}:{
        name: string,
        cdnClient:{install:(unknown) => Promise<Window>},
        installParameters?
    }) => {
        const entry = secondaryEntries[name]
        if(!entry){
            throw Error(`Can not find the secondary entry '${name}'. Referenced in template.py?`)
        }
        const parameters = installParameters || {}
        const scripts = [
            ...(parameters.scripts || []),
            `@youwol/installer-potree#0.1.0-wip~dist/@youwol/installer-potree/${entry.name}.js`
        ]
        const modules = [
            ...(parameters.modules || []),
            ...entry.loadDependencies.map( d => `${d}#${runTimeDependencies.externals[d]}`)
        ]
        return cdnClient.install({
            ...parameters,
            modules,
            scripts,
        }).then(() => {
            return window[`@youwol/installer-potree/${entry.name}_APIv01`]
        })
    },
    getCdnDependencies(name?: string){
        if(name && !secondaryEntries[name]){
            throw Error(`Can not find the secondary entry '${name}'. Referenced in template.py?`)
        }
        const deps = name ? secondaryEntries[name].loadDependencies : mainEntry.loadDependencies

        return deps.map( d => `${d}#${runTimeDependencies.externals[d]}`)
    }
}
