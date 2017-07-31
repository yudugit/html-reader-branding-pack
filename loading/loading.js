var element = $('#loadCover');
var progressText = $("#progressText", element);
var progressBar = $("#progressBar", element)[0];
var fadeLoadingScreenDuration = 300;

//Initialises loading screen
var loadingInit = function(){
    if (yudu_loadingSettings.loaded === true) {
        // if the Reader has already loaded, terminate early
        endLoading();
    }
    registerForEvents();
    displayLoadingPage();
};

//Sets loading screen background and displays page
var displayLoadingPage = function(){
    // Sets a gradient background if bgTopColour and bgBottomColour have been defined either as configuration items in
    // loadingConfig or as branding settings in Publisher. Configuration items in loadingConfig will take priority.
    yudu_loadingFunctions.setGradientBackground(element, yudu_loadingSettings);
    // check for any initial progress made while loading this page
    var progressSoFar = parseInt(yudu_loadingSettings.lastProgressReport) || 0;
    updateProgressBar(progressSoFar);
    element.show();
};

var registerForEvents = function(){
    yudu_events.subscribe(yudu_events.ALL, yudu_events.LOADING.DISPLAY_PROGRESS, displayProgress, false);
    yudu_events.subscribe(yudu_events.ALL, yudu_events.LOADING.END_LOADING, endLoading, false);
};

var displayProgress = function(event) {
    var percentage = event.data.percentage;
    updateProgressBar(parseInt(percentage));
};

var updateProgressBar = function(percentage) {
    progressText.text(yudu_loadingSettings.loadingString + " " + percentage + "%");
    progressBar.style.width = percentage + "%";
};

// Hides the loading screen on completion
var endLoading = function() {
    yudu_loadingFunctions.fadeLoadingScreen(fadeLoadingScreenDuration);
};

var cssFiles = [yudu_commonFunctions.createBrandingPath('loading/style.css')];
yudu_commonFunctions.loadCss(cssFiles, loadingInit);
