# The Brandable Submodules API

The following sections attempt to outline the functionality of the HTML Reader exposed to the submodules.
It is split into multiple "sub-interfaces", with most submodules having access to targeted "settings" and "functions" components.
All components will be added to the window to be globally available.
In general, these sub-interfaces will only be made available immediately before the relevant HTML fragments are imported.
In particular, this means you cannot rely on components targeted to a different submodule to be available when your scripts first initialise, though they should all be available once the Reader's own initialisation has finished.
The exceptions to this are the "Common" and "Events" sub-interfaces, which should be available for all of the submodules to use.
