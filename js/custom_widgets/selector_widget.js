/**
 * File    : selector_widget.js
 * Purpose : Generic class for ComfyUI widget that allows to select a value from a list of items with thumbnails.
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
 *_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
 */
export { SelectorWidget };
import { LiteGraph } from "../comfyui_bridge.js";


//#====================== SelectorWidget.DataProvider ======================#
// THIS CLASS MUST BE IMPLEMENTED TO PROVIDE THE ITEM LIST
//

/**
 * Class to implement the visual presentation of items in the selector widget.
 */
class SelectorWidgetDataProvider {

    /**
     * Fetches an array with data about each item that can be selected.
     * Must be overridden by subclasses to implement data retrieval.
     *
     * @abstract
     * @returns {Promise<Array<Object>>}
     *   Resolves to the array of formatted gallery items.
     *   Each item object must contain at least the following properties:
     *       - name : The display name of the item (string)
     *       - any data to be rendered with `SelectorWidgetItemRenderer`
     *
     * @example
     * // How to implement in a subclass:
     * class MyDataProvider extends SelectorWidget.DataProvider {
     *     async fetchItemArray() {
     *         const data = await myApi.get('/items');
     *         return data.map((item, index) => ({
     *           name       : item.title | "unknown",
     *           description: item.desc,
     *           thumbnail  : item.thumbnail,
     *         }));
     *     }
     * }
     */
    async fetchItemArray() {
        throw new Error("Method 'fetchItemArray()' must be implemented by any SelectorWidgetDataProvider subclass");
    }

}

//#====================== SelectorWidget.ItemRenderer ======================#
// THIS CLASS MUST BE IMPLEMENTED TO CUSTOMIZE THE VISUAL PRESENTATION OF ITEMS
//

/**
 * Class to implement the visual presentation of items in the selector widget.
 */
class SelectorWidgetItemRenderer {

    /**
     * Called when a thumbnail needs to be drawn for a specific item.
     *
     * @abstract
     * @param {number}              itemIndex - The index of the item to draw the thumbnail for
     * @param {CanvasRenderingContext2D} ctx  - The canvas 2D rendering context
     * @param {Object}                   rect - The rectangle object defining the drawing area (left, top, width, height)
     */
    drawThumbnail(itemIndex, ctx, rect) { }

    /**
     * Called when text details need to be drawn for a specific item.
     * Typically draws 2 lines of text (item name + additional info)
     *
     * @abstract
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
    drawDetails(itemIndex, ctx, rect, value) { }

}




//#=========================================================================#
//#//////////////////////// INTERNAL IMPLEMENTATION ////////////////////////#
//#=========================================================================#

class _DefaultItemRenderer extends SelectorWidgetItemRenderer {

    drawThumbnail(itemIndex, ctx, rect) {
        ctx.fillStyle = '#FF4D4D';
        ctx.fillRect(rect.left, rect.top, rect.width, rect.height);
    }

    drawDetails(itemIndex, ctx, rect, value) {
        const rightEdge   = rect.left + rect.width;
        const centerY1    = rect.top  + (rect.height / 3);
        const centerY2    = rect.top  + (rect.height / 3) * 2;
        const description = 'implement SelectorWidget.ItemRenderer';
        ctx.textBaseline = 'middle';
        ctx.textAlign    = 'right';

        // Línea 1: Título de marcador de posición
        ctx.font      = `bold ${LiteGraph.NODE_TEXT_SIZE}px ${LiteGraph.NODE_FONT}`;
        ctx.fillStyle = LiteGraph.WIDGET_TEXT_COLOR;;
        ctx.fillText(value, rightEdge, centerY1);
        const width1 = ctx.measureText(value).width;

        // Línea 2: Subtítulo de advertencia
        ctx.font      = `${LiteGraph.NODE_SUBTEXT_SIZE}px ${LiteGraph.NODE_FONT}`;;
        ctx.fillStyle = LiteGraph.WIDGET_SECONDARY_TEXT_COLOR;
        ctx.fillText(description, rightEdge, centerY2);
        const width2 = ctx.measureText(description).width;

        return Math.max(width1, width2);
    }

}



/**
 * Base class for widgets that allows to select items with thumbnails
 * @class BaseSelectorWidget
 */
class SelectorWidget {

    static get ItemRenderer() { return SelectorWidgetItemRenderer; }
    static get DataProvider() { return SelectorWidgetDataProvider; }


