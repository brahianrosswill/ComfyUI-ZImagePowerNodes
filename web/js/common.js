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
export { getOutputNodes };

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
