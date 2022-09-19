import './css/GCA_1DViewer.css'
import './modules/GCA_Utilities/external/jquery-ui/jquery-ui.min.css';
import './modules/GCA_Utilities/src/GCA_Utilities.css';


import anatomyData from './gca_anatomy_h_v1.json'
import modelData from '../models/EdinGCA_1D_00010_1_15.json'

window.viewer1dIcons = importAll(require.context('./Icons', false, /\.svg$/));
window.jsonAnatomy = anatomyData;
window.cssImported = true;

function importAll(r) {
  let images = {};
  r.keys().map((item, index) => { images[item.replace('./', '')] = r(item); });
  return images;
}

export { Viewer1D } from './Viewer1D.js'


