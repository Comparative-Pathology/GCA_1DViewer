/**
 * @module Theme
 * @author Mehran Sharghi
 * @export Theme
 * This module conatins a Theme class and a set of predefined themes for the use of GCA 1D viewer. 
 * Predefined themes are bright (white), nuteral (grey) and dark(black) 
 */

//import SVG from '../external/@svgdotjs/svg.js/svg.js';
//import SVG from '../external/svg.js';
//await import('../external/svg.js');

import { clamp } from '../GCA_Utilities/src/GCA_Utilities.js'
export { Theme };

let commonTheme = {

				roiColor:		{ type: 'radial', stops: [{offset:0, color:'#ffffff', opacity:.6}, {offset:.45, color:'#ffffff', opacity:.35}, {offset:1, color:'#ffffff', opacity:0.1}]}, 
				roiBorder:		{color: '#ff4000', width: 2}, 


				cursor:	{ color: '#55A', stroke: 1 },
				cursorFill:{ color: '#FFF', opacity: 0.9 },

				draggingCursor:	{ color: '#888', stroke: 1 },
				draggingCursorFill:{ color: '#FFF', opacity: 0.7 },

//				zoomCursorColor: 	{ type: 'linear', stops: [{offset:0, color:'#779977'}, {offset:0.5, color:'blue', opacity:0.1}, {offset:1, color:'#7799ff'}] },
				zoomCursorColor: 	{ type: 'linear', stops: [{offset:0, color:'#aaaaff', opacity:0.4}, 
																{offset:0.5, color:'#aaaaff', opacity:0.8}, 
																{offset:1, color:'#aaaaff', opacity:0.4}] },
//				zoomLayersLine:		{color: '#868686', width: 1},															
				zoomLayersLine:		{color: '#ccc', width: 1},															
/*																
				zoomCursorColor: 	{ type: 'linear', stops: [{offset:0, color:'#4444ff', opacity:0}, 
																{offset:0.5, color:'#4444ff', opacity:0.6}, 
																{offset:1, color:'#4444ff', opacity:0}] },
*/																
				landmarkBorderColor:{color: '#aaa', opacity: 0.9},
//				landmarkColor:		{border: '#999', fill: '#a9c797', opacity: 0.85},
				landmarkColor:		{border: '#ddd', fill: '#c5b5b2', opacity: 0.35},

				corner: 			6,
				margin:				5,

			};


let theme1 = {	bkgColor: 			'#605555',
				titleBkgColor:		{ type: 'linear', stops: [{offset:0, color:'#eae8ff'}, {offset:1, color:'#aeabbd'}] }, 
				sliderBkgColor:		{ type: 'linear', stops: [{offset:0, color:'#f6f4ff'}, {offset:1, color:'#d2cfdf'}] },
				zoomBkgColor: 		{ type: 'linear', stops: [{offset:0, color:'#b8b4c8'}, {offset:0.5, color:'#eee9ff'}, {offset:1, color:'#b8b4c8'}] },
				annotationBkgColor1:	{ type: 'linear', stops: [{offset:0, color:'#bcb8c8'}, {offset:0.25, color:'#ece8f4'},{offset:0.5, color:'#f4f0fa'},{offset:0.75, color:'#ece8f4'}, {offset:1, color:'#bcb8c8'}], from: [0, 0], to: [0, 1] },
				annotationBkgColor:	'#ccc8db',
				annotationHighlight:{ color: '#fff', opacity: 0.4 },
							
				gutColor:			{border: '#000', fill: ['#ddd', '#777'], opacity: 0.8},
				gutExtColor: 		{border: '#000', fill: ['#ffeda5', '#a88914'], opacity: 0.8},

				tickPen:			{ color: 'black', width: 1, linecap: 'round' },

				markerColor:		{color: '#F88', opacity: 0.9},

				posFont:			{ fill: 'black' },
				coordinateFont:		{ fill: 'black', weight: 'bold' },
				titleFontNameLarge:	{ fill: 'black', weight: 'bold'  },
				titleFontValueLarge:{ fill: 'blue', weight: 'bold' },
				titleFontName:		{ fill: 'black' },
				titleFontValue:		{ fill: 'blue' },
				landmarkFont:		{ fill: '#33e' },
				landmarkFontBold:	{ fill: '#00e', weight: 'bold' },
				regionFont:			{ fill: '#000' },
//				regionFontZoom:		{ fill: '#fff' },
				regionFontZoom:		{ fill: '#000' },
				annotationFont:		{ fill: 'black', anchor: 'start', weight: 'bold' },
				annotationDescFont:	{ fill: '#555', anchor: 'start', weight: 'bold' },
				annotationPosFont:	{ fill: '#55F', anchor: 'end', weight: 'bold' },
				annotationFontBlur:	{ fill: '#333', anchor: 'start' },
				annotationDescFontBlur:{fill: '#777', anchor: 'start' },
				annotationPosFontBlur:{ fill: '#77F', anchor: 'end' },
				cursorFont:			{ fill: '#559', size:  9, family: 'Arial, Helvetica, sans-serif'  },
				draggingCursorFont:	{ fill: '#99D', size:  9, family: 'Arial, Helvetica, sans-serif'  },
				tabFont:			{ fill: '#000' },
				tabColor: 			'#aca8bb',
				tabColorActive: 	'#d0ccdf'	 

			};
			
