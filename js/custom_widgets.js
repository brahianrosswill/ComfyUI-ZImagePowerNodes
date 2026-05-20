/**
 * File    : custom_widgets.js
 * Purpose : Custom widgets used in this project.
 * Author  : Martin Rizzo | <martinrizzo@gmail.com>
 * Date    : Feb 3, 2026
 * Repo    : https://github.com/martin-rizzo/ComfyUI-ZImagePowerNodes
 * License : MIT
 *- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 *                        ComfyUI-ZImagePowerNodes
 *       ComfyUI nodes designed specifically for the "Z-Image" model.
 *_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _

 The ComfyUI native WEBCAM widget code can be found here:
  - https://github.com/Comfy-Org/ComfyUI_frontend/blob/v1.39.5/src/extensions/core/webcamCapture.ts

*/
import { app }                    from "../../../scripts/app.js";
import { LiteGraph }              from "./comfyui_bridge.js";
import { SelectorWidgetPalettes } from "./custom_widgets/selector_widget_palettes.js";
import { SelectorWidgetStyles   } from "./custom_widgets/selector_widget_styles.js";
import { addStyleGalleryButton  } from "./custom_widgets/style_gallery_button.js";
const ENABLED = true;
const DEFAULT_WIDGET_HEIGHT = 20;


/**
 * Adds a palette selector widget to a node.
 *
 * @param {LGraphNode} node  - ComfyUI node where the widget will be added.
 * @param {string}     name  - The name of the value attached to the widget.
 * @param {Array}      data  - An array with the following format: [type, options]
 */
function addPaletteSelectorWidget(node, name, data) {
    const type    = data[0];
    const options = data[1] || {};
    const value   = "Pepe";
    const widget = node.addCustomWidget( new SelectorWidgetPalettes(type, name, value, options) );
    return { widget: widget };
}


function addStyleSelectorWidget(node, name, data) {
    const type    = data[0];
    const options = data[1] || {};
    const value   = "Pepe";
    const widget  = node.addCustomWidget( new SelectorWidgetStyles(type, name, value, options) );
    return { widget: widget };
}

/*========================= STYLE SELECTOR WIDGET =========================*/

/**
 * Crea un widget selector de estilos con flechas de navegación y vista previa de miniatura.
 * 
 * @param {LGraphNode} node      - Instancia del nodo de ComfyUI.
 * @param {string}     inputName - Nombre identificador del widget.
 * @param {Array}      inputData - Configuración: [tipo, opciones, app]
 */
