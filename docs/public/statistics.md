# Statistics

The HTML reader's internal statistics modules have recently been expanded to emit publicly-accessible events.
The structure of the event types, as well as some more information on how to subscribe to them, is available on the [`events` API page](../api/events.md).
Please note that while it is possible to subscribe to these events synchronously, it is strongly advised these subscriptions be asynchronous so as to minimise the impact on other Reader processes.

This interface is currently enabled by default for new editions.
It may become more configurable in the future.
Note that by utilising this interface, you also agree to comply with all relevant data-protection laws pertaining to any information gathered.

## The Events

### New Visit

This event will be fired once the Reader is nearing the end of its internal configuration page.
It is used internally to record a successful visit to an edition.
Add a listener to respond to this event by subscribing to `yudu_events.STATISTICS.VISITED`.
Note that this event is fired near the beginning of the Reader's lifecycle.
Therefore it is advised that any callbacks also utilise a timeout with a short delay to trigger custom functionality.
This ensures consistent behaviour should it ever be the case that race conditions cause the event to not become available sufficiently early.

The event data will contain details of the initial pages shown on load.
The data will follow the structure of the [page view event](#page-view).

### Page View

This event will be fired any time a new page is shown during a single visit.
Add a listener to respond to this event by subscribing to `yudu_events.STATISTICS.PAGE_VIEWED`.

The event data will contain details of the page or pages being shown.
If two pages are shown, the data will have both a `page1` and a `page2` property.
If a single page is shown, the data will only have a `page1` property.
Each page will have an `index`, `number` and `label` property.
The `index` defines the page's 0-indexed position in the array of pages in the edition.
This is used internally to refer to the page.
The `number` denotes the relative page number, assuming a left-to-right reading order.
For your convenience, there is also a `pretty` property in the root of the data object, which contains the same properties as each page.
This convenience property acts as a shorthand to obtain either the properties from `page1` as a string, or a hyphenated string combining the relevant properties from both pages.
Thus the data object when two pages are being shown is expected to look something like the following:

```javascript
{
    page1: {
        index: 3,
        number: 4,
        label: "Custom label for page 4"
    },
    page2: {
        index: 4,
        number: 5,
        label: "My page 5 label"
    },
    pretty: {
        index: "3-4",
        number: "4-5",
        label: "Custom label for page 4-My page 5 label"
    }
}
```

### Search

If this event is enabled, it will be fired whenever someone searches within the edition.
Add a listener to respond to this event by subscribing to `yudu_events.STATISTICS.SEARCHED`.

The event data will contain a `searchPhrase` property with the phrase being searched for.

### E-mail Link Clicked

If this event is enabled, it will be fired whenever someone activates an e-mail link overlay.
Add a listener to respond to this event by subscribing to `yudu_events.STATISTICS.EMAIL_LINK_CLICKED`.

The event data will contain a `target` property with the URL target for the link.

### Web Link Clicked

If this event is enabled, it will be fired whenever someone activates a web link overlay.
Add a listener to respond to this event by subscribing to `yudu_events.STATISTICS.WEB_LINK_CLICKED`.

The event data will contain a `target` property with the URL target for the link.

### Page Link Clicked

If this event is enabled, it will be fired whenever someone activates a page link overlay.
Add a listener to respond to this event by subscribing to `yudu_events.STATISTICS.PAGE_LINK_CLICKED`.

The event data will contain a `target` property with the page number targeted by the link.

### Logo Clicked

If this event is enabled and the logo is visible, it will be fired whenever someone activates the logo.
Add a listener to respond to this event by subscribing to `yudu_events.STATISTICS.LOGO_CLICKED`.

The event data will contain a `target` property with the URL target for the logo.

### Video Watched

If this event is enabled, it will be fired whenever someone starts watching a video for the first time in their visit.
Add a listener to respond to this event by subscribing to `yudu_events.STATISTICS.VIDEO_WATCHED`.

The event data will contain a `url` property with the local URL of the video played.
Note that the video URL may be obfuscated in some cases.
If available, the video name will also be made available via a `videoName` property.

### Video Resumed

If this event is enabled, it will be fired whenever someone resumes a paused video during their visit, or repeats the playback of a video previously watched.
Add a listener to respond to this event by subscribing to `yudu_events.STATISTICS.VIDEO_RESUMED`.

The event data will be identical to the [video watched event](#video-watched).

### Video Milestone Reached

This event must be both enabled and correctly configured for any events to be fired.
A positive integer must have been specified as the absolute or percentile milestone against which to track playing videos.
Once specified, any multiples of those milestones will also be tracked.
For example, specifying a milestone of 30s will track videos reaching 30s, 60s, 90s, and so on, while a milestone of 25% will track videos reaching 25%, 50%, 75% and 100%.
Note that if you are only interested in tracking video completion, the [video finished event](#video-finished) is less demanding.
Add a listener to respond to this event by subscribing to `yudu_events.STATISTICS.VIDEO_MILESTONE_REACHED`.

As well as the data contained in the [video watched event](#video-watched), the milestone data will also contain a `milestone` property with a string denoting the (absolute or percentile) milestone reached.

### Video Finished

If this event is enabled, it will be fired whenever someone reaches the end of a video while it was playing.
Note that videos seeked to their ends will not trigger this event.
Add a listener to respond to this event by subscribing to `yudu_events.STATISTICS.VIDEO_FINISHED`.

The event data will be identical to the [video watched event](#video-watched).

### Shared by E-mail

If this event is enabled, it will be fired whenever someone shares the edition or a page from it directly via email.
Add a listener to respond to this event by subscribing to `yudu_events.STATISTICS.EMAILED`.

The event data will contain a `sharedUrl` property with the URL that was shared.
For reasons of data protection, the target e-mail address is not stored any longer than necessary to complete the action, and is not obtainable here.

### Subscribed

If this event is enabled and readers can subscribe from within the edition, it will be fired whenever someone completes their subscription.
Add a listener to respond to this event by subscribing to `yudu_events.STATISTICS.SUBSCRIBED`.

The event data will contain a `target` property with the URL target for the subscription.

### Shared via Twitter

If this event is enabled, it will be fired whenever someone shares the edition or a page from it via X (Twitter).
Add a listener to respond to this event by subscribing to `yudu_events.STATISTICS.TWEETED`.

The event data will contain a `target` property with the URL target for the share action.

### Shared via Facebook

If this event is enabled, it will be fired whenever someone shares the edition or a page from it via Facebook.
Add a listener to respond to this event by subscribing to `yudu_events.STATISTICS.FACEBOOKED`.

The event data will contain a `target` property with the URL target for the share action.
