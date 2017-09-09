import React from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  Text,
  CameraRoll,
  Linking,
} from 'react-native';

export default class App extends React.Component {
  state = {
    imageUri: 'https://vignette3.wikia.nocookie.net/althistory/images/2/2a/128px-Simple_gold_crown.svg-2.png',
  }

  render() {
    return (
      <View style={styles.container}>

        <View
          style={{ margin: 5 }}
          ref={(ref) => this.memeView = ref}>
          <Image
            source={{ uri: this.state.imageUri }}
            style={{ width: 300, height: 300 }}
          />
        </View>

        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity
            style={styles.button}
            onPress={this._onSlack}>
            <Text>toslack!</Text>
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity
            style={styles.button}
            onPress={this._onPick}>
            <Text>pick a pic!</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={this._onTake}>
            <Text>take a pic!</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={this._onSave}>
            <Text>save!</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  _onPick = async () => {
    const {
      cancelled,
      uri,
    } = await Expo.ImagePicker.launchImageLibraryAsync();
    if (!cancelled) {
      this.setState({ imageUri: uri });
    }
  }

  _onTake = async () => {
    const {
      cancelled,
      uri,
    } = await Expo.ImagePicker.launchCameraAsync();
    if (!cancelled) {
      this.setState({ imageUri: uri });
    }
  }

  _onSave = async () => {
    console.log(!!this.memeView);
    const uri = await Expo.takeSnapshotAsync(this.memeView);
    console.log("took snapshot");
    await CameraRoll.saveToCameraRoll(uri);
  }

  _onSlack = async () => {
    this._onSave()

    Linking.canOpenURL("https://slack.com/customize/emoji").then(supported => {
      if (supported) {
        Linking.openURL("https://slack.com/customize/emoji");

      } else {
        console.log("Don't know how to open URI: " + this.props.url);
      }
    });
  }
}

const styles = StyleSheet.create({
  button: {
    padding: 5,
    margin: 5,
    backgroundColor: '#ddd',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
