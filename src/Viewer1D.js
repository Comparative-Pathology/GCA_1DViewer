/**
 * @module Viewer1D
 * @author Mehran Sharghi
 * @export Viewer1D
 * Encapsulates functionality reqired to display viewer for GCA 1D abstract model. 
 * It contains 4 main panels including a title panel which isplayes highlevel information about the model.
 * A acomplete gut linear view with a slder to select the reagion of interest. A foused/zoomed view to 
 * display the region of interset in more detail, and a focused annotation panel to display anatomy/ontology 
 * information in the current region of interest.
 * The viewer is developed based on SVG technology and svgjs as the javascript library. 
 */

import * as Core from './modules/core.js';
import * as Util from './modules/GCA_Utilities.js';

export { Viewer1D };

const WidthLimit = 800;				// Minimum width of the display, smaller window size results in horizontal scrolling
const HeightLimitFullView = 245;	// Minimum height of the display, smaller window size results in vertical scrolling
const HeightLimitTopView = 115;		// Minimum height of the display when only the slider section is displayed 
const buttomMargin = 3.5; 			

if (typeof cssImported === 'undefined') {
	let currentPath = Util.getCurrentScriptPath(1)
    Util.Utility.addStylesheet(currentPath + '/src/modules/GCA_Utilities/external/jquery-ui/jquery-ui.min.css');
    Util.Utility.addStylesheet(currentPath + '/src/modules/GCA_Utilities/src/GCA_Utilities.css');
    Util.Utility.addStylesheet(currentPath + '/src/css/GCA_1DViewer.css'); 
    Util.Utility.addStylesheet(currentPath + '/src/help/help.css'); 
}

/** @class Viewer1D representing GCA model 1D viewer. */
class Viewer1D extends EventTarget {
	/**
	 * Creates an instance of the 1D Viewer. LoadModel should be called to load and display a model.
	 *
	 * @constructor
	 * @param container an HTML container to display the model
	 * @param {number} theme specifies display theme index from a set of predefined themes  
	 * @param {boolean} lr false specifies the direction of linear model display from left to right or right to left 
	 */
	constructor(container, theme, lr ) {
		super();
		this.loadSettings(theme, lr);
		
		
//		this.parent = parent;		
		this.noTitlePanel = true
		this.containersVisible = true;
		this.container = Util.Utility.addElement(container, 'div', 'wraper1D', 'hidden-scroll'); //creating a wrapper div inside the specified container
		Core.Theme.initialize(this.container, this.themeIndex);
		Core.PopupDialogs.initialize(this.container);
		setTimeout(this.setDialogTheme.bind(this), 100); // call the function with a delay to allow stylesheetsbeing loaded
					
		this.margin = 5;
			
		this.container.style.minWidth = WidthLimit+'px';
		this.container.style.height = '100%';
		this.container.style.position = 'relative';
//		this.container.style.background = '#000';
				
		this.titlePanelContainer = Util.Utility.addElement(this.container, 'div', 'title-panel', 'panel-1D');		
		this.sliderPanelContainer = Util.Utility.addElement(this.container, 'div', 'slider-panel', 'panel-1D');		
		this.zoomPanelContainer = Util.Utility.addElement(this.container, 'div', 'zoom-panel', 'panel-1D');		
		this.textPanelContainer = Util.Utility.addElement(this.container, 'div', 'text-panel', 'panel-1D');

		let tabNames = ['Anatomy', 'Uberon', 'Cell Type'];
		this.textTabbedPanel = new Core.TabbedPanel(this.textPanelContainer, 'text-panel', tabNames);
		this.hasDisplayed = false;
		this.listeners = {'1D_roi_changed': [], '1D_model_changed': [], '1D_toggle_full_view' : []};
	}

	/*
	 * Should be used to load a new model to the viewer. It can be called after instantiating the viewer
	 * to load and display a model for the first time or to replace the current model load the in the viewer. 
	 *
	 * @param {string} file The file name and path containing 1D model in XML format. 
	 * @param readyCallback callback function to run when the Viewer is ready
	 */

