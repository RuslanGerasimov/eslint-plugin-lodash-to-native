/**
 * @fileoverview lodash map to Array.map
 * @author Ruslan
 */
"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
    meta: {
        docs: {
            description: "lodash map to Array.map",
            category: "Fill me in",
            recommended: false
        },
        fixable: null,  // or "code" or "whitespace"
        schema: [
            // fill in your schema
        ]
    },

    create: function(context) {

        // variables should be defined here

        //----------------------------------------------------------------------
        // Helpers
        //----------------------------------------------------------------------

        function getParentNodeByType(node, type) {
            if(!node) {
                return null
            }else if(node.type === type) {
                return node;
            } else {
                return getParentNodeByType(node.parent, type);
            }
        }

        function getTheFirstIf(node) {
            const ifStatement = getParentNodeByType(node, 'IfStatement');
            return ifStatement && ifStatement.parent && ifStatement.parent.type === 'IfStatement' ? getTheFirstIf(ifStatement.parent) : ifStatement;
        }
        // any helper functions should go here or else delete this section

        //----------------------------------------------------------------------
        // Public
        //----------------------------------------------------------------------

        return {

            Identifier: function(node) {
                const Source = context.getSourceCode();
                if (node.name === "_" && node.parent.property.name === 'map') {
                    const args = node.parent.parent.arguments;
                    const objectCode = args[0].name;
                    const callback = args[1] ? Source.getText(args[1]) : null;

                    const callExpression = getParentNodeByType(node, 'CallExpression');
                    const wholeBlock = callExpression.parent;
                    const {start: startLodashMap, end: endLodashMap} = wholeBlock;


                    let ifStatement = getTheFirstIf(node);
                    const alterNateNode = ifStatement ? ifStatement.alternate : null;
                    let objectChecked = false;

                    if(ifStatement && alterNateNode) {
                        const {start: alternateNodeStart, end: alternateNodeEnd} = alterNateNode;
                        //Check if _.map is in else branch
                        if(alternateNodeStart < startLodashMap && alternateNodeEnd > endLodashMap) {
                            const testExpression = ifStatement.test;
                            if(testExpression.type === 'CallExpression') {
                                const {object, property} = testExpression.callee;

                                objectChecked = object && object.name === 'Array'
                                    && property && property.name === 'isArray'
                                    && testExpression.arguments[0] && testExpression.arguments[0].name === objectCode;
                            }
                        }
                    }

                    if(!objectChecked) {
                        context.report({
                            node,
                            message: "You probably need to use Array.map method on {{ code }}",
                            data: {
                                code: objectCode
                            },
                            fix: function(fixer) {
                                const fixedText =
                                    `if(Array.isArray(${objectCode})) {
                                        ${objectCode}.map(${callback});
                                    } else {
                                        _.map(${objectCode}, ${callback});
                                    }`;
                                return fixer.replaceText(wholeBlock, fixedText);
                            }
                        });
                    }
                }
            }

        };
    }
};
