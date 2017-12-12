/*
 * Author's note:
 *  This script has grown considerably since its initial conception.
 *  It currently sits somewhere between a dedicated Thumbnails script and an abstracted `Carousel` object provider.
 *  An attempt has been made to make the various components modular. In general, if you don't use them, you shouldn't need them.
 *      Strictly, only the `Thumbnails`, `Thumbnail`, and `CarouselScroller` modules are required for this script to function.
 *      (Deleting the components but not calls to their creation will still throw exceptions)
 *  It may suffice for basic use to modify the settings at the very bottom, applied to the Thumbnails object on construction
 *  For further changes, please see in-line comments. Remember to thoroughly test any changes made.
 *
 * Note on event handling:
 *  This script currently makes use of multiple versions of HammerJS
 *  HammerJS version 1 is available as a jQuery plugin via `$.hammer`
 *  HammerJS version 2 is available indirectly via `yudu_commonSettings.hammerjs`
 *  Various helpers for constructing HammerJS2 Manager objects are available from `yudu_commonFunctions`
 *      Please see the documentation for more information
 */

var Thumbnails = function(settings) {
    //region Variables
    this.intRegex = /^[1-9]\d*$/;

    this.scroller = false;
    this.iconLabel = false;
    this.progressBar = false;

    //Orientation enumeration
    this.readerOrientation = yudu_commonSettings.orientation;
    //Whether the orientation has been initialised
    this.readerOrientationInit = [false, false];

    this.carouselContainerElement = $('#' + settings.carouselContainerId);

    //the width of the visible part of the carousel; essentially the width of the window
    this.visibleWidth = yudu_commonSettings.width / yudu_commonSettings.pixelDensity;
    //the progress along the scroller (between 0 and 1)
    this.progression = 0;

    //properties to control scroller when it is coasting
    this.isSpringing = false;
    this.dampingCoefficient = (settings.mechanics && settings.mechanics.dampingCoefficient) || -20;
    this.mass = (settings.mechanics && settings.mechanics.mass) || 10;
    this.velocityMax = (settings.mechanics && settings.mechanics.velocityMax) || 10000;
    this.velocityScale = (settings.mechanics && settings.mechanics.velocityScale) || 600;

    // collections of icons for the carousel
    this.segmentedControl = false;
    this.primaryIconSets = {};

    this.leftIcons = [];
    this.visibleIcons = [];
    this.rightIcons = [];

    // maximum number of icons to display
    this.maxVisibleIcons = 0;

    // Initialise with default values for desktop display
    //  mobile values are set in setIconSizes, and will depend on reader's orientations, hence an array
    //  Note ideal dimensions for a portrait page will have a ratio roughly equal to 1:sqrt(2)
    this.iconSize = settings.initialIconSizes;

    // event handling
    this.callbacks = {};
    this.carouselManager = null;

    this.isVisible = false;
    //endregion

    //region Setup functions
    /**
     * Initialise the carousel
     */
    this.init = function() {
        this.pageIndexOffset = yudu_commonSettings.hasIntroPage ? 0 : 1;

        //prevent the user from being able to drag the carousel
        this.carouselContainerElement.on("touchstart", yudu_events.callback(this, function() {
            return false;
        }));

        if (!yudu_commonSettings.isDesktop) {
            this.carouselContainerElement.addClass("touchDevice");
        }

        this.setIconSizes();

        yudu_events.subscribe(yudu_events.ALL, yudu_events.COMMON.RESIZE, yudu_events.callback(this, this.resize), false);

        this.readerOrientationInit[this.readerOrientation] = true;

        this.scroller = new CarouselScroller(this, settings);
        if (settings.enableCarouselLabel) {
            this.iconLabel = new CarouselIconLabel(this, settings);
        }
        if (settings.enableCarouselProgressBar) {
            this.progressBar = new CarouselProgressBar(this, settings);
            this.progressBar.init();
        }
        this.setupThumbnails();
        if (settings.enableSegments) {
            this.setupSecondarySegments();
        }
        this.resize();

        var self = this;
        yudu_commonSettings.createjs.Ticker.addEventListener("tick", yudu_events.callback(this, this.update));
        yudu_events.subscribe(yudu_events.ALL, yudu_events.THUMBNAILS.TOGGLE_THUMBNAILS, yudu_events.callback(self, function(event) { self.toggle(event.data.toggle, event.data.show); }));
        yudu_events.subscribe(yudu_events.ALL, yudu_events.THUMBNAILS.UPDATE_THUMBNAIL, yudu_events.callback(self, function(event) { self.updateThumbnail(event.data.pageNumber); }));

        // create a HammerJS2 Manager
        this.carouselManager = yudu_commonFunctions.createHammerJSTapManager(this.carouselContainerElement[0]);
        this.carouselManager.on('tap', yudu_events.callback(self, this.handleInteraction));
    };

    /**
     * First-time setup of all thumbnails (icons)
     *  Similar to initIconOrientations, except we create new icons instead of modifying existing ones.
     */
    this.setupThumbnails = function() {
        var icons = [];
        // pages[] includes the intro page
        for (var i = 0; i < yudu_thumbnailsSettings.pagesDetails.length; i++) {
            var page = yudu_thumbnailsSettings.pagesDetails[i];
            // first page is always labelled '1'
            //  since intro page will be 0-indexed, fine
            //  no intro page => need to remember to offset for page numbering
            var pageNumber = i + this.pageIndexOffset;
            var iconSize = this.getIconDimensionsFromFileDimensions(page.width(), page.height(), this.readerOrientation);
            var thumbnailSettings = {
                id: pageNumber,
                filename: yudu_commonFunctions.returnFunctionWithDynamicArgs(yudu_thumbnailsFunctions.getThumbnailFileName, i),
                fileHeight: yudu_commonFunctions.returnDynamicInput(page.height),
                fileWidth: yudu_commonFunctions.returnDynamicInput(page.width),
                iconClassName: settings.carouselIconClassName,
                initialDimensions: {
                    width: iconSize.width,
                    height: iconSize.height
                },
                initialReaderOrientation: this.readerOrientation,
                pageNumber: pageNumber,
                pageDetailsIndex: i
            };
            thumbnailSettings.fileSrc = yudu_commonFunctions.returnFunctionWithDynamicArgs(yudu_thumbnailsFunctions.getThumbnailUrl, thumbnailSettings.filename);
            icons.push(new Thumbnail(this, thumbnailSettings));
        }
        new CarouselIconSet(this, {
            id: 'thumbnails',
            label: yudu_thumbnailsSettings.primarySegmentString,
            isPrimary: true,
            icons: icons
        });
    };

    /**
     * Setup the secondary icon sets for the thumbnails bar
     * All required primary icon sets should be available prior to calling this - they are dependencies
     */
    this.setupSecondarySegments = function() {
        var self = this;
        var iconSets = [
            this.primaryIconSets['thumbnails'],
            new CarouselIconSet(self, {
                id: 'bookmarks',
                label: yudu_thumbnailsSettings.bookmarksSegmentString,
                parent: this.primaryIconSets['thumbnails'],
                filterFunction: function (icon) {
                    var pageIndex = icon.pageNumber - self.pageIndexOffset;
                    return yudu_thumbnailsFunctions.pageHasBookmarks()(pageIndex);
                },
                listeners: [
                    {topic: yudu_events.COMMON.UGC_BOOKMARKS_CHANGED}
                ]
            }),
            new CarouselIconSet(self, {
                id: 'highlights',
                label: yudu_thumbnailsSettings.highlightsSegmentString,
                parent: this.primaryIconSets['thumbnails'],
                filterFunction: function (icon) {
                    var pageIndex = icon.pageNumber - self.pageIndexOffset;
                    return yudu_thumbnailsFunctions.pageHasHighlights()(pageIndex);
                },
                listeners: [
                    {topic: yudu_events.COMMON.UGC_PAGE_HIGHLIGHTS_CHANGED}
                ]
            }),
            new CarouselIconSet(self, {
                id: 'notes',
                label: yudu_thumbnailsSettings.notesSegmentString,
                parent: this.primaryIconSets['thumbnails'],
                filterFunction: function (icon) {
                    var pageIndex = icon.pageNumber - self.pageIndexOffset;
                    return yudu_thumbnailsFunctions.pageHasNotes()(pageIndex);
                },
                listeners: [
                    {topic: yudu_events.COMMON.UGC_NOTES_CHANGED}
                ]
            })
        ];

        this.segmentedControl = new CarouselSegmentedControls(self, {
            enableSegmentAutoHide: settings.enableSegmentAutoHide,
            carouselSegmentedControlsWrapperId: settings.carouselSegmentedControlsWrapperId,
            carouselSegmentedControlContainerId: settings.carouselSegmentedControlContainerId,
            iconSets: iconSets
        });
        // must initialise once the control variable is set, as otherwise the initial selection will not work properly
        this.segmentedControl.init();
    };

    /**
     * Initialise current dimensions and icon size limits for the current orientation of the reader
     */
    this.initOrientation = function() {
        this.readerOrientationInit[this.readerOrientation] = true;
        this.setIconSizes();
        this.initIconOrientations();
    };

    /**
     * Ensure the new reader orientation is set for each icon
     *  Similar to setupIcons, except we modify existing icons instead of creating new ones.
     */
    this.initIconOrientations = function() {
        // only initialise "primary" icon sets, not derived sets
        for (var iconSetId in this.primaryIconSets) {
            if (this.primaryIconSets.hasOwnProperty(iconSetId)) {
                var icons = this.primaryIconSets[iconSetId].__original_icons;
                for (var i = 0; i < icons.length; i++) {
                    this.updateSingleIconSize(icons[i], this.readerOrientation);
                }
            }
        }
    };

    /**
     * Calculate and update a single icon's size for the specified orientation
     * @param icon to update the size of
     * @param orientation of the window to update the icon's size for
     */
    this.updateSingleIconSize = function(icon, orientation) {
        var iconSize = this.getIconDimensionsFromFileDimensions(icon.getFileWidth(), icon.getFileHeight(), orientation);
        icon.initOrientation(
                orientation,
                {
                    width: iconSize.width,
                    height: iconSize.height
                }
        );
    };

    /**
     * Sets the icon height/width limits for a mobile device
     * Currently limits dimensions to a portrait aspect ratio,
     *  with height limited to 20% of the screen height
     * Padding between icons is 20% of their widths
     */
    this.setIconSizes = function() {
        if (!yudu_commonSettings.isDesktop) {
            var heightLimit = yudu_commonSettings.height / yudu_commonSettings.pixelDensity * 0.2;
            var widthLimit = heightLimit / Math.sqrt(2);
            this.iconSize[this.readerOrientation].iconHeightLimit = Math.floor(heightLimit);
            this.iconSize[this.readerOrientation].iconWidthLimit = Math.floor(widthLimit);
            this.iconSize[this.readerOrientation].iconPadding = Math.floor(widthLimit / 5);
        }
    };
    //endregion

    //region Getters
    /**
     * Helper function that returns the currently visible icon set
     * Returns null if there is no known icon set available
     * @returns {CarouselIconSet | null}
     */
    this.iconset = function() {
        if (this.segmentedControl && this.segmentedControl.selectedSegment) {
            return this.segmentedControl.selectedSegment.iconSet;
        } else if (this.primaryIconSets['thumbnails']) {
            return this.primaryIconSets['thumbnails'];
        }
        return null;
    };

    /**
     * Helper function that returns the displayable icons for the currently visible icon set
     * @returns {[Thumbnail]}
     */
    this.icons = function() {
        var iconSet = this.iconset();
        return iconSet ? iconSet.icons : [];
    };

    /**
     * Helper function that returns the number of displayable icons for the currently visible icon set
     * @returns {number}
     */
    this.iconsLength = function() {
        var iconSet = this.iconset();
        return iconSet ? iconSet.length : 0;
    };

    /**
     * Helper function that calculates the index of the currently highlighted icon
     * @returns {number}
     */
    this.getCurrentIconIndex = function() {
        var numberOfIcons = this.iconsLength();
        return Math.min(Math.max(Math.ceil(this.progression * (numberOfIcons - 1) + 0.5), 1), numberOfIcons) - 1;
    };

    /**
     * Returns maximum icon width (in px) for the current orientation of the reader
     */
    this.getMaxIconWidth = function() {
        return this.iconSize[this.readerOrientation].iconWidthLimit;
    };

    /**
     * Returns maximum icon height (in px) for the current orientation of the reader
     */
    this.getMaxIconHeight = function() {
        return this.iconSize[this.readerOrientation].iconHeightLimit;
    };

    /**
     * Returns icon padding (in px) for the current orientation of the reader
     */
    this.getIconPadding = function() {
        return this.iconSize[this.readerOrientation].iconPadding;
    };

    /**
     * Returns the expected total width (in pixels) of the carousel based on the current number of icons
     * Factor of `-1` present because this is measured from the middle of the first icon to the middle of the last
     * @returns {number}
     */
    this.getTotalWidth = function() {
        return (this.iconsLength() - 1) * (this.getMaxIconWidth() + this.getIconPadding());
    };

    /**
     * For the current orientation returns the icon dimensions
     * @param fileWidth width of file the icon represents
     * @param fileHeight width of file the icon represents
     * @param orientation of the window to calculate icon dimensions for
     * @returns {{width: number, height: number}}
     */
    this.getIconDimensionsFromFileDimensions = function(fileWidth, fileHeight, orientation) {
        // calculate a scaling ratio for the icon size
        //  take a ceiling so that the calculated size will always be less than the limit
        //  the */ by 1000 is so that less accuracy is lost by the approximation
        var widthRatio = fileWidth / this.iconSize[orientation].iconWidthLimit;
        var heightRatio = fileHeight / this.iconSize[orientation].iconHeightLimit;
        var ratio = Math.ceil(1000 * Math.max(widthRatio, heightRatio)) / 1000;
        return {
            width: Math.round( fileWidth / ratio ),
            height: Math.round( fileHeight / ratio )
        };
    };
    //endregion

    //region Update methods
    /**
     * Toggle the visibility of the carousel
     * @param toggle ; should the current visibility be toggled (inverted)?
     * @param show ; if not toggling, specify whether the bar should be visible
     */
    this.toggle = function(toggle, show) {
        var shouldShow = toggle ? !this.isVisible : show;
        if (shouldShow == this.isVisible) {
            return this.isVisible;
        }
        this.isVisible = shouldShow;
        if (shouldShow) {
            this.segmentedControl.updateAllSegments();
            this.displayPage(yudu_thumbnailsFunctions.getCurrentPage());
            yudu_commonFunctions.hideToolbar();
            this.carouselContainerElement.show();
        } else {
            this.carouselContainerElement.hide();
        }
        return this.isVisible;
    };

    /**
     * Repositions the carousel when the window is resized
     */
    this.resize = function() {
        this.readerOrientation = yudu_commonSettings.orientation;
        this.visibleWidth = yudu_commonSettings.width / yudu_commonSettings.pixelDensity;
        if (!this.readerOrientationInit[this.readerOrientation]) {
            // if primary icon sets are being dynamically generated, this may not suffice
            this.initOrientation();
        }
        this.updateVisibleIcons();
    };

    /**
     * Ensures that the various visual components of the carousel are updated
     */
    this.updateVisibleIcons = function() {
        this.updatePositions(this.progression);
        this.maxVisibleIcons = Math.floor(this.visibleWidth / (this.getMaxIconWidth() + this.getIconPadding())) + 5;
        this.displayIcons();
    };

    /**
     * Change which icon set is currently visible
     * @param newSegment ; the segment being swapped to
     */
    this.changeIconSet = function(newSegment) {
        // calculate some required variables _before_ changing the "selected" segment record
        var previousSet = this.iconset();
        var previousIconIndex = this.scroller.getCentreIndex();
        // select and update the segment
        this.segmentedControl.selectedSegment = newSegment;
        newSegment.iconSet.update();
        // calculate the new centred icon
        var newIndex = newSegment.iconSet.findClosestIconTo(previousSet, previousIconIndex);
        this.progressionFromIconIndex(newIndex);
        // redraw the scroller and the visible icons
        this.updateVisibleIcons();
    };

    /**
     * Given a target icon index for the current icon set, calculate and set the progression such that that icon is centred
     * @param index
     */
    this.progressionFromIconIndex = function(index) {
        var numberOfIcons = this.iconsLength();
        var newProgression = (numberOfIcons === 0) ? 0 : index / (numberOfIcons - 1);
        this.progression = Math.max(0, Math.min(1, newProgression));
    };

    /**
     * Displays the icons visible at the current progression
     */
    this.displayIcons = function() {
        for (var i = 0; i < this.visibleIcons.length; i++) {
            this.scroller.removeIcon(this.visibleIcons[i]);
        }
        var startIndex = this.scroller.getStartIndex();
        this.leftIcons = this.icons().slice(0);
        this.visibleIcons = this.leftIcons.splice(startIndex, this.leftIcons.length - startIndex);
        this.rightIcons = this.visibleIcons.splice(this.maxVisibleIcons, this.visibleIcons.length - this.maxVisibleIcons);
        for (var j = 0; j < this.visibleIcons.length; j++) {
            this.scroller.addIcon(this.visibleIcons[j]);
        }
    };

    /**
     * Adds an icon from the right hand set and removes the left-most visible icon
     */
    this.moveIconsLeft = function() {
        if (this.visibleIcons.length >= this.maxVisibleIcons) {
            var iconToRemove = this.visibleIcons.shift();
            this.scroller.removeIcon(iconToRemove);
            this.leftIcons.push(iconToRemove);
        }
        if (this.rightIcons.length > 0) {
            var iconToAdd = this.rightIcons.shift();
            this.scroller.addIcon(iconToAdd);
            this.visibleIcons.push(iconToAdd);
        }
    };

    /**
     * Adds an icon from the left hand set and removes the right-most visible icon
     */
    this.moveIconsRight = function() {
        if (this.visibleIcons.length >= this.maxVisibleIcons) {
            var iconToRemove = this.visibleIcons.pop();
            this.scroller.removeIcon(iconToRemove);
            this.rightIcons.unshift(iconToRemove);
        }
        if (this.leftIcons.length > 0) {
            var iconToAdd = this.leftIcons.pop();
            this.scroller.addIcon(iconToAdd);
            this.visibleIcons.unshift(iconToAdd);
        }
    };

    /**
     * Update the position of the scroller and the progress bar
     * @param progression
     */
    this.updatePositions = function(progression) {
        if (this.iconsLength() < 2) {
            // If there are less than 2 icons, lock the progression to 0
            progression = 0;
        }
        this.progression = progression;
        this.progressBar && this.progressBar.updatePosition(progression);
        this.scroller.updatePosition(progression);
        this.iconLabel && this.iconLabel.updateLabel();
    };

    /**
     * Calculates the position of an icon based on its index in the currently visible icon set
     * @param icon to position
     * @returns {{}} object containing `x` and `y` properties, each resolving to integers
     */
    this.calculateIconPosition = function(icon) {
        var position = {};
        var index = this.icons().indexOf(icon);
        if (index < 0) {
            position.x = 0;
            position.y = 0;
        } else {
            // NB: the first note should be in the middle of the screen, hence the `visibleWidth - icon.getCurrentWidth` factor
            position.x = Math.round(((this.visibleWidth - icon.getCurrentWidth()) / 2) + (index * (this.getMaxIconWidth() + this.getIconPadding())));
            position.y = this.getMaxIconHeight() - icon.getCurrentHeight();
        }
        return position;
    };

    /**
     * Update the icon (thumbnail) for the specified page. This is called when the page is decrypted.
     * @param pageIndex
     */
    this.updateThumbnail = function(pageIndex) {
        if (0 <= pageIndex && pageIndex < this.iconsLength()) {
            var icon = this.icons()[pageIndex];
            // update the icon image URL
            icon.setImage();
            // update the icon sizes (in case the thumbnails pre- and post-decryption were differently sized
            for (var i = 0; i < this.readerOrientationInit.length; i++) {
                if (this.readerOrientationInit[i]) {
                    this.updateSingleIconSize(icon, i);
                }
            }
            // update the visible element's size
            icon.setSize();
        }
    };

    /**
     * Event handler (CreateJS) for a "tick"
     * Updates positions when the bar is springing
     * @param event
     */
    this.update = function(event) {
        if (!this.isSpringing) {
            return;
        }
        var deltaX = 0;
        var ticked = 0;
        do {
            var acceleration = this.dampingCoefficient * this.velocity / this.mass;
            this.velocity += acceleration / yudu_thumbnailsSettings.fps;
            deltaX += this.velocity / yudu_thumbnailsSettings.fps;
            ticked += yudu_thumbnailsSettings.tickTimeMs;
        } while (ticked < event.delta);

        if (Math.abs(this.velocity) < 1) {
            this.isSpringing = false;
            this.velocity = 0;
        }

        this.scroller && this.scroller.updatePositionsFromDeltaX(deltaX);
    };
    //endregion

    //region event handlers
    /**
     * Callback for taps on the thumbnails popup
     * @param event {*} fired by HammerJS, DOM event nested in `event.srcEvent`
     */
    this.handleInteraction = function(event) {
        var elementId = event.target.dataset.id;
        var callback = this.callbacks[elementId];
        typeof callback == 'function' && callback(event);
    };

    /**
     * Registers an event handler for an element with the specified ID
     * @param id {string} to identify the callback for the element being activated
     *  should be unique within this thumbnails namespace
     * @param callback {Function} to trigger when the associated element is activated
     */
    this.registerListener = function(id, callback) {
        this.callbacks[id] = callback;
    };

    /**
     * Event handler (HTML Reader) to respond to a page change event
     * @param event
     */
    this.setPageNumber = function(event) {
        if (this.isVisible) {
            this.displayPage(event.data.page);
        }
    };

    /**
     * Helper function that ensures that the specified page has its thumbnail made current
     * @param pageIndex ; 0-indexed page reference
     */
    this.displayPage = function(pageIndex) {
        var thumbnailsIconSet = this.primaryIconSets['thumbnails'];
        var indexOfIconToBeCentred = this.iconset().findClosestIconTo(thumbnailsIconSet, pageIndex);
        this.progressionFromIconIndex(indexOfIconToBeCentred);
        this.updateVisibleIcons();
    };

    /**
     * Event handler (HTML Reader) to respond to a "logged in" event
     */
    this.loggedIn = function() {
        for(var i = 0; i < this.iconsLength(); i++) {
            this.icons()[i].setImage();
        }
    };

    // Other listeners for the thumbnails bar
    yudu_events.subscribe(yudu_events.ALL, yudu_events.THUMBNAILS.PAGE_CHANGED, yudu_events.callback(this, this.setPageNumber), false);
    yudu_events.subscribe(yudu_events.ALL, yudu_events.COMMON.TOUCH, yudu_events.callback(this, this.toggle, false, false), false);
    yudu_events.subscribe(yudu_events.ALL, yudu_events.COMMON.LOGIN_SUCCESS, yudu_events.callback(this, this.loggedIn), false);
    //endregion
};

