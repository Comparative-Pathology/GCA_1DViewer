/**
 * @module ZoomPanel
 * @author Mehran Sharghi
 * @export ZoomPanel
 * This module conatins a single class ZoomPanel which conatins all the functionality required to display a 
 * zoomed view for a region of interest in the GCA 1D model viewer. 
 */

import { Marker } from './GCA_1D_Model.js';
import { ViewTransform, UtilityViewer1D } from './Utility.js'
import { clamp, Utility } from '../GCA_Utilities/src/GCA_Utilities.js'

import { DisplayPanel } from './DisplayPanel.js';
import { Theme } from './Theme.js'
import { PopupDialogs } from './PopupDialogs.js';
import { GutAnatomy } from './Anatomy.js'

export { ZoomPanel };

/** @class ZoomPanel representing zoomed view for GCA 1D gut model */
class ZoomPanel extends DisplayPanel{
	/**
	 * Creates an instance of zoom panel.  
	 *
	 * @constructor
	 * @param {object} parent represents the parent object for the zoom view which is usually an instance of Viewer1D
	 * @param {string} model gut 1D model  
	 * @param {boolean} absolutePositions specifes the display of positions being absolute values from the model statr or relative to the model regions   
	 * @param {number} width width of the zoom panel
	 * @param {number} height height of the zoom panel
	 * @param {object} roi represents the region of interest in the gut usually provided by the slider panel 
	 * @param {number} level represent model's abstraction level (not in use)
	 * @param {boolean} lr specifes the direction of the linear model display from left to right or right to left 
	 */

	constructor(container, parent, model, absolutePositios=true, layersVisible=true, lr = false) {
		super(container, parent, model, 'zoomBkgColor');
		this.lr = lr;
		this.ctx.textAlign = "center";
		this.layersVisible = layersVisible;
		this.absolutePositions = absolutePositios
		this.xOffset = 0;
		this.transform = new ViewTransform(this.panelWidth-this.xOffset, 0, this.lr, 0, 10, -this.xOffset);
		this.regionBoxes = new Array();
		this.markerIcons = new Array();
		this.currentBranch = 0; //'colon';
		this.selectableLayers = false;
		this.selectedLayers = [];
		for(let layer of GutAnatomy.visibleIntstinalLayers) {
			this.selectedLayers[layer.toUpperCase()] = true;
		}
	}

	initializePanel() {
		this.verticalPositionsSet = false;
		if (this.transform) {
			this.transform.setWidth(this.panelWidth - this.xOffset);
		}
		this.setVerticalPositions(this.panelHeight);
		
		// this is for capturing drag events on the zoom panel; clearing the context to redraw causes problem for handling drag events
/*		
		this.dragCtx = this.parent.ctx.nested();
		this.dragCtx.size(panelWidth, zoomHeight).move(panelMargin, height - zoomHeight - panelMargin);
		this.dragBox = this.dragCtx.rect(this.ctx.width()-2*panelMargin, this.gutThickness).x(panelMargin).cy(this.base).fill({ color: 'white', opacity: 0.0 });
		this.dragBox.draggable();
		this.dragBox.on('dragmove', this.handleRegionDrag.bind(this))
					.on('dragstart', this.handleRegionDragStart.bind(this));
		this.dragBox.on('wheel', this.handleMouseWheel.bind(this));
*/		
	}
	
	setRoi(roi) {
		this.startPos = roi.pos;
		this.endPos = roi.pos + roi.width;
		this.cursorPos = clamp(roi.cursorPos, this.startPos, this.endPos);
		this.transform.setLength(roi.width);
		this.transform.setPosOffset(roi.pos);
		this.initializeCoordinates();
		
	}
	
	setVisibile(visible) {
		if(visible) {
			this.ctx.show();
			this.bkgCtx.show();
		}
		else {
			this.ctx.hide();
			this.bkgCtx.hide();
		}
	}

	setCurrentBranch(branch){
		this.currentBranch = branch;	
	}
	
