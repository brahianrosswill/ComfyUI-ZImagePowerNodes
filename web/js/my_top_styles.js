/**
 * File    : my_top_styles.js
 * Purpose : Frontend implementation of "My Top-<N> Styles" node functionality.
 * Author  : Martin Rizzo | <martinrizzo@gmail.com>
 * Date    : Jan 31, 2026
 * Repo    : https://github.com/martin-rizzo/ComfyUI-ZImagePowerNodes
 * License : MIT
 *- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 *                        ComfyUI-ZImagePowerNodes
 *       ComfyUI nodes designed specifically for the "Z-Image" model.
 *_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
*/
import { app } from "../../../scripts/app.js";
import { forceRenameWidget, getInputOriginID } from "./common/helpers.js";
import { scheduleIntervalCalls } from "./common/timer.js";
const ENABLED = true;


//#======================= My Top Styles Controller ========================#
/**
 * Controller for any node that selects from a list of top styles. (e.g., "My Top-10 Styles")
 * @typedef {Object} MyTopStylesCtrl
 *   @property {Object}        node             - The node this controller is attached to.
 *   @property {Array<Object>} allStyleWidgets  - A list of all widgets whose name starts with "style_".
 *   @property {boolean}       selecting        - Whether or not the controller is currently in the middle of a selection.
 *                                                (used to prevent infinite recursion when updating the list)
 *   @property {number|null}  topStylesOriginID - The ID of the node connected to the 'top_styles" input.
 *   @property {number|null}  inputOriginID     - The ID of the node connected to the 'input' input.
 */


/**
 * Initializes the `MyTopStylesCtrl` controller.
 *
 * @param {MyTopStylesCtrl} self - The instance of the controller being initialized.
 * @param {Object}          node - The node to control.
 */
function init(self, node) {

    // build a list with all widgets whose name starts with "style"
    const allStyleWidgets = node.widgets.filter(w => w.name.startsWith("style_"));
    if( !allStyleWidgets || allStyleWidgets.length == 0 ) {
        console.error(`##>> MyTopStyles: No widgets found whose name starts with "style_"`);
        return;
    }

    // iterate through all "style_" widgets
    for( let i=0 ; i<allStyleWidgets.length ; ++i ) {
        const widget = allStyleWidgets[i];

        // replacing the `callback` function in all widgets,
        // using the safest way to call original function
        const oldCallback = widget.callback;
        widget.callback = function(value) {
            if( !self.selecting ) {
                self.selecting = true;
                onBooleanSwitchChanged(self, widget, value);
                self.selecting = false;
            }
            if( typeof oldCallback === 'function' ) {
                oldCallback.apply(this, arguments);
            }
        }
    }

    // set controller properties and methods
    self.node              = node;
    self.allStyleWidgets   = allStyleWidgets;
    self.selecting         = false;
    self.topStylesOriginID = null;
    self.inputOriginID     = null;
    self.updateTopStyles   = function(topStyles) { updateTopStyles(this, topStyles); };
    self.onInterval        = function() { onInterval(self); };
    scheduleIntervalCalls(self);
}


/**
 * Handles the change of the switch widget associated with a style.
 *
 * Ensures only one style can be active at a time by setting other
 * widgets' values to false.
 * @param {MyTopStylesCtrl} self   - The controller instance.
 * @param {Object}          widget - The widget whose value has changed.
 * @param {boolean}         value  - The new boolean value of the switch widget.
 */
function onBooleanSwitchChanged(self, widget, value) {

  //// SAFE (debugging)
  //const node            = self.node?.graph?.getNodeById?.(self.node.id);
  //const allStyleWidgets = node.widgets.filter(w => w.name.startsWith("style_"));

    // FAST
    const allStyleWidgets = self.allStyleWidgets;

    // only allow one widget to be active at a time
    widget.value = true;
    for( const styleWidget of allStyleWidgets ) {
        if( styleWidget !== widget ) {
            styleWidget.value = false;
            styleWidget.callback(false);
        }
    }
}


