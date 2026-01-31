/**
 * File    : my_top_styles_selector.js
 * Purpose : Frontend implementation of 'my top styles' functionality.
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
const ENABLED = true;

//#========================== MyTop10 Controller ===========================#


function init(self, node) {

    // build a list with all widgets whose name starts with "style"
    const allStyleWidgets = node.widgets.filter(w => w.name.startsWith("style_"));
    if( !allStyleWidgets || allStyleWidgets.length == 0 ) {
        console.error(`##>> MyTopStyles: No widgets found whose name starts with "style_"`);
        return;
    }

    // // nos colgamos del evento onConnectionChange
    // const originalOnConnectionChange = node.onConnectionChange;
    // node.onConnectionChange = function(type, slot, connected, link_info, input_info) {
    //     if( originalOnConnectionChange == "function" ) {
    //         originalOnConnectionChange.apply(this, arguments);
    //     }

    //     // comunicar en consola el event
    //     console.log("##>> My Top Styles: connection change:", type, slot, connected)

    //     MyTop10_onConnectionChange(self, type, slot, connected);
    // }


    // reemplazar la funcion callback en todos los widgets
    for( let i=0 ; i<allStyleWidgets.length ; ++i ) {
        const widget = allStyleWidgets[i];
        widget.label = '"Style Name"'
        widget.callback = async (value) => {
            onStyleSelect(self, widget, value)
        }
    }

    // set controller properties
    self.topStyles       = [];
    self.allStyleWidgets = allStyleWidgets;
    self.updateTopStyles = function(topStyles) { updateTopStyles(this, topStyles); };
}


function onStyleSelect(self, widget, value) {

    // mostrar en consola el nombre
    console.log("##>> My Top Styles: selected style:", widget.name)

    // only allow one widget to be active at a time
    for( const otherWidget of self.allStyleWidgets ) {
        otherWidget.value = otherWidget === widget;
    }

    // // evitar que el usuario desactive el widget
    // if( value === false ) {
    //     widget.value = true;
    //     return;
    // }

}

// necesito que topStyleList sea un parametro opcional
function updateTopStyles(self, topStyles) {

    console.log("##>> My Top Styles: updating top styles!!:", topStyles);

    if( topStyles && topStyles.length > 0 ) {
        self.topStyles = topStyles;
    }
    for( let i=0 ; i<self.allStyleWidgets.length ; i++ ) {
        const widget    = self.allStyleWidgets[i];
        const styleName = i<self.topStyles.length ? self.topStyles[i] : "";
        if( isValidStyleName(self, styleName) ) {
            widget.label = styleName;
        } else {
            widget.label = "-";
        }
    }
}

function isValidStyleName(self, styleName) {
    // if starts with quotes it's a valid style (for now)
    return styleName.startsWith('"');
}



//#=========================================================================#
//#////////////////////////// REGISTER EXTENSION ///////////////////////////#
//#=========================================================================#

app.registerExtension({
    name: "ZImagePowerNodes.MyTopStylesSelector",

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
        if( comfyClass.startsWith("MyTop10StylesSelector //ZImage" ) ) {
            node.zzController = {};
            init(node.zzController, node)
        }
    },

})
