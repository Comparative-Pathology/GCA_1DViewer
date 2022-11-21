/**
 * @module PopupDialogs
 * @author Mehran Sharghi
 * @export markerDialog
 * This module conatins the MarkerDialog class which creates a singlton for the dialogs used in the 1D viewer.
 * It creates four specific dialog classes for adding/updating markers, geting informations about regions and models, and managing ROI. 
 */

export { PopupDialogs }; 
import { clamp } from '../GCA_Utilities/src/GCA_Utilities.js';
import { getUberonLink } from './UberonPanel.js';
import { PopupDialog, InfoPopup, MessagePopup, ModelPopup } from '../GCA_Utilities/src/GCA_Dialogs.js';



class PopupDialogs {

	constructor(container) {
		this.container = container || document.body;
		this.markerDialog = new MarkerDialog(this.container);
		this.roiDialog = new RoiDialog(this.container);
		this.roiDialogRelative = new RoiDialogRelative(this.container);
		this.settingsDialog = new SettingsDialog(this.container);
		this.regionPopup = new RegionPopup(this.container);
		this.modelPopup = new ModelPopup(this.container);
		this.messagePopup = new MessagePopup(this.container);
//		this.load(container, 'MarkerDialog.html');
	}
	
	static instance = null;
	
	static initialize(container=null) {
		if(!this.instance) {
			this.instance = new PopupDialogs(container);
		}	
	}	

	static get markerDialog() {
		return this.instance.markerDialog;
	}
			
	static get roiDialog() {
		return this.instance.roiDialog;
	}
			
	static get roiDialogRelative() {
		return this.instance.roiDialogRelative;
	}
			
	static get settingsDialog() {
		return this.instance.settingsDialog;
	}
			
	static get regionPopup() {
		return this.instance.regionPopup;
	}
	
	static get modelPopup() {
		return this.instance.modelPopup;
	}
	
	static get messagePopup() {
		return this.instance.messagePopup;
	}
}


/** @class markerDialog encapsulating the functionality required to manage marker dialog. the dialog is based on
 * JQuery-UI library
 */
class MarkerDialog extends PopupDialog {
	/**
	 * Creates an instance of Marker Dialog.  
	 *
	 * @constructor
	 * @param {object} parent represents the parent object for the MarkerDialog which is usually an instance of ZoomView
	 */
	constructor(container) {
		let content = `	<label for="marker-pos" class="label" >Position:</label>
						<input type="text" name="marker-pos" id="marker-pos" value="123" class="text ui-widget-content ui-corner-all">
						<p class="label">Description:</p>
						<textarea name="description" id="description" class="ui-widget-content ui-corner-all"></textarea>`; 		
			
		super('marker-dialog', 'Add/Update a Marker', content, container);
		
		this.configDialog({ autoOpen: false,	
							hide: "puff",
							show : "slide",
							height: 200,
	//						modal: true,
							buttons: {
								Save: this.save.bind(this),
								Remove: this.remove.bind(this),
								Cancel: this.cancel.bind(this)
								}
	//						close: function() {
	//									form[ 0 ].reset();
	//									allFields.removeClass( "ui-state-error" );
	//								}
						});
	}
	
	init() {
		this.description = $("#description")[0];
		this.pos = $("#marker-pos:first")[0]; 
	}
	
	save() {
		this.marker.pos = this.pos.value;
		this.marker.description = this.description.value;//.text().val();
		this.saveCallback(this.marker);							
		this.dialog.dialog( "close" );
	}
	
	remove() {
		this.description.value = "";
		this.removeCallback(this.marker);							
		this.dialog.dialog( "close" );
	}

	cancel() {
		this.description.value = "";
		this.dialog.dialog( "close" );
	}
	
	open(marker=null, saveCallback=null, removeCallback=null) {
		this.marker = marker;
		if (saveCallback != null)
			this.saveCallback = saveCallback;
		if(removeCallback != null)
			this.removeCallback = removeCallback;
		this.pos.value = (marker != null)? marker.pos : '';
		this.description.value = (marker != null)? marker.description : '';
		this.dialog.dialog("open");
	}
	
}

/** @class RoiDialog encapsulats the ROI settings dialog
 */
class RoiDialog extends PopupDialog {
	/**
	 * Creates an instance of the RoiDialog.  
	 *
	 * @constructor
	 * @param {object} parent represents the parent object for the RoiDialog object which is usually an instance of the SliderPanel
	 */

