/**
 * @module CellTypePanel
 * @author Mehran Sharghi
 * @export CellTypePanel
 * This module conatins a two classes CellType and CellTypePanel which conatins all the functionality required to display a 
 * cellType view for the region of interest in the GCA 1D model viewer.
 */

import { Utility, Sidebar } from '../GCA_Utilities/src/GCA_Utilities.js'
import { DisplayPanel } from './DisplayPanel.js'
import { Theme } from './Theme.js'
import { GutCellTypes } from './CellTypes.js'

export { CellTypePanel };

const CellTypeUrl = 'https://www.ebi.ac.uk/ols/ontologies/cl/terms?iri=http%3A%2F%2Fpurl.obolibrary.org%2Fobo%2F';

/** @class CellType encapsulate information associatd with single CellType in GCA 1D gut model */
class CellType {
	/**
	 * Creates an instance of CellType  
	 *
	 * @constructor
	 * @param {string} name title of the cell type  
	 * @param {string} description
	 * @param {object} region Region of the CellType 
	 * @param {string} layer layer of the CellType
	 * @param {string} externalId reference id to external source
	 */
	constructor(name, description, region, layer, externalId) {
		this.name = name;
		this.description = description;
		this.region = region;
		this.layer = layer;
		this.externalId = externalId;
//		this.type = type;   // type of the cell type e.g. landmark or region based 
	}	
	
}

/** @class CellTypePanel representing CellType view for GCA 1D gut model */
class CellTypePanel extends DisplayPanel {
	/**
	 * Creates an instance of CellType panel.  
	 *
	 * @constructor
	 * @param {object} parent represents the parent object for the CellType view which is usually an instance of Viewer1D
	 * @param {string} model gut 1D model  
	 * @param {boolean} absolutePositions specifes the display of positions being absolute values from the model statr or relative to the model regions   
	 * @param {number} width width of the CellType panel
	 * @param {number} height height of the CellType panel
	 * @param {object} roi represents the region of interest in the gut usually provided by the slider panel 
	 * @param {boolean} lr specifes the direction of the linear model display from left to right or right to left 
	 */
	constructor(container, parent, model, absolutePositios=true) {
		super(container, parent, model, 'annotationBkgColor', false);
		this.populateCellTypes();
		this.absolutePositions = absolutePositios
		this.roi = null;
		this.sortCol = 0;
		this.ascendingOrder = true;
		
	}

	initializePanel() {

	}
/*
	initialiseTabCtx(ctx, index, title, x, y, width, height) {

		let paneWidth = width;
		let paneHeight = height - this.tabHeight;
		
		let tab = {};
		tab.index = index;
		tab.bkgCtx = this.parent.ctx.nested();
		tab.bkgCtx.size(paneWidth, paneHeight).move(x, y + this.tabHeight);
		tab.bkgCtx.rect(paneWidth, paneHeight).move(0, 0)
						.fill(Theme.currentTheme.annotationBkgColor)
						.radius(Theme.currentTheme.corner)
						.on('mouseleavet', this.removeHighlightCellType.bind(this));

								
		// a seprate contex used to easly clear the zoom panel and redraw
		tab.ctx = this.parent.ctx.nested();
		tab.ctx.size(paneWidth, paneHeight).move(x, y + this.tabHeight);
		tab.ctx.lineWidth = 1;
		
		let cy = y+this.tabHeight/2 +1 ;
		let tabX = x + 100*index;
		
//		tab.tabShape = ctx.path(this.tabShape).transform({scaleX:1, scaleY:1}).fill('blue');//Theme.currentTheme.annotationBkgColor);
//		tab.tabShape = ctx.path(this.tabShape).fill(Theme.currentTheme.annotationTabColor).stroke({ color: '#fff', width: 1, linecap: 'round', linejoin: 'round' });		
		tab.tabShape = ctx.path(this.tabShape).fill(Theme.currentTheme.annotationTabColor);		
		tab.tabShape.x(tabX).cy(cy).transform({scaleX:1, scaleY:.7});//.width(null,50);
		tab.tabShape.on('click', this.handleTabClick.bind(this, tab.index));
		tab.x = tabX;
		tab.y = cy;
		tab.title = ctx.text(title).font(Theme.currentTheme.annotationTabFont).addClass('medium-text');
		tab.title.x(tabX+6).cy(cy); 		
		tab.title.on('click', this.handleTabClick.bind(this, tab.index));
		this.dispatchCelltypeLayerChange();
		
		return tab;
	}	
*/

	
	handleTabEvents(e) {
		super.handleTabEvents(e)   //from class DisplayPanel
//		console.log('TAB CLICKED:'+e )

		if(e.type === 'tabActivated'){	
			this.dispatchCelltypeTabActivated(true)
		}
		if(e.type === 'tabDeactivated'){	
			this.dispatchCelltypeTabActivated(false)
		}

	}

