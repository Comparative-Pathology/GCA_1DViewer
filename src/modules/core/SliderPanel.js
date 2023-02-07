/**
 * @module SliderPanel
 * @author Mehran Sharghi
 * @export SliderPanel
 * Provide horizontal slider for GCA 1D abstract model Viewer. The panel can contain multiple sliders depending
 * the number of branches in the gut model.  
 * The module exports a class that is being used by Viewer1D module. It also conatins an internal class Slider 
 * which represents a single slider. Slider panel and its contained sliders are  developed using SVG technology 
 * and svgjs as the javascript library. 
 */

import { ViewTransform, UtilityViewer1D } from './Utility.js'
import { clamp, Utility } from '../GCA_Utilities/src/GCA_Utilities.js'
import { DisplayPanel } from './DisplayPanel.js'
import { Theme } from './Theme.js'
import { PopupDialogs } from './PopupDialogs.js';

export { SliderPanel };

const MinZoomLength = 1; 
/** @class SliderPanel representing slider panel for GCA 1D viewer. It used slider vclass to display individual 
 * slider in multi branch gut models
 */
class SliderPanel extends DisplayPanel{
	/**
	 * Creates an instance of zoom panel.  
	 *
	 * @constructor
	 * @param {object} parent represents the parent object for the panel which is usually an instance of Viewer1D
	 * @param {object} model gut 1D model  
	 * @param {number} height height of the panel
	 * @param {number} vOffset vertical offset of the panel
	 * @param {boolean} lr false specifes the direction of linear model display from left to right or right to left 
	 */
	constructor(container, parent, model, absolutePositions=true, lr = false) {
		super(container, parent, model, 'sliderBkgColor');
		this.lr = lr;
		this.sliderGap = 5;
		this.mode = 'full';
		this.absolutePositions = absolutePositions;
	}

	initializePanel() {
		this.mode = 'full';
	}

	initializeSliders() {
		this.sliders = new Array();
		let mainModel = this.gutModel.getSubModel(0); //'colon'
		let ileumModel = this.gutModel.getSubModel(1, 0);  // 'ileum'';
		let offset = 5;
		let width = this.panelWidth - offset;
		if (this.mode=='main' || this.mode=='ext' || ileumModel == null || this.mode == 'overlap') {
//			let model = (this.mode=='overlap')? this.gutModel : mainModel;
			let model = (this.mode=='overlap')? this.gutModel : (this.mode=='main')? mainModel : ileumModel;
			this.sliders[0] = new Slider(0, this, model, this.absolutePositions, width, this.lr? 0 : -offset, this.ctx.height());
			this.currentSlider = 0;
		}
		else {
			let l1 = mainModel.getLength();
			let l2 = ileumModel.getLength();
			let extModelScale = (l2 < .35*l2)? 1 : .33* l1 / l2
			
			let length = mainModel.getLength() + ileumModel.getLength() * extModelScale;
			let w = width; //- this.sliderGap
//			let h1 = Math.max(0.50 * this.ctx.height(), 40);
//			let h2 = Math.max(0.48 * this.ctx.height(), 40);
			let h1 = 0.50 * this.ctx.height();
			let h2 = 0.48 * this.ctx.height();
			let vGap = Math.min(this.ctx.height() - h1 - h2, 50); 

//			this.sliders[0] = new Slider(0, this, mainModel, w1, this.lr? 0 :-w2-this.sliderGap - offset, h1);
			this.sliders[0] = new Slider(0, this, mainModel, this.absolutePositions, width, this.lr? 0 : -offset, h1);
//			this.sliders[1] = new Slider(1, this, ileumModel, w, this.lr? 0 :-this.sliderGap-offset, h2, h1-1);
			this.sliders[1] = new Slider(1, this, ileumModel, this.absolutePositions, w, this.lr? 0 :-offset, h2, h1+vGap);
		}
	}

/*
	initializeSliders() {
		this.sliders = new Array();
		let mainModel = this.gutModel.getSubModel(0); //'colon'
		let extModel = this.gutModel.getSubModel(1, 0);  // 'ileum'';
		let ileumModel = extModel; //this.gutModel.getSubModel('ileum', 0);
		let showExpandBtn = ((this.mode == 'main' || this.mode == 'full') && extModel != null);
		let showOverlapBtn = extModel != null;
		let iconSize = (showExpandBtn || showOverlapBtn)? 20 : 0;
		let offset = iconSize + 5;
		let width = this.panelWidth - offset;
		if (this.mode=='main' || extModel == null || this.mode == 'overlap') {
			let model = (this.mode=='overlap')? this.gutModel : mainModel;
			this.sliders[0] = new Slider(0, this, model, width, this.lr? 0 : -offset, this.ctx.height());
			this.currentSlider = 0;
		}
		else {
			let l1 = mainModel.getLength();
			let l2 = extModel.getLength();
			let extModelScale = (l2 < .35*l2)? 1 : .33* l1 / l2
			
			let length = mainModel.getLength() + extModel.getLength() * extModelScale;
			let w = width; //- this.sliderGap
			let w1 = mainModel.getLength() * w / length;
			let w2 = extModel.getLength() * w / length * extModelScale;
//			let h1 = Math.max(0.50 * this.ctx.height(), 40);
//			let h2 = Math.max(0.48 * this.ctx.height(), 40);
			let h1 = 0.50 * this.ctx.height();
			let h2 = 0.48 * this.ctx.height();
			let vGap = Math.min(this.ctx.height() - h1 - h2, 50); 

//			this.sliders[0] = new Slider(0, this, mainModel, w1, this.lr? 0 :-w2-this.sliderGap - offset, h1);
			this.sliders[0] = new Slider(0, this, mainModel, width, this.lr? 0 : -offset, h1);
//			this.sliders[1] = new Slider(1, this, ileumModel, w, this.lr? 0 :-this.sliderGap-offset, h2, h1-1);
			this.sliders[1] = new Slider(1, this, ileumModel, w, this.lr? 0 :-offset, h2, h1+vGap);
		}
		if(showOverlapBtn) {
			this.addControlButtons(width, iconSize, showExpandBtn);
		}
	}
*/

//*************************************************************** */
//*************************************************************** */
	updateRoiSize(src){
		let width = src.value;
		if(isNaN(width)){ // invalid input
			return;
		}
		width = Math.round(width);
 
		let maxZoomLength = this.sliders[this.currentSlider].gutModel.getLength()
		if(width < MinZoomLength || width > maxZoomLength) { // invalid input 
			return;
		}
		let w = this.sliders[this.currentSlider].roiWidth;
		this.sliders[this.currentSlider].updateRoiWidth(width);
		let newWidth = this.sliders[this.currentSlider].roiWidth;
//		src.value = newWidth
		if (w != newWidth) {
			this.sliders[this.currentSlider].dispatchRoiChange();
		}
	}
	
