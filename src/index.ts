import { writeMsgToCanvas_base } from "./setimg";
import { readMsgFromCanvas_base } from "./readimg";

type Level = 0 | 1 | 2 | 3 | 4 | 5;
//MAIN
// Parameters optimized according to tests.
export function writeMsgToCanvas(canvasid: string,msg:string,pass:string,mode:Level=0){
    mode= parseInt(mode.toString()) as Level;
    var f = writeMsgToCanvas_base;
    switch (mode) {
        case 1: return f(canvasid, msg, pass, true, 23, 2, [2, 9, 16], true, false);
        case 2: return f(canvasid, msg, pass, true, 17, 3, [1, 8], true, false);
        case 3: return f(canvasid, msg, pass, true, 17, 5, [1, 8], true, false);
        case 4: return f(canvasid, msg, pass, true, 5, 5, [0], true, false);
        case 5: return f(canvasid, msg, pass, true, 5, 6, [0], true, true);

        case 0:
        default: return f(canvasid, msg, pass, false, 1);
    }
}

//Read msg from the image in canvasid.
//Return msg (null -> fail)
export function readMsgFromCanvas(canvasid:string,pass:string,mode:Level=0){
    mode=parseInt(mode.toString()) as Level;
    var f = readMsgFromCanvas_base;
    switch (mode) {
        case 1: return f(canvasid, pass, true, 23, 2, [2, 9, 16], true, false)[1];
        case 2: return f(canvasid, pass, true, 17, 3, [1, 8], true, false)[1];
        case 3: return f(canvasid, pass, true, 17, 5, [1, 8], true, false)[1];
        case 4: return f(canvasid, pass, true, 5, 5, [0], true, false)[1];
        case 5: return f(canvasid, pass, true, 5, 6, [0], true, true)[1];
        case 0:
        default: return f(canvasid, pass, false, 1)[1];
    }
}

//load image from html5 input and execute callback() if successful
export function loadIMGtoCanvas(inputid:string, canvasid:string, callback:Function, maxsize:number) {
    maxsize=(maxsize=== undefined)?0:maxsize;
    var input = document.getElementById(inputid) as HTMLInputElement;
    if (input.files && input.files[0]) {
        var f = input?.files[0];
        var reader = new FileReader();
        reader.onload = function(e) {
            var data = e.target?.result;
            var image = new Image();
            image.onload = function() {
                var w=image.width;
                var h=image.height;
                if(maxsize>0){
                    if(w>maxsize){
                        h=h*(maxsize/w);
                        w=maxsize;
                    }
                    if(h>maxsize){
                        w=w*(maxsize/h);
                        h=maxsize;
                    }
                    w=Math.floor(w);
                    h=Math.floor(h);
                }
                var canvas = document.createElement('canvas');
                canvas.id = canvasid;
                canvas.width = w;
                canvas.height = h;
                canvas.style.display = "none";
                var body = document.getElementsByTagName("body")[0];
                body.appendChild(canvas);
                var context = canvas.getContext('2d');
                context?.drawImage(image, 0, 0,image.width,image.height,0,0,w,h);
                callback();
                document.body.removeChild(canvas);
            };
            image.src = data as string;
        };
        reader.readAsDataURL(f);
    } else {
        alert('NO IMG FILE SELECTED');
        return 'ERROR PROCESSING IMAGE!';
    }
}