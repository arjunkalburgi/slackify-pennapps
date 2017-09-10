import React from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
  Text,
  CameraRoll,
  Linking,
  ImageEditor, 
} from 'react-native';


export default class App extends React.Component {
  state = {
    imageUri: 'https://www.toornament.com/media/file/572269837784555520/logo_small?v=1500283770',
    slackisavailable: false
  }

  render() {
    return (
      <View style={styles.container}>

        <View
          style={{ margin: 5, width:128, height:128 }}
          ref={(ref) => this.memeView = ref}>
          <Image
            source={{ uri: this.state.imageUri }}
            style={{ flex: 1, resizeMode: 'contain', width:null, height:null }}
          />
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

        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity
            style={styles.button, {backgroundColor: this.state.slackisavailable ? "#ddd" : "#111"}}
            onPress={this.state.slackisavailable ? this._onSlack : null}>
            <Text>to slack!</Text>
          </TouchableOpacity>
        </View>

      </View>
    );
  }

  _onPick = async () => {
    const {
      cancelled,
      uri,
      base64,
    } = await Expo.ImagePicker.launchImageLibraryAsync({
      base64: false,
    });

    // this.setState({ loading: true }); 
    this.upload(cancelled, uri)
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
    console.log("IT'S NOW CAMERA: " + this.state.imageUri)
    // const uri = await Expo.takeSnapshotAsync(this.memeView);
    await CameraRoll.saveToCameraRoll(this.state.imageUri);
  }

  _onSlack = async () => {
    console.log("IT'S NOW SLACK: " + this.state.imageUri)
    this._onSave()
    Linking.canOpenURL("https://slack.com/customize/emoji").then(supported => {
      if (supported) {
        Linking.openURL("https://slack.com/customize/emoji");

      } else {
        console.log("Don't know how to open URI: " + this.props.url);
      }
    });
    this.setState({ slackisavailable: false }); 
  }

  // async crop() {
  //   ImageEditor.cropImage(
  //     this.state.imageUri, 
  //     { offset: { x: 0, y: 0 }, size: { width: 128, height: 128 }}, 
  //     successURI => CameraRoll.saveToCameraRoll(successURI), 
  //     error => console.log(error.message)
  //   )
  // };

  // async scale() {
  //   // request kraked_url from server 
  //   console.log("before retrieve")
  //   // this.upload()

  //   // call server function 
  //   // let uriParts = uri.split('.');
  //   // let fileType = uriParts[uri.length - 1];

  //   // saveToCameraRoll if success 
  //   // this.crop() if fail
  // };

  async upload(cancelled, uri) {
    if (cancelled) {
      return 
    }

    this.setState({
      imageUri: uri,
    });

    let uriParts = uri.split('/');
    let fileName = uriParts[uriParts.length - 1];
    let fileNameBreakDown = fileName.split('.'); 
    let fileType = fileNameBreakDown[fileNameBreakDown.length - 1]; 

    let formData = new FormData();
    formData.append('photo', {
      uri,
      name: fileName,
      type: `image/${fileType}`,
    });

    const key = 'AIzaSyA6wUzO8HUWVhGvuNxhGGhwkOlAXZeXDd8';
    const response = await fetch(`https://storage.googleapis.com/applyingautomatically.appspot.com/expo-uploads/${fileName}?key=${key}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: formData,
    });
    const responseText = await response.text();
    if (responseText) {
      console.log("upload did not work"); 
      Alert("upload did not work"); 
    } else {
      // call API to retrieve URL
      this.shrink(fileName); 
    }
  }; 

  async shrink(fileName) {
    // console.log("fetch from hasura-app"); 
    const response = await fetch("https://slackifyapp.burnished12.hasura-app.io/" + fileName); 
    const responseText = await response.text(); 
    console.log("WHATISRESPONSETEXT?!!?!? " + responseText); 
    console.log("IT'S NOT SAVED: " + this.state.imageUri)
    if (responseText) {
      // we have the url save it.
      console.log("WEHAVETHEURLSAVEIT"); 
      this.setState({ imageUri: responseText }); 
      this.setState({ slackisavailable: true  }); 
      console.log("IT'S NOW SAVED: " + this.state.imageUri)
      // this.setState({ loading: false, imageUri: responseText }); 
    } else {
      console.log("hasura-app, kraken resize, or gcs storage didn't work"); 
      Alert("hasura-app, kraken resize, or gcs storage didn't work"); 
    }
    console.log("IT'S NOW SAVED: " + this.state.imageUri)
  }; 
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
