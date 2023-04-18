/**
 * @module AnnotationPanel
 * @author Mehran Sharghi
 * @export AnnotationPanel
 * This module conatins a two classes Annotation and AnnotationPanel which conatins all the functionality required to display a 
 * annotation view for the region of interest in the GCA 1D model viewer.
 */

import { DisplayPanel } from './DisplayPanel.js'
import { Theme } from './Theme.js'
import { UtilityViewer1D } from './Utility.js';
import { openUberonLink } from './UberonPanel.js';

export { AnnotationPanel };


/** @class Annotation encapsulate information associatd with single annotation in GCA 1D gut model */
class Annotation {
	/**
	 * Creates an instance of Annotation  
	 *
	 * @constructor
	 * @param type type of the annotation
	 * @param {string} title title of the region  
	 * @param description
	 * @param {number} pos location of the annotation from the beginning of gut model
	 * @param {string} link reference to external source
	 */
	constructor(type, title, description, pos, link=null) {
		this.type = type;
		this.title = title;
		this.description = description;
		this.pos = Array.isArray(pos)? pos : this.pos = [pos]; 
		this.link = link;
	}	
	
	static compare(a, b) {
		if (a.pos[0] > b.pos[0]) 
			return 1;
		if (a.pos[0] < b.pos[0]) 
			return -1;
		if (a.type == 'Region') 
			return (b.type == 'Landmark')? 1 : 0;  
		if (a.type == 'Landmark')
			return (b.type == 'Landmark')? 0 : -1;  
		return 0;
	}
}

/** @class AnnotationPanel representing annotation view for GCA 1D gut model */
class AnnotationPanel extends DisplayPanel {
	/**
	 * Creates an instance of Annotation panel.  
	 *
	 * @constructor
	 * @param {object} parent represents the parent object for the annotation view which is usually an instance of Viewer1D
	 * @param {string} model gut 1D model  
	 * @param {boolean} absolutePositions specifes the display of positions being absolute values from the model statr or relative to the model regions   
	 * @param {number} width width of the annotation panel
	 * @param {number} height height of the annotation panel
	 * @param {object} roi represents the region of interest in the gut usually provided by the slider panel 
	 * @param {boolean} lr specifes the direction of the linear model display from left to right or right to left 
	 */
	constructor(container, parent, model, absolutePositios=true) {
		super(container, parent, model, 'annotationBkgColor');
		this.populateAnnotations();
		this.absolutePositions = absolutePositios
		this.roi = null;
	}