/**
 * Component that wraps a collection of UI elements responsible for representing and controlling a segmented control for the carousel
 * @param carousel ; the carousel this instance will be attached to
 * @param settings ; settings for the collection's instantiation
 * @constructor
 */
var CarouselSegmentedControls = function(carousel, settings) {
    this.carousel = carousel;
    this.segmentedControlsWrapper = $('#'+settings.carouselSegmentedControlsWrapperId);
    this.segmentControlContainer = $('#'+settings.carouselSegmentedControlContainerId);
    this.segments = [];
    this.leftSegmentIndex = 2;
    this.rightSegmentIndex = -1;
    this.selectedSegment = false;

    /**
     * Initialise the collection
     */
    this.init = function() {
        if (!yudu_commonSettings.isDesktop) {
            this.segmentedControlsWrapper.addClass('touchDevice');
        }
        var iconSets = settings.iconSets || [];
        for (var i = 0; i < iconSets.length; i++) {
            this.segments.push(new CarouselSegmentedControl(this, {
                enableSegmentAutoHide: settings.enableSegmentAutoHide,
                iconSet: iconSets[i]
            }));
        }
        if (this.segments.length > 0) {
            this.selectSegment(this.segments[0]);
            this.leftSegmentIndex = 0;
            this.segments[this.leftSegmentIndex].addStyleForLeft();
            this.rightSegmentIndex = this.segments.length - 1;
            this.segments[this.rightSegmentIndex].addStyleForRight();
        }
    };

    /**
     * Ensures all known segments are updated
     * Should be used to refresh icon set statuses after a carousel has become visible
     * Trades additional processing if the carousel is being hidden/shown a lot, for saving processing while the carousel is hidden
     */
    this.updateAllSegments = function() {
        for (var i = 0; i < this.segments.length; i++) {
            this.segments[i].iconSet.update();
        }
    };

    /**
     * Show the entire segmented controls wrapper
     */
    this.show = function() {
        this.segmentedControlsWrapper.removeClass('hidden');
    };

    /**
     * Hide the entire segmented controls wrapper
     * Uses a class to, for example, ensure top padding is still applied to the carousel
     */
    this.hide = function() {
        this.segmentedControlsWrapper.addClass('hidden');
    };

    /**
     * Ensures that all segment styles are updated when a previously-hidden segment is shown
     * @param segment
     */
    this.showSegment = function(segment) {
        var segmentIndex = this.segments.indexOf(segment);
        if (segmentIndex < this.leftSegmentIndex) {
            this.segments[this.leftSegmentIndex] && this.segments[this.leftSegmentIndex].removeStyleForLeft();
            segment.addStyleForLeft();
            this.leftSegmentIndex = segmentIndex;
        }
        if (segmentIndex > this.rightSegmentIndex) {
            this.segments[this.rightSegmentIndex] && this.segments[this.rightSegmentIndex].removeStyleForRight();
            segment.addStyleForRight();
            this.rightSegmentIndex = segmentIndex;
        }
        segment.show();
    };

    /**
     * Ensures that all segment styles are updated when a previously-visible segment is hidden
     * @param segment
     */
    this.hideSegment = function(segment) {
        if (this.selectedSegment === segment && this.carousel.isVisible) {
            // Do not hide the currently selected segment if the carousel is visible
            return;
        }
        segment.hide();
        var segmentIndex = this.segments.indexOf(segment);
        if (segmentIndex === this.leftSegmentIndex) {
            segment.removeStyleForLeft();
            this.updateLeftMostSegmentIndex();
        }
        if (segmentIndex === this.rightSegmentIndex) {
            segment.removeStyleForRight();
            this.updateRightMostSegmentIndex();
        }
        if (segment === this.selectedSegment) {
            // select another segment if the carousel is hidden
            segment.deselect();
            this.updateSelection();
        }
    };

    /**
     * Given the current left-most segment on the segmented controls has been hidden if necessary,
     * Determine and update the new left-most visible segment, or if there is none, hide the controls
     */
    this.updateLeftMostSegmentIndex = function() {
        var newLeftIndex = this.leftSegmentIndex;
        while (!this.segments[newLeftIndex].isVisible && newLeftIndex < this.segments.length) {
            newLeftIndex += 1;
        }
        if (newLeftIndex < this.segments.length) {
            this.leftSegmentIndex = newLeftIndex;
            this.segments[newLeftIndex].addStyleForLeft();
        } else {
            // no visible segments remaining
            this.leftSegmentIndex = this.segments.length;
            this.hide();
        }
    };

    /**
     * Given the current right-most segment on the segmented controls has been hidden if necessary,
     * Determine and update the new right-most visible segment, or if there is none, hide the controls
     */
    this.updateRightMostSegmentIndex = function() {
        var newRightIndex = this.rightSegmentIndex;
        while (!this.segments[newRightIndex].isVisible && newRightIndex >= 0) {
            newRightIndex -= 1;
        }
        if (newRightIndex >= 0) {
            this.rightSegmentIndex = newRightIndex;
            this.segments[newRightIndex].addStyleForRight();
        } else {
            // no visible segments remaining
            this.rightSegmentIndex = -1;
            this.hide();
        }
    };

    /**
     * Given the current selected segment on the segmented controls has been hidden if necessary,
     * Determine and update an appropriate visible segment to select in its stead, or if there is none, hide the controls
     */
    this.updateSelection = function() {
        var newSelectionIndex = 0;
        while (!this.segments[newSelectionIndex].isVisible && newSelectionIndex < this.segments.length) {
            newSelectionIndex += 1;
        }
        if (newSelectionIndex < this.segments.length) {
            this.selectSegment(this.segments[newSelectionIndex]);
        } else {
            // no visible segments remaining
            this.selectedSegment = false;
            this.hide();
        }
    };

    /**
     * Given a target segment, make its icon set visible in the carousel
     * Should ensure the selected control's style is updated and any other expired styles are purged
     * @param segment
     */
    this.selectSegment = function(segment) {
        var previousSelection = this.selectedSegment;
        if (previousSelection) {
            if (segment === previousSelection) { return; }
            previousSelection.deselect();
        }
        segment.select();
        this.carousel.changeIconSet(segment);
        if (previousSelection && previousSelection.autoHideEnabled && previousSelection.iconSet.length < 1) {
            // ensure that auto-hidden segments kept visible by selection can hide when deselected
            // must be hidden after new icon set has been made "visible"
            this.hideSegment(previousSelection);
        }
    };
};