	openRoiDialog(){
		let roi = this.getRoiExtents();
//		roi.branchIndex = (this.mode == 'full')? this.currentSlider : -1;
		roi.branchIndex = this.currentSlider;
		
		let branches = []
		branches[0] = {name: 'Colon', length: this.sliders[0].gutModel.getLength(), model: this.sliders[0].gutModel}
		if(this.mode == 'full') {
			branches[1] = {name: 'Ileum', length: this.sliders[1].gutModel.getLength(), model: this.sliders[1].gutModel}
		}
//		PopupDialogs.roiDialog.open(roi, this.setRoi.bind(this), branches, MinZoomLength, MaxZoomLength);
//		let maxZoomLength = this.sliders[this.currentSlider].gutModel.getLength()
		if(this.absolutePositions) {
			PopupDialogs.roiDialog.open(roi, this.setRoi.bind(this), branches, this.absolutePositions);
		}
		else {
			PopupDialogs.roiDialogRelative.open(roi, this.setRoi.bind(this), branches, this.absolutePositions);
		}

	}

	setRoi(roi){
		this.updateRoi(roi.pos, roi.branchIndex, roi.width, roi.cursorPos);
		if(roi.branchIndex != this.currentSlider) {
			this.setCurrentSlider(roi.branchIndex)
//			this.parent.changeZoomedViewGutModel(this.sliders[sliderIndex].gutModel);
		}
/*		
		let newRoi = this.getRoiExtents();
//		newRoi.branchIndex = (this.mode == 'full')? this.currentSlider : -1;
		newRoi.branchIndex = this.currentSlider;
		PopupDialogs.roiDialog.refresh(newRoi)
*/		
	}

	
//*************************************************************** */
//*************************************************************** */
//*************************************************************** */
//*************************************************************** */
	addControlButtons(width, size, expandBtn) {
		let margin = 1//this.parent.ctx.margin;
		let cx = this.lr? width - margin + size/2 : margin + size/2;
		let gap = (this.panelHeight - 3*size)/4;
		let cy = gap + size/2;

		let img = ((this.mode === 'main') ^ this.lr)? 'double-arrow-left.svg' : 'double-arrow-right.svg';
		if (expandBtn) {
			let tooltip = (((this.mode === 'main') ^ this.lr)? 'Show' : 'Hide') + ' small intestine';
			UtilityViewer1D.showIcon(this.ctx, img, size, cx, cy, tooltip, 0.75).on('click', this.toggleExtension.bind(this));
		}

		cy += gap + size; 
		img = 'overlap-view.svg';
		UtilityViewer1D.showIcon(this.ctx, img, size, cx, cy, 'Toggle overlap view', 0.88).on('click', this.toggleOverlap.bind(this));

		cy += gap + size; 
		img = 'left-right-arrow.svg';
		UtilityViewer1D.showIcon(this.ctx, img, size, cx, cy, 'Change ROI', 0.88).on('click', this.openRoiDialog.bind(this));
	}

	drawSliders(slidersStatus) {
		let rois = [];
		this.currentSlider = 0;
		if (slidersStatus != null) {
			this.mode = slidersStatus.displayMode;
			if (this.mode === 'main') {
				rois[0] = slidersStatus.rois[0];
			}
			else if(this.mode === 'ext') {
				rois[0] = slidersStatus.rois[1];
			}
			else {						
				rois = slidersStatus.rois;
			}
			this.currentSlider = slidersStatus.currentSlider;
		}	
		this.initializeSliders()
		let i=0;
		for(let slider of this.sliders) {
			slider.redraw(rois[i]||null);
			i++;
		}			
		this.setCurrentSlider(this.currentSlider);
	}

	getSlidersStatus() {
		if (!this.sliders)
			return null;
		let rois = this.status? this.status.rois : null;
		if(!rois) {
			rois = []
		}
		
		for(let i=0; i<this.sliders.length; i++) {
			if(i==0 && this.display == 'ext') {
				rois[1] = this.sliders[i].getRoiuExtents();l
				break
			}
			rois[i]	= this.sliders[i].getRoiExtents();
		}
			
		return {displayMode: this.mode, currentSlider: this.currentSlider, rois: rois};
	}
	
	getCurrentSlider(){
		return this.sliders[this.currentSlider];	
	}
	
	getRoiExtents(){
		return this.sliders[this.currentSlider].getRoiExtents();	
	}
	
	updateRoi(pos, branchIndex, width=null, cursorPos=null) {
		let newPos = pos;
		if(branchIndex != undefined && branchIndex != null && branchIndex != this.currentSlider) {
			if(this.mode == 'overlap') {
				if (branchIndex > 0 && pos != null) {
					newPos += this.gutModel.getSubModel(1, 0).startPos;   //ileum
				}
			}
			else {
				if(this.mode == 'main' && branchIndex > 0) {
					this.toggleExtension();
				}
				this.setCurrentSlider(branchIndex);
			}
		}
		let w = width || this.sliders[this.currentSlider].getRoiExtents().width;
		if (width && (width != this.sliders[this.currentSlider].getRoiExtents().width)) {
			this.sliders[this.currentSlider].updateRoiWidth(width);
			if(newPos == null) {
				this.sliders[this.currentSlider].dispatchRoiChange();
			}
		}
		if(newPos != null) {
//			this.updateRoiPos(newPos - w / 2, newPos);
			let newCursorPos = cursorPos ||  (newPos + w/2)
			this.updateRoiPos(newPos, newCursorPos);
		}
	}

	updateRoiPos(pos, cursorPos) {  //set ROI and cursor position and notifies other zoom and annotation panel, if cursorPos omitted it sets in the middle of ROI
		return this.sliders[this.currentSlider].updateRoiPos(pos, cursorPos);
	}
	
	setRoiPos(pos, cursorPos=null) {
		return this.sliders[this.currentSlider].setRoiPos(pos, cursorPos);
	}
	
	setCursorPos(pos) {
//		let extents = this.sliders[this.currentSlider].getRoiExtents()
//		let newPos = clamp(pos, extents.pos, extents.pos+extents.width) 
		return this.sliders[this.currentSlider].setCursorPos(pos);
	}
	
