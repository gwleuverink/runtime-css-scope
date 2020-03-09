# Runtime CSS Scope

Are you working in an old shitty codebase and those darn `!important`'s are driving you mad? This package aims to solve your woes!

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

## Should I use this package?
You are probably wondering if it's a good idea to parse and lex CSS after the DOM has loaded. The answer is simple, probably not. But since you are already working in a shitty codebase performance is probably your last concern. It's time to get shit done over here.

## What the package aims to do to mitigate performance issues
Nothing yet. In the future style tags should be parsed once and it's original checksum is stored so the scoped content can be loaded from cache on subsequent visits.

## Is adding dynamic markup inside the document an issue?
Nope, we use mutation observer to mitigate that

## Credits
The code used for DOM walking was borrowed from Alpinejs & Stimulus. The CSS Parser is original work but uses some code from CSSOM.