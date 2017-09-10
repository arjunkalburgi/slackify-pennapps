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
            onPress={this._onSlack}>
            <Text>to slack!</Text>
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
      base64,
    } = await Expo.ImagePicker.launchImageLibraryAsync({
      base64: false,
    });

    console.log(cancelled); 
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

    console.log(fileName)

    let formData = new FormData();
    formData.append('photo', {
      uri,
      name: uriParts[uriParts.length - 2],// `expo-upload.${fileType}`,
      type: `image/${fileType}`,
    });

    console.log(JSON.stringify(formData)); 

    const key = 'AIzaSyA6wUzO8HUWVhGvuNxhGGhwkOlAXZeXDd8';
    const response = await fetch(`https://storage.googleapis.com/applyingautomatically.appspot.com/expo-uploads/${formData.name}?key=${key}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: formData,
    });
    console.log("\nresponse:\n"); 
    console.log(response); 
    const parsed = await response.json();
    console.log(parsed.responses[0].labelAnnotations[0].description); 
    // this.setState({
    //   label: parsed.responses[0].labelAnnotations[0].description,
    // });
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
    const uri = await Expo.takeSnapshotAsync(this.memeView);
    console.log("took snapshot");
    await CameraRoll.saveToCameraRoll(uri);
  }

  _onSlack = async () => {
    // this.crop()
    this.scale()
    Linking.canOpenURL("https://slack.com/customize/emoji").then(supported => {
      if (supported) {
        Linking.openURL("https://slack.com/customize/emoji");

      } else {
        console.log("Don't know how to open URI: " + this.props.url);
      }
    });
  }

  async crop() {
    ImageEditor.cropImage(
      this.state.imageUri, 
      { offset: { x: 0, y: 0 }, size: { width: 128, height: 128 }}, 
      successURI => CameraRoll.saveToCameraRoll(successURI), 
      error => console.log(error.message)
    )
  };

  async scale() {
    // request kraked_url from server 
    console.log("before upload")
    this.upload()

    // call server function 
    // let uriParts = uri.split('.');
    // let fileType = uriParts[uri.length - 1];

    // saveToCameraRoll if success 
    // this.crop() if fail
  };

  async upload() {
    let uploadResponse, uploadResult;
    console.log("before uploadResponse")
    uploadResponse = await uploadImageAsync(this.state.imageUri);
    console.log("after uploadResult"); 
    uploadResult = await uploadResponse.json();
    this.setState({ image: uploadResult.location });
  }; 
}

async function uploadImageAsync(uri) {
  let apiUrl = 'https://storage.googleapis.com/applyingautomatically.appspot.com/expo-uploads/';

  // Note:
  // Uncomment this if you want to experiment with local server
  //
  // if (Constants.isDevice) {
  //   apiUrl = `https://your-ngrok-subdomain.ngrok.io/upload`;
  // } else {
  //   apiUrl = `http://localhost:3000/upload`
  // }

  let uriParts = uri.split('.');
  let fileType = uriParts[uri.length - 1];

  let formData = new FormData();
  formData.append('photo', {
    uri,
    name: `expo-upload`,
    type: `image/${fileType}`,
  });

  let options = {
    method: 'POST',
    body: formData,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'multipart/form-data',
    },
  };

  console.log("before fetch")
  return fetch(apiUrl, options);
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