function createStyleSelectorWidget(node, inputName, inputData) {
    const type = inputData[0];
    const options = inputData[1] || {};
    
    // Lista de estilos con sus respectivas rutas de imagen
    const stylesList = options.styles || [
        { name: "Phone Photo", thumb: "placehold.co" },
        { name: "Cinematic",   thumb: "placehold.co" },
        { name: "Anime Art",   thumb: "placehold.co" }
    ];

    // Caché local de imágenes para evitar parpadeos y recargas en el draw loop
    const imageCache = {};

    const w = node.addCustomWidget({
        type: type,
        name: inputName,
        value: stylesList[0].name, // Valor por defecto inicial
        serialize: true,
        options: {
            socketless: true,
            height: 32, // Alto explícito solicitado
            ...options
        },

        /**
         * Dibuja los elementos en el Canvas: Miniatura, Flechas y Texto.
         */
        draw: function(ctx, node, widgetWidth, y, _widgetHeight) {
            const widgetHeight = 48;
            const currentStyle = stylesList.find(s => s.name === this.value) || stylesList[0];
            const margin = 6;
            const contentHeight = widgetHeight - (margin * 2);
            
            // 1. Configurar contenedor principal (Cápsula oscura de fondo)
            ctx.save();
            ctx.fillStyle = "#1e1e1e";
            ctx.strokeStyle = "#444444";
            ctx.lineWidth = 1;
            
            const r = contentHeight / 2; // Bordes completamente redondeados
            ctx.beginPath();
            ctx.roundRect(margin, y + margin, widgetWidth - (margin * 2), contentHeight, r);
            ctx.fill();
            ctx.stroke();

            // 2. Renderizar Thumbnail (.jpg) con protección contra imágenes rotas
            const thumbSize = contentHeight - 4;
            const thumbX = margin + 4;
            const thumbY = y + margin + 2;

            if (currentStyle.thumb) {
                if (!imageCache[currentStyle.thumb]) {
                    // Inicializar la imagen si no existe en la caché
                    const img = new Image();
                    img.src = currentStyle.thumb;
                    img.onload = () => node.setDirtyCanvas(true, true);
                    img.onerror = () => {
                        console.warn(`No se pudo cargar el thumbnail: ${currentStyle.thumb}`);
                        node.setDirtyCanvas(true, true);
                    };
                    imageCache[currentStyle.thumb] = img;
                }

                const cachedImg = imageCache[currentStyle.thumb];

                // VERIFICACIÓN CLAVE: Comprobar que esté completa y no esté en estado 'broken'
                if (cachedImg.complete && cachedImg.naturalWidth !== 0) {
                    ctx.save();
                    ctx.beginPath();
                    ctx.roundRect(thumbX, thumbY, thumbSize, thumbSize, 4);
                    ctx.clip();
                    ctx.drawImage(cachedImg, thumbX, thumbY, thumbSize, thumbSize);
                    ctx.restore();
                } else {
                    // Vista previa alternativa (Fallback) si la imagen está cargando o rota
                    ctx.save();
                    ctx.fillStyle = "#333333";
                    ctx.beginPath();
                    ctx.roundRect(thumbX, thumbY, thumbSize, thumbSize, 4);
                    ctx.fill();
                    
                    // Dibujar un pequeño símbolo de imagen o texto descriptivo
                    ctx.fillStyle = "#666666";
                    ctx.font = "9px sans-serif";
                    ctx.textAlign = "center";
                    ctx.fillText("IMG", thumbX + (thumbSize / 2), thumbY + (thumbSize / 2) + 3);
                    ctx.restore();
                }
            }

            // 3. Dibujar Flecha Izquierda (◀)
            ctx.fillStyle = "#aaaaaa";
            ctx.font = "12px sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            
            const leftArrowX = thumbX + thumbSize + 15;
            const centerY = y + (widgetHeight / 2);
            ctx.fillText("◀", leftArrowX, centerY);

            // 4. Dibujar Flecha Derecha (▶)
            const rightArrowX = widgetWidth - margin - 15;
            ctx.fillText("▶", rightArrowX, centerY);

            // 5. Dibujar Texto del Estilo (Centrado entre ambas flechas)
            ctx.fillStyle = "#ffffff";
            ctx.font = "11px monospace";
            
            const textLeftBoundary = leftArrowX + 10;
            const textRightBoundary = rightArrowX - 10;
            const textWidthMax = textRightBoundary - textLeftBoundary;
            const textCenterX = textLeftBoundary + (textWidthMax / 2);

            // Recortar texto si excede el espacio asignado
            let displayText = `"${currentStyle.name}"`;
            if (ctx.measureText(displayText).width > textWidthMax) {
                displayText = currentStyle.name.substring(0, 10) + "...";
            }
            ctx.fillText(displayText, textCenterX, centerY);

            ctx.restore();
        },

        /**
         * Detecta clics sobre las zonas de las flechas.
         */
        mouse: function(event, pos, node) {
            if (event.type !== "mousedown") return false;

            const x = pos[0];
            const currentIndex = stylesList.findIndex(s => s.name === this.value);
            const margin = 6;
            const thumbSize = (this.options.height || 32) - (margin * 2) - 4;

            // Calcular posiciones X exactas de colisión para las flechas
            const leftArrowX = margin + 4 + thumbSize + 15;
            const rightArrowX = this.width - margin - 15;
            const tolerance = 15; // Radio de clic de la flecha

            // Clic en Flecha Izquierda
            if (x >= leftArrowX - tolerance && x <= leftArrowX + tolerance) {
                let nextIndex = currentIndex - 1;
                if (nextIndex < 0) nextIndex = stylesList.length - 1;
                this.value = stylesList[nextIndex].name;
                node.setDirtyCanvas(true, true);
                return true;
            }

            // Clic en Flecha Derecha
            if (x >= rightArrowX - tolerance && x <= rightArrowX + tolerance) {
                let nextIndex = currentIndex + 1;
                if (nextIndex >= stylesList.length) nextIndex = 0;
                this.value = stylesList[nextIndex].name;
                node.setDirtyCanvas(true, true);
                return true;
            }

            return false;
        },

        computeSize: function(widgetWidth) {
            return [widgetWidth, 48]; //this.options.height || 32];
        }
    });

    return { widget: w };
}




