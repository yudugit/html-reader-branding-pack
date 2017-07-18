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