 	loadModel(modelFile, modelReadyCallback) {
		if(!this.gutCellTypes) {
			this.gutCellTypes = new Core.GutCellTypes();
			this.gutCellTypes.loadJsonCellTypes(null) // or pass an cell types file url
		}	
		if(!this.gutAnatomy) {
			this.gutAnatomy = new Core.GutAnatomy();
			this.gutAnatomy.loadJsonAnatomy(null) // or pass an anatomy file url
			.then( () => this.loadModelFile(modelFile))
			.then( () => modelReadyCallback())
			.catch( err => console.log(`Error laoding model ${err}.`));
		}
		else {
			this.loadModelFile(modelFile)
			.then( () => modelReadyCallback())
			.catch( err => console.log(`Error laoding model ${err}.`));
		}
	}

	loadModelFile(file) {
		this.file = file;
		let type = file.split('.').pop().toUpperCase();
		let message = 'Loading model ...';
		let messageDiv = Util.Utility.htmlToElem(`<div style=" display:flex; justify-content:center; align-items:center;">${message}</div>`);
		this.container.appendChild(messageDiv);
		return 	fetch(this.file)
		.then(response => { if(type === 'XML')
								return response.text()
							else if(type === 'JSON')
								return response.json()
							throw 'Unknown file type!' })
		.then(modelText => {messageDiv.remove(); this.processLoadedModel(modelText, type); })
		.catch(err => messageDiv.innerHtml = (`Error loading model.${err}`));
	}

	/*
	 * Add a listener for roi change event in 1D Viewer. 
	 * A listener should be added before loading a model.  
	 *
	 * @param listener the object that subscribes to receive the event
	 * @param callback the call back method to regster for the event
	 */
	addRoiChangeListener(listener, callback) {
		this.addListener('1D_roi_changed', listener, callback);	
	}
	
	/**
	 * Add a listener for the gut model change in 1D Viewer 
	 * A listener should be added before loading a model.  
	 *
	 * @param listener the object that subscribes to receive the event
	 * @param callback the call back method to regster for the event
	 */
	addModelChangeListener(listener, callback) {
		this.addListener('1D_model_changed', listener, callback);	
	}
	
	/**
	 * Add a listener for toggle full view in 1D Viewer 
	 * A listener shotuld be added before loading a model.  
	 *
	 * @param listener the object that subscribes to receive the event
	 * @param callback the call back method to regster for the event
	 */
	addFullviewToggleListener(listener, callback) {
		this.addListener('1D_toggle_full_view', listener, callback);	
	}

	/**
	 * Remove listeners from the list of liseners subscribed to Viewer1D 
	 *
	 * @param listener the object to unsubscribes from receiving 1D Viewer events.
	 */
	removeListener(listener) {
		let i = this.listeners['1D_roi_changed'].indexOf(listener);
		if(i > -1) {
			this.listeners['1D_roi_changed'].splice(i, 1);
		}	

		i = this.listeners['1D_model_changed'].indexOf(listener);
		if(i > -1) {
			this.listeners['1D_model_changed'].splice(i, 1);
		}	

		i = this.listeners['1D_toggle_full_view'].indexOf(listener);
		if(i > -1) {
			this.listeners['1D_toggle_full_view'].splice(i, 1);
		}	
	}

	/**
	 * Can be used to changed roi postion and width in the 1D viewer 
	 *
	 * @param pos the begining of the new roi position relative to branch 
	 * @param branch the index of the target branch (o:colon, 1: ileum) 
	 * @param width roi/region of interest width if ommited the current roi width is kept.
	 */
	updateRoi(pos, branchIndex, width) {
		if(pos === undefined || pos === null || isNaN(pos)) {
			return;
		}
		this.sliderPanel.updateRoi(pos, branchIndex, width);  //slider will fire events to update zoom & annotation panels
	}

