declare global {
    interface BigInt {
        toJSON?: () => string;
    }
}

(() => {
    const proto = BigInt.prototype as bigint & { toJSON?: () => string };

    if (typeof proto.toJSON !== "function") {
        Object.defineProperty(proto, "toJSON", {
            value: function toJSON(this: bigint) {
                return this.toString();
            },
            configurable: true,
            writable: true,
        });
    }
})();

export { };
