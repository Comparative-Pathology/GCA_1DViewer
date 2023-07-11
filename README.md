# Edinburgh Gut Cell Atlas 1D Model Viewer

The Edinburgh Gut Cell Atlas 1D viewer is a web-based application to view and browse an abstract model of the human gut. 

The GCA 1D viewer can easily be embedded in other web applications to provide an interactive abstract visualisation of the GUT.
The viewer is developed using ES6 JavaScript in a modular way. 
The viewer depends on a few JavaScript packages including *SVGJS* and *JQuery-UI* which are included for ease of use.


## Adding the GCA 1D model viewer to your application

There are two options for importing the GCA 1D viewer into your application:

**1. importing the distribution version**
The distribution version of the application is produced using webpack. Download the zip file from the Github page and unzip it into a folder in your application.
You need to include *GCA_Viewer1D.js* as a script in your application to use the library. If you require any of the GCA utilities add *GCA_Utilis.js* as well.

```html
<script src="dist/GCA_Viewer1D.js"></script>
<script src="dist/GCA_Utils.js"></script>
```

This will provide  access to *GCA_Viewer1D* object and *GCA_Utilities* in your JavaScript code:
	
```javascript
import { Viewer1D } from 'GCA_1DViewer/src/Viewer1D.js';
import * from 'GCA_1DViewer/src/modules/GCA_Utilities.js'

```

**2. importing the source version**
If you would like to use the 1D viewer source code in your application you can do so by importing the relevant modules as follows:

```javascript
...

GCA_Viewer1D.Viewer1D

GCA_Utils.*function_name*

...

```

The dependent libraries should also be added to your application. This can be done as shown in the following code (the paths are application dependant) regardless of how the library is imported. 


```html
<script src="external/jquery/jquery-3.5.1.min.js"></script>
<script src="external/jquery/jquery-ui.min.js"></script>
<script src="external/svg/svg.min.js"></script>
<script src="external/svg/svg.draggable.min.js"></script>
```

## Displaying the GCA 1D model viewer in your application
To add the 1D viewer to your web application display you need to provide a rectangular container such as a *div* element. The viewer adjusts its display based on the container size and in response to a resize event. However, the container dimensions should be specified when it is used to display the model.
For example:

```html
	<div id="viewer-container" style="width:1200px; height:400px; background-color:#777">	
```

Your 1D viewer can be created by instantiating a Viewer1D object from the Viewer1D module. You can then use your viewer object to load a 1D model from a GCA 1D model file. A local model file is provided with the application that represents the human gut. It is also possible to obtain a model file from the GCA model database service or created one by yourself. The model file can be in JSON or XML format.

```javascript
	let viewer = new Viewer1D(container);		// Create an instance of the 1D viewer 
	viewer.loadModel('./models/EdinGCA_1D_00010_1_15.json', modelReadyCallback())  // Load and display a 1D model and set a callback for any required post load processing  
```
The *loadModel* method receives the model file name and path and a callback function to perform any post-processing required by the application.
The model will be displayed as soon as it is loaded.
  
## Using the 1D viewer API 
The 1D viewer API provides several methods to programmatically change the appearance of the model viewer. Some of these methods are described in the following table. Note that these methods can be used after the model is being loaded, therefore an appropriate place to use them is in the *loadModel* callback.


| Method    | Description |
| --------- | ----------- |
| *setFullView(status)*	| *status: True/False*;  Expands/collapses the zoom panel (zoom panel is expanded by default) | 
| *setRoi(roi, cursorPos)* | *roi*: is an object containing position, branch, and width; Sets ROI and cursor position |
| *updateRoi(position, branch, width)* | Changes ROI using specific parameters |
| *setCursorPos(position)* | Sets a new cursor position within the ROI extents |
| *changeTheme(themeIndex)* | Changes the viewer theme (currently 3 themes available specified by numbers 1, 2, 3) |
| *addMarker(position, description, branch)* | Adds a marker to be displayed on the specified position |

		
```javascript
	let viewer = new Viewer1D(container);		// Create an instance of the 1D viewer 
	viewer.loadModel('./models/EdinGCA_1D_00010_1_15.json', modelReadyCallback())  // Load and display a 1D model and set a callback for any required post-load processing  

	modelReadyCallback() {
		// Collapse zoom panel
		viewer.setFullView(false);	// collapse the zoom panel (zoom panel is expanded by default) 
		
		// Set ROI and cursor position
		let roi = {position:400, branch:0, width:300};
		let cursorPos = 500;
		viewer.setRoi(roi, cursorPos)

		// Change ROI using specific parameters
		viewer.updateRoi(750, 1, 800);  //(roi centre position, branch index:0/1, roi width)
		
		// Setting a new cursor position
		viewer1D.setCursorPos(1200);    //cursor position clamped within the  ROI extents
		
		// Change the viewer theme (currently 3 themes available specified by numbers 1, 2, 3)
		viewer1D.changeTheme(1);
	
		// Adding a marker to be displayed on the specified position 
		viewer1D.addMarker(250, 'testing API', 0);		// (position, description, branch index [0:colon/1:ileum]))
	}
```


## Interacting with the 1D model viewer
The viewer fires a number of events in response to the user's interactions that can be captured by your application to interact with the viewer. This is based on the observer pattern hence your application must subscribe to the events to get notifications.
Currently, it is possible to listen to three events inducing the "Region Of Interest Change", "Model Change", and "Zoom Panel Expand/Collapse" events. When subscribing for these events it is easier to use a class as the event target and add appropriate handlers as required. Following is an example:


```javascript
class DemoViewer extends EventTarget {
	constructor (container) {
		super();
		this.viewer1D = new Viewer1D(container);		// Create an instance of the 1D viewer 
		this.viewer1D.addRoiChangeListener(this, this.handleRoiChange);			// (optional) adding a handler for the region of interest change events
		this.viewer1D.addModelChangeListener(this, this.handleModelChange);     // (optional) adding a handler for model change events 
		this.viewer1D.addFullviewToggleListener(this, this.handleToggleFullView1D);   // (optional) adding a handler for handling zoom panel expand/collapse events   
		this.viewer1D.loadModel('./models/EdinGCA_1D_00010_1_15.json', this.handleModelReady.bind(this))  // Load and display a 1D model and set a callback for any required post load processing  
	}

	handleModelReady() {
		. . .
	}

	handleToggleFullView1D(e) {
		// Add your code in response to the Zoom panel expand/collapse
	}

	handleRoiChange(e) {
		// Add your code in response to ROI changes
	}

	handleModelChange(e) {
		// Add your code in response to ROI changes
	}
		
}
```

## How to install or build  

To install from GitHub

```
npm install git+https://github.com/Comparative-Pathology/GCA_1DViewer.git
```

To build the distribution from source:

Download the [source](https://github.com/Comparative-Pathology/GCA_1DViewer.git) from GitHub   

```
npm run build
```

To add dependent packages (needed once for the first time): 

```
npm install
```


## Acknowledgements and References

GCARenderer was developed for use by the [Gut Cell Atlas Project](https://www.ed.ac.uk/comparative-pathology/the-gut-cell-atlas-project)

Funded by the [Helmsley Charitable Trust](https://helmsleytrust.org/)

