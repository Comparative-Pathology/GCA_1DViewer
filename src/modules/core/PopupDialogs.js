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
/*	
	save() {
		this.updateRoi(this.roi);
		this.dialog.dialog( "close" );
	}
*/
	cancel() {
		this.updateRoi(this.savedRoi);
		this.dialog.dialog( "close" );
	}
	
	open(roi, updateRoi, branches, minZoomLength=1, maxZoomLength=1000) {
		this.dialog.tabindex="-1"
		this.MinZoomLength = minZoomLength;
		this.MaxZoomLength = maxZoomLength;
		this.roiWidthSlider.min = this.roiWidth.min = minZoomLength;
		this.roiWidthSlider.max = this.roiWidth.max = maxZoomLength;
		this.roi = roi;
		this.roi.pos = Math.round(this.roi.pos)
		this.roi.cursorPos = Math.round(this.roi.cursorPos)
		this.roi.width = Math.round(this.roi.width)
		this.refresh(this.roi)
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

//setTimeout(this.test1.bind(this), 600);
		this.dialog.dialog("open");
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
		this.updateRoi(roi)
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
		this.updateRoi(this.roi)
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
		this.updateRoi(this.roi)
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
		this.updateRoi(this.roi)
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
		this.updateRoi(this.roi)
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
						<label id="layers-label" for="layers" class="label" >Display intestin wall layers</label>
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
	}
	
	open(theme, lr, showLayers, saveSettings, target=null) {
		if(target) {
			let targetBox = target.getBoundingClientRect();
			this.dialog.dialog({position: {of: window, my: 'right top', at: `left+${targetBox.left + 1} top+${targetBox.bottom + 1}`, collision: 'fit fit'}});
		}
		this.dialog.tabindex="-1"
		this.theme.value = theme;
		this.lr.checked = lr;
		this.layers.checked = showLayers;
		this.saveSettings = saveSettings;	
		this.dialog.dialog("open");
	}
	
	save() {
		this.saveSettings(this.theme.value, this.lr.checked, this.layers.checked);		
		this.dialog.dialog( "close" );
	}

	cancel() {
		this.dialog.dialog( "close" );
	}
	
/*

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
*/
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
	