/*=========================== SEPARATOR WIDGET ============================*/

/**
 * Creates a configurable socketless widget used as visual separator in the Node Graph UI.
 *
 * The widget supports different visual modes: solid line, dotted line, bold line,
 * or just spacing. This widget does not create input/output ports (it is socketless).
 * 
 * @param {LGraphNode} node      - The node instance where the widget is being created
 * @param {string}     inputName - Unique identifier for the widget (not used for value serialization)
 * @param {Array}      inputData - Configuration array where:
 *                                  - [0] = Type name
 *                                  - [1] = Configuration object with these optional properties:
 *                                      - mode: "spacer" | "divider" | "dotted" | "bold"
 *                                      - color: string (CSS color)
 *                                      - height: number
 *                                      - thickness: number
 * @param {object} _app - The ComfyApp instance (not used in this implementation)
 * @returns {{ widget: object }}
 *     Object containing the created widget instance with:
 */
function createSeparatorWidget(node, inputName, inputData, _app) {

    const type    = inputData[0];
    const options = inputData[1] || {};

    const w = node.addCustomWidget({
        type     : type,
        name     : inputName,
        serialize: true,
        options  : {
            socketless: true,
            ...options
        },

        /**
         * Handles the visual rendering of the separator based on the selected mode.
         * 
         * @param {CanvasRenderingContext2D} ctx - The canvas 2D rendering context.
         * @param {Object} node          - The parent node instance.
         * @param {number} widgetWidth   - The current width of the widget.
         * @param {number} y             - The vertical offset.
         * @param {number} _widgetHeight - The calculated height of the widget.
         */
        draw: function(ctx, node, widgetWidth, y, _widgetHeight) {
            const mode      = this?.options?.mode   || "spacer";
            const color     = this?.options?.color  || LiteGraph.NODE_DEFAULT_BOXCOLOR; //WIDGET_BGCOLOR; //WIDGET_OUTLINE_COLOR;
            const height    = this?.options?.height || DEFAULT_WIDGET_HEIGHT;
            const thickness = this?.options?.thickness;

            // the "spacer" mode renders nothing, providing only vertical padding
            if( mode === "spacer") { return; }

            // center the separator vertically
            const left    = Math.trunc(10);
            const right   = Math.trunc(widgetWidth - 10);
            const centerY = Math.trunc(y + height/2 + 0.5);

            // draw the separator
            ctx.save();
            ctx.strokeStyle = color;
            ctx.beginPath();
            switch( mode )
            {
                // standard thin horizontal line
                case "divider":
                default:
                    ctx.lineWidth = thickness || 1;
                    ctx.setLineDash([]);
                    break;

                // dashed line for visual grouping
                case "dotted":
                    ctx.lineWidth = thickness || 2;
                    ctx.setLineDash([2, 2]);
                    break;

                // thick line for strong section separation
                case "bold":
                    ctx.lineWidth = thickness || 6;
                    ctx.setLineDash([]);
                    break;
            }
            ctx.moveTo(left, centerY);
            ctx.lineTo(right, centerY);
            ctx.stroke();
            ctx.restore();
        },

        computeSize: function(widgetWidth) {
            const widgetHeight = this?.options?.height || 20;
            return [widgetWidth, widgetHeight];
        },

    });

    w.serializeValue = () => null;
    return { widget: w };
}


//#=========================================================================#
//#////////////////////////// REGISTER EXTENSION ///////////////////////////#
//#=========================================================================#

app.registerExtension({
    name: "ZImagePowerNodes.CustomWidgets",

    /** Called when the extension is loaded. */
    init() {
        if (!ENABLED) return;
        console.log(`[${this.name}]: Extension loaded.`);
    },

    /** Called to register custom widgets. */
    getCustomWidgets() {
        if (!ENABLED) return {};
        return {
            "ZIPN_SEPARATOR"       : createSeparatorWidget,
            "ZIPN_STYLE_SELECTOR"  : addStyleSelectorWidget,
            "ZIPN_PALETTE_SELECTOR": addPaletteSelectorWidget,

            // [DEPRECATED]
            "ZIPN_STYLE_GALLERY_BUTTON": addStyleGalleryButton,
        };
    },

});