    /**
     * Creates a new StyleSelectorWidget instance
     * @param {string} name - The name of the input
     * @param {SelectorWidgetDataProvider} dataProvider
     * @param {SelectorWidgetItemRenderer} itemRenderer
     */
    constructor(type, name, options, dataProvider, itemRenderer, action) {

        /** @type {string} The type of the widget. Generally a custom type registered by the user in ComfyUI */
        this.type = type;

        /** @type {string} Unique identifier for the widget (not used for value serialization) */
        this.name = name;

        /** @type {SelectorWidgetItemRenderer} External object to render the items */
        this.itemRenderer = itemRenderer || new _DefaultItemRenderer();

        /** @type {SelectorWidgetDataProvider} External object to provide the items to the widget */
        this.dataProvider = dataProvider,

        this.onAction     = action;
        this.value = "";
        this.serialize = true,
        this.options = {
            socketless: true,
            height: 32,
            ...options
        };

        // load item data from provider
        this.itemArray = [];
        this.dataProvider.fetchItemArray().then( itemArray => {
            this.itemArray = itemArray;
        });

        console.log("##>> name:", name);

        // Lista de estilos con sus respectivas rutas de imagen
        this.stylesList = this.options.styles || [
            { name: "Phone Photo", thumb: "placehold.co" },
            { name: "Cinematic",   thumb: "placehold.co" },
            { name: "Anime Art",   thumb: "placehold.co" }
        ];

        this.value = this.stylesList.name; // Valor por defecto inicial
        this.serialize = true;
        this.widgetOptions = {
            socketless: true,
            height: 32, // Alto explícito solicitado
            ...this.options
        };

        // Bind methods to ensure correct 'this' context
        this.draw = this.draw.bind(this);
        this.mouse = this.mouse.bind(this);
        this.computeSize = this.computeSize.bind(this);
    }

   /**
     * Draws the widget elements: thumbnail, arrows and text
     * @param {CanvasRenderingContext2D} ctx - The canvas context
     * @param {Object} node - The node object
     * @param {number} widgetWidth - The widget width
     * @param {number} y - The y position
     * @param {number} widgetHeight - The widget height
     */
    draw(ctx, node, widgetWidth, y, _widgetHeight) {
        const padding = 4;
        const spacing = 6;
        const thumbWidth = 32;

        ctx.save();

        // draw container and arrows
        let rect = { left: 0, top: y, width: widgetWidth, height: 48 };
        rect = this.drawContainerAndArrows(ctx, rect, padding);

        // draw item thumbnail
        if( thumbWidth > 0 ) {
            const thumbRect = {
                left  : rect.left+rect.width - thumbWidth,
                top   : rect.top,
                width : thumbWidth,
                height: rect.height
            };
            this.itemRenderer.drawThumbnail(0, ctx, thumbRect);
            rect.width -= thumbWidth;
            rect.width -= spacing;
        }

        // draw item text description
        const textWidth = this.itemRenderer.drawDetails(0, ctx, rect, this.value);
        if( typeof textWidth === 'number' ) {
            rect.width -= Math.ceil(textWidth);
        }

        // TODO: dibujar text.name a izquierda, centrado verticalmente dentro de 'rect'
        ctx.font         = `${LiteGraph.NODE_SUBTEXT_SIZE}px ${LiteGraph.NODE_FONT}`;
        ctx.fillStyle    = LiteGraph.WIDGET_SECONDARY_TEXT_COLOR; //this.text_color;
        ctx.textAlign    = 'left';
        ctx.textBaseline = 'middle';
        this.drawTextWithEllipsis(this.name, ctx, rect);

        ctx.restore();
    }

    /**
     * Draws the main container and arrows
     * @param {CanvasRenderingContext2D} ctx - The canvas context
     * @param {Object} rect        - The rectangle coordinates where the container is drawn
     * @param {number} rect.left   - The left position
     * @param {number} rect.top    - The top position
     * @param {number} rect.width  - The container width
     * @param {number} rect.height - The container height
     */
    drawContainerAndArrows(ctx, { left, top, width, height }, padding) {
        const marginX    = 14;
        const marginY    = 1;
        const arrowWidth = 24;
        const lineSize   = 1;

        left += marginX ;  width  -= (marginX * 2);
        top  += marginY ;  height -= (marginY * 2);
        const radii = height/4;

        // dibujar el contenedor principal
        ctx.fillStyle   = LiteGraph.WIDGET_BGCOLOR;
        ctx.strokeStyle = LiteGraph.WIDGET_OUTLINE_COLOR;
        ctx.lineWidth = lineSize;
        ctx.beginPath();
        ctx.roundRect(left, top, width, height, radii);
        ctx.fill();
        ctx.stroke();
        const midline = Math.floor(lineSize/2);
        left += midline/2 ; width  -= (midline*2);
        top  += midline/2 ; height -= (midline*2);

        // 2. dibujar flechas izquierda y derecha
        ctx.fillStyle    = LiteGraph.WIDGET_TEXT_COLOR;
        ctx.font         = `${LiteGraph.NODE_TEXT_SIZE}px ${LiteGraph.NODE_FONT}`;
        ctx.textAlign    = "center";
        ctx.textBaseline = "middle";

        const centerY = top + (height / 2);
        const leftArrowX = left + (arrowWidth/2);
        ctx.fillText("◀", leftArrowX, centerY);

        const rightArrowX = left + width - (arrowWidth/2);
        ctx.fillText("▶", rightArrowX, centerY);

        left += arrowWidth + padding ; width -= (arrowWidth*2) + (padding*2);
        top  += padding              ; height -= (padding*2);
        return { left: left, top: top, width: width, height: height };
    }

