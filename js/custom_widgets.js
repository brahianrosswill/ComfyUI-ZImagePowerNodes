/**
 * File    : custom_widgets.js
 * Purpose : Register all custom widgets used in this project.
 * Author  : Martin Rizzo | <martinrizzo@gmail.com>
 * Date    : Feb 3, 2026
 * Repo    : https://github.com/martin-rizzo/ComfyUI-ZImagePowerNodes
 * License : MIT
 *- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 *                        ComfyUI-ZImagePowerNodes
 *       ComfyUI nodes designed specifically for the "Z-Image" model.
 *_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
*/
import { app }                          from "../../../scripts/app.js";
import { SelectorWidgetPalettes }       from "./custom_widgets/selector_widget_palettes.js";
import { addVisualStyleSelectorWidget } from "./custom_widgets/visual_styles.js";
import { addStyleGalleryButton  }       from "./custom_widgets/style_gallery_button.js";
import { SeparatorWidget        }       from "./custom_widgets/separator_widget.js";
const ENABLED = true;
//const DEFAULT_WIDGET_HEIGHT = 20;


/**
 * Adds a palette selector widget to a node.
 *
 * @param {LGraphNode} node  - ComfyUI node where the widget will be added.
 * @param {string}     name  - The name of the value attached to the widget.
 * @param {Array}      data  - An array with the following format: [type, options]
 */
function addPaletteSelectorWidget(node, name, data) {
    const type    = data[0];
    const options = data[1] || {};
    const value   = "Pepe";
    const widget = node.addCustomWidget( new SelectorWidgetPalettes(type, name, value, options) );
    return { widget: widget };
}


// function addStyleSelectorWidget(node, name, data) {
//     const type    = data[0];
//     const options = data[1] || {};
//     const value   = "Pepe";
//     const widget  = node.addCustomWidget( new SelectorWidgetStyles(type, name, value, options) );
//     return { widget: widget };
// }

function addSeparatorWidget(node, name, data) {
    const type    = data[0];
    const options = data[1] || {};
    const widget  = node.addCustomWidget( new SeparatorWidget(type, name, options) );
    return { widget: widget };
}


//#=========================================================================#
//#////////////////////////// REGISTER EXTENSION ///////////////////////////#
//#=========================================================================#

app.registerExtension({
    name: "ZImagePowerNodes.CustomWidgets",

    /** Called when the extension is loaded. */
    init() {
        if( !ENABLED ) return;
        console.log(`[${this.name}]: Extension loaded.`);
    },

    /** Called to register custom widgets. */
    getCustomWidgets() {
        if( !ENABLED ) return {};
        return {
            "ZIPN_SEPARATOR"       : addSeparatorWidget,
            "ZIPN_STYLE_SELECTOR"  : addVisualStyleSelectorWidget,
            "ZIPN_PALETTE_SELECTOR": addVisualStyleSelectorWidget,

            // [DEPRECATED]
            "ZIPN_STYLE_GALLERY_BUTTON": addStyleGalleryButton,
        };
    },

});
