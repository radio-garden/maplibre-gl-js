type AnyFunction<TA extends any[] = any[], TR = any> = (
    ...args: TA
) => TR;

/**********************************************************************************************************
 *                                                                                                        *
 *                                                 assert                                                 *
 *                                                                                                        *
 **********************************************************************************************************/

/**
 * Asserts that a condition is truthy and throws an error if it's not.
 * Uses TypeScript assertion signatures to provide type narrowing.
 *
 * @param condition - The condition to assert
 * @param message - Optional error message (defaults to 'assertion error')
 * @throws Throws an Error if the condition is falsy
 * @example
 * assert(user.id, 'User ID is required');
 * assert(items.length > 0, 'Items array cannot be empty');
 *
 * @example
 * // TypeScript type narrowing
 * const value: string | null = getValue();
 * assert(value);
 * // value is now typed as string (not null)
 */
export function assert(
    condition: any,
    message = 'assertion error'
): asserts condition {
    if (!condition) {
        throw new Error(message);
    }
}

/**
 * Asserts that a predicate function returns a truthy value for every item in an array.
 * This is useful for validating business rules or properties on an already-typed array.
 *
 * @template T - The type of items in the array.
 * @param array - The array to check.
 * @param predicate - A function that takes an item and its index and returns a condition to be asserted.
 * @param message - Optional. A static string or a function that returns a custom error message.
 * If it's a function, it receives the failing item and its index.
 * @throws Throws an Error if the predicate returns a falsy value for any item.
 * @example
 * // Basic validation
 * const userAges = [25, 30, 19];
 * assertEvery(userAges, (age) => age >= 18, 'All users must be 18 or older.');
 *
 * @example
 * // Validating non-empty strings
 * const usernames = ['Alice', 'Bob', ''];
 * try {
 *   assertEvery(usernames, (name) => name.length > 0);
 * } catch (e) {
 *   // Throws: Assertion failed for item "" at index 2.
 * }
 *
 * @example
 * // With a dynamic error message
 * const products = [
 *   { name: 'Thing 1', stock: 10 },
 *   { name: 'Thing 2', stock: 0 },
 * ];
 * assertEvery(
 *   products,
 *   (p) => p.stock > 0,
 *   (p) => `Product "${p.name}" is out of stock.`
 * );
 * // Throws: Product "Thing 2" is out of stock.
 */
export function assertEvery<T>(
    array: readonly T[],
    predicate: (item: T, index: number) => any,
    message?: string | ((item: T, index: number) => string)
): void {
    for (let i = 0; i < array.length; i++) {
        const item = array[i];
        if (!predicate(item, i)) {
            throw new Error(
                isFunction(message)
                    ? message(item, i)
                    : (message ??
            `Assertion failed for item "${String(item)}" at index ${i}.`)
            );
        }
    }
}

/**
 * Asserts that a value is not nullish and narrows its type accordingly.
 *
 * @template T - The expected type when the value is not nullish
 * @param val - The value to assert
 * @param message - Optional error message
 * @throws Throws an Error if the value is nullish
 * @example
 * assertNotNullish(user.email, 'Email is required');
 * // user.email is now typed without null/undefined
 *
 * @example
 * const result: string | null = getValue();
 * assertNotNullish(result);
 * // result is now typed as string
 */
export function assertNotNullish<T>(
    val: T | undefined | null | void,
    message = 'Expected value to not be nullish'
): asserts val is T {
    assert(isNotNullish(val), message);
}

/**
 * Asserts that a value is nullish (null, undefined, or void) and narrows its type accordingly.
 * This is useful for validating that optional values are not provided.
 *
 * @template T - The original type of the value
 * @param val - The value to check for nullishness
 * @param message - Optional custom error message
 * @throws Throws an Error if the value is not nullish
 * @example
 * // Validating that boolean cache control directives have no value
 * function parseBoolean(value?: string) {
 *   assertNullish(value); // throws if value exists
 *   return true;
 * }
 *
 * @example
 * // With custom error message
 * assertNullish(optionalParam, 'Parameter should not be provided');
 */