/**
 * Component that wraps an icon set, and creates a UI element to represent it
 * Is responsible for switching between visible icon sets, and styling the UI
 * Is not responsible for the mechanics of what subset of the icons should be visible
 * @param segmentedControls ; the parent object that controls the interaction between individual controls
 * @param settings ; settings for the control's instantiation
 * @constructor
 */
var CarouselSegmentedControl = function(segmentedControls, settings) {
    this.parent = segmentedControls;
    this.iconSet = settings.iconSet;
    this.autoHideEnabled = typeof settings.enableSegmentAutoHide === 'boolean' ? settings.enableSegmentAutoHide : false;
    this.isVisible = true;

    /**
     * Initialise the control
     */
    this.init = function() {
        this.iconSet.registerAsSegment(this);
        var eventId = 'segmentedControl' + this.iconSet.label;
        this.element = $('<div></div>');
        this.element.text(this.iconSet.label);
        this.element.attr('data-id', eventId);
        this.element.appendTo(this.parent.segmentControlContainer);
        this.parent.carousel.registerListener(eventId, yudu_events.callback(this, this.handleClick));
    };

    /**
     * Control function to enable an icon set to trigger the visibility of its controlling segment
     */
    this.verifyVisibility = function(shouldBeVisible) {
        if (this.isVisible !== shouldBeVisible) {
            if (shouldBeVisible) {
                this.parent.showSegment(this);
            } else {
                this.parent.hideSegment(this);
            }
        }
    };

    /**
     * Ensure the DOM element associated with this segment is visible
     */
    this.show = function() {
        this.isVisible = true;
        this.element.show();
    };

    /**
     * Ensure the DOM element associated with this segment is not visible or rendered
     */
    this.hide = function() {
        this.isVisible = false;
        this.element.hide();
    };

    /**
     * Helper function to determine if this segment is currently selected
     * @returns {boolean}
     */
    this.isSelected = function() {
        return this.parent.selectedSegment === this;
    };

    /**
     * Ensure this element is styled correctly after a selection
     */
    this.select = function() {
        this.element.addClass('selected');
    };

    /**
     * Ensure this element is styled correctly after another segment is selected
     */
    this.deselect = function() {
        this.element.removeClass('selected');
    };

    /**
     * Style this segment to be the leftmost of the controls
     */
    this.addStyleForLeft = function() {
        this.element.addClass('left');
    };

    /**
     * Remove expired styling on this segment regarding being the leftmost of the controls
     */
    this.removeStyleForLeft = function() {
        this.element.removeClass('left');
    };

    /**
     * Style this segment to be the rightmost of the controls
     */
    this.addStyleForRight = function() {
        this.element.addClass('right');
    };

    /**
     * Remove expired styling on this segment regarding being the rightmost of the controls
     */
    this.removeStyleForRight = function() {
        this.element.removeClass('right');
    };

    //region Event handlers
    /**
     * Event handler to respond to the segment's DOM element being clicked on
     */
    this.handleClick = function() {
        this.parent.selectSegment(this);
    };
    //endregion

    // initialise the component before returning the instance
    this.init();
};

