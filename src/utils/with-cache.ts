import NodeCache from "@cacheable/node-cache";

const cache = new NodeCache<any>({
  stdTTL: "30m",
});

export function WithCache(key: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cacheKey = key + JSON.stringify(args);

      if (!cache.has(cacheKey)) {
        const result = await originalMethod.apply(this, args);

        cache.set(cacheKey, result);

        return result
      }

      return cache.get(cacheKey);
    };
  }
}
