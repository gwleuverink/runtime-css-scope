# Runtime CSS Scope

Are you working in an old shitty codebase and those darn `!important`'s are driving you mad? This library aims to solve your woes!

## When would I use this library?
When you are working with a perticularly pesky CSS codebase without a modern build system, specificity of new CSS components can become an issue. Usually the best way to go is to rewrite the CSS source, but most of the time reality isn't that perfect. 

Don't want to deal with it at all? No problem, use this library. But use it wisely.


## Usage
Below you see a html component with some terrible specificity creep 
Simply add a `<style>` tag somewhere in the document with an id.

Then all you need to do is add a data-css-scope="style-tag-id" to the root node you are having trouble with. That's it!

``` html
<div data-css-scope="style-tag-id" class="component">
    <div class="component__child">
        <h2>Why CSS no good?</h2>
    </div>
</div>

<style id="style-tag-id">
    .component {
        //
    }
    .component__child {
        //
    }
    .component, .another-component .component__child {
        //
    }
</style>
```

The example above wil magically turn into:
``` html
<div data-css-scope="style-tag-id" class="component" data-scope-hx3v76>
    <div class="component__child" data-scope-hx3v76>
        <h2 data-scope-hx3v76>Why CSS no good?</h2>
    </div>
</div>

<style id="style-tag-id">
    .component [data-scope-hx3v76] {
        //
    }
    .component__child [data-scope-hx3v76] {
        //
    }
    .component[data-scope-hx3v76], .another-component .component__child[data-scope-hx3v76] {
        //
    }
</style>
```

## Supported CSS rule types
Right now we support the following:
1. Regular style rules (also with complex patterns like child/sibling/pseudo selectors)
2. Media rules

On the roadmap we have:
1. Keyframes
2. Keyframe

**The @import rule is not supported by design.** These scoped components need to stay small and we believe adding @import makes it too easy for these components to grow out of hand. Implementing it in the future is not impossible.

## Should I use this library?
You are probably wondering if it's a good idea to parse and lex CSS after the DOM has loaded. The answer is simple, probably not. 

Using this library with not too largde CSS components sprinkled in your template will result in a minimal performance hit. You have to be mindfull though, scoping a 1 mb css string is not recommended. 

## Is adding dynamic markup inside the document an issue?
Nope, we use mutation observer to mitigate that. All markup gets a scope attribute assigned to it, even if it's dynamically added to the DOM after load.

## How we mitigate performance issues
Nothing yet. In the future style tags should be parsed once and it's original checksum is stored so the scoped content can be loaded from cache on subsequent visits.

## Credits
The code used for DOM walking was borrowed from Alpinejs & Stimulus. The CSS Parser is original work but uses some code from CSSOM.