/**
 * Subcomponent responsible for creating and maintaining the carousel scroller
 * @param carousel ; the carousel this instance will be associated with
 * @param settings ; settings to apply to the scroller
 * @constructor
 */
var CarouselScroller = function(carousel, settings) {
    this.carousel = carousel;
    this.element = document.getElementById(settings.carouselScrollerId);
    //region container (createjs) for icons
    this.container = new yudu_commonSettings.createjs.Container();
    this.container.regX = 0;
    this.container.regY = 0;
    this.container.x = 0;
    this.container.y = 0;
    yudu_thumbnailsFunctions.addElementToStage(this.container);
    //endregion

    this.isDragging = false;

    //region getters
    /**
     * Interface method to aid retrieval of the container's current position
     * @returns {number}
     */
    this.getCurrentPosition = function() {
        return this.container.x;
    };

    /**
     * Calculate the array index of the leftmost icon to be loaded
     * @param displacement ; displacement in pixels from the current position
     */
    this.getStartIndex = function(displacement) {
        var x_ = this.container.x + (typeof displacement === 'number' ? displacement : 0);
        var index = Math.floor((-1 * x_ - this.carousel.visibleWidth / 2) / (this.carousel.getMaxIconWidth() + this.carousel.getIconPadding())) - 1;
        return Math.max(0, Math.min(index, this.carousel.iconsLength() - this.carousel.maxVisibleIcons));
    };

    /**
     * Calculate the array index of the currently centred icon
     */
    this.getCentreIndex = function() {
        /*
         * NB: calculation breakdown
         *  `carousel.visibleWidth >= 0`
         *  `container.x === 0` when the first icon is centred in the screen
         *      so we need to offset by half the icon bounding box width and padding
         *  as icons scroll left to display icons with higher index, `container.x` decreases; `container.x <= 0`
         *      so for a positive index we need to multiply by `-1`
         *  thus for the centre of the screen, we need `-container.x + (carousel.getIconPadding() + carousel.getMaxIconWidth())/2`
         *  but since we then need to convert a pixel value into an index, we need to divide by `(carousel.getIconPadding() + carousel.getMaxIconWidth())`
         *  hence why we simply add 0.5 after dividing
         */
        var rawIndex = (-1 * this.container.x) / (this.carousel.getMaxIconWidth() + this.carousel.getIconPadding()) + 0.5;
        // floor to make discrete
        var roundedIndex = Math.floor(rawIndex);
        // limit at top and bottom to ensure within the valid range
        return Math.max(0, Math.min(this.carousel.iconsLength(), roundedIndex));
    };
    //endregion

    //region update methods
    /**
     * If the icon exists and is not currently displayed
     * then initialises it if necessary and adds it to the document
     * @param icon
     */
    this.addIcon = function(icon) {
        if (!icon || icon.isVisible) {
            return;
        }
        if (!icon.initialised) {
            icon.init();
            $.data(icon.htmlElement, "page", icon.pageNumber);
        }
        icon.setOrientation(this.carousel.readerOrientation);
        icon.isVisible = true;
        this.element.appendChild(icon.htmlElement);
        this.container.addChild(icon.domElement);
    };

    /**
     * If the icon exists and is displayed then removes it from the document
     * @param icon
     */
    this.removeIcon = function(icon) {
        if (!icon || !icon.isVisible) {
            return;
        }
        icon.isVisible = false;
        this.element.removeChild(icon.htmlElement);
        this.container.removeChild(icon.domElement);
    };

    /**
     * Helper method to update the carousel's components' positions from a delta position (pixel value)
     * @param deltaX ; the change in pixels, usually from an event's details
     */
    this.updatePositionsFromDeltaX = function(deltaX) {
        var newX = this.getCurrentPosition() + deltaX;
        var scaledProgressionAlongScroller = -1 * newX / this.carousel.getTotalWidth();
        var limitedProgression = Math.min(Math.max(scaledProgressionAlongScroller, 0), 1);
        this.carousel.updatePositions(limitedProgression);
    };

    /**
     * Update the position of the scroller's createJS container
     * @param progression
     */
    this.updatePosition = function(progression) {
        var widthProgress = -1 * this.carousel.getTotalWidth() * progression;
        this.updateDisplayedIcons(widthProgress - this.container.x);
        this.container.x = widthProgress;
    };

    /**
     * Determines the icons that should be displayed when the container is moved
     * @param displacement ; the change in `this.container.x`
     */
    this.updateDisplayedIcons = function(displacement) {
        var oldStartIndex = this.getStartIndex();
        var newStartIndex = this.getStartIndex(displacement);
        if (oldStartIndex != newStartIndex) {
            if (displacement < 0) {
                for (var i = oldStartIndex; i < newStartIndex; i++) {
                    this.carousel.moveIconsLeft();
                }
            } else {
                for (var j = oldStartIndex; j > newStartIndex; j--) {
                    this.carousel.moveIconsRight();
                }
            }
        }
    };
    //endregion

    //region event handlers
    /**
     * Event handler (HammerJS) for the start of a drag
     * Initialise variables needed while dragging
     * @param event
     */
    this.handleScrollerDragStart = function(event) {
        this.carousel.isSpringing = false;
        this.isDragging = true;
        this.lastDragData = {x: event.gesture.deltaX, time: event.gesture.deltaTime};
    };

    /**
     * Event handler (HammerJS) to be called while a drag is occurring
     * Update carousel's components' positions
     * @param event
     */
    this.handleScrollerDrag = function(event) {
        if (!this.isDragging) {
            return;
        }
        var dx = (event.gesture.deltaX - this.lastDragData.x);
        this.previousDragData = {x: this.lastDragData.x, time: this.lastDragData.time};
        this.lastDragData = {x: event.gesture.deltaX, time: event.gesture.deltaTime};
        this.updatePositionsFromDeltaX(dx);
    };

    /**
     * Event handler (HammerJS) for the end of a drag
     * Should start springing (continued movement with remaining momentum) if possible
     * @param event
     */
    this.handleScrollerDragEnd = function(event) {
        var velocity = 0;
        if (this.previousDragData) {
            velocity = (event.gesture.deltaX - this.previousDragData.x) / (event.gesture.deltaTime - this.previousDragData.time);
        }
        this.isDragging = false;
        this.lastDragData = null;
        this.previousDragData = null;
        if (event.gesture) {
            this.carousel.velocity = Math.min(velocity * this.carousel.velocityScale, this.carousel.velocityMax);
            this.carousel.isSpringing = true;
        }
    };

    /**
     * Event handler (HammerJS) to respond to a tap on the scroller
     * @param event
     */
    this.handleTap = function(event) {
        if ($(event.target).hasClass(settings.carouselIconClassName)) {
            this.carousel.isSpringing = false;
            var pageNumber = parseInt($.data(event.target, "page"));
            yudu_commonFunctions.goToPage(pageNumber);
            this.carousel.toggle(false, false);
        }
    };

    //Hammer context for the scroller
    var hammerContext;
    hammerContext = $(this.element).hammer({transform_always_block: true, prevent_default: true});
    hammerContext.on("drag", yudu_events.callback(this, this.handleScrollerDrag));
    hammerContext.on("dragend", yudu_events.callback(this, this.handleScrollerDragEnd));
    hammerContext.on("dragstart", yudu_events.callback(this, this.handleScrollerDragStart));
    hammerContext.on("tap", yudu_events.callback(this, this.handleTap));
    //endregion
};

