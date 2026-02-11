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

        this.viewMode         = "grid"; // "grid" or "list"
        this.categoryFilter   = "";     // "", "photo", "illustration", "wild", "custom"
        this.allStyles        = {};
        this.gridEl           = this.element.querySelector('#zipn-style-grid');
        this.statusEl         = this.element.querySelector('#zipn-status-text');
        this.c_allButtonEl    = this.element.querySelector('#zipn-all-btn');
        this.c_photoButtonEl  = this.element.querySelector('#zipn-photo-btn');
        this.c_illusButtonEl  = this.element.querySelector('#zipn-illus-btn');
        this.c_wildButtonEl   = this.element.querySelector('#zipn-wild-btn');
        this.c_customButtonEl = this.element.querySelector('#zipn-custom-btn');
        this.gridButtonEl     = this.element.querySelector('#zipn-grid-btn');
        this.listButtonEl     = this.element.querySelector('#zipn-list-btn');
        this.updateButtons();
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

        // if the command starts with "@", change the view mode
        if( command.startsWith('@') ) {
            const viewMode = command.substring(1);
            if( viewMode == this.viewMode ) { return; }

            this.viewMode = viewMode;
            this.updateButtons();
        }

        // if the command starts with "#", change the category filter
        else if( command.startsWith('#') ) {
            const categoryFilter = command.substring(1);
            if( categoryFilter == this.categoryFilter ) { return; }

            this.categoryFilter = categoryFilter;
            this.updateButtons();
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

    updateButtons() {
        this.listButtonEl.classList.toggle('p-highlight', this.viewMode == "list" );
        this.gridButtonEl.classList.toggle('p-highlight', this.viewMode == "grid" );
        this.c_allButtonEl.classList.toggle('p-highlight', this.categoryFilter == "" );
        this.c_photoButtonEl.classList.toggle('p-highlight', this.categoryFilter == "photo" );
        this.c_illusButtonEl.classList.toggle('p-highlight', this.categoryFilter == "illustration" );
        this.c_wildButtonEl.classList.toggle('p-highlight', this.categoryFilter == "wild" );
        this.c_customButtonEl.classList.toggle('p-highlight', this.categoryFilter == "custom" );
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
     * @param {string}   id      - The unique identifier for the button.
     * @param {string}   icon    - The icon to be used in the button. e.g., "i.pi.pi-image"
     * @param {string}   text    - The text content of the button.
     * @param {string}   tooltip - The title attribute value for the button, representing its tooltip.
     * @param {function} onClick - Function to be executed when the button is clicked.
     * @returns {HTMLElement} A button element with the specified icon, text, tooltip and onclick function.
     */
    createToolButton(id, icon, text, tooltip, onClick) {
        // if no ID is provided, generate a random one
        if( !id ) {
            do { id = 'zipn-btn-' + Math.random().toString(36).slice(2, 9); }
            while( document.getElementById(id) );
        }
        // if the icon ID is provided with spaces between words, convert them to dots
        if( icon ) {
            icon = icon.replace(' ', '.');
        }

        // generate the 3 possible types of buttons:
        //   - button with icon only (no text)
        //   - button with text only
        //   - button with icon and text
        if( icon && !text ) {
            return html( "button.p-button-text", { id: id, title: tooltip, onclick: onClick }, [ html(`i.${icon}`) ] );
        }
        if( !icon && text ) {
            return html( "button.p-button-text", { id: id, title: tooltip, textContent: text, onclick: onClick }, [] );
        }
        return html("button.p-button-text", { id: id, title: tooltip, onclick: onClick }, [
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
            this.createToolButton("zipn-all-btn"   , '', "All"         , "Search all styles"              , () => { this.update("#"); }),
            this.createToolButton("zipn-photo-btn" , '', "Photo"       , "Search only photographic styles", () => { this.update("#photo");}),
            this.createToolButton("zipn-illus-btn" , '', "Illustration", "Search only illustration styles", () => { this.update("#illustration"); }),
            this.createToolButton("zipn-wild-btn"  , '', "Wild"        , "Search only wild styles"        , () => { this.update("#wild"); }),
            this.createToolButton("zipn-custom-btn", '', "Custom"      , "Search only custom styles"      , () => { this.update("#custom"); }),
            StyleGalleryDialog.DIVIDER,
            this.createToolButton("zipn-grid-btn", 'pi pi-image', "", "Grid View", () => { this.update("@grid"); }),
            this.createToolButton("zipn-list-btn", 'pi pi-list' , "", "List View", () => { this.update("@list"); }),
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