	/**
	 * Can be used to changed roi postion and width in the 1D viewer 
	 *
	 * @param pos the begining of the new roi position relative to branch 
	 */
	setCursorPos(pos) {
		if(pos === undefined || pos === null || isNaN(pos)) {
			return;
		}
		this.sliderPanel.setCursorPos(pos);  //slider will fire events to update zoom & annotation panels
	}


	/**
	 * Return the current ROI (Region Of Interest) 
	 */
	getCurrentRoi() {
		return this.sliderPanel.getRoiExtents();
	}

	/**
	 * Can be used to set a theme  
	 *
	 * @param index index of a predefined theme starting from 0. Modulo operator is used if index is 
	 * greater than the maximum value. If no index is provided the next theme will be selected.   
	 */
	changeTheme(index=null) {
		this.themeIndex = Core.Theme.nextTheme(index);
		this.textTabbedPanel.updateTheme();
		this.setDialogTheme();
		this.redraw();
	}
	
	/**
	 * Specifies whether the 1D viewer display in full view or only the top slider 
	 *
	 * @param {boolean} fullView true value set the display to full view and false only the top slider
	 */
	setFullView(fullView) {
		if(this.fullView != fullView) {
			this.toggleFullView();
		}
	}	

	/**
	 * Add a new marker to the model at the specified position of the gut 
	 *
	 * @param {number} pos specifies the position of the marker
	 * @param {string} description is the marker description
	 * @param {string} branch is an optional parameter to specify the branch where the marker is added
	 */
	addMarker(pos, description, branch) {
		let model = this.gutModel;
		if (branch) {
			model = this.gutModel.getSubModel(branch)
		}
//		if (!model || pos < model.startPos || pos > model.endPos) {
		if (!model || pos < 0 || pos > model.endPos-model.startPos) {
			console.log(`Invalid pos ${pos} in addMarker.`)			
			return; 
		}
		let marker = new Marker(pos, description);
		this.zoomPanel.saveMarker(marker);
	}

	/**
	 * Set region of interest  
	 *
	 * @param {object} roi is used to describe ROI attribues including "position", "width", and "branch"
	 * @param {number} cursor speciies the cursor position, it will be clamped to the ROI extents 
	 */
	setRoi(roi, cursor=null) {
		if (roi != null) {
			this.updateRoi(roi.position, roi.branch, roi.width);
		}
		if (cursor != null) {
			this.setCursorPos(cursor);    //cursor position clamped within the  ROI extentnts
		}
	}

	/**
	 * get minimum height of the viewer   
	 *
	 */
	static getMinimumHeight() {
		return HeightLimitTopView;
	}

	addListener(event, listener, callback) {
		if(this.listeners[event].includes(listener)) 
			return;
		this.listeners[event].push(listener);	
		listener.addEventListener(event, callback.bind(listener));	
	}
 	
	processLoadedModel(model, type) {
		if(type === 'XML') { 
			this.gutModel = Core.Gut.createGutModelFromXml(model);
		}
		else { 
			this.gutModel = Core.Gut.createGutModelFromJson(model);
		}
		this.notifyModelChange();
		this.createPanels();
		new ResizeObserver(this.resize.bind(this)).observe(this.container.parentElement);
	}


