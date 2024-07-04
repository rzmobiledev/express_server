
export function sum(x: number, y: number) {
    return x + y
}

export function mockSum(x: number, y: number, callback: Function) {
    callback(x + y)
}