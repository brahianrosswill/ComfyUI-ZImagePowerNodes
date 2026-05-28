/**
 * File    : ui_palettes.js
 * Purpose : Implements Dialog, Widget y UI componentes relacionados con seleccion de paleta de colores.
 *           El codigo asegura compatibility with previous Power Nodes versions.
 *
 * Author  : Martin Rizzo | <martinrizzo@gmail.com>
 * Date    : May 21, 2026
 * Repo    : https://github.com/martin-rizzo/ComfyUI-ZImagePowerNodes
 * License : MIT
 *- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 *                        ComfyUI-ZImagePowerNodes
 *       ComfyUI nodes designed specifically for the "Z-Image" model.
 *_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
 */
export {
    fetchColorPaletteArray,
    requireColorPaletteGalleryDialog,
    addColorPaletteSelectorWidget,
};
//import { api }            from "../../../scripts/api.js";
import { GalleryDialog }  from "./gallery_dialog.js";
import { GalleryWidget, GalleryWidgetDelegate } from "./gallery_widget.js";

// Cache of promises to avoid duplicate requests for the same color palette version.
const _colorPaletteCache = new Map();

// Registry of dialogs for each color palette version.
const _dialogRegistry = new Map();


//#========================== FETCH VISUAL STYLES ==========================#

/**
 * Fetches an array with data about each visual style from the server.
 *
 * Note: The implementation looks a bit complex because of the caching system.
 * It uses an immediately-invoked function (IIFE) to cache the ongoing promise
 * right away, ensuring we don't trigger duplicate network requests for the
 * same version.
 *
 * @param {string} version - The version of the styles to fetch.
 * @returns {Promise<Array<Object>>}
 *     Resolves to the array of formatted styles.
 *     Each element in the array is an object with the following properties:
 *       - id         : Unique identifier for the style (the index in the list)
 *       - name       : The name of the style (string)
 *       - category   : The category of the style (string)
 *       - description: Description of the style (string)
 *       - tags       : Array of tags associated with the style (Array<string>)
 *       - thumbnail  : URL for the style's thumbnail image (string)
 *
 * @example
 *   // Using async/await
 *   const styles = await fetchVisualStyleArray('1.0.0');
 *   console.log(`Loaded ${styles.length} styles.`);
 *
 * @example
 *   // Using promises (.then)
 *   fetchVisualStyleArray('1.0.0').then(styles => {
 *       console.log(`Loaded ${styles.length} styles.`);
 *   });
 */
async function fetchColorPaletteArray(_version)
{
    const colorPaletteArray = [
    {
        id: 0,
        name       : "Volcano",
        category   : "Warm",
        description: "Intense and energetic tones inspired by flowing magma.",
        tags: ["hot", "vibrant", "red", "dark"],
        colors: [
            { name: "Sulfur"    , hex: "#F1C40F" },
            { name: "Lava"      , hex: "#E67E22" },
            { name: "Magma"     , hex: "#C0392B" },
            { name: "Deep Ember", hex: "#741212" },
            { name: "Obsidian"  , hex: "#1B1B1B" }
        ]
    },{
        id: 1,
        name       : "Arctic Frost",
        category   : "Cold",
        description: "Crystalline blues and whites reflecting polar landscapes.",
        tags: ["ice", "clean", "blue", "winter"],
        colors: [
            { name: "Snow"        , hex: "#ECF0F1" },
            { name: "Ice Cap"     , hex: "#AED6F1" },
            { name: "Frost"       , hex: "#3498DB" },
            { name: "Glacier"     , hex: "#2980B9" },
            { name: "Midnight Sea", hex: "#2C3E50" }
        ]
    },{
        id: 2,
        name       : "Amazonia",
        category   : "Nature",
        description: "Deep jungle greens and earthy organic tones.",
        tags: ["forest", "organic", "green", "growth"],
        colors: [
            { name: "Moss"       , hex: "#DCEDC8" },
            { name: "Bamboo"     , hex: "#8BC34A" },
            { name: "Leaf"       , hex: "#4CAF50" },
            { name: "Canopy"     , hex: "#2E7D32" },
            { name: "Undergrowth", hex: "#1B5E20" }
        ]
    }];
    return colorPaletteArray;

}



