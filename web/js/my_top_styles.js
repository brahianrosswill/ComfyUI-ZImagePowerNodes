/**
 * File    : my_top_styles.js
 * Purpose : Frontend implementation for "My Top Styles" kind of node.
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


//#======================= My Top Styles Controller ========================#

function init(self, node) {

    // imprimir el contenido de node
    console.log('##>> NODE:', node);

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
            const topStyleList = buildTopStyleList(self);
            onTopStyleListChanged(self, topStyleList);
        }
    }

    // set controller properties
    self.topStylesList   = [];
    self.allStyleWidgets = allStyleWidgets;
    self.node            = node;
    //update_list(self);

    // impirmir en la consola todos los outpus
    console.log('##>> MyTopStyles: outputs:', node.outputs);

}


function onTopStyleListChanged(self, topStyles) {
    self.node?.setDirtyCanvas?.(true);

    // update the top styles list for each output node
    const outputNodes = getOutputNodes(self.node, 'top_styles');
    for( let i=0 ; i<outputNodes.length ; ++i ) {
        const outputNode = outputNodes[i];
        outputNode?.zzController?.updateTopStyles?.(topStyles);
    }
    console.log("##>> OUTPUT NODES:", outputNodes);
}

function buildTopStyleList(self) {

    let topStylesList = [];
    for( let i=0 ; i<self.allStyleWidgets.length ; ++i ) {
        const widget = self.allStyleWidgets[i];
        topStylesList.push( widget.value.toString() );
    }
    return topStylesList;
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
        console.log("##>> MyTopStyles: extension loaded.")
    },

    /**
     * Called every time ComfyUI creates a new node.
     * @param {ComfyNode} node - The node that was created.
     */
    async nodeCreated(node) {
        if (!ENABLED) return;
        const comfyClass = node?.comfyClass ?? "";

        // inject controller only to nodes of type "My Top-X Styles"
        if( comfyClass.startsWith("MyTop10Styles //ZImage") ) {
            node.zzController = {};
            init(node.zzController, node)
        }
    },

})