/**
 * Subcomponent responsible for creating and maintaining a progress bar for a carousel
 * @param carousel ; the carousel this instance will be associated with
 * @param settings ; settings to apply to the progress bar
 * @constructor
 */
var CarouselProgressBar = function(carousel, settings) {
    this.carousel = carousel;

    //Progress bar sizing constants (if changed will also need to be updated in stylesheet)
    this.progressIconWidth = 40;
    this.progressBarRelWidth = 0.8;

    // DOM object / jQuery references
    this.progressBar = document.getElementById(settings.carouselProgressBarId);
    this.progressIcon = document.getElementById(settings.carouselProgressIconId);
    this.progressBackground = $('#'+settings.carouselProgressBackgroundId);

    // Other variables
    this.isDragging = false;

    /**
     * Initialise the progress bar subcomponent
     */
    this.init = function() {
        this.progressBackground.on(yudu_commonSettings.clickAction, yudu_events.callback(this, this.progressBarClicked));
    };

    /**
     * Event handler for a click on the progress bar
     * @param event
     */
    this.progressBarClicked = function(event) {
        var pageX = event.pageX || event.originalEvent.pageX;
        if(!pageX) {
            return;
        }
        this.carousel.isSpringing = false;
        var offsetX = pageX - this.progressBackground.offset().left;
        var progression = offsetX / this.progressBackground.width();
        this.carousel.updatePositions(progression);
        this.carousel.displayIcons();
    };

    /**
     * Given a new progression (% through icons) updates the positions of the slider's elements
     * @param progression
     */
    this.updatePosition = function(progression) {
        var newWidth = progression * this.carousel.visibleWidth * this.progressBarRelWidth;
        this.progressBar.style.width = newWidth + 'px';
        this.progressIcon.style.left = (newWidth + this.carousel.visibleWidth * ((1- this.progressBarRelWidth) / 2) - this.progressIconWidth / 2) + 'px';
    };

    /**
     * Event handler (HammerJS) for the start of a drag
     * Initialise variables needed while dragging
     * @param event
     */
    this.handleProgressDragStart = function(event) {
        this.carousel.isSpringing = false;
        this.isDragging = true;
        this.lastDragData = {x: event.gesture.deltaX};
    };

    /**
     * Event handler (HammerJS) to be called while a drag is in progress
     * Update carousel's components' positions
     * @param event
     */
    this.handleProgressDrag = function(event) {
        if (!this.isDragging) {
            return;
        }
        var dx = (event.gesture.deltaX - this.lastDragData.x);
        this.lastDragData = {x: event.gesture.deltaX};
        var newX = this.carousel.progression * this.carousel.visibleWidth * this.progressBarRelWidth + dx;
        var progression = Math.min(Math.max(newX / (this.carousel.visibleWidth * this.progressBarRelWidth), 0), 1);
        this.carousel.updatePositions(progression);
    };

    /**
     * Event handler (HammerJS) for the end of a drag
     */
    this.handleProgressDragEnd = function() {
        this.isDragging = false;
        this.lastDragData = null;
    };

    //Hammer context for the progress icon
    var progressIconHammerContext = $(this.progressIcon).hammer({transform_always_block: true, prevent_default: true});
    progressIconHammerContext.on("drag", yudu_events.callback(this, this.handleProgressDrag));
    progressIconHammerContext.on("dragend", yudu_events.callback(this, this.handleProgressDragEnd));
    progressIconHammerContext.on("dragstart", yudu_events.callback(this, this.handleProgressDragStart));
};

