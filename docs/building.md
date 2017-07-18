# Building the HTML Reader Branding Pack

To build the branding pack you can use the provided Gradle tasks which are declared in `build.gradle`.
The tasks of interest are located in the *Branding Pack Build tasks* group which are listed below:

- **build** - _Minifies the JavaScript files and compiles the LESS files for all parts of the branding pack_
- **clean** - _Cleans up all the output files from the build scripts_
- **compileAllCss** - _Compiles all the LESS files in this project_
- **minifyAllJs** - _Minifies all the JavaScript files in this project and updates all the config files to use the minified versions_

Each of the minification and compilation tasks works in the default state of the repository.
They expect a single JavaScript file to minify and a single LESS file to compile in each submodule.
Changes to the submodules may require changes to the build script.

Note that the JavaScript minification process also updates the config file in each submodule.
This ensures they reference minified versions of scripts instead of the original source versions.
The `clean` task will undo this change.

## Running Gradle

This repository includes the Gradle wrapper which can be used to run the tasks without installing Gradle itself.
For more information about how this works and how to use the Gradle wrapper see [the official documentation](https://docs.gradle.org/current/userguide/gradle_wrapper.html).
Typically you should only need to run `./gradlew build` and not concern yourself with the tasks in the *JavaScript Minification* and *LESS Compilation* groups.
