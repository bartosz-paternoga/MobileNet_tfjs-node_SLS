import React, { Component } from 'react'
import Dropzone from 'react-dropzone'
import axios from 'axios'
import logo from './logo.svg'
import sound from './sound.mp3'
import './App.css'


class App extends Component {

        state = {

          selectedFile: '',
          url: ''

        };


  // This function does the uploading to cloudinary
  handleUploadImages = images => {

    let URL;

    const imgPreview = document.getElementById('img-preview');
    imgPreview.src = '';
    // uploads is an array that would hold all the post methods for each image to be uploaded, then we'd use axios.all()
    const uploads = images.map(image => {
      // our formdata
      const formData = new FormData();
      formData.append("file", image);
      formData.append("tags", '{TAGS}'); // Add tags for the images - {Array}
      formData.append("upload_preset", "wpd7mzsm"); // Replace the preset name with your own
      formData.append("api_key", "278776248912159"); // Replace API key with your own Cloudinary API key
      formData.append("timestamp", (Date.now() / 1000) | 0);

      // Replace cloudinary upload URL with yours
      return axios.post(
        "https://api.cloudinary.com/v1_1/bartek985/image/upload",
        formData, 
        { headers: { "X-Requested-With": "XMLHttpRequest" }})

        .then(response => {
                this.setState({ url: response.data.url });

        console.log("state url:", this.state.url);
        imgPreview.src = this.state.url;

       });

    });

    // We would use axios `.all()` method to perform concurrent image upload to cloudinary.
    axios.all(uploads).then(() => {
      // ... do anything after successful upload. You can setState() or save the data
        console.log('Images have been uploaded')

        URL = this.state.url

        const str = URL;
        const add = 'c_scale,w_400/';
        const len = URL.length;
        const res = str.substring(0, 49);
        const res1 = str.substring(49, len);
        const result = res + add+ res1;
        URL = result;

        function translate() {

          console.log("URL", URL)

          const OpenWhiskUrl = `https://openwhisk.eu-gb.bluemix.net/api/v1/web/bartek985%40hotmail.com_dev/default/faas.json?name=${URL}`

          const ourRequest = new XMLHttpRequest();

          ourRequest.open("POST", OpenWhiskUrl, true);
          ourRequest.setRequestHeader('Content-type','application/json');

          ourRequest.onload = function() {
            if (ourRequest.status == 400) {
                console.log("Error, check your network connection.");
                  }
            else {
                 document.getElementById('xyz').play();
                 console.log("ourRequest.responseText:",(ourRequest.responseText).toString());
                 alert(ourRequest.responseText)
                  }

            }
                ourRequest.send(JSON.stringify(OpenWhiskUrl));
        }

        translate();

    });


 }

  render() {
    return (
           <div>
            <div className="App">
              <header className="App-header">
                <img src={logo} className="App-logo" alt="logo" />
                <h3> This app is using MobileNet model with tfjs-node to predict objects from an image</h3>
              </header>
            </div>
              <audio id="xyz" src={sound} preload="auto"></audio><br/>

            <div id="drp">
              <Dropzone  
                onDrop={this.handleUploadImages}
                multiple
                accept="image/*"
              >
              Press to select files to upload, or make a pic when on mobile.
              </Dropzone><br/>

              <img src="" id="img-preview" alt='' width="200" height="200" />
           </div>         
         </div>
      )
    }

  }

export default App