	populateCellTypes() {
		let layerSet = new Set();
		this.cellTypeList = new Array();
		for(let region of this.gutModel.regions) {
			let regionCellTypesLayerList = GutCellTypes.findCellTypeByRegionId(region.anatomy[0].id);
			if(!regionCellTypesLayerList) {
				continue;
			}
			regionCellTypesLayerList.sort((a, b)=>{return a.layer.localeCompare(b.layer)});
			for(let layer of regionCellTypesLayerList) {
				layerSet.add(layer.layer);
				if(layer.cellTypeList == null) {
					continue;
				}
				layer.cellTypeList.sort((a, b)=>{return a.name.localeCompare(b.name)});
				for (let cellTypeItem of layer.cellTypeList) {
					let cellType = new CellType(cellTypeItem.name, cellTypeItem.label, region.name, layer.layer, cellTypeItem.external_id)
//					cellType.uberonId = region.uberonId? region.uberonId.replace(':', '_') : null;
					this.cellTypeList.push(cellType);
				}
			}
		}
		
		let newLayersList = new Array();
		for(let layerName of layerSet) {

			
			let existingLayer;
			if(this.layersList) {
				existingLayer = this.layersList.find(layer => layer.name==layerName);
			} 
			if(existingLayer) {
				newLayersList.push({name: existingLayer.name, selected: existingLayer.selected});
			}
			else {
				newLayersList.push({name: layerName, selected: true});
			}


		}
		this.layersList = newLayersList;
		this.layersList.sort((a, b)=>{return a.name.localeCompare(b.name)});

/*
		for(let layer of this.layersList) {
			console.log("layer: " + layer.name);
		}

		for(let cellType of this.cellTypeList)
			console.log(cellType.pos + "\t" + cellType.title);
*/

	}
	
	setGutModel(gutModel) {
		if (this.gutModel == gutModel) 
			return;
			
		this.gutModel = gutModel;
		this.populateCellTypes();
	}
	
	getVisibleCellTypes(roi) {
		let startRegionIndex = this.gutModel.findRegionIndex(roi.pos, roi.branch);
		let endRegionIndex = this.gutModel.findRegionIndex(roi.pos+roi.width, roi.branch);
		let startRegion = this.gutModel.regions[startRegionIndex];
		let endRegion = this.gutModel.regions[endRegionIndex];		
		
		// find start and end cellTypeList index corresponding to the zoom window
		let start = 0;
		while (this.cellTypeList[start].region != startRegion.name) {
			start++;
			if (start >= this.cellTypeList.length) {
				start--;
				break;
			}
		}
		let end = this.cellTypeList.length-1;
		while (this.cellTypeList[end].region != endRegion.name)
			end--;

		// Populate visible cellType list
		let layerSet = new Set();
		let visibleList = []
		for(let i=start; i<=end; i++) {
			let cellType = this.cellTypeList[i];
			let layer = this.layersList.find(layer => layer.name==cellType.layer);
			if(!layer) {
				let found = false;
				for (let e of layerSet) {
					if (e.name === cellType.layer) {
						found = true;
					    break;
					}
				}				
				if(!found) {				
					layer = {name:cellType.layer, selected: true}
				}
			}	
			if(layer) {			
				layerSet.add(layer);
				if(layer.selected) {
					visibleList.push(cellType)
				}
			}				
		}
		
		visibleList.sort((a, b)=>{return a.region.localeCompare(b.region)});
		if (this.sortCol == 1) {
			visibleList.sort((a, b)=>{return a.layer.localeCompare(b.layer)});
		}
		if (this.sortCol == 2) {
			visibleList.sort((a, b)=>{return a.name.localeCompare(b.name)});
		}
		if(!this.ascendingOrder) {
			visibleList.reverse();
		}

		// update visible layer set
		this.layersList = new Array();
		for(let layer of layerSet) {
			this.layersList.push({name: layer.name, selected: layer.selected});
		}
		this.layersList.sort((a, b)=>{return a.name.localeCompare(b.name)});

		return visibleList;
	}



/*
	showCellTypes(roi) {
		let gap1 = 10;
		let margin = 5;
		let text = this.ctx.text(' 8888-8888').font(Theme.currentTheme.annotationPosFont).addClass('medium-text');
		let bbox = text.bbox();
		let bbh = Math.max(bbox.h, 12);  
		
		text.remove();
		let lineSpace = 2;

		let visibleCellTypes = this.getVisibleCellTypes(roi)

*/	
	removeHighlightCellType(e) {
		if (this.highlightRect) {
			this.highlightRect.remove();
			this.highlightRect = null;
		}
	}
	
