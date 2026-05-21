/**
 * File    : custom_widgets/visual_styles.js
 * Purpose : Implements Dialog, Widget, and DataProvider for visual styles, ensuring
 *           compatibility with previous Power Nodes versions. This centralizes the
 *           visual style UI across different versions, preventing redundant code
 *           implementation and maintaining functionality for deprecated nodes.
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
export { fetchVisualStyles };
import { api } from "../../../scripts/api.js";

// Cache of promises to avoid duplicate requests
const visualStylesCache = new Map();

/**
 * Fetches an array with data about each visual style from the server.
 * @param {string} version - The version of the styles to fetch.
 * @returns {Promise<Array<Object>>} Resolves to the array of formatted styles.
 *     Each element in the array is an object with the following properties:
 *       - id         : Unique identifier for the style (the index in the list)
 *       - name       : The name of the style (string)
 *       - category   : The category of the style (string)
 *       - description: Description of the style (string)
 *       - tags       : Array of tags associated with the style (Array<string>)
 *       - thumbnail  : URL for the style's thumbnail image (string)
 */
async function fetchVisualStyles(version)
{
    if (typeof version !== 'string' || !version.trim()) {
        console.error(`Invalid version parameter: "${version}". Expected a non-empty string.`);
        return [];
    }

    // if the version already exists in cache (either the ongoing promise
    // or resolved result), return it!
    if( visualStylesCache.has(version) ) {
        return visualStylesCache.get(version);
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
            visualStylesCache.delete(version);
            return [];
        }
    })();

    // store the promise in cache for future use
    visualStylesCache.set(version, fetchPromise);
    return fetchPromise;
}