let theme2 = {	bkgColor: 			'#646890',//'#626492',
				titleBkgColor:		'#f8ffff',//'#e5e9e5',  
				sliderBkgColor:		'#fff',
				zoomBkgColor: 		'#fff',
				annotationBkgColor:	'#fff',
				annotationHighlight:{ color: '#999', opacity: 0.25 },

				gutColor:			{border: '#000', fill: ['#ddd', '#777'], opacity: 0.8},
				gutExtColor: 		{border: '#000', fill: ['#ffeda5', '#a88914'], opacity: 0.8},

				tickPen:			{ color: 'black', width: 1, linecap: 'round' },

				markerColor:		{color: '#F88', opacity: 0.9},

				posFont:			{ fill: 'black' },
				coordinateFont:		{ fill: 'black', weight: 'bold' },
				titleFontNameLarge:	{ fill: 'black', weight: 'bold' },
				titleFontValueLarge:{ fill: 'blue', weight: 'bold' },
				titleFontName:		{ fill: 'black' },
				titleFontValue:		{ fill: 'blue' },
				landmarkFont:		{ fill: '#77f' },
				landmarkFontBold:	{ fill: '#00e', weight: 'bold' },
				regionFont:			{ fill: '#000' },
//				regionFontZoom:		{ fill: '#fff' },
				regionFontZoom:		{ fill: '#000' },
				annotationFont:		{ fill: 'black', anchor: 'start', weight: 'bold' },
				annotationDescFont:	{ fill: '#555', anchor: 'start', weight: 'bold' },
				annotationPosFont:	{ fill: '#55F', anchor: 'end', weight: 'bold' },
				annotationFontBlur:	{ fill: '#333', anchor: 'start' },
				annotationDescFontBlur:{fill: '#777', anchor: 'start' },
				annotationPosFontBlur:{ fill: '#77F', anchor: 'end' },
				cursorFont:			{ fill: '#66A', size:  9, family: 'Arial, Helvetica, sans-serif'  },
				draggingCursorFont:	{ fill: '#AAE', size:  9, family: 'Arial, Helvetica, sans-serif'  },
				tabFont:			{ fill: '#000' },
				tabColor: 			'#cfcfcf',
				tabColorActive: 	'#f6f6f6'	 

			};
			
