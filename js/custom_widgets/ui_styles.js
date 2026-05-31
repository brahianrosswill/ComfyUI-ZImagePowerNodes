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

// Cache of promises to avoid duplicate requests for the same visual style version.
const _fetchStylesCache = new Map();

// Registry of dialogs for each visual style version.
const _dialogRegistry = new Map();


//#==========================================================================#
//#                           FETCH VISUAL STYLES                            #
//# FIRST generation of UI fetched the items directly using this function    #
//# and loaded them into a native ComfyUI combo-box. Currently, the function #
//# is internally invoked from GALLERY DIALOG and the GALLERY WIDGET.        #

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
async function fetchVisualStyleArray(version)
{
    if (typeof version !== 'string' || !version.trim()) {
        console.error(`Invalid version parameter: "${version}". Expected a non-empty string.`);
        return [];
    }

    // if the version already exists in cache (either the ongoing promise
    // or resolved result), return it!
    if( _fetchStylesCache.has(version) ) {
        return _fetchStylesCache.get(version);
    }

    // define the fetching process in a promise
    const fetchPromise = (async () => {
        try {
            const response = await api.fetchApi(`/zi_power/styles/by_version?v=${encodeURIComponent(version)}`);
            if( !response.ok ) {
                console.error(`Failed to fetch styles for version ${version}: HTTP ${response.status}`);
                return [];
            }

            // validate that the response is an actual array
            const styles = await response.json();
            if( !Array.isArray(styles) ) {
                console.error(`Failed to fetch styles for version ${version}: Expected an array but received ${typeof styles}`);
                return [];
            }

            const THUMBNAIL_PREFIX = "/zi_power/styles/samples?file=";
            return styles.map((style, index) => {
                const tagsString = style[3] || "";
                return {
                    id         : index,
                    name       : style[0] || "Unknown",
                    category   : style[1] || "Uncategorized",
                    description: style[2] || "",
                    tags       : tagsString ? tagsString.split(",").map(t => t.trim()) : [],
                    thumbnail  : style[4]   ? `${THUMBNAIL_PREFIX}${style[4]}`          : ""
                };
            });

        } catch (error) {
            // if failed, delete the cache for this version to allow future retries
            console.error(`Failed to fetch styles for version ${version}: ${error.message}`);
            _fetchStylesCache.delete(version);
            return [];
        }
    })();

    // store the promise in cache for future use
    _fetchStylesCache.set(version, fetchPromise);
    return fetchPromise;
}


//#=========================================================================#
//#                          STYLE GALLERY DIALOG                           #
//# SECOND generation of UI added a button within the node that launched a  #
//# GALLERY DIALOG, which in turn modified a native combo-box in ComfyUI.   #
//#                                                                         #

class StyleDialogDelegate extends GalleryDialogDelegate {

    constructor(version) {
        super();
        this._version = version; //< the version of the styles to fetch
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
        return fetchVisualStyleArray(this._version);
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
 * Returns the gallery dialog for the specified version of the visual styles.
 * @param {string} version - The version of the visual styles to show in the gallery
 * @returns {GalleryDialog}
 *     The dialog instance for the specified version
 *
 * Usage example:
 *     const styleVersion = "1.0"; //< version of the style definitions
 *     const styleDialog  = requireVisualStyleGalleryDialog(styleVersion);
 *     const currentStyle = "Anime";
 *     styleDialog.launch("Select Style", currentStyle, (selectedStyle) => {
 *         console.log("Selected Style: " + selectedStyle);
 *     });
 */
function requireVisualStyleGalleryDialog(version) {
    let dialog = _dialogRegistry.get(version);
    if( !dialog ) {
        dialog = new GalleryDialog(new StyleDialogDelegate(version));
        _dialogRegistry.set(version, dialog);
    }
    return dialog;
}


//#=========================================================================#
//#                          STYLE GALLERY WIDGET                           #
//# THIRD generation of UI uses GALLERY WIDGET to launch the GALLERY DIALOG,#
//# these gallery widgets are customized by 'delegate' objects.             #
//#                                                                         #

class StyleWidgetDelegate extends GalleryWidgetDelegate {

    constructor(version) {
        super();
        this.version = version; //< the version of the styles to fetch
    }

    async fetchItemArray() {
        return fetchVisualStyleArray(this.version);
    }

    getItemText(item, _value) {
        if( !item ) { return "Undefined"; }
        return `${item.name}\n${item.category}`;
    }

    getItemThumbnailURL(item, _value) {
        return item?.thumbnail || "";
    }

    /**
     * Draws the image/thumbnail for a specific item.
     *
     * @param {CanvasRenderingContext2D} ctx   - The canvas 2D rendering context
     * @param {Object}                   rect  - The rectangle object defining the drawing area (left, top, width, height)
     * @param {Object}                   item  - The item data to render
     * @param {string}                   value - The current value of the widget (not used in this method)
     * @param {Function}          requestImage - A function to request an image from a URL
     */
    drawItemThumbnail(ctx, rect, item, value, requestImage) {
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
    const type    = data[0];
    const options = data[1] || {};
    const version = options.version || '1.0';
    let   widget  = new GalleryWidget(type, node, name, options, new StyleWidgetDelegate(version), (self) =>
    {
        // launch dialog and update widget value
        const styleDialog = requireVisualStyleGalleryDialog(version);
        styleDialog.launch( self.options.dialog_title, self.value, (selectedStyle) => {
            self.forceUpdate( selectedStyle );
        });
    });
    widget = node.addCustomWidget( widget );
    return { widget: widget };
}

