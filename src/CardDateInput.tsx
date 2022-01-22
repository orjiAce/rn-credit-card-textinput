import {
    Text,
    TextInputProps,
    StyleProp,
    TextInput as RNTextInput,
    StyleSheet,
    View, ViewStyle, TextStyle
} from "react-native";
import React, {FC, useState} from "react";

import {fontPixel, widthPixel} from "./Normalize";
import { formatCardDateString} from "./NumberWithSpaces";


interface cardDateProps extends TextInputProps {
    inputStyle?: StyleProp<TextStyle>,
    labelStyle?: StyleProp<TextStyle>,
    inputWrapStyle?: StyleProp<ViewStyle>,
    cardInputContainerStyle?: StyleProp<ViewStyle>,
    errorColor?: string,
    labelColor?: string,
    focusColor?: string,
    defaultBorderColor?: string,
    placeholder?: string;
    error?: string;
    label?: string;
    touched?: boolean;
    focus?: boolean;
    value?: string;
    updateCardDateText: (text: string) => void
}



 const CardDateInput: FC<cardDateProps> = ({error,
                                                     labelStyle,
                                                     cardInputContainerStyle,
                                                     inputWrapStyle,
                                                     updateCardDateText,
                                                     labelColor,
                                                     focusColor,
                                                     inputStyle,
                                                     defaultBorderColor,
                                                     label,
                                                     placeholder,
                                                     touched,
                                                     focus,
                                                     value,
                                                     errorColor,
                                                     ...props
                                                 }) =>{


    let validationColor = !touched ? defaultBorderColor : error ? '#FF5A5F' : focus ? "blue" : defaultBorderColor

    return(
        <View style={[cardInputContainerStyle, styles.cardDateInputContainer]}>
            <Text style={[{
                color: labelColor
            }, styles.label, labelStyle]}>
                {label}
            </Text>
            <View style={[{
                borderColor: validationColor,
            }, styles.inputWrap, inputWrapStyle]}>

                <RNTextInput

                    {...props}
                    maxLength={5}
                    onChangeText={(text) => {
                        updateCardDateText(formatCardDateString(text))
                    }}
                    clearButtonMode="while-editing"
                    returnKeyLabel={'Next'}
                    returnKeyType={"done"}
                    keyboardType='number-pad'
                    placeholder={placeholder}
                    style={[styles.cardDateInput, inputStyle]}/>

            </View>
            <View style={{
                paddingBottom: 20,
                justifyContent: 'flex-start',

            }}>
                {error &&
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

export default CardDateInput
