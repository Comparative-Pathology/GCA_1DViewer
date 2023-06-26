/**
 * @module MarkerDialog
 * @author Mehran Sharghi
 * @export markerDialog
 * This module conatins a single class MarkerDialog which conatins all the functionality required to display a 
 * dialog to add or update a marker in the gut model. The marker is added or updated using the zoom view section. 
 */

import { Utility } from './GCA_Utilities.js';
/*
if (typeof jQuery === 'undefined') { 
	await import('../external/jquery-ui/external/jquery/jquery.js');
}
await import ('../external/jquery-ui/jquery-ui.min.js');
*/


export { PopupDialog, InfoPopup, MessagePopup, ModelPopup }; 


/** @class PopupDialog encapsulating a simple popup dialog based on the JQuery-UI library dialog. It provids a simple way to steup a dialog 
 * and methods to show, close, handle clicks, and configure the dialog.
 */
class PopupDialog {
	/**
	 * Creates an instance of PopupDialog  
	 *
	 * @constructor
	 * @param {string} dialogName the name of the dialog for internal use in the documnet object model
	 * @param {string} title the display title of the dialog  
	 * @param {string} content content of the dialog in HTML format
	 * @param {object} container container element for the dialog e.g. a DIV
	 * @param {object} config configuration array of key-value pairs as specified by JQuery-UI dialog 
	*/ 
	constructor(dialogName, title, content, container, config) {
		this.dialogName = dialogName;
		let e = Utility.htmlToElem(`<div id="${this.dialogName}-dialog" title="${title}" tabindex="-1">${content}</div>`);
		container.appendChild(e);
		if(config) {
			this.dialog = $(`#${this.dialogName}-dialog`).dialog(config);
			this.setDialogTitle(title);
		}
		else {	
			this.title = title;
		}
		this.init();
	}
	
	static setDialogTheme(background, color, borderColor) {    // Global setting of all dialog themes (background and color)
		let dialogThemeClass = Utility.getStyle('.ui-dialog .ui-dialog-content');
		if(dialogThemeClass ) { 
		    dialogThemeClass.style.backgroundColor = background;
		    dialogThemeClass.style.color = color;
		}
		dialogThemeClass = Utility.getStyle('.ui-dialog .ui-dialog-buttonpane');
		if(dialogThemeClass ) { 
		    dialogThemeClass.style.backgroundColor = background;
		    dialogThemeClass.style.color = color;
		}
		dialogThemeClass = Utility.getStyle('.ui-widget.ui-widget-content');
		if(dialogThemeClass ) { 
		    dialogThemeClass.style.backgroundColor = background;
		    dialogThemeClass.style.borderColor = borderColor;
		}
		dialogThemeClass = Utility.getStyle('.ui-widget-content a');
		if(dialogThemeClass ) { 
		    dialogThemeClass.style.backgroundColor = background;
		    dialogThemeClass.style.color = color;
		}		
		dialogThemeClass = Utility.getStyle('.help-container');
		if(dialogThemeClass ) { 
		    dialogThemeClass.style.backgroundColor = background;
		    dialogThemeClass.style.color = color;
		}

	}
	
	configDialog(config, autoclose=true) {   // autoclose=true the dialog will close on mouseout, autoclos=number dialog will close on mouseout after delay for number milliseconds
		this.dialog = $(`#${this.dialogName}-dialog`).dialog(config);
		this.dialog.on("dialogopen", this.setClickHandler.bind(this));	
		if (autoclose) { 
	//		dialog.mouseleave(this.close.bind(this))
//			let parent = this.dialog[0].parentNode || this.dialog[0].parentElement;
			let parent = this.dialog[0];
			if (Number.isInteger(autoclose)) {
				parent.addEventListener('mouseleave', this.close.bind(this, autoclose));
			}
			else {
				parent.addEventListener('mouseleave', this.close.bind(this));
			}
		}
	}

	setClickHandler() {
		let widget = this.dialog.dialog("widget")[0]
		widget.onclick = this.handleClick.bind(this);	
		for(let el of $(widget).find('.ui-dialog-titlebar-close')) { 
			el.tabIndex = -1;
		}		
	}	
	
