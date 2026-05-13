export { SelectorWidgetPalettes };
import { SelectorWidget } from "./selector_widget.js";


/**
 * Custom widget that allows to select a color palette from a palette list.
 */
class SelectorWidgetPalettes extends SelectorWidget {

    /**
     * Creates a new PaletteSelectorWidget instance.
     * @param {string} type    - A string containing the type of the widget.
     * @param {string} name    - Unique identifier for the widget (not used for value serialization)
     * @param {Array}  value   - The initial value selected in the widget
     * @param {Object} options - Additional options for the widget
     */
    constructor(type, name, value, options) {
        super(type, name, value, options);

        this.colorPaletteItems = [
            {
                id: 0,
                name       : "Volcano",
                category   : "Warm",
                description: "Intense and energetic tones inspired by flowing magma.",
                tags: ["hot", "vibrant", "red", "dark"],
                colors: [
                    { name: "Obsidian"  , hex: "#1B1B1B" },
                    { name: "Deep Ember", hex: "#741212" },
                    { name: "Magma"     , hex: "#C0392B" },
                    { name: "Lava"      , hex: "#E67E22" },
                    { name: "Sulfur"    , hex: "#F1C40F" }
                ]
            },{
                id: 1,
                name       : "Arctic Frost",
                category   : "Cold",
                description: "Crystalline blues and whites reflecting polar landscapes.",
                tags: ["ice", "clean", "blue", "winter"],
                colors: [
                    { name: "Midnight Sea", hex: "#2C3E50" },
                    { name: "Glacier"     , hex: "#2980B9" },
                    { name: "Frost"       , hex: "#3498DB" },
                    { name: "Ice Cap"     , hex: "#AED6F1" },
                    { name: "Snow"        , hex: "#ECF0F1" }
                ]
            },{
                id: 2,
                name       : "Amazonia",
                category   : "Nature",
                description: "Deep jungle greens and earthy organic tones.",
                tags: ["forest", "organic", "green", "growth"],
                colors: [
                    { name: "Undergrowth", hex: "#1B5E20" },
                    { name: "Canopy"     , hex: "#2E7D32" },
                    { name: "Leaf"       , hex: "#4CAF50" },
                    { name: "Bamboo"     , hex: "#8BC34A" },
                    { name: "Moss"       , hex: "#DCEDC8" }
                ]
            }
        ];
    }

    /**
     * Called when the widget needs to know the total number of items available.
     * @returns {number} The total count of items available
     */
    onRequestItemCount() {
        return this.colorPaletteItems.length;
    }

    /**
     * Called when the widget needs to know the value of a specific item.
     * @param {number} itemIndex - The index of the item to retrieve the value for
     * @returns {string} The value of the item
     */
    onRequestItemValue(itemIndex) {
        return this.colorPaletteItems[itemIndex].name;
    }

    /**
     * Called when the widget needs to find the index of a specific item value.
     * @param {string} itemValue - The value of the item to find the index for
     * @returns {number} The index of the item, or -1 if not found
     */
    onRequestItemIndex(itemValue) {
        return this.colorPaletteItems.findIndex(item => item.name === itemValue);
    }

    /**
     * Called when a thumbnail needs to be drawn for a specific item.
     * @param {number}              itemIndex - The index of the item to draw the thumbnail for
     * @param {CanvasRenderingContext2D} ctx  - The canvas 2D rendering context
     * @param {Object}                   rect - The rectangle object defining the drawing area (left, top, width, height)
     */
    onDrawThumb(itemIndex, ctx, rect) {
        const barCount       = 5;
        const barSpacing     = 2;
        const barWidth       = Math.floor((rect.width - 1) / barCount) + 1  -  barSpacing;
        const barHeight      = rect.height;
        const totalBarsWidth = (barWidth * barCount) + (barSpacing * (barCount - 1));

        // draw the bars
        const x      = rect.left + (rect.width/2) - (totalBarsWidth/2);
        const y      = rect.top;
        const colors = this.colorPaletteItems[itemIndex].colors;
        for( let i = 0 ; i < barCount ; i++ ) {
            ctx.fillStyle = colors[i].hex;
            ctx.fillRect(x + (i * (barWidth + barSpacing)), y, barWidth, barHeight);
        }
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
        const palette = this.colorPaletteItems[itemIndex];

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
        ctx.fillText(palette.name, right, rect.top + marginTop);
        const nameWidth = ctx.measureText(palette.name).width;

        // draw category text (second line)
        ctx.font = 'bold 12px sans-serif';
        ctx.fillStyle = '#000';
        ctx.fillText(palette.category, right, rect.top + marginTop + lineHeight);
        const categoryWidth = ctx.measureText(palette.category).width;

        // return the maximum width for proper layout calculations
        return Math.max(categoryWidth, nameWidth);
    }
}
