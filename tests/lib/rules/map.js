/**
 * @fileoverview lodash map to Array.map
 * @author Ruslan
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require("../../../lib/rules/map"),

    RuleTester = require("eslint").RuleTester;


//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var ruleTester = new RuleTester();
ruleTester.run("map", rule, {

    valid: [
        `var a = Array.isArray(a) ? a.map(function(i) {
            return i + 2;
        }) : _.map(a, function(i) {
            return i + 2;
        });`,
        `Array.isArray(collection) ? collection.map(function(item) {
                return item + 22;
            }) : _.map(collection, function(item) {
                return item + 22;
            });`,
       `test.map(function(item) { return item + 22; })`,
        `if(Array.isArray(collection)) {
            collection.map(function(item) {
                return item + 22;
            })
        } else {
            _.map(collection, function(item) {
                return item + 22;
            });
        }`,
        `if(Array.isArray(collection)){ 
            collection.map(function(item) {
                return item + 22; 
            })
        } else if (true){
            _.map(collection, function(item) { 
                return item + 22; 
            })
        }`,
        `if(Array.isArray(collection)){
            collection.map(function(item) { 
                return item + 22; 
            })
        } else {
            _.map(collection, function(item) { 
                return item + 22; 
            })
        }`,

        `if(Array.isArray(collection)){
            collection.map(function(item) { 
                return item + 22; })
        } else if(false) {
            _.map(collection, function(item) { 
                   return item + 22; 
            })
        } else if(true) {
            _.map(collection, function(item) { 
                return item + 22; 
            })
        }`,
    ],

    invalid: [
        {
            code: `_.map(c1, function (item) { item + 22; })`,
            errors: [{
                message: "You probably need to use Array.map method on c1"
            }]
        },
        {
            code:
                `function test() {
                    if(false) {
                        return collection.map(function(item) {
                            return item + 2;
                        })
                    } else {
                        return _.map(collection, function(item) {
                            return item + 2;
                        })
                    }
                }`,
            errors: [{
                message: "You probably need to use Array.map method on collection"
            }]
        },
        {
            code:
                `if(!Array.isArray(collection)){
                    collection.map(function(item) { 
                        return item + 22; })
                } else if(false) {
                    _.map(collection, function(item) { 
                           return item + 22; 
                    })
                } else if(true) {
                    _.map(collection, function(item) { 
                        return item + 22; 
                    })
                }`,
            errors: [
                { message: "You probably need to use Array.map method on collection" },
                { message: "You probably need to use Array.map method on collection" }
            ]
        }
    ]
});