	createPanels() {	
		this.titlePanel = new Core.TitlePanel(this.titlePanelContainer, this, this.gutModel);
		
		this.sliderPanel = new Core.SliderPanel(this.sliderPanelContainer, this, this.gutModel, this.absolutePositions, this.lr, this.displayMode);
		
		this.zoomPanel = new Core.ZoomPanel(this.zoomPanelContainer, this, this.gutModel, this.absolutePositions, this.layersVisible, this.lr);
		
		this.annotationPanel = new Core.AnnotationPanel(this.textTabbedPanel.tabContainers[0], this, this.sliderPanel.gutModel, this.absolutePositions, Core.Theme.currentTheme.annotationBkgColor, null);
		this.textTabbedPanel.setTabListener(0, this.annotationPanel, this.annotationPanel.handleTabEvents);

		this.uberonPanel = new Core.UberonPanel(this.textTabbedPanel.tabContainers[1], this);
		this.textTabbedPanel.setTabListener(1, this.uberonPanel, this.uberonPanel.handleTabEvents);

		this.cellTypePanel = new Core.CellTypePanel(this.textTabbedPanel.tabContainers[2], this, this.sliderPanel.gutModel, this.absolutePositions, Core.Theme.currentTheme.annotationBkgColor, null);;
		this.textTabbedPanel.setTabListener(2, this.cellTypePanel, this.cellTypePanel.handleTabEvents);

		this.addEventListener('roi_change', this.handleRoiChange.bind(this)); //fired by Slider panel
		this.addEventListener('region_dragged', this.handleZoomScroll.bind(this));	//fired by Zoom panel
		this.addEventListener('zoom_change_request', this.handleZoomChange.bind(this));
		this.addEventListener('zoom_cursor_change', this.handleZoomCursorChange.bind(this)); //fired by zoom panel
		this.addEventListener('celltype_Tab_Activated', this.handleCelltypeTabActivated.bind(this)); //fired by clicking on the cell type tab
		this.addEventListener('celltype_layers_change', this.handleCelltypeLayersChange.bind(this)); //fired by annotation panel panel-celltype tab
		this.addEventListener('zoom_layers_selection_change', this.cellTypePanel.handleUpdateSelectedLayers.bind(this.cellTypePanel)); //fired by annotation panel panel-celltype tab
	}


	getHeightLimit() {
//		return fullView? this.topHalfHeight : HeightLimitTopView;
		return this.fullView? this.HeightLimitTopView : this.HeightLimitTopView;
	}

	displayModel(sliderStatus=null, branch=0) {
//console.log("===> in displayModel 1D");		

		this.hasDisplayed = true;
		this.titlePanel.draw();
		let x = this.titlePanel.panelWidth - this.margin;
		let y = this.titlePanel.panelHeight / 2;
		this.drawControls(this.titlePanel.ctx, x, y, 2*this.margin);

		this.sliderPanel.updateSliders(sliderStatus);
		if (sliderStatus != null) {
			this.notifyRoiChange(this.sliderPanel.getRoiExtents());
		}
		this.currentBranch = branch;
		if (!this.fullView) {
			return;
		}
		this.zoomPanel.setLeft2Right(this.lr);
		this.zoomPanel.setGutModel(this.sliderPanel.getCurrentGutModel());
		this.zoomPanel.setCurrentBranch(branch);
		this.zoomPanel.setRoi(this.sliderPanel.getRoiExtents());
		this.zoomPanel.drawGut();

		this.annotationPanel.updateRoi(this.sliderPanel.getRoiExtents());
		this.uberonPanel.draw();
		this.cellTypePanel.updateRoi(this.sliderPanel.getRoiExtents());
	}
	