	constructor(container) {
		let MinZoomLength = 1;
		let MaxZoomLength = 1000;
		let value = 200;
		let content = ` <div id='roi-dialog-branches'>
							<span class="label">Path:</span> 
	 						<input type="radio" id="roi-branch" name="roi-branch" value="0" tabindex="-1">
							<label for="roi-branch-colon">Colon</label>
							<input type="radio" id="roi-branch" name="roi-branch" value="1" tabindex="-1">
							<label for="roi-branch-ileum">Small intestine</label>
							<p/>
						</div>
						<div class="roi-slidercontainer" style="width:100%; height:20px;">
							<table style="width:100%; border-spacing: 0px;"><tr>
								<td id="roi-width-label" style="width:1%" class="label" >Width:</td>	
								<td style="padding-right:5px">
								  <input type="range" min="${MinZoomLength}" max="${MaxZoomLength}" value="${value}" tabindex="-1" 
									 class="roi-slider" name="roi-adj-slider" id="roi-adj-slider" style="width:100%"></input>
								</td><td style="width:1%">
									<input name="roi-adj-slider-value" id="roi-adj-slider-value" type="NUMBER" min="${MinZoomLength}"  
										max="${MaxZoomLength}" step="1" value="${value}" size="8" 
										style="position:relative; left:0px"></input>
							</td></tr></table>
						</div>
						<br/></p>
						<label id="roi-mid-label" for="roi-mid" class="label" >Middle:</label>
						<input type="text" name="roi-mid" id="roi-mid" size="6" class="text ui-widget-content ui-corner-all">
						&nbsp;&nbsp;
						<label for="roi-cursor" class="label" >Cursor:</label>
						<input type="text" name="roi-cursor" id="roi-cursor" size="6" class="text ui-widget-content ui-corner-all">
						<p/>
					 	<input type="checkbox" id="roi-status" name="roi-status" value="2" title="Check to keep the distal point fixed" tabindex="-1">
						<label for="roi-start" class="label" >Distal:</label>
						<input type="text" name="roi-start" id="roi-start" size="6" class="text ui-widget-content ui-corner-all">
						<p/>
					 	<input type="checkbox" id="roi-status" name="roi-status" value="3"  title="Check to keep the proximal point fixed" tabindex="-1">
						<label for="roi-end" class="label" >Proximal:</label>
						<input type="text" name="roi-end" id="roi-end" size="6" class="text ui-widget-content ui-corner-all">
						`; 		
			
		super('roi-dialog', 'Set Region Of Interest', content, container);
		
		this.configDialog({ autoOpen: false,	
							hide: "puff",
							show : "slide",
							width:280,
							modal: true,
							buttons: {
								Save: this.close.bind(this),
								Cancel: this.cancel.bind(this)
							},
							dialogClass: "no-close"  // to remove the close button
//							buttons: [{ text: "Ok", icon: "ui-icon-heart", click: this.cancel.bind(this), tabindex:"-1"  }]
							
						}, false);
		this.stateIds = ['W', 'M', 'S', 'E']		
	}
	
	init() {
		this.description = $("#description")[0];
		this.pos = $("#marker-pos:first")[0];
		this.roiWidthSlider = $("#roi-adj-slider")[0]
		this.roiWidth = $("#roi-adj-slider-value")[0]
		this.roiWidthLabel = $("#roi-width-label")[0]
		this.roiMid = $("#roi-mid")[0]
		this.roiMidLabel = $("#roi-mid-label")[0]
		this.roiStart = $("#roi-start")[0]
		this.roiEnd = $("#roi-end")[0]
		this.roiCursor = $("#roi-cursor")[0]
		this.roiBranch = $("input[name='roi-branch']")
		this.stateCheckboxes =  $("input[name='roi-status']")
		this.roiBranchesDiv = $("#roi-dialog-branches")[0]
		for (let checkbox of this.roiBranch) {
				checkbox.oninput = this.updateRoiBranch.bind(this, checkbox);
		}
  		this.roiWidthSlider.oninput = this.updateRoiSize.bind(this, this.roiWidthSlider);
//  		this.roiWidthSlider.addEventListener("input", this.updateRoiSize.bind(this, this.roiWidthSlider));
		this.roiWidth.oninput = this.updateRoiSize.bind(this, this.roiWidth);
		this.roiStart.onblur = this.updateStart.bind(this, this.roiStart);
		this.roiEnd.onblur = this.updateEnd.bind(this, this.roiEnd);
		this.roiMid.onblur = this.updateMid.bind(this, this.roiMid);
		this.roiCursor.onblur = this.updateCursor.bind(this, this.roiCursor);
	}