	setLeft2Right(lr, redraw=false) {
		if (this.lr == lr)
			return;
		this.lr = lr;
		this.transform.setLeft2Right(lr);
		if(redraw) { 
			this.redraw();
		}
	}
	setVerticalPositions(zoomHeight) {
		if(!this.isVisible) {
			return;
		} 
		let t = this.ctx.text('lp');			
		this.fontHeight = t.font(Theme.currentTheme.regionFontZoom).addClass('large-text').bbox().height-1
		this.yPosTxt = this.fontHeight + 5;
		this.yRegionTxt = zoomHeight - this.fontHeight-1;
		this.yRegionTxt2 = this.yRegionTxt - this.fontHeight + 1;
		this.posFontHeight = t.font(Theme.currentTheme.posFont).addClass('medium-text').bbox().height-1;
		this.y1PosTick = this.yPosTxt + this.posFontHeight + 1;
		this.y2PosTick = this.yRegionTxt - t.font(Theme.currentTheme.landmarkFontBold).addClass('medium-text').bbox().height - this.fontHeight + 2;
		this.yLandmarkTxt = this.y2PosTick + 3; 		
		t.remove();
		let tickHeight = 0.1*zoomHeight
		this.gutThickness = this.y2PosTick - this.y1PosTick - tickHeight;
		this.gutThicknessExtension = .9 * this.gutThickness;
//		this.base = (this.y2PosTick + this.y1PosTick) / 2.0 + ;
		this.base = this.y1PosTick + this.gutThickness/2 + .7*tickHeight;
		this.trackDisplacement = this.base - this.y1PosTick - this.gutThickness/2 - 10;
		this.baseExtension = this.base - (this.gutThickness - this.gutThicknessExtension)/2 - this.trackDisplacement;
		this.verticalPositionsSet = true;
	}

	initializeCoordinates() {
		let startRegionIndex = this.gutModel.findRegionIndex(this.startPos, this.currentBranch);
		let endRegionIndex = this.gutModel.findRegionIndex(this.endPos, this.currentBranch);
		this.startRegion = this.gutModel.regions[startRegionIndex];
		this.endRegion = this.gutModel.regions[endRegionIndex];		

		let len = this.gutModel.getLength();
		let startPosPcnt = Math.round(this.startPos / len * 100);
		let startPosRelative = this.startPos - this.startRegion.startPos; 
		let startPosRelativePcnt = Math.round(startPosRelative / this.startRegion.size * 100);
		let endPosPcnt = Math.round(this.endPos / len * 100);
		let endPosRelative = this.endPos - this.endRegion.startPos;
		let endPosRelativePcnt = Math.round(endPosRelative / this.endRegion.size * 100);

		let startLandmark = this.startRegion.name;
		let endLandmark = this.endRegion.name;		
		let gap = 5;
/*
		let startCoordinate = this.ctx.text('Start: ').font(Theme.currentTheme.coordinateFont);
		startCoordinate.build(true);
		startCoordinate.tspan(this.startPos+' (' + startPosPcnt+'%)')
		startCoordinate.tspan(startLandmark + ':' + startPosRelative + ' (' + startPosRelativePcnt + '%)').dx(gap);

		let endCoordinate = this.ctx.text('End: ').font(Theme.currentTheme.coordinateFont);
		endCoordinate.build(true);
		endCoordinate.tspan(this.endPos+' (' + endPosPcnt+'%)	')
		endCoordinate.tspan(endLandmark + ':' + endPosRelative + ' (' + endPosRelativePcnt + '%)').dx(gap);

*/
		this.drawLayersTitles();	// this will adjust the xOffset 

		
		let startText = startLandmark + ':';
		startText += this.absolutePositions? Math.round(startPosRelative) + 'mm (' + startPosRelativePcnt + '%)' : startPosRelativePcnt + '%';
		let startCoordinate = this.ctx.text(startText).font(Theme.currentTheme.coordinateFont).addClass('medium-text').y(3);
		
		let endText = endLandmark + ':';
		endText += this.absolutePositions? Math.round(endPosRelative) + 'mm (' + endPosRelativePcnt + '%)' : endPosRelativePcnt + '%';
		let endCoordinate = this.ctx.text(endText).font(Theme.currentTheme.coordinateFont).addClass('medium-text').y(3);

		if (this.lr) {
			startCoordinate.x(gap);
			endCoordinate.x(this.panelWidth - 2*gap - endCoordinate.length() - this.xOffset);
		}
		else {
			startCoordinate.x(this.panelWidth - 2*gap - startCoordinate.length());
			endCoordinate.x(gap + this.xOffset);
		}

//		this.endPosText = this.ctx.text(this.endPos+'');
//		this.endPosPcntText = this.ctx.text(endPosPcnt + '');
//		this.endPosText = this.ctx.text(endLandmark + ' + ' + endPosRelative);
//		this.endPosPcntText = this.ctx.text(endLandmark + ' + ' + endPosRelativePcnt);


//		this.startPosPcntText = posTable.tspan(startPosPcnt+'%  ').dx(10).newLine().font('anchor', 'right');
//		this.startPosRelPcntText = posTable.tspan(startLandmark + '[' + startPosRelativePcnt + '%]');
/*		
		this.startPosText = this.ctx.text(this.startPos+'');
		this.startPosPcntText = this.ctx.text(startPosPcnt+'');
		this.startPosRelText = this.ctx.text(startLandmark + ' + ' + startPosRelative);
		this.startPosRelPcntText = this.ctx.text(startLandmark + ' + ' + startPosRelativePcnt);
*/
//		this.endPosText = this.ctx.text(this.endPos+'');
//		this.endPosPcntText = this.ctx.text(endPosPcnt + '');
//		this.endPosText = this.ctx.text(endLandmark + ' + ' + endPosRelative);
//		this.endPosPcntText = this.ctx.text(endLandmark + ' + ' + endPosRelativePcnt);
		
//		this.postable.add.tspan()

	}
	