var theme3 = {	bkgColor: 			'#111',
				titleBkgColor:		{ type: 'radial', stops: [{offset:0, color:'#666'}, {offset:1, color:'#444'}] },  
				sliderBkgColor:		{ type: 'radial', stops: [{offset:0, color:'#282828'}, {offset:1, color:'#484848'}] },
				zoomBkgColor: 		{ type: 'radial', stops: [{offset:0, color:'#666'}, {offset:0.6, color:'#555'}, {offset:1, color:'#444'}] },
				annotationBkgColor1:	{ type: 'linear', stops: [{offset:0, color:'#404040'}, {offset:0.2, color:'#555555'},{offset:0.5, color:'#606060'},{offset:0.8, color:'#555555'}, {offset:1, color:'#404040'}], from: [0, 0], to: [0, 1] },
				annotationBkgColor:	'#444',
				annotationHighlight:{ color: '#fff', opacity: 0.2 },

				gutColor:			{border: '#eee', fill: ['#c0c0c0', '#909090'], opacity: 0.8},

				gutExtColor: 		{border: '#000', fill: ['#fae09c', '#a66d05'], opacity: 0.8},

				tickPen:			{ color: '#bbb', width: 1, linecap: 'round' },

				markerColor:		{color: '#F88', opacity: 0.9},

				draggingCursor:		{ color: '#777', stroke: 1 },
				draggingCursorFill:	{ color: '#CCC', opacity: 0.7 },

				posFont:			{ fill: '#fff', size:  9, family: 'Arial, Helvetica, sans-serif' },
				coordinateFont:		{ fill: '#fff', size: 11, family: 'Arial, Helvetica, sans-serif', weight: 'bold' },
				titleFontNameLarge:	{ fill: '#fff', size: 12, family: 'Arial, Helvetica, sans-serif', weight: 'bold' },
				titleFontValueLarge:{ fill: '#8f9fff', size: 12, family: 'Arial, Helvetica, sans-serif', weight: 'bold' },
				titleFontName:		{ fill: '#fff', size: 10, family: 'Arial, Helvetica, sans-serif' },
				titleFontValue:		{ fill: '#fff', size: 10, family: 'Arial, Helvetica, sans-serif' },
				landmarkFont:		{ fill: '#4d94ff', size: 9.5, family: 'Arial, Helvetica, sans-serif' },
				landmarkFontBold:	{ fill: '#66a3ff', size: 10, family: 'Arial, Helvetica, sans-serif', weight: 'bold' },
				regionFont:			{ fill: '#fff', size:  9 },
				regionFontZoom:		{ fill: '#fff', size: 11, family: 'Arial, Helvetica, sans-serif' },
				annotationFont:		{ fill: '#fff', size: 10, family: 'Arial, Helvetica, sans-serif' , anchor: 'start', weight: 'bold' },
				annotationDescFont:	{ fill: '#ccc', size: 10, family: 'Arial, Helvetica, sans-serif' , anchor: 'start', weight: 'bold' },
				annotationPosFont:	{ fill: '#bbF', size: 10, family: 'Arial, Helvetica, sans-serif', anchor: 'end', weight: 'bold' },
				annotationFontBlur:	{ fill: '#ddd', size: 10, family: 'Arial, Helvetica, sans-serif' , anchor: 'start' },
				annotationDescFontBlur:{fill: '#aaa', size: 10, family: 'Arial, Helvetica, sans-serif' , anchor: 'start' },
				annotationPosFontBlur:{ fill: '#99F', size: 10, family: 'Arial, Helvetica, sans-serif', anchor: 'end' },
				cursorFont:			{ fill: '#BBE', size:  9, family: 'Arial, Helvetica, sans-serif' },
				draggingCursorFont:	{ fill: '#99C', size:  9, family: 'Arial, Helvetica, sans-serif'  },
				tabFont:			{ fill: '#fff', size: 10, family: 'Arial, Helvetica, sans-serif' , weight: 'bold' },
				tabColor: 			'#383838',
				tabColorActive: 	'#4a4a4a'	 

			};
			
const themes = [theme2, theme1, theme3];  //arraye of predefined theme objects

/** @class Theme provides functionality to access properties of a predefined theme. This is designed based on SVG and svgjs */
class Theme {
	/**
	 * Creates an instance of zoom panel.  
	 *
	 * @constructor
	 * @param {object} context svgjs context to define a new instance of theme
	 * @param {object} theme index to an array of a set of predefined themes  
	 */
/*
	constructor(theme, context=null) {
		this.ctx = context;
		this.theme = (typeof theme === 'number')? themes[theme % themes.length] : theme;
	}
*/

	constructor(container, index) {
		this.ctx = SVG().addTo(container);
		this.ctx.size(100, 20);
		this.currentThemeIndex = index % themes.length;
		this.theme = themes[this.currentThemeIndex];
	}

	static instance = null;
	
	static initialize(container, index=0) {
		this.instance = new Theme(container, index);	
	}	
	
	static get currentTheme() {
		return this.instance;
	}

	static get currentThemeIndex() {
		return this.instance.currentThemeIndex;
	}

	static setTheme(i=0) {
		if (i !== this.instance.currentThemeIndex) {
			this.instance.currentThemeIndex = i % themes.length;
			this.instance.theme = themes[this.instance.currentThemeIndex];
		}	
	};

