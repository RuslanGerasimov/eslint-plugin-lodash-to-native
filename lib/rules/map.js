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
        fixable: "code",  // or "code" or "whitespace"
        schema: [
            // fill in your schema
        ]
    },

    create: function(context) {

        let templateToFix = (objectCode, callback) => {
            return `if(Array.isArray(${objectCode})) {
                ${objectCode}.map(${callback});
            } else {
                _.map(${objectCode}, ${callback});
            }`;
        };

        let declaratorTemplateToFix = (objectCode, callback) => {
            return `Array.isArray(${objectCode}) ? ${objectCode}.map(${callback}) : _.map(${objectCode}, ${callback})`;
        };


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


        function getTheFirstIf(node, type = null) {
            if(!type) {
                const conditionalExpression = getParentNodeByType(node, 'ConditionalExpression');
                const ifStatement = getParentNodeByType(node, 'IfStatement');
                if(conditionalExpression) {
                    return conditionalExpression.parent && conditionalExpression.parent.type === 'ConditionalExpression' ? getTheFirstIf(conditionalExpression.parent, 'ConditionalExpression') : conditionalExpression;
                } else if(ifStatement) {
                    return ifStatement.parent && ifStatement.parent.type === 'IfStatement' ? getTheFirstIf(ifStatement.parent, 'IfStatement') : ifStatement;
                }

                return  conditionalExpression || ifStatement;
            } else {
                const ifStatement = getParentNodeByType(node, type);
                return ifStatement && ifStatement.parent && (ifStatement.parent.type === type) ? getTheFirstIf(ifStatement.parent) : ifStatement;
            }
        }

        // any helper functions should go here or else delete this section

        //----------------------------------------------------------------------
        // Public
        //----------------------------------------------------------------------

        return {

            Identifier: function(node) {
                const Source = context.getSourceCode();
                let template = null;
                //Check only _ if it's a part of MemberExpression
                if (node.name === "_" && node.parent.type === "MemberExpression" && node.parent.property.name === 'map') {
                    const args = node.parent.parent.arguments;
                    const objectCode = args[0] ? args[0].name : null;
                    const callback = args[1] ? Source.getText(args[1]) : null;
                    if(!objectCode && !callback) {
                        return;
                    }

                    //get CallExpression
                    const callExpression = getParentNodeByType(node, 'CallExpression');

                    //CallExpression could be in Deaclarator type or ExpressionStatement like nodes
                    let wholeBlock = null;
                    if(callExpression.parent.type === 'ExpressionStatement' || callExpression.parent.type === 'ReturnStatement') {
                        //Template is regular if-else
                        wholeBlock = callExpression.parent;
                        template = templateToFix;
                    } else {
                        //template is ternary operator
                        wholeBlock = callExpression;
                        template = declaratorTemplateToFix;
                    }

                    const {start: startLodashMap, end: endLodashMap} = wholeBlock;

                    //Check if statement exists in parent node.
                    let ifStatement = getTheFirstIf(node);

                    const alterNateNode = ifStatement ? ifStatement.alternate : null;
                    let objectChecked = false;

                    if(ifStatement && alterNateNode) {
                        const {start: alternateNodeStart, end: alternateNodeEnd} = alterNateNode;

                        //Check if _.map is in else branch
                        if(alternateNodeStart <= startLodashMap && alternateNodeEnd >= endLodashMap) {
                            const testExpression = ifStatement.test;
                            if(testExpression.type === 'CallExpression') {
                                const {object, property} = testExpression.callee;

                                objectChecked = object && object.name === 'Array'
                                    && property && property.name === 'isArray'
                                    && testExpression.arguments[0] && testExpression.arguments[0].name === objectCode;
                            }
                        }
                    }

                    //Check if collection was checked whether it is Array or not. If not we apply the rule
                    if(!objectChecked) {
                        context.report({
                            node: node.parent,
                            message: "You probably need to use Array.map method on {{ code }}",
                            data: {
                                code: objectCode
                            },
                            fix: function(fixer) {
                                const fixedText = template(objectCode, callback);
                                return fixer.replaceText(wholeBlock, fixedText);
                            }
                        });
                    }
                }
            }

        };
    }
};
