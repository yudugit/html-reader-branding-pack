# Sharing

The "Sharing" sub-interface provides functionality most useful to the sharing section of the toolbar submodule.
Its two components will be available as the following global variables:

+ [settings](#sharing-settings): `yudu_sharingSettings`
+ [functions](#sharing-functions): `yudu_sharingFunctions`

## Sharing Settings

+ `twitterIconPath` – the path of the image used for the Twitter icon in the sharing box
    + available only if `yudu_toolbarSettings.sharing.twitter` is `true`
+ `facebookIconPath` – the path of the image used for the Facebook icon in the sharing box
    + available only if `yudu_toolbarSettings.sharing.facebook` is `true`
+ `linkedInIconPath` – the path of the image used for the LinkedIn icon in the sharing box
    + available only if `yudu_toolbarSettings.sharing.linkedIn` is `true`

## Sharing Functions

+ `togglePage(currentPageClicked)` – call when the selection for the page about to be shared is toggled
    + `currentPageClicked` should be `true` if the current page is selected for sharing, and `false` otherwise
    + available only if any of the sharing options is `true`
+ `shareEmail` – call when the "share by email" button is clicked
    + available only if `yudu_toolbarSettings.sharing.emailEnabled` is `true`
+ `shareTwitter` – call when the "share on Twitter" button is clicked
    + available only if `yudu_toolbarSettings.sharing.twitter` is `true`
+ `shareFacebook` – call when the "share on Facebook" button is clicked
    + available only if `yudu_toolbarSettings.sharing.facebook` is `true`
+ `shareLinkedIn` – call when the "share on LinkedIn" button is clicked
    + available only if `yudu_toolbarSettings.sharing.linkedIn` is `true`