	setSelectableLayers(status) {   // called by Viewer 1D upon receiving event cell type tab clicking event
		this.selectableLayers = status.status;
		this.setActiveLayers(status.layers)
	}
		
	setActiveLayers(cellTypeLayers) {   // called by Viewer 1D upon receiving event from cell type panel
		for(let layer of cellTypeLayers) {
			if(layer.name.toUpperCase() in this.selectedLayers) { 
				this.selectedLayers[layer.name.toUpperCase()] = layer.selected;
			} 
		}
		this.redraw();
	}

	handleLayerCheckBoxClick(index, chkBox) {
		this.selectedLayers[index.toUpperCase()] = chkBox.checked;
		let e = new CustomEvent('zoom_layers_selection_change', {cancelable: true, detail: this.selectedLayers});
		this.parent.dispatchEvent(e);
	} 

	drawLayersTitles(){
		if(!this.layersVisible) {
			if(this.xOffset != 0) {
				this.xOffset = 0;
				this.transform.setWidth(this.panelWidth);
				this.transform.setXOffset(0);		
			}
			return;
		}
		let maxWidth = 0;
		let layersTitles = []

		let text = this.ctx.text('Mp').font(Theme.currentTheme.posFont).addClass('medium-text');
		let textHeight = text.bbox().height;
		text.remove();
		
		for(let i=0; i<GutAnatomy.visibleIntstinalLayers.length; i++) {

			if(this.selectableLayers) {
				let layer = GutAnatomy.visibleIntstinalLayers[i].toUpperCase();
				let selected = this.selectedLayers[layer];

				let chkBoxSize = textHeight + 4;
				let title = this.ctx.group();
				let chkBox = document.createElement('div');
				chkBox.innerHTML = `<input type="checkbox" id="select-zoom-layer-${i}"
									       name="select-zoom-layer" ${selected?"checked":""}
									       style="width:${chkBoxSize-4}px; height:${chkBoxSize-4}px" >`
				let tt = title.foreignObject(chkBoxSize, chkBoxSize)
				tt.add(chkBox);
				title.text(GutAnatomy.visibleIntstinalLayers[i]).font(Theme.currentTheme.posFont).addClass('medium-text').x(chkBoxSize+3); 
				layersTitles[i] = title;

				 
				chkBox = document.getElementById(`select-zoom-layer-${i}`)

				chkBox.onclick = this.handleLayerCheckBoxClick.bind(this, layer, chkBox);

			}
			else {
				layersTitles[i] = this.ctx.text(GutAnatomy.visibleIntstinalLayers[i]).font(Theme.currentTheme.posFont).addClass('medium-text');;
			}
			
			let w = layersTitles[i].bbox().width;
			if (w > maxWidth) {
				maxWidth = w
			}
		}
		let gap = 3;
		this.xOffset = maxWidth -1 + (this.lr? gap : -gap);
		this.transform.setXOffset(this.lr? 0 : -this.xOffset);		
		this.transform.setWidth(this.panelWidth - this.xOffset);

		let thickness = this.gutThickness;
		let y = this.base
/*		
		if (region.branch === 1) { // ileum
			thickness = this.gutThicknessExtension;
			y = this.baseExtension;
		}
	*/	
	
		let x = this.lr? this.panelWidth - gap - this.xOffset : gap;
		for(let i=0; i<layersTitles.length; i++) {
			let lt = thickness/layersTitles.length
			let ly = y + (i-1)*lt 

			layersTitles[i].x(x).cy(ly-lt)
		}
	}