export function assertNullish<T>(
    val: T | undefined | null | void,
    message = 'Expected value to be nullish'
): asserts val is undefined | null | void {
    assert(isNullish(val), message);
}

/**
 * Asserts that a value is not nullish and returns the value with narrowed type.
 * Similar to assertNotNullish but returns the value instead of using assertion signatures.
 *
 * @template T - The expected type when the value is not nullish
 * @param val - The value to assert and return
 * @param message - Optional error message
 * @returns The value, now typed as T
 * @throws Throws an Error if the value is nullish
 * @example
 * const email = assertedNotNullish(user.email, 'Email is required');
 * // email is typed as string (not null/undefined)
 *
 * @example
 * const result = assertedNotNullish(array[0]);
 * // result is the first array element, guaranteed to be not nullish
 */
export function assertedNotNullish<T>(
    val: T | undefined | null | void,
    message = 'Expected value to not be nullish'
): T {
    return guarded(val, isNotNullish, message);
}

/**
 * Asserts that a value is nullish and returns the value with narrowed type.
 * Similar to assertNullish but returns the value instead of using assertion signatures.
 * This is useful when you need to both validate nullishness and use the value in an expression.
 *
 * @template T - The original type of the value
 * @param val - The value to check for nullishness
 * @param message - Optional custom error message
 * @returns The value with type narrowed to undefined | null | void
 * @throws Throws an Error if the value is not nullish
 * @example
 * // Using in expressions with comma operator
 * const result = (assertedNullish(optionalValue), true);
 *
 * @example
 * // Functional validation chain
 * const parseBoolean = (value?: string) => (assertedNullish(value), true);
 */
export function assertedNullish<T>(
    val: T | undefined | null | void,
    message = 'Expected value to be nullish'
): undefined | null | void {
    return guarded(val, isNullish, message);
}

/**
 * Asserts that a value is an Error and narrows its type accordingly.
 * Uses assertion signatures to narrow the type of an existing variable.
 *
 * @param error - The value to assert as an Error
 * @param message - Optional error message
 * @throws Throws an Error if the value is not an Error
 * @example
 * let caught: unknown = getCaughtError();
 * assertError(caught);
 * // caught is now typed as Error
 * console.log(caught.message);
 *
 * @example
 * function handleError(error: unknown) {
 *   assertError(error, 'Expected Error instance');
 *   // error is now typed as Error for the rest of this function
 *   logger.error(error.stack);
 * }
 */
export function assertError(
    error: unknown,
    message = 'Expected value to be an Error'
): asserts error is Error {
    assert(isError(error), message);
}

/**
 * Asserts that a value is an Error and returns it with narrowed type.
 * Uses the guard function to ensure type safety.
 *
 * @param error - The value to assert as an Error
 * @param message - Optional error message
 * @returns The value, now typed as Error
 * @throws Throws an Error if the value is not an Error
 * @example
 * try {
 *   somethingThatMightThrow();
 * } catch (caught) {
 *   const error = assertedError(caught);
 *   // error is now typed as Error
 *   console.log(error.message);
 * }
 */
export function assertedError(
    error: unknown,
    message = 'Expected value to be an Error'
): Error {
    return guarded(error, isError, message);
}

/**
 * Asserts that a value is an instance of a specific constructor and narrows its type accordingly.
 * Uses assertion signatures to narrow the type of an existing variable.
 *
 * @template T - The expected instance type
 * @param value - The value to check for instanceof
 * @param Constructor - The constructor function to check against
 * @param message - Optional custom error message
 * @throws Throws an Error if the value is not an instance of the constructor
 * @example
 * // Basic usage with existing variable
 * let data: unknown = getApiResponse();
 * assertInstanceOf(data, Date);
 * // data is now typed as Date
 * console.log(data.getFullYear());
 *
 * @example
 * // Function parameter validation
 * function processError(error: unknown) {
 *   assertInstanceOf(error, NetworkError, 'Expected NetworkError');
 *   // error is now typed as NetworkError for the rest of this function
 *   console.log(error.statusCode);
 * }
 *
 * @example
 * // Conditional narrowing
 * function handleValue(value: unknown) {
 *   if (someCondition) {
 *     assertInstanceOf(value, CustomClass);
 *     // value is now typed as CustomClass in this block
 *     value.customMethod();
 *   }
 * }
 */
