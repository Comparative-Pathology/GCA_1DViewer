<link rel="stylesheet" href="./help/help.css"></link>

# Edinburgh Gut Cell Atlas 1D Model Viewer
The Edinburgh Gut Cell Atlas 1D viewer is a web-based application to view and browse an abstract 1D model of the human gut. It provides an interactive tool to display locations and map data in the context of our abstract 1D models. The viewer accepts the gut 1D model in JSON format as defined by the Edinburgh Gut Cell Atlas project. Currently, it includes an abstract 1D model.

<br><br><br><br><br><br>
---

## Basic Usage
The 1D model viewer is divided into three sub-panels: the [slider panel](#slider-panel) (top), the
[zoom panel](#zoom-view) (bottom left), and the [annotation panel](#annotation-panel) (bottom right),
 see figure 1. The [slider panel](#slider-panel) displays the abstract gut model in a linear format
  with a proportionate scale. The viewer display can be shrunk to only display the slider
 panel or expanded to display all the tree panels. This is done by clicking the up/down arrow icon on the top right corner.  
There are two modes for displaying the coordinates and positions. These are absolute and proportional. In the
absolute mode, all the coordinates values are specified in millimeters. In the proportional mode, all the values
are displayed in terms of a percentage distance from an intestinal region. The GCA abstract 1D model
consists of two branches representing the colon and the ileum. The colon is divided into regions
displayed in different colors. The GCA 1D model also consists of a set of landmarks that are specified
with a vertical line in the display associated with a title and relative position from the start point
of the model. A mouse over the titles of a region or landmark will show a brief description; a click on
 a region’s title will display further details about the region in a pop-up window.

<img src="./help/images/fig1.png" width="95%" alt="1D Viewer" title="The 1D Viewer has three panels: slider panel, zoom panel, and annotation panel"/>


<br><br><[back to the top]><br><br><br>


### Sliders panel

The slider panel provides a top-level view of the model with the possibility to interactively select a region
 of interest (ROI). There are different modes for displaying the model including the colon and the ileum
 in separate tracks, the colon, and ileum in one track or displaying each of the colon and ileum alone.
 These can be selected using the [configuration](#configuration).  
 The ROI is adjustable and displayed over a slider as a red rectangle. The ROI specifies the part
  of the model that is being displayed in the zoom panel and the annotation panel. The red rectangle
  can be dragged to the desired position using the mouse (or a pointing device). It can also be placed
  directly on the 1D model by clicking on the desired location in any of the branches of the model.
  The position on the ROI can also be adjusted by using a mouse wheel (or a scrolling gesture) in the
  zoom panel. The ROI is a common feature and is displayed on all individual models. These regions of
   interest and the current locations are all linked in the viewer so selecting these in one model
    displays the corresponding locations and regions of interest in all the other models.
    The size of the ROI is set to 200mm by default, but it can be changed using the two-way arrow icon on
     the top right. Clicking on this item opens the [ROI setting](#setting-region-of-interest) dialog.

<br><br><[back to the top]><br><br><br>

### Zoom view

The zoom panel displayed at the bottom corner of the 1D model display is a focused view of
the region of interest. This can be used to get further information about the locations and
extent of the current region of interest. The extent of the ROI is shown in absolute/relative
distance from the start point of the model and relative distance from the gut regions where the
ROI currently starts and ends. The zoom panel can potentially be used for adding annotations to
 the abstract model in future developments. The intestinal wall layers are displayed by default which
 can be changed in the viewer setting.
 
<br><br><[back to the top]><br><br><br>

### Annotation panel

The annotation panel is displayed on the bottom right of the 1D model and consists of two tabs.
The “Anatomy” tab is a textual representation of the 1D model artifacts across the current ROI.
The items that fall inside the ROI are displayed with a boldface font. This information is updated
 as the ROI changes. A colon icon is printed along with the anatomy terms that are also available
 on the EBI ontology search (OLS). Clicking this icon will link to the OLS web page for the item
 in a new tab/window.
 
 The second tab in this panel is “Uberon” which contains a list of relevant Uberon terms including
  ids and a brief description. The list serves as a handy reference to Uberon ids where the terms
   are linked to the OLS web pages if further detail is needed.
   
<br><br><[back to the top]><br><br><br>

---

## Setting Region Of Interest

You can adjust the width of the current region of interest by using the mouse wheel while hovering on
 the region of interest in the slider panel. If a precise setting is required you can use the ROI setting
  dialog to do so by clicking on the two-sided arrow icon on the top right of the panel. Depending on the
   current mode of displaying positions (i.e. relative or absolute) one of the following dialogs will pop up.

*The absolute mode​*

<img src="./help/images/fig2-1.png" width="40%" alt="ROI setting absolute mode" title=" Dialog to set ROI when relative display mode s selected"/>

In the absolute mode when changing ROI extent the middle position of the ROI is fixed by default. You can
 change the width of the ROI using the slider control on top o the input box beside it. Changing the width
  of ROI will change both the Proximal and Distal position of the ROI. If you set the checkbox on the left
   of either of proximal or distal positions of the ROI it will set or locks that position. In this case,
    the default behaviour of keeping the middle position fixed when the ROI width is changed will be overridden. 

*The relative Mode​*

<img src="./help/images/fig2-2.png" width="40%" alt="ROI setting relative mode" title=" Dialog to set ROI when relative display mode s selected"/>

In the relative mode ROI setting dialogue, there are three controls allowing to set the extent of the ROI and the position of the cursor inside the ROI. The Distal and Proximal controls are to set the distal position (closer to the anus) and the proximal position (further away from the anus) of the ROI. These positions can be set by either a slider control which moves the position across the whole track or by selecting a region from a drop-down list and setting a percentage distance from the start of the selected region. The cursor position can be set in the same manner within the boundaries of the ROI.

<br><br><[back to the top]><br><br><br>

---

## Configuration

Clicking on the wheel icon on the top right of the panel will bring up a dialog pop-up as shown below where you can adjust available settings for the viewer. Some of the properties that you can change using this interface include the display theme, display of the tracks in the slider panel, display of the intestinal wall layers in the zoom view, and display of positions in the absolute or relative format in the slider panel and zoom view. The setting will be stored on your local browser storage hence these will be remembered when you use the application again on the same machine and browser. will remain on the  

<img src="./help/images/fig3.png" width="40%" alt="Configuring Viewer" title="Dialog to set the user preferences"/>

<br><br><[back to the top]><br><br><br>

---

## About

Edinburgh 1-D linear atlas and viewer developed as part of the Helmsley Gut Cell Atlas initiative for use by the
<a href="https://www.ed.ac.uk/comparative-pathology/the-gut-cell-atlas-project">Gut Cell Atlas Project</a>
funded by the <a href="https://helmsleytrust.org/"> Helmsley Charitable Trust</a>.

Version: 1.0

Contact: M.Arends@ed.ac.uk

<br><br><[back to the top]><br><br><br>


[back to the top]: #edinburgh-gut-cell-atlas-1d-model-viewer "go to the top of the page"
 