	highlightCellType(h, cy, icon) {
		if (this.highlightRect) {
			this.highlightRect.remove();
			this.highlightRect = null;
		}			
		this.highlightRect = this.ctx.rect(this.ctx.width(), h).x(0).cy(cy).fill(Theme.currentTheme.annotationHighlight);
		icon.front();
	}
	

	setPanelVisibility(visible) {
		if(visible) {
			this.ctx.show();
			this.bkgCtx.show();
		}
		else {
			this.ctx.hide();
			this.bkgCtx.hide();
		}
	}

	updateRoi(roi) {
		let currentRoi = this.roi
		this.roi = roi;
		if(currentRoi == null) {
			this.draw();		
		}
		else {
			this.redraw();
		}
	}
	
	drawPanel() {
		let visibleCellTypes = this.getVisibleCellTypes(this.roi);
		this.createLayersSelectionSidebar();		
//		let sortSymbol = this.ascendingOrder? '&#8593;' : '&#8595;';
//		let sortSymbol = this.ascendingOrder? '&#128316;' : '&#128317;';

		let sortSymbol = this.ascendingOrder? '&#x25BC;' : '&#x25B2;';
//		let sortSymbol = this.ascendingOrder? '&#x25BE;' : '&#x25B4;';
		
		let colHeader0 = 'Region ' + ((this.sortCol == 0)? sortSymbol : '') ;
		let colHeader1 = 'Layer ' + ((this.sortCol == 1)? sortSymbol : '') ;
		let colHeader2 = 'Cell-Type ' + ((this.sortCol == 2)? sortSymbol : '') ;
		let f1 = Theme.currentTheme.annotationDescFont;
		let f2 = Theme.currentTheme.annotationFont;
		let f3 = Theme.currentTheme.annotationPosFont;

		let tableHead = `<thead style="font-family:${f1.family}; font-size: ${f1.size-1}pt;" ><tr>
							<th id="cellType_header_0" style="background:${Theme.currentTheme.annotationBkgColor}; cursor:pointer;">${colHeader0}</th>
							<th id="cellType_header_1" style="background:${Theme.currentTheme.annotationBkgColor}">${colHeader1}</th>
							<th id="cellType_header_2" style="background:${Theme.currentTheme.annotationBkgColor}">${colHeader2}</th></tr></thead>`;
		let tableBody = '<tbody>';

		let regionStyle = `color:${f1.fill}; font-family:${f1.family}; font-size: ${f1.size-1}pt; font-stretch: condensed;`; 
		let layerStyle = `color:${f2.fill}; font-family:${f2.family}; font-size: ${f2.size-1}pt; font-stretch: condensed;`;
		let cellTypeStyle = `color:${f3.fill}; font-family: ${f3.family}; font-size: ${f3.size-1}pt; `;

		let cellTypeIds = new Array();
				

		for(let i=0; i<visibleCellTypes.length; i++) {
			let cellType = visibleCellTypes[i];
			let region = cellType.region;
			if(region.length > 22) {
				region = region.substr(0, 18)+'...';
			}
			let layer = cellType.layer;
			if(layer.length > 22) {
				layer = layer.substr(0, 18)+'...';
			}
			let cellTypeName = cellType.name;
			if(cellTypeName.length > 44) {
				cellTypeName = cellTypeName.substr(0, 40)+'...';
			}
			tableBody += '<tr>';
			tableBody += `<td style="${regionStyle}" title="${cellType.region}" >${region}</td>`;
			tableBody += `<td style="${layerStyle}" title="${cellType.layer}" >&nbsp;${layer}</td>`;
			let id = cellType.externalId.replace(':', '_')
			let link = `<button id="cellType_${id}_${i}" class="CellTypeLink medium-text clickable-title" 
			                                             style="${cellTypeStyle}" 
			                                             title="${cellType.name}&#013;${id}&#013;click for OLS page">${cellTypeName}</button>`
			cellTypeIds.push({id:id, index:i});
			tableBody += `<td style="${cellTypeStyle}">${link}</td>`;
			tableBody += '</tr>';
		}
		tableBody += '</tbody>';
		let displayTable = Utility.htmlToElem(`<div class="tableFixHead" style="white-space: nowrap;"><table>${tableHead}${tableBody}</table></div>`);
		displayTable.style.color = f2.fill;

		let wrapper = Utility.addElement(this.container, 'div');
		let gap = 2;
		wrapper.style.marginBottom = gap + 'px';
		wrapper.style.height = `calc(100% - ${gap}px)`;
		wrapper.appendChild(displayTable);

		for(let cellTypeId of cellTypeIds) {
			let link = document.getElementById(`cellType_${cellTypeId.id}_${cellTypeId.index}`);
			link.onclick = this.handleCellTypeLinkClick.bind(this, cellTypeId.id);
		}		
		document.getElementById('cellType_header_0').onclick = this.handleCellTypeHeaderClick.bind(this, 0);
		document.getElementById('cellType_header_1').onclick = this.handleCellTypeHeaderClick.bind(this, 1);
		document.getElementById('cellType_header_2').onclick = this.handleCellTypeHeaderClick.bind(this, 2);
	}

