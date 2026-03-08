
export const updateValueByPath = (obj: any, path: (string | number)[], newValue: any): any => {
    if (path.length === 0) return newValue;

    const newObj = Array.isArray(obj) ? [...obj] : { ...obj };
    const key = path[0];

    if (path.length === 1) {
        newObj[key] = newValue;
    } else {
        newObj[key] = updateValueByPath(obj[key], path.slice(1), newValue);
    }

    return newObj;
};
