/**
 * @module Utility
 * @author Mehran Sharghi
 * @export Utility, ViewTransform, clamp, capitalizeFirst
 * This module conatins a set of ustility clases and functions that are used by various part of the GCA 1D model viewer. 
 */

const CORS_Allowed = true;  

export { clamp, capitalizeFirst, Utility, Sidebar, getCurrentScriptPath };

let clamp = (val, b1, b2) => ((b1 < b2)? ((val < b1) ? b1 : (val > b2) ? b2 : val) : ((val < b2) ? b2 : (val > b1) ? b1 : val ) );

let capitalizeFirst = (string) => string.toLowerCase().replace(/(^\w|\s\w)/g, m => m.toUpperCase());

// Get the current script file path
let getCurrentScriptPath = function(level=0) {
	// Get the current script file location
	let stackLines = (new Error()).stack.split('\n');
	let callerIndex = 0;
	for(let i in stackLines){
		if(!stackLines[i].match(/(file|http|https|webpack):\/\//)) 
			continue;
		if(stackLines[i].indexOf('getCurrentScriptPath') >= 0 ) 
			continue;
		callerIndex = Number(i);
		break;
	}
	let pathParts = stackLines[callerIndex].match(/(((file|http|https|webpack):\/\/.+\/)([^\/]+\.js))/i);
	let p = pathParts[2].split('\/')
	p.length = Math.max(1, p.length - level - 1);
	return p.join('\/');
};

/** @class Utility encapsulates a set of static utility functions */
class Utility {
	static condenseText(text, width) {
		let str = text.text();
		if (text.length() > width) {
			text.attr('word-spacing', '-1px');
			if (text.length() > width) {
				text.attr('letter-spacing', '0px');
				if (text.length() > width) {
					text.attr('letter-spacing', '-0.2px');
					let i=0;
					while(text.length() > width) {
						if (i>str.length/4) {
							return false;
						}
						str = str.substr(0, str.length-1);
						text.text(str);
						i++;
					}
				}
			}
		}
		return true;
	}

	static relativePos(e, isGroup=false) {
		let target = e.target || e.srcElement;
		if (isGroup) {
			target = target.parentNode || target.parentElement;
		}
		let box = target.getBoundingClientRect();
		return {x: e.clientX - box.left - 1, y: e.clientY - box.top - 1}
	}
	
	// checks for single click & double clicks and calls the appropriate callback 
	static handleClicks(singleClickCallback, doubleClickCallback, ...args) {
		if (! Utility.clickTimer) {
			Utility.clickTimer = setTimeout(function() {
				singleClickCallback(...args);
				Utility.clickTimer = null;
				let k=5;
			}, 200);
		} 
		else {
			clearTimeout(Utility.clickTimer);
			Utility.clickTimer = null;
			doubleClickCallback(...args);
		}
	}
	
	static colorBlend(col1, col2, p=0.5) {
		let usePound = false;
		if ( col1[0] == "#" ) {
			col1 = col1.slice(1);
			usePound = true;
		}
		
		if ( col2[0] == "#" ) {
			col2 = col2.slice(1);
		}
		let num2 = parseInt(col2, 16);
		let p2 = 1 - p;
		let	r2 = clamp(Math.round((num2 >> 16) * p2), 0, 255);
		let	g2 = clamp(Math.round(((num2 >> 8) & 0x00FF) * p2), 0, 255);
		let	b2 = clamp(Math.round((num2 & 0x0000FF) * p2), 0, 255);

		let num1 = parseInt(col1, 16);
		let r = clamp(Math.round((num1 >> 16)  * p + r2), 0, 255);
		r = ((r<16)?'0':'') + r.toString(16);

		let g = clamp(Math.round(((num1 >> 8) & 0x00FF) * p + g2), 0, 255);
		g = ((g<16)?'0':'') + g.toString(16);
		
		let b = clamp(Math.round((num1 & 0x0000FF) * p + b2), 0, 255);
		b = ((b<16)?'0':'') + b.toString(16);
		
		return (usePound?'#':'') + r + g + b;
	}

	static colorShade(col, shade) {
		let usePound = false;
		if ( col[0] == "#" ) {
			col = col.slice(1);
			usePound = true;
		}
		let num = parseInt(col, 16);
		
		let r = clamp(Math.round((num >> 16) * shade), 0, 255);
		r = ((r<16)?'0':'') + r.toString(16);

		let g = clamp(Math.round(((num >> 8) & 0x00FF) * shade), 0, 255);
		g = ((g<16)?'0':'') + g.toString(16);
		
		let b = clamp(Math.round((num & 0x0000FF) * shade), 0, 255);
		b = ((b<16)?'0':'') + b.toString(16);
		
		return (usePound?'#':'') + r + g + b;
	}
	
	static addElement(parent, tag, id, className, prepend=false) {
		let element = document.createElement(tag);
		element.id = id;
		if (prepend) {
			parent.prepend(element);
		}
		else {
			parent.append(element);
		}
		if (className) {
			element.className = className;
		}
		return element;
	}	

	/*
	  @param {String} HTML representing any number of sibling elements
	  @return {NodeList} 
	 */
	htmlToElems(html) {
		let temp = document.createElement('template');
		temp.innerHTML = html;
		return temp.content.childNodes;
	}
	
	static addStyle(selector, rules){
		let style = document.createElement('style');
		style.type = 'text/css';
		document.getElementsByTagName('head')[0].appendChild(style);
		if(!(style.sheet||{}).insertRule) 
			(style.styleSheet || style.sheet).addRule(selector, rules);
		else
			style.sheet.insertRule(selector+" {"+rules+"}",0);
		return style.sheet.rules[0];
	}

	static getStyle(selector) {
		for(let styleSheet of document.styleSheets) {
			let rules = styleSheet.rules || styleSheet.cssRules; 
			for(let rule of rules) {
				if(rule.style === selector) {
					return rule;
				}
			}
		}
	}
	
	static htmlToElem(html) {
		let temp = document.createElement('template');
		html = html.trim(); // Never return a space text node as a result
		temp.innerHTML = html;
		return temp.content.firstChild;
	}

	static innerDimensions = (element) => {  // gives the content dimensions
		let computedStyle = getComputedStyle(element)
		let height = element.clientHeight // height with padding
		let width = element.clientWidth // width with padding
		height -= parseFloat(computedStyle.paddingTop) + parseFloat(computedStyle.paddingBottom)
		height -= parseFloat(computedStyle.marginTop) + parseFloat(computedStyle.marginBottom)
		width -= parseFloat(computedStyle.paddingLeft) + parseFloat(computedStyle.paddingRight)
		width -= parseFloat(computedStyle.marginLeft) + parseFloat(computedStyle.marginRight)
		return { height, width }
	}

	static innerHeight = (element) => {
		let computedStyle = getComputedStyle(element)
		let height = element.clientHeight // height with padding
		height -= parseFloat(computedStyle.paddingTop) + parseFloat(computedStyle.paddingBottom)
		height -= parseFloat(computedStyle.marginTop) + parseFloat(computedStyle.marginBottom)
		return height;
	}

	static innerWidth = (element) => {
		let computedStyle = getComputedStyle(element)
		let width = element.clientWidth // width with padding
		width -= parseFloat(computedStyle.paddingLeft) + parseFloat(computedStyle.paddingRight)
		width -= parseFloat(computedStyle.marginLeft) + parseFloat(computedStyle.marginRight)
		return width;
	}
	
	static fetchShim() {
		if (!CORS_Allowed || navigator.userAgent.indexOf('Chrome') == -1)  //a hack to fix local file fetch in chrome 		
			return;
		if (/^file:\/\/\//.test(location.href)) {
			let path = './';
			let orig = fetch;
			window.fetch = (resource) => ((/^[^/:]*:/.test(resource)) ?
				orig(resource) :
				new Promise(function(resolve, reject) {
					let request = new XMLHttpRequest();
		
					let fail = (error) => {reject(error)};
					['error', 'abort'].forEach((event) => { request.addEventListener(event, fail); });
		
					let pull = (expected) => (new Promise((resolve, reject) => {
						if (
							request.responseType == expected ||
							(expected == 'text' && !request.responseType)
						)
							resolve(request.response);
						else
							reject(request.responseType);
					}));
		
					request.addEventListener('load', () => (resolve({
						arrayBuffer : () => (pull('arraybuffer')),
						blob		: () => (pull('blob')),
						text		: () => (pull('text')),
						json		: () => (pull('json'))
					})));
					request.open('GET', resource.replace(/^\//, path));
					request.send();
				})
			);
		}
	}
	
	static loadJson(url) {
		let obj = undefined;
		let req = new XMLHttpRequest();
		req.open('GET', url, false);
		req.overrideMimeType("text/html");
//		req.overrideMimeType( 'application/json');
		req.send(null);
		if(req.status === 200) {
			obj = JSON.parse(req.responseText);
		}
		return(obj);
	}
		
	// Get the current script file location 
	static getCurrentScriptLocation() {
    	return (new Error()).stack.split('\n')[1].split('@').pop();
	}

	// Get the current script file path
	static getCurrentScriptPath(level=0) {
		let location = Utility.getCurrentScriptLocation();
		let lastIndex = location.lastIndexOf('/');
		let path = '';
		if (lastIndex > 0) { 
			path = location.substr(0, lastIndex);
		}
    	while (level>0 && lastIndex>0) {
			lastIndex = path.lastIndexOf('/', lastIndex);
			if (lastIndex > 0) { 
    			path = path.substr(0, lastIndex);
			}
			level--; 
		}
		return path;
	}
	
	static addStylesheet(ref) {
		if (ref == undefined || ref == null) {
			return;
		}
		let link = document.createElement('link');
		link.rel = "stylesheet";
		link.type = "text/css";
		link.href = ref;
 		document.head.appendChild(link);
	}

}

//===========================================================================
class Sidebar {
	constructor(container, pos, id, content, width, delay=0.5) {
		this.collapsedWidth = '6px'
		this.id = id;
		this.container = container;
		this.position = pos.trim().toLowerCase();
		this.content = content;
		this.width = (typeof width === 'number')? width + 'px' : width;
		this.isCollapsed = true;
		this.sidebar = Utility.htmlToElem(`<div id="${this.id}" class="sidebar"><div id="${this.id}_wrapper"> ${this.content}</div></div>`);
		this.sidebar.onmouseenter = this.open.bind(this);
		this.sidebar.onmouseleave = this.close.bind(this);
		this.container.appendChild(this.sidebar);
		this.wrapper = document.getElementById(`${this.id}_wrapper`);
		this.sidebar.style.width = this.width;
		this.sidebar.style.opacity = "0";
		this.delay = delay;
		this.posDelay = ` ${this.delay}s` 
		switch(this.position) {
			case 'left':
				this.sidebar.style.right = `calc(100% - ${this.collapsedWidth})`;
				break;
			case 'right':
				this.sidebar.style.left = `calc(100% - ${this.collapsedWidth})`;
				break;
		}
		this.isActive = true; 
	}		

	toggleSidebar1() {
		if (this.isCollapsed) {
			this.open();
		}
		else {
			this.close();
		}
	}	
	
	setSidebarCollapse(collapse) { // true/false
		if(!this.isActive) {
			return;
		}
		let pos = collapse? `calc(100% - ${this.collapsedWidth})` : `calc(100% - ${this.width})`;
		switch(this.position) {
			case 'left':
				this.sidebar.style.transition = 'right' + this.posDelay;
				this.sidebar.style.right = pos;
				break;
			case 'right':
				this.sidebar.style.transition = 'left' + this.posDelay;
				this.sidebar.style.left = pos;
				break;
		} 
		this.sidebar.style.transition += collapse? `, opacity ${2*this.delay}s` : `, opacity 0s`;
		this.sidebar.style.opacity = collapse? '0' : '0.92';
		this.isCollapsed = collapse;
	}

	open(){
		if(this.onopen) {
			this.onopen();
		}
		this.setSidebarCollapse(false);
	}	

	close() {
		if(this.onclose) {
			this.onclose();
		}
		this.setSidebarCollapse(true);
	}
	
	hold() {
		this.sidebar.onmouseenter = this.sidebar.onmouseleave = null;
	}
	
	unhold() {
		this.sidebar.onmouseenter = this.open.bind(this);
		this.sidebar.onmouseleave = this.close.bind(this);
	}
	
	setActive(status) {  
		if(!status && !this.isCollapsed) {
			this.toggleSidebar();
		}
		this.isActive = status;
	}
	
	setOnopen(onopen) {
		this.onopen = onopen;
	}
	
	setOnclose(onclose) {
		this.onclose = onclose;
	}
}


