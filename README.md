# voicemail
 A program that allows users to download WAV files from Zendesk and then use the Google STT API to write a transcription in said ticket. Note the program doesn't have to do just WAV files, this is what I was providing as an example, please check the google configuration to see other supported audio types!

## Links needed to run program: 
- [Google STT](https://cloud.google.com/speech-to-text "Google's Speech To Text API")
- [Zendesk API Token](https://support.zendesk.com/hc/en-us/community/posts/360001097528-Where-to-find-API-token "Zendesk Generate Token")

### Using Software

To have the software run, you must generate an API key from both Zendesk and Google 


- (1) Generate credentials for both Google STT and Zendesk (Links above)
- (2) Copy the credentials from Google and paste them into the creds.json file
- (3) Copy the credentials for Zendesk from the Admin Panel in Zendesk and paste the token in index.js, also provide your email provider and host of your zendesk pod, example below
- (4) Once the credentials are in the proper place, click on run.bat and the program should now launch.
- (5) The program should run for the first time after five minutes


```javascript
const zendesk = new zendeskManager({
    host: "google", // the part before zendesk.com
    token: "ExampleToken", // API token generated in the Admin Center of Zendesk
    email: "gmail.com", // The domain after the username Example: @gmail.com
    debug: false // See what happens with the Zendesk requests
});
```

### Please post any questions in Issues or any improvements in PR's