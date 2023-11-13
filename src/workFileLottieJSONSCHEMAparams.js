//Data to be collected from Lottie
var data = {
    fr: 'framerate',
    ip: 'inPoint',// frame number of the first frame of the lottie animation
    op: 'outPoint',// frame number of the last frame of the lottie animation
    w: 'width',
    h: 'height',
    nm: 'name',
    mn: 'matchName', //match name of the item used internally by AE
    ddd: 0, //boolean to indicate if the animation is 3D or not
    fonts: {
        fFamily: 'fontFamily',
        fWeight: 'fontWeight',
        fStyle: 'fontStyle', //bold, italic, etc
        fName: 'fontName',   
    },
    assets: [
            {
                id: 'id', //Unique identifier used by layers when referencing this asset
                nm: 'name', //Name of the asset
                p: 'datapath', //path to the asset or to binary encoded data
                u: 'path', // Path to the directory containing a file
                e: 0, //boolean to indicate if the asset is embedded or not
                w: 'width', //width
                h: 'height' //height}
            },
    ],
    layers: [
        {
            ddd: 0, //boolean to indicate if the layer is 3D or not
            ind: 'index',
            ty: '0', //0:'Precomp', 1:'Solid', 2:'Image', 3:'Null', 4:'Shape', etc
            nm: 'name',//Name of the layer
            ip: 'inPoint', // frame number of the first frame of the layer
            op: 'outPoint', // frame number of the last frame of the layer
            st: 'Start time', // a numbe rindicating the start time of the layer in seconds
            hd: 0, //boolean to indicate if the layer is hidden or not
            ks: { //transform properties
                o: 'opacity',
                r: 'rotation',
                p: 'position',
                a: 'anchor',
                s: 'scale',
                sk: 'skew',
                sa: 'skewAxis',
            }
        }
    ]

};

if (layers[i].ty == 4 { //shapeLayerr
    shapes: [//array of shapes contained inside a shape layer
        {
            ty: 'shapeType', //string indicating the type of shape rc = rectangle, el = ellipse, sr
            nm: 'name', //Name of the shape
            np: 'numProperties', //Number of properties in the shape
            cix: 'contentIndex', //index of the content
            ix: 'index', //index of the shape
            hd: 0, //boolean to indicate if the shape is hidden or not
            ks: { //transform properties
                o: 'opacity',
                r: 'rotation',
                p: 'position',
                a: 'anchor',
                s: 'scale',
                sk: 'skew',
                sa: 'skewAxis',
        }
    ]

}


shapeType = {
    rc: "Rectangle",
    el: "Ellipse",
    sr: "Polygon / Star",
    sh: "Path",
    fl: "Fill",
    st: "Stroke",
    gf: "Gradient fill",
    gs: "Gradient stroke",
    gr: "Group",
    tr: "Transform",
};


/////////////////////////

// Example of a context-sensitive mapping
const propertyKeyMapping = {
    // Global property keys
    'nm': 'Name', type: string, // Name of the object
    'ty': 'Type', type: integer, //0:'Precomp', 1:'Solid', 2:'Image', 3:'Null', 4:'Shape', etc
    'mn': 'Match Name', type: string, //match name of the item used internally by AE
    'ddd': '3D', type: boolean, //boolean to indicate if the animation is 3D or not 0=not 3D, 1=3D
    'ip': 'inPoint', type: integer, // frame number of the first frame of the layer
    'op': 'outPoint', type: integer, // frame number of the last frame of the layer
    'w': 'width', type: integer,// width in pixels
    'h': 'height', type: integer,// height in pixels
    'fr': 'framerate', type: integer,// framerate in frames per second
    'ind': 'index', type: integer,// index of the layer

    'ks': { // layer transform properties
        'p': 'Position', type: array,//[x,y,z]
        's': 'Scale', type: array,//[x,y,z]
        'r': 'Rotation', type: integer,// in degrees
        'a': 'Anchor Point', type: array,//[x,y,z]
        'o': 'Opacity', type: integer,// 0-100
    },
    //if layer is a shape layer
    'rc': "Rectangle", type:string,// shapeType
    'el': "Ellipse", type:string,// shapeType
    'sr': "Polygon / Star", type:string,//  shapeType  
    'sh': "Path",type:string,
    'fl': "Fill",type:string,
    'st': "Stroke",type:string,
    'gf': "Gradient fill",type:string,
    'gs': "Gradient stroke",type:string,
    'gr': "Group",type:string,
    'tr': {  // shape transform properties
        'p': 'Position', type: array,//[x,y,z]
        's': 'Scale', type: array,//[x,y,z]
        'r': 'Rotation', type: integer,// in degrees
        'a': 'Anchor Point', type: array,//[x,y,z]
        'o': 'Opacity', type: integer,// 0-100'o': 'opacity',
        'sk': 'skew', type: integer, // skew in degrees
        'sa': 'skewAxis', type: integer,// skew axis in degrees
    },

    //if layer is a text layer and parent property is "s"
    "s": { // "s" stands for 'selector'
        "s": 'size', type: integer, // font size
        "f": "Calibre-Bold",type: string, // font family
        "t": "Text",  type: string, // text content, new layer with '\n' for each line
        "ca": 'All Caps', type: boolean, // boolean to indicate if the text is all caps
        "j": 'Justify', type: integer, // 0: left, 1: right, 2: center, 3: justify
        "tr": 'Tracking', type: integer, // tracking   
        "lh": 'Line Height', type: integer, // line height
        "ls": 'Baseline Shift', type: integer, // baseline shift    
        "fc": "Font Color", type: array, //[r,g,b]
        "sc": "Stroke Color", type: array, //[r,g,b]        
    },
    
    
    { 
    
    }