	setCurrentSlider(sliderIndex) {
		if (sliderIndex != this.currentSlider) {
			this.sliders[this.currentSlider].diactivateRoi();
			this.currentSlider = sliderIndex;
		}	
		this.sliders[sliderIndex].activateRoi();
		this.parent.changeZoomedViewGutModel(this.sliders[sliderIndex].gutModel);
/*		
		if(this.status) {
			this.status.rois[sliderIndex] = this.sliders[sliderIndex].getRoiExtents();
		}
*/
	}

	getCurrentGutModel() {
		return this.sliders[this.currentSlider].gutModel;
	}
	
	handleZoomChangeRequest(e) {
		this.sliders[this.currentSlider].handleZoomChangeRequest(e);
	}
	
	toggleExtension(){
		if(this.mode === 'main') 
			this.mode = 'full';
		else { 
			this.mode = 'main';
			this.currentSlider = 0;
		}
		this.status = this.getSlidersStatus();	
		this.redraw();
	}

	toggleOverlap(){
		let status = this.getSlidersStatus();	
		status.displayMode = (this.mode === 'overlap')? 'full' : 'overlap';
		if(this.mode === 'overlap') {
			let roiShares = SliderPanel.findRoiShares(status.rois[status.currentSlider], this.gutModel);
			status.currentSlider = (roiShares.main >= roiShares.ext)? 0 : 1; 
			if (status.currentSlider > 0) {
				status.rois[1] = status.rois[0];
				let posOffset =  this.gutModel.getSubModel(1).startPos;  //ileum
				status.rois[1].pos -= posOffset;
				status.rois[1].cursorPos -= posOffset;
			}
		}
		else {
			if (status.currentSlider > 0) {
				status.rois[0] = status.rois[1];
				status.rois[0].pos += this.getCurrentGutModel().startPos;
				status.rois[0].cursorPos += this.getCurrentGutModel().startPos;
			}
		}
		this.status = status;
		this.redraw();
		this.sliders[this.currentSlider].dispatchRoiChange();   // Refresh the zoom panel (this needed when the zoom panel diplayes an overlapping section)
	}

	updateDisplay(mode) {
		if (this.mode == mode) {
			return;
		}
		let status = this.status || this.getSlidersStatus();	
		status.displayMode = mode;
		if (mode === 'overlap') {
			if (status.currentSlider > 0) {
				status.rois[0] = status.rois[1];
				status.rois[0].pos += this.getCurrentGutModel().startPos;
				status.rois[0].cursorPos += this.getCurrentGutModel().startPos;
			}
			this.sliders[this.currentSlider].dispatchRoiChange();   // Refresh the zoom panel (this needed when the zoom panel diplayes an overlapping section)
		}
		else {
			if (this.mode === 'overlap') {
				let roiShares = SliderPanel.findRoiShares(status.rois[status.currentSlider], this.gutModel);
				status.currentSlider = (roiShares.main >= roiShares.ext)? 0 : 1; 
				if (status.currentSlider > 0) {
					status.rois[1] = status.rois[0];
					let posOffset =  this.gutModel.getSubModel(1).startPos;  //ileum
					status.rois[1].pos -= posOffset;
					status.rois[1].cursorPos -= posOffset;
				}
			}			
			if(mode === 'full') {
//				status.currentSlider = 0; 
			}
			
			if(mode === 'main') {
				status.currentSlider = 0;
			}
			if(mode === 'ext') { 
				status.currentSlider = 0;
			}
		}
		
		this.status = status;
		this.redraw();
	}

	getDisplayModeIndex() {
		return (this.mode === 'full')? 0 : (this.mode === 'overlap')? 3 : (this.mode === 'main')? 1 : 2; 
	}

	setDisplay(displayMode) {
		switch(displayMode) {
			case 0:	// diplay colon & ileum separately
				this.updateDisplay('full')
				break;
			case 1: // diplay colon alone 
				this.updateDisplay('main')
				break;		
			case 2: // diplay ileum alone 
				this.updateDisplay('ext')
				break;
			case 3: // diplay colon & ileum overlapping
				this.updateDisplay('overlap')
				break;
		}
	}

	static findRoiShares(roi, model) {
		let extensionMin = roi.pos + roi.width;
		let mainMax = model.getLength(0);  // colon 
		for(let region of model.regions) {
			if(region.branch === 1 && region.startPos < extensionMin)    
				extensionMin = region.startPos;
		}
		let extensionSide = Math.max(0, roi.pos + roi.width - Math.max(extensionMin, roi.pos));
		let mainSide = Math.max(0, Math.min(mainMax, roi.pos + roi.width) - roi.pos);
		return {main: mainSide, ext: extensionSide}	
	}
		
	drawPanel() {
		this.drawSliders(this.status);
	}
	
	updateSliders(status){
//		let currentStatus = this.status; 
		this.status = status || this.getSlidersStatus();
		this.drawSliders(this.status);
	}

	toggleLR() {
		this.lr = !this.lr
		this.redraw();
	}
}

/*******************************************************************************/
/** @class Slider representing a single slider for GCA 1D viewer. 
********************************************************************************/
class Slider {
	/**
	 * Creates an instance of slider 
	 *
	 * @constructor
	 * @param {number} index a integer specifyin the slider in the slider panel
	 * @param {object} parent represents the parent object for the panel which is usually an instance of Viewer1D
	 * @param {object} model gut 1D model  
	 * @param {boolean} absolutePositions specifes the display of positions being absolute values from the model statr or relative to the model regions   
	 * @param {number} width width of the slider
	 * @param {number} hOffset horizontal offset of the slider to position the slider
	 */
	constructor(index, parent, model, absolutePositios=true, width, hOffset, height, vOffset=0) {
		this.index = index;
		this.parent = parent
		this.gutModel = model;
		this.absolutePositions = absolutePositios
		this.lr = parent.lr;
		this.ctx = this.parent.ctx;
		this.initializeSlider(width, hOffset, height, vOffset);
		this.isRoiActive = false;
	}

	initializeSlider(width, hOffset, height, vOffset) {
		let posOffset = this.gutModel.getStartPos();
		this.ctx.on('wheel', this.handleMouseWheel.bind(this));
		this.transform = new ViewTransform(width, this.gutModel.getLength(), this.lr, posOffset, 10, hOffset);
		this.setVerticalPositions(height, vOffset);
	}

