import { Component, Inject } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, ActionSheetController
,Platform, ModalController } from 'ionic-angular';
import { Dish } from '../../shared/dish';
import { Comment } from '../../shared/comment';
import { CommentPage } from '../comment/comment';
import { FavoriteProvider } from '../../providers/favorite/favorite';
import { LocalNotifications } from '@ionic-native/local-notifications';
import { SocialSharing } from '@ionic-native/social-sharing';
import { Storage } from '@ionic/storage';

/**
 * Generated class for the DishdetailPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-dishdetail',
  templateUrl: 'dishdetail.html',
})
export class DishdetailPage {
  dish: Dish;
  errMess: string;
  avgstars: string;
  numcomments: number;
  favorite: boolean = false;
  favoriteDish: Dish[] = [];

  constructor(public navCtrl: NavController,
     public navParams: NavParams,
    @Inject('BaseURL') private BaseURL,
    public favoriteservice: FavoriteProvider,
    private toastCtrl: ToastController,
    private localNotifications: LocalNotifications,
    private socialSharing: SocialSharing,
    private actionSheetCtrl: ActionSheetController,
    public platform: Platform,
    public modalCtrl: ModalController,
    public storage: Storage) {

    this.dish = navParams.get('dish');
    this.numcomments = this.dish.comments.length;
    let total = 0;
    this.dish.comments.forEach(comment => total += comment.rating );
    this.avgstars = (total/this.numcomments).toFixed(2);
    this.favorite = favoriteservice.isFavorite(this.dish.id);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad DishdetailPage');
  }

  addToFavorites() {
    console.log('Adding to Favorites', this.dish.id);
    this.favorite = this.favoriteservice.addFavorite(this.dish.id);
    this.toastCtrl.create({
      message: 'Dish ' + this.dish.id + ' added as favorite successfully',
      position: 'middle',
      duration: 3000}).present();

      // Schedule a single notification
    this.localNotifications.schedule({
      id: this.dish.id,
      text: 'Dish ' + this.dish.id + ' added as a favorite successfully'
    });

    this.storage.set('favorite', this.dish);
  }

  presentActionSheet() {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Select Actions',
      buttons: [
        {
          text: 'Add to Favorites',
          icon: !this.platform.is('ios') ? 'heart-outline' : null,
          handler: () => {
            console.log('Destructive clicked');
            this.addToFavorites();
          }
        },
        {
          text: 'Add Comment',
          icon: !this.platform.is('ios') ? 'text' : null,
          handler: () => {
            console.log('Destructive clicked');
            this.presentModal();
          }
        },
        {
          text: 'Share via Facebook',
          icon: !this.platform.is('ios') ? 'logo-facebook' : null,
          handler: () => {
            this.socialSharing.shareViaFacebook(this.dish.name + ' -- ' + this.dish.description, this.BaseURL + this.dish.image, '')
              .then(() => console.log('Posted successfully to Facebook'))
              .catch(() => console.log('Failed to post to Facebook'));
          }
        },
        {
          text: 'Share via Twitter',
          icon: !this.platform.is('ios') ? 'logo-twitter' : null,
          handler: () => {
            this.socialSharing.shareViaTwitter(this.dish.name + ' -- ' + this.dish.description, this.BaseURL + this.dish.image, '')
              .then(() => console.log('Posted successfully to Twitter'))
              .catch(() => console.log('Failed to post to Twitter'));
          }
        },
        {
          text: 'Cancel',
          icon: !this.platform.is('ios') ? 'close' : null,
          role: 'cancel',
          handler: () => {
            console.log('Destructive clicked');
          }
        }
      ]
    });

    actionSheet.present();
  
  }

  presentModal() {
    const modal = this.modalCtrl.create(CommentPage);
    modal.onDidDismiss(data => {
      console.log(data.value);
      var d = new Date();
      var n = d.toISOString();
      this.dish.comments.push({
        rating: data.value.rating,
        comment: data.value.comment,
        author: data.value.authorName,
        date: n
      });
    });
    modal.present();
  }
}