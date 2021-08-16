# Download PDF

The "Download PDF" sub-interface provides functionality most useful to the download PDF section of the toolbar submodule.
Its two components will be available as the following global variables:

+ [settings](#downloadPdf-settings): `yudu_downloadPdfSettings`
+ [functions](#downloadPdf-functions): `yudu_downloadPdfFunctions`

## Download PDF Settings

+ `downloadWholePdfEnabled` - `true` if the edition was set up with a downloadable PDF and is not being used within an app on a device, `false` otherwise
+ `downloadCustomSelectionEnabled` - `true` if the edition was set up with the downloading of user selected pages as PDF enabled, `false` otherwise
+ `downloadBookmarkSelectionEnabled` - `true` if `yudu_downloadPdfSettings.downloadCustomSelectionEnabled` is `true` and the edition was set up with bookmarks (annotations) enabled, `false` otherwise



## Download PDF Functions

+ `downloadWholePdfClicked` – call when the `wholePdf` button on the `downloadPdf` menu is clicked
    + available only if `yudu_downloadPdfSettings.downloadWholePdfEnabled` is `true`
+ `downloadCustomSelectionClicked` - call when the `customSelection` button on the `downloadPdf` menu is clicked
    + available only if `yudu_downloadPdfSettings.downloadCustomSelectionEnabled` is `true`
+ `downloadCustomSelectionCancelClicked` - call when the `downloadPdfCustomSelectionCancel` button on the `downloadPdfCustomSelectionToolbar` is clicked
    + available only if `yudu_downloadPdfSettings.downloadCustomSelectionEnabled` is `true`
+ `downloadCustomSelectionSelectClicked` - call when the `downloadPdfCustomSelectionSelect` button on the `downloadPdfCustomSelectionToolbar` is clicked
    + available only if `yudu_downloadPdfSettings.downloadCustomSelectionEnabled` is `true`
+ `downloadCustomSelectionDoneClicked` - call when the `downloadPdfCustomSelectionDone` button on the `downloadPdfCustomSelectionToolbar` is clicked
    + available only if `yudu_downloadPdfSettings.downloadCustomSelectionEnabled` is `true`
+ `downloadBookmarkSelectionClicked` - call when the `bookmarkSelection` button on the `downloadPdf` menu is clicked
    + available only if `yudu_downloadPdfSettings.downloadBookmarkSelectionEnabled` is `true`