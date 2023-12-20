declare class MersenneTwister {
    private N;
    private M;
    private MATRIX_A;
    private UPPER_MASK;
    private LOWER_MASK;
    private mt;
    private mti;
    constructor(seed?: number);
    private init_genrand;
    private init_by_array;
    genrand_int32(): number;
}
export default MersenneTwister;
