/**
 * File    : gallery_widget.js
 * Purpose : A generic, customizable ComfyUI node widget for selecting
 *           items featuring thumbnail previews.
 * Author  : Martin Rizzo | <martinrizzo@gmail.com>
 * Date    : May 18, 2026
 * Repo    : https://github.com/martin-rizzo/ComfyUI-ZImagePowerNodes
 * License : MIT
 *- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 *
 * While this class is part of the `ComfyUI-ZImagePowerNodes` suite, it was
 * designed to be as generic and modular as possible. The goal is for it to
 * be easily plug-and-play in any other ComfyUI Nodes project you might be
 * working on.
 *
 * Feel free to use it, modify it, or integrate it however you like! If you
 * find it useful, a quick shout-out to this project or a mention of my name
 * would be greatly appreciated. :)
 *
 * Note that although the code is currently compatible with Nodes 2.0, it
 * uses deprecated ComfyUI functions that may be removed at some point.
 * I intend to migrate the code to full compatibility as soon as official
 * Nodes 2.0 documentation becomes available.
 *_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
 */
export { GalleryWidget, GalleryWidgetDelegate };
import { LiteGraph } from "../comfyui_bridge.js";


//#========================= GalleryWidgetDelegate =========================#

/**
 * Base class to implement to customize the gallery widget.
 * This class defines the method for retrieving all items available
 * for selection and the rendering method for each item.
 */
class GalleryWidgetDelegate {

    /**
     * Fetches an array with data about each item that can be selected.
     * Subclasses MUST implement this method to provide item data.
     *
     * @returns {Promise<Array<Object>>}
     *   Resolves to the array of formatted gallery items.
     *   Each item object must contain at least the following properties:
     *       - name : The display name of the item (string)
     *       - any data to be rendered with the widget
     * @example
     * // How to implement in a subclass:
     * class MyWidgetDelegate extends GalleryWidgetDelegate {
     *     async fetchItemArray() {
     *         const data = await myApi.get('/items');
     *         return data.map((item, index) => ({
     *           name       : item.title || "unknown",
     *           description: item.desc,
     *           thumbnail  : item.thumbnail,
     *         }));
     *     }
     * }
     */
    async fetchItemArray() {
        throw new Error("Method 'fetchItemArray()' must be implemented by any GalleryWidgetDelegate subclass");
    }

    /**
     * Gets the displayed description text for the given item.
     * Subclasses MUST implement this method to provide custom description logic.
     *
     * @param {Object} item  - The item data object containing item properties such as name and category
     * @param {string} value - The current value of the widget, as reported to the backend
     * @returns {string}
     *     A string representing the item's description, with one or two lines separated
     *     by a newline character ('\n').
     * @example
     *     // Example of subclass implementation:
     *     getItemText(item, value) {
     *         return `${item.name}\n${item.category}`;
     *     }
     */
    getItemText(_item, _value) {
        return "getItemText(..) missing";
    }

    /**
     * Called when a thumbnail needs to be drawn for a specific item.
     * Subclasses MUST implement this method to provide custom thumbnail rendering.
     *
     * @param {CanvasRenderingContext2D} ctx - The canvas 2D rendering context
     * @param {Object} rect - The rectangle object defining the drawing area (left, top, width, height)
     * @param {Object} item - The item data to render
     * @param {string} value - The current value of the widget, as reported to the backend
     */
    drawItemThumbnail(ctx, rect, _item, _value) {
        ctx.fillStyle = '#FF4D4D';
        ctx.fillRect(rect.left, rect.top, rect.width, rect.height);
    }