	drawGut() {
		if(!this.verticalPositionsSet) {
			this.setVerticalPositions(this.panelHeight);
		}
		
		let pos = this.startRegion.startPos;
		let x = this.transform.getX(this.startPos);
		if(this.startPos == pos) {
			this.ctx.line(x, this.y1PosTick, x, this.y2PosTick).stroke(Theme.currentTheme.tickPen);
		}
		let suffix = '';//' (' + Math.round(this.startPos / this.gutModel.getLength() * 100) + '%)';
		let text;
		if(this.absolutePositions) {
			text = this.ctx.text(Math.round(this.startPos) + suffix).font(Theme.currentTheme.posFont).addClass('medium-text');
			let adjust = Math.min(text.length()/2, Math.max(0, this.transform.getMargin() - 1));
			let textOffset = this.lr ? adjust : text.bbox().width - adjust;
			if (this.startRegion.endPos - this.startPos > this.transform.x2pos(text.length())) {
				text.x(x - textOffset).y(this.yPosTxt);
			}
			else {
				text.remove();
			}
		}
		this.regionBoxes = [];
		this.markerIcons = [];
		
		this. overlapVisible = false;
		let prevRegionBranch = null;
		for (let i=0; i<this.gutModel.regions.length; i++) {
			let region = this.gutModel.regions[i];
			if (region.startPos > this.endPos || region.endPos < this.startPos) 
				continue;

			let regionColor = ((region.branch === 1)? Theme.currentTheme.gutColor.fill[i%2] : Theme.currentTheme.gutExtColor.fill[i%2]);
			let regionOpacity = ((region.branch === 1)? Theme.currentTheme.gutColor.opacity : Theme.currentTheme.gutExtColor.opacity);
			if (region.color != undefined || region.color != null) {
				regionColor = Utility.colorBlend(region.color, '#404040', .7)
//				regionColor = Utility.colorShade(regionColor, 0.8);
			}
			let fillColor = { color: regionColor, opacity: regionOpacity };
			let color = {border: Theme.currentTheme.gutColor.border, background: fillColor };	
			let regionBox = this.drawGutRegion(region, color);
			prevRegionBranch = prevRegionBranch || region.branch;
			if (prevRegionBranch != region.branch ){
				this.overlapVisible = true;
			}
			this.regionBoxes.push(regionBox);
			if(this.absolutePositions) {
				pos += region.size;
				pos = Math.min(this.endPos, pos);
				x = this.transform.getX(pos);
				if (region.endPos == pos) 
					this.ctx.line(x, this.y1PosTick, x, this.y2PosTick).stroke(Theme.currentTheme.tickPen);
				suffix = '';
	//			if (i==endRegion) 
	//				suffix = ' (' + Math.round(this.endPos / this.gutModel.getLength() * 100) + '%)'; 
				text = this.ctx.text(Math.round(pos) + suffix).font(Theme.currentTheme.posFont).addClass('medium-text');
				text.cx(x).y(this.yPosTxt);
		//		adjust = Math.min(text.length() / 2, Math.max(0, this.transform.getMargin() - 1));
		//		textOffset = this.lr ? text.bbox().width - adjust : adjust;
				if (this.endPos - this.endRegion.startPos > this.transform.x2pos(text.length())) {
		//			text.x(x - textOffset).y(this.yPosTxt);
					text.cx(x).y(this.yPosTxt);
				}
				else {
					text.remove();
				}
			}
		}
		
		let titles = []
		for (let region of this.regionBoxes) {
			titles.push(region.title)
		}
		let regionLanmarksTitles = this.drawLandmarks();
		let regionsTitles = this.mergeTitles(titles, regionLanmarksTitles); 

		for (let title of regionsTitles) {
			title.front()
		}
		this.adjustTitles(regionsTitles);
		
		for (let marker of this.gutModel.markers) {
			if (marker.pos > this.endPos)
				break;
			if (marker.pos < this.startPos)
				continue;
			let markerIcon = this.drawMarker(marker);
			
			this.markerIcons.push(markerIcon);
		}
		
		this.changeBranch(this.currentBranch);
		
		this.initializeCursor(12, 8);		
		this.refreshCursor(this.cursorPos);
	}

	mergeTitles(t1, t2) {
		let i = 0;
		let j = 0;
		let titles = [] 
		while(i<t1.length && j<t2.length ) {
			if((t1[i].bbox().x2 > t2[j].bbox().x2) != this.lr) {
				titles.push(t1[i++])
			}
			else {
				titles.push(t2[j++])
			} 
		}
		while(i<t1.length) {
			titles.push(t1[i++])
		} 
		while(j<t2.length ) {
			titles.push(t2[j++])
		}
		return titles; 
	}
	
