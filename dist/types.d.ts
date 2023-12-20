type Enumerate<N extends number, Acc extends number[] = []> = Acc["length"] extends N ? Acc[number] : Enumerate<N, [...Acc, Acc["length"]]>;
type Range<F extends number, T extends number> = Exclude<Enumerate<T>, Enumerate<F>>;
export type LOC = Range<0, 64>;
export {};