	initializePanel() {
/*		 
		this.tabHeight = 20;
//		this.tabShape = "M116.486,29.036c-23.582-8-14.821-29-42.018-29h-62.4C5.441,0.036,0,5.376,0,12.003v28.033h122v-11H116.486z";
		let d = 2;
		this.tabShape = `M116.486,29.036c-23.582-8-14.821-29-42.018-29h-62.4C5.441,0.036,0,5.376,0,12.003v${d+17.033}h122v-${d}H116.486z`;
	this.tabs = [];	
	this.tabs[1] = this.initialiseTabCtx(this.parent.ctx, 1, "Tab-2", x, y, panelWidth, panelHeight);
	this.tabs[1].ctx.rect(200, 100).fill('red').move(50,30);
	this.tabs[2] = this.initialiseTabCtx(this.parent.ctx, 2, "Tab-3", x, y, panelWidth, panelHeight);
	this.tabs[2].ctx.circle(100).fill('green').move(50,20);

	this.tabs[0] = this.initialiseTabCtx(this.parent.ctx, 0, "Tab-1", x, y, panelWidth, panelHeight);
	this.bkgCtx = this.tabs[0].bkgCtx;
	this.ctx = this.tabs[0].ctx;	
	this.tabs[0].tabShape.fill(Theme.currentTheme.annotationTabColorActive);		
	this.tabs[0].title.font(Theme.currentTheme.annotationTabFontActive);
	this.currentTab = 0;	
*/		

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
						.on('mouseleavet', this.removeHighlightAnnotation.bind(this));

								
		// a seprate contex used to easly clear the zoom panel and redraw
		tab.ctx = this.parent.ctx.nested();
		tab.ctx.size(paneWidth, paneHeight).move(x, y + this.tabHeight);
		tab.ctx.lineWidth = 1;
		
//		tab.tabShape = ctx.path(this.tabShape).transform({scaleX:1, scaleY:1}).fill('blue');//Theme.currentTheme.annotationBkgColor);
		let cy = y+this.tabHeight/2 +1 ;
		let tabX = x + 100*index;
		
//		tab.tabShape = ctx.path(this.tabShape).fill(Theme.currentTheme.annotationTabColor).stroke({ color: '#fff', width: 1, linecap: 'round', linejoin: 'round' });		
		tab.tabShape = ctx.path(this.tabShape).fill(Theme.currentTheme.annotationTabColor);		
		tab.tabShape.x(tabX).cy(cy).transform({scaleX:1, scaleY:.7});//.width(null,50);
		tab.tabShape.on('click', this.handleTabClick.bind(this, tab.index));
		tab.x = tabX;
		tab.y = cy;
		tab.title = ctx.text(title).font(Theme.currentTheme.annotationTabFont).addClass('medium-text');
		tab.title.x(tabX+6).cy(cy); 		
		tab.title.on('click', this.handleTabClick.bind(this, tab.index));
		
		return tab;
	}
*/

		
	handleTabEvents(e) {
		super.handleTabEvents(e)   //from class DisplayPanel
		
//		this.activateTab(index);	
	}
	
/*	
	activateTab(index) {
		for(let k=0; k<this.tabs.length; k++) {
			if(k != index) {
				this.tabs[k].bkgCtx.hide();
				this.tabs[k].ctx.hide();
//				this.tabs[k].tabShape.clear();		
				this.tabs[k].tabShape.show(this.tabShape).fill(Theme.currentTheme.annotationTabColor);		
				this.tabs[k].title.font(Theme.currentTheme.annotationTabFont);
			} 
			this.tabs[index].bkgCtx.show();
			this.tabs[index].ctx.show();
//			this.tabs[index].tabShape.clear();		
//			this.tabs[index].tabShape.plot(this.tabShape).fill(Theme.currentTheme.annotationTabColorActive);		
			this.tabs[index].tabShape.show().fill(Theme.currentTheme.annotationTabColorActive);		
			this.tabs[index].title.show().font(Theme.currentTheme.annotationTabFontActive);

		}

	}
*/
	
	populateAnnotations() {
		this.annotationList = new Array();
		for(let region of this.gutModel.regions) {
/*			
			let annotation = new Annotation('Region', 
										'Start of ' + region.name, 
										this.replaceUndefined(region.description), 
										region.startPos);
			this.annotationList.push(annotation);
			annotation = new Annotation('Region', 
									'End of ' + region.name, 
									this.replaceUndefined(region.description),
									region.endPos);
			this.annotationList.push(annotation);
*/
			let annotation = new Annotation('Region', 
										'Region: ' + region.name, 
										this.replaceUndefined(region.description), 
										[region.startPos, region.endPos]);
			annotation.uberonId = region.uberonId? region.uberonId.replace(':', '_') : null;
			this.annotationList.push(annotation);
		}


		for(let landmark of this.gutModel.landmarks) {
			if (landmark.type == 'pseudo') {
				continue;
			}
			let pos = landmark.position;
			if(landmark.startPos != landmark.endPos) {
				pos = [landmark.startPos, landmark.endPos];
			}
			let annotation = new Annotation('Landmark', 'Landmark: ' + landmark.title, 
										this.replaceUndefined(landmark.description), pos);
			annotation.uberonId = landmark.uberonId? landmark.uberonId.replace(':', '_') : null;
			this.annotationList.push(annotation);
		}
		
		this.annotationList.sort(Annotation.compare);
//		for(let annotation of this.annotationList)
//			console.log(annotation.pos + "\t" + annotation.title);

	}
	
	setGutModel(gutModel) {
		this.gutModel = gutModel;
		this.populateAnnotations();
	}
	
	replaceUndefined = (s) => (s === undefined || s === null)? '' : s;