	cancel() {
		this.updateRoi(this.savedRoi);
		this.dialog.dialog( "close" );
	}
	
	open(roi, updateRoi, branches, absolutePositions) {
		this.dialog.tabindex="-1"
		this.absolutePositions = absolutePositions;

		this.roi = roi;
		this.roi.pos = Math.round(this.roi.pos)
		this.roi.cursorPos = Math.round(this.roi.cursorPos)
		this.roi.width = Math.round(this.roi.width)

		this.setModel(branches[roi.branchIndex].model);

		this.savedRoi =  Object.assign({}, roi);
		this.updateRoi = updateRoi;
		this.maxSize = branches[roi.branchIndex].length;
		this.roiBranchesDiv.style.display = (branches.length > 1)? 'block' : 'none';

		let state = ''; 
		for (let checkbox of this.stateCheckboxes) {
			checkbox.onclick = this.updateStatus.bind(this, checkbox); 
			if (checkbox.checked) {
//				state += this.stateIds[checkbox.value]
			}
		}
		if (state.length == 2) {
			this.state = state 
		}
		else {
			this.setState('WM') 
		}

		this.dialog.dialog("open");
	}


    setModel(model) {
		this.model = model;
		this.maxZoomLength = model.getLength();
		this.minZoomLength = 1;
		this.roiWidthSlider.min = this.roiWidth.min = 1;
		this.roiWidthSlider.max = this.roiWidth.max = this.maxZoomLength;
		this.refresh(this.roi)
    }

	updateStatus(src) {
		let id = src.value;
		let state = this.state;
		switch(this.state){
			case 'WM': 
				if(id <= 1) {
					state = 'SE'						
				}
				else {
					state = (id==2)? 'WS' : 'WE'
				} 
				break;
			case 'SE': 
				if(id <= 1) {
					state = 'WM'						
				}
				else {
					state = (id==2)? 'WE' : 'WS'
				} 
				break;
			case 'WS': 
				if(id == 1 || id == 2) {
					state = 'WM'						
				}
				else {
					state = 'SE'
				} 
				break;
			case 'WE': 
				if(id == 1 || id == 3) {
					state = 'WM'						
				}
				else {
					state = 'SE'
				}
		}
		
		this.setState(state)  
	} 	

	setState(state) {
		this.stateCheckboxes[0].checked = ((state=='WS') || (state=='SE'));
		this.stateCheckboxes[1].checked = ((state=='WE') || (state=='SE'));
		this.roiWidthSlider.disabled = (state=='SE')
		this.roiWidth.disabled = (state=='SE')
		this.roiMid.disabled = (state!='WM')
		if(state=='SE') {
			this.roiWidthLabel.classList.add('roi-dialog-disabled')
		}
		else {
   			this.roiWidthLabel.classList.remove('roi-dialog-disabled')
		}
		if(state=='WM') {
			this.roiMidLabel.classList.remove('roi-dialog-disabled')
		}
		else {
   			this.roiMidLabel.classList.add('roi-dialog-disabled')
		}
		this.state = state
	}
	
	updateRoiBranch(src) {
		let branch = src.value;
		if (branch == this.roi.branchIndex) {
			return
		}
		this.roi.branchIndex = branch;
		this.updateRoi(this.roi)
		this.setModel(this.branches[this.roi.branchIndex].model);

	}

	updateRoiSize(src, e) {
//		e.preventDefault();
//		e.stopPropagation();
		let width = src.value;
		if(isNaN(width)){ // invalid input
			return;
		}
		width = Math.round(width);
		if(width < this.MinZoomLength || width > this.MaxZoomLength) { // invalid input 
			return;
		}
		let roi = Object.assign({}, this.roi);
		let endPos = this.roi.pos + this.roi.width   
		roi.width = Math.round(width);
		if(this.state == 'WM') {
			roi.pos = null;
		}
		else if (this.state == 'WE') {
			roi.width = Math.min(roi.width, endPos)
			roi.pos = endPos - roi.width ;
		}
		else if (this.state == 'SE') {
			this.setState('WM');
			roi.pos = null;
		} 

//		this.roi.width = Math.round(width);
		this.applyChanges(roi)
	}