	adjustTitles(titles, gap=2){
		let overlap = false;
		let overlaps = [];
		
		for (let i=0; i<titles.length-1; i++) {
			let s = this.lr? 1 : -1 
			let x1 = titles[i].cx() + titles[i].length()/2 * s;
			let x2 = titles[i+1].cx() - titles[i+1].length()/2 * s;
			if((x2-x1)*s < gap) {
				overlap = true;
//				break;
				if (i==0) {
					overlaps[i] = false;
				}
				overlaps[i+1] = !overlap[i];
			}
		}	
		if(overlap) {
//			let y = titles[0].bbox().cy - titles[0].bbox().height + 2;
			let y = this.yRegionTxt2 + 1;
/*			for (let i=1; i<titles.length; i+=2) {
				titles[i].cy(y);
			}
*/
			for (let i=1; i<titles.length; i++) {
				if(overlaps[i]) {
					titles[i].y(y);
				}
			}
		}	
	}
	
	drawLandmarks() {
		let titles = []
		let i = 0;
		for (let landmark of this.gutModel.landmarks){
			if (landmark.type == 'pseudo') {
				continue;
			}
			let pos = landmark.position;			
			let start = Math.max(landmark.startPos, this.startPos);
			let end = Math.min(landmark.endPos, this.endPos);
			if (pos > this.endPos) {
				if (landmark.startPos < this.endPos) {
					let titleBox = this.drawLandmarkRegion(landmark, start, end);
					if (titleBox) {
						titles.push(titleBox.title)
					}
				}
				continue;
			}
			if (pos < this.startPos) {
				if (landmark.endPos > this.startPos) {
					let titleBox = this.drawLandmarkRegion(landmark, start, end);
					if (titleBox) {
						titles.push(titleBox.title)
					}
				}
				i++;
				continue;
			}
//			let title = this.ctx.text(landmark.title).y(this.yLandmarkTxt);
			let title = this.ctx.text('').y(this.yLandmarkTxt);
			let titleText = title.tspan(landmark.title).dy(title.bbox().height/2);
			UtilityViewer1D.addTooltip(this.ctx, titleText, landmark.description);
			
			if (landmark.uberonId)
				title.font(Theme.currentTheme.landmarkFontBold).addClass('medium-text');
			else
				title.font(Theme.currentTheme.landmarkFont).addClass('medium-text');
			
			let textOffset = 0;
			
			if (i==0 || i==this.gutModel.landmarks.length-1) {
				textOffset = title.length() / 2 - Math.max(0, this.transform.getMargin());
				textOffset = Math.max(0, textOffset);
				textOffset = this.lr ? -textOffset : textOffset;
				if (i==0)
					textOffset = -textOffset;
			}

			let x = this.transform.getX(pos);// + textOffset;

			let titleBox = this.drawLandmarkRegion(landmark, start, end);
			if (titleBox) {
				titles.push(titleBox.title)
			}
			title.cx(x + textOffset);
			if (Math.abs(this.gutModel.getClosestRegionPos(pos) - pos) > 5)	 {
				let y = this.y1PosTick; // + Math.round((this.base-this.gutThickness/2.0-this.y1PosTick)/2.0);
				this.ctx.line(x, y, x, this.y2PosTick).stroke(Theme.currentTheme.tickPen);
				if(this.absolutePositions) {
					let text = this.ctx.text(`${pos}`).font(Theme.currentTheme.posFont).addClass('medium-text');
					text.cx(x).y(this.yPosTxt);
				}
			}
			i++;
		} 
		return titles
	}

	drawLandmarkRegion(landmark, start, end) {
		if (landmark.size > 0) { //Darw landmark region
		
			let landmarkColor = Theme.currentTheme.landmarkColor.fill;
			if (landmark.color != undefined || landmark.color != null) {
				landmarkColor = Utility.colorBlend(landmark.color, '#888888', .7)
//				landmarkColor = Utility.colorBlend(landmark.color, 'fff', .5)
			}
			let fillColor = { color: landmarkColor, opacity: Theme.currentTheme.landmarkColor.opacity };

//			let fillColor = Theme.currentTheme.gradientColorS5(Theme.currentTheme.landmarkColor.fill, 0.1, .9, start, end, landmark.position);
//			let fillColor = Theme.currentTheme.gradientColorS5(regionColor, 0.55, .75, start, end, landmark.position);

//			let color = {border: Theme.currentTheme.landmarkBorderColor, background: fillColor };			
			let color = {border: Theme.currentTheme.landmarkColor.border, background: fillColor };	
			return this.drawGutRegion(landmark, color, true);
		}
		
		
		
		
	}

