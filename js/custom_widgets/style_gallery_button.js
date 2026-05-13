/**
 * File    : style_gallery_button.js
 * Purpose : Custom button widget for launching the style gallery. [DEPRECATED]
 * Author  : Martin Rizzo | <martinrizzo@gmail.com>
 * Date    : Feb 3, 2026
 * Repo    : https://github.com/martin-rizzo/ComfyUI-ZImagePowerNodes
 * License : MIT
 *- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 *                        ComfyUI-ZImagePowerNodes
 *       ComfyUI nodes designed specifically for the "Z-Image" model.
 *_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
*/
export { addStyleGalleryButton };
import { getStyleGalleryDialog } from "../custom_dialogs/gallery_dialog_styles.js";


/**
 * Adds a button to the node that opens the style gallery dialog.
 * @param {LGraphNode} node  - ComfyUI node where the widget will be added.
 * @param {string}     name  - The name of the value attached to the widget.
 * @param {Array}      data  - An array with the following format: [type, options]
 * @returns {{widget: object}}
 *     An object containing the created widget.
 */
function addStyleGalleryButton(node, name, _data) {

    // split the inputName to extract any title variant
    // (title variant is the part of the input-name after the last underscore)
    const parts   = name.split('_');
    let   variant = parts.length>1 ? parts[ parts.length - 1 ] : "";

    // ensure the variant is a number
    if( variant.match(/^[0-9]+$/) === null ) { variant = ""; }
    const title = `Select Style${variant ? ' ' + variant : ""}`;

    // find the previous widget,
    // which should be a combo widget to receive the style selection
    const prevIndex  = node.widgets.length - 1;
    const prevWidget = prevIndex>=0 ? node.widgets[prevIndex] : null;
    if( !prevWidget || prevWidget.type !== "combo" ) {
        console.error("Style Gallery Button must follow a Combo Widget!");
        return;
    }

    // add a custom button widget to the node
    const button = node.addCustomWidget({
            type     : "button",
            name     : name,
            label    : `🖼️  ${title} ...`,
            serialize: true,
    });

    // the serialized value is always null, as it doesn't store a value itself.
    // (disable serialization may cause problems when saving and retrieving nodes)
    button.serializeValue = () => null;

    // when the button is pressed, launch the dialog
    button.callback = () =>
    {
        // const shiftGlobal = window.event?.shiftKey;
        // if (shiftGlobal) {
        //     console.log("Alternative action with shift key pressed");
        //     return;
        // }

        const styleName = prevWidget.value?.replace(/^"|"$/g, '');
        getStyleGalleryDialog("1.0").launch( title, styleName, (styleName) =>
        {
            // ensure the style name is properly quoted
            if( styleName!="" && styleName!="-" && styleName!="none" ) {
                if( !styleName.startsWith('"') ) { styleName = `"${styleName}"`; }
            }
            // apply the new style name on the previous widget
            prevWidget.value = styleName;
            prevWidget.callback(styleName);
            node?.setDirtyCanvas?.(true);
        });
    };
    return { widget: button };
}

