# Thumbnails

The "Thumbnails" sub-interface provides functionality most useful to the thumbnails submodule.
Its two components will be available as the following global variables:

+ [settings](#thumbnails-settings): `yudu_thumbnailsSettings`
+ [functions](#thumbnails-functions): `yudu_thumbnailsFunctions`

## Thumbnails Settings

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

## Thumbnails Functions

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