	getVisibleAnnotations(roi) {
		let startPos = roi.pos;
		let endPos = roi.pos + roi.width;
		let text = this.ctx.text(' 8888-8888').font(Theme.currentTheme.annotationPosFont).addClass('medium-text');
		let bbox = text.bbox();
		let bbh = Math.max(bbox.h, 12);  
		text.remove();
		let lineSpace = 2;
		
		let maxLine = Math.round((this.ctx.height() -bbh + 2*lineSpace) / (bbh + lineSpace));

		// find start and end annotationList index corresponding to the zoom window
		let start = 0;
		while (this.annotationList[start].pos[0] < startPos) {
			start++;
			if (start >= this.annotationList.length) {
				start--;
				break;
			}
		}
		if (this.annotationList[start].pos[0] > endPos) 
			start = Math.max(0, start-1);
		let end = this.annotationList.length-1;
		while (this.annotationList[end].pos[0] > endPos)
			end--;
/*			
		if (this.annotationList[end].pos[0] < startPos) 
			end = Math.min(this.annotationList.length-1, end+1);
*/
		// find start and end annotationList index for display
		let n = end - start + 1;
		let startIndex = 0;
		let endIndex = 0;
		if (n > maxLine) { //not enough space for all
			let over = n - maxLine;
			let over2 = Math.floor(over/2);
			startIndex = start + over2;
			endIndex = end - (over - over2);
		}
		else {	// extra space available, display more lines 
			let extraSpace = maxLine - n;
			let extraSpace2 = Math.floor(extraSpace /2);
			let available1 = start;
			let available2 = this.annotationList.length - end - 1;
			let minAvailable = Math.min(available1, available2);
			if (minAvailable <= extraSpace2) {
				if (available1 < available2) {
					startIndex = 0 
					endIndex = startIndex + maxLine - 1; 
				}			
				else {
					endIndex = this.annotationList.length - 1;
					startIndex = endIndex - maxLine + 1;
				}		
			} 
			else {
				startIndex = start - extraSpace2;
				endIndex = end + (extraSpace - extraSpace2);
			}
		}
		let hasPrev = false;
		if (startIndex > 0) {
			hasPrev = true;
			startIndex++;
		}

		let hasNext = false;
		if (endIndex < this.annotationList.length-1) {
			hasNext = true;
			endIndex--;
		}
		startIndex = Math.max(0, startIndex);
		endIndex = Math.min(this.annotationList.length-1, endIndex);

		let highlightStart = 0		
		let highlightEnd = -1
		let visibleList = []
		let vi = -1		
		// Populate visible annotation list
		for(let i=startIndex; i<=endIndex; i++) {
			let annotation = this.annotationList[i];
			visibleList.push(annotation)
			vi++;
			if (i==start) {
				highlightStart = vi
			}
			if (i==end) {
				highlightEnd = vi
			}	
		}
		if (highlightEnd < 0) {
			highlightEnd = visibleList.length - 1;	
		}
		return {list: visibleList, start: highlightStart, end:highlightEnd,
				hasPrev: hasPrev, hasNext:hasNext };
	}


	// insert item into list at location index, if item is in the array it moves to location index
	insertOrMove(item, list, index) {
		if (item == null) {
			return index;
		}
		
		let i = list.indexOf(item);
		if(i >= index) {
			return index;
		}
		
		list.splice(index, 0, item);
		if(i >= 0) {
			list.splice(i, 1);
			index--;
		}
		else {
			if(index > 0) {
				list.splice(0, 0);  //remove first element
				index--
			}
			else {
				list.pop();  //remove last element
			} 
		}
		return index;
	}
		