	updateStart(src){
		if(isNaN(src.value) || src.value<0){ // invalid input
			return;
		}
		let pos = Number(src.value);
		if(pos == this.roi.pos) {
			return;
		}
		pos = clamp(pos, 0, this.maxSize);
		let endPos = this.roi.pos + this.roi.width;
		if(this.state == 'WM' || this.state == 'WS') {
			this.setState('WS');
			this.roi.pos = pos;  
		}
		else if(this.state == 'WE' || this.state == 'SE') {
			this.setState('SE');
//			pos = clamp(pos, 0, endPos)
			if (pos < endPos) {
				this.roi.width = endPos - pos
			}
			else {
				this.roi.width = Math.min(this.maxSize-pos, this.roi.width)	
			}
			this.roi.pos = pos;  
		}
		this.applyChanges(this.roi)
	}

	updateEnd(src){
		if(isNaN(src.value) || src.value<0){ // invalid input
			return;
		}
		let endPos = Number(src.value);
		if(endPos == this.roi.pos + this.roi.width) {
			return;
		}
		endPos = clamp(endPos, 0, this.maxSize);
		if(this.state == 'WM' || this.state == 'WE') {
			this.setState('WE')
			this.roi.pos = endPos - this.roi.width;  
		}
		else if(this.state == 'WS' || this.state == 'SE') {
			this.setState('SE');
//			pos = clamp(pos, 0, endPos)
			if (endPos > this.roi.pos) {
				this.roi.width = endPos - this.roi.pos
			}
			else {
				this.roi.width = Math.min(endPos, this.roi.width)	
			}
			this.roi.pos = endPos - this.roi.width;  
		}
		this.applyChanges(this.roi)
	}

	updateMid(src){
		if(isNaN(src.value) || src.value<0){ // invalid input
			return;
		}
		let pos = Number(src.value);
		if(pos == this.roi.pos) {
			return;
		}
		pos = clamp(pos, 0, this.maxSize);
		this.roi.pos = pos - this.roi.width/2;  
		if(this.state != 'WM') {
			this.setState('WM')
		}
		this.applyChanges(this.roi)
	}

	updateCursor(src){
		if(isNaN(src.value) || src.value<0){ // invalid input
			return;
		}
		let pos = Number(src.value);
		if(pos == this.roi.cursorPos) {
			return;
		}
		this.roi.cursorPos = clamp(pos, this.roi.pos, this.roi.pos+this.roi.width);
		this.applyChanges(this.roi)
	}

	refresh(roi) {
		this.roiBranch[roi.branchIndex].checked = true;
		
		this.roiWidthSlider.value = roi.width;
		this.roiWidth.value = roi.width;
//		this.roiMid.value = (roi.pos + Math.round(roi.width/2 * 10) / 10).toFixed(1);
		this.roiMid.value = roi.pos + Math.round(roi.width/2 * 10) / 10;
		this.roiStart.value = roi.pos
		this.roiEnd.value = roi.pos + roi.width;
		this.roiCursor.value = roi.cursorPos
		
		this.roi = roi;
	}
	
	applyChanges(roi) {
		this.updateRoi(roi)
		this.refresh(roi)
	}
	
	
}


/** @class RoiDialog encapsulats the ROI settings dialog
 */
class RoiDialogRelative extends PopupDialog {
	/**
	 * Creates an instance of the RoiDialog.  
	 *
	 * @constructor
	 * @param {object} parent represents the parent object for the RoiDialog object which is usually an instance of the SliderPanel
	 */