	setVerticalPositions(height, vOffset=0) {
		this.gutThickness = 5;
		this.trackDisplacement = this.gutModel.parent? 0 : 2;   
		let t = this.ctx.text('lp');
		this.txtHeight = t.font(Theme.currentTheme.posFont).addClass('small-text').bbox().height - 2;
		let space = Math.max(0, height - this.gutThickness - this.trackDisplacement - 4*this.txtHeight - 8)
		if (space > 0) {
			let adj = Math.min(0.5*space, .25*height-this.gutThickness);  //If there is space increase the gutTickness upto 25% of the height
			this.gutThickness += adj; 
			if (this.trackDisplacement > 0){
				let adj2 = Math.min(0.1*space, .08*(height-this.trackDisplacement))  //If there is space increase the trackDisplacemnet upto 8% of the height
				this.trackDisplacement += adj2;   
				space -= adj2;
			}
			space -= adj;
		}
		
		let t2 = this.gutThickness / 2;
		
		let r = (space < 10)? space-1 : 9.1*Math.log1p(0.3*space) 
		let tickHeight = 1 + .35*r;
		let s1 = 0.05*r;
		let s2 = 0.15*r; 

		this.base = t2 + this.trackDisplacement + this.txtHeight + tickHeight + s1 + vOffset + 2
		
		space = Math.max(0, space - 2*tickHeight - 4*s1 - s2)
		this.base += space/2 			

		this.baseExtension = this.base - this.trackDisplacement;
		this.y1PosTick = this.base - t2 - this.trackDisplacement - tickHeight;
		this.y2PosTick = this.base + t2 + tickHeight;
		this.yPosTxt = this.y1PosTick - s1 - this.txtHeight - 1;
		this.yLandmarkTxt = this.y2PosTick + s1 + 2; 		

		this.yRegionTxt = this.yLandmarkTxt + this.txtHeight + s2 - 2 - s1;
		this.yRegionTxt2 = this.yRegionTxt + this.txtHeight + s1 - 1 - s1;

		this.gutThicknessExtension = this.gutThickness * (this.gutModel.parent? 1 : 0.8);

		t.remove();
		
	}

	redraw(roi) {
		this.drawGut();
		if (roi == null) {
			roi = {};
			roi.pos = this.gutModel.getStartPos();
			roi.width = Math.round(this.gutModel.length / 350) * 50;
			roi.cursorPos = roi.pos + roi.width/2;
		}
		this.initializeRoi(roi.pos, roi.width);
		this.initializeMouseover();
		this.setCursorPos(roi.cursorPos);
		if (!this.isRoiActive) {
			this.roi.hide();
			this.cursor.hide();
		}
	}

	activateRoi() {
		this.roi.show();	
		this.setCursorPos(this.cursorPos);
		this.cursor.show();
		this.isRoiActive = true;
	}
	
	diactivateRoi() {
		this.roi.hide();
		this.cursor.hide();
		this.isRoiActive = false;
	}

	drawGut() {
		this.regionNodes = new Array(); // used to handle mouse out to control the pos roi 
		this.ctx.textAlign = "center";
		this.ctx.lineWidth = 1;
		let i = 0;
		let startPos = this.gutModel.getStartPos();
		let endPos = this.gutModel.getEndPos();
		let startX = this.transform.getX(startPos);
		let endX = this.transform.getX(endPos); 
		let x = startX;
		let text;
		let textOffset;
		if(this.absolutePositions) {
			text = this.ctx.text(startPos + '').font(Theme.currentTheme.posFont).addClass('small-text');
			this.ctx.line(x, this.y1PosTick, x, this.y2PosTick).stroke(Theme.currentTheme.tickPen);
			let adjust = Math.min(text.length() / 2, Math.max(0, this.transform.getMargin() - 1));
			textOffset = this.lr ? adjust : text.bbox().width - adjust;
			text.x(x - textOffset).y(this.yPosTxt);
		}
		let regionsTitles = [];
		let positions = [];
		for (let region of this.gutModel.regions) {
			let regionColor = ((region.branch === 1)? Theme.currentTheme.gutColor.fill[i%2] : Theme.currentTheme.gutExtColor.fill[i%2]);
			let regionOpacity = ((region.branch === 1)? Theme.currentTheme.gutColor.opacity : Theme.currentTheme.gutExtColor.opacity);
			if (region.color != undefined || region.color != null) {
				regionColor = Utility.colorBlend(region.color, '#404040', .7)
//				regionColor = Utility.colorShade(regionColor, 0.8);
			}
			let fillColor = { color: regionColor, opacity: regionOpacity };

			let color = {border: Theme.currentTheme.gutColor.border, background: fillColor };	
//			let {title, regionRect} = this.drawGutRegion(region, color, i%2);
			let {title, regionRect} = this.drawGutRegion(region, color, false);
			regionsTitles.push(title);
			x = this.transform.getX(region.endPos);
			this.ctx.line(x, this.y1PosTick, x, this.y2PosTick).stroke(Theme.currentTheme.tickPen);
			if(this.absolutePositions) {
				text = this.ctx.text(region.endPos + '').font(Theme.currentTheme.posFont).addClass('small-text');
				text.cx(x).y(this.yPosTxt);
				positions.push(text);
			}
			this.regionNodes.push(regionRect.node);
			i++;
		}
				
		if(this.absolutePositions) {
			this.adjustTitles(positions, this.lr, 3, false); // shift flag is false (titles will not be moved if there is space around them)
			let adjust = Math.min(text.length() / 2, Math.max(0, this.transform.getMargin() - 1));
			textOffset = this.lr ? text.bbox().width - adjust : adjust;
			text.x(x - textOffset).y(this.yPosTxt);
		}
		

		i = 0;
//		let regionWidths = this.gutModel.regions.map(re)
		let regionsGaps = []; 
		for (let region of this.gutModel.regions) {
			regionsGaps.push(Math.max(0, (this.transform.pos2x(region.size) - regionsTitles[i++].length()) / 2.0 - 3));
		}
		
		i = 0;
		let margin = Math.max(0, this.transform.getMargin() - 2);
		for (let region of this.gutModel.regions) {
			let width = this.transform.pos2x(region.size);
			let adj = 0;
			let titleWidth = regionsTitles[i].length();
			if (titleWidth > width) {
				let gapL = (this.lr)? ((i==0)? margin : regionsGaps[i-1]) : (((i==regionsGaps.length-1)? margin : regionsGaps[i+1])); 
				let gapR = (this.lr)? ((i==regionsGaps.length-1)? margin : regionsGaps[i+1]) : (((i==0)? margin : regionsGaps[i-1]));
				let gap = Math.min(gapL, gapR);
				if (titleWidth > width + 2*gap) {
					if (titleWidth > width + gapL+gapR) {
/*
						if (Utility.condenseText(regionTitles[i], width + gapL + gapR)) {
							adj = Math.round((gapL-gapR) / 2.0);
						}
						else {
							regionGaps[i] = Math.max(0, width / 2);
							regionTitles[i++].remove();
							continue;
						}
*/						
						adj = Math.round((gapL-gapR) / 2.0);
					} 
					else {
						adj = Math.round((titleWidth - width) / 2.0 - gap);
						adj = (gapL>gapR)? -adj : adj;
					}				
				}
			}
			let x = this.transform.getX(region.startPos + region.size / 2.0) + adj - titleWidth/2.0;
			let a = startX - (this.lr? margin :	 titleWidth - margin);	
			let b = endX - (this.lr? titleWidth-margin : margin); 
			x = clamp(x, a, b)
			regionsTitles[i++].x(x);
		}

		for (let title of regionsTitles) {
			title.front()
		}
		this.adjustTitles2(regionsTitles);

		this.drawLandmarks();
	}

