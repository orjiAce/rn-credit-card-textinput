import {
    Text,
    TextInputProps,
    StyleProp,
    TextInput as RNTextInput,
    StyleSheet,
    View,
    Image, ViewStyle, TextStyle
} from "react-native";
import React, {FC, useState} from "react";

import {fontPixel, widthPixel} from "./Normalize";
import { numberWithSpace} from "./NumberWithSpaces";
import {checkCreditCard} from "./ValidateCard";


interface InputProps extends TextInputProps {
    inputStyle?: StyleProp<TextStyle>,
    labelStyle?: StyleProp<TextStyle>,
    inputWrapStyle?: StyleProp<ViewStyle>,
    cardInputContainerStyle?: StyleProp<ViewStyle>,
    errorColor: string,
    labelColor: string,
    focusColor: string,
    defaultBorderColor: string,
    placeholder: string;
    error?: string;
    label: string;
    touched?: boolean;
    focus: boolean;
    value?: string;
    updateTextVal: (text: string) => void
}



 const CardNumberInput: FC<InputProps> = ({
                                               labelStyle,
                                               cardInputContainerStyle,
                                               inputWrapStyle,

                                               updateTextVal,
                                               labelColor,
                                               focusColor,
                                               inputStyle,
                                               defaultBorderColor,
                                               label,
                                               placeholder,
                                               error,
                                               touched,
                                               focus,
                                               value,
                                               errorColor,
                                               ...props
                                           }) => {
    const [iconName, setIconName] = useState(require('../assets/cards/credit-card.png'));
    const [cardError, setCardError] = useState(null);




    const checkCard = (cardNum: string) => {
        const {message, success, type} = checkCreditCard(cardNum)
        setCardError(message)
        if (type === null) {
            setIconName(require('../assets/cards/credit-card.png'))
        } else if (type === 'MasterCard') {
            setIconName(require('../assets/cards/mastercard.png'))
        } else if (type === 'AmEx') {
            setIconName(require('../assets/cards/american-express.png'))
        } else if (type === 'Visa') {
            setIconName(require('../assets/cards/visa.png'))
        } else if (type === 'Discover') {
            setIconName(require('../assets/cards/discover.png'))
        } else if (type === 'VisaElectron') {
            setIconName(require('../assets/cards/visa-e.png'))
        } else if (type === 'Maestro') {
            setIconName(require('../assets/cards/maestro.png'))
        } else if (type === 'Solo') {
            setIconName(require('../assets/cards/solo-card.png'))
        } else {
            setIconName(require('../assets/cards/credit-card.png'))
        }
    }

    let validationColor = !touched ? defaultBorderColor : cardError ? '#FF5A5F' : focus ? "blue" : defaultBorderColor

    return (
        <View style={[cardInputContainerStyle, styles.container]}>
            <Text style={[{
                color: labelColor
            }, styles.label, labelStyle]}>
                {label}
            </Text>
            <View style={[{
                borderColor: validationColor,
            }, styles.inputWrap, inputWrapStyle]}>
                <View style={styles.cardIcon}>

                    <Image source={iconName}
                           style={{
                               width: 25,
                               height: 25,
                               resizeMode: 'cover',
                           }}/>
                </View>
                <RNTextInput

                    {...props}
                    onChangeText={(text) => {
                        updateTextVal(numberWithSpace(text))
                        checkCard(text)
                    }}
                    clearButtonMode="while-editing"
                    returnKeyLabel={'Next'}
                    returnKeyType={"done"}
                    keyboardType='number-pad'
                    placeholder={placeholder}
                    style={[styles.input, inputStyle]}/>

            </View>
            <View style={{
                paddingBottom: 20,
                justifyContent: 'flex-start',

            }}>
                {cardError &&
                    <Text style={[styles.errorMessage, {color: errorColor}]}>{cardError}</Text>
                }
            </View>
            <View style={{
                paddingBottom: 20,
                justifyContent: 'flex-start',
            }}>
                {error && touched &&
                    <Text style={[styles.errorMessage, {color: errorColor}]}>{error}</Text>
                }
            </View>
        </View>

    )
}







const styles = StyleSheet.create({
    container: {
        width: '100%',
        justifyContent: 'flex-start'
    },
    cardDateInputContainer: {
        width:widthPixel(120),
        justifyContent: 'flex-start'
    },
    input: {
        alignItems: 'center',
        width: '90%',
        fontSize: fontPixel(16),
        padding: 10,
        height: '100%',
    },
    cardDateInput:{
        alignItems: 'center',
        width: '100%',
        fontSize: fontPixel(16),
        padding: 10,
        height: '100%',
    },
    label: {
        textTransform: 'capitalize',
        marginLeft: 10,
    },
    errorMessage: {
        position: 'absolute',
        right: 10,
        lineHeight: 15,
        fontSize: fontPixel(10),
        textTransform: 'capitalize',
    },
    cardIcon: {
        width: 40,
        alignItems: 'center',
        justifyContent: 'center',
        height: 40,
    },
    inputWrap: {
        height: 60,
        marginTop: 8,
        marginBottom: 5,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-evenly',
        width: '100%',
    }

})


export default CardNumberInput


