# Building the HTML Reader Branding Pack

To build the branding pack you can use the provided Gradle tasks which are declared in `build.gradle`.
The tasks of interest are located in the *Branding Pack Build tasks* group which are listed below:

- **build** - _Minifies the JavaScript files and compiles the LESS files for all parts of the branding pack_
- **cleanBuild** - _Cleans up a build folder, if present_
- **cleanSubmodules** - _Cleans up all modified and transitional files from the build scripts_
- **compileAllCss** - _Compiles all the LESS files in this project_
- **copyBrandingPack** - _Builds the pack, then copies the necessary files into a separate build folder_
- **minifyAllJs** - _Minifies all the JavaScript files in this project and updates all the config files to use the minified versions_
- **prepareBrandingPack** - _Builds the pack, copies it, then cleans up the modified and transitional files_

Each of the minification and compilation tasks works in the default state of the repository.
They expect a single JavaScript file to minify and a single LESS file to compile in each submodule.
Changes to the submodules may require changes to the build script.

Note that the JavaScript minification process also updates the config file in each submodule.
This ensures they reference minified versions of scripts instead of the original source versions.
The `cleanSubmodules` task will undo this change.

## Running Gradle

This repository includes the Gradle wrapper which can be used to run the tasks without installing Gradle itself.
For more information about how this works and how to use the Gradle wrapper see [the official documentation](https://docs.gradle.org/current/userguide/gradle_wrapper.html).
Typically you should only need to run `./gradlew build` or `./gradlew prepareBrandingPack` and not concern yourself with the tasks in the *JavaScript Minification* and *LESS Compilation* groups.

## Uploading your branding pack

Once you have built the pack, there is one more step you will need to take before you can upload your pack.
A ZIP archive of all the files you wish to include still needs to be created.
As noted in the [introduction](./intro.md#important-information), you only need to include those files you actively wish to override.
You should use the layout of files in the default branding pack as a guide.
Any images you wish to use should be included, as should the custom strings pack if you have added any.
You do not need to include any of the documentation, or the build scripts, in your pack - these will make it unnecessarily large.
Minified scripts are preferred over unminified - the latter should be omitted from the bundle wherever possible.
Make sure not to forget the configuration JSONs for each submodule you have made changes to, especially if you have used scripts with different names to the default.
Crucially, ensure that there is no "root folder" in your archive, or the pack will not work.
Finally, upload your archive, specifying the file usage as being for the "HTML Reader branding pack".

Did you know that you can upload a branding pack to a Publication and use it for every Edition it contains?
This way you only need to upload your file once, and make changes to it in one place.