/**
 * Submodule responsible for creating and maintaining a label for a carousel
 * @param carousel ; the carousel this instance will be associated with
 * @param settings ; settings to apply to the label
 * @constructor
 */
var CarouselIconLabel = function(carousel, settings) {
    this.carousel = carousel;
    this.label = $('#'+settings.carouselLabelId);

    /**
     * Updates the label based on the carousel's current position
     */
    this.updateLabel = function() {
        var currentIconSet = this.carousel.iconset();
        var icon;
        if (currentIconSet.length > 0) {
            var iconIndex = this.carousel.getCurrentIconIndex();
            icon = isNaN(iconIndex) ? null : currentIconSet.icons[iconIndex];
        }
        if (!icon) {
            this.resetLabel()
        } else {
            this.setLabel(icon);
        }
    };

    /**
     * Set the label according the the currently focused icon in the carousel
     * @param icon
     */
    this.setLabel = function(icon) {
        this.label.text(icon.getLabel());
    };

    /**
     * Resets the label
     */
    this.resetLabel = function() {
        this.label.text('');
    };
};

/**
 * Subcomponent responsible for containing and filtering sets of icons to be displayed on a scroller
 * @param carousel ; the carousel this instance will be associated with
 * @param settings ; settings to apply to the set
 * @constructor
 */
