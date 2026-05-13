/**
 * File    : selector_widget_styles.js
 * Purpose : Custom widget for selecting a visual style, with thumbnail visualization.
 * Author  : Martin Rizzo | <martinrizzo@gmail.com>
 * Date    : May 19, 2026
 * Repo    : https://github.com/martin-rizzo/ComfyUI-ZImagePowerNodes
 * License : MIT
 *- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 *                        ComfyUI-ZImagePowerNodes
 *       ComfyUI nodes designed specifically for the "Z-Image" model.
 *_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
*/
export { SelectorWidgetStyles };
import { SelectorWidget }        from "./selector_widget.js";
import { getStyleGalleryDialog } from "../custom_dialogs/gallery_dialog_styles.js";


/**
 * Custom widget that allows to select a visual style.
 */
class SelectorWidgetStyles extends SelectorWidget {

    /**
     * Creates a new SelectorWidgetStyles instance.
     * @param {string} type    - A string containing the type of the widget.
     * @param {string} name    - Unique identifier for the widget value (not used for value serialization)
     * @param {Array}  value   - The initial value selected in the widget
     * @param {Object} options - Additional options for the widget
     */
    constructor(type, name, value, options) {
        const dialog = getStyleGalleryDialog("1.0");
        super(type, name, value, options, dialog.dataProvider);

        this.visualStyleItems = [];
        this.dialog = dialog;
        this.dialog.dataProvider.fetchDataArray( (items) =>
        {
            this.visualStyleItems = items;
        });

    }

    /**
     * Called when the widget needs to know the total number of items available.
     * @returns {number} The total count of items available
     */
    onRequestItemCount() {
        return this.visualStyleItems.length;
    }

    /**
     * Called when the widget needs to know the value of a specific item.
     * @param {number} itemIndex - The index of the item to retrieve the value for
     * @returns {string} The value of the item
     */
    onRequestItemValue(itemIndex) {
        return this.visualStyleItems[itemIndex].name;
    }

    /**
     * Called when the widget needs to find the index of a specific item value.
     * @param {string} itemValue - The value of the item to find the index for
     * @returns {number} The index of the item, or -1 if not found
     */
    onRequestItemIndex(itemValue) {
        return this.visualStyleItems.findIndex(item => item.name === itemValue);
    }

    /**
     * Called when a thumbnail needs to be drawn for a specific item.
     * @param {number}              itemIndex - The index of the item to draw the thumbnail for
     * @param {CanvasRenderingContext2D} ctx  - The canvas 2D rendering context
     * @param {Object}                   rect - The rectangle object defining the drawing area (left, top, width, height)
     */
    onDrawThumb(itemIndex, ctx, rect) {

    }

    /**
     * Called when details need to be drawn for a specific item.
     *
     * Typically draws 2 lines of text (value + additional info)
     * @param {number}             itemIndex - The index of the item to draw details for
     * @param {CanvasRenderingContext2D} ctx - The canvas 2D rendering context
     * @param {Object} rect        - The rectangle object defining the drawing area
     * @param {number} rect.left   - The left position of the drawing area
     * @param {number} rect.top    - The top position of the drawing area
     * @param {number} rect.width  - The width of the drawing area
     * @param {number} rect.height - The height of the drawing area
     * @returns {number} The maximum width (in pixels) occupied by the rendered text elements,
     *                   which represents the space needed to the right of the drawing area
     *                   for proper layout calculations.
     */
    onDrawDetails(itemIndex, ctx, rect) {
        const style = this.visualStyleItems[itemIndex];
        if( style === undefined ) { return; }

        // set text styles
        ctx.textAlign = 'right';
        ctx.textBaseline = 'top';

        // calculate text dimensions
        const lineHeight = 16;
        const marginTop = 4;
        const right = rect.left + rect.width;

        // draw name text (first line)
        ctx.font = '12px sans-serif';
        ctx.fillStyle = '#666';
        ctx.fillText(style.name, right, rect.top + marginTop);
        const nameWidth = ctx.measureText(style.name).width;

        // draw category text (second line)
        ctx.font = 'bold 12px sans-serif';
        ctx.fillStyle = '#000';
        ctx.fillText(style.category, right, rect.top + marginTop + lineHeight);
        const categoryWidth = ctx.measureText(style.category).width;

        // return the maximum width for proper layout calculations
        return Math.max(categoryWidth, nameWidth);
    }
}