	constructor(container) {
		let MinZoomLength = 1;
		let MaxZoomLength = 1000;
		let value = 50;
		let content = ` <div id='roi-dialog-branches'>
							<span class="label">Path:</span> 
	 						<input type="radio" id="roi-branch" name="roi-branch" value="0" tabindex="-1">
							<label for="roi-branch-colon">Colon</label>
							<input type="radio" id="roi-branch" name="roi-branch" value="1" tabindex="-1">
							<label for="roi-branch-ileum">Small intestine</label>
							<p/>
						</div>
						<div class="roi-slidercontainer" style="width:100%; height:20px;">
							<table style="width:100%; border-spacing:0 10px;">
							  <tr>
								<td id="roi-start-label" style="width:1%" class="label" >Distal:</td>	
								<td style="padding-right:5px">
								  <input type="range" min="0" tabindex="-1" 
									 class="roi-slider" name="roi-start-slider" id="roi-start-slider" style="width:100%"></input>
								</td>
								<td style="width:1%">
									<select id="roi-start-region" name="roi-start-region"></select>
								</td>
								<td style="width:1%">
									<input name="roi-start-region-pos" id="roi-start-region-pos" type="NUMBER" min="${-1}"  
										max="${101}" step="1" value="${value}" size="8" 
										style="position:relative; left:0px"></input>
								</td>
								<td>&percnt;</td>
							  </tr>
							  <tr>
								<td id="roi-end-label" style="width:1%" class="label" >Proximal:</td>	
								<td style="padding-right:5px">
								  <input type="range" min="${MinZoomLength}" max="${MaxZoomLength}" value="${value}" tabindex="-1" 
									 class="roi-slider" name="roi-end-slider" id="roi-end-slider" style="width:100%"></input>
								</td><td style="width:1%">
									<select id="roi-end-region" name="roi-end-region"></select>
								</td>
								<td style="width:1%">
									<input name="roi-end-region-pos" id="roi-end-region-pos" type="NUMBER" min="${-1}"  
										max="${101}" step="1" value="${value}" size="8" 
										style="position:relative; left:0px"></input>
								</td>
								<td>&percnt;</td>
							  </tr>
							  <tr>
								<td id="roi-cursor-label" style="width:1%" class="label" >Cursor:</td>	
								<td style="padding-right:5px">
								  <input type="range" min="${MinZoomLength}" max="${MaxZoomLength}" value="${value}" tabindex="-1" 
									 class="roi-slider" name="roi-cursor-slider" id="roi-cursor-slider" style="width:100%"></input>
								</td><td style="width:1%">
									<select id="roi-cursor-region" name="roi-cursor-region"></select>
								</td>
								  <td style="width:1%">
									<input name="roi-cursor-region-pos" id="roi-cursor-region-pos" type="NUMBER" min="${-1}"  
										max="${101}" step="1" value="${value}" size="8" style="position:relative; left:0px"></input>
								</td>
								<td>&percnt;</td>
							  </tr>
							</table>
						</div>
						`; 		
			
		super('roi-dialog-relative', 'Set Region Of Interest', content, container);
		
		this.configDialog({ autoOpen: false,	
							hide: "puff",
							show : "slide",
							width:380,
							height:240,
							modal: true,
							buttons: {
								Save: this.close.bind(this),
								Cancel: this.cancel.bind(this)
							},
							dialogClass: "no-close"  // to remove the close button
//							buttons: [{ text: "Ok", icon: "ui-icon-heart", click: this.cancel.bind(this), tabindex:"-1"  }]
							
						}, false);
		this.stateIds = ['W', 'M', 'S', 'E']		
	}
	
	init() {
		this.roiStartSlider = $("#roi-start-slider")[0]
		this.roiStartRegion = $("#roi-start-region")[0]
		this.roiStartRegionPos = $("#roi-start-region-pos")[0]

		this.roiEndSlider = $("#roi-end-slider")[0]
		this.roiEndRegion = $("#roi-end-region")[0]
		this.roiEndRegionPos = $("#roi-end-region-pos")[0]

		this.roiCursorSlider = $("#roi-cursor-slider")[0]
		this.roiCursorRegion = $("#roi-cursor-region")[0]
		this.roiCursorRegionPos = $("#roi-cursor-region-pos")[0]

		this.roiBranch = $("input[name='roi-branch']")
		this.roiBranchesDiv = $("#roi-dialog-branches")[0]
		for (let checkbox of this.roiBranch) {
				checkbox.oninput = this.updateRoiBranch.bind(this, checkbox);
		}

  		this.roiStartSlider.oninput = this.updateRoiStart.bind(this);
  		this.roiEndSlider.oninput = this.updateRoiEnd.bind(this, this.roiEndSlider);
  		this.roiCursorSlider.oninput = this.updateRoiCursor.bind(this, this.roiCursorSlider);

		this.roiStartRegion.onchange = this.updateRoiStartRegion.bind(this);
		this.roiEndRegion.onchange = this.updateRoiEndRegion.bind(this);
		this.roiCursorRegion.onchange = this.updateRoiCursorRegion.bind(this);
		
		this.roiStartRegionPos.onchange = this.updateRoiStartRegion.bind(this); 
		this.roiEndRegionPos.onchange = this.updateRoiEndRegion.bind(this); 
		this.roiCursorRegionPos.onchange = this.updateRoiCursorRegion.bind(this); 
	}

