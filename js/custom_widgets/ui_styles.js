/**
 * File    : ui_styles.js
 * Purpose : Implements Dialog, Widget, and DataProvider for visual styles,
 *           ensuring compatibility with previous Power Nodes versions.
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
    fetchVisualStyleArray,
    requireVisualStyleGalleryDialog,
    addVisualStyleGalleryWidget,
};
import { api } from "../../../scripts/api.js";
import { GalleryDialog, GalleryDialogDelegate } from "./gallery_dialog.js";
import { GalleryWidget, GalleryWidgetDelegate } from "./gallery_widget.js";

// Cache of promises to avoid duplicate requests for the same endpoint.
const _fetchesByEndpoint = new Map();

// Registry of dialogs for each visual-style database endpoint.
const _dialogsByEndpoint = new Map();


//#==========================================================================#
//#                           FETCH VISUAL STYLES                            #
//# The FIRST generation of UI fetched items directly using this function    #
//# and loaded them into a native ComfyUI combobox. Currently, this function #
//# is internally invoked from GALLERY DIALOG and the GALLERY WIDGET.        #

/**
 * Fetches an array with data about each visual style from the server.
 *
 * Note: The implementation looks a bit complex because of the caching system.
 * It uses an immediately-invoked function (IIFE) to cache the ongoing promise
 * right away, ensuring we don't trigger duplicate network requests for the
 * same endpoint URL.
 *
 * @param {string} endpoint - The full endpoint URL to fetch the styles from.
 * @returns {Promise<Array<Object>>}
 *     Resolves to the array of formatted styles.
 *     Each element in the array is an object with the following properties:
 *       - idx        : Unique identifier for the style (the index in the list)
 *       - name       : The name of the style (string)
 *       - category   : The category of the style (string)
 *       - description: Description of the style (string)
 *       - tags       : An string of comma-separated tags associated with the style (string)
 *       - thumbnail  : URL for the style's thumbnail image (string)
 *
 * @example
 *   // Using async/await
 *   const styles = await fetchVisualStyleArray('/zi_power/styles/by_version?v=1.0');
 *   console.log(`Loaded ${styles.length} styles.`);
 * @example
 *   // Using promises (.then)
 *   fetchVisualStyleArray('/zi_power/styles/by_version?v=1.0').then(styles => {
 *       console.log(`Loaded ${styles.length} styles.`);
 *   });
 */
async function fetchVisualStyleArray(endpoint)
{
    if( typeof endpoint !== 'string' || !endpoint.trim() ) {
        console.error(`Invalid endpoint parameter: "${endpoint}". Expected a non-empty string.`);
        return [];
    }

    // if the endpoint already exists in the "fetch cache"
    // (either the ongoing promise or resolved result),
    // RETURN IT!
    if( _fetchesByEndpoint.has(endpoint) ) {
        return _fetchesByEndpoint.get(endpoint);
    }

    // encapsulate the fetch process in a promise
    const fetchPromise = (async () => {
        try {
            // fetch the styles from the given endpoint
            const response = await api.fetchApi(endpoint);
            if( !response.ok ) { throw new Error(`HTTP ${response.status}`); }

            // validate that the response is an actual array
            const styles = await response.json();
            if( !Array.isArray(styles) ) { throw new Error(`Expected an array but received ${typeof palettes}`); }

            const THUMBNAIL_BASE_URL = "/zi_power/styles/samples";
            return styles.map((style, index) => {
                const thumbFileName = style[4] || "";
                return {
                    idx        : index,
                    name       : style[0] || "Unknown",
                    category   : style[1] || "Uncategorized",
                    description: style[2] || "",
                    tags       : style[3] || "",
                    thumbnail  : thumbFileName ? `${THUMBNAIL_BASE_URL}?file=${thumbFileName}` : ""
                };
            });

        } catch (error) {
            // if failed, delete the cache for this endpoint to allow future retries
            console.error(`Failed to fetch styles from "${endpoint}": ${error.message}`);
            _fetchesByEndpoint.delete(endpoint);
            return [];
        }
    })();

    // store the promise in cache for future use
    _fetchesByEndpoint.set(endpoint, fetchPromise);
    return fetchPromise;
}


//#=========================================================================#
//#                          STYLE GALLERY DIALOG                           #
//# The SECOND generation of UI added a node button that launched a         #
//# GALLERY DIALOG, which in turn modified a native combo-box in ComfyUI.   #
//#                                                                         #

class StyleDialogDelegate extends GalleryDialogDelegate {

    constructor(endpoint) {
        super();
        this.endpoint = endpoint;
    }

    /**
     * Fetches an array with data about each item to be displayed in the gallery.
     * @returns {Promise<Array<Object>>}
     *   A promise that resolves to an array of objects with the following properties:
     *       - idx        : Unique identifier for the item (the index in the list)
     *       - name       : The display name of the item (string)
     *       - category   : The category the item belongs to (string)
     *       - description: A detailed description of the item (string)
     *       - tags       : An string of comma-separated tags associated with the style (string)
     *       - thumbnail  : URL for the item's thumbnail image (string)
     */
    async fetchItemArray() {
        return fetchVisualStyleArray(this.endpoint);
    }

