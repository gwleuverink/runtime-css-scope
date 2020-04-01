// Borrowed from @stimulus:
// https://github.com/stimulusjs/stimulus/blob/master/packages/%40stimulus/core/src/application.ts
export function domReady() {
    return new Promise(resolve => {
        if (document.readyState == "loading") {
            document.addEventListener("DOMContentLoaded", resolve)
        } else {
            resolve()
        }
    })
}

// Borrowed from alpine js
export function isTesting() {
    return navigator.userAgent, navigator.userAgent.includes("Node.js")
        || navigator.userAgent.includes("jsdom")
}

// Borrowed from alpine js
export function walk(el, callback) {
    if (callback(el) === false) return

    let node = el.firstElementChild

    while (node) {
        walk(node, callback)

        node = node.nextElementSibling
    }
}

export function getScopeAttrs(el) {
    return Array.from(el.attributes).filter(attr => {
        const attrRE = /data-scope-[a-z0-9]+/

        return attrRE.test(attr.name)
    })
}