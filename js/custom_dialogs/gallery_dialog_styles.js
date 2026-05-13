/**
 * File    : gallery_dialog_styles.js
 * Purpose : A dialog interface for selecting visual styles from a gallery.
 * Author  : Martin Rizzo | <martinrizzo@gmail.com>
 * Date    : May 19, 2026
 * Repo    : https://github.com/martin-rizzo/ComfyUI-ZImagePowerNodes
 * License : MIT
 *- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 *                        ComfyUI-ZImagePowerNodes
 *       ComfyUI nodes designed specifically for the "Z-Image" model.
 *_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
 USAGE:

     import { getStyleGalleryDialog } from "./gallery_dialog_styles.js";

     const styleVersion = "1.0"; //< version of the style definitions
     const styleDialog  = getStyleGalleryDialog(styleVersion);
     const currentStyle = "Anime"
     styleDialog.launch( "Select Style", currentStyle, (selectedStyle) =>
     {
        console.log("Selected Style: " + selectedStyle);
     });

  _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
 */
export { getStyleGalleryDialog };
import { api }           from "../../../scripts/api.js";
import { GalleryDialog } from "./gallery_dialog.js";


class StyleDataProvider extends GalleryDialog.DataProvider {

    constructor() {
        super();
        this._cachedStyles = null; //< List of all styles
    }

    /**
     * Fetches a array with data about each element in the gallery.
     *
     * @param {function(Array<Object>)} callback
     *     A callback function that receives an array containing all elements in the gallery.
     *     Each element is an object with the following properties:
     *       - id         : Unique identifier for the style (the index in the list)
     *       - name       : The name of the style (string)
     *       - lowerName  : The name of the style, converted to lowercase (string)
     *       - category   : The category of the style (string)
     *       - description: Description of the style (string)
     *       - tags       : Array of tags associated with the style (Array<string>)
     *       - thumbnail  : URL for the style's thumbnail image (string)
     */
    async fetchDataArray(callback) {
        if( typeof callback !== "function" )
        { console.error("The provided argument is not a valid function."); return; }

        // if it has already been queried before, returns the stored result
        if( self._cachedStyles ) { callback( self._cachedStyles ); return; }

        try {
            const response = await api.fetchApi("/zi_power/styles/last_version");
            const styles   = await response.json();
            if( typeof styles !== "object" )
            { console.error("The fetching of last version style failed."); return; }

            // prefix used when requesting thumbnails
            const thumbnailRequestPrefix = "/zi_power/styles/samples?file=";

            self._cachedStyles = styles.map((style, index) => {
                return {
                    id         : index,
                    name       : style[0],
                    lowerName  : style[0].toLowerCase(),
                    category   : style[1],
                    description: style[2],
                    tags       : style[3].split(","),
                    thumbnail  : thumbnailRequestPrefix + style[4]
                };
            });
            callback( self._cachedStyles );
        } catch (error) {
            console.error("Failed to fetch styles:", error);
        }
    }

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


class StyleItemRenderer extends GalleryDialog.ItemRenderer {

}

const dialogs = {};

function getStyleGalleryDialog(version) {
    let dialog = dialogs[version];
    if( !dialog ) {
        dialog = new GalleryDialog(new StyleDataProvider(), new StyleItemRenderer());
        dialogs[version] = dialog;
    }
    return dialog;
}