    /**
     * Called when text details need to be drawn for a specific item.
     * This method CAN be overridden to provide custom text rendering.
     *
     * Typically draws 2 lines of text (item name + additional info), the current
     * implementation will draw a single centered line if `line2` is empty.
     *
     * @param {CanvasRenderingContext2D} ctx - The canvas 2D rendering context
     * @param {Object} rect - The rectangle object defining the drawing area
     * @param {Object} item - The item data to be drawn
     * @param {string} value - The current value reported by the widget to the backend
     * @returns {number} The maximum width (in pixels) occupied by the rendered text elements,
     *                   which represents the space needed to the right of the drawing area
     *                   for proper layout calculations.
     */
    drawItemText(ctx, rect, line1, line2, _item, _value) {
        const rightEdge   = rect.left + rect.width;
        const top         = rect.top    - 2;
        const height      = rect.height + 4;
        const centerY1    = top  + (height / (line2 ? 3 : 2));
        const centerY2    = top  + (height / 3) * 2;
        ctx.textBaseline = 'middle';
        ctx.textAlign    = 'right';

        // LINE 1: top line in bold
        ctx.font      = `bold ${LiteGraph.NODE_TEXT_SIZE}px ${LiteGraph.NODE_FONT}`;
        ctx.fillStyle = LiteGraph.WIDGET_TEXT_COLOR;
        ctx.fillText(line1, rightEdge, centerY1);
        let width = ctx.measureText(line1).width;

        // LINE 2 (optional): bottom line
        if( line2 ) {
            ctx.font      = `${LiteGraph.NODE_SUBTEXT_SIZE}px ${LiteGraph.NODE_FONT}`;
            ctx.fillStyle = LiteGraph.WIDGET_SECONDARY_TEXT_COLOR;
            ctx.fillText(line2, rightEdge, centerY2);
            const width2 = ctx.measureText(line2).width;
            if( width2 > width ) { width = width2; }
        }
        return width;
    }

    /**
     * Draws the main container and navigation arrows within the specified rectangle.
     * This method is NOT intended to be overridden by subclasses.
     *
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
     * @param {Object} rect - The rectangle object (left, top, width, height).
     * @param {number} padding - The padding to apply inside the container.
     * @param {number} arrowButtonWidth - The width allocated for the arrow buttons.
     * @returns {Object} The updated rectangle object after accounting for container margins and arrows.
     */
    drawContainerAndArrows(ctx, rect, padding, arrowButtonWidth) {
        const lineSize = 1;
        const radii = rect.height / 4;

        // draw the main container
        ctx.fillStyle   = LiteGraph.WIDGET_BGCOLOR;
        ctx.strokeStyle = LiteGraph.WIDGET_OUTLINE_COLOR;
        ctx.lineWidth   = lineSize;
        ctx.beginPath();
        ctx.roundRect(rect.left, rect.top, rect.width, rect.height, radii);
        ctx.fill();
        ctx.stroke();

        const midLineSize = Math.floor(lineSize / 2);
        rect.left += midLineSize ; rect.width  -= 2*midLineSize;
        rect.top  += midLineSize ; rect.height -= 2*midLineSize;

        // prepare for drawing arrows
        ctx.font         = `${LiteGraph.NODE_TEXT_SIZE}px ${LiteGraph.NODE_FONT}`;
        ctx.textAlign    = "center";
        ctx.textBaseline = "middle";
        const centerY    = rect.top + (rect.height / 2);
        const rect_right = rect.left + rect.width;

        // draw left and right arrows
        ctx.fillStyle = LiteGraph.WIDGET_TEXT_COLOR;
        ctx.fillText("◀", rect.left  + (arrowButtonWidth/2), centerY);
        ctx.fillStyle = LiteGraph.WIDGET_TEXT_COLOR;
        ctx.fillText("▶", rect_right - (arrowButtonWidth/2), centerY);

        // calculate the inside rect
        rect.left += arrowButtonWidth + padding;  rect.width  -= 2*arrowButtonWidth + 2*padding;
        rect.top  += padding;                     rect.height -= 2*padding;
        return rect;
    }
}


//#=========================================================================#
//#//////////////////////// INTERNAL IMPLEMENTATION ////////////////////////#
//#=========================================================================#

/**
 * A generic, customizable ComfyUI widget for selecting items, featuring
 * thumbnail previews and navigation controls.
 */
class GalleryWidget {