	cancel() {
		this.updateRoi(this.savedRoi);
		this.dialog.dialog( "close" );
	}
	
	open(roi, updateRoi, branches, absolutePositions) {
		this.dialog.tabindex="-1"
		this.branches = branches;
		this.absolutePositions = absolutePositions;
		
		this.roi = roi;
		this.roi.pos = Math.round(this.roi.pos)
		this.roi.cursorPos = Math.round(this.roi.cursorPos)
		this.roi.width = Math.round(this.roi.width)

		this.savedRoi =  Object.assign({}, roi);
		this.updateRoi = updateRoi;
		this.roiBranchesDiv.style.display = (branches.length > 1)? 'block' : 'none';

		this.setModel(branches[roi.branchIndex].model);
		
		this.dialog.dialog("open");
	}

    setModel(model) {
		this.model = model;
		this.maxSize = model.getLength();//this.branches[roi.branchIndex].length;
		
        for (let i = this.roiStartRegion.length - 1; i >= 0; i--) {
            this.roiStartRegion.remove(i);
            this.roiEndRegion.remove(i);
            this.roiCursorRegion.remove(i);
        }

        this.regions = model.regions.map(x => x.name);
        for (let i = 0; i < this.regions.length; i++) {
            this.roiStartRegion.add(new Option(this.regions[i], i));
            this.roiEndRegion.add(new Option(this.regions[i], i));
            this.roiCursorRegion.add(new Option(this.regions[i], i));
        }
        this.roiStartSlider.max = this.roiEndSlider.max = this.roiCursorSlider.max = model.getLength();
        this.refresh(this.roi);
    }

	updateRoiBranch(src) {
		let branch = Number(src.value);
		if (branch == this.roi.branchIndex) {
			return
		}
		this.roi.branchIndex = branch;
		this.updateRoi(this.roi)
		this.setModel(this.branches[this.roi.branchIndex].model);
	}

	updateRoiStart(){
		if(isNaN(this.roiStartSlider.value) || this.roiStartSlider.value<0){ // invalid input
			return;
		}
		let pos = Number(this.roiStartSlider.value);
		if(pos == this.roi.pos) {
			return;
		}
		
		this.setRoiStart(pos);

/*		

		pos = clamp(pos, 0, this.maxSize-1);
		let endPos = this.roi.pos + this.roi.width;


		pos = Math.min(pos, endPos-1)
/*		
		if (pos < endPos) {
			pos = Math.min(pos, endPos-1)
		}
		else {
			pos = Math.min(this.maxSize-1, pos)
			this.roi.width = 1;	
		}
* /
		this.roi.width = endPos - pos
		this.roi.pos = pos;
		this.roi.cursorPos = Math.max(this.roi.cursorPos, pos)
		this.updateRoi(this.roi)		
		this.refresh()
*/		
	}

	adjustRegion(region, percent) { //checks for percent being less han 0 or abve 100 and adjust the region
		if(percent<0) {
			if(region > 0) {
				region--;
				percent = 100;
			}
			else {
				percent = 0;
			}
		}
		if(percent>100) {
			if(region < this.regions.length -1) {
				region++;
				percent = 0;
			}
			else {
				percent = 100;
			}
		}
		return {region: region, percent: percent}
	}
	
	updateRoiStartRegion(){
		if(isNaN(this.roiStartRegionPos.value)){ // invalid input
			return;
		}
		let regionIndex = Number(this.roiStartRegion.value);
		let percent = Number(this.roiStartRegionPos.value);
		let newPosition = this.adjustRegion(regionIndex, percent) 
		let pos = Math.round(this.model.getAbsolutePosition(newPosition.region, newPosition.percent))
		if(pos == this.roi.pos && newPosition.region == Number(this.roiStartRegion.value)) {
			return;
		}
		
		this.setRoiStart(pos, false, newPosition.region);
	}

	setRoiStart(pos, fixEndPos=true, regionIndex=null) {
		pos = clamp(pos, 0, this.maxSize - 1);
		let endPos = this.roi.pos + this.roi.width;
		//		pos = Math.min(pos, endPos-1)
		if (pos < endPos || fixEndPos) {
			pos = Math.min(pos, endPos - 1);
			this.roi.width = endPos - pos;
		}
		else {
			pos = Math.min(this.maxSize - 1, pos);
			this.roi.width = 1;
		}
		this.roi.pos = pos;
		this.roi.cursorPos = Math.max(this.roi.cursorPos, pos);
		this.updateRoi(this.roi);
		this.refresh(regionIndex);
	}

