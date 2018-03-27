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

### Page View

This event will be fired any time a new page is shown during a single visit.
Add a listener to respond to this event by subscribing to `yudu_events.STATISTICS.PAGE_VIEWED`.

### Search

If this event is enabled, it will be fired whenever someone searches within the edition.
Add a listener to respond to this event by subscribing to `yudu_events.STATISTICS.SEARCHED`.

### E-mail Link Clicked

If this event is enabled, it will be fired whenever someone activates an e-mail link overlay.
Add a listener to respond to this event by subscribing to `yudu_events.STATISTICS.EMAIL_LINK_CLICKED`.

### Web Link Clicked

If this event is enabled, it will be fired whenever someone activates a web link overlay.
Add a listener to respond to this event by subscribing to `yudu_events.STATISTICS.WEB_LINK_CLICKED`.

### Page Link Clicked

If this event is enabled, it will be fired whenever someone activates a page link overlay.
Add a listener to respond to this event by subscribing to `yudu_events.STATISTICS.PAGE_LINK_CLICKED`.

### Logo Clicked

If this event is enabled and the logo is visible, it will be fired whenever someone activates the logo.
Add a listener to respond to this event by subscribing to `yudu_events.STATISTICS.LOGO_CLICKED`.

### Video Watched

If this event is enabled, it will be fired whenever someone starts watching a video for the first time in their visit.
Add a listener to respond to this event by subscribing to `yudu_events.STATISTICS.VIDEO_WATCHED`.

### Video Resumed

If this event is enabled, it will be fired whenever someone resumes a paused video during their visit, or repeats the playback of a video previously watched.
Add a listener to respond to this event by subscribing to `yudu_events.STATISTICS.VIDEO_RESUMED`.

### Video Milestone Reached

This event must be both enabled and correctly configured for any events to be fired.
A positive integer must have been specified as the absolute or percentile milestone against which to track playing videos.
Once specified, any multiples of those milestones will also be tracked.
For example, specifying a milestone of 30s will track videos reaching 30s, 60s, 90s, and so on, while a milestone of 25% will track videos reaching 25%, 50%, 75% and 100%.
Note that if you are only interested in tracking video completion, the [video finished event](#video-finished) is less demanding.
Add a listener to respond to this event by subscribing to `yudu_events.STATISTICS.VIDEO_MILESTONE_REACHED`.

### Video Finished

If this event is enabled, it will be fired whenever someone reaches the end of a video while it was playing.
Note that videos seeked to their ends will not trigger this event.
Add a listener to respond to this event by subscribing to `yudu_events.STATISTICS.VIDEO_FINISHED`.

### Shared by E-mail

If this event is enabled, it will be fired whenever someone shares the edition or a page from it directly via email.
Add a listener to respond to this event by subscribing to `yudu_events.STATISTICS.EMAILED`.

### Subscribed

If this event is enabled and readers can subscribe from within the edition, it will be fired whenever someone completes their subscription.
Add a listener to respond to this event by subscribing to `yudu_events.STATISTICS.SUBSCRIBED`.

### Shared via Twitter

If this event is enabled, it will be fired whenever someone shares the edition or a page from it via Twitter.
Add a listener to respond to this event by subscribing to `yudu_events.STATISTICS.TWEETED`.

### Shared via Facebook

If this event is enabled, it will be fired whenever someone shares the edition or a page from it via Facebook.
Add a listener to respond to this event by subscribing to `yudu_events.STATISTICS.FACEBOOKED`.