	adjustContainers() {
		this.container.style.height = (this.container.parentElement.clientHeight - 50) + 'px'; //to avoid any possible scroll bar befor adjusting dimensions
		this.container.style.width = (this.container.parentElement.clientWidth - 50) + 'px';
		
		let minHeight = this.fullView? HeightLimitFullView : HeightLimitTopView - Math.round(buttomMargin / 2);
		let height = Math.max(minHeight, this.container.parentElement.clientHeight - .5);	 //-.5 is to avoid unnecessary vertical scroll bar due to fractional height


		this.container.style.height = height + 'px';


//console.log("1--->" + height + " === " + this.container.style.height + " ----> " +  this.container.parentElement.clientHeight+ " #### "+ minHeight);
		let width = Math.max(WidthLimit, this.container.parentElement.clientWidth); 
		this.container.style.width = width + 'px';


		if (!this.fullView) {
			height *= 100 /46; //assuming top half is 45%
		}
		let topMargin = this.margin * (this.noTitlePanel? 2 : 3)
		let th = Math.round(.46 * height - topMargin);
		let h1 = Util.clamp(Math.round(0.1*height), 14, 60);
//		let h1 = Math.max(14, Math.round(0.1*height));
//		let h2 = Math.max(55, Math.round(0.35*(height-topMargin)));
		let h2 = Math.max(74, th - h1);
		height = Math.round(height);
		this.topHalfHeight = h1 + h2 + topMargin;

		let h3 = Math.max(120, height - this.topHalfHeight - this.margin);
		
		this.fullHeight = height;
		
		let panelWidth = width - 2*this.margin;

		if(this.noTitlePanel) {
			this.titlePanel.setStraigthCorner('buttom');
			this.sliderPanel.setStraigthCorner('top');
		}
		else {
			this.titlePanel.removeStraigthCorner();
			this.sliderPanel.removeStraigthCorner();
		}

		this.titlePanel.setContainerSize(panelWidth, h1, this.margin, this.margin);

		if(this.noTitlePanel) {
			this.sliderPanel.setContainerSize(panelWidth, h2, this.margin, h1+this.margin);
		}
		else {
			this.sliderPanel.setContainerSize(panelWidth, h2, this.margin, h1+2*this.margin);
		}

		if (!this.fullView) {
			return;
		}

//		panelWidth = .3*width - this.margin;
		panelWidth = Util.clamp(.3*width, 300, 420) - this.margin;
		this.textTabbedPanel.setContainerSize(panelWidth, h3, width-panelWidth-this.margin, this.topHalfHeight);

//		panelWidth = .7*width - 2*this.margin;
		panelWidth = width - panelWidth - 3*this.margin;
		this.zoomPanel.setContainerSize(panelWidth, h3, this.margin, this.topHalfHeight);

		this.annotationPanel.setContainerSize(this.textTabbedPanel.panelWidth, this.textTabbedPanel.panelHeight);
		this.uberonPanel.setContainerSize(this.textTabbedPanel.panelWidth, this.textTabbedPanel.panelHeight);
		this.cellTypePanel.setContainerSize(this.textTabbedPanel.panelWidth, this.textTabbedPanel.panelHeight);

	}

	toggleNoTitle() {
		this.noTitlePanel = ! this.noTitlePanel;
		this.redraw();
	}

	
	resize() {
//		console.log('1D resize');		
		let currentRoi = this.sliderPanel.getSlidersStatus();
		if(this.hasDisplayed) {
			this.clearPanels();
			this.setContainersVisibility(false);
		}
		this.adjustContainers();
		this.setContainersVisibility(true);
		this.displayModel(currentRoi, this.currentBranch);
	}
	
	setContainersVisibility(visible) {
		if (this.containersVisible == visible)
			return;
		this.titlePanel.setPanelVisibility(visible);
		this.sliderPanel.setPanelVisibility(visible);
		if(!visible || this.fullView) {
			this.textTabbedPanel.setVisible(visible);
			this.zoomPanel.setPanelVisibility(visible);
		}	
		this.containersVisible = visible;
	}
	
	clearPanels(){
		if(!this.hasDisplayed) 
			return;
			
		this.titlePanel.clear();
		this.sliderPanel.clear();
		this.zoomPanel.clear();
		this.annotationPanel.clear();
		this.uberonPanel.clear();
		this.cellTypePanel.clear();
	}
	
	redraw() {	
//		console.log('1D redraw');		
		let currentRoi = this.sliderPanel.getSlidersStatus();
		this.clearPanels();
		this.zoomPanel.setPanelVisibility(this.fullView);
		this.textTabbedPanel.setVisible(this.fullView);
		if(this.fullView) {
			this.textTabbedPanel.updateTheme();
		}
		
		this.adjustContainers();
		this.displayModel(currentRoi, this.currentBranch);
	}


