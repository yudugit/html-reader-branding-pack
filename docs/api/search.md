### Search

The "Search" sub-interface provides functionality most useful to the search section of the toolbar submodule.
Its sole component will be available as the following global variable:

+ [functions](#search-functions): `yudu_searchFunctions`

#### Search Functions

+ `setBrandableSearchComponents(searchTextComponent, searchGoComponent)` – provide the text box (`input` tag) and button (`button` tag) search components
+ `positionDesktopSearchResults(position, corners)` – as the search results box depends on the toolbar position, it is necessary to position it
    + `position` – an object with format e.g. `{top: '34px', left: '0px', bottom: 'auto', right: 'auto'}`
    + `corners` – an object with format e.g. `{topLeft: '0px', bottomLeft: '5px', bottomRight: '5px', topRight: '0px'}`
+ `customiseDesktopSearchResults(colour)` – use to brand the desktop search results box
    + `colour` – a string indicating the style for CSS property `background-color`
