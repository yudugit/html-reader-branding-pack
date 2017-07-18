## Introduction

The HTML Reader "Branding Pack" loosely consists of three different sets of materials.

1. Images
    + for example, the "artwork" subfolder is where most of the images for the UI are kept
2. Overrides
    + for example, an edition- or publication-specific language pack may be included in the branding pack to allow specific override values for the default language packs
3. Brandable submodule scripts
    + for example, scripts that allow near-complete control over the Reader's various toolbars and several other UI elements

This document largely focuses on the latter.
It outlines the interface provided by the Reader for the brandable submodules within.
It assumes a certain degree of familiarity with the HTML Reader, as well as basic JavaScript concepts.
The various sections sometimes also include a greater degree of implementation details, requiring more specialist knowledge.
In general, a first port of call to anything listed in the API should be its use in the default branding pack - these will give you more context for how something is used.

### Important Information

The HTML Reader branding pack is applied incrementally.
That is, during a preview operation, the _default_ branding pack will be applied first.
Once that has been applied, your customised branding pack will then be applied **over the top** of the default.
Thus, any files in your customised branding pack will override any default files of the same name, but any default files not overridden will still be present.

Using this technique, it is trivial to customise images without requiring any knowledge of JavaScript.
Simply upload a branding pack with your custom images, following the directory structure of the default pack.
In such a case, your images will replace those of the default pack.
By omitting any scripts in your upload, those from the default pack will still be applied - they are not overridden.

### Background on the HTML Reader

The HTML Reader itself is modular in design.
Separate modules are responsible for different aspects of its behaviour, and all come together to create an instance of a `Reader` object.
Each `Reader` will only ever be responsible for one edition in a given HTML document's lifetime.

What are now referred to as the "Brandable Submodules" used to once be modules in the Reader's core.
After being extracted, each can now be considered a part of the "BrandableSubmodules" module - hence each is now referred to as a submodule.

#### The HTML Reader Build Process

The HTML Reader undergoes an optimisation process called minification as part of its build process.
One reason among many for doing this to combine multiple development-versioned source files into a single, smaller file for ease of deployment.
In addition to this, all the code in the default branding pack is minified during its build process.
In fact, if you do not override the configurable JSON settings files but only upload an unminified submodule script, your script will not override the default.
This is due to the build process, which minifies all scripts, and in particular then updates the references in the settings files to point to these minified files.
(A minified JavaScript file will usually have the `.min.js` file extension instead of the `.js` file extension, and that convention is followed here.)

A keen reader will notice the default settings included here do not point to minified files, but to the unminified files present.
This allows you to upload a copy of this pack as-is, and it should work identically to the current default branding pack.
(Though doing so is not advised as your editions will not get updates automatically for unbranded submodules in such a case.)
It is strongly advised that should you make changes to the source code related here, you minify it prior to use.
If you do, please also remember to use the correct file name references in the settings files.
