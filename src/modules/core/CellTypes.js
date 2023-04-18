/**
 * @module GCA-1D-Model
 * @author Mehran Sharghi
 * @export GutCellTypes
 * This module conatins 4 classes that have been used to represent GCA one dimensional gut model. 
 */
import * as Util from '../GCA_Utilities.js';
export {GutCellTypes};

/** @class Gut representing GCA 1D gut model which consists of  a set of GutRegion objects */
class GutCellTypes {

	loadJsonCellTypes(url) {
		GutCellTypes.visibleIntstinalLayers = []; //'Serosa', 'Muscularis', 'Submucosa', 'Mucosa', 'Lumen'];	
        if (typeof jsonCellTypes !== 'undefined') {
            GutCellTypes.cellTypeData = this.processJsonCellTypes(jsonCellTypes); 
            return Promise.resolve();
        }
        else {
		    GutCellTypes.cellTypeData = null;
	 		let cellTypesFile = url
			if (url == undefined || url == null) {
				cellTypesFile = Util.getCurrentScriptPath(2) + '/cellTypesByRegionAndLayer.json';
			}
		    return fetch(cellTypesFile)
			        .then(response => response.json())
    			    .then(jsonCellTypes => {GutCellTypes.cellTypeData = this.processJsonCellTypes(jsonCellTypes) })
	    		    .catch(err => console.log(`Error laoding cellType data. ${err}`));
        }
	}
	
	processJsonCellTypes(jsonCellTypes) {
		let cellTypes = jsonCellTypes;
		return cellTypes
		
	}
	
	getCellTypeData(id) {
//		let cellTypeData = jsonPath(this.cellTypeData, cellTypePath);
		let cellTypeData = GutCellTypes.findCellTypeById(id);
//		console.log("******CellType Data: "+cellTypeData)
		return cellTypeData;
	}





	static findCellTypeByRegionId(regionId) {
		
		for(let region of GutCellTypes.cellTypeData ) {
			if(region.id == regionId) {
				return region.layerList;
			}
		}
		return null;
	}	
	















	
	static findCellTypeById(id, cellType=null) {
		cellType = (cellType==null)? GutCellTypes.cellTypeData : cellType;
		if (cellType == null) {
			return null;
		}
		
		//old cellType is hirarchical
		if(cellType.doi == id) {
			return cellType;
		}
		if(!cellType.children) {
			return null;
		} 
		for(let child of cellType.children) {
			let childCellType = GutCellTypes.findCellTypeById(id, child);
			if (childCellType) {
				return childCellType;
			}
		}
		return null;
	}	
	
	static findCellTypeByName(name, cellType=null, exactMatch=true) {
		let anatomies  = [];
	 	GutCellTypes.findAnatomiesByName(name, anatomies, cellType, exactMatch);
		return anatomies;
	}
		
	//Private worker method used by findAntoyByName method
	static findAnatomiesByName(name, anatomies, cellType, exactMatch) {
		cellType = (cellType==null)? GutCellTypes.cellTypeData : cellType;
		if (cellType == null) {
			return;
		}
	
		//hirarchical cellType
		if(this.matchCellTypesName(cellType, name, exactMatch)) {
			anatomies.push(cellType);
			return;
		}
		if(!cellType.children) {
			return;
		} 
		for(let child of cellType.children) {
			let childCellType = GutCellTypes.findAnatomiesByName(name, anatomies, child, exactMatch);
			if (childCellType && childCellType.length > 0) {
				anatomies.push(childCellType)
				return;
			}
		}
	}	

	static matchCellTypeName(cellType, name, exactMatch=false) {
		if (exactMatch) {
			return  cellType.abbreviated_name && cellType.abbreviated_name.toUpperCase() == name.toUpperCase() ||
					cellType.abbreviation && cellType.abbreviation.toUpperCase() == name.toUpperCase() ||
					cellType.displayname && cellType.displayname.toUpperCase() == name.toUpperCase() ||
					cellType.text && cellType.text.toUpperCase() == name.toUpperCase() 
		}
		return  cellType.abbreviated_name && cellType.abbreviated_name.toUpperCase().includes(name.toUpperCase()) ||
				cellType.abbreviation && cellType.abbreviation.toUpperCase().includes(name.toUpperCase()) ||
				cellType.displayname && cellType.displayname.toUpperCase().includes(name.toUpperCase()) ||
				cellType.text && cellType.text.toUpperCase().includes(name.toUpperCase()); 
	}


	// returns a boolean array of existing intestine wall layers the item (e.g a region or landmark)
    static getIntestineLayers(item) {
        let cellTypeNode = GutCellTypes.findCellTypeById(item.cellType[0].id);
        let layers = [];
        for (let i = 0; i < GutCellTypes.visibleIntstinalLayers.length; i++) {
            let layer = GutCellTypes.visibleIntstinalLayers[i];
            let layerAnatomies = GutCellTypes.findCellTypeByName(layer, cellTypeNode, false);
            layers[layer] = (layerAnatomies!=null && layerAnatomies.length > 0);
        }
        layers['Lumen'] = true;
		return layers;
    }


}