	updateRoiEnd(src){
		if(isNaN(src.value) || src.value<0){ // invalid input
			return;
		}
		let pos = Number(src.value);
		this.setRoiEnd(pos);
	}

	updateRoiEndRegion(){
		if(isNaN(this.roiEndRegionPos.value)){ // invalid input
			return;
		}
		let regionIndex = Number(this.roiEndRegion.value);
		let percent = Number(this.roiEndRegionPos.value);
		let newPosition = this.adjustRegion(regionIndex, percent) 
		let pos = Math.round(this.model.getAbsolutePosition(newPosition.region, newPosition.percent))

		if(pos == this.roi.pos+this.roi.width && newPosition.region == Number(this.roiEndRegion.value)) {
			return;
		}
		this.setRoiEnd(pos, false, newPosition.region);
	}

	setRoiEnd(pos, fixStartPos=true, regionIndex=null) {
		if(pos == this.roi.pos+this.roi.width && regionIndex==null) {
			return;
		}
		pos = clamp(pos, 1, this.maxSize);
		let startPos = this.roi.pos;		
		pos = Math.max(pos, startPos+1)
		this.roi.width = pos - startPos
		this.roi.cursorPos = Math.min(this.roi.cursorPos, pos)
		this.updateRoi(this.roi)		
		this.refresh(regionIndex)
	}

	updateRoiCursor(src){
		if(isNaN(src.value) || src.value<0){ // invalid input
			return;
		}
		let pos = Number(src.value);
		this.setRoiCursor(pos)
	}

	updateRoiCursorRegion(){
		if(isNaN(this.roiCursorRegionPos.value)){ // invalid input
			return;
		}
		let regionIndex = Number(this.roiCursorRegion.value);
		let percent = Number(this.roiCursorRegionPos.value);
		let newPosition = this.adjustRegion(regionIndex, percent) 
		let pos = Math.round(this.model.getAbsolutePosition(newPosition.region, newPosition.percent))
		if(pos == this.roi.cursorPos && newPosition.region == Number(this.roiCursorRegion.value)) {
			return;
		}

		this.setRoiCursor(pos, newPosition.region);
	}

	setRoiCursor(pos, regionIndex=null){
		if(pos == this.roi.cursorPos && regionIndex==null) {
			return;
		}
		this.roi.cursorPos = clamp(pos, this.roi.pos, this.roi.pos+this.roi.width);
		this.updateRoi(this.roi)
		this.refresh(regionIndex)
	}
	
	refresh(regionIndex=null) {
		let roi=this.roi;
		this.roiBranch[roi.branchIndex].checked = true;
		
		this.roiStartSlider.value = roi.pos;
		this.roiEndSlider.value = roi.pos + roi.width;
		this.roiCursorSlider.value = roi.cursorPos;

		let startPos = this.model.getRelativePosition(roi.pos, roi.branchIndex, regionIndex);
		this.roiStartRegion.value = this.regions.indexOf(startPos.region) + '';
		this.roiStartRegionPos.value = startPos.pos;
		
		let endPos = this.model.getRelativePosition(roi.pos+roi.width, roi.branchIndex, regionIndex);
		this.roiEndRegion.value = this.regions.indexOf(endPos.region) + '';
		this.roiEndRegionPos.value = endPos.pos;
		
		let cursorPos = this.model.getRelativePosition(roi.cursorPos, roi.branchIndex, regionIndex);
		this.roiCursorRegion.value = this.regions.indexOf(cursorPos.region) + '';
		this.roiCursorRegionPos.value = cursorPos.pos;
		
		this.roi = roi;
	}
	
}


/**************************************************************************
*/

/** @class SettingsDialog encapsulates the app settings dialog
 */
class SettingsDialog extends PopupDialog {
	/**
	 * Creates an instance of the SettingsDialog.  
	 *
	 * @constructor
	 * @param {object} parent represents the parent object for the SettingsDialog object
	 */

