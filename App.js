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

        <View style={{ flexDirection: 'row' }, {display: this.state.slackisavailable ? "flex" : "none"}}>
          <TouchableOpacity
          style={styles.button}
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

    this.upload(cancelled, uri); 
  }

  _onTake = async () => {
    const {
      cancelled,
      uri,
      base64,
    } = await Expo.ImagePicker.launchCameraAsync({
      base64: false,
    });

    this.upload(cancelled, uri); 
  }

  _onSave = async () => {
    console.log("here" + this.state.imageUri)
    // const uri = await Expo.takeSnapshotAsync(this.state.imageUri, {});
    // console.log("here")
    // await CameraRoll.saveToCameraRoll(this.state.imageUri);

    let uriParts = this.state.imageUri.split('/');
    let fileName = uriParts[uriParts.length - 1];
    let fileNameBreakDown = fileName.split('.'); 
    let fileType = fileNameBreakDown[fileNameBreakDown.length - 1]; 


    Expo.FileSystem.downloadAsync(
      this.state.imageUri,
      Expo.FileSystem.documentDirectory + 'expo.' + fileType
    )
      .then(({ uri }) => {
        console.log('Finished downloading to ', uri);
        CameraRoll.saveToCameraRoll(uri); 
      })
      .catch(error => {
        console.error(error);
      });


    console.log("here")
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
    this.setState({ slackisavailable: false }); 
  }


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

    const key = 'AIzaSyBX6sHiLH2iRxiWzvr6D8F_SSHFeW1IZHA';
    const response = await fetch(`https://storage.googleapis.com/applyingautomatically.appspot.com/expo-uploads/${fileName}?key=${key}`, {
      method: 'POST',
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
    const response = await fetch("https://slackifyapp.burnished12.hasura-app.io/" + fileName); 
    const responseText = await response.text(); 
    if (responseText) {
      // we have the url save it.
      this.setState({ imageUri: responseText }); 
      this.setState({ slackisavailable: true  }); 
      console.log("IT'S NOW SAVED: " + this.state.imageUri)
      // this.setState({ loading: false, imageUri: responseText }); 
    } else {
      console.log("hasura-app, kraken resize, or gcs storage didn't work"); 
      Alert("hasura-app, kraken resize, or gcs storage didn't work"); 
    }
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
