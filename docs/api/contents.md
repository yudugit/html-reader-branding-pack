# Contents

The "Contents" sub-interface provides data relating to the edition's table of contents.
This does not correlate to any specific submodule but is targeted to be available for the toolbar.
Its sole component will be available as the following global variable:

+ [settings](#contents-settings): `yudu_contentsSettings`

## Contents Settings

+ `contentsData` – the ToC data as set in Publisher
    + only the root objects may have children
    + the data consists of an array of objects with a format like:

```json
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
