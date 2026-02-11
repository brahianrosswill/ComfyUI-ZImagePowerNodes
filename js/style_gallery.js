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
import { fetchLastVersionStyles }   from "./common_server.js";
const ENABLED = true;

loadCSS("style_gallery.css");


//#========================= Style Gallery Dialog ==========================#

class StyleGalleryDialog extends ComfyDialog {

    /**
     * Constructor.
     */
    constructor() {
        super();
        // icons can be taken from PrimeIcons or Pictogrammers MDT
        // PrimeIcons       : e.g. "i.pi.pi-image"   (https://primevue.org/icons)
        // Pictogrammers MDI: e.g. "i.mdi.mdi-image" (https://pictogrammers.com/library/mdi)
        this.element = makeCustomDialog(
            'zipn-style-gallery-dialog'  , //< dialog id
            'Select Style'               , //< title
            'i.mdi.mdi-image-multiple'   , //< icon
            this.createDialogContent()   , //< dialog content
            () => this.close() //< close callback
        );

        this.filterCategory = "";
        this.viewMode       = "grid"; // "grid" or "list"
        this.allStyles      = {};
        this.gridEl         = this.element.querySelector('#zipn-style-grid');
        this.statusEl       = this.element.querySelector('#zipn-status-text');

    }

    /**
     * Launches the style gallery dialog.
     */
    static launch() {
        // create the first time and use the same instance the next time
        if( !this._instance ) { this._instance = new StyleGalleryDialog(); }
        this._instance.show();
        fetchLastVersionStyles( (styles) => {
            this._instance.allStyles = styles;
            this._instance.update("!refresh");
        });
    }

    update(command) {

        // si comando comienza con "@", modificar el modo de visualizacion
        if( command.startsWith('@') ) {
            const viewMode = command.substring(1);
            if( viewMode == this.viewMode ) { return; }

            this.viewMode = viewMode;
            // activateViewModeButton(viewMode)
            // this.element.querySelector("#zip-view-{viewmode}-button")..classList.add("active");")
        }

        // re-render the gallery
        this.renderGrid( this.allStyles, this.viewMode );
    }

    /**
     * Renders the gallery grid with the provided visual styles.
     * @param {Array<Object>} styles - The array of style objects to be displayed in the grid.
     * Each object should contain at least an 'id', 'name', 'category', 'type', and 'thumb' property.
     */
    renderGrid(styles, viewMode) {

        this.gridEl.className = `zipn-style-${viewMode}`;
        this.gridEl.innerHTML = styles.map(item => `
        <div class="zipn-style-${viewMode}-card">
            <img src="${item.thumbnail}" loading="lazy" alt="${item.name}">
            <p>${item.name}</p>
        </div>
        `).join('');

        this.statusEl.innerText = `Resultados encontrados: ${styles.length}`;
    }


    //-- DIALOG COMPONENTS ------------------------------------------------

    /** A spacer element in the toolbar. */
    static get SPACER() {
        return html("div.zipn-spacer");
    }

    /** A divider element (vertical line) in the toolbar. */
    static get DIVIDER() {
        return html("div.zipn-divider");
    }

    /**
     * Creates a button for the toolbar.
     * @param {string}   icon    - The icon name to be used in the button. e.g., "i.pi.pi-image"
     * @param {string}   text    - The text content of the button.
     * @param {string}   tooltip - The title attribute value for the button, representing its tooltip.
     * @param {function} onClick - Function to be executed when the button is clicked.
     * @returns {HTMLElement} A button element with the specified icon, text, tooltip and onclick function.
     */
    createToolButton(icon, text, tooltip, onClick) {
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


    /**
     * Creates an input search bar for searching within the gallery dialog.
     * @returns {HTMLElement} An HTML structure representing a search bar.
     */
    createSearchBar() {
        return html("div", {}, [
            html("input.p-inputtext.p-component", { type: "search", placeholder: "Search" }),
            StyleGalleryDialog.DIVIDER,
            this.createToolButton('', "All", "View all styles", () => { console.log('test'); }),
            this.createToolButton('', "Photo", "View only photo", () => { console.log('test'); }),
            this.createToolButton('', "Illustration", "View ilustration", () => { console.log('test'); }),
            this.createToolButton('', "Wild", "View ilustration", () => { console.log('test'); }),
            this.createToolButton('', "Custom", "View ilustration", () => { console.log('test'); }),
            StyleGalleryDialog.DIVIDER,
            this.createToolButton('pi pi-image', "", "Grid View", () => { this.update("@grid"); }),
            this.createToolButton('pi pi-list' , "", "List View", () => { this.update("@list"); }),
            StyleGalleryDialog.DIVIDER,
        ]);
    }

    /**
     * A container for displaying the gallery results in grid format.
     * @returns {HTMLElement} An HTML structure representing the grid container.
     */
    static get RESULT_GRID() {
        return html("main.zipn-result-container", { id: "result-container" }, [
            html("div.zipn-style-grid", { id: "zipn-style-grid" })
        ]);
    }

    /**
     * A status bar to show current status or messages.
     * @returns {HTMLElement} An HTML structure representing the status bar.
     */
    static get STATUS_BAR() {
        return html("footer.zipn-status-bar", {}, [
            html("span", { id: "zipn-status-text", textContent: "Showing 0 elements"})
        ]);
    }

    createDialogContent() {
        return html("div.zipn-dialog", {}, [
            this.createSearchBar(),
            StyleGalleryDialog.RESULT_GRID,
            StyleGalleryDialog.STATUS_BAR
        ]);
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