	initializeMouseover(width = 10) {
		let d1 = 3;
		let d2 = Math.min(4, this.gutThickness/2-1);
//		let w = this.transform.pos2x(width)/2;
		let w = width/2;
		w = clamp(w, 2, 7);	
		
		let polygon = [];
		polygon[0] = [0, d2];
		polygon[1] = [w, 0];
		polygon[2] = [w, -d1];
		polygon[3] = [-w, -d1];
		polygon[4] = [-w, 0];
		this.cursor = this.ctx.group();
		this.cursor.polygon = this.cursor.polygon().plot(polygon).stroke(Theme.currentTheme.cursor).fill(Theme.currentTheme.cursorFill);
		this.cursor.text = this.cursor.text('x').font(Theme.currentTheme.cursorFont).addClass('small-text');
		let textHeight = this.cursor.text.bbox().height;
		this.cursor.text.cx(0).y(-textHeight-3);		
		
		// create a goaty vlone of the cursor to display while cursor is being moved
		this.draggingCursor = this.ctx.group();
		this.draggingCursor.polygon = this.draggingCursor.polygon().plot(polygon).stroke(Theme.currentTheme.draggingCursor).fill(Theme.currentTheme.draggingCursorFill);
		this.draggingCursor.text = this.draggingCursor.text('x').font(Theme.currentTheme.draggingCursorFont).addClass('small-text');
		this.draggingCursor.text.cx(0).y(-textHeight-3);
		this.draggingCursor.hide();		
	}

	setCursorPos(pos) {
		let extents = this.getRoiExtents()
		let newPos = clamp(pos, extents.pos, extents.pos+extents.width) 

		this.cursorPos = newPos;
		let x = this.transform.getX(this.cursorPos);
		this.updateCursor(x);
	}

	drawLandmarks() {
		let titles = [];		
		let i = 0;
		for (let landmark of this.gutModel.landmarks) {
			if (landmark.type == 'pseudo') {
				continue;
			}
			
//			let title = this.ctx.text(landmark.title).y(this.yLandmarkTxt);
			let txtVrtAdj = 0;//(1 - 2*(i%2))*.6*this.txtHeight/2;
			let title = this.ctx.text('').y(this.yLandmarkTxt + txtVrtAdj);
			let titleText = title.tspan(landmark.title).dy(title.bbox().height/2);
			UtilityViewer1D.addTooltip(this.ctx, titleText, landmark.description);
	
			if (landmark.uberonId)
				title.font(Theme.currentTheme.landmarkFontBold).addClass('small-text');
			else
				title.font(Theme.currentTheme.landmarkFont).addClass('small-text');
/*
			let textOffset = 0;
			
			if (i==0 || i==this.gutModel.landmarks.length-1) {
				textOffset = title.length() / 2 - Math.max(0, this.transform.getMargin());
				textOffset = Math.max(0, textOffset);
				textOffset = this.lr ? -textOffset : textOffset;
				if (i==0)
					textOffset = -textOffset;
			}
			let x = this.transform.getX(pos) + textOffset;

//			title.cx(x + textOffset);
*/
			let pos = landmark.position;
			let x = this.transform.getX(pos);
			title.cx(x);
			titles.push(title);
			
			if(landmark.size > 0) { //Darw landmark region

				let landmarkColor = Theme.currentTheme.landmarkColor.fill;
				if (landmark.color != undefined || landmark.color != null) {
					landmarkColor = Utility.colorBlend(landmark.color, '#404040', .7)
	//				regionColor = Utility.colorShade(regionColor, 0.8);
				}
				let fillColor = { color: landmarkColor, opacity: Theme.currentTheme.landmarkColor.opacity };

//				let fillColor = Theme.currentTheme.gradientColorS5(Theme.currentTheme.landmarkColor.fill, .8, .8, landmark.startPos, landmark.endPos, landmark.position);
//				let fillColor = Theme.currentTheme.gradientColorS5(Theme.currentTheme.landmarkColor.fill, .4, .9, landmark.startPos, landmark.endPos, landmark.position);
								
				let color = {border: Theme.currentTheme.landmarkBorderColor, background: fillColor };	
				this.drawGutRegion(landmark, color);
			}
			if (landmark.size > 0 || Math.abs(this.gutModel.getClosestRegionPos(pos) - pos) > 5)	 {
				
				let y1 = (landmark.branch === 0)? this.base-this.gutThickness/2.0 : this.baseExtension-this.gutThicknessExtension/2.0;
				let y = (this.y1PosTick + y1)/2.0;
				this.ctx.line(x, y, x, this.y2PosTick).stroke(Theme.currentTheme.tickPen);
			}
			i++;
		}
		this.adjustTitles(titles, this.lr);
	}

	adjustTitles2(titles, gap=2){
		let overlap = false;
		let overlaps = Array(titles.length).fill(false);
		for (let i=1; i<titles.length; i++) {
			let s = this.lr? 1 : -1 
			let x1 = titles[i-1].cx() + titles[i-1].length()/2 * s;
			let x2 = titles[i].cx() - titles[i].length()/2 * s;
			if((x2-x1)*s < gap && !overlaps[i-1]) {
				overlap = true;
//				break;
				overlaps[i] = !overlap[i-1];
			}
		}
		if(overlap) {
			let row1 = []
			let row2 = []
//			let y = titles[0].bbox().cy - titles[0].bbox().height + 2;
			let y = this.yRegionTxt2 + 1;
/*			for (let i=1; i<titles.length; i+=2) {
				titles[i].cy(y);
			}
*/
			for (let i=0; i<titles.length; i++) {
				if(overlaps[i]) {
					titles[i].y(y);
					row1.push(titles[i])
				}
				else {
					row2.push(titles[i])
				}
			}
			this.adjustTitles(row1, this.lr, gap)
			this.adjustTitles(row2, this.lr, gap)
		}	
	}
	
