import { PixelRatio } from 'react-native';

import { Dimensions } from 'react-native';
const {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT
} = Dimensions.get('window');

const widthBaseScale = SCREEN_WIDTH / 414;
const heightBaseScale = SCREEN_HEIGHT / 896;

function normalize(size: number, based = 'width') {
    const newSize = (based === 'height') ?
        size * heightBaseScale : size * widthBaseScale;
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
}


//for width  pixel
const widthPixel = (size: number) => {
    return normalize(size, 'width');
};
//for height  pixel
const heightPixel = (size: number) => {
    return normalize(size, 'height');
};
//for font  pixel
const fontPixel = (size: number) => {
    return heightPixel(size);
};

export {
    widthPixel,
    heightPixel,
    fontPixel,

};