//#==================== COLOR PALETTES: SELECTOR WIDGET ====================#
// Third generation of UI uses custom widgets to launch the selection dialog,
// these custom widgets are customized by delegate objects.

class PaletteWidgetDelegate extends GalleryWidgetDelegate {

    constructor(version) {
        super();
        this.version = version; //< the version of the styles to fetch
    }

    /**
     * Fetches an array with data about each item to be displayed in the gallery.
     * @returns {Promise<Array<Object>>}
     *   A promise that resolves to an array of objects with the following properties:
     *       - id         : Unique identifier for the item (the index in the list)
     *       - name       : The display name of the item (string)
     *       - category   : The category the item belongs to (string)
     *       - description: A detailed description of the item (string)
     *       - tags       : Array of tags associated with the item (Array<string>)
     *       - thumbnail  : URL for the item's thumbnail image (string)
     */
    async fetchItemArray() {
        return fetchColorPaletteArray(this.version);
    }

    getItemText(item) {
        if( !item ) { return "Undefined"; }
        return `${item.name}\n${item.category}`;
    }

    /**
     * Called when a thumbnail needs to be drawn for a specific item.
     * @param {CanvasRenderingContext2D} ctx  - The canvas 2D rendering context
     * @param {Object}                   rect - The rectangle object defining the drawing area (left, top, width, height)
     */
    drawItemThumbnail(ctx, rect, item, _value) {
        if( !item ) { return; }
        const barCount       = 5;
        const barSpacing     = 2;
        const barWidth       = Math.floor((rect.width - 1) / barCount) + 1  -  barSpacing;
        const barHeight      = rect.height;
        const totalBarsWidth = (barWidth * barCount) + (barSpacing * (barCount - 1));

        // draw the bars
        const x      = rect.left + (rect.width/2) - (totalBarsWidth/2);
        const y      = rect.top;
        const colors = item.colors;
        for( let i = 0 ; i < barCount ; i++ ) {
            ctx.fillStyle = colors[i].hex;
            ctx.fillRect(x + (i * (barWidth + barSpacing)), y, barWidth, barHeight);
        }
    }

    /* Using the default implementation of drawItemText() */
    // drawItemText(ctx, rect, line1, line2, item, value) { }



}


function addColorPaletteSelectorWidget(node, name, data) {
    const type    = data[0];
    const options = data[1] || {};
    const version = options.version || '1.0';
    let   widget  = new GalleryWidget(type, node, name, options, new PaletteWidgetDelegate(version), (self) =>
    {
        console.log("##>> LAUNCHING DIALOG (TODO)");

        // // launch dialog
        // const styleDialog  = requireColorPaletteGalleryDialog(self.dataProvider.version);
        // styleDialog.launch( self.options.dialog_title, self.value, (selectedStyle) =>
        // {
        //     // apply the new selected style
        //     self.value = selectedStyle;
        //     self.callback(selectedStyle);
        //     self.node?.setDirtyCanvas?.(true);
        // });
    });
    widget = node.addCustomWidget( widget );
    return { widget: widget };
}



//#==================== COLOR PALETTES: GALLERY DIALOG =====================#

/**
 * Returns the gallery dialog for the specified version of the color palettes
 * @param {string} version - The version of the color palettes to show in the gallery dialog
 * @returns {GalleryDialog}
 *     The dialog instance for the specified version
 *
 * Usage example:
 *     const paletteVersion = "1.0"; //< version of the palette definitions
 *     const paletteDialog  = requireColorPaletteGalleryDialog(paletteVersion);
 *     const currentPalette = "Volcano";
 *     paletteDialog.launch("Select a Palette", currentPalette, (selectedPalette) => {
 *         console.log("Selected Palette: " + selectedPalette);
 *     });
 */
function requireColorPaletteGalleryDialog(version) {
    let dialog = _dialogRegistry.get(version);
    // if( !dialog ) {
    //     dialog = new GalleryDialog(new DataProvider(version), new ItemHtmlRenderer());
    //     _dialogRegistry.set(version, dialog);
    // }
    return dialog;
}