	adjustTitles(titles, lr, gap=2, shiftFlag=true){   // shift flag false meanes titles will not be moved if there is space around them
		if(!lr) { //reverse the order of titles
			for(let i=0; i<titles.length/2; i++) {
				let temp = titles[i];
				titles[i] = titles[titles.length-1-i];
				titles[titles.length-1-i] = temp;
			}
		}
		let margin = Math.max(0, this.transform.getMargin()-gap); 
		let limit = titles[titles.length-1].x() + titles[titles.length-1].length + margin;
//		let limit = titles[titles.length-1].cx() + margin;
		let items = [];
		let i = 0;
		for (let title of titles) {
			let item = new Object();
			item.width = title.length();
			item.start = title.cx() - item.width / 2;
			item.start = Math.max(item.start, - margin);
			item.end = item.start + item.width;
			if(item.end > limit) {
				item.end = limit
				item.start = item.end - item.width;  
			}
			item.titleIndex = i++;
			item.shift = 0;
			items.push(item);
		}
		let hasOverlap = true;
		this._calculateItemsGaps(items, gap);
		while(hasOverlap && titles.length > 2) {
			
			if (shiftFlag) { 	// shift items to remove/reduce overlap
				for(let i=0; i<items.length; i++) {
					if (items[i].lGap < 0) { 
						if (i>0) {  // shift prev item to the left
							if(items[i-1].lGap > 0) {
								let shift = Math.min(Math.abs(items[i].lGap), items[i-1].lGap)
								items[i-1].start -= shift; 
								items[i-1].end -= shift;
								items[i-1].shift -= shift
								this._calculateItemsGaps(items, gap) 
							}
						}
					}
					if (items[i].lGap < 0) { //if still lgap is negative shift item to the right
						if(items[i].rGap > 0) { 
							let shift = Math.min(Math.abs(items[i].lGap), items[i].rGap)
							items[i].start += shift; 
							items[i].end += shift; 
							items[i-1].shift += shift
							this._calculateItemsGaps(items, gap) 
						}
					}
				}
			}
			
			//remove the item with max overlap
			let maxOverlap = null;
			let max = 0;
			for(let i=1; i<items.length; i++) {
//				let overlap = - items[i].lGap - items[i-1].rGap;
				let overlap = items[i-1].end - items[i].start + gap
				if(overlap > 0 && (maxOverlap == null || overlap >= max)) {
					if(overlap == max && i<items.length-1) { 
						let s1 = items[i].start - items[i-1].end + items[i+1].start - items[i].end;
						let s2 = items[maxOverlap].start - items[maxOverlap-1].end + items[maxOverlap+1].start - items[maxOverlap].end;
						if (s1 >= s2) { 
							continue;
						}
					}
					maxOverlap = i;
					max = overlap;
				}
			}
			if(maxOverlap != null) {
				if(shiftFlag) {		// use the free space (available by removing the ovelapping item) for adjacent items if needed 
					let space = items[maxOverlap].width/2;
					if(items[maxOverlap-1].lGap < 0 || items[maxOverlap-1].shift<0) {
						let shift = Math.min(space, Math.max(Math.abs(items[maxOverlap-1].lGap), Math.abs(items[maxOverlap-1].shift) ) );
						items[maxOverlap-1].start += shift;
						items[maxOverlap-1].end += shift;
						items[maxOverlap-1].shift += shift
						this._calculateItemsGaps(items, gap) 
					} 
					if(maxOverlap < items.length-1 && (items[maxOverlap+1].rGap < 0 || items[maxOverlap+1].shift>0)) {
						let shift = Math.min(space, Math.max(Math.abs(items[maxOverlap+1].rGap), Math.abs(items[maxOverlap+1].shift) ) );
						items[maxOverlap+1].start -= shift;
						items[maxOverlap+1].end -= shift;
						items[maxOverlap+1].shift -= shift
						this._calculateItemsGaps(items, gap) 
					} 
				}	
				items.splice(maxOverlap, 1);
				this._calculateItemsGaps(items, gap) 
			}
			else {
				hasOverlap = false;
			}
				
		}
		for(let item of items) {
			titles[item.titleIndex].cx(item.start + item.width/2);
			titles[item.titleIndex].isActive = true;
		}		
		for(let title of titles) {
			if(!title.isActive) {
				title.remove();
			}	
		}
	}

	// calculate gaps between items - used by adjustTitles
	_calculateItemsGaps(items, gap) {
		for (let i = 0; i < items.length; i++) {
			let item = items[i];
			item.lGap = Math.min(item.width / 2, (i > 0) ? item.start - gap - items[i - 1].end : 0);
			item.rGap = Math.min(item.width / 2, (i < items.length - 1) ? items[i + 1].start - gap - item.end : 0);
		}
	}

	drawGutRegion(region, color, titlePos=null) { 
		let thickness = this.gutThickness;
		let y = this.base;
		if (region.branch === 1) {
			thickness = this.gutThicknessExtension;
			y = this.baseExtension;			
		}	
		let x = this.transform.getX(this.lr ? region.startPos : region.endPos);
		let width = this.transform.pos2x(region.size);
		let regionRect = this.ctx.rect(width, thickness).x(x).cy(y)
			.fill(color.background).stroke({ color: color.border, width: 1 })
			.on('click', this.handleRegionClick.bind(this, x))
			.on('mouseover mousemove', this.handleRegionMouseover.bind(this, x))
			.on('mouseout', this.handleMouseout.bind(this));	
//		let title = this.ctx.text(region.name).font(Theme.currentTheme.regionFont);
//		let txtVrtAdj = (1 - 2*titlePos) * .25 * this.txtHeight;
//		title.cx(this.transform.getX(region.startPos + region.size / 2.0)).y(this.yRegionTxt + txtVrtAdj);

		if(titlePos == null) {
			return;
		}
		let title = this.ctx.text(' ').font(Theme.currentTheme.regionFont).addClass('medium-text').addClass('clickable-title')
					.on('click', this.handleRegionNameClick.bind(this, region));
		let titleText = title.tspan(region.name).dy(title.bbox().height/2);
		let txtY = titlePos? this.yRegionTxt2 : this.yRegionTxt;
		title.cx(this.transform.getX(region.startPos + region.size / 2.0)).y(txtY);
		UtilityViewer1D.addTooltip(this.ctx, titleText, region.description);
		
		return {title, regionRect};
	}