    /**
     * Creates a new GalleryWidget instance customized with the given options.
     * @param {string}                type       - The type of the widget. Generally a custom type registered by the user in ComfyUI.
     * @param {string}                name       - Unique identifier for the widget (not used for value serialization)
     * @param {Object}                options    - Configuration options (e.g., styles, height, socketless).
     * @param {GalleryWidgetDelegate} delegate   - Instance responsible for item data and rendering.
     * @param {Function}              [onAction] - Optional callback function executed when the center of the widget is clicked.
     */
    constructor(type, name, options, delegate, onAction) {

        /** @type {string} The type of the widget. Generally a custom type registered by the user in ComfyUI */
        this.type = type;

        /** @type {string} Unique identifier for the widget (not used for value serialization) */
        this.name = name;

        /** @type {GalleryWidgetDelegate} External object to render the items */
        this.delegate = delegate || new GalleryWidgetDelegate();

        /** @type {string} The current selected value (Empty = nothing selected) */
        this._value = "";

        /** @type {number} Index of the currently selected item (-1 = nothing selected) */
        this._selectedIndex = -1;

        /** @type {Array<number>} The horizontal and vertical margins of the widget */
        this.widgetMargin = [14, 1];

        /** @type {number} Width of the left/right arrow buttons */
        this.arrowButtonWidth = 24;

        /** @type {Function|null} Optional function to execute when the user clicks in the center of the widget. */
        this.onAction = onAction || null;

        /** @type {boolean} Flag used by ComfyUI to know if the value must be serialized */
        this.serialize = true;

        /** @type {Object} The configuration options passed to the widget */
        this.options = {
            socketless: true,
            height    : 32,
            ...options
        };

        // bind methods to ensure correct 'this' context
        this.draw          = this.draw.bind(this);
        this.onPointerDown = this.onPointerDown.bind(this);
        this.computeSize   = this.computeSize.bind(this);

        // load item data
        this.itemArray = [];
        this.delegate.fetchItemArray().then( itemArray => {
            this.itemArray = itemArray;
        });
    }


    /**
     * Gets the current selected value.
     * @returns {string} The current selected value.
     */
    get value() {
        return this._value;
    }

    /**
     * Sets the current selected value.
     * @param {string} value - The value to set.
     */
    set value(value) {
        if( this._value === value ) { return; }

        // modify the value and trigger visual update
        this._value         = value;
        this._selectedIndex = null;  //< invalidate the selected index (must be recalculated)
        if( typeof this.node?.setDirtyCanvas === 'function' ) {
            this.node.setDirtyCanvas(true);
        }
    }

   /**
     * Gets the selected item index.
     * Calculates the index based on `this.value` and ???
     * @returns {number} The index of the selected item or -1 if not found, or no data, or nothing selected.
     */
    get selectedIndex() {
        // if the index was invalidated, recalculate it
        if( this._selectedIndex == null ) {
            this._selectedIndex = -1;
            if( this._value && Array.isArray(this.itemArray) ) {
                this._selectedIndex = this.itemArray.findIndex(item => item.name === this._value);
            }
        }
        return this._selectedIndex;
    }

    /**
     * Sets the selected item index and updates `this.value` accordingly.
     * @param {number} index - The index of the selected item.
     */
    set selectedIndex(index) {
        if( !Array.isArray(this.itemArray) || this.itemArray.length===0 ) { return; }

        // clamp the index
        index = Math.max(0, Math.min(index, this.itemArray.length - 1));
        if( index == this._selectedIndex ) { return; }

        // modify the value and index and trigger visual update
        this._selectedIndex = index;
        this._value         = this.itemArray[index].name;
        if( typeof this.node?.setDirtyCanvas === 'function' ) {
            this.node.setDirtyCanvas(true);
        }
    }