export function assertInstanceOf<T>(
    value: unknown,
    Constructor: new (...args: any[]) => T,
    message?: string
): asserts value is T {
    if (!(value instanceof Constructor)) {
        const defaultMessage = `Expected value to be an instance of ${Constructor.name}, but got ${typeof value}`;
        throw new Error(message ?? defaultMessage);
    }
}

/**
 * Asserts that a value is an instance of a specific constructor and returns it with narrowed type.
 * Uses instanceof checking to ensure runtime type safety.
 *
 * @template T - The expected instance type
 * @param value - The value to check for instanceof
 * @param Constructor - The constructor function to check against
 * @param message - Optional custom error message
 * @returns The value, now typed as T
 * @throws Throws an Error if the value is not an instance of the constructor
 * @example
 * // Basic usage with built-in types
 * const date = assertedInstanceOf(unknownValue, Date);
 * // date is now typed as Date
 * console.log(date.getFullYear());
 *
 * @example
 * // With custom classes
 * class NetworkError extends Error {
 *   constructor(message: string, public statusCode: number) {
 *     super(message);
 *   }
 * }
 *
 * try {
 *   await fetchData();
 * } catch (caught) {
 *   const networkError = assertedInstanceOf(caught, NetworkError);
 *   // networkError is now typed as NetworkError
 *   console.log(networkError.statusCode);
 * }
 *
 * @example
 * // With custom error message
 * const user = assertedInstanceOf(
 *   apiResponse,
 *   User,
 *   'API response must be a User instance'
 * );
 *
 * @example
 * // Common use cases
 * const buffer = assertedInstanceOf(data, Buffer, 'Expected Buffer data');
 * const regex = assertedInstanceOf(pattern, RegExp, 'Pattern must be a RegExp');
 * const map = assertedInstanceOf(collection, Map, 'Expected Map collection');
 */
export function assertedInstanceOf<T>(
    value: unknown,
    Constructor: new (...args: any[]) => T,
    message?: string
): T {
    if (!(value instanceof Constructor)) {
        const defaultMessage = `Expected value to be an instance of ${Constructor.name}, but got ${typeof value}`;
        throw new Error(message ?? defaultMessage);
    }
    return value;
}


/**********************************************************************************************************
 *                                                                                                        *
 *                                                  guard                                                 *
 *                                                                                                        *
 **********************************************************************************************************/

/**
 * Validates a value against a type guard and returns it with the narrowed type.
 * This is useful when you need the validated value as a return value.
 *
 * @template T - The expected type after the guard check
 * @param value - The value to check and return
 * @param check - A type guard function that returns true if the value is of type T
 * @param message - Optional custom error message
 * @returns The value, now typed as T
 * @throws Throws an Error if the type guard check fails
 * @example
 * // Basic usage with built-in type guards
 * const str = guarded(unknownValue, isString);
 * // str is now typed as string
 * console.log(str.toUpperCase());
 *
 * @example
 * // With custom error message
 * const email = guarded(
 *   formData.email,
 *   isString,
 *   'Email must be a string'
 * );
 *
 * @example
 * // Custom type guard
 * interface User {
 *   name: string;
 *   age: number;
 * }
 *
 * const isUser = (v: unknown): v is User =>
 *   typeof v === 'object' && v !== null &&
 *   'name' in v && typeof v.name === 'string' &&
 *   'age' in v && typeof v.age === 'number';
 *
 * const user = guarded(apiResponse, isUser, 'Invalid user data from API');
 * // user is now typed as User
 *
 * @example
 * // Common use case: error handling
 * try {
 *   somethingThatMightThrow();
 * } catch (caught) {
 *   const error = guarded(caught, isError, 'Expected an Error object');
 *   logger.error(error.message); // error is typed as Error
 * }
 */