	createRoiPolygon(pos = this.roiPos) {
 		let d = 2;
		let roiShares = SliderPanel.findRoiShares({pos:pos, width:this.roiWidth}, this.gutModel);
		let h1 = this.lr? 0: this.transform.pos2x(this.roiWidth - roiShares.main);
		let p1 = (roiShares.main > 0)? this.getPolygon(roiShares.main, this.gutThickness, d, h1) : null;
		let v = (p1 == null)? 0 :  (this.gutThickness-this.gutThicknessExtension) / 2 - this.trackDisplacement;
		let h2 = (p1 == null || !this.lr)? 0 : this.transform.pos2x(this.roiWidth - roiShares.ext);
		let p2 = (roiShares.ext > 0)? this.getPolygon(roiShares.ext, this.gutThicknessExtension, d, h2, v) : null; 

		if (this.roi == undefined || this.roi == null) {
			this.roi = this.ctx.group();
			if (p1 != null)
				this.roi.p1 = this.roi.polygon().plot(p1).fill(Theme.currentTheme.roiColor).stroke({ color: Theme.currentTheme.roiBorder.color, width: Theme.currentTheme.roiBorder.width });
			if (p2 != null)
				this.roi.p2 = this.roi.polygon().plot(p2).fill(Theme.currentTheme.roiColor).stroke({ color: Theme.currentTheme.roiBorder.color, width: Theme.currentTheme.roiBorder.width });
		}
		else {
			let a = this.roi.p1 != undefined && this.roi.p1 != null;
			let b = this.roi.p2 != undefined && this.roi.p2 != null;
			let c = p1 != null;
			let d = p2 != null;

			if (a == c && b == d) {   //new ROI is in the same path/overlap
				if(a && c) {
					this.roi.p1.plot(p1);
				}
				if(!a && c) {
					this.roi.p1 = this.roi.polygon().plot(p1).fill(Theme.currentTheme.roiColor).stroke({ color: Theme.currentTheme.roiBorder.color, width: Theme.currentTheme.roiBorder.width });
				}
				if(b && d) {
					this.roi.p2.plot(p2);
				}
				if(!b && d) {
					this.roi.p2 = this.roi.polygon().plot(p2).fill(Theme.currentTheme.roiColor).stroke({ color: Theme.currentTheme.roiBorder.color, width: Theme.currentTheme.roiBorder.width });
				}
			}
			else {
				this.roi.clear();
				if(c) {
					this.roi.p1 = this.roi.polygon().plot(p1).fill(Theme.currentTheme.roiColor).stroke({ color: Theme.currentTheme.roiBorder.color, width: Theme.currentTheme.roiBorder.width });
				}
				else {
					this.roi.p1 = null;
				}
				if(d) {
					this.roi.p2 = this.roi.polygon().plot(p2).fill(Theme.currentTheme.roiColor).stroke({ color: Theme.currentTheme.roiBorder.color, width: Theme.currentTheme.roiBorder.width });
				}
				else {
					this.roi.p2 = null;
				}
			}
		}

		let x = this.transform.getX(pos, this.roiWidth);
//		let y = (p1==null)? this.baseExtension : (p2==null)? this.base : (this.base + this.baseExtension)/2;

		let y = this.base;
		if(p1 == null) {
			y = this.baseExtension
		}
		else if(p2 != null) {
			let a = Math.min(this.baseExtension - this.gutThicknessExtension/2, this.base - this.gutThickness/2)
			let b = Math.max(this.baseExtension + this.gutThicknessExtension/2, this.base + this.gutThickness/2)
			y = (a + b) / 2;
		}
		
		this.roi.x(x).cy(y);

	}

	getPolygon(width, h, d=2, x=0, y=0) {
		let w = Math.max(2 * d, Math.round(this.transform.pos2x(width)));
		let polygon = [];
		polygon.push([x, y + d]);
		polygon.push([x + d, y]);
		polygon.push([x + w - d, y]);
		polygon.push([x + w, y + d]);
		polygon.push([x + w, y + h + d]);
		polygon.push([x + w - d, y + h + 2 * d]);
		polygon.push([x + d, y + h + 2 * d]);
		polygon.push([x, y + h + d]);
		return polygon;
	}

	initializeRoi(pos, width) {
		pos = clamp(pos, this.gutModel.getStartPos(), this.gutModel.getLength() - width);
		this.roiPos = pos;
		this.roiWidth = width;
		this.cursorPos = pos + width/2;
		this.createRoiPolygon(pos);
		this.roi.draggable();
		this.roi.on('dragmove', this.handleRoiDrag.bind(this))
					.on('click', this.handleRoiClick.bind(this))
					.on('wheel', this.handleMouseWheel.bind(this))
					.on('mouseover mousemove', this.handleRoiMouseover.bind(this))
					.on('mouseout', this.handleMouseout.bind(this));	
	}

	setRoiPos(pos, cursorPos=null) {
		let newPos = clamp(pos, this.gutModel.getStartPos(), this.gutModel.getEndPos() - this.roiWidth);
		
		this.createRoiPolygon(newPos);
		this.roiPos = newPos;
		if (cursorPos) {
			this.setCursorPos(cursorPos);
		}
	}

	updateRoiPos(pos, cursorPos=null) {
		this.setRoiPos(pos);
		cursorPos = cursorPos || pos + this.roiWidth/2;
		this.setCursorPos(cursorPos);
		this.dispatchRoiChange();
	}

	updateRoiWidth(width) {
		let maxZoomLength = this.gutModel.getLength()
//		let newWidth = clamp(width, MinZoomLength, Math.min(MaxZoomLength, this.gutModel.getLength()));
		let newWidth = clamp(width, MinZoomLength, Math.min(maxZoomLength, this.gutModel.getLength()));

		newWidth = Math.round(newWidth);

		if (newWidth === this.roiWidth)
			return;
			
		let dw = (newWidth - this.roiWidth) / 2.0;
		let posOffset = this.gutModel.getStartPos();
		let newPos =clamp(Math.round(this.roiPos-dw), posOffset, this.gutModel.getLength() - newWidth);
		this.setRoiPos(newPos);
		this.roiWidth = newWidth;
		let newCursorPos = clamp(this.cursorPos, this.roiPos, this.roiPos+this.roiWidth)
		if(newCursorPos != this.cursorPos) {
			this.setCursorPos(newCursorPos);
		}
		this.createRoiPolygon();
	}

	handleRegionNameClick(region, e) {
		PopupDialogs.regionPopup.open(region, e.target);
	}
	
