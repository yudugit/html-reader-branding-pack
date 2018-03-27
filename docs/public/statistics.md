# Statistics

The HTML reader's internal statistics modules have recently been expanded to emit publicly-accessible events.
The structure of the event types, as well as some more information on how to subscribe to them, is available on the [`events` API page](../api/events.md).
Please note that while it is possible to subscribe to these events synchronously, it is strongly advised these subscriptions be asynchronous so as to minimise the impact on other Reader processes.

This interface is currently enabled by default for new editions.
It may become more configurable in the future.
Note that by utilising this interface, you also agree to comply with all relevant data-protection laws pertaining to any information gathered.

## The Events

### New Visit

### Page View

### Search

### E-mail Link Clicked

### Web Link Clicked

### Page Link Clicked

### Logo Clicked

### Video Watched

### Video Resumed

### Video Milestone Reached

### Video Finished

### Shared by E-mail

### Subscribed

### Shared via Twitter

### Shared via Facebook
