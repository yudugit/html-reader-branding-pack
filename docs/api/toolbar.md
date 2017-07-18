### Toolbar

The "Toolbar" sub-interface provides functionality most useful to the toolbar submodule.
Its two components will be available as the following global variables:

+ [settings](#toolbar-settings): `yudu_toolbarSettings`
+ [functions](#toolbar-functions): `yudu_toolbarFunctions`

#### Toolbar Settings

+ `toolbarIconBasePath` – the path of the folder where the images used for the toolbar buttons are
+ `iconHighResPrefix` – the prefix added to the name of the images used for high resolution devices
+ `iconFileExtension` – the extension of the image files used for the toolbar buttons
+ `shouldUseHighRes` – `true` if the images for high resolution should be used, `false` otherwise
+ `hasDownloadablePdfAndIsNotApp` – `true` if the edition was set up with a downloadable PDF and is not being used within an app on a device, `false` otherwise
+ `searchEnabled` – `true` if the edition was set up with search enabled, `false` otherwise
+ `editionListEnabled` – `true` if the edition was set up with the edition list (archive view) enabled and it is not being shown within an app, `false` otherwise
+ `orderFormEnabled` – `true` if the edition was set up with the order form enabled, `false` otherwise
+ `logoSrc` – the path of the image the edition's logo was set to
    + is `undefined` if the edition was not set up with a logo
+ `logoLinkUrlExists` – `true` if the edition was set up with the logo linking to a URL, `false` otherwise
+ `sharing`
    + `emailEnabled` – `true` if the edition can be shared by email, `false` otherwise
    + `twitter` – `true` if the edition can be shared on Twitter, `false` otherwise
    + `facebook` – `true` if the edition can be shared on Facebook, `false` otherwise
+ `bookmarksEnabled` - `true` if the edition was set up with bookmarks (annotations) enabled, `false` otherwise
+ `notesEnabled` - `true` if the edition was set up with notes (annotations) enabled, `false` otherwise
+ `highlightsEnabled` - `true` if the edition was set up with page highlights (annotations) enabled, `false` otherwise
+ `pageModeStopToggle` - `true` if the edition was set up to prevent the current page mode (one page visible or two) from being toggled, `false` otherwise
+ `fullscreenModeEnabled` - `true` if the edition was set up to allow users to enter fullscreen mode, `false` otherwise
+ `hasArticles` - `true` if the edition was set up with HTML articles to be used in PhoneView, `false` otherwise

#### Toolbar Functions

+ `zoomInClicked` – call when the `zoomIn` button is clicked
+ `zoomOutClicked` – call when the `zoomOut` button is clicked
+ `prevPageClicked` – call when the `prevPage` button is clicked
+ `nextPageClicked` – call when the `nextPage` button is clicked
+ `twoUpToggleClicked` – call when the `twoUpToggle` button is clicked
+ `fitWidthClicked` – call when the `fitWidth` button is clicked
+ `fitPageClicked` – call when the `fitPage` button is clicked
+ `exitFullscreen` – call when the reader should request to exit fullscreen mode
+ `logoClicked` – call when the `logo` is clicked
    + available only if `yudu_toolbarSettings.logoLinkUrlExists` is `true`
+ `editionListClicked` – call when the `editionList` button is clicked
    + available only if `yudu_toolbarSettings.editionListEnabled` is `true`
+ `downloadPdfClicked` – call when the `downloadPdf` button is clicked
    + available only if `yudu_toolbarSettings.hasDownloadablePdf` is `true`
+ `searchClicked` – call when the `search` button is clicked
    + available only on touch devices and when `yudu_toolbarSettings.searchEnabled` is `true`
+ `goFullscreen` – call when the `fullscreen mode` button is clicked
    + available only if `yudu_toolbarSettings.fullscreenModeEnabled` is `true`
    + note that fullscreen mode may be unstable as the specification is not final and as such it is considered experimental
    + to use fullscreen mode while the reader is in an iframe, the iframe must have the `allowfullscreen` attribute
+ `shoppingCartClicked` – call when the `shoppingCart` button is clicked
    + available only when `yudu_toolbarSettings.orderFormEnabled` is `true`
+ `bookmarkClicked` – call when the `bookmark` button is clicked
    + available only when `yudu_toolbarSettings.bookmarksEnabled` is `true`
+ `notesClicked` – call when the `notes` button is clicked
    + available only when `yudu_toolbarSettings.notesEnabled` is `true`
+ `articlesAvailable` - call to check if articles data is available
    + for a protected edition, may start returning `false` but later return `true` if a user has logged in successfully
    + may subscribe to the `COMMON.LOGIN_APPROVED` event for hints of changes to this result
    + once articles data is available, it should not become "unavailable" during the lifetime of the reader
+ `openPhoneView` - call when the `phoneview` button is clicked
    + will do nothing unless `yudu_toolbarSettings.hasArticles` is `true` and `articlesAvailable` returns true
+ `setAutoHide(enable)` – call when a button triggering a togglable is clicked to stop the toolbar from hiding when the togglable is shown (`enable = false`) or to re-enable auto hiding after a certain period of time when the togglable is hidden (`enable = true`)
    + a togglable is a feature represented by a box whose visibility is toggled by a toolbar button and which requires the toolbar to remain visible for the duration for which it's shown (e.g. sharing or contents)
