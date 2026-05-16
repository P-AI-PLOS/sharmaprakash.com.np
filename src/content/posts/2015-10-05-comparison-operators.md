---
title: Comparison Operators
category: ['code-quality']
cover: "/images/blog/generated/covers/2015-10-05-comparison-operators.png"
thumb: "/images/blog/generated/thumbs/2015-10-05-comparison-operators.png"
categories: javascript
directory:  javascript
excerpt: comparison operators in js
tags:
comments: true
share: true
published: true
date: "2015-10-05T23:09:32+05:45"
toc: true
use_featured_image: true
---
## strict vs type–converting comparisons

| Strict comparision | Type converting comparison |
|:------------- |:------------------------------------- |
| 1. A strict comparison (e.g., ===) is only true if the operands are of the same type.	| 1. abstract comparison (e.g. ==) converts the operands to the same Type before making the comparison.	|

## More features of comparisons:

1. Two strings are strictly equal when they have the same sequence of characters, same length, and same characters in corresponding positions.
2. Two numbers are strictly equal when they are numerically equal (have the same number value). NaN is not equal to anything, including NaN. Positive and negative zeros are equal to one another.
3. Two Boolean operands are strictly equal if both are true or both are false.
4. Two distinct objects are never equal for either strict or abstract comparisons.
5. An expression comparing Objects is only true if the operands reference the same Object.
6. Null and Undefined Types are strictly equal to themselves and abstractly equal to each other.

## Equality operators

### Equality (==)

The equality operator converts the operands if they are **not of the same type**, then applies strict comparison. If **both operands are objects**, then JavaScript compares internal references which are equal when operands refer to the same object in memory.

```javascript
//syntax
x == y
```

```javascript
//examples
1   ==  1        // true
"1"  ==  1        // true
1   == '1'       // true
0   == false     // true
0   == null      // false

0   == undefined // false
null  == undefined // true
```

### Inequality (!=)

The inequality operator returns true if the operands are not equal. If the two operands are **not of the same type**, JavaScript attempts to convert the operands to an appropriate type for the comparison. If **both operands are objects**, then JavaScript compares internal references which are not equal when operands refer to different objects in memory.

```javascript
//syntax
x != y
```

```javascript
//examples
1 !=   2     // true
1 !=  "1"    // false
1 !=  '1'    // false
1 !=  true   // false
0 !=  false  // false
```

### Identity / strict equality (===)

The identity operator returns true if the operands are strictly equal (see above) **with no type conversion**.

```javascript
//syntax
x === y
```

```javascript
//examples
3 === 3   // true
3 === '3' // false
```

### Non-identity / strict inequality (!==)

The non-identity operator returns true if the operands **are not equal and/or not of the same type**.

```javascript
//syntax
x !== y
```

```javascript
//examples
3 !== '3' // true
4 !== 3   // true
```

## Relational operators

### Greater than operator (>)

The greater than operator returns true if the left operand is greater than the right operand.

```javascript
//syntax
x > y
```

```javascript
//examples
4 > 3 // true
```

### Greater than or equal operator (>=)

The greater than or equal operator returns true if the left operand is greater than or equal to the right operand.

```javascript
//syntax
x >= y
```

```javascript
//examples
4 >= 3 // true
3 >= 3 // true
```


### Less than operator (<)

The less than operator returns true if the left operand is less than the right operand.

```javascript
//syntax
x < y
```

```javascript
//examples
3 < 4 // true
```


### Less than or equal operator (<=)

The less than or equal operator returns true if the left operand is less than or equal to the right operand.

```javascript
//syntax
 x <= y
```

```javascript
//examples
3 <= 4 // true
```

When Type conversion is involved in the comparison (i.e., non–strict comparison), JavaScript converts Type String, Number, Boolean, or Object operands as follows:

1. When comparing a number and a string, the string is converted to a number value. JavaScript attempts to convert the string numeric literal to a Number type value. First, a mathematical value is derived from the string numeric literal. Next, this value is rounded to nearest Number type value.
2. If one of the operands is Boolean, the Boolean operand is converted to 1 if it is true and +0 if it is false.
3. If an object is compared with a number or string, JavaScript attempts to return the default value for the object. Operators attempt to convert the object to a primitive value, a String or Number value, using the valueOf and toString methods of the objects. If this attempt to convert the object fails, a runtime error is generated.

<BlogDetailsNoticeWrapper class="notice block">
Note that an object is converted into a primitive if, and only if, its comparand is a primitive. If both operands are objects, they're compared as objects, and the equality test is true only if both refer the same object.
</BlogDetailsNoticeWrapper>