	constructor(container) {
		let content = ` <label for="theme">Theme:</label>
						<select id="theme" name="theme">
						   <option value="0">White</option>
						   <option value="1">Gray</option>
						   <option value="2">Dark</option>
						</select>
						<br/></p>
					 	<input type="checkbox" id="lr" name="lr" title="Check to set display direction from left to right" tabindex="-1">
						<label id="lr-label" for="lr" class="label" >Display from left to right</label>
						<br/></p>
					 	<input type="checkbox" id="layers" name="layers" title="Check to display intestin wall layer" tabindex="-1">
						<label id="layers-label" for="layers" class="label" >Display intestine wall layers</label>
						<br/></p>
						<label for="sliders">Display:</label>
						<select id="sliders" name="sliders">
						   <option value="0">Colon & Small Intestine</option>
						   <option value="1">Colon</option>
						   <option value="2">Small Intestine</option>
						   <option value="3">Colon & Small Intestine overlapping</option>
						</select>
						<br/></p>
						<div id='positions'>
							<span class="label">Positions:</span> 
	 						<input type="radio" id="positions-absolute" name="positions" value="0" tabindex="-1">
							<label for="positions-absolute">Absolute</label>
							<input type="radio" id="posiitions-relative" name="positions" value="1" tabindex="-1">
							<label for="positions-relative">Relative</label>
							<p/>
						</div>
						
					 	<input type="checkbox" id="zoom_visible" name="zoom_visible" title="Check to display the zoom panel when starting the viewer" tabindex="-1">
						<label id="lr-label" for="lr" class="label" >Show the zoom panel at start</label>
						`; 		
			
		super('settings-dialog', 'Change settings', content, container);
		
		this.configDialog({ autoOpen: false,	
							hide: "puff",
							show : "slide",
							width:250,
							modal: true,
							buttons: {
								Save: this.save.bind(this),
								Cancel: this.cancel.bind(this)
							},
							dialogClass: "no-close"  // to remove the close button
							
						}, false);
	}
	
	init() {
		this.theme = $("#theme")[0];
		this.lr = $("input[name='lr']")[0];
		this.layers = $("input[name='layers']")[0];// $("#layers")[0];
		this.slidersDisplay = $("#sliders")[0];
		this.positions = $("input[name='positions']")
		this.zoomVisible = $("input[name='zoom_visible']")[0];
		
	}
	
	open(status, saveSettings, target=null) {
		if(target) {
			let targetBox = target.getBoundingClientRect();
			this.dialog.dialog({position: {of: window, my: 'right top', at: `left+${targetBox.left + 1} top+${targetBox.bottom + 1}`, collision: 'fit fit'}});
		}
		this.dialog.tabindex="-1"
		this.theme.value = status.themeIndex;
		this.lr.checked = status.lr;
		this.layers.checked = status.showLayers;
		this.slidersDisplay.value = status.displayMode;
		this.positions[status.positions? 0 : 1].checked = true;  // value: '0' for absolute and '1' fo relative 
		this.zoomVisible.checked = status.zoomVisible;
		this.saveSettings = saveSettings;	
		this.dialog.dialog("open");
	}
	
	save() {
		
		let status = {	themeIndex:		Number(this.theme.value), 
						lr : 			this.lr.checked, 
						layersVisible:	this.layers.checked,
						displayMode:  	Number(this.slidersDisplay.value),
						positions:		this.positions[0].checked,
						zoomVisible:	this.zoomVisible.checked
					}
				
		this.saveSettings(status);		
		this.dialog.dialog( "close" );
	}

	cancel() {
		this.dialog.dialog( "close" );
	}
	
}


/**************************************************************************
*/
class RegionPopup extends InfoPopup {
	/**
	 * Creates an instance of Region Popup.  
	 *
	 * @constructor
	 */
	constructor(container) {
		let content = ` <label for="region-name" class="label" >Region:</label>
						<label id="region-name" class="text popup-data"></label>
						<p/>
						<label class="label">Start:</label>
						<label id="region-start" class="text popup-data"></label>
						<p/>
						<label class="label">End:</label>
						<label id="region-end" class="text popup-data"></label>
						<p/>
						<label class="label">UBERON ID:</label>
						<a id="region-uberon" href=""  target="_blank" ></a>`;
//						<label id="region-uberon" class="text popup-data"></label>`;
		super('region-popup', 'Gut Region', content, container);
	}
	
	init() {
		this.name = $(`#region-name`)[0]; 
		this.start = $(`#region-start`)[0];
		this.end = $(`#region-end`)[0];
		this.uberon = $(`#region-uberon`)[0];
	}
	
	
	showContent(region) {
		this.name.textContent = region.description;
		this.start.textContent = region.startPos + ' mm';
		this.end.textContent = region.endPos + ' mm';
		this.uberon.textContent = region.uberonId;
		this.uberon.href = getUberonLink(region.uberonId) 
	}
}
	