export function guarded<T>(
    value: unknown,
    check: (value: any) => value is T,
    message?: string
): T {
    guard(value, check, message);
    return value;
}

/**
 * Asserts that a value satisfies a type guard using TypeScript's assertion signatures.
 * This is useful when you want to narrow the type of an existing variable in the current scope.
 *
 * @template T - The expected type after the guard check
 * @param value - The value to check
 * @param check - A type guard function that returns true if the value is of type T
 * @param message - Optional custom error message
 * @throws Throws an Error if the type guard check fails
 * @example
 * // Narrowing an existing variable
 * let data: string | number | null = getData();
 * guard(data, isString);
 * // data is now typed as string in this scope
 * console.log(data.toUpperCase());
 *
 * @example
 * // With custom error message
 * let email: unknown = formData.email;
 * guard(email, isString, 'Email field must be a string');
 * // email is now typed as string
 * validateEmail(email);
 *
 * @example
 * // Useful in conditional flows
 * function processValue(value: unknown) {
 *   guard(value, isArray, 'Value must be an array to process');
 *   // value is now typed as unknown[] for the rest of this function
 *   return value.map(item => processItem(item));
 * }
 *
 * @example
 * // Multiple guards in sequence
 * let response: unknown = await fetch('/api/data');
 * guard(response, isPlainObject, 'API response must be an object');
 * // response is now typed as Record<PropertyKey, unknown>
 * guard(response.data, isArray, 'Response data must be an array');
 * // response.data is now typed as unknown[]
 */
export function guard<T>(
    value: unknown,
    check: (value: any) => value is T,
    message = `Type guard check failed for value: ${value}`
): asserts value is T {
    assert(check(value), message);
}

/**
 * Asserts that a value is an array and that every one of its members satisfies a type guard.
 * This narrows the type of the array variable in the current scope.
 *
 * @template T - The expected type of array members after the guard check.
 * @param value - The value to check, which must be an array.
 * @param check - A type guard function to apply to every member of the array.
 * @param message - Optional custom error message. Can be a string or a function that
 * receives the failing item and its index and returns an error message.
 * @throws Throws an Error if the value is not an array or if any member fails the check.
 * @example
 * // Narrowing an existing array variable
 * let data: unknown = [1, 2, 3];
 * guardEvery(data, isNumber);
 * // data is now typed as readonly number[] in this scope
 */
export function guardEvery<T>(
    value: readonly unknown[] | unknown,
    check: (value: any) => value is T,
    message?: string | ((item: unknown, index: number) => string)
): asserts value is readonly T[] {
    // Guard that the input itself is an array.
    guard(
        value,
        isArray,
        typeof message === 'string' ? message : 'Input must be an array.'
    );

    assertEvery(
        value,
        check,
        message ??
      ((item, i) =>
          `Type guard check failed for item at index ${i}: ${String(item)}`)
    );
}

/**
 * Validates that a value is an array and that every one of its members satisfies a type guard,
 * returning the array with the narrowed member type.
 *
 * @template T - The expected type of array members after the guard check.
 * @param value - The value to check, which must be an array.
 * @param check - A type guard function to apply to every member of the array.
 * @param message - Optional custom error message. Can be a string or a function that
 * receives the failing item and its index and returns an error message.
 * @returns The array, now typed as readonly T[].
 * @throws Throws an Error if the value is not an array or if any member fails the check.
 * @example
 * const apiResponse: unknown = [{ id: 1 }, { id: 2 }];
 * const items = guardedEvery(apiResponse, isItemWithId);
 * // items is now typed as readonly { id: number }[]
 */
export function guardedEvery<T>(
    value: readonly unknown[] | unknown,
    check: (value: any) => value is T,
    message?: string | ((item: unknown, index: number) => string)
): readonly T[] {
    guardEvery(value, check, message);
    return value;
}