	handleClick(e) {		
		e.stopPropagation()		// prevent clicks being 	
	}

	setDialogTitle(title) {
		this.title = title;
		if (this.dialog) {
			this.dialog.dialog({ title: title});
		}
		else {
			$(`#${this.dialogName}-dialog`).dialog({ title: title});
		}		
	}

	close(delay=0) {
		if (delay==0) {
			this.dialog.dialog("close")
		}
		else {
			setTimeout(this.close.bind(this, 0), delay)
		}
	}
}


/**************************************************************************
Information popup Dialog class
 
 */
class InfoPopup extends PopupDialog {
	/**
	 * Creates an instance of Info Popup.  
	 *
	 * @constructor
	 */
	constructor(name, title, content, container) {
		super(name, title, content, container);
		this.configDialog({	autoOpen: false, 
							hide: "fade",
							show : "blind",
//							height: 100,
							buttons: {
								Close: this.close.bind(this)
							}
						});	
	}
	
	close() {
		this.item = null;
		if(this.onclose) {
			this.onclose();
			this.onclose = null;
		}
		this.dialog.dialog( "close" );
	}
	
	open(item, target=null, onclose=null, ) {
		this.onclose = onclose;
		if(this.item === item) {
			this.close();
			return;
		}
		this.item = item;
		if(target) {
			let targetBox = target.getBoundingClientRect();
			this.dialog.dialog({position: {of: window, my: 'left top', at: `left+${targetBox.left + 1} top+${targetBox.bottom + 1}`, collision: 'fit fit'}});
		}
		this.showContent(item);
		this.dialog.dialog("open");
	}
}

/**************************************************************************
Message popup Dialog class
 
 */
class MessagePopup extends InfoPopup {
	/**
	 * Creates an instance of Message Popup.  
	 *
	 * @constructor
	 */
	constructor(container) {
		let content = ` <label id="alert-message" class="text popup-data"></label>`;
		super('message-popup', '3D Model', content, container);
	}
	
	init() {
		this.message = $(`#alert-message`)[0]; 
	}
	
	showContent(message) {
		this.message.textContent = message;
	}
}

/**************************************************************************
Model Information popup Dialog
 
 */
class ModelPopup extends InfoPopup {
	/**
	 * Creates an instance of Model Detail Popup.  
	 *
	 * @constructor
	 */
	constructor(container, title='GCA model') {
		let content = ` <label for="model-name" class="label" >Name:</label>
						<label id="model-name" class="text popup-data"></label>
						<p/>
						<label class="label">Version:</label>
						<label id="model-version" class="text popup-data"></label>
						<p/>
						<label class="label">Species:</label>
						<label id="model-species" class="text popup-data"></label>
						<p/>

						<label class="label">Owner:</label>
						<label id="model-owner" class="text popup-data"></label>
						<p/>
						
						<label class="label">Description:</label>
						<label id="model-desc" class="text popup-data"></label>
						<p/>
						
						<label class="label">Contact:</label>
						<a id="model-contact" href=""></a>`;

						
		super('model-popup', title, content, container);
	}

	open(item, target=null, onclose=null) {
		this.setDialogTitle('GCA ' + (item.type? item.type : '') + ' Model')
		super.open(item, target, onclose);
	}	
	
	init() {
		this.name = $(`#model-name`)[0]; 
		this.version = $(`#model-version`)[0];
		this.desc = $(`#model-desc`)[0];
		this.owner = $(`#model-owner`)[0];
		this.species = $(`#model-species`)[0];
		this.contact = $(`#model-contact`)[0];
		this.contact.blur();
	}
	
	showContent(model) {
		this.name.textContent = model.name;
		this.version.textContent = model.version;
		this.desc.textContent = model.description || model.name;
		this.owner.textContent = model.owner;
		this.species.textContent = model.species;
		this.contact.href = 'mailto:' + model.contact;
		this.contact.textContent = model.contact;
	}
}

