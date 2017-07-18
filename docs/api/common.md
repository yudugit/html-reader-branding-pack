# Common

The "Common" sub-interface is that which provides functionality most broadly applicable, and potentially useful to any of the submodules.
Its two components will be available as the following global variables:

+ [settings](#common-settings): `yudu_commonSettings`
+ [functions](#common-functions): `yudu_commonFunctions`

## Common Settings

+ `brandingFolderPath` – path of the folder where the submodules are placed
+ `isDesktop` – `true` if the Reader is running on a desktop, `false` if it is running on a touch device
+ `clickAction` – the most appropriate click event to add a listener for (`click` or `touchstart`)
+ `width` – the width of the canvas
+ `height` – the height of the canvas
+ `pixelDensity` – the device pixel ratio
+ `toolbarLoaded` – `true` if the toolbar submodule has finished loading, `false` otherwise
+ `orientation` – the orientation of the device: `landscape = 0`, `portrait = 1`
+ `hasIntroPage` – `true` if the edition was set up with an intro page, `false` otherwise
+ `createjs` – the "easel" library module

## Common Functions

+ `returnDynamicInput(input)` - returns a function that returns the (dynamic) value of `input` when called
    + if `input` is a function, it will be called (with no arguments) before its value is returned
    + if `input` is a mutable variable, this can be used as a wrapper to capture the variable's value at that moment and return a function that will always return that captured value
+ `returnFunctionWithDynamicArgs(function, args...)` - returns a function that applies any number of optional arguments to the specified function and returns the output value dynamically
    + each `arg` can be a 0-argument function or a mutable variable as for `returnDynamicInput`
    + for an example usage, please see the sample thumbnails branding script
+ `loadCss(cssFiles, callback)` – load the CSS file(s) and add a callback for when loading is finished
    + `cssFiles` – an array of files paths
    + useful for when the CSS properties need to be loaded before running any scripts
    + if the above is not an issue, CSS can be loaded through the usual `<link>` tag
+ `injectJavascript` - used by the core to load the submodules
+ `createBrandingPath(relativePath)` – returns the full path the Reader requires for the relative path (e.g. toolbar/style.css) provided
+ `getLocalisedStringByCode(messageCode)` - returns a localised string corresponding to the specified message code, or the code if no such string is found
+ `hideToolbar` – hide the toolbar on touch devices (it has no effect on desktop)
+ `enableScrollingWithoutDocumentBouncing(element)` – use on touch devices only for scrollable elements to disable the bouncing of the entire document when scrolling to the beginning/end on iOS
+ `toolbarFinishedLoading` – call this after the toolbar submodule has finished loading
    + __NOT__ optional, as it sets `yudu_commonSettings.toolbarLoaded`, which is used by the core
+ `goToPage(pageNumber)` – call to jump to the page numbered `pageNumber`