	showAnnotations(roi) {
		let gap1 = 10;
		let margin = 5;
		let text = this.ctx.text(' 8888-8888').font(Theme.currentTheme.annotationPosFont).addClass('medium-text');
		let bbox = text.bbox();
		let bbh = Math.max(bbox.h, 12);  
		
		text.remove();
		let lineSpace = 2;

		let visibleAnnotations = this.getVisibleAnnotations(roi)

		// check for a reging/landmark that overlaps with the start of ROI
		let startRegionAnnotation = null					 
		let startLandmarkAnnotation = null					 
		for(let annotation of this.annotationList) {
			if (annotation.type.toLowerCase() == 'region' &&
				 annotation.pos[0] < roi.pos && annotation.pos[1] > roi.pos) {
				startRegionAnnotation = annotation;
			}
			
			if (annotation.type.toLowerCase() == 'landmark' &&
				annotation.pos[0] < roi.pos && annotation.pos[1] > roi.pos) {
				startLandmarkAnnotation = annotation;
			}
		}
		let highlighted = visibleAnnotations.end - visibleAnnotations.start + 1
		if(highlighted < visibleAnnotations.list.length) { //there is space to add new highlight   
			visibleAnnotations.start = this.insertOrMove(startRegionAnnotation, 
														 visibleAnnotations.list, 
														 visibleAnnotations.start)
 		}
			
		highlighted = visibleAnnotations.end - visibleAnnotations.start + 1
		if(highlighted < visibleAnnotations.list.length) { //there is space to add new highlight   
			visibleAnnotations.start = this.insertOrMove(startLandmarkAnnotation, 
														 visibleAnnotations.list, 
														 visibleAnnotations.start)
 		}
		
		// display annotationList items
		let y = lineSpace + bbh;
		if(visibleAnnotations.hasPrev) {
			text = this.ctx.text('').addClass('medium-text').y(y);			
			text.build('true');
			text.tspan('...').font(Theme.currentTheme.annotationFont).x(30);
			y += bbh + lineSpace;
		}
		for(let i=0; i<visibleAnnotations.list.length; i++) {
			let annotation = visibleAnnotations.list[i];
			text = this.ctx.text('').addClass('medium-text').y(y);			
			text.build('true');
			let f1 = Theme.currentTheme.annotationPosFont;
			let f2 = Theme.currentTheme.annotationFont;
			let f3 = Theme.currentTheme.annotationDescFont;
			if (i<visibleAnnotations.start || i>visibleAnnotations.end) {
				f1 = Theme.currentTheme.annotationPosFontBlur;
				f2 = Theme.currentTheme.annotationFontBlur;
				f3 = Theme.currentTheme.annotationDescFontBlur;				
			}
			let pos = annotation.pos[0] + ((annotation.pos.length>1)? ' - ' + annotation.pos[1] : '');
			if(this.absolutePositions) {
				text.tspan(pos).font(f1).x(bbox.width + margin);
				text.tspan(annotation.title).font(f2).x(bbox.width + margin + gap1 );
			}
			else {
				text.tspan(annotation.title).font(f2).x(margin );
			}
			text.tspan(annotation.description).font(f3).dx(gap1);

			let d = 14;
			let x = this.ctx.width() - d;
			let img = 'colon.svg';
			if (annotation.uberonId) {
				let icon = UtilityViewer1D.showIcon(this.ctx, img, d, x, text.cy(), 'Uberon Ontology', 1, 0)
					.on('click', this.handleUberonLinkClick.bind(this, annotation.uberonId))
//						icon.on('mouseenter', this.highlightAnnotation.bind(this, bbox.height+4, text.cy(), icon));
//						icon.on('mouseleave', this.removeHighlightAnnotation.bind(this));
						icon.on('mouseover', this.highlightAnnotation.bind(this, bbox.height+4, text.cy(), icon));
						icon.on('mouseout', this.removeHighlightAnnotation.bind(this));
				icon.css('cursor', 'pointer');
			}
			y += bbh + lineSpace
		}
		if(visibleAnnotations.hasNext) {
			text = this.ctx.text('').addClass('medium-text').y(y);			
			text.build('true');
			text.tspan('...').font(Theme.currentTheme.annotationFont).x(30);
			y += bbh + lineSpace;
		}
	}


	handleUberonLinkClick(uberonId) {
		openUberonLink(uberonId);	
	}
	
	removeHighlightAnnotation(e) {
		if (this.highlightRect) {
			this.highlightRect.remove();
			this.highlightRect = null;
		}
	}
	
	highlightAnnotation(h, cy, icon) {
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
		this.showAnnotations(this.roi);
	}

}
