The HTML Reader Branding Pack
=============================

## Table of Contents

+ Table of Contents
+ [Introduction](#introduction)
  + [Important Information](#important-information)
  + [Background on the HTML Reader](#background-on-the-html-reader)
      + [The HTML Reader Build Process](#the-html-reader-build-process)
+ [Building the HTML Reader Branding Pack](#building-the-html-reader-branding-pack)
+ [String Overrides](#string-overrides)
+ [The Brandable Submodules API](#the-brandable-submodules-api)
    + [Common](#common)
        + [Common Settings](#common-settings)
        + [Common Functions](#common-functions)
    + [Contents](#contents)
        + [Contents Settings](#contents-settings)
    + [Events](#events)
        + [Event Topics](#event-topics)
        + [Event Emitter](#event-emitter)
        + [Events Functions](#events-functions)
    + [Loading](#loading)
        + [Loading Settings](#loading-settings)
        + [Loading Functions](#loading-functions)
    + [Search](#search)
        + [Search Functions](#search-functions)
    + [Sharing](#sharing)
        + [Sharing Settings](#sharing-settings)
        + [Sharing Functions](#sharing-functions)
    + [Thumbnails](#thumbnails)
        + [Thumbnails Settings](#thumbnails-settings)
        + [Thumbnails Functions](#thumbnails-functions)
    + [Toolbar](#toolbar)
        + [Toolbar Settings](#toolbar-settings)
        + [Toolbar Functions](#toolbar-functions)
+ [Final Notes](#final-notes)

## Introduction

The HTML Reader "Branding Pack" loosely consists of three different sets of materials.

1. Images
    + for example, the "artwork" subfolder is where most of the images for the UI are kept
2. Overrides
    + for example, an edition- or publication-specific language pack may be included in the branding pack to allow specific override values for the default language packs
3. Brandable submodule scripts
    + for example, scripts that allow near-complete control over the Reader's various toolbars and several other UI elements

This document largely focuses on the latter.
It outlines the interface provided by the Reader for the brandable submodules within.
It assumes a certain degree of familiarity with the HTML Reader, as well as basic JavaScript concepts.
The various sections sometimes also include a greater degree of implementation details, requiring more specialist knowledge.
In general, a first port of call to anything listed in the API should be its use in the default branding pack - these will give you more context for how something is used.

### Important Information

The HTML Reader branding pack is applied incrementally.
That is, during a preview operation, the _default_ branding pack will be applied first.
Once that has been applied, your customised branding pack will then be applied **over the top** of the default.
Thus, any files in your customised branding pack will override any default files of the same name, but any default files not overridden will still be present.

Using this technique, it is trivial to customise images without requiring any knowledge of JavaScript.
Simply upload a branding pack with your custom images, following the directory structure of the default pack.
In such a case, your images will replace those of the default pack.
By omitting any scripts in your upload, those from the default pack will still be applied - they are not overridden.

### Background on the HTML Reader

The HTML Reader itself is modular in design.
Separate modules are responsible for different aspects of its behaviour, and all come together to create an instance of a `Reader` object.
Each `Reader` will only ever be responsible for one edition in a given HTML document's lifetime.

What are now referred to as the "Brandable Submodules" used to once be modules in the Reader's core.
After being extracted, each can now be considered a part of the "BrandableSubmodules" module - hence each is now referred to as a submodule.

#### The HTML Reader Build Process

The HTML Reader undergoes an optimisation process called minification as part of its build process.
One reason among many for doing this to combine multiple development-versioned source files into a single, smaller file for ease of deployment.
In addition to this, all the code in the default branding pack is minified during its build process.
In fact, if you do not override the configurable JSON settings files but only upload an unminified submodule script, your script will not override the default.
This is due to the build process, which minifies all scripts, and in particular then updates the references in the settings files to point to these minified files.
(A minified JavaScript file will usually have the `.min.js` file extension instead of the `.js` file extension, and that convention is followed here.)

A keen reader will notice the default settings included here do not point to minified files, but to the unminified files present.
This allows you to upload a copy of this pack as-is, and it should work identically to the current default branding pack.
(Though doing so is not advised as your editions will not get updates automatically for unbranded submodules in such a case.)
It is strongly advised that should you make changes to the source code related here, you minify it prior to use.
If you do, please also remember to use the correct file name references in the settings files.


## Building the HTML Reader Branding Pack

To build the branding pack you can use the provided Gradle tasks which are declared in `build.gradle`. The tasks of interest are located in the *Branding Pack Build tasks* group which are listed below:

- **build** - _Minifies the JavaScript files and compiles the LESS files for all parts of the branding pack_
- **clean** - _Cleans up all the output files from the build scripts_
- **compileAllCss** - _Compiles all the LESS files in this project_
- **minifyAllJs** - _Minifies all the JavaScript files in this project and updates all the config files to use the minified versions_

Each of the minification and compilation tasks works in the default state of the repository, as in they expect a single JavaScript file to minify and a single LESS file to compile in each submodule.

Note that the JavaScript minification process also updates the config file in each submodule to make sure it references the minified version instead of the original source version. The `clean` task will undo this change.

### Running Gradle
This repository includes the Gradle wrapper which can be used to run the tasks without installing Gradle itself. For more information about how this works and how to use the Gradle wrapper see the official documentation [here](https://docs.gradle.org/current/userguide/gradle_wrapper.html). Typically you should only need to run `./gradlew build` and not concern yourself with the tasks in the *JavaScript Minification* and *LESS Compilation* groups.

## String Overrides
The strings shown in the HTML reader are localisable to enable editions to be shown in different languages.
There is also the ability to override the default strings used by the HTML reader in this branding pack via the `customStringsPack.json` file.
This file is read by the HTML reader and any strings included in it are used as overrides for the defaults, thus you only have to include the strings you want to change not all of them in this file.
The current default English values are as follows (in JSON format):

```json
{  
   "loading.tiles":"Loading...",
   "sharing.shareTitle":"Share page",
   "sharing.firstPage":"First",
   "sharing.currentPage":"Current",
   "sharing.email":"Email",
   "sharing.facebook":"Facebook",
   "sharing.twitter":"Twitter",
   "sharing.fromAddress":"From",
   "sharing.toAddress":"To",
   "sharing.fromAddressPlaceholder":"me@example.com",
   "sharing.toAddressPlaceholder":"friend@example.com",
   "sharing.comments":"Comment",
   "sharing.cancel":"Cancel",
   "sharing.send":"Send",
   "sharing.close":"Close",
   "sharing.contactingServer":"Contacting server...",
   "sharing.genericError":"An error occurred contacting the server",
   "sharing.errors.fromEmailInvalid":"The from email address was not a valid email address",
   "sharing.errors.toEmailInvalid":"The to email address was not a valid email address",
   "sharing.errors.emailError":"This edition cannot be sent to the requested email address at this time",
   "sharing.errors.error":"This edition cannot be shared with the requested site at this time",
   "sharing.errors.notLive":"The edition that you are trying to share is not live",
   "login.forgottenPassword":"Forgotten your password?",
   "login.login":"Login",
   "login.gotoNextFreePage":"Go to the next free page",
   "login.reset.popup":"Error opening new window. Pop up blocking must be turned off to see the reset password page",
   "login.reset.genericError":"An error occurred contacting the server",
   "login.reset.sent":"We have sent a password reset email to your email address",
   "login.reset.contactingServer":"Contacting server...",
   "login.reset.errors.no_email":"Please enter your email address so that we can send the password reset email",
   "login.reset.errors.email_not_found":"We were unable to send a reset email, please check that your email address is correct",
   "login.reset.errors.email_invalid":"We were unable to send a reset email, please check that your email address is correct",
   "login.reset.errors.unavailable":"An error occurred sending the reset email, please try again",
   "login.reset.errors.unknown_error":"An error occurred sending the reset email, please try again",
   "login.auth.genericError":"An error occurred contacting the server",
   "login.auth.errors.failure":"An error occurred during login",
   "login.auth.errors.credentials":"Login failed because the login details provided were not correct, please try again",
   "login.auth.errors.readerLimit":"Login failed because the number of devices that this subscription login has been used on has been exceeded",
   "login.auth.errors.dateRestriction":"Login failed because this edition is not covered by the dates of your subscription",
   "login.auth.errors.userNotAuthenticated":"Login failed because the login details provided do not have access to this edition",
   "login.contactingServer":"Contacting server...",
   "login.explanation":"This edition requires a subscription to view, please login",
   "login.libraryExplanation": "Please login to your Yudu Free account to view the next page",
   "login.libraryPasswordExplanation": "A password is required to view the next page. This should have been given to you by your content provider.",
   "login.username":"Username",
   "login.password":"Password",
   "info.title":"Navigation Guide",
   "info.mouseText":"click: menu/interact | scroll: zoom | click & drag: pan",
   "info.touchText":"tap: menu/interact | pinch: zoom | hold & drag: pan",
   "info.doNotShowAgain":"Don't show this information again",
   "info.close":"Close",
   "info.unableToOpenLink.message": "It looks like you tried to follow a link, but we could not confirm if it opened correctly. Do you want to navigate there directly instead?",
   "info.unableToOpenLink.back": "Cancel",
   "info.unableToOpenLink.forward": "Follow link",
   "thumbnails.page":"Page",
   "thumbnails.intro":"Introduction",
   "thumbnails.segments.primary":"Pages",
   "thumbnails.segments.bookmarks":"Bookmarks",
   "thumbnails.segments.pageHighlights":"Highlights",
   "thumbnails.segments.notes":"Notes",
   "message.close":"Close",
   "messages.popup":"Error opening new window. Pop up blocking must be turned off to share this page",
   "criticalError":"An error occurred, please refresh and try again",
   "phoneview.criticalError": "An error occurred trying to open PhoneView, please try again",
   "search.placeholder":"Search edition",
   "search.noResults":"0 results",
   "search.searching":"Searching...",
   "search.close":"Close",
   "search.page":"Page: ",
   "ugc.syncError":"Unable to synchronise annotations. Changes to annotations will only be saved locally.",
   "ugc.sync.subscriberError":"Unable to verify details to synchronise annotations. Annotations will only be saved locally.",
   "ugc.login.explanation":"Subscribers can synchronise their annotations if they login.",
   "ugc.syncMerge.message":"Offline annotations have been detected. If you wish, you can merge them into your existing annotations. Otherwise you can discard them.",
   "ugc.syncMerge.merge":"Merge",
   "ugc.syncMerge.discard":"Discard",
   "bookmarks.introPageWarning":"You cannot bookmark the intro page.",
   "highlights.cancel":"Cancel",
   "highlights.undo":"Undo",
   "highlights.clearAll":"Clear All",
   "highlights.redo":"Redo",
   "highlights.save":"Save",
   "highlights.introPageWarning":"You cannot create highlights on the intro page.",
   "note.createNoteMessage":"Tap to add note",
   "note.cancel":"Cancel",
   "note.save":"OK",
   "note.delete":"Delete",
   "note.browse":"Browse",
   "note.ok":"OK",
   "note.deleteNoteMessage":"Are you sure you want to delete this note?",
   "note.firstNoteCreated":"You have just created a note. Tap to open or edit it, or touch and hold to move it.",
   "note.introPageWarning":"You cannot create notes on the intro page.",
   "notes.browse.error":"A problem has occurred while updating the notes browse view.",
   "notes.browse.modificationWarning":"The note you were browsing may have been deleted or modified remotely.",
   "orderForm.title":"Order Form",
   "orderForm.productCode":"Product Code",
   "orderForm.description":"Description",
   "orderForm.quantity":"Quantity",
   "orderForm.itemPrice":"Item Price",
   "orderForm.price":"Price",
   "orderForm.removeItem":"Remove",
   "orderForm.removeAllItems":"Remove All",
   "orderForm.noItems":"There are no items in your cart",
   "orderForm.totalPrice":"Total",
   "orderForm.dismissOrderForm":"Continue Shopping",
   "orderForm.send":"Send Order",
   "orderForm.download": "Download Cart to CSV",
   "orderForm.next":"Next >",
   "orderForm.previous":"< Previous",
   "orderForm.genericError":"An error occurred contacting the server",
   "orderForm.success":"Your order has been successfully sent.",
   "orderForm.invalidEmail":"Please use a valid email address",
   "orderForm.missingDetails":"Please fill out all mandatory fields",
   "orderForm.error":"Your order could not be sent at this time. Please try again later.",
   "orderForm.deliveryDetails.name":"Name*",
   "orderForm.deliveryDetails.phone":"Phone*",
   "orderForm.deliveryDetails.email":"Email*",
   "orderForm.deliveryDetails.accountNumber":"AccountNumber",
   "orderForm.deliveryDetails.poNumber":"PO Number",
   "orderForm.deliveryDetails.companyName":"Company Name",
   "orderForm.deliveryDetails.billingAddress":"Billing Address",
   "orderForm.deliveryDetails.deliveryAddress":"Delivery Address",
   "orderForm.deliveryDetails.deliveryDetailsDeliveryAddressSameAsBillingAddress":"Same as Billing Address?",
   "orderForm.deliveryDetails.address1":"Address 1*",
   "orderForm.deliveryDetails.address2":"Address 2",
   "orderForm.deliveryDetails.city":"City / Town*",
   "orderForm.deliveryDetails.state":"State / Province*",
   "orderForm.deliveryDetails.postCode":"Post / Zip Code*",
   "orderForm.deliveryDetails.country":"Country*",
   "orderForm.deliveryDetails.additionalInformation":"Additional Information"
}
```

## The Brandable Submodules API

The following sections attempt to outline the functionality of the HTML Reader exposed to the submodules.
It is split into multiple "sub-interfaces", with most submodules having access to targeted "settings" and "functions" components.
All components will be added to the window to be globally available.
In general, these sub-interfaces will only be made available immediately before the relevant HTML fragments are imported.
In particular, this means you cannot rely on components targeted to a different submodule to be available when your scripts first initialise, though they should all be available once the Reader's own initialisation has finished.
The exceptions to this are the "Common" and "Events" sub-interfaces, which should be available for all of the submodules to use.

### Common

The "Common" sub-interface is that which provides functionality most broadly applicable, and potentially useful to any of the submodules.
Its two components will be available as the following global variables:

+ [settings](#common-settings): `yudu_commonSettings`
+ [functions](#common-functions): `yudu_commonFunctions`

#### Common Settings

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

#### Common Functions

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

### Contents

The "Contents" sub-interface provides data relating to the edition's table of contents.
This does not correlate to any specific submodule but is targeted to be available for the toolbar.
Its sole component will be available as the following global variable:

+ [settings](#contents-settings): `yudu_contentsSettings`

#### Contents Settings

+ `contentsData` – the ToC data as set in Publisher
    + the data consists of an array of objects with format e.g.:
            ```
            {
                "page": 1,
                "description": "Cover",
                "children": [
                    {
                        "page": 1,
                        "description": "Title 1"
                    },
                    {
                        "page": 1,
                        "description": "Title 2"
                    }
                ]
            }
            ```
    + only the root objects may have children

### Events

The "Events" sub-interface provides functionality related to listening/subscribing to Reader events.
Like "Common", this sub-interface should be available to all the brandable submodules.
Events relevant to the submodules can be subscribed to using the component registered as the global variable `yudu_events`.
Unlike some other sub-interfaces, everything related to events is available on this single variable.
This includes the [event topics](#event-topics), [event emitter](#event-emitter), and all the [events functions](#events-functions).


#### Event Topics

The events interface provides a list of known topics the submodules can subscribe to.
A topic is essentially a type of event.
For example, when a product is added to the shopping cart, the Reader will emit an event of type `yudu_events.TOOLBAR.UPDATE_SHOPPING_CART_BUTTON`.
The submodules may subscribe to any of these topics.
For example, the toolbar may subscribe to this topic to update the shopping cart button to show the correct number of items in the cart.

The list of topics is available as a standard JavaScript hash / JSON object, whose root is the global events variable.
It follows the following structure:

+ `COMMON`
    + `RESIZE`
    + `TOUCH`
    + `UGC_BOOKMARKS_CHANGED`
    + `UGC_PAGE_HIGHLIGHTS_CHANGED`
    + `UGC_NOTES_CHANGED`
    + `LOGIN_SUCCESS`
    + `LOGIN_APPROVED`
+ `TOOLBAR`
    + `FIT_WIDTH_OR_SCREEN_ACTION`
    + `UPDATE_SHOPPING_CART_BUTTON`
    + `UPDATE_BOOKMARK_BUTTON`
    + `SEARCH_READY`
    + `LOADED`
+ `THUMBNAILS`
    + `PAGE_CHANGED`
    + `TOGGLE_THUMBNAILS`
    + `UPDATE_THUMBNAIL`
+ `DRAWING_TOOLBARS`
    + `TOGGLE_TOOLBARS`
+ `LOADING`
    + `DISPLAY_PROGRESS`
    + `END_LOADING`

#### Event Emitter

An event emitter is how the Reader tracks the source of an event.
The events intended for the submodules will have a generic emitter named `yudu_events.ALL`.

#### Events Functions

+ `subscribe(emitter, topic, callback, async)` – subscribes the given callback function to the emitter and topic combination
+ `unsubscribe(emitter, topic, callback, async)` – unsubscribes the given callback function from the emitter and topic combination
+ `isSubscribed(emitter, topic, callback, async)` – determines whether the given callback is subscribed to the emitter and topic combination
+ `callback(scope, method)` – convenience function which returns a function with the given scope
    + Extra arguments can be passed to this function which will then be passed to the method in addition to any other arguments passed when the callback is called.

### Loading

The "Loading" sub-interface provides functionality most useful to the loading screen submodule.
Its two components will be available as the following global variables:

+ [settings](#loading-settings): `yudu_loadingSettings`
+ [functions](#loading-functions): `yudu_loadingFunctions`

#### Loading Settings

+ `bgTopColour` - colour code used in defining the gradient fill for the background of the edition
    + colour codes should be in hex form, but omit the leading `#`
    + used as the "top" anchor in a linear gradient
    + if not specified, uses the value applied to the edition in its Branding Settings prior to publishing, or else defaults to black
+ `bgBottomColour` - colour code used in defining the gradient fill for the background of the edition
    + colour codes should be in hex form, but omit the leading `#`
    + used as the "bottom" anchor in a linear gradient
    + if not specified, uses the value applied to the edition in its Branding Settings prior to publishing, or else defaults to black
+ `loadingString` - a descriptive (localised) string that can be used to label the loading bar

#### Loading Functions

+ `setGradientBackground(jquerySelector, settings)` - apply a gradient defined by `settings` to the first object in the `jquerySelector`
    + `settings` should contain appropriate `bgTopColour` and `bgBottomColour` colour code attributes
+ `fadeLoadingScreen(duration)` - fades the elements related to the loading screen
    + `duration` should be an integer specifying the number of milliseconds the fadeout should take

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

### Sharing

The "Sharing" sub-interface provides functionality most useful to the sharing section of the toolbar submodule.
Its two components will be available as the following global variables:

+ [settings](#sharing-settings): `yudu_sharingSettings`
+ [functions](#sharing-functions): `yudu_sharingFunctions`

#### Sharing Settings

+ `twitterIconPath` – the path of the image used for the Twitter icon in the sharing box
    + available only if `yudu_toolbarSettings.sharing.twitter` is `true`
+ `facebookIconPath` – the path of the image used for the Facebook icon in the sharing box
    + available only if `yudu_toolbarSettings.sharing.facebook` is `true`

#### Sharing Functions

+ `togglePage(currentPageClicked)` – call when the selection for the page about to be shared is toggled
    + `currentPageClicked` should be `true` if the current page is selected for sharing, and `false` otherwise
    + available only if any of the sharing options is `true`
+ `shareEmail` – call when the "share by email" button is clicked
    + available only if `yudu_toolbarSettings.sharing.emailEnabled` is `true`
+ `shareTwitter` – call when the "share on Twitter" button is clicked
    + available only if `yudu_toolbarSettings.sharing.twitter` is `true`
+ `shareFacebook` – call when the "share on Facebook" button is clicked
    + available only if `yudu_toolbarSettings.sharing.facebook` is `true`

### Thumbnails

The "Thumbnails" sub-interface provides functionality most useful to the thumbnails submodule.
Its two components will be available as the following global variables:

+ [settings](#thumbnails-settings): `yudu_thumbnailsSettings`
+ [functions](#thumbnails-functions): `yudu_thumbnailsFunctions`

#### Thumbnails Settings

+ `pagesDetails` – an array of objects which contain details about each page necessary for generating thumbnails
    + the format of the object is e.g.:
            ```
            {
                "width": 100,
                "height": 200,
                "encrypted": false,
                "label": "Cover"
            }
            ```
+ `introString` – the localised string for the `thumbnails.intro` code
+ `pageString` – the localised string for the `thumbnails.page` code
+ `primarySegmentString` – the localised string for the `thumbnails.segments.primary` code
+ `bookmarksSegmentString` – the localised string for the `thumbnails.segments.bookmarks` code
+ `highlightsSegmentString` – the localised string for the `thumbnails.segments.pageHighlights` code
+ `notesSegmentString` – the localised string for the `thumbnails.segments.notes` code
+ `fps` – the frame rate of the Reader
    + see [EaselJS](http://www.createjs.com/docs/easeljs/classes/Ticker.html) docs for more details
+ `tickTimeMs` – the time between ticks
+ `baseThumbnailFolder` - the path of the folder where the images used for thumbnails are

#### Thumbnails Functions

+ `getCurrentPage` – the page index for the page the edition is currently opened to
    + will be the left-hand page in two-up mode
    + NB: pages are 0-indexed, with index 0 referring to the intro page if present, or the first page of the edition if not. Use in combination with `yudu_commonSettings.hasIntroPage` to convert to a page number if required.
+ `getThumbnailUrl` - takes a thumbnail filename and retrieves the URL for it
+ `getThumbnailUrlCss` - takes a thumbnail filename and returns a string suitable for changing a DOM element's image to the thumbnail via the element's CSS
+ `getThumbnailFileName` - takes a page index and retrieves the filename for the thumbnail of the specified page
+ `addElementToStage(element)` – call to add an EaselJS element to the stage
+ `toggleThumbnails(toggle, show)` – call to emit an event to toggle (use only the `toggle` parameter) or show/hide (use the `show` parameter, with `toggle` set to `false`) the thumbnails
+ `pageHasBookmarks(pageIndex)` - function that returns a function capable of checking whether the page with the specified index is bookmarked
    + returns `true` if the page is bookmarked
    + pages are 0-indexed, including the intro page where available
    + will return a blocking function (always returns `false`) if bookmarks are not enabled or have not yet been initialised
+ `pageHasHighlights(pageIndex)` - function that returns a function capable of checking whether the page with the specified index has any page highlights
    + returns `true` if the page does have highlights
    + pages are 0-indexed, including the intro page where available
    + will return a blocking function (always returns `false`) if highlighting is not enabled or the highlighting canvas has not yet been initialised
+ `pageHasNotes(pageIndex)` - function that returns a function capable of checking whether the page with the specified index has any notes
    + returns `true` if the page does have notes
    + pages are 0-indexed, including the intro page where available
    + will return a blocking function (always returns `false`) if notes are not enabled or have not yet been initialised

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

## Final Notes

+ Use the `click` event type instead of `yudu_commonSettings.clickAction` for elements where `touchstart` might be triggered by something else
    + for example, scrolling through the list of contents
+ Add the `yudu_localisable` class to elements containing string codes from the language pack
    + this allows the Reader to identify them and insert the appropriate localised text