	static nextTheme(i=null) {
		if (i !== this.instance.currentThemeIndex) {
			this.instance.currentThemeIndex = (i? i : this.instance.currentThemeIndex + 1) % themes.length;
			this.instance.theme = themes[this.instance.currentThemeIndex];
		}	
		return this.instance.currentThemeIndex;
	};

		
	get bkgColor() { return this.color('bkgColor'); }
	get titleBkgColor() { return this.color('titleBkgColor') };
	get bkgColor() { return this.color('bkgColor') };
	get sliderBkgColor() { return this.color('sliderBkgColor') };
	get zoomBkgColor() { return this.color('zoomBkgColor') };
	get annotationBkgColor() { return this.color('annotationBkgColor') };
	get annotationHighlight() { return this.color('annotationHighlight') };

	get zoomCursorColor() { return this.color('zoomCursorColor') };
	get zoomLayersLine() { return this.property('zoomLayersLine') };
	
	get roiColor() { return this.color('roiColor') };
	get roiBorder() { return this.color('roiBorder') };

	get gutColor() { return this.color('gutColor') };
	get gutExtColor() { return this.color('gutExtColor') };
	get landmarkColor() { return this.color('landmarkColor') };

	get corner() { return this.property('corner') };
	get margin() { return this.property('margin') };
	
	get tickPen() { return this.property('tickPen') };

	get cursor() { return this.property('cursor') };
	get cursorFill() { return this.property('cursorFill') };

	get draggingCursor() { return this.property('draggingCursor') };
	get draggingCursorFill() { return this.property('draggingCursorFill') };

	get markerColor() { return this.property('markerColor') };

	get posFont() { return this.property('posFont') };
	get coordinateFont() { return this.property('coordinateFont') };
	get titleFontName() { return this.property('titleFontName') };
	get titleFontNameLarge() { return this.property('titleFontNameLarge') };
	get titleFontValue() { return this.property('titleFontValue') };
	get titleFontValueLarge() { return this.property('titleFontValueLarge') };
	get regionFont() { return this.property('regionFont') };
	get regionFontZoom() { return this.property('regionFontZoom') };
	get landmarkFont() { return this.property('landmarkFont') };
	get landmarkFontBold() { return this.property('landmarkFontBold') };
	get annotationFont() { return this.property('annotationFont') };
	get annotationDescFont() { return this.property('annotationDescFont') };
	get annotationPosFont() { return this.property('annotationPosFont') };
	get annotationFontBlur() { return this.property('annotationFontBlur') };
	get annotationDescFontBlur() { return this.property('annotationDescFontBlur') };
	get annotationPosFontBlur() { return this.property('annotationPosFontBlur') };
	get cursorFont() { return this.property('cursorFont') };
	get draggingCursorFont() { return this.property('draggingCursorFont') };
	get tabFont() { return this.property('tabFont') };
	get tabColor() { return this.color('tabColor') }; 
	get tabColorActive() { return this.color('tabColorActive') }; 

	property(name) {
		let prop = this.theme[name]; 
		if(prop === undefined || prop === null)
			return commonTheme[name];
		return prop;
		
	}

	color(name) {
		let colorProp = this.property(name);
		if(colorProp === undefined || colorProp === null)
			return 0;

		if (colorProp.type === undefined)
			return colorProp;
			
 		let g = this.ctx.gradient(colorProp.type);

		for(let step of colorProp.stops) {
			g.stop(step.offset, step.color, step.opacity );
		}
		if (colorProp.from != undefined)
			g.from(colorProp.from[0], colorProp.from[1]);
		if (colorProp.to != undefined)
			g.to(colorProp.to[0], colorProp.to[1]);

 		return g;
	}	
	
	gradientColorS3(color, opacity1, opacity2, start, end, mid=(start+end)/2) {
 		let g = this.ctx.gradient('linear');
		mid = clamp(mid, start, end);
		let f = 1 - (mid-start) / Math.abs(end - start);
		g.stop(0, color, opacity1 );
		g.stop(f, color, opacity2 );
		g.stop(1, color, opacity1 );
	
		return g;
	}
	
	gradientColorS5(color, opacity1, opacity2, start, end, mid=(start+end)/2) {
 		let g = this.gradientColorS3(color, opacity1, opacity2, start, end, mid);
		mid = clamp(mid, start, end);
		let f = 1 - (mid-start) / Math.abs(end - start);
		g.stop(f/4, color, (opacity1+opacity2)/2 );
		g.stop(1-f/4, color, (opacity1+opacity2)/2 );
	
		return g;
	}

} 