/**********************************************************************************************************
 *                                                                                                        *
 *                                               Type Utils                                               *
 *                                                                                                        *
 **********************************************************************************************************/

/**
 * Creates a type checking function for primitive types that also matches their Object wrappers.
 *
 * @param name - The type name (e.g., 'String', 'Number', 'Boolean')
 * @returns A type checking function
 * @internal
 */
const getPrimitiveCheck = (() => {
    const {toString} = Object.prototype;

    // From @ditojs/utils
    return (name: string) => {
    // Create checking function for all primitive types (number, string, boolean)
    // that also matches their Object wrappers. We can't check `valueOf()` returns
    // here because `new Date().valueOf()` also returns a number.
        const typeName = name.toLowerCase();
        const toStringName = `[object ${name}]`;
        return function (arg: unknown) {
            const type = typeof arg;
            return (
                type === typeName ||
        (!!arg && type === 'object' && toString.call(arg) === toStringName)
            );
        };
    };
})();

/**
 * Type guard that checks if a value is an array where every element passes the provided type check.
 * This function combines array validation with element type validation in a single operation.
 *
 * @template T - The expected type of array elements after validation
 * @param value - The value to check (can be any type, but only arrays will pass)
 * @param check - A type guard function to validate each array element
 * @returns True if the value is an array and all elements pass the type check, false otherwise
 * @example
 * if (isEvery(data, isString)) {
 *   // data is now typed as readonly string[]
 *   console.log(data.map(s => s.toUpperCase()));
 * }
 *
 * @example
 * const mixedArray: unknown[] = [1, 2, 3];
 * if (isEvery(mixedArray, isNumber)) {
 *   // mixedArray is now typed as readonly number[]
 *   const sum = mixedArray.reduce((a, b) => a + b, 0);
 * }
 *
 * @example
 * // Custom type guard for specific object shape
 * const isUser = (obj: any): obj is { name: string; age: number } =>
 *   isPlainObject(obj) && isString(obj.name) && isNumber(obj.age);
 * if (isEvery(data, isUser)) {
 *   // data is now typed as readonly { name: string; age: number }[]
 *   console.log(data.map(user => user.name));
 * }
 *
 * @example
 * isEvery([1, 2, 3], isNumber); // true
 * isEvery(['a', 'b'], isString); // true
 * isEvery([1, 'mixed'], isNumber); // false
 * isEvery([], isString); // true (empty array)
 * isEvery('not-array', isString); // false
 */
export function isEvery<T>(
    value: readonly unknown[] | unknown,
    check: (value: unknown) => value is T
): value is readonly T[] {
    return isArray(value) && value.every(check);
}

/**
 * Type guard that checks if a value is an array.
 *
 * @template T - The expected type of array elements
 * @param value - The value to check
 * @returns True if the value is an array, false otherwise
 * @example
 * if (isArray(data)) {
 *   // data is now typed as unknown[]
 *   console.log(data.length);
 * }
 *
 * @example
 * const result = isArray<string>(value);
 * // Type guard for string arrays
 */
export function isRecord(
    value: unknown
): value is Record<string | number | symbol, any> {
    return typeof value === 'object' && value !== null;
}

/**
 * Type guard that checks if a value is an array.
 *
 * @template T - The expected type of array elements
 * @param value - The value to check
 * @returns True if the value is an array, false otherwise
 * @example
 * if (isArray(data)) {
 *   // data is now typed as unknown[]
 *   console.log(data.length);
 * }
 *
 * @example
 * const result = isArray<string>(value);
 * // Type guard for string arrays
 */
export function isArray<T>(value: unknown): value is T[] {
    return Array.isArray(value);
}

