/**
 * File    : style_gallery.js
 * Purpose : Extension that presents a gallery of available visual styles to select from.
 * Author  : Martin Rizzo | <martinrizzo@gmail.com>
 * Date    : Feb 7, 2026
 * Repo    : https://github.com/martin-rizzo/ComfyUI-ZImagePowerNodes
 * License : MIT
 *- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 *                        ComfyUI-ZImagePowerNodes
 *       ComfyUI nodes designed specifically for the "Z-Image" model.
 *_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
*/
import { app }                      from "../../../scripts/app.js";
import { ComfyDialog, $el as html } from "../../../scripts/ui.js"; //< deprrecated ?
import { loadCSS }                  from "./common.js";
import { makeCustomDialog }         from "./common_dialog.js";
const ENABLED = true;

loadCSS("style_gallery.css");


//#========================= Style Gallery Dialog ==========================#

class StyleGalleryDialog extends ComfyDialog {

    static makeToolButton(icon, text, tooltip, onClick) {
        if( icon && icon.includes(' ') ) { icon = icon.replace(' ', '.'); }
        if( icon && !text ) {
            return html( "button.p-button-text", { title: tooltip, onclick: onClick }, [ html(`i.${icon}`) ] );
        }
        if( !icon && text ) {
            return html( "button.p-button-text", { title: tooltip, textContent: text, onclick: onClick }, [] );
        }
        return html("button.p-button-text", { title: tooltip, onclick: onClick }, [
            html(`i.${icon}`, { textContent: text})
        ]);
    }

    // un separador de la toolbar (espacio en blanco)
    static get SPACER() {
        return html("div.zipn-spacer");
    }

    // un divisor de la toolbar (una linea vertical)
    static get DIVIDER() {
        return html("div.zipn-divider");
    }

    // la barra de busqueda que se muestra en la parte superior
    static get SEARCH_BAR() {
        return html("div", {}, [
            html("input.p-inputtext.p-component", { type: "search", placeholder: "Search" }),
            this.DIVIDER,
            this.makeToolButton('', "All", "View all styles", () => { console.log('test'); }),
            this.makeToolButton('', "Photo", "View only photo", () => { console.log('test'); }),
            this.makeToolButton('', "Illustration", "View ilustration", () => { console.log('test'); }),
            this.makeToolButton('', "Wild", "View ilustration", () => { console.log('test'); }),
            this.makeToolButton('', "Custom", "View ilustration", () => { console.log('test'); }),
            this.DIVIDER,
            this.makeToolButton('pi pi-image', "", "View image grid", () => { console.log('test'); }),
            this.makeToolButton('pi pi-list', "", "View list", () => { console.log('test'); }),
            this.DIVIDER,
        ]);
    }

    static get CONTENT() {
        return html("div.zipn-dialog", {}, [
            this.SEARCH_BAR,
            html("div.zipn-style-options"),
        ]);
    }

    constructor() {
        super();

        // icons can be taken from PrimeIcons or Pictogrammers MDT
        // PrimeIcons       : e.g. "i.pi.pi-image"   (https://primevue.org/icons)
        // Pictogrammers MDI: e.g. "i.mdi.mdi-image" (https://pictogrammers.com/library/mdi)
        this.element = makeCustomDialog(
            'zipn-style-gallery-dialog'  , //< dialog id
            'Select Style'               , //< title
            'i.mdi.mdi-image-multiple'   , //< icon
            StyleGalleryDialog.CONTENT   , //< dialog content
            () => this.close() //< close callback
        );
    }

    static launch() {
        // create the first time and use the same instance the next time
        if( !this._instance ) { this._instance = new StyleGalleryDialog(); }
        this._instance.show();
    }
}


//#========================= Style Gallery Button ==========================#

/**
 * Creates a button widget that when pressed opens the style gallery.
 * @param {LGraphNode}  node - The node where the widget is added.
 * @param {string} inputName - The name of the input associated with this widget.
 * @returns {{widget: object}}
 *     An object containing the created widget.
 */
function createStyleGalleryButton( node, inputName ) {

    // si el anteúltimo caracter de inputName es un '_' entonces el último es un número
    const parts    = inputName.split('_');
    let   lastPart = parts.length>1 ? parts[ parts.length - 1 ] : "";
    if( lastPart.match(/^[0-9]+$/) === null ) {
        lastPart = "";
    }

    const widget = node.addCustomWidget({
            type     : "button",
            name     : inputName,
            label    : `🖼️  Select Style ${lastPart} ...`,
            serialize: true,
    });
    widget.callback       = () => { StyleGalleryDialog.launch(); };
    widget.serializeValue = () => null;
    return { widget: widget };
}


//#=========================================================================#
//#////////////////////////// REGISTER EXTENSION ///////////////////////////#
//#=========================================================================#

app.registerExtension({
    name: "ZImagePowerNodes.StyleGallery",

    /** Called when the extension is loaded */
    init() {
        if( !ENABLED ) return;
        console.log(`[${this.name}]: Extension loaded.`);
    },

    /** Called to register custom widgets */
    getCustomWidgets() {
        if( !ENABLED ) return {};
        return {
            "ZIPN_STYLE_GALLERY": createStyleGalleryButton,
        };
    },

});
