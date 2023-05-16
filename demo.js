/* 
* Sample code for using the GCA 1D model viewer
* Corresponding HTML file: ExampleViewer1D.html
* Dependancies: GCA_1DViewer  
*/
 
import { Viewer1D } from './src/Viewer1D.js';
export { DemoViewer} 

class DemoViewer extends EventTarget {
	constructor (container) {
		super();
		this.viewer1D = new Viewer1D(container);		// Create an instance of the 1D viewer 
		this.viewer1D.addRoiChangeListener(this, this.handleRoiChange);			// (optional) adding a handler for region of interest change events
		this.viewer1D.addModelChangeListener(this, this.handleModelChange);     // (optional) adding a handler for model change events 
		this.viewer1D.addFullviewToggleListener(this, this.handleToggleFullView1D);   // (optional) adding a handler for handling zoom panel expand/collapse events   
		this.container = container;
		this.viewer1D.loadModel('models/EdinGCA_1D_00010_1_17.json', this.handleModelReady.bind(this))  // Load and display a 1D model and set a callback for any required post load processing  
	}

	handleModelReady() {
		this.fullView1D = true;
// API test
		// Collapse zoom panel
//		this.viewer1D.setFullView(false);	// collapse the zoom panel (zoom panel is expanded by default) 
		
		// Set ROI and cursor position
		let roi = {position:400, branch:0, width:300};
		let cursorPos = 500;
		this.viewer1D.setRoi(roi, cursorPos)

/*		
		
		// Change ROI using specific parameters
		this.viewer1D.updateRoi(750, 1, 800);  //(roi centre position, branch index:0/1, roi width)
		
		// Setting a new cursor posititon
		this.viewer1D.setCursorPos(1200);    //cursor position clamped within the  ROI extents
		
		// Change the viewer theme (currently 3 themes available specified by numbers 1, 2, 3)
		this.viewer1D.changeTheme(1);
	
		// Adding a marker to be displayed on the specified position 
		this.viewer1D.addMarker(250, 'testing API', 0);		// (position, description, branch index [0:colon/1:ileum]))

*/			

	}

	handleToggleFullView1D(e) {
		// Add your code in response to the expand/collapse zoom panel event
		this.fullView1D = !this.fullView1D;
		this.container.style.height = this.fullView1D? "400px" : "180px"; 
	}

	handleRoiChange(e) {
		// Add your code in response to ROI changes
	}

	handleModelChange(e) {
		// Add your code in response to ROI changes
	}
		
}
