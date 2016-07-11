var OPTIONS_BUTTON_INDEX = 1;

var toolbarsContainer = $('#highlightingToolsContainer');
var drawingOptionsToolbar = $('#drawingOptionsToolbar');
var isShowing = false;
var buttonFaded = {
    'nextPage': false,
    'prevPage': true
};

var editOptionsToolbarButtons = {
    "cancelButton": $('#highlightsCancel'),
    "undoButton": $('#highlightsUndo'),
    "clearButton": $('#highlightsClear'),
    "redoButton": $('#highlightsRedo'),
    "saveButton": $('#hightlightsSave')
};

var drawingOptions = {
    "panel":   $('#drawingOptionsPanel'),
    "background": $('#drawingOptionsBackground')
};

var colourOptions = $(".drawingOptionButton input[name=colour]:radio");
var penSizeOptions =$(".drawingOptionButton input[name=penSize]:radio");
var opacityOptions = $(".drawingOptionButton input[name=opacity]:radio");

var drawingOptionsToolbarButtons = [];
var drawingOptionsButton;

var drawingToolbarsInit = function() {
    registerDrawingToolbarsForYuduEvents();
    addEditOptionsToolbarButtonEventListeners();

    if (!yudu_commonSettings.isDesktop) {
        drawingOptionsToolbar.addClass("touchDevice");
        drawingOptions.panel.addClass("touchDevice");
    }

    createDrawingOptionsToolbar();

    colourOptions.change(updateDrawingOptionsColour);
    penSizeOptions.change(setBrushWidth);
    opacityOptions.change(setBrushColour);

    drawingOptions.background.on(yudu_commonSettings.clickAction, toggleDrawingOptions);

    setBrushColour();
    setBrushWidth();
};

var addEditOptionsToolbarButtonEventListeners = function() {
    editOptionsToolbarButtons.cancelButton.on(yudu_commonSettings.clickAction, drawingButtonHit(this, yudu_drawingToolbarFunctions.cancel));
    editOptionsToolbarButtons.undoButton.on(yudu_commonSettings.clickAction, drawingButtonHit(this, yudu_drawingToolbarFunctions.undo));
    editOptionsToolbarButtons.clearButton.on(yudu_commonSettings.clickAction, drawingButtonHit(this, yudu_drawingToolbarFunctions.clearAll));
    editOptionsToolbarButtons.redoButton.on(yudu_commonSettings.clickAction, drawingButtonHit(this, yudu_drawingToolbarFunctions.redo));
    editOptionsToolbarButtons.saveButton.on(yudu_commonSettings.clickAction, drawingButtonHit(this, yudu_drawingToolbarFunctions.save));
};

var registerDrawingToolbarsForYuduEvents = function() {
    yudu_events.subscribe(yudu_events.ALL, yudu_events.COMMON.RESIZE, positionDrawingOptionsToolbarButtons, false);
    yudu_events.subscribe(yudu_events.ALL, yudu_events.DRAWING_TOOLBARS.TOGGLE_TOOLBARS, yudu_events.callback(this, this.setToolbarsVisibility), false);
};

var createDrawingOptionsToolbar = function() {
    var highResIcons = yudu_toolbarSettings.shouldUseHighRes;

    createDrawingOptionStandardButton('prevPage', highResIcons, previousPageClicked);
    createDrawingOptionsPanelButton();
    createDrawingOptionRadioButton('penTool', highResIcons, enterPenMode, true);
    createDrawingOptionRadioButton('eraserTool', highResIcons, enterEraserMode, false);
    createDrawingOptionRadioButton('panTool', highResIcons, enterPanMode, false);
    createDrawingOptionStandardButton('nextPage', highResIcons, nextPageClicked);

    $('#drawingOptionsToolbar .radio').on(yudu_commonSettings.clickAction, function(event) {
        $('#drawingOptionsToolbar .radio').removeClass('selected');
        event.target.className += " selected";
    });

    positionDrawingOptionsToolbarButtons();
};

var createDrawingOptionStandardButton = function(id, highResIcons, callback) {
    createDrawingOptionButton(id, true, highResIcons, callback, function(newButton){
        if (!yudu_commonSettings.isDesktop) {
            newButton.addClass('touchControl');
        }
    });
};

var createDrawingOptionRadioButton = function(id, highResIcons, callback, selected) {
    createDrawingOptionButton(id, true, highResIcons, callback, function(newButton){
        newButton.addClass('radio');
        if (selected) {
            newButton.addClass('selected');
        }
    });
};

var createDrawingOptionsPanelButton = function() {
    createDrawingOptionButton('drawingOptions', false, false, toggleDrawingOptions, function(newButton){
        drawingOptionsButton = newButton;
        updateDrawingOptionsColour();
    });
};

/**
 * unified method to create a new button for the drawing toolbars
 * @param id {string}
 * @param hasIcon {boolean} ; does the button have an icon
 * @param highResIcons {boolean} ; only relevant if the button has an icon
 * @param callback {function}
 * @param initialisationCallback {function} ;
 *      this function should take the newly created button as a parameter
 *      and can be used to add any additional classes required before the button is rendered
 */