/**
 * Type guard that checks if a value is a plain object (not an array, function, class instance, etc.).
 * A plain object is created by Object literal syntax or Object constructor.
 *
 * @template Value - The expected type of object values
 * @param value - The value to check
 * @returns True if the value is a plain object, false otherwise
 * @example
 * if (isPlainObject(data)) {
 *   // data is now typed as Record<PropertyKey, unknown>
 *   console.log(Object.keys(data));
 * }
 *
 * @example
 * isPlainObject({}); // true
 * isPlainObject([]); // false
 * isPlainObject(new Date()); // false
 * isPlainObject(null); // false
 *
 * @see https://github.com/sindresorhus/is-plain-obj
 */
export function isPlainObject<Value>(
    value: unknown
): value is Record<PropertyKey, Value> {
    // From: https://github.com/sindresorhus/is-plain-obj/blob/main/index.js
    if (typeof value !== 'object' || value === null) {
        return false;
    }

    const prototype = Object.getPrototypeOf(value);
    return (
        (prototype === null ||
      prototype === Object.prototype ||
      Object.getPrototypeOf(prototype) === null) &&
    !(Symbol.toStringTag in value) &&
    !(Symbol.iterator in value)
    );
}

/**
 * Type guard that checks if a value is a valid URL string.
 * Uses the native URL constructor to validate URL format.
 *
 * @param value - The value to check
 * @returns True if the value is a valid URL string, false otherwise
 * @example
 * if (isUrl(input)) {
 *   // input is now typed as string and is a valid URL
 *   const url = new URL(input);
 * }
 *
 * @example
 * isUrl('https://example.com'); // true
 * isUrl('ftp://files.example.com'); // true
 * isUrl('not-a-url'); // false
 * isUrl(123); // false
 */
export function isUrl(value: unknown): value is string {
    if (!isString(value)) {
        return false;
    }
    try {
        new URL(value);
        return true;
    } catch {
        return false;
    }
}

/**
 * Type guard that checks if a value is an Error object.
 *
 * @param value - The value to check
 * @returns True if the value is an Error object, false otherwise
 * @example
 * if (isError(caught)) {
 *   // caught is now typed as Error
 *   console.log(caught.message);
 * }
 *
 * @example
 * isError(new Error('test')); // true
 * isError(new TypeError('test')); // true
 * isError('error string'); // false
 */
export function isError(value: unknown): value is Error {
    return value instanceof Error;
}

/**
 * Type guard that checks if a value is a number (including Number objects).
 *
 * @param value - The value to check
 * @returns True if the value is a number, false otherwise
 * @example
 * if (isNumber(input)) {
 *   // input is now typed as number
 *   console.log(input.toFixed(2));
 * }
 *
 * @example
 * isNumber(42); // true
 * isNumber(new Number(42)); // true
 * isNumber('42'); // false
 * isNumber(NaN); // true (NaN is of type number)
 */
export function isNumber(value: unknown): value is number {
    return getPrimitiveCheck('Number')(value);
}

/**
 * Type guard that checks if a value is a string (including String objects).
 *
 * @param value - The value to check
 * @returns True if the value is a string, false otherwise
 * @example
 * if (isString(input)) {
 *   // input is now typed as string
 *   console.log(input.toUpperCase());
 * }
 *
 * @example
 * isString('hello'); // true
 * isString(new String('hello')); // true
 * isString(123); // false
 */
export function isString(value: unknown): value is string {
    return getPrimitiveCheck('String')(value);
}

/**
 * Type guard that checks if a value is a function.
 *
 * @param value - The value to check
 * @returns True if the value is a function, false otherwise
 * @example
 * if (isFunction(callback)) {
 *   // callback is now typed as AnyFunction
 *   callback();
 * }
 *
 * @example
 * isFunction(() => {}); // true
 * isFunction(function() {}); // true
 * isFunction(Math.max); // true
 * isFunction('function'); // false
 */
export function isFunction(value: unknown): value is AnyFunction {
    return !!value && typeof value === 'function';
}

