import Component from './component'
import { domReady, isTesting } from './utils'

// DOM walking logic borrowed from alpine js:
// https://github.com/alpinejs/alpine/blob/master/src/index.js
const CssScope = {
    init: async function () {
        if (!isTesting()) {
            await domReady()
        }

        this.discoverComponents(el => {
            this.initializeComponent(el)
        })

        this.listenForNewUninitializedComponentsAtRunTime(el => {
            this.initializeComponent(el)
        })
    },

    discoverComponents: function (callback) {
        const rootEls = document.querySelectorAll('[data-css-scope]');

        rootEls.forEach(rootEl => {
            callback(rootEl)
        })
    },

    discoverUninitializedComponents: function (callback, el = null) {
        const rootEls = (el || document).querySelectorAll('[data-css-scope]');

        Array.from(rootEls)
            .filter(el => el.__css_scope === undefined)
            .forEach(rootEl => {
                callback(rootEl)
            })
    },

    listenForNewUninitializedComponentsAtRunTime: function (callback) {
        const targetNode = document.querySelector('body');

        const observerOptions = {
            childList: true,
            attributes: true,
            subtree: true,
        }

        const observer = new MutationObserver((mutations) => {
            for (let i = 0; i < mutations.length; i++) {
                if (mutations[i].addedNodes.length > 0) {
                    mutations[i].addedNodes.forEach(node => {
                        // Discard non-element nodes (like line-breaks)
                        if (node.nodeType !== 1) return

                        // Discard any changes happening within an existing component.
                        // They will take care of themselves.
                        if (node.parentElement && node.parentElement.closest('[data-css-scope]')) return

                        this.discoverUninitializedComponents((el) => {
                            this.initializeComponent(el)
                        }, node.parentElement)
                    })
                }
            }
        })

        observer.observe(targetNode, observerOptions)
    },

    initializeComponent: function (el) {
        if (!el.__css_scope) {
            el.__css_scope = new Component(el)
        }
    }
}

if (!isTesting()) {
    window.CssScope = CssScope
    window.CssScope.init()
}

export default CssScope
