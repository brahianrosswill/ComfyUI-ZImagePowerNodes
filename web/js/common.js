/**
 * File    : common.js
 * Purpose : Common script file with helper functions.
 * Author  : Martin Rizzo | <martinrizzo@gmail.com>
 * Date    : Jan 31, 2026
 * Repo    : https://github.com/martin-rizzo/ComfyUI-ZImagePowerNodes
 * License : MIT
 *- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 *                        ComfyUI-ZImagePowerNodes
 *       ComfyUI nodes designed specifically for the "Z-Image" model.
 *_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _
*/
export { getOutputNodes, renameWidget }

/**
 * Get all nodes connected to a given node's outputs.
 *
 * @param {Object} node         - The input node from which to retrieve outputs.
 * @param {string} [outputName] - Optional. The name of the output connection to search.
 *                                If not provided, nodes connected to any output will be returned.
 * @returns {Array} An array of nodes connected to the specified output
 */
function getOutputNodes(node, outputName) {
    let outputNodes = [];

    // get the graph safely
    const graph = (node?.graph || app.graph);
    if( !graph ) { return outputNodes; }

    const outputs = node?.outputs || [];
    for( let i=0 ; i<outputs.length ; ++i ) {
        const output = outputs[i];

        // if outputName is provided, compare it with the current name
        if( outputName && outputName !== output?.name ) { continue; }

        const links = output?.links || [];
        for( let j=0 ; j<links.length ; ++j )
        {
            const link       = graph.links[ links[j] || "" ];
            const outputNode = graph.getNodeById( link?.target_id || "" );
            if( outputNode ) {
                outputNodes.push( outputNode )
            }
        }
    }
    return outputNodes;
}


/**
 * Checks if a given widget is a proxy widget.
 *
 * This code is not fully tested but the concept comes from the ComfyUI Frontend:
 *  - https://github.com/Comfy-Org/ComfyUI_frontend/blob/v1.39.4/src/core/graph/subgraph/proxyWidget.ts#L51
 *
 * @param {IBaseWidget} widget - The widget object to check.
 * @returns {boolean} Returns true if the widget has an overlay that is a proxy widget, otherwise false.
 */
function isProxyWidget(widget) {
  return !!(widget?._overlay?.isProxyWidget);
}


/**
 * Renames a widget and its corresponding input.
 *
 * Handles both regular widgets and proxy widgets in subgraphs.
 * This code is not fully tested but it comes from the ComfyUI Frontend:
 *  - https://github.com/Comfy-Org/ComfyUI_frontend/blob/v1.39.4/src/utils/widgetUtil.ts#L16
 *
 * @param {IBaseWidget}    widget    - The widget to rename
 * @param {LGraphNode}     node      - The node containing the widget
 * @param {string}         newLabel  - The new label for the widget (empty string or undefined to clear)
 * @param {SubgraphNode[]} [parents] - Optional array of parent SubgraphNodes (for proxy widgets)
 * @returns {boolean} true if the rename was successful, false otherwise
 */
function renameWidget(widget, node, newLabel, parents)
{
    // for proxy widgets in subgraphs, we need to rename the original interior widget
    if (isProxyWidget(widget) && parents?.length) {
        console.log("##>> is proxy widget in subgraph")
        const subgraph = parents[0].subgraph
        if (!subgraph) {
            console.error('Could not find subgraph for proxy widget')
            return false
        }
        const interiorNode = subgraph.getNodeById(widget._overlay.nodeId)

        if (!interiorNode) {
            console.error('Could not find interior node for proxy widget')
            return false
        }

        const originalWidget = interiorNode.widgets?.find(
            (w) => w.name === widget._overlay.widgetName
        )

        if (!originalWidget) {
            console.error('Could not find original widget for proxy widget')
            return false
        }

        // rename the original widget
        originalWidget.label = newLabel || undefined

        // also rename the corresponding input on the interior node
        const interiorInput = interiorNode.inputs?.find(
            (inp) => inp.widget?.name === widget._overlay.widgetName
        )
        if (interiorInput) {
            interiorInput.label = newLabel || undefined
        }
    }

    // always rename the widget on the current node (either regular widget or proxy widget)
    const input = node.inputs?.find((inp) => inp.widget?.name === widget.name)

    // intentionally mutate the widget object here as it's a reference
    // to the actual widget in the graph
    widget.label = newLabel || undefined
    if (input) { input.label = newLabel || undefined }
    return true
}
