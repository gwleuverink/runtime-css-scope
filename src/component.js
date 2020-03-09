import { walk, getScopeAttrs } from './utils'
import StyleScopeFactory from './style-scope-factory'

export default class Component {

    constructor(el) {
        this.el = el
        const styleElement = document.querySelector('#' + this.el.getAttribute('data-css-scope'))
        
        // Get a scope id (and scope the sheet if not done so before)
        const factory = new StyleScopeFactory(styleElement)
        this.scopeId = factory.build()
        this.scopeElements(this.el, this.scopeId)

        // Use mutation observer to detect new elements being added within this component at run-time.
        this.listenForNewElementsToScope(this.scopeId)
    }

    walkAndSkipNestedComponents(el, callback, initializeComponentCallback = () => { }) {
        walk(el, el => {
            // We've hit a component.
            if (el.hasAttribute('data-css-scope')) {
                // If it's not the current one.
                if (!el.isSameNode(this.el)) {
                    // Initialize it if it's not.
                    if (!el.__css_scope) initializeComponentCallback(el)

                    // Now we'll let that sub-component deal with itself.
                    return false
                }
            }

            return callback(el)
        })
    }

    scopeElements(rootEl, cssScope) {
        this.walkAndSkipNestedComponents(rootEl, el => {
            this.scopeElement(el, cssScope)
        }, el => {
            el.__css_scope = new Component(el)
        })
    }

    scopeElement(el, cssScope) {
        // Make sure only one scope attribute can exist on the element (in case someone starts tinkering with the dom)
        getScopeAttrs(el).forEach(attr => el.removeAttribute(attr))

        el.setAttribute(`data-scope-${cssScope}`, '')
    }

    listenForNewElementsToScope(cssScope) {
        const targetNode = this.el

        const observerOptions = {
            childList: true,
            attributes: true,
            subtree: true,
        }

        const observer = new MutationObserver((mutations) => {
            for (let i = 0; i < mutations.length; i++) {
                // Filter out mutations triggered from child components.
                const closestParentComponent = mutations[i].target.closest('[data-css-scope]')
                if (!(closestParentComponent && closestParentComponent.isSameNode(this.el))) return


                if (mutations[i].addedNodes.length > 0) {
                    mutations[i].addedNodes.forEach(node => {
                        if (node.nodeType !== 1) return

                        if (node.matches('[data-css-scope]')) {
                            node.__x = new Component(node)
                            return
                        }

                        this.scopeElements(node, cssScope)
                    })
                }
            }
        })

        observer.observe(targetNode, observerOptions);
    }
}