	handleRegionClick(x, e) {
//		let pos = Math.round(this.transform.getPos(x + Utility.relativePos(e).x) - this.roiWidth / 2);
		let pos = this.transform.getPos(x + Utility.relativePos(e).x) - this.roiWidth / 2;
//		let pos = Math.round(this.transform.getPos(x + e.offsetX) - this.roiWidth / 2);
		if (!this.isRoiActive) {
			this.parent.setCurrentSlider(this.index);
		}	
		this.updateRoiPos(pos);
	}



	handleRoiClick(e) {
		Utility.handleClicks(this.handleRoiSingleClick.bind(this), this.handleRoiDblClick.bind(this), e);
	}

	handleRoiDblClick(e) {
		this.parent.openRoiDialog();
	}

	handleRoiSingleClick(e) {
		e.preventDefault();
		let x = this.transform.getX(this.roiPos, this.roiWidth);
		x += Utility.relativePos(e, true).x;
		let pos = Math.round(this.transform.getPos(x))
		this.setCursorPos(pos);
		this.dispatchRoiChange();
	}


/*
	handleRoiClick(e) {
		e.preventDefault();
		let x = this.transform.getX(this.roiPos, this.roiWidth);
		x += Utility.relativePos(e, true).x;
		let pos = Math.round(this.transform.getPos(x))
		this.setCursorPos(pos);
		this.dispatchRoiChange();
	}
*/
	handleRoiDrag(e) {
		e.preventDefault();
		const { handler, box } = e.detail;
		let pos = this.transform.getPos(box.x, this.roiWidth);
		let newPos = clamp(pos, this.gutModel.getStartPos(), this.gutModel.getEndPos() - this.roiWidth);
		this.createRoiPolygon(newPos);
		this.setCursorPos(newPos + (this.cursorPos - this.roiPos));
		this.roiPos = newPos;
//		handler.move(this.transform.getX(newPos, this.roiWidth), this.roi.bbox().y);
		this.dispatchRoiChange();
	}

	handleMouseWheel(e) {
		e.preventDefault();
		if (!this.isRoiActive)
			return;
		let dw = Math.round(this.transform.x2pos(e.deltaY));
		dw = clamp(dw, -5, 5);
		if(e.ctrlKey == true) {
			this.updateRoiWidth(this.roiWidth - dw);
			let pos = clamp(this.cursorPos, this.gutModel.getStartPos(), this.gutModel.getEndPos() - this.roiWidth);
			if (pos != this.cursorPos) {
				this.setCursorPos(pos);
			}
		}
		else {
			let pos = this.roiPos;
			let newPos = Math.round(this.roiPos - dw);
			this.setRoiPos(newPos);
			this.setCursorPos(this.roiPos + (this.cursorPos - pos));
		}
		this.dispatchRoiChange();
	}
/*		
	handleRegionDraged(e) {
		e.preventDefault();
		this.setRoiPos(e.detail.pos);
	}
*/		
	handleZoomChangeRequest(e) {
		let dw = Math.round(this.transform.x2pos(e.deltaY));
		dw = clamp(dw, -5, 5);
		this.updateRoiWidth(this.roiWidth - dw);
		this.dispatchRoiChange();
	}
	
	dispatchRoiChange() {
		let e = new CustomEvent('roi_change', {cancelable: true, detail: this.getRoiExtents()});
//		console.log(JSON.stringify(e.detail));
		this.parent.parent.dispatchEvent(e);
	}

	handleRoiMouseover(e) {
		e.preventDefault();
		let x = this.transform.getX(this.roiPos, this.roiWidth);
		
// FIX me (-4)		
		x += Utility.relativePos(e, true).x - 4;
		this.showLastCursor();
		this.updateCursor(x);
	}	

	handleRegionMouseover(regionX, e) {
		e.preventDefault();
		let x = regionX + Utility.relativePos(e).x;
		if (!this.isRoiActive) {
			let slider = this.parent.getCurrentSlider()
			this.showLastCursor(slider);
			slider.cursor.hide();
		}
		else {
			this.showLastCursor();
		}
		this.updateCursor(x);
	}
	
	showLastCursor(slider=null) {
		if(this.lastCursorIsShown){
			return
		}	
		this.lastCursorIsShown = true;
		if(slider == null) {
			slider = this;
		}
		slider.updateCursor(slider.cursor.cx(), this.draggingCursor);
		this.draggingCursor.front();
	}
	
	updateCursor(x, cursor=null) {
		if(cursor==null) {
			cursor = this.cursor;
		}
		let pos = Math.round(this.transform.getPos(x));
		pos = this.transform.clampPos(pos);
		
		let posText
		if(this.absolutePositions) {
			posText = pos+'';
		}
		else {
			let relPos = this.gutModel.getRelativePosition(pos, this.currentBranch);
			posText = relPos.region + ':' + relPos.pos + '%';
		}
		cursor.text = cursor.text.text(posText);

		cursor.show();
		cursor.text.cx(x);
		cursor.polygon.cx(x);
/*
		let coordinateText = this.ctx.text(text).font(Theme.currentTheme.coordinateFont).addClass('medium-text').y(3);
		if (this.lr) {
			coordinateText.x(gap);
		}
		else {
			coordinateText.x(this.panelWidth - 2*gap - startCoordinate.length());
		}
*/


		let y = this.base - this.gutThickness / 2;
		let regionIndex = this.gutModel.findRegionIndex(pos, 2);  // 2:both branches
		if(regionIndex.extension != null) {
			y = this.baseExtension - this.gutThicknessExtension / 2;
		} 
		let txtHeight = this.cursor.text.bbox().height;
		cursor.y(y - txtHeight - 4);
	}

	handleMouseout(e) {
		e.preventDefault();
		if(e.explicitOriginalTarget === this.roi.node) 
			return;
		if(e.explicitOriginalTarget !== this.parent.background.node) { 
			for(let node of this.regionNodes) {
				if(e.explicitOriginalTarget === node)
					return;
			}
		}

		if (this.isRoiActive) {
			this.setCursorPos(this.cursorPos);
		}
		else {
			this.parent.getCurrentSlider().cursor.show();
			this.cursor.hide();
		}
//		this.updateCursor(this.cursor.cx(), this.draggingCursor);
		this.lastCursorIsShown = false;
		this.draggingCursor.hide();

	}

	getRoiExtents() {
		return {pos: this.roiPos, width: this.roiWidth, cursorPos: this.cursorPos}
	}

	getBase() {
		return this.base;
	}
}