    /**
     * Draws text with ellipsis truncation within the given rectangle
     * @param {string} text - The text to draw
     * @param {CanvasRenderingContext2D} ctx - The canvas context
     * @param {Object} rect - The rectangle bounds for the text
     */
    drawTextWithEllipsis(text, ctx, rect) {
        if (!text || rect.width <= 0) return;

        const textX = rect.left;
        const textY = rect.top + rect.height / 2;
        const availableWidth = rect.width;

        // 1. Medición inicial rápida
        if (ctx.measureText(text).width <= availableWidth) {
            ctx.fillText(text, textX, textY);
            return;
        }

        const ellipsis = '...';
        const ellipsisWidth = ctx.measureText(ellipsis).width;

        // Si ni siquiera entra la elipsis, no dibujamos nada
        if( ellipsisWidth >= availableWidth ) return;

        // 2. Búsqueda binaria para encontrar el corte óptimo
        let low = 0;
        let high = text.length;
        let bestLength = 0;

        while (low <= high) {
            const mid = (low + high) >> 1; // División entera rápida
            const testText = text.substring(0, mid) + ellipsis;

            if (ctx.measureText(testText).width <= availableWidth) {
                bestLength = mid; // Este tamaño entra, probamos si entra más
                low = mid + 1;
            } else {
                high = mid - 1; // Se pasa, probamos con menos caracteres
            }
        }

        const displayText = text.substring(0, bestLength) + ellipsis;
        ctx.fillText(displayText, textX, textY);
    }


    // /**
    //  * Draws 5 vertical color bars inside a container frame
    //  * @param {CanvasRenderingContext2D} ctx - The canvas context
    //  * @param {number} x - The x-coordinate where the container frame will be positioned
    //  * @param {number} y - The starting y position (top of the bars)
    //  * @param {number} height - The height of each bar
    //  * @param {Array<string>} colors - Array of 5 color values (fillStyle compatible strings)
    //  * @param {"left"|"right"} [alignment="left"] - Determines which edge of the frame will be aligned to the x coordinate:
    //  *   - "left": The left edge of the container frame will be positioned at x
    //  *   - "right": The right edge of the container frame will be positioned at x
    //  * @returns {number} The width of the container frame.
    //  */
    // drawColorBars(ctx, x, y, height, colors, alignment="left") {
    //     const barCount   = 5;
    //     const barWidth   = 8;
    //     const barSpacing = 2;
    //     const totalBarsWidth = (barWidth * barCount) + (barSpacing * (barCount - 1));

    //     if (alignment === "right") {
    //         x -= totalBarsWidth;
    //     }
    //     for (let i = 0; i < barCount; i++) {
    //         ctx.fillStyle = colors[i];
    //         ctx.fillRect(x + (i * (barWidth + barSpacing)), y, barWidth, height);
    //     }
    //     return totalBarsWidth;
    // }


    /**
     * Called when details need to be drawn for a specific item.
     *
     * This method should render two lines of text for the given item. The text
     * should be drawn using the provided canvas context, right aligned within
     * the given rectangle area.
     * The method should return the maximum width occupied by the rendered text
     * elements to enable proper layout calculations.
     *
     * @param {number}             itemIndex - The index of the item to draw details for
     * @param {CanvasRenderingContext2D} ctx - The canvas 2D rendering context
     * @param {Object} rect        - The rectangle object defining the drawing area
     * @param {number} rect.left   - The left position of the drawing area
     * @param {number} rect.top    - The top position of the drawing area
     * @param {number} rect.width  - The width of the drawing area
     * @param {number} rect.height - The height of the drawing area
     * @returns {number} The maximum width (in pixels) occupied by the rendered text elements
     */
    onDrawDetails(_itemIndex, _ctx, _rect) {

    }

    /**
     * Handles mouse events for the widget
     * @param {Object} event - The mouse event
     * @param {Array} pos - The mouse position [x, y]
     * @param {Object} node - The node object
     * @returns {boolean} Whether the event was handled
     */
    mouse(event, pos, _node) {
        if (event.type !== "mousedown") return false;

        const x = pos;
        const currentIndex = this.stylesList.findIndex(s => s.name === this.value);
        const margin = 6;
        const thumbSize = (this.widgetOptions.height || 32) - (margin * 2) - 4;

        // Calcular posiciones X exactas de colisión para las flechas
        const leftArrowX = margin + 4 + thumbSize + 15;
        const rightArrowX = this.widgetOptions.width - margin - 15;
        const tolerance = 15; // Radio de clic de la flecha

        // Clic en Flecha Izquierda
        if (x >= leftArrowX - tolerance && x <= leftArrowX + tolerance) {
            let nextIndex = currentIndex - 1;
            if (nextIndex < 0) nextIndex = this.stylesList.length - 1;
            this.value = this.stylesList[nextIndex].name;
            this.node.setDirtyCanvas(true, true);
            return true;
        }

        // Clic en Flecha Derecha
        if (x >= rightArrowX - tolerance && x <= rightArrowX + tolerance) {
            let nextIndex = currentIndex + 1;
            if (nextIndex >= this.stylesList.length) nextIndex = 0;
            this.value = this.stylesList[nextIndex].name;
            this.node.setDirtyCanvas(true, true);
            return true;
        }

        return false;
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
