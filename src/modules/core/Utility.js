/**
 * @module Utility
 * @author Mehran Sharghi
 * @export UtilityViewer1D, ViewTransform
 * This module conatins a set of ustility clases and functions that are used by various part of the GCA 1D model viewer. 
 */

export { ViewTransform, UtilityViewer1D };
import { clamp, getCurrentScriptPath } from '../GCA_Utilities/src/GCA_Utilities.js'

/** @class UtilityViewer1D encapsulates a set of static utility functions */
class UtilityViewer1D {
	static addTooltip(ctx, elm, text) {
		let tooltip = ctx.element('title').words(text);
		tooltip.addClass('tooltip');
		elm.put(tooltip);
	}

	static showIcon( ctx, file, size, cx, cy, tooltip=null, scale=.93, margin=null, bkgColor={ color: '#ddd', opacity: 0.58 }) {
		size = Math.min(size, Math.min(ctx.height(), ctx.width()) - 2);
		let icon = ctx.group();
		let corner = Math.max(3, .15*size); 
		margin = (margin==null)? Math.max(1, (1-scale)*size) : margin;
		icon.rect(size, size).radius(corner).fill(bkgColor);
//		icon.circle(size).fill(bkgColor);
		let d = size - 2*margin;
		

		if (typeof viewer1dIcons !== 'undefined' ) {
			icon.image(viewer1dIcons[file]).size(d, d).move(margin, margin);
		}
		else {
			let path = getCurrentScriptPath(2);
			icon.image(path + '/Icons/' + file).size(d, d).move(margin, margin);
		}
 
		icon.move(cx - size/2, cy - size/2);
		if(tooltip != null) {
			UtilityViewer1D.addTooltip(ctx, icon, tooltip);
		}

		icon.css({cursor: 'pointer'});
		return icon;
	}	
}


/** @class ViewTransform provides functionality to tarnsform from screen coordinate to gut position and vice versa */
class ViewTransform {
	/**
	 * Creates an instance of the viewTransform.  
	 *
	 * @constructor
	 * @param {number} width total width used to display gut linear model in terms of screen coordinate  
	 * @param {number} length total length of the gut linear model in gut coordinate
	 * @param {boolean} lr specifes the direction of the linear model display from left to right or right to left 
	 * @param {number} posOffset offset applied to gut coordinates
	 * @param {number} margin margin around the gut when displayed in width pixels 
	 * @param {number} xOffset offset applied to screen coordinates
	 */
	constructor(width, length, lr, posOffset=0, margin=2, xOffset=0) {
		this.width = width;
		this.length = length;
		this.lr = lr;
		this.margin = margin;
		this.posOffset = posOffset;
		this.xOffset = xOffset;
		this.scale = (length > 0)? (width - 2 * margin) / length : 0;
	}

	pos2x(v) {
		return v * this.scale;
	}

	x2pos(v) {
		return v / this.scale;
	}

	getX(pos, elementWidth = 0) {
		let distance = pos - this.posOffset + (this.lr ? 0 : elementWidth);
		let w = distance * this.scale;
		if (this.lr)
			return this.margin + w + this.xOffset;
		return this.width - this.margin - w - this.xOffset;
	}

	getPos(x, elementWidth = 0) {  //elementWidth in Gut scale
		let w = (this.lr ? x - this.xOffset : this.width - x - this.xOffset) - this.margin;
		let posDistance = w / this.scale + this.posOffset;
//		return Math.round(posDistance - (this.lr ? 0 : elementWidth));
		return (posDistance - (this.lr ? 0 : elementWidth));
	}

	getMargin() {
		return this.margin;
	}
	
	setLeft2Right(lr) {
		this.lr = lr;
	}

	setWidth(width) {
		this.width = width;
		this.scale = (this.length > 0)? (this.width - 2 * this.margin) / this.length : 0;
	}
	
	setPosOffset(posOffset) {
		this.posOffset = posOffset;
	}

	setXOffset(xOffset) {
		this.xOffset = xOffset;
	}

	setLength(length) {
		this.length = length;
		this.scale = (this.width - 2 * this.margin) / length;
	}
	
	clampPos(pos) {
		return clamp(pos, this.posOffset, this.length + this.posOffset);
	}
}


