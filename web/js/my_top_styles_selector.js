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
import { renameWidget } from "./common.js";
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

        //widget.originalCallback = widget.callback;

        const oldCallback = widget.callback;
        widget.callback = function(value) {
            if( !self.selecting ) {
                self.selecting = true;
                onStyleSelect(self, widget, value);
                self.selecting = false;
            }
            if( typeof oldCallback === 'function' ) {
                oldCallback.apply(this, arguments);
            }
        }

        // const oldCallback = widget.callback;
        // widget.callback = async (value) => {
        //     onStyleSelect(self, widget, value);
        //     if( oldCallback && typeof(oldCallback) === "function" ) {
        //         oldCallback.apply(widget, arguments);
        //     }
        // }
    }

    // set controller properties
    self.node            = node;
    self.selecting       = false;
    self.topStyles       = [];
    self.allStyleWidgets = allStyleWidgets;
    self.updateTopStyles = function(topStyles) { updateTopStyles(this, topStyles); };
}


function onStyleSelect(self, widget, value) {

    // mostrar en consola el nombre
    //console.log("##>> My Top Styles: selected style:", widget.name)

    // only allow one widget to be active at a time
    //const allStyleWidgets = self.allStyleWidgets;
    const allStyleWidgets = self.node.widgets.filter(w => w.name.startsWith("style_"));

    //console.log("##>> WIDGETS:", allStyleWidgets)
    //console.log("##>> onStyleSelect NODE:", self.node)

    for( const styleWidget of allStyleWidgets ) {
        if( styleWidget === widget ) {
            styleWidget.value = true;
        }
        else {
            styleWidget.value = false;
            //renameWidget(styleWidget, self.node, "Pepino")
            //styleWidget.label = "Pepe";
            //console.log("##>> TRIGER TYPE:", typeof styleWidget.triggerDraw );
            styleWidget.callback(false);
        }

    }

    // // evitar que el usuario desactive el widget
    // if( value === false ) {
    //     widget.value = true;
    //     return;
    // }

}

function forceLabelUpdate(widget, node, newLabel) {
    widget.label = newLabel;
    
    // Forzamos a LiteGraph a marcar el nodo para re-cálculo
    node.setDirtyCanvas(true, true);
    
    // Hack: Si el componente Vue está escuchando cambios en el objeto 'options'
    // actualizamos una propiedad ficticia para disparar el observador de Vue
    if (widget.options) {
        widget.options._force_update = Date.now(); 
    }

    // Nodes 2.0 a veces requiere que el nodo "parpadee" para redibujar el DOM de Vue
    const originalSize = [...node.size];
    node.size[0] += 0.001; 
    node.setSize(node.size);
    node.size[0] = originalSize[0];
    node.setSize(originalSize);
}

// necesito que topStyleList sea un parametro opcional
function updateTopStyles(self, topStyles) {

    console.log("##>> My Top Styles Selector: updating top styles!!:", topStyles);

    if( topStyles && topStyles.length > 0 ) {
        self.topStyles = topStyles;
    }

    const node = app.graph.getNodeById(self.node.id)
    //const allStyleWidgets = self.allStyleWidgets;
    const allStyleWidgets = node.widgets.filter(w => w.name.startsWith("style_"));

    for( let i=0 ; i<allStyleWidgets.length ; i++ ) {
        const widget    = allStyleWidgets[i];
        const styleName = i<self.topStyles.length ? self.topStyles[i] : "";
        if( isValidStyleName(self, styleName) ) {
            renameWidget(widget, node, styleName)
            forceLabelUpdate(widget, node, styleName)
        } else {
            renameWidget(widget, node, "-")
            forceLabelUpdate(widget, node, "-")
        }
    }

    for( let i=0 ; i<allStyleWidgets.length ; i++ ) {
        const widget    = allStyleWidgets[i];
        const styleName = i<self.topStyles.length ? self.topStyles[i] : "";

        if( widget.setProperty ) {
            console.log("##>> setProperty is available");
        } else {
            console.log("##>> setProperty is NOT available");
        }

        if( !isValidStyleName(self, styleName) ) {
            widget.value = true;
            widget.callback(widget.value);
            break;
        }
    }
    //node.onResize?.(node.size);
    //node.setDirtyCanvas(true,true);
    //app.graph.setDirtyCanvas(true, true);
    //app.graph.onGraphChanged();
    //app.canvas.emitAfterChange();
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