/**
 * Type guard that checks if a value is an instance of a specific constructor.
 * This is a helper function for use with the three-argument version of safe().
 *
 * @template T - The constructor type
 * @param value - The value to check
 * @param constructor - The constructor to check against
 * @returns True if the value is an instance of the constructor, false otherwise
 * @example
 * const element = safe(value, isInstanceOf, HTMLElement);
 * const date = safe(value, isInstanceOf, Date);
 * const error = safe(value, isInstanceOf, Error);
 */
export function isInstanceOf<T extends new (...args: any[]) => any>(
    value: unknown,
    constructor: T
): value is InstanceType<T> {
    return value instanceof constructor;
}

/**
 * Type guard that checks if a value is a boolean.
 * Only returns true for actual boolean values (true or false), not truthy/falsy values.
 *
 * @param value - The value to check
 * @returns True if the value is a boolean, false otherwise
 * @example
 * if (isBoolean(input)) {
 *   // input is now typed as boolean
 *   console.log(input ? 'yes' : 'no');
 * }
 *
 * @example
 * isBoolean(true); // true
 * isBoolean(false); // true
 * isBoolean(1); // false
 * isBoolean(0); // false
 * isBoolean('true'); // false
 */
export function isBoolean(value: unknown): value is boolean {
    return value === true || value === false;
}

/**
 * Type guard that checks if a value is nullish (null, undefined, or void).
 *
 * @template T - The original type that might be nullish
 * @param val - The value to check
 * @returns True if the value is nullish, false otherwise
 * @example
 * if (isNullish(user.avatar)) {
 *   // user.avatar is null, undefined, or void
 *   setDefaultAvatar();
 * }
 *
 * @example
 * isNullish(null); // true
 * isNullish(undefined); // true
 * isNullish(0); // false
 * isNullish(false); // false
 * isNullish(''); // false
 */
export function isNullish<T>(
    val: T | undefined | null | void
): val is undefined | null | void {
    return val === undefined || val === null;
}

/**
 * Type guard that checks if a value is not nullish (not null, undefined, or void).
 *
 * @template T - The expected type when the value is not nullish
 * @param val - The value to check
 * @returns True if the value is not nullish, false otherwise
 * @example
 * if (isNotNullish(user.email)) {
 *   // user.email is now typed without null/undefined
 *   console.log(user.email.toLowerCase());
 * }
 *
 * @example
 * isNotNullish('hello'); // true
 * isNotNullish(0); // true
 * isNotNullish(false); // true
 * isNotNullish(null); // false
 * isNotNullish(undefined); // false
 */
export function isNotNullish<T>(val: T | undefined | null | void): val is T {
    return !isNullish(val);
}

type Falsy = false | 0 | '' | null | undefined;

export type Nullish = null | undefined | void;

/**
 * Type guard that checks if a value is truthy (not falsy).
 * Falsy values are: false, 0, '', null, undefined.
 *
 * @template T - The expected type when the value is truthy
 * @param val - The value to check
 * @returns True if the value is truthy, false otherwise
 * @example
 * if (isTruthy(user.name)) {
 *   // user.name is now typed without falsy values
 *   console.log(user.name.length);
 * }
 *
 * @example
 * isTruthy('hello'); // true
 * isTruthy(1); // true
 * isTruthy([]); // true
 * isTruthy(0); // false
 * isTruthy(''); // false
 * isTruthy(null); // false
 */
export function isTruthy<T>(val: T | Falsy): val is T {
    return !!val;
}

/**
 * Type guard that checks if a value is falsy.
 * Falsy values are: false, 0, '', null, undefined.
 *
 * @template T - The original type that might be falsy
 * @param val - The value to check
 * @returns True if the value is falsy, false otherwise
 * @example
 * if (isFalsy(response)) {
 *   // response is now typed as Falsy
 *   console.log('No response received');
 * }
 *
 * @example
 * isFalsy(false); // true
 * isFalsy(0); // true
 * isFalsy(''); // true
 * isFalsy(null); // true
 * isFalsy(undefined); // true
 * isFalsy('hello'); // false
 * isFalsy(1); // false
 */
export function isFalsy<T>(val: T | Falsy): val is Falsy {
    return !val;
}