	drawGutRegion(region, color, innerBorder=false) {
		let thickness = this.gutThickness;
		let y = this.base
		if (region.branch === 1) { // 'ileum'
			thickness = this.gutThicknessExtension;
			y = this.baseExtension;			
		}
		let startPos = Math.max(region.startPos, this.startPos);
		let endPos = Math.min(region.endPos, this.endPos);
		let x = this.transform.getX(this.lr ? startPos : endPos);
		let width = this.transform.pos2x(endPos-startPos);
		let regionBox = this.ctx.rect(width, thickness-(innerBorder? 2 : 0)).x(x).cy(y)
			.fill(color.background).stroke({ color: color.border, width: 1 });
			
		if(this.layersVisible) {
			for(let i=0; i<GutAnatomy.visibleIntstinalLayers.length-1; i++) {
				let lt = thickness/GutAnatomy.visibleIntstinalLayers.length
				let ly = y + (i-1.5)*lt; 
				let layerLine = Theme.currentTheme.zoomLayersLine
				if(region.layers[GutAnatomy.visibleIntstinalLayers[i]]) {
					this.ctx.line(x, ly, x+width, ly).stroke({color:layerLine.color, width: layerLine.width});
				}
				else {
					let h = lt -  2*layerLine.width - 2;
					this.ctx.rect(width-2, h).x(x+1).cy(ly-lt/2).fill({color:layerLine.color, opacity:0.9}).stroke({color:layerLine.color, width: 1});
				}
			}
		}			
//		regionBox.draggable();
//		regionBox.on('dragmove', this.handleRegionDrag.bind(this))
//				 .on('dragstart', this.handleRegionDragStart.bind(this));
//		regionBox.on('dragend', this.handleRegionDragEnd.bind(this));			
		regionBox.on('wheel', this.handleMouseWheel.bind(this));
		regionBox.on('click', this.handleRegionClick.bind(this, region));	
//		regionBox.on('dblclick', this.handleRegionClick.bind(this, region));	// handled together with single click

//		let title = this.ctx.text(region.name).font(Theme.currentTheme.regionFont);
		let title = this.ctx.text('').font(Theme.currentTheme.regionFontZoom).addClass('large-text').addClass('clickable-title')
					.on('click', this.handleRegionNameClick.bind(this, region));
		
		
		let titleText = title.tspan(region.name||region.description).dy(title.bbox().height/2);
		title.cx(this.transform.getX((startPos + endPos) / 2.0)).y(this.yRegionTxt);
//		title.cx(this.transform.getX((startPos + endPos) / 2.0)).y(y + thickness/2 - this.fontHeight); 
		UtilityViewer1D.addTooltip(this.ctx, titleText, region.description);
		
		return {box: regionBox, branch: region.branch, title: title};
	}

	setGutModel(gutModel) {
		this.gutModel = gutModel;
	}

	initializeCursor(w, h, h1=h/3) {
		if(this.cursor) {
			this.cursor.clear()
		}
		let d1 = h1;
		let d2 = Math.min(h-h1, this.gutThickness / 2 - 1);
		//		let w = this.transform.pos2x(width)/2;
		let w2 = w / 2;
		w2 = clamp(w2, 2, 10);
		
		let polygon = [];
		polygon[0] = [0, d2];
		polygon[1] = [w2, 0];
		polygon[2] = [w2, -d1];
		polygon[3] = [-w2, -d1];
		polygon[4] = [-w2, 0];
		this.cursor = this.ctx.group();
		this.cursor.polygon = this.cursor.polygon().plot(polygon).stroke(Theme.currentTheme.cursor).fill(Theme.currentTheme.cursorFill);
//		this.cursor.line(0,0)
		this.cursor.text = this.cursor.text('x').font(Theme.currentTheme.cursorFont);//.addClass('small-text');
		let textHeight = this.cursor.text.bbox().height;
		this.cursor.text.cx(0).y(-textHeight - 3);
		this.cursor.draggable();
		this.cursor.on('dragmove', this.handleCursorDrag.bind(this))
	}

	refreshCursor(pos) {
		let x = Math.round(this.transform.getX(pos));
		let y = this.base - this.gutThickness / 2;
		let regionIndex = this.gutModel.findRegionIndex(pos, 2);   // 2:both branches
		if(regionIndex.extension != null) {
			y = this.baseExtension - this.gutThicknessExtension / 2;
		} 
		let txtHeight = this.cursor.text.bbox().height;
		this.cursor.cx(x).y(y - txtHeight - 4);
		
		let posText
		if(this.absolutePositions) {
			posText = Math.round(pos) + '';
		}
		else {
			let relPos = this.gutModel.getRelativePosition(pos, this.currentBranch);
			posText = relPos.region + ':' + relPos.pos + '%';
		}

//		let posText = this.absolutePositions? Math.round(pos)+'' : this.getRelativePositionText(pos);
		this.cursor.text = this.cursor.text.text(posText);
		this.cursor.text.cx(x);
	}