    /**
     * Returns an array of category definitions used for filtering the gallery items.
     * @returns {Array<Array<string>>}
     *   An array of category definitions where each item contains:
     *     - category    (string): The value used for matching gallery items (must match the "category" property in items)
     *     - displayName (string): The visible name shown in the UI
     *     - description (string): Tooltip description for screen readers/accessibility
     */
    getCategories() {
        return [
        /*   CATEGORY        DISPLAY_NAME    DESCRIPTION                      */
            [""            , "All"         , "Search all styles"               ],
            ["photo"       , "Photo"       , "Search only photographic styles" ],
            ["illustration", "Illustration", "Search only illustration styles" ],
            ["wild"        , "Wild"        , "Search only wild styles"         ],
            ["custom"      , "Custom"      , "Search only custom styles"       ]
        ];
    }
}

/**
 * Returns a style selection dialog containing the styles loaded from the specified endpoint.
 * @param {string} endpoint - The full endpoint URL to fetch the styles from.
 * @returns {GalleryDialog}
 *   The gallery dialog instance for the specified endpoint
 * @example
 *   const styleDialog  = requireVisualStyleGalleryDialog("/api/styles/v1/list");
 *   const currentStyle = "Anime";
 *   styleDialog.launch( {}, currentStyle, (selectedStyle) => {
 *       console.log("Selected Style: " + selectedStyle);
 *   });
 */
function requireVisualStyleGalleryDialog(endpoint) {

    // check if a dialog is already registered for the specified endpoint
    const dialog = _dialogsByEndpoint.get(endpoint);
    if( dialog ) { return dialog; }

    // If no dialog exists for this endpoint, create a new one
    const newDelegate = new StyleDialogDelegate(endpoint);
    const newDialog   = new GalleryDialog(newDelegate);
    _dialogsByEndpoint.set(endpoint, newDialog);
    return newDialog;
}


//#=========================================================================#
//#                          STYLE GALLERY WIDGET                           #
//#   The THIRD generation of UI uses a "GALLERY WIDGET" to launch a        #
//#   "GALLERY DIALOG", both of them customized by 'delegate' objects.      #
//#                                                                         #

class StyleWidgetDelegate extends GalleryWidgetDelegate {

    constructor(endpoint) {
        super();
        this.endpoint = endpoint;
    }

    async fetchItemArray() {
        return fetchVisualStyleArray(this.endpoint);
    }

    getItemText(item, value, options) {
        if( !item ) { return "Undefined"; }
        if( options.allow_variants ) {
            const parts = item.name.split("//");
            const name      = parts[0]?.trim() || "";
            const variation = parts[1]?.trim() || "";
            return `${name}\n${variation}`;
        }
        return item.name;
    }

    getItemThumbnailURL(item, _value) {
        return item?.thumbnail || "";
    }

    /**
     * Draws the image/thumbnail for a specific item.
     *
     * @param {CanvasRenderingContext2D} ctx - The canvas 2D rendering context
     * @param {Object}   rect    - The rectangle object defining the drawing area (left, top, width, height)
     * @param {Object}   item    - The data of the item to be drawn
     * @param {string}   value   - The current value of the widget as reported to the backend
     * @param {Object}   options - An object containing the options with which the widget was configured
     * @param {Function} requestImage - A function to request an image from a URL
     * @returns {number}
     *     The width (in pixels) occupied by the thumbnail, representing the
     *     space used on the right side of the drawing area.
     */
    drawItemThumbnail(ctx, rect, item, value, options, requestImage) {
        const thumbSize = 32;
        const rect_right = rect.left + rect.width;

        if( !item?.thumbnail ) { return 0; }
        const imageURL = this.getItemThumbnailURL(item, value);
        const image    = requestImage(imageURL);

        // if the image is fully loaded, draw it!!
        if( image.complete && image.naturalWidth > 0 ) {
            const x = rect_right - thumbSize;
            const y = rect.top + (rect.height - thumbSize) / 2;
            ctx.drawImage(image, x, y, thumbSize, thumbSize);
        }
        // draw a temporary placeholder (e.g., a subtle gray square)
        // while the image is being downloaded in the background
        else {
            ctx.fillStyle = "#2a2a2a";
            const x = rect_right - thumbSize;
            const y = rect.top + (rect.height - thumbSize) / 2;
            ctx.fillRect(x, y, thumbSize, thumbSize);
        }
        return thumbSize;
    }
}


function addVisualStyleGalleryWidget(node, name, data) {
    const type           = data[0];
    const options        = data[1] || {};
    const endpoint       = options.endpoint || "";
    const images_url     = "/zi_power/styles/samples?file=${name}&cb=${cachebuster}";
    const thumbs_url     = "/zi_power/styles/samples?file=${name}&cb=${cachebuster}";
    const dialog_options = options.dialog || {};
    let widget = new GalleryWidget(type, node, name, options, new StyleWidgetDelegate(endpoint), (widget) =>
    {
        // launch dialog and update widget value
        const styleDialog  = requireVisualStyleGalleryDialog(endpoint);
        const currentStyle = widget.value;
        styleDialog.launch( dialog_options, currentStyle, (selectedStyle) => {
            widget.forceUpdate( selectedStyle );
        });
    });
    widget = node.addCustomWidget( widget );
    return { widget: widget };
}

