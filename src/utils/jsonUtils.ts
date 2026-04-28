
type JsonPathSegment = string | number;

const propertyIdentifierPattern = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

export const formatJsonPath = (path: JsonPathSegment[]): string => {
    if (path.length === 0) return '$';

    return path.reduce<string>((jsonPath, segment) => {
        if (typeof segment === 'number') return `${jsonPath}[${segment}]`;
        if (propertyIdentifierPattern.test(segment)) return `${jsonPath}.${segment}`;
        return `${jsonPath}[${JSON.stringify(segment)}]`;
    }, '$');
};

export const getValueByPath = (obj: any, path: JsonPathSegment[]): any => (
    path.reduce((currentValue, segment) => currentValue?.[segment], obj)
);

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