	handleCursorDrag(e) {
		e.preventDefault();
		const { handler, box } = e.detail;
		let pos = this.transform.getPos(box.x);
		
		this.updateCursorPos(pos);
		
//		handler.move(this.transform.getX(newPos, this.cursorWidth), this.cursor.bbox().y);
		let detail = {pos: this.startPos, width: this.endPos-this.startPos, cursorPos: this.cursorPos};
		let customEvent = new CustomEvent('zoom_cursor_change', {cancelable: true, detail: detail});
		this.parent.dispatchEvent(customEvent);

	}

	handleMouseWheel(e) {
		e.preventDefault();
		let displacement = e.deltaY;
		if(e.ctrlKey == true) {
			this.dispatchZoomChangeRequest(displacement);
		}
		else {
			this.shiftView(displacement);
		}
	}

	shiftView(dx) {
		let dPos = Math.ceil(Math.abs(this.transform.x2pos(dx)));
		if(dPos==0)
			return;
		let w = this.endPos - this.startPos;	
//		let f = this.transform.pos2x(w)/w*0.24+.84;
//		let f = this.transform.pos2x(w)/w*0.15+2.1;
		let f = this.transform.pos2x(w)/w*.2+3;
//		let f = this.transform.pos2x(w)/w*.8+5;
		dPos = Math.max(1, Math.round(dPos/f));  //lower sensitivity 
		if((dx > 0 && !this.lr) || (dx < 0 && this.lr)) {
			dPos = Math.min(dPos, this.gutModel.getLength() - this.endPos);
		}
		else {
			dPos = -Math.min(dPos, this.startPos);
		}
		this.startPos += dPos;
		this.endPos += dPos;
		this.transform.setPosOffset(this.startPos);
		this.updateCursorPos(this.cursorPos);	//to limid cursor to the zomm view boundaries when scrolling
		this.dispatchRegionDraged();		
		this.redraw();
	}
		
	updateCursorPos(pos) {
		let newPos = clamp(pos, this.startPos, this.endPos);
		
		let dPos = newPos - this.cursorPos;
		if (dPos == 0) {
			return;
		}
/*		
		if (!this.lr) {
			dPos = -dPos;
		}
		this.cursor.dmove(this.transform.pos2x(dPos), 0);
		this.cursor.text = this.cursor.text.text(Math.round(this.cursorPos) + '');
*/		
		this.cursorPos = newPos;
		this.refreshCursor(newPos);
	}

	updateRoi(roi) {
		this.setRoi(roi)
		this.redraw();
	}
	
	drawPanel() {
		this.initializeCoordinates();
		this.drawGut();
	}

	dispatchRegionDraged() {
		let e = new CustomEvent('region_dragged', {cancelable: true, detail: {pos: this.startPos, 
																			  width: this.endPos - this.startPos, 
																			  cursorPos: this.cursorPos } });
		this.parent.dispatchEvent(e);

	}

	dispatchZoomChangeRequest(displacement) {
		let e = new CustomEvent('zoom_change_request', {cancelable: true, detail: {deltaY: displacement}});
		this.parent.dispatchEvent(e);
	}
	
	toggleLayersVisible() {
		this.layersVisible = !this.layersVisible;
		this.redraw();
	}

	addMarker(pos, branch) {
		if (this.gutModel.getMarker(pos) == -1) {
			let marker = new Marker(pos, '', branch);
			PopupDialogs.markerDialog.open(marker, this.saveMarker.bind(this), this.removeMarker.bind(this));
		}
	}

	saveMarker(marker) {
		this.gutModel.addMarker(marker);
		let markerIcon = this.drawMarker(marker);
		this.markerIcons.push(markerIcon);
	}
	
	removeMarker(marker) {
		this.gutModel.removeMarker(marker);
		let i = -1;
		for(let k=0; i<this.markerIcons.length; k++)
			if(this.markerIcons[k].marker === marker) {
				i = k;				
				break;
			}
		if (i === -1)
			return;
		this.markerIcons[i].clear();
		this.markerIcons[i].remove();
		this.markerIcons.splice(i, i+1);
	}
	
	drawMarker(marker) {
		let x = Math.round(this.transform.getX(marker.pos));
		let y = this.base;
		let d = 10;
		let r = 4;
		let p = `M ${x} ${y} L ${x-r} ${y-d} C ${x-r-2} ${y-d-2*r} ${x+r+2} ${y-d-2*r} ${x+r} ${y-d} z`;	
//		console.log(p);
		let markerIcon = this.ctx.group();
		markerIcon.path(p);
		markerIcon.circle(3).cx(x).cy(y-d-1).stroke({ color: 'black', width: 1 });
		markerIcon.fill(Theme.currentTheme.markerColor);//'none');
		markerIcon.stroke({ color: 'black', width: 1 });
//		path.fill('none')

		UtilityViewer1D.addTooltip(this.ctx, markerIcon, `Marker pos ${marker.pos}`);
		
		markerIcon.on('click', this.handleMarkerClick.bind(this, marker));
		markerIcon.marker = marker;
		return markerIcon;
	}
	
