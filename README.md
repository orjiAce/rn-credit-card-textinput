
# rn-credit-card-textinput

A Fully customizable react-native credit card TextInput


# Hi, I'm Orji! 👋


## 🚀 About Me
I'm a full stack developer but I'm more Front-end inclined...
I build awesome react and react-native apps!


## Demo

![Demo](https://video.twimg.com/ext_tw_video/1484521738771783685/pu/vid/320x690/JMn941zui3CljFWo.mp4?tag=12)


## Installation

To deploy this project run

```bash
  npm install rn-credit-card-textinput
   or

   yarn add rn-credit-card-textinput
```


## Features

- Credit card validation
- Supports cards like VISA, Master card, Amex, Discover,Maestro,VisaElectron etc
- Works on Expo and bare react-native projects
- Cross-platform


## Screenshots

![App Screenshot](https://github.com/orjiAce/rn-credit-card-textinput/blob/master/Webp.net-resizeimage.png)

## Props
inherits all React-native TextInput Props
<!-- TABLE_GENERATE_START -->

| Prop       | Type      | Required |
|------------|-----------|----------
| inputStyle | TextStyle | no       |
| labelStyle | TextStyle | no       |
| inputWrapStyle | ViewStyle | no       |
| cardInputContainerStyle | ViewStyle | no       |
| cardInputContainerStyle | ViewStyle | no       |
| errorColor | string    | no       |
| labelColor | string    | no       |
| focusColor | string    | no       |
| defaultBorderColor | string    | no       |
| placeholder | string    | no       |
| error | string    | no       |
| touched | boolean   | no       |
| label | string    | no       |
| value | string    | no       |
| updateTextVal | func      | yes      |
| updateCardDateText | func      | yes      |

<!-- TABLE_GENERATE_END -->
## Usage/Examples

```javascript

import {useState} from "react";
import {KeyboardAvoidingView, Platform, StyleSheet, View} from 'react-native';
import {CardNumberTextInput, CardDateTextInput} from "../src/index";


export default function App() {
    const [cardValue, setCardValue] = useState('');
    const [focusCardNum, setFocusCardNum] = useState<boolean>(false);

    const [cardDateValue, setCardDateValue] = useState('');
    const [focusCardDateNum, setFocusCardDateNum] = useState<boolean>(false);


    const updateText = (cardNum: string) => {
        setCardValue(cardNum)
    }
    const updateCardDate = (cardNum: string) => {
        setCardDateValue(cardNum)
    }


    return (
        <View style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{
                width: '90%',
            }}>
                <CardNumberTextInput
                    autoFocus={true}
                    focus={focusCardNum}
                    onFocus={() => setFocusCardNum(true)}
                    onBlur={(e) => {
                        setFocusCardNum(false);
                    }}
                    label="Card number"
                    errorColor={"red"}
                    defaultBorderColor={"#ddd"}
                    inputWrapStyle={{
                        width:'100%',
                        height:60
                    }}
                    inputStyle={{
                        fontFamily: 'GT-medium',
                        color: '#333'
                    }}
                    defaultValue={cardValue}
                    focusColor={"blue"}
                    placeholder={"Credit card"}
                    updateTextVal={(text) => {
                        updateText(text)
                    }}/>

                <CardDateTextInput
                    errorColor={"red"}
                    labelColor={"#ddd"}
                    focusColor={"#1c32a0"}
                    defaultBorderColor={"#ddd"}
                    placeholder={"MM/YY"}
                    label={"Expiry date"}
                    focus={focusCardDateNum}
                    updateCardDateText={(t) => {
                        updateCardDate(t)
                    }}
                    onFocus={() => setFocusCardDateNum(true)}
                    labelStyle={{
                        color: '#333',
                        fontWeight: '400'
                    }}
                    inputWrapStyle={{
                        borderRadius: 10,
                        borderWidth: 1,

                    }}
                    placeholderTextColor={"#ccc"}
                    value={cardDateValue}
                    defaultValue={cardDateValue}
                    inputStyle={{
                        color: '#333',
                        fontWeight: 'bold',
                    }}/>


            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
});


```

