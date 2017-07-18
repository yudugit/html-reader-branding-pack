## Final Notes

+ Use the `click` event type instead of `yudu_commonSettings.clickAction` for elements where `touchstart` might be triggered by something else
    + for example, scrolling through the list of contents
+ Add the `yudu_localisable` class to elements containing string codes from the language pack
    + this allows the Reader to identify them and insert the appropriate localised text
