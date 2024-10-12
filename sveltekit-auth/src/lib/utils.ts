/* eslint @typescript-eslint/no-explicit-any: 0 */
export function formData2Object(formData: FormData): Record<string, any> {
    const obj: Record<string, any> = {}

    formData.forEach((value, key) => {
        // Check if the key already exists
        if (obj[key]) {
            // If it's already an array, push the value, otherwise create an array
            if (Array.isArray(obj[key])) {
                obj[key].push(value)
            } else {
                obj[key] = [obj[key], value]
            }
        } else {
            obj[key] = value
        }
    })

    return obj
}

/**
 * Convert an object to an encoded form body string
 * @param obj Object containing key-value pairs
 * @returns Encoded form body string
 */
export function obj2encodedFormString(obj: object) {
    const formBody = []
    for (const property in obj) {
        const encodedKey = encodeURIComponent(property)
        const encodedValue = encodeURIComponent(obj[property as keyof typeof obj])
        formBody.push(`${encodedKey}=${encodedValue}`)
    }
    return formBody.join('&')
}

/**
 * Convert an encoded form body string to an object
 * @param encodedString Encoded form body string
 * @returns Object containing key-value pairs
 */
export function encodedFormString2obj(encodedString: string) {
    const params = new URLSearchParams(encodedString)
    const obj: { [key: string]: string } = {}

    for (const [key, value] of params.entries()) {
        obj[decodeURIComponent(key)] = decodeURIComponent(value)
    }

    return obj
}