function onTopStylesConnectionChanged(self, node) {
    console.log("##>> onTopStylesConnectionChanged");
    console.log(node);
    updateTopStyles( self, node?.zzController?.getTopStyles?.() );
}


function onInputConnectionChanged(self, node) {

    if( !node ) {
        console.log("##>> DISCONNECTED from input connection");
    }
}


// verifica periodicamente las conexiones del nodo ya que el evento
// `onConnectionChange` de LiteGraph puede no funcionar en algunas versiones de ComfyUI
function onInterval(self) {

    const topStylesOriginID = getInputOriginID(self.node, "top_styles");
    if( self.topStylesOriginID !== topStylesOriginID ) {
        self.topStylesOriginID = topStylesOriginID;
        const originNode = topStylesOriginID == null ? null : self.node?.graph?.getNodeById(topStylesOriginID);
        onTopStylesConnectionChanged(self, originNode);
    }

    const inputOriginID = getInputOriginID(self.node, "input");
    if( self.inputOriginID !== inputOriginID ) {
        self.inputOriginID = inputOriginID;
        const originNode = inputOriginID == null ? null : self.node?.graph?.getNodeById(inputOriginID);
        onInputConnectionChanged(self, originNode);
    }
}


/**
 * Updates the top styles of a controller and refreshes their widgets accordingly.
 *
 * @param {MyTopStylesCtrl} self        - The controller instance.
 * @param {Array<string>}   [topStyles] - The list of new top styles (optional).
 */
function updateTopStyles(self, topStyles) {

    if( !topStyles ) { topStyles = [] }


    // // update the internal list of top styles, if a new one is provided
    // if( topStyles && topStyles.length > 0 ) {
    //     self.topStyles = topStyles;
    // }

  //// SAFE (debugging)
  //const node            = self.node?.graph?.getNodeById?.(self.node.id);
  //const allStyleWidgets = node.widgets.filter(w => w.name.startsWith("style_"));

    // FAST
    const node            = self.node
    const allStyleWidgets = self.allStyleWidgets;

    for( let i=0 ; i<allStyleWidgets.length ; i++ ) {
        const widget    = allStyleWidgets[i];
        const styleName = i<topStyles.length ? topStyles[i] : "";
        if( isValidStyleName(styleName) ) {
            forceRenameWidget(widget, node, styleName)
        } else {
            forceRenameWidget(widget, node, "-")
        }
    }

}


//#-------------------------------- HELPERS --------------------------------#

/**
 * Checks whether a given style name is valid.
 * 
 * @param {string} styleName - The name of the style to validate.
 * @returns {boolean} True if the style name is valid, false otherwise.
 */
function isValidStyleName(styleName)
{
    // discard any name that is not a string
    if( typeof styleName  != 'string' ) { return false; }

    // discard any empty string, dash or  "none"
    const trimmedName = styleName.trim();
    if( trimmedName === "" || trimmedName === "-" || trimmedName === "none" ) { return false; }

    return true;
}




//#=========================================================================#
//#////////////////////////// REGISTER EXTENSION ///////////////////////////#
//#=========================================================================#

app.registerExtension({
    name: "ZImagePowerNodes.MyTopStyles",

    /**
     * Called when the extension is loaded.
     */
    init() {
        if (!ENABLED) return;
        console.log("##>> My Top Styles: extension loaded.")
    },

    /**
     * Called every time ComfyUI creates a new node.
     * @param {ComfyNode} node - The node that was created.
     */
    async nodeCreated(node) {
        if (!ENABLED) return;
        const comfyClass = node?.comfyClass ?? "";

        // inject controller only to nodes of type "My Top-X Styles Selector"
        if( comfyClass.startsWith("MyTop10Styles //ZImage" ) ) {
            node.zzController = {};
            init(node.zzController, node)
        }
    },

})
