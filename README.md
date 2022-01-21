
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
- Very light weight (29kb)
- Cross platform


## Screenshots

![App Screenshot](https://github.com/orjiAce/rn-credit-card-textinput/blob/master/Simulator%20Screen%20Shot%20-%20iPhone%2012%20-%202022-01-21%20at%2019.24.53.png)


## Usage/Examples

```javascript

import {KeyboardAvoidingView, Platform, StyleSheet, View} from 'react-native';
import {CardNumberTextInput, CardDateTextInput} from "../src/index";
import {useState} from "react";

export default function App() {
    const [cardValue, setCardValue] = useState('');
    const [focusCardNum, setFocusCardNum] = useState<boolean>(false);

    const [cardDateValue, setCardDateValue] = useState('');
    const [focusCardDateNum, setFocusCardDateNum] = useState<boolean>(false);


    const updateText = (cardNum:string) => {
        setCardValue(cardNum)
    }
   const updateCardDate = (cardNum:string) => {
        setCardDateValue(cardNum)
    }
    

    return (
        <View style={styles.container}>
            <KeyboardAvoidingView    behavior={Platform.OS === "ios" ? "padding" : "height"} style={{
                width: '90%',
            }}>
                <CardNumberTextInput errorColor={"red"}
                                 labelColor={"#ddd"}
                                 focusColor={"#1c32a0"}
                                 defaultBorderColor={"#ddd"}
                                 placeholder={"Card number"}
                                 label={"Card Number"}
                                 focus={focusCardNum}
                                 touched={true}
                                 updateTextVal={(t) => {
                                     updateText(t)
                                 }}

                                 onFocus={() => setFocusCardNum(true)}
                                 labelStyle={{
                                     color: '#333',
                                     fontWeight: '400'
                                 }}
                                 inputWrapStyle={{
                                     borderRadius: 10,
                                     borderWidth: 1,

                                 }}
                                 placeholderTextColor={"#ccc"}
                                 value={cardValue}
                                 defaultValue={cardValue}
                                 inputStyle={{
                                     color: '#333',
                                     fontWeight: 'bold',
                                 }} />

                <CardDateTextInput errorColor={"red"}
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
                                 }} />





            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width:'100%',
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
});

```

