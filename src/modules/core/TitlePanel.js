/**
 * @module TitlePanel
 * @author Mehran Sharghi
 * @export TitlePanel
 * This module conatins a single class TitlePanel which conatins all the functionality required to display 
 * information about a load model in the 1d Viewer.
 */
/**
 * @module TitlePanel
 * @author Mehran Sharghi
 * @export TitlePanel
 * This module conatins a single class TitlePanel which conatins all the functionality required to display 
 * information about a load model in the 1d Viewer.
 */
import { DisplayPanel } from './DisplayPanel.js'
import {Theme} from './Theme.js'
import { PopupDialogs } from './PopupDialogs.js';

export { TitlePanel };

/** @class TitlePanel representing a panel to display High-level information for a GCA 1D gut model */
class TitlePanel extends DisplayPanel{
	/**
	 * Creates an instance of Title panel.  
	 *
	 * @constructor
	 * @param {object} parent represents the parent object for the title panel which is usually an instance of Viewer1D
	 * @param {object} model gut 1D model  
	 * @param {number} height height of the panel
	 * @param {number} vOffset vertical offset of the panel
	 */
	constructor(container, parent, model) {
		super(container, parent, model, 'titleBkgColor');
	}

	draw() {
		let y = this.ctx.height() / 2 - 2;
		let x = 4;
		let gap = 20;

		let title = this.ctx.text('Model: ').font(Theme.currentTheme.titleFontName).addClass('large-text').x(x).cy(y);
		title.build(true);
//		title.tspan( this.gutModel.name).font(Theme.currentTheme.titleFontValueLarge).addClass('large-text').addClass('clickable-title');
		title.tspan( this.gutModel.name).font(Theme.currentTheme.titleFontValue).addClass('large-text').addClass('clickable-title');
		title.on('click', this.handleModelNameClick.bind(this, this.gutModel));
		
/*
		x += title.length() + gap;
		title = this.addTitle('Owner', this.gutModel.getOwner(), x, y);
	
		x += title.length() + gap;
		title = this.addTitle('Species', this.gutModel.getSpecies(), x, y);
		
		x += title.length() + gap;
		this.addTitle('ID', this.gutModel.getId(), x, y);
*/		
//		this.addTitle('Abstract Level', this.gutModel.getAbstractionLevel(), 300, y);
//		this.addTitle('Description', this.gutModel.description, 450, y);
//		this.abstractionLevel = level;

	}
		
	addTitle(name, value, x, y) {
		if(value === undefined || value === null)
			return;
		let text = this.ctx.text(name + ': ').font(Theme.currentTheme.titleFontName).addClass('medium-text').x(x).cy(y);
		text.build(true);
		text.tspan(value).font(Theme.currentTheme.titleFontValue).addClass('medium-text');
		return text;
	}
	
	handleModelNameClick(model, e) {
		PopupDialogs.modelPopup.open(model, e.target);
	}
	
	
	
}