var CarouselIconSet = function(carousel, settings) {
    this.carousel = carousel;
    this.segment = false;
    this.id = settings.id;
    this.label = typeof settings.label === 'string' ? settings.label : this.id;
    this.isPrimary = settings.isPrimary || false;
    // not specifying a filter function defaults to an all-accepting for primaries and an all-rejecting for children
    this.filterFunction = settings.filterFunction || (this.isPrimary
            ? CarouselIconSet.emptyFilterFunction
            : CarouselIconSet.blockingFilterFunction);
    this.icons = [];
    this.length = 0;
    this.postUpdate = false;

    /**
     * Initialise the set
     */
    this.init = function() {
        if (this.isPrimary) {
            this.__original_icons = settings.icons;
            this.carousel.primaryIconSets[this.id] = this;
        } else {
            this.parent = settings.parent;
        }
        this.__initialised = true;
        this.update(true);
        this.addListeners();
    };

    /**
     * Register this icon set as being contained by a segmented control
     * Permits an icon set to be used either as the contents of a UI control, or standalone (eg for dynamic control)
     */
    this.registerAsSegment = function(segment) {
        this.segment = segment;
        if (!this.segment.autoHideEnabled) {
            return;
        }
        /**
         * Function responsible for auto-hiding a segment when appropriate
         */
        this.postUpdate = function() {
            this.segment.verifyVisibility(this.length > 0);
        }
    };

    /**
     * Given another icon set, and the index of a targeted icon in that set
     * Determine the icon in this set closest (in position relative to the primary's icons array) to the targeted icon
     * @param otherIconSet
     * @param indexOfIconInOtherSet
     * @returns {number} ; the index of the closest icon
     */
    this.findClosestIconTo = function(otherIconSet, indexOfIconInOtherSet) {
        var thisPrimary = this.getPrimary();
        if (otherIconSet.getPrimary().id !== thisPrimary.id) {
            // distinct icon sets: reset progression
            return 0;
        }
        var icon = otherIconSet.icons[indexOfIconInOtherSet];
        var indexOfIcon = this.icons.indexOf(icon);
        if (indexOfIcon >= 0) {
            // icon is still visible: keep it centred
            return indexOfIcon;
        }
        // icon is not visible: need to find a suitable "nearby" icon to display
        // arbitrarily choose to centre the icon before the previously centred icon
        var newIndex = thisPrimary.__original_icons.indexOf(icon) - 1;
        while (newIndex > 0) {
            var possibleIconIndex = this.icons.indexOf(thisPrimary.__original_icons[newIndex]);
            if (possibleIconIndex >= 0) {
                newIndex = possibleIconIndex;
                break;
            }
            newIndex -= 1;
        }
        return newIndex > 0 ? newIndex : 0;
    };

    //region recursive functions
    /**
     * Recursively traverses the ancestry of this set to retrieve the primary set
     * @returns {CarouselIconSet}
     */
    this.getPrimary = function() {
        return this.isPrimary ? this : this.parent.getPrimary();
    };

    if (this.isPrimary) {
        /**
         * If set is primary, filter the stored icons based on the input array of filtering functions
         * @param arrayOfMappingFunctions ; array of functions that take an icon and return `true`/`false`
         * @returns {Array} ; the icons to be displayed
         */
        this.includeBasedOnMap = function(arrayOfMappingFunctions) {
            var filteredIcons = [];
            for (var i = 0; i < this.__original_icons.length; i++) {
                var include = true;
                var icon = this.__original_icons[i];
                for (var j = 0; j < arrayOfMappingFunctions.length; j++) {
                    var func = arrayOfMappingFunctions[j];
                    if (!func(icon)) {
                        include = false;
                        break;
                    }
                }
                if (include) {
                    filteredIcons.push(icon);
                }
            }
            return filteredIcons;
        };

        /**
         * Function at the end of the recursive tree
         * @param functionsArray
         * @returns {Array}
         */
        this.filterIcons = function(functionsArray) {
            functionsArray.push(this.filterFunction);
            if (!this.__initialised) {this.init();}
            return this.includeBasedOnMap(functionsArray);
        };
    } else {
        /**
         * Filters the array of icons for this set, based on the current filter function and any other input functions
         * Recurses up the tree of iconSets
         * @param functionsArray
         * @returns {Array}
         */
        this.filterIcons = function(functionsArray) {
            functionsArray.push(this.filterFunction);
            if (!this.__initialised) {this.init();}
            return this.parent.filterIcons(functionsArray);
        };
    }

    /**
     * Determine and cache the appropriate set of icons to be displayed on the scroller for this iconSet
     *  based on the set's filtering function
     * Note that the filtering function should take an `icon` and return `true`/`false`
     *  which will determine whether that icon is included in the returned array
     * @returns {Array}
     */
    this.getFilteredIcons = function() {
        return this.filterIcons([]);
    };
    //endregion

    /**
     * Helper function to recalculate and cache the filtered icons list and its length length
     */
    this.update = function(fromInitialisation) {
        if (!(fromInitialisation && this.isPrimary)) {
            // Need to ensure primaries get filtered during initialisation for carousel setup
            if (!this.carousel.isVisible) {
                // Sets do not need to update when the carousel is hidden, so long as they are updated when it is shown
                return;
            } else if (this.segment && !this.segment.autoHideEnabled && !this.segment.isSelected()) {
                // For a visible carousel:
                //  No segment => icon set visible ; update
                //  Auto-hide enabled -> segment needs to update even when not selected ; update
                //  Auto-hide not enabled -> only update if segment is selected
                return;
            }
        }
        // keep track of previous state if necessary
        var oldIndex;
        var oldIcon;
        var needToUpdateIconPositions = this.carousel.isVisible && (!this.segment || this.segment.isSelected());
        if (needToUpdateIconPositions) {
            // if the carousel is visible, and there is no segment or this segment is selected (ie this segment is visible)
            //  track the currently centred icon so we can recentre it if the number of icons changes
            oldIndex = this.carousel.scroller.getCentreIndex();
            oldIcon = this.icons[oldIndex];
        }
        // do the update
        this.icons = this.getFilteredIcons();
        this.length = this.icons.length;
        // update other objects as necessary
        if (needToUpdateIconPositions) {
            var newIndex = this.icons.indexOf(oldIcon);
            // since we don't track before/after states of the filtered list, if the previous icon is removed,
            //  simply keep the same index (and assume change has minimal effect on icon indices)
            if (newIndex < 0) {
                newIndex = Math.min(oldIndex, this.length);
            }
            this.carousel.progressionFromIconIndex(newIndex);
            // redraw the carousel (in case the pages have changed)
            this.carousel.updateVisibleIcons();
        }
        this.postUpdate && this.postUpdate();
    };

    /**
     * Placeholder callback function that simply calls update
     */
    this.updateIconsCallback = function() {
        this.update();
    };

    /**
     * Adds any event listeners specified in the settings
     * Settings' `listeners` section should be an array of objects
     *  Each object should at least contain the topic to subscribe to
     *  Each object may additionally parameterise:
     *      - the topic emitter : defaults to `yudu_events.ALL`
     *      - the callback : defaults to the above placeholder that updates the icon set
     *          author's note: it may be easier to "subclass" and override the placeholder
     *           than try and parameterise the callback, since the scopes are awkward
     *      - the async parameter (whether the callback needs to be synchronous (`false`) or not)
     *          : defaults to `true`
     */
    this.addListeners = function() {
        if (!settings.listeners) {return;}
        for (var i = 0; i < settings.listeners.length; i++) {
            var listenerDetails = settings.listeners[i];
            if (!listenerDetails.topic) {continue;}
            var callback;
            if (listenerDetails.callback) {
                callback = yudu_events.callback(this, listenerDetails.callback);
            } else {
                callback = yudu_events.callback(this, this.updateIconsCallback);
            }
            var emitter = listenerDetails.emitter || yudu_events.ALL;
            var async = typeof listenerDetails.async === 'boolean' ? listenerDetails.async : true;
            yudu_events.subscribe(emitter, listenerDetails.topic, callback, async);
        }
    };

    // ensure the object is initialised before returning it
    this.init();
};