	changeBranch(branch) {
		this.currentBranch = branch;
		
		if (!this.overlapVisible)
			return;
					
		if (this.currentBranch === 0) {		
			for(let markerIcon of this.markerIcons) {
				if(markerIcon.marker.branch === 0) {
					markerIcon.front();
				}
			}
			for(let region of this.regionBoxes) {
				if(region.branch === 0) {
					region.box.front();
					region.title.front();
				}
			}
		}
		else {			
			for(let region of this.regionBoxes) {
				if(region.branch !== 0) {
					region.box.front();
					region.title.front();
				}
			}
			for(let markerIcon of this.markerIcons) {
				if(markerIcon.marker.branch !== 0) {
					markerIcon.front();
				}
			}
		}
	}	

	toggleBranch() {
		this.currentBranch = (this.currentBranch === 0)? 1 : 0;  // 'ileum' : 'colon'
		this.redraw();
	} 

	handleBranchClick() {
		this.toggleBranch();
	}	
		
	handleMarkerClick(marker) {
		if (PopupDialogs.markerDialog.dialog.dialog("isOpen"))
			PopupDialogs.markerDialog.dialog.dialog("close");
		else 
			PopupDialogs.markerDialog.open(marker);
	}
	
	handleRegionClick(region, e) {
		Utility.handleClicks(this.handleRegionSingleClick.bind(this), this.handleRegionDblClick.bind(this), region, e);
	}

	handleRegionSingleClick(region, e) {
		let pos = this.getClickPos(region, e);
		let regionIndex = this.gutModel.findRegionIndex(pos, 2); // 2:'both'
		if(regionIndex.extension != null && regionIndex.main != null) {
			this.toggleBranch();
		}
	}

	handleRegionDblClick(region, e) {
		let pos = this.getClickPos(region, e);
		this.addMarker(pos, region.branch)
	}

	handleRegionNameClick(region, e) {
		PopupDialogs.regionPopup.open(region, e.target);
	}
	
	getClickPos(region, e) {
		let startPos = Math.max(region.startPos, this.startPos);
		let endPos = Math.min(region.endPos, this.endPos);
		let x = this.transform.getX(this.lr ? startPos : endPos);
		//		console.log(x+'  +++  '+ Math.round(this.transform.getPos(x)));
		x += Utility.relativePos(e).x;
		let pos = clamp(Math.round(this.transform.getPos(x)), startPos, endPos);
		return pos;
	}

	toggleLR() {
		this.lr = !this.lr;
		this.transform.setLeft2Right(this.lr);
		this.redraw();
	}


/*


	handleRegionDragStart(e) {
		this.dragOldX = e.detail.box.x; //0;
	}
	handleRegionDrag(e) {
		e.preventDefault();
		let dragX = e.detail.box.x;// - e.target.x.baseVal.value;
		let displacement = dragX - this.dragOldX;
		//console.log(displacement+ '  , ' + this.dragOldX + ' , ' + dragX+ ' ---- ' + e.detail.box.x + ' ----- ' + e.target.x.baseVal.value);
		this.dragOldX = dragX;
		if(displacement == 0)
			return;
//		displacement = clamp(displacement, -5, 5);
for(let regionBox of this.regionBoxes) {
		regionBox.draggable(false);
		regionBox.events["dragmove"] = "";
		regionBox.events["dragstart"] = "";
		regionBox.events["dragend"] = "";
		regionBox.drag = "";
		regionBox.clear();
		regionBox.remove();
}
this.regionBoxes = [];
/*
for(let i=0; i<this.regionBoxes.length; i++) {
		let regionBox = this.regionBoxes.pop();
		regionBox.draggable(false);
}

	handleRegionDrag1(e) {
		e.preventDefault();
		let dragX = e.detail.box.x;// - e.target.x.baseVal.value;
		let displacement = dragX - this.dragOldX;
//console.log(displacement+ '  , ' + this.dragOldX + ' , ' + dragX+ ' ---- ' + e.detail.box.x);
		this.dragOldX = dragX;
		if(displacement == 0)
			return;
//		displacement = clamp(displacement, -5, 5);
		this.shiftView(displacement);
	}
*/
	
	
	
	
	
}

