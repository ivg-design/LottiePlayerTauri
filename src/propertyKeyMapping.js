const PropertyKeyMapping = {
    // Global layer properties;
    'nm': { name: 'Name', type: 'string' },
    'mn': { name: 'Match Name', type: 'string' },
    'ddd': { name: '3D Layer', type: 'boolean' },
    'ip': { name: 'In Point', type: 'integer' },
    'op': { name: 'Out Point', type: 'integer' },
    'w': { name: 'Width', type: 'integer' },
    'h': { name: 'Height', type: 'integer' },
    'fr': { name: 'Frame Rate', type: 'integer' },
    'ind': { name: 'Index', type: 'integer' },
    "hd": { name: 'Hidden', type: 'boolean' },
    "st": { name: 'Start Time', type: 'integer' },
    'ks': {
        name: 'Transform', type: 'object', properties: {
            'p': { name: 'Position', type: 'array' },
            's': { name: 'Scale', type: 'array' },
            'r': { name: 'Rotation', type: 'integer' },
            'a': { name: 'Anchor Point', type: 'array' },
            'o': { name: 'Opacity', type: 'integer' },
        },
    },
    'ty': {
        name: 'Type', type: 'integer', properties: {
            0: 'Precomp',
            1: 'Solid',
            2: 'Image',
            3: 'Null',
            4: 'Shape',
            5: 'Text',
            6: 'Audio',
            7: 'Video placeholder',
            8: 'Image sequence',
            9: 'Video',
            10: 'Image placeholder',
            11: 'Guide',
            12: 'Adjustment',
            13: 'Camera',
            14: 'Light',
            15: 'Data',
        }
    },
    "assets": {
        name: 'Assets', type: 'array', properties: {
            "id": { name: 'ID', type: 'string' }, //Unique identifier used by layers when referencing this asset
            "nm": { name: 'Name', type: 'string' }, //Name of the asset
            "p": { name: 'Datapath', type: 'string' }, //path to the asset or to binary encoded data
            "u": { name: 'Path', type: 'string' }, // Path to the directory containing a file
            "e": { name: 'Embeded', type: 'boolean' }, //boolean to indicate if the asset is embedded or not
            "w": { name: 'Width', type: 'integer' }, //width
            "h": { name: 'Height', type: 'integer' }, //height}
            'fr': { name: 'Frame Rate', type: 'integer' },

        },
    },
    'fonts': {
        name: 'Fonts', type: 'object', properties: {
            'list': {
                name: 'Font List', type: 'array', properties: {
                    'ascent': { name: 'Ascent', type: 'number' },
                    'fFamily': { name: 'Font Family', type: 'string' },
                    'fName': { name: 'Font Name', type: 'string' },
                    'fStyle': { name: 'Font Style', type: 'string' },
                    'fPath': { name: 'Font Path', type: 'string' },
                    'fWeight': { name: 'Font Weight', type: 'string' },
                    'origin': { name: 'Font Origin', type: 'integer' },
                    'fClass': { name: 'CSS Class', type: 'string' }
                }
            }
        },
        'chars': {
            name: 'Characters', type: 'array', properties: {
                'ch': { name: 'Character', type: 'string' },
                'fFamily': { name: 'Font Family', type: 'string' },
                'size': { name: 'Font Size', type: 'number' },
                'style': { name: 'Font Style', type: 'string' },
                'w': { name: 'Width', type: 'number' },
                'data': { name: 'Data', type: 'object' } // Further nested properties can be added for 'data' as per the schema
            }
        }
    },
    'markers': {
        name: 'Markers', type: 'array', properties: {
            'cm': { name: 'Comment', type: 'string' },
            'dr': { name: 'Duration', type: 'integer' },
            'tm': { name: 'Time', type: 'integer' },
            'id': { name: 'ID', type: 'string' }
        }
    },
    'precomp': {
        name: 'Precomposition Layer', ty: 0, type: 'object', properties: {
            'ty': { name: 'Type', type: 'integer' },
            'refId': { name: 'Reference Id', type: 'string' },
            'w': { name: 'Width', type: 'integer' },
            'h': { name: 'Height', type: 'integer' },
            'ks': {
                name: 'Transform', type: 'object', properties: {
                    'p': { name: 'Position', type: 'array' },
                    's': { name: 'Scale', type: 'array' },
                    'r': { name: 'Rotation', type: 'integer' },
                    'a': { name: 'Anchor Point', type: 'array' },
                    'o': { name: 'Opacity', type: 'integer' },
                }
            }
        }
    },
    'textLayer': {
        name: 'Text Layer', ty: 5, type: 'object', properties: {
            'd': {
                name: 'Document', type: 'object', properties: {
                    'k': {
                        name: 'Keyframes', type: 'object', properties: {
                            's': {
                                name: "Selector", type: 'object', properties: {
                                    "s": { name: 'Size', type: 'integer' },
                                    "f": { name: 'Font Family', type: 'string' },
                                    "t": { name: 'Text Content', type: 'string' },
                                    "ca": { name: 'All Caps', type: 'boolean' },
                                    "j": { name: 'Justify', type: 'integer' },
                                    "tr": { name: 'Tracking', type: 'integer' },
                                    "lh": { name: 'Line Height', type: 'integer' },
                                    "ls": { name: 'Baseline Shift', type: 'integer' },
                                    "fc": { name: 'Font Color', type: 'array' },
                                    "sc": { name: 'Stroke Color', type: 'array' },
                                }
                            }
                        }
                    }
                },
                'hd': { name: 'Hidden', type: 'boolean' },
                'nm': { name: 'Name', type: 'string' },
                'ind': { name: 'Index', type: 'integer' },
                't': {
                    name: 'Text', type: 'object', properties: {
                    }
                },
                'tr': {
                    name: 'Transform', type: 'object', properties: {
                        'p': { name: 'Position', type: 'array' },
                        's': { name: 'Scale', type: 'array' },
                        'r': { name: 'Rotation', type: 'integer' },
                        'a': { name: 'Anchor Point', type: 'array' },
                        'o': { name: 'Opacity', type: 'integer' },
                        'sk': { name: 'Skew', type: 'integer' },
                        'sa': { name: 'Skew Axis', type: 'integer' }
                    }
                },
                'ks': {
                    name: 'Transform', type: 'object', properties: {
                        'p': { name: 'Position', type: 'array' },
                        's': { name: 'Scale', type: 'array' },
                        'r': { name: 'Rotation', type: 'integer' },
                        'a': { name: 'Anchor Point', type: 'array' },
                        'o': { name: 'Opacity', type: 'integer' },
                    }
                }
            }
        }
    },
    'shapeLayer': {
        name: 'Shape Layer', ty: 4, type: 'object', properties: {
            'rc': { name: 'Rectangle', type: 'string' },
            'el': { name: 'Ellipse', type: 'string' },
            'sr': { name: 'Polygon / Star', type: 'string' },
            'sh': { name: 'Path', type: 'string' },
            'fl': {
                name: 'Fill', type: 'object', properties: {
                    'o': { name: 'Fill Opacity', type: 'integer' },
                    'c': { name: 'Fill Color', type: 'array' }
                }
            },
            'st': {
                name: 'Stroke', type: 'object', properties: {
                    'o': { name: 'Stroke Opacity', type: 'integer' },
                    'w': { name: 'Stroke Width', type: 'integer' },
                    'c': { name: 'Stroke Color', type: 'array' }
                }
            },
            'gf': {
                name: 'Gradient Fill', type: 'object', properties: {
                    'ty': { name: 'Shape Type', type: 'string' },
                    'o': { name: 'Opacity', type: 'integer' },
                    'r': { name: 'Fill Rule', type: 'integer' },
                    'k': { name: 'Colors', type: 'array' },
                    'p': { name: 'Count', type: 'integer' }
                }
            },
            'gs': {
                name: 'Gradient Stroke', type: 'object', properties: {
                    'ty': { name: 'Shape Type', type: 'string' },
                    'o': { name: 'Opacity', type: 'integer' },
                    'r': { name: 'Fill Rule', type: 'integer' },
                    'k': { name: 'Colors', type: 'array' },
                    'p': { name: 'Count', type: 'integer' }
                }
            },
            'gr': { name: 'Group', type: 'string' },
            'it': { name: 'Shapes', type: 'array' },
            'tr': {
                name: 'Transform', type: 'object', properties: {
                    'p': { name: 'Position', type: 'array' },
                    's': { name: 'Scale', type: 'array' },
                    'r': { name: 'Rotation', type: 'integer' },
                    'a': { name: 'Anchor Point', type: 'array' },
                    'o': { name: 'Opacity', type: 'integer' },
                    'sk': { name: 'Skew', type: 'integer' },
                    'sa': { name: 'Skew Axis', type: 'integer' }
                }
            },
            'hd': { name: 'Hidden', type: 'boolean' },
            'nm': { name: 'Name', type: 'string' },
            'ind': { name: 'Index', type: 'integer' },
            'shapes': { name: 'Shapes', type: 'object' },
            'ks': {
                name: 'Transform', type: 'object', properties: {
                    'p': { name: 'Position', type: 'array' },
                    's': { name: 'Scale', type: 'array' },
                    'r': { name: 'Rotation', type: 'integer' },
                    'a': { name: 'Anchor Point', type: 'array' },
                    'o': { name: 'Opacity', type: 'integer' },
                }
            }
        }
    }
}


export default PropertyKeyMapping;