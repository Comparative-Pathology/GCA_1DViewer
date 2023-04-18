/**
 * @module TabbedPanel
 * @author Mehran Sharghi
 * @export TabbedPanel
 * This module conatins a single class TabbedPanel which implements tabbed panel for GCA viewer.
 */
import {Theme} from './Theme.js'
import { clamp, Utility } from '../GCA_Utilities/src/GCA_Utilities.js'

export { TabbedPanel };

/** @class TabbedPanel implements tabbed panel for GCA viewer. */
class TabbedPanel {
	
	static styleRulesAdded = false;
	
	constructor(container, id, tabNames) {
		this.id = id;
		this.container = container;
		this.tabNames = tabNames;
		this.tabContainers = [];
		this.tabButtons = [];
		this.tabListeners = [];
		this.currentTab = 0;
		this.isAvailable = false;
		this.setStyles();
		let tabClass = 'panel-1D';
		for(let name of this.tabNames) {
			let tabContainer = Utility.addElement(this.container, 'div', `${this.id}-${name}`, `${tabClass}`);
			tabContainer.style.display = 'none';
			this.tabContainers.push(tabContainer);
		}
		this.panelWidth = this.container.clientWidth;
		this.panelHeight = this.container.clientHeight;
		this.isVisible = true;
	}
	
	setContainerSize(w, h, x=0, y=0) {
		this.container.style.height = h + 'px';
		this.container.style.width = `${w}px`;
		this.container.style.top = y + 'px';
		this.container.style.left = x + 'px';
		if(!this.isAvailable) {
			this.init();
			this.isAvailable = true;
		}
		let em = parseFloat(getComputedStyle(this.navBar).fontSize);
		let nbh =  2 + Math.max(0, h-400)/500;
		nbh = clamp(nbh, 1.5, 3) * em - 1;
		this.navBar.style.height = nbh + 'px';
		this.panelWidth = w;
		this.panelHeight = h - nbh; //this.navBar.clientHeight;
    }

	init() {
		this.navBar = Utility.addElement(this.container, 'ul', `${this.id}-nav`, `tabs medium-text`, true);
		let k = 0;
		for(let name of this.tabNames) {
			let tabButton = Utility.htmlToElem(`<li>${name}</li>`);
			this.navBar.appendChild(tabButton);
			this.tabButtons.push(tabButton);
			tabButton.onclick = this.handleTabClick.bind(this, k);
			k++;
		}
		this.tabButtons[this.currentTab].classList.add('current-tab');
		
		
		let font = Theme.currentTheme.coordinateFont;
		this.navBar.style.color = font.fill;
//		this.navBar.style.font = font.family;

		this.tabContainers[this.currentTab].style.display = 'inherit';
	}
	
	setStyles() {
		if(this.styleRulesAdded)
			return;
		this.styleRulesAdded = true;
		let styles = [`margin: 0px;
					padding-left: 10px;
					list-style: none;`,
					
					`display: inline-block;	
					padding: 2px 10px 0px;
					cursor: pointer;
					white-space: nowrap;
					border-top-right-radius: 5px;
					border-top-left-radius: 5px;
					border-bottom: 1px solid #133;
					height: calc(100% - 2.8px);
					color: #444; 
					margin: 0px 2px;`, 
				   
					`color: #222;`,
					
					`color: #222;
					font-weight: bold;
					border-bottom: 1px solid #f6f6f6;`];
					
		Utility.addStyle('ul.tabs', styles[0]);
		this.tabsStyle = Utility.addStyle('ul.tabs li', styles[1]);
		this.tabsHoverStyle = Utility.addStyle('ul.tabs li:hover', styles[2]);
		this.tabsActiveStyle = Utility.addStyle('ul.tabs li.current-tab', styles[3]);
	
		this.updateTheme();		
	}	
	
	handleTabClick(k){
		if(k == this.currentTab)
			return;

		let previousTab = this.currentTab;	
		this.tabButtons[this.currentTab].classList.remove('current-tab');
//		this.tabContainers[this.currentTab].classList.remove('current-tab');
		this.tabContainers[this.currentTab].style.display = 'none';
		this.currentTab = k;
		this.tabButtons[this.currentTab].classList.add('current-tab');
//		this.tabContainers[this.currentTab].classList.add('current-tab');
		this.tabContainers[this.currentTab].style.display = 'inherit';
		if(this.tabListeners[this.currentTab]) {
			let e = new CustomEvent('tabActivated', {});
			this.tabListeners[this.currentTab].dispatchEvent(e);
		}
		if(this.tabListeners[previousTab]) {
			let e = new CustomEvent('tabDeactivated', {});
			this.tabListeners[previousTab].dispatchEvent(e);
		}
	}

	setTabListener(tab, listener, callback) {
		this.tabListeners[tab] = listener;
		listener.addEventListener('tabActivated', callback.bind(listener));	
		listener.addEventListener('tabDeactivated', callback.bind(listener));	
	}
	
	updateTheme() {
		this.tabsStyle.style.backgroundColor = Theme.currentTheme.tabColor;
		this.tabsStyle.style.color = Theme.currentTheme.tabFont.fill;	 
		this.tabsActiveStyle.style.backgroundColor = Theme.currentTheme.tabColorActive;	 
		this.tabsActiveStyle.style.color = Theme.currentTheme.tabFont.fill;	 
		this.tabsActiveStyle.style.borderColor = Utility.colorBlend(Theme.currentTheme.tabColor, Theme.currentTheme.tabColorActive, 0.3);
		this.tabsHoverStyle.style.backgroundColor = Utility.colorBlend(Theme.currentTheme.tabColor, Theme.currentTheme.tabColorActive, 0.3);
		this.tabsHoverStyle.style.color = Theme.currentTheme.tabFont.fill;	 
	}
	
	setVisible(visible) {
		if (this.isVisible == visible)
			return;
		this.isVisible = visible;
		this.container.style.display = this.isVisible? 'inherit' : 'none';
	}
	
	clear() {
		this.container.innerHTML = '';
	}
	
}
