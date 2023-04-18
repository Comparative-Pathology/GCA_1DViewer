
//import SVG from '../external/@svgdotjs/svg.js/src/svg.js';
//import '../external/svg.js';
import { Theme } from './Theme.js';

export { DisplayPanel };


/** @class SliderPanel representing slider panel for GCA 1D viewer. It used slider vclass to display individual 
 * slider in multi branch gut models
 */
class DisplayPanel extends EventTarget {
	/**
	 * Superclass for display panels in 1D viewer.  
	 *
	 * @constructor
	 * @param {object} parent represents the parent object for the panel which is usually an instance of Viewer1D
	 * @param {object} model gut 1D model  
	 * @param {number} height height of the panel
	 * @param {number} vOffset vertical offset of the panel
	 * @param {boolean} lr false specifes the direction of linear model display from left to right or right to left 
	 */
	constructor(container, parent, model, bkgColorName, isSVG=true) {
		super();
		this.container = container;
		this.parent = parent;
		this.gutModel = model;
		this.isAvailable = false;
		this.panelWidth = container.clientWidth;
		this.panelHeight = container.clientHeight;
		if(isSVG) {
			this.ctx = SVG().addTo(this.container);
		}
		this.bkgColorName = bkgColorName;
		this.straigthCorner = false;
		this.initContext();
		this.isVisible = true;
	}

	initContext() {
		let bkgColor = Theme.currentTheme[this.bkgColorName] || 0;
		if(this.ctx) {
			let r = Theme.currentTheme.corner 
			this.ctx.size(this.panelWidth, this.panelHeight);
			if(this.straigthCorner &&  r > 0) {
				switch(this.straigthCorner) {
					case 'buttom': this.backgroundAdjust = this.ctx.rect(this.panelWidth, r+1).fill(bkgColor).x(0).y(this.panelHeight-r); 
								   break;
					case 'top': this.backgroundAdjust = this.ctx.rect(this.panelWidth, r+1).fill(bkgColor).x(0).y(0);
								break;
				}
			}
			this.background = this.ctx.rect(this.panelWidth, this.panelHeight).move(0, 0)
										.fill(bkgColor).radius(r);
		}
		else {
			this.container.style.backgroundColor = bkgColor; 
			this.container.style.borderRadius = Theme.currentTheme.corner + 'px';
		}
		if(this.panelWidth > 0 && this.panelHeight > 0) {
			this.initializePanel();
			this.isAvailable = true;
		}
	}

	adjustContext() {
		if(!this.ctx)
			return;
		this.ctx.size(this.panelWidth, this.panelHeight);
		this.background.size(this.panelWidth, this.panelHeight);
		if(this.backgroundAdjust) {
			this.backgroundAdjust.size(this.panelWidth, Theme.currentTheme.corner+1);
		}
	}

// override if needed  
	initializePanel() {
	};

	setContainerSize(w, h, x, y) {
//		let m1 = parseInt(this.container.style.marginLeft) + parseInt(this.container.style.marginRight);
//		let m2 = parseInt(this.container.style.marginTop) + parseInt(this.container.style.marginBottom);
		this.container.style.height = `${h}px`;
		this.container.style.width = `${w}px`;
		if(y != undefined && y != null) {
			this.container.style.top = y + 'px';
		}
		if(x != undefined && x != null) {
			this.container.style.left = x + 'px';
		}	
		this.panelWidth = w;
		this.panelHeight = h;
		if(this.isAvailable) {
			this.adjustContext();
		}
		else {
			this.initContext();
		}
	}

	// covers round corners as specified 
	setStraigthCorner(straigthCorner) {		
		this.straigthCorner = straigthCorner;
		if(!straigthCorner) {
			if(this.backgroundAdjust)
				this.backgroundAdjust.remove()
			this.backgroundAdjust = null;
		}
	}

	removeStraigthCorner() {
		this.setStraigthCorner(false);
	}		
	
	resetPanel() {
		this.clear();
		this.initContext();
		this.initializePanel();
	}

	redraw() {
		this.resetPanel();
		this.draw();
	}
	
	draw(){
		if(this.container.clientWidth > 0)
			this.drawPanel();  		// Should be implemented by subclassess
	}	
	
	clear() {
		this.isAvailable = false;
		if(this.ctx) {
			this.ctx.clear();
//			this.ctx.remove();
		}
		else {
			this.container.innerHTML = '';
		}
	}

	handleTabEvents(e) {
		if(e.type === 'tabActivated'){	
			this.redraw();
		}
	}
	
	setPanelVisibility(visible) {
		if (this.isVisible == visible)
			return;
		this.container.style.display = visible? 'inherit' : 'none';
		this.isVisible = visible;
	}
	
}