	handleCellTypeHeaderClick(col) {
		if(this.sortCol == col) {
			this.ascendingOrder = !this.ascendingOrder;
		}
		else {
			this.ascendingOrder = true;
		}
		this.sortCol = col;
		this.redraw();		
	}
	
	handleCellTypeLinkClick(cellTypeId) {
		let url = CellTypeUrl + cellTypeId.replace(':', '_');
		let popupFeatures = "toolbar=yes,resizable=yes,location=yes,scrollbars=yes,status=yes,titlebar=yes, rel='noopener noreferrer'";
		let win = window.open(url, "_blank", popupFeatures);
//		console.log(url);		
	}

	handleUpdateSelectedLayers(e) {    //received from zoom panel via Viewer1D
		let zoomPanelLayers = e.detail;
		for(let zoomPanelLayerName in zoomPanelLayers) {
			for(let layer of this.layersList) {
				if(layer.name.toUpperCase() === zoomPanelLayerName)
					layer.selected = zoomPanelLayers[zoomPanelLayerName];
			}
		}
		this.redraw();
	}
	
	dispatchCelltypeTabActivated(status=true) {
		let e = new CustomEvent('celltype_Tab_Activated', {cancelable: true, detail: {status:status, layers: this.layersList} });
		this.parent.dispatchEvent(e);
	}
	
	dispatchCelltypeLayersChange() {
		let e = new CustomEvent('celltype_layers_change', {cancelable: true, detail: this.layersList});
//		console.log(JSON.stringify(e.detail));
		this.parent.dispatchEvent(e);
	}
	
	/******************************************************************************
	** Layer selection side bar
	*****************************************************************************/
	createLayersSelectionSidebar() {
		let k = 0;
		let content = `<div class="celltype-layers-selection"> <br>
							<table style="border:none; text-align:left">
								<tr><td colspan="2" id="select-all-layers">Select All</td></tr>`;
		for(let layer of this.layersList) {
			content += `<tr style="height:1em">
							<td><input type="checkbox" id="select-layer-${k}" name="select-layer" ${layer.selected?"checked":""}></td>
							<td><label for="select-layer-${k}"> ${layer.name}</label></td>
						</tr>`
			k++;
		}
		content += `</table><br>
					<input type="button" id="update-layers-selection" width="40px" value="Update">
					<input type="button" id="cancel-layers-selection" value="Cancel">
					</div>`;

		this.sidebar = new Sidebar(this.container, 'left', 'layer-selection-sidebar', content, 220);
		this.sidebar.setOnopen(this.checkActiveLayers.bind(this));
		this.sidebar.setOnclose(this.checkActiveLayers.bind(this));
		let selectAll = document.getElementById('select-all-layers');
		selectAll.onclick = this.selectAllLayers.bind(this);
		let updateButton = document.getElementById('update-layers-selection');
		updateButton.onclick = this.updateActiveLayers.bind(this);
		let cancelButton = document.getElementById('cancel-layers-selection');
		cancelButton.onclick = () => {	this.sidebar.close(true); }
	}

	checkActiveLayers() {
		for(let k=0; k<this.layersList.length; k++) {
			document.getElementById(`select-layer-${k}`).checked = this.layersList[k].selected;
		}
	}
	
	selectAllLayers() {
		let checkboxes = document.getElementsByName('select-layer');
		for(let checkbox of checkboxes) {
			checkbox.checked = 'checked';
		}		
	}
	
	updateActiveLayers(e) {
		let selections = [];
		let anySelected = false;
		for(let k=0; k<this.layersList.length; k++) {
			selections[k] = document.getElementById(`select-layer-${k}`).checked;
			anySelected ||= selections[k];
		}

		if(!anySelected) {
			this.sidebar.hold();
			this.parent.messagePopup.open("At least one layer must be selected!", e.target, this.sidebar.unhold.bind(this.sidebar));
			return;
		}
		for(let k=0; k<this.layersList.length; k++) {
			this.layersList[k].selected = document.getElementById(`select-layer-${k}`).checked;
		}
		this.sidebar.close();
		this.dispatchCelltypeLayersChange();
		this.redraw();
	}


}
