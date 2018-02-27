# Loading

The "Loading" sub-interface provides functionality most useful to the loading screen submodule.
Its two components will be available as the following global variables:

+ [settings](#loading-settings): `yudu_loadingSettings`
+ [functions](#loading-functions): `yudu_loadingFunctions`

## Loading Settings

+ `bgTopColour` - colour code used in defining the gradient fill for the background of the edition
    + colour codes should be in hex form, but omit the leading `#`
    + used as the "top" anchor in a linear gradient
    + if not specified, uses the value applied to the edition in its Branding Settings prior to publishing, or else defaults to black
+ `bgBottomColour` - colour code used in defining the gradient fill for the background of the edition
    + colour codes should be in hex form, but omit the leading `#`
    + used as the "bottom" anchor in a linear gradient
    + if not specified, uses the value applied to the edition in its Branding Settings prior to publishing, or else defaults to black
+ `loadingString` - a descriptive (localised) string that can be used to label the loading bar
+ `lastProgressReport` - number between 0 and 100 (inclusive) with the last progress report made
    + useful for setting initial state in case progress is made prior to the loading script being evaluated
+ `loaded` - boolean flag indicating whether the Reader has finished loading
    + useful for checking if the Reader finished loading prior to the loading script being evaluated

## Loading Functions

+ `setGradientBackground(jquerySelector, settings)` - apply a gradient defined by `settings` to the first object in the `jquerySelector`
    + `settings` should contain appropriate `bgTopColour` and `bgBottomColour` colour code attributes
+ `fadeLoadingScreen(duration)` - fades the elements related to the loading screen
    + `duration` should be an integer specifying the number of milliseconds the fadeout should take
