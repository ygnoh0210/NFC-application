import { Component, ChangeDetectorRef } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, LoadingController } from 'ionic-angular';
import { FireService } from '../../../providers/FireService'
import { RepairitemdetailPageModule } from './repairitemdetail.module';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { ToastController } from 'ionic-angular/components/toast/toast-controller';
import {AngularFireAuth} from 'angularfire2/auth'
import firebase from 'firebase';

class RepairItem {
  finDate: Date;
  id: string;
  isToggled: boolean;
}

interface RepairItemLog {
  title: string,
  writer: string,
  description: string;
  timestamp: Date;
}

@IonicPage()
@Component({
  selector: 'page-repairitemdetail',
  templateUrl: 'repairitemdetail.html',
})


export class RepairitemdetailPage {
  private itemsCollection: AngularFirestoreCollection<RepairItem>;
  private itemsCollectionlog: AngularFirestoreCollection<RepairItemLog>;

  id_temp : string ;
  RepairItem = new RepairItem();

  itemList: any = [];
  itemArray: any = [];
  items: any = [];

  showToolbar: boolean = false;
  transition: boolean = false;

  id: string;
  serialNum: string;
  model: string;
  repairman: string;

  startDate: Date;
  finDate: Date
  isToggled: boolean;


  close: boolean;
  payload: string;

  backgroundImage = "https://firebasestorage.googleapis.com/v0/b/prototype-d68e4.appspot.com/o/%EB%A9%94%EC%9D%B8%ED%8E%98%EC%9D%B4%EC%A7%802_%ED%88%AC%EB%AA%85.png?alt=media&token=b4bb27d8-9ce6-44b5-b979-a5d24c2401b2";

  item_length: number;
  lastVisible: any;
  db = firebase.firestore();
  length_cnt: number = 0;


  constructor(public navCtrl: NavController, public navParams: NavParams, public toast: ToastController,
    public ref: ChangeDetectorRef,  public fireService : FireService, public afs: AngularFirestore, public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,public afAuth : AngularFireAuth) {


      this.payload = null;

      this.payload =  this.navParams.get('payload');

      if(this.payload != null){

        this.afs.collection('maintenance_map').doc(this.payload).valueChanges()
          .subscribe((doc:any)=>{
            this.id = doc.doc_id
          })
      }
      else{
    
        this.id = this.navParams.get('id');
     
      }

      this.loadItems();
      this.afs.collection('RepairItem').doc(`${this.id}`).collection('repair').valueChanges().subscribe((snap)=>{
        this.item_length = snap.length;
        console.log(this.item_length);
      })





      this.afs.collection('RepairItem').doc(`${this.id}`).valueChanges()
        .subscribe((RepairItem: any) => {
          this.serialNum = RepairItem.serialNum;
          this.model = RepairItem.model;
          this.repairman = RepairItem.repairman;
          this.repairfin = RepairItem.repairfin;
          this.startDate = RepairItem.startDate;
          this.finDate = RepairItem.finDate;
          this.isToggled = RepairItem.isToggled;
        })
    

  
       this.close = true;
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ItemDetailPage');
  }

  loadItems(infiniteScroll?) {

    if (this.lastVisible == null) {
 
      this.db.collection('RepairItem').doc(`${this.id}`).collection('repair')
        .orderBy('timestamp','desc')
        .limit(3)
        .get()
        .then((querySnapshot) => {
          this.lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
          this.length_cnt = this.length_cnt + querySnapshot.docs.length;
          console.log(this.length_cnt)
          querySnapshot.forEach((doc) => {
            this.itemList.push(doc.data())
          })
        })
    }
    else {

      this.db.collection('RepairItem').doc(`${this.id}`).collection('repair')
        .orderBy('timestamp','desc')
        .startAfter(this.lastVisible)
        .limit(2)
        .get()
        .then((querySnapshot) => {

          this.lastVisible = querySnapshot.docs[querySnapshot.docs.length - 1];
          this.length_cnt = this.length_cnt + querySnapshot.docs.length;
          console.log(this.length_cnt)
          querySnapshot.forEach((doc) => {
            this.itemList.push(doc.data())
          })

          if (infiniteScroll) {
            infiniteScroll.complete();
          }
        })
    }
  }

  loadMore(infiniteScroll) {

    if (this.length_cnt < this.item_length)
      this.loadItems(infiniteScroll);

    console.log(this.item_length)
    if (this.length_cnt >= this.item_length)
      infiniteScroll.enable(false);
  }

  addlog(){
    this.navCtrl.push('AddlogPage',{
      id : this.id,
      serialNum : this.serialNum, 
      model : this.model
    })
  }

  timeline() {
    this.navCtrl.push('TimelinePage', {
      id: this.id
    })
  }

  repairfin() {

    this.isToggled !== true;
    console.log(this.isToggled)
    this.RepairItem.isToggled = this.isToggled
    this.RepairItem.finDate = new Date()
    this.finDate = this.RepairItem.finDate;
    this.RepairItem.id = this.id
    this.fireService.finAdd(this.RepairItem)
    console.log(this.finDate)
  }



  delete() {

    let confirm = this.alertCtrl.create({
      title: '????????? ???????????? ?????????????????????????',
      message: '???????????? ?????????????????? Yes??? ???????????????',
      buttons: [
        {
          text: 'Yes',
          handler: () => {
            this.afs.collection('RepairItem').doc(this.id).delete().then(() => {

              let toast = this.toast.create({
                message: "??????????????? ?????????????????????.",
                duration: 2000,
                position: "bottom"
              });

              toast.present();
              this.navCtrl.pop();
            }).catch(function (error) {
              console.error("????????? ?????????????????????. ", error);
            });
          }

        },
        {
          text: 'Cancel',
          handler: () => {
            console.log('cancel clicked');
          }
        }
      ]
    });


    confirm.present();

  }


  more() {

    this.itemsCollectionlog = this.afs.collection('RepairItem').doc(`${this.id}`).collection<RepairItemLog>('repair', ref => ref.orderBy('timestamp', 'desc'))
    this.items = this.itemsCollectionlog.valueChanges()


    this.items.subscribe((RepairItemLog) => {
      this.itemArray = RepairItemLog;
      this.itemList = this.itemArray;
    });

    this.close = false;

  }

}