var createDrawingOptionButton = function(id, hasIcon, highResIcons, callback, initialisationCallback) {
    var button = $('<a type="button" class="drawingOptionToolbarButton" tabindex="-1" id="' + id + '"></a>');
    if (typeof initialisationCallback != 'undefined') {
        initialisationCallback(button);
    }
    if (hasIcon) {
        var iconPath = getIconFor(id, highResIcons);
        button.css('background-image', 'url(' + iconPath + ')');
    }
    button.on(yudu_commonSettings.clickAction, callback);
    drawingOptionsToolbar.append(button);
    drawingOptionsToolbarButtons.push(button);
};

/**
 * get the `src` path for the icon with the specified ID
 * @param id
 * @param highResIcons ; [optional] should the high res icons be used
 * @returns string ; path to the specified image (no checks performed for existence)
 */
var getIconFor = function(id, highResIcons) {
    if (typeof highResIcons == 'undefined') {
        highResIcons = yudu_toolbarSettings.shouldUseHighRes;
    }
    return yudu_toolbarSettings.toolbarIconBasePath
            + (highResIcons ? yudu_toolbarSettings.iconHighResPrefix : '')
            + id + yudu_toolbarSettings.iconFileExtension;
};

var updateDrawingOptionsColour = function() {
    drawingOptionsButton.css('background-color', 'rgb(' + $("input[name=colour]:checked").val() + ')');
    setBrushColour();
};

var positionDrawingOptionsToolbarButtons = function() {
    var gap = (window.innerWidth/6);
    var offset = (gap/2) - (drawingOptionsToolbarButtons[0].outerWidth(true) / 2);
    for (var i=0; i<drawingOptionsToolbarButtons.length; i++) {
        drawingOptionsToolbarButtons[i].css({"left": offset + (gap * i)});
    }
    drawingOptions.panel.css({"left": drawingOptionsToolbarButtons[OPTIONS_BUTTON_INDEX].css("left")});
    $('.opacityOption').css('background-image','url(' + yudu_toolbarSettings.toolbarIconBasePath + 'chequerboard.png)');
};

var toggleDrawingOptions = function() {
    if (drawingOptions.panel.hasClass('hidden')) {
        drawingOptions.panel.removeClass('hidden');
        drawingOptions.background.show();
    } else {
        drawingOptions.panel.addClass('hidden');
        drawingOptions.background.hide();
    }
};

var setBrushColour = function() {
    yudu_drawingToolbarFunctions.setDrawingBrushColour('rgba(' + $("input[name=colour]:checked").val() + ',' + $("input[name=opacity]:checked").val() + ')');
};

var setBrushWidth = function() {
    yudu_drawingToolbarFunctions.setDrawingBrushWidth($("input[name=penSize]:checked").val());
};

var enterPenMode = function() {
    yudu_drawingToolbarFunctions.penMode();
};

var enterEraserMode = function() {
    yudu_drawingToolbarFunctions.eraserMode();
};

var enterPanMode = function() {
    yudu_drawingToolbarFunctions.panMode();
};

var nextPageClicked = function() {
    yudu_drawingToolbarFunctions.goToNextPage();
    if (buttonFaded.prevPage) {
        unfadeButton('prevPage');
    }
    if (!yudu_drawingToolbarFunctions.hasNextPage()) {
        fadeButton('nextPage');
    }
};

var previousPageClicked = function() {
    yudu_drawingToolbarFunctions.goToPreviousPage();
    if (buttonFaded.nextPage) {
        unfadeButton('nextPage');
    }
    if (!yudu_drawingToolbarFunctions.hasPreviousPage()) {
        fadeButton('prevPage');
    }
};

var fadePageTurnButtons = function() {
    if (!yudu_drawingToolbarFunctions.hasNextPage()) {
        fadeButton('nextPage');
    } else {
        unfadeButton('nextPage');
    }
    if (!yudu_drawingToolbarFunctions.hasPreviousPage()) {
        fadeButton('prevPage');
    } else {
        unfadeButton('prevPage');
    }
};

var fadeButton = function(buttonId) {
    toolbarsContainer.find('a#' + buttonId).css('opacity', 0.4).css('cursor', 'default');
    buttonFaded[buttonId] = true;
};

var unfadeButton = function(buttonId) {
    toolbarsContainer.find('a#' + buttonId).css('opacity','').css('cursor', '');
    buttonFaded[buttonId] = false;
};

var setToolbarsVisibility = function (event) {
    shouldShow = event.data.show || false;

    if (shouldShow && !isShowing) {
        toolbarsContainer.show();
        fadePageTurnButtons();
    }
    else if (!shouldShow && isShowing) {
        toolbarsContainer.hide();
    }

    isShowing = shouldShow;
};

var drawingButtonHit = function(scope, callback) {
    var args = Array.prototype.slice.call(arguments, 2);
    return function() {
        return callback.apply(scope, args);
    };
};


var cssFiles = [yudu_commonFunctions.createBrandingPath('drawingToolbars/style.css')];
yudu_commonFunctions.loadCss(cssFiles, drawingToolbarsInit);
