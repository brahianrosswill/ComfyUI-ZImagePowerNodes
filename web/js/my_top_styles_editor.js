/**
 * File    : my_top_styles_editor.js
 * Purpose : Frontend implementation for "My Top-<N> Style Editor" node functionality.
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
import { getOutputNodes } from "./common.js";
const ENABLED = true;


//#==================== My Top Styles Editor Controller ====================#
/**
 * Object encapsulating the style category selection functionality.
 * @typedef {Object} MyTopStylesController
 *   @property {Array<Object>} allStyleWidgets - A list of all widgets whose name starts with "style_".
 *   @property {Object}        node            - The node this controller is attached to.
 */


/**
 * Initializes the MyTopStylesController.
 *
 * @param {MyTopStylesController} self - The instance of the controller being initialized.
 * @param {Object} node                - The node to control.
 */
function init(self, node) {

    // build a list with all widgets whose name starts with "style_"
    const allStyleWidgets = node.widgets.filter(w => w.name.startsWith("style_"));
    if( !allStyleWidgets || allStyleWidgets.length == 0 ) {
        console.error(`##>> MyTopStyles: No widgets found whose name starts with "style_"`);
        return;
    }

    // add a callback to each widget so we can know when the user makes any modification
    for( let i=0 ; i<allStyleWidgets.length ; ++i ) {
        const widget = allStyleWidgets[i];
        widget.callback = function (v) {
            const topStyles = getTopStylesFromWidgets(self);
            onTopStylesChanged(self, topStyles);
            self.node?.setDirtyCanvas?.(true);
        }
    }

    // controller properties
    self.allStyleWidgets = allStyleWidgets;
    self.node            = node;
}


/**
 * Retrieves all the selected top styles from the node widgets.
 *
 * @param {MyTopStylesController} self - The instance of MyTopStylesController.
 * @returns {Array<string>} An array of strings representing the selected top styles.
 */
function getTopStylesFromWidgets(self) {
    const allStyleWidgets = self.allStyleWidgets;

    let topStyles = [];
    for( let i=0 ; i<allStyleWidgets.length ; ++i ) {
        const widget = allStyleWidgets[i];
        topStyles.push( widget.value.toString() );
    }
    return topStyles;
}


/**
 * Handles the change of top styles by notifying all connected output nodes.
 *
 * @param {MyTopStylesController} self - The instance of MyTopStylesController.
 * @param {Array<string>} topStyles - An array of strings representing the new top styles.
 */
function onTopStylesChanged(self, topStyles) {

    // send the new top styles to all nodes connected to the 'TOP_STYLES' output
    const outputNodes = getOutputNodes(self.node, 'TOP_STYLES');
    for( let i=0 ; i<outputNodes.length ; ++i ) {
        const outputNode = outputNodes[i];
        outputNode?.zzController?.updateTopStyles?.(topStyles);
    }
}


//#=========================================================================#
//#////////////////////////// REGISTER EXTENSION ///////////////////////////#
//#=========================================================================#

app.registerExtension({
    name: "ZImagePowerNodes.MyTopStylesEditor",

    /**
     * Called when the extension is loaded.
     */
    init() {
        if (!ENABLED) return;
        console.log("##>> My Top Styles Editor: extension loaded.")
    },

    /**
     * Called every time ComfyUI creates a new node.
     * @param {ComfyNode} node - The node that was created.
     */
    async nodeCreated(node) {
        if (!ENABLED) return;
        const comfyClass = node?.comfyClass ?? "";

        // inject controller only to nodes of type "My Top-X Styles"
        if( comfyClass.startsWith("MyTop10StylesEditor //ZImage") ) {
            node.zzController = {};
            init(node.zzController, node)
        }
    },

})