	drawControls(ctx, x, cy, gap) {
		let d = 22;
		let r = d;
		let c = x - r
						
		let img = this.fullView? 'double-arrow-top.svg' : 'double-arrow-bottom.svg';
//		img = this.fullView? 'line-angle-up.svg' : 'line-angle-down.svg';
		let tooltip = (this.fullView? 'Hide' : 'Show') + ' zoom view';
		Core.UtilityViewer1D.showIcon(ctx, img, d, c, cy, tooltip, 0.75).on('click', this.toggleFullView.bind(this));
/*
		img = 'theme-change.svg';
		c -= r + gap;
		Core.UtilityViewer1D.showIcon(ctx, img, d, c, cy, 'Change theme').on('click', this.toggleTheme.bind(this));

		img = 'left-right.svg';
		c -= r + gap;
		Core.UtilityViewer1D.showIcon(ctx, img, d, c, cy, 'Toggle left-to-right display of the model').on('click', this.toggleL2R.bind(this));

		if(this.fullView) {
			img = 'colon.svg';
			c -= r + gap;
			Core.UtilityViewer1D.showIcon(ctx, img, d, c, cy, 'show layers').on('click', this.toggleLayers.bind(this));
		}
*/		

		c -= r + gap;
		img = 'left-right-arrow.svg';
		Core.UtilityViewer1D.showIcon(ctx, img, d, c, cy, 'Change ROI', 0.88).on('click', this.sliderPanel.openRoiDialog.bind(this.sliderPanel));


		img = 'settings-gear.svg';
		c -= r + gap;
		Core.UtilityViewer1D.showIcon(ctx, img, d, c, cy, 'Settings', 0.88).on('click', this.openSettingsDialog.bind(this));

		img = 'help.svg';
		c -= r + gap;
		Core.UtilityViewer1D.showIcon(ctx, img, d, c, cy, 'Help').on('click', this.showHelp.bind(this));

/*
		img = 'colon.svg';
		c -= r + gap;
		Core.UtilityViewer1D.showIcon(ctx, img, d, c, cy, 'save markers').on('click', this.saveMarkers.bind(this));
*/		
	}
	

	changeZoomedViewGutModel(gutModel) {
		if (this.zoomPanel == undefined || this.zoomPanel == null || !this.zoomPanel.isAvailable)
			return;
		this.zoomPanel.setGutModel(gutModel);
		if (gutModel.branch != null)
			this.zoomPanel.setCurrentBranch(gutModel.branch);
		this.annotationPanel.setGutModel(gutModel);
		this.cellTypePanel.setGutModel(gutModel);

/*			
		this.zoomPanel.updateRoi(this.sliderPanel.getRoiExtents());
		this.annotationPanel.updateRoi(this.sliderPanel.getRoiExtents());
		this.cellTypePanel.updateRoi(this.sliderPanel.getRoiExtents());
*/		
	}

	notifyModelChange() {
		let detail = new Object();
		detail.start = this.gutModel.getStartPos();
		detail.end = this.gutModel.getEndPos();
/*		
		let landmarks = new Array();
		for (let landmark of this.gutModel.landmarks) {
			landmarks.push( {id: landmark.id, name: landmark.title, position: landmark.position, branch: landmark.branch} );
		}
*/				
		detail.landmarks = this.gutModel.landmarks;
		let e = new CustomEvent('1D_model_changed', {cancelable: true, detail: detail});
//		console.log(JSON.stringify(detail));
		this.notifyListeners(e);
	}

	toggleFullView(ev) {

		// Hidden control to change title display in a separate panel 
		if(ev && ev.ctrlKey && ev.shiftKey){ this.toggleNoTitle();return} 
		
		this.fullView = ! this.fullView;
		let e = new CustomEvent('1D_toggle_full_view', {cancelable: true});
		this.notifyListeners(e);
		this.redraw()	// ? this is not needed if notifyListeners changes the container size and hence it cuases a resize and redraw
	}
	
	toggleTheme() {
		this.changeTheme();
	}
	
	toggleL2R() {
		this.lr = !this.lr;
		this.sliderPanel.toggleLR();
		if(this.fullView) {
			this.zoomPanel.toggleLR();
		}
	}
	
	toggleLayers() {
		this.zoomPanel.toggleLayersVisible();
		this.layersVisible = !this.layersVisible;
	}
	
	handleRoiChange(e) {
		e.preventDefault();
		if(this.fullView) {
			this.zoomPanel.updateRoi(e.detail);
			this.annotationPanel.updateRoi(e.detail);
			this.cellTypePanel.updateRoi(e.detail);
		}
		this.notifyRoiChange(e.detail);
	}
	
