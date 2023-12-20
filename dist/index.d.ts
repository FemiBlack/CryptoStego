type Level = 0 | 1 | 2 | 3 | 4 | 5;
export declare function writeMsgToCanvas(canvasid: string, msg: string, pass: string, mode?: Level): unknown;
export declare function readMsgFromCanvas(canvasid: string, pass: string, mode?: Level): unknown;
export declare function loadIMGtoCanvas(inputid: string, canvasid: string, callback: Function, maxsize: number): "ERROR PROCESSING IMAGE!" | undefined;
export {};
