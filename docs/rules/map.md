# lodash map to Array.map (map)

Задание ШРИ 2020 (Тулинг)


## Rule Details

This rule aims to user native `Array.map` method instead of lodash `map` method.

Examples of **incorrect** code for this rule:

```js

return _.map(collection, function(item) {
    return item;
});

```


```js

const a = _.map(collection, function(item) {
    return item;
});

```

Examples of **correct** code for this rule:

```js

if(Array.isArray(collection)) {
    return collection.map(function(item) {
        return item;
    });
} else {
    return _.map(collection, function(item) {
        return item;
    });
}

```

```js

const a = Array.isArray(collection) ? collection.map(function(item) {
        return item;
    }) : _.map(collection, function(item) {
        return item;
    });   

```