//region icon set "static" functions
/**
 * Vacuous filtering function with empty filter that accepts all icons
 * @param icon
 * @returns {boolean} ; should `icon` be visible (`true`) or not?
 */
CarouselIconSet.emptyFilterFunction = function(icon) {
    return true;
};

/**
 * Vacuous filtering function that rejects (blocks) all icons
 * @param icon
 * @returns {boolean} ; should `icon` be visible or not (`false`)?
 */
CarouselIconSet.blockingFilterFunction = function(icon) {
    return false;
};
//endregion

/**
 * Create a CarouselIcon (Thumbnail) instance
 * @param carousel ; the carousel this icon belongs to
 * @param settings ; JSON containing the following:
 *  - id : an ID for the icon
 *  - filename : function returning the name of the icon file
 *  - fileSrc : function returning the source location (can be relative) of the icon file
 *  - fileHeight : function returning the height of the icon image
 *  - fileWidth : function returning the width of the icon image
 *  - initialDimensions : hash of dimensions for the initial orientation of the reader
 *      dimensions must be of the form `{x, y, width, height}`
 *  - initialReaderOrientation : current orientation of the reader
 *  - pageNumber : the page of the thumbnail (not the index!)
 * @constructor
 */
var Thumbnail = function(carousel, settings) {
    this.carousel = carousel;
    this.initialised = false;
    this.isVisible = false;
    this.htmlElement = null;
    this.domElement = null;

    this.id = settings.id;
    this.filename = settings.filename;
    this.fileSrc = settings.fileSrc;
    this.fileHeight = settings.fileHeight;
    this.fileWidth = settings.fileWidth;
    this.pageNumber = settings.pageNumber;
    this.readerOrientation = settings.initialReaderOrientation;
    this.pageDetailsIndex = settings.pageDetailsIndex;

    this.dimensions = [];
    this.dimensions[settings.initialReaderOrientation] = settings.initialDimensions;

    /**
     * Inits the icon by creating a visual representation, the hit area and binding some events.
     */
    this.init = function() {
        this.initialised = true;

        this.htmlElement = document.createElement("div");
        this.setImage();
        this.htmlElement.className = settings.iconClassName;

        this.domElement = new yudu_commonSettings.createjs.DOMElement(this.htmlElement);

        this.setSize();
    };

    /**
     * Helper method to update file used in the CSS
     */
    this.setImage = function() {
        if(this.initialised) {
            this.htmlElement.style.backgroundImage = 'url(' + this.fileSrc() + ')';
        }
    };

    /**
     * Sets the size / position for the icon for a given orientation
     * @param readerOrientation
     * @param dimensions
     */
    this.initOrientation = function(readerOrientation, dimensions) {
        this.dimensions[readerOrientation] = dimensions;
    };

    /**
     * Sets the size/position of the html / dom elements
     */
    this.setSize = function() {
        this.htmlElement.style.width = this.dimensions[this.readerOrientation].width + "px";
        this.htmlElement.style.height = this.dimensions[this.readerOrientation].height + "px";

        this.domElement.set(this.dimensions[this.readerOrientation]);
        this.updatePosition();
    };

    /**
     * Sets the position of the dom element
     */
    this.setPosition = function(positionJson) {
        this.domElement.set(positionJson);
    };

    /**
     * Updates the position of the current icon in the scroller based on the currently visible icon set
     */
    this.updatePosition = function() {
        this.setPosition(this.carousel.calculateIconPosition(this));
    };

    /**
     * Sets the icon's reader orientation tracker - if it has changed then updates the size / position
     * @param readerOrientation
     */
    this.setOrientation = function(readerOrientation) {
        if(readerOrientation == this.readerOrientation) {
            this.updatePosition();
            return;
        }
        this.readerOrientation = readerOrientation;
        this.setSize();
    };

    /**
     * Return the file width in pixels
     * @returns {int}
     */
    this.getFileWidth = function() {
        return this.fileWidth();
    };

    /**
     * Return the file height in pixels
     * @returns {int}
     */
    this.getFileHeight = function() {
        return this.fileHeight();
    };

    this.getCurrentHeight = function() {
        return this.dimensions[this.readerOrientation].height;
    };

    this.getCurrentWidth = function() {
        return this.dimensions[this.readerOrientation].width;
    };

    /**
     * Returns the label for this icon
     * @returns {string}
     */
    this.getLabel = function() {
        if (this.pageNumber == 0 && yudu_commonSettings.hasIntroPage) {
            return yudu_thumbnailsSettings.introString;
        } else if (yudu_thumbnailsSettings.pagesDetails[this.pageDetailsIndex]
                && yudu_thumbnailsSettings.pagesDetails[this.pageDetailsIndex].label()) {        
            var pageLabel = yudu_thumbnailsSettings.pagesDetails[this.pageDetailsIndex].label();
            var toLabel = pageLabel && this.carousel.intRegex.test(pageLabel)
                    ? yudu_thumbnailsSettings.pageString + ' '
                    : '';
            return toLabel + pageLabel;
        } else {
            return yudu_thumbnailsSettings.pageString + " " + this.pageNumber;
        }
    }
};

var thumbnailSettings = {
    enableCarouselLabel: true,
    enableCarouselProgressBar: true,
    enableSegments: true,
    enableSegmentAutoHide: true,
    carouselContainerId: 'thumbnailBar',
    carouselSegmentedControlsWrapperId: 'segmentedBackground',
    carouselSegmentedControlContainerId: 'segmentedController',
    carouselScrollerId: 'thumbnails',
    carouselProgressBarId: 'progressBar',
    carouselProgressIconId: 'progressIcon',
    carouselProgressBackgroundId: 'progressBackground',
    carouselLabelId: 'pageLabel',
    carouselIconClassName: 'thumbnail',
    initialIconSizes: [
        {iconWidthLimit: 100, iconHeightLimit: 141, iconPadding: 20},
        {iconWidthLimit: 100, iconHeightLimit: 141, iconPadding: 20}
    ], // values will still be dynamically calculated for mobile devices
    mechanics: {
        mass: 10,
        dampingCoefficient: -20,
        velocityMax: 10000,
        velocityScale: 600
    }
};
var cssFiles = [yudu_commonFunctions.createBrandingPath('thumbnails/style.css')];
yudu_commonFunctions.loadCss(cssFiles, function () {
    new Thumbnails(thumbnailSettings).init();
});