    /**
     * Draws all widget elements: container, navigation arrows, thumbnails, and descriptive text.
     * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
     * @param {Object} node - The parent ComfyNode object.
     * @param {number} widgetWidth   - The width allocated to this widget.
     * @param {number} y             - The vertical offset of the widget.
     * @param {number} _widgetHeight - The height allocated (unused internal parameter).
     */
    draw(ctx, node, widgetWidth, y, _widgetHeight) {
        const padding = 4;
        const spacing = 6;
        const thumbWidth = 32;
        const item = this.itemArray[this.selectedIndex];

        ctx.save();

        // draw container and arrows
        let rect = {
            left  : this.widgetMargin[0],
            top   : y + this.widgetMargin[1],
            width : widgetWidth - 2*this.widgetMargin[0],
            height: 48          - 2*this.widgetMargin[1] };
        rect = this.delegate.drawContainerAndArrows(ctx, rect, padding, this.arrowButtonWidth);

        // draw item thumbnail
        if( thumbWidth > 0 ) {
            const thumbRect = {
                left  : rect.left+rect.width - thumbWidth,
                top   : rect.top,
                width : thumbWidth,
                height: rect.height
            };
            this.delegate.drawItemThumbnail(ctx, thumbRect, item, this.value);
            rect.width -= thumbWidth;
            rect.width -= spacing;
        }

        // get item text (can be one or two lines)
        let itemText = this.delegate.getItemText(item, this.value);
        if( typeof itemText === 'string' ) itemText = itemText.split('\n');
        const line1 = itemText.length > 0 ? itemText[0] : "";
        const line2 = itemText.length > 1 ? itemText[1] : "";

        // draw item text description
        const textWidth = this.delegate.drawItemText(ctx, rect, line1, line2, item, this.value);
        if( typeof textWidth === 'number' ) {
            rect.width -= Math.ceil(textWidth);
        }

        // TODO: dibujar text.name a izquierda, centrado verticalmente dentro de 'rect'
        ctx.font         = `${LiteGraph.NODE_SUBTEXT_SIZE}px ${LiteGraph.NODE_FONT}`;
        ctx.fillStyle    = LiteGraph.WIDGET_SECONDARY_TEXT_COLOR; //this.text_color;
        ctx.textAlign    = 'left';
        ctx.textBaseline = 'middle';
        this.drawTextWithEllipsis(ctx, rect, this.name);

        ctx.restore();
    }

    /**
     * Handles pointer down event for node interaction
     * @param {CanvasPointer} pointerOrEvent - Pointer or event object containing mouse/touch data
     * @param {ComfyNode}     node           - Node object with position data
     * @param {LGraphCanvas}  _canvas        - Canvas object for coordinate calculations
     * @returns {boolean}
     *     Returns true if processing was successful
     */
    onPointerDown(pointerOrEvent, node, _canvas) {
        if( ! pointerOrEvent?.eDown ) { return; }
        if( ! node?.pos ) { return; }

        const event       = pointerOrEvent.eDown;
        const localX      = event.canvasX - (node.pos[0] || 0);
        const widgetWidth = node.size[0] || 0;
        pointerOrEvent.onClick = () =>
        {
            if( localX < this.widgetMargin[0] + this.arrowButtonWidth ) {
                this.selectedIndex = this.selectedIndex - 1;
            }
            else if( localX > widgetWidth - this.widgetMargin[0] - this.arrowButtonWidth ) {
                this.selectedIndex = this.selectedIndex + 1;
            }
            else {
                if( this.onAction ) { this.onAction(this); }
            }
        };
        return true;
    };

    /**
     * Draws text with ellipsis truncation within the given rectangle
     * @param {CanvasRenderingContext2D} ctx - The canvas context
     * @param {Object} rect - The rectangle bounds for the text
     * @param {string} text - The text to draw
     */
    drawTextWithEllipsis(ctx, rect, text) {
        if( !text || rect.width <= 0 ) { return; }
        const textX          = rect.left;
        const textY          = rect.top + rect.height / 2;
        const availableWidth = rect.width;

        // check if the text fits within the available width without truncation
        if( ctx.measureText(text).width <= availableWidth ) {
            ctx.fillText(text, textX, textY);
            return;
        }

        // if the ellipsis itself doesn't fit, there's no point in drawing anything
        const ellipsis = '...';
        const ellipsisWidth = ctx.measureText(ellipsis).width;
        if( ellipsisWidth >= availableWidth ) {
            return;
        }

        // binary search to find the optimal cutoff point for the text
        let low  = 0;
        let high = text.length;
        let bestLength = 0;
        while( low <= high )
        {
            const mid      = (low + high) >> 1; //< fast integer division
            const testText = text.substring(0, mid) + ellipsis;
            if (ctx.measureText(testText).width <= availableWidth) {
                // this length fits, try for a longer one
                bestLength = mid; 
                low = mid + 1;
            } else {
                // this length doesn't fit, try a shorter one
                high = mid - 1;
            }
        }
        const displayText = text.substring(0, bestLength) + ellipsis;
        ctx.fillText(displayText, textX, textY);
    }

    /**
     * Computes the widget size
     * @param {number} widgetWidth - The widget width
     * @returns {Array} The computed size [width, height]
     */
    computeSize(widgetWidth) {
        return [widgetWidth, 48];
    }

}