	handleZoomScroll(e) {
		e.preventDefault();
		this.sliderPanel.setRoiPos(e.detail.pos);
		this.sliderPanel.setCursorPos(e.detail.cursorPos);
		this.annotationPanel.updateRoi(e.detail);
		this.cellTypePanel.updateRoi(e.detail);
		this.notifyRoiChange(e.detail);
	}
	
	handleZoomChange(e) {
		e.preventDefault();
		this.sliderPanel.handleZoomChangeRequest(e.detail);  //slider will fire events to update zoom & annotation panels
	}
	
	
	handleZoomCursorChange(e) {
		e.preventDefault();
		this.sliderPanel.setCursorPos(e.detail.cursorPos);
		this.notifyRoiChange(e.detail);
	}
	
	handleCelltypeTabActivated(e) {
		e.preventDefault();
		this.zoomPanel.setSelectableLayers(e.detail);
	}
	
	handleCelltypeLayersChange(e) {
		e.preventDefault();
		this.zoomPanel.setActiveLayers(e.detail);
	}
	
	notifyRoiChange(roi) {
		roi.offset = this.sliderPanel.getCurrentGutModel().startPos;
		roi.branch = this.getActiveBranch();
		let e = new CustomEvent('1D_roi_changed', {cancelable: true, detail: roi});
		this.notifyListeners(e);
	}
	
	showTooltip(e) {
		let evt = e.detail.evt;
		let x = evt.pageX;
		let y = evt.pageY;
		this.tooltip.innerHTML = e.detail.text;
		this.tooltip.style.display = "block";
		this.tooltip.style.left = x + 1 + 'px';
		this.tooltip.style.top = y - 32 + 'px';
	}

	hideTooltip() {
		this.tooltip.style.display = "none";
	}

	initTooltip() {
		let div = document.createElement('div');
		div.id = 'tooltip';
//		div.style = {position: 'absolute', display: 'none'};
		div.style.display = 'none';
		div.style.position = 'absolute'
		this.container.appendChild(div);
		this.tooltip = div;
	}

	notifyListeners(e) {
		for(let listener of this.listeners[e.type]) {
			listener.dispatchEvent(e);
		}
	}
	
	getContainer = () => this.container;
	
	getActiveBranch = () => {
		if (this.sliderPanel.mode === 'overlap') {
			return (this.zoomPanel.currentBranch == 0)? 0 : 2;  //0:'colon' : 2:'both';   
		}
		return (this.sliderPanel.currentSlider == 0)? 0 : 1;  //0:'colon' : 1:''ileum'';
	}

	saveMarkers(name, markers) {
		markers = this.gutModel.markers; 
		if (typeof(Storage) === "undefined") {
			alert('Markers could not be saved!');
		}
/*		
		let existingMarkers = localStorage.getItem('GCA_Markers_' + name);
		if (existingMarkers) {
			alert(`Markers with name {$name} already exist!\nchoose a differnt name.`);
			return;
		}
		*/
		localStorage.setItem('GCA_Markers_' + name, JSON.stringify(markers));
	}
	
	retreiveMarkers (name) {
		if (typeof(Storage) === "undefined") {
			alert('Markers could not be saved!');
		}
		let markers = localStorage.getItem('GCA_Markers_' + name);
		this.gutModel.markersList = markers? JSON.parse(markers) : null;
		this.zoomPanel.redraw();
//		return markers? JSON.parse(markers) : null;
	}
	
	clearMarkers (name) {
		if (typeof(Storage) === "undefined") {
			let markers = localStorage.getItem('GCA_Markers_' + name);
			if(markers) {
				localStorage.removeItem(name);
			}
		}
		this.gutModel.clearMarkers();
		this.zoomPanel.redraw();
//		return markers? JSON.parse(markers) : null;
	}

	showHelp(e) {
		Core.PopupDialogs.helpPopup.open(e.target); // '<label>Help Content</label>');
	}

