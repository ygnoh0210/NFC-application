import { Component } from '@angular/core';
import { IonicPage, NavController, LoadingController, AlertController } from 'ionic-angular';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthData } from '../../../providers/auth-data';

/**
 * Generated class for the LoginPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  public loginForm: any;
  public backgroundImage = "https://firebasestorage.googleapis.com/v0/b/prototype-d68e4.appspot.com/o/email-login.jpg?alt=media&token=bcc10b16-b26e-4c5d-88fb-56ee73d06ce5"
  // public imgLogo: any = "./assets/medium_150.70391061453px_1202562_easyicon.net.png";

  constructor(public navCtrl: NavController, public authData: AuthData, public fb: FormBuilder, public alertCtrl: AlertController,public loadingCtrl: LoadingController) {
    let EMAIL_REGEXP = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;
    this.loginForm = fb.group({
          email: ['', Validators.compose([Validators.required, Validators.pattern(EMAIL_REGEXP)])],
          password: ['', Validators.compose([Validators.minLength(6), Validators.required])]
    });
  }

login(){
    if (!this.loginForm.valid){
        //this.presentAlert('Username password can not be blank')
        console.log("error");
    } else {
      let loadingPopup = this.loadingCtrl.create({
        spinner: 'crescent', 
        content: ''
      });
      loadingPopup.present();

      this.authData.loginUser(this.loginForm.value.email, this.loginForm.value.password)
      .then( authData => {
        console.log("Auth pass");
        loadingPopup.dismiss();
        this.navCtrl.setRoot('HomePage');
      }, error => {
        var errorMessage: string = error.message;
        loadingPopup.dismiss().then( () => {
            this.presentAlert(errorMessage)
        });
      });
    }
}

// forgot(){
//   this.navCtrl.push('ForgotPage');
// }

createAccount(){
  this.navCtrl.push('RegisterPage');
}

presentAlert(title) {
  let alert = this.alertCtrl.create({
    title: title,
    buttons: ['OK']
  });
  alert.present();
}

}