	openSettingsDialog(e){
		let status = { themeIndex: 	this.themeIndex, 
					   lr:			this.lr, 
					   showLayers:	this.zoomPanel.layersVisible, 
					   displayMode:	this.displayMode,
					   positions:	this.absolutePositions,					
					   zoomVisible: this.zoomVisibleByDefault
					}
		Core.PopupDialogs.settingsDialog.open(status, this.saveSettings.bind(this), e.target);
	}

	saveSettings(status) {
		let redrawFlag = false;
		
		if(this.themeIndex != status.themeIndex) { 
			Core.Theme.setTheme(status.themeIndex);
			this.themeIndex = status.themeIndex;
			this.setDialogTheme();
			redrawFlag = true;
		}
		
		if(this.absolutePositions != status.positions) {
			this.absolutePositions = status.positions;
			this.sliderPanel.absolutePositions = status.positions;
			this.zoomPanel.absolutePositions = status.positions;
			this.annotationPanel.absolutePositions = status.positions;
			this.cellTypePanel.absolutePositions = status.positions;
			redrawFlag = true;
		}

		if (this.lr != status.lr) {
			this.toggleL2R();
			redrawFlag = false;
		}

		if(this.zoomPanel.layersVisible != status.layersVisible) {
			this.toggleLayers();
			redrawFlag = false;
		}

		if(this.displayMode != status.displayMode) {
			this.displayMode = status.displayMode
			this.sliderPanel.setDisplayMode(status.displayMode);
			redrawFlag = true;			
		}
		
		
		this.zoomVisibleByDefault = status.zoomVisible;
		
		if(redrawFlag) {
			this.redraw();
		}
		
		this.storeSettings()	
	}

	loadSettings(theme, lr) {
		this.fullView = true;
		this.layersVisible = true;
		this.zoomVisibleByDefault = true;
		this.absolutePositions = true;
		if(!window.localStorage) {
			this.themeIndex = (theme == undefined)? 0 : theme;
			this.lr = (lr == undefined)? false : lr;
			return;
		}
		let savedLr = localStorage.getItem("LR");
		let savedTheme = localStorage.getItem("Theme");
		let savedZoomVisible = localStorage.getItem("ZoomVisible");
		let savedLayers = localStorage.getItem("Layers");
		let savedPositions = localStorage.getItem("AbsolutePositions");
		let savedDisplayMode = localStorage.getItem("DisplayMode");
		
		this.themeIndex = (theme == undefined)? ((savedTheme!='undefined' && savedLayers !== null)? Number(savedTheme) : 0) : theme;
		this.lr = (lr == undefined)? (savedLr!='undefined' && savedLr!==null)? (savedLr=='true') : false : lr;
		if (savedZoomVisible !== 'undefined' && savedZoomVisible !== null) { 
			this.fullView = this.zoomVisibleByDefault = savedZoomVisible=='true';
			this.z = savedZoomVisible=='true';
		}
		if (savedLayers !== 'undefined' && savedLayers !== null) {
			this.layersVisible = savedLayers=='true';
		}

		if (savedPositions !== 'undefined' && savedPositions !== null) {
			this.absolutePositions = savedPositions=='true';
		}

		if (savedDisplayMode !== 'undefined' && savedDisplayMode !== null) {
			this.displayMode = savedDisplayMode;
		}

	}
	
	storeSettings() {
		if(!window.localStorage) {
			return;
		}
		localStorage.setItem("LR", this.lr);
		localStorage.setItem("Theme", this.themeIndex);
		localStorage.setItem("Layers", this.layersVisible);
		localStorage.setItem("ZoomVisible", this.zoomVisibleByDefault);
		localStorage.setItem("AbsolutePositions", this.absolutePositions);
		localStorage.setItem("DisplayMode", this.displayMode);
		
	}
	
	setDialogTheme() {
		Util.PopupDialog.setDialogTheme(Core.Theme.currentTheme.annotationBkgColor, 
										Core.Theme.currentTheme.titleFontName.fill,
										Core.Theme.currentTheme.borderColor);
	}
	
}
