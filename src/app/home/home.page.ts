import { Component } from "@angular/core";
import {
  NavController,
  Platform,
  MenuController,
  AlertController,
} from "@ionic/angular";
import { UtilserviceService } from "../services/utilservice.service";
import { ApiService } from "../services/api.service";
import { Router, NavigationExtras } from "@angular/router";
import { Geolocation } from "@ionic-native/geolocation/ngx";
import { Network } from "@ionic-native/network/ngx";
import { AndroidPermissions } from "@ionic-native/android-permissions/ngx";
import { LocationAccuracy } from "@ionic-native/location-accuracy/ngx";

@Component({
  selector: "app-home",
  templateUrl: "home.page.html",
  styleUrls: ["home.page.scss"],
})
export class HomePage {
  slideOpts = {
    spaceBetween: 20,
    autoplay: true,
  };
  latitude: any;
  longitude: any;
  address: string;
  accuracy: number;
  data: any;
  id: any;
  salon: any = {};
  currentdata: string;
  res: string;
  banners: any = [];
  categories: any = [];
  cat_id: any;
  nearBySalon: any = [];
  card: any;
  lat: any;
  long: any;
  distance: any;
  item: any;
  selectAddress: any = "";
  netType: any;
  language: any;
  constructor(
    private navCtrl: NavController,
    private util: UtilserviceService,
    private api: ApiService,
    private router: Router,
    private geolocaion: Geolocation,
    private androidPermissions: AndroidPermissions,
    private locationAccuracy: LocationAccuracy,
    private platform: Platform,
    private network: Network,
    private menuController: MenuController,
    private alertController: AlertController
  ) {
    const date = Date.now();
    const options: any = { weekday: "long" };
    this.currentdata = new Intl.DateTimeFormat("en-US", options).format(date);
    this.res = this.currentdata.toLowerCase();
    var current_date = new Date();
    var weekday_value = current_date.getDay();
    this.netType = this.network.type;
    this.api.newLang.subscribe((d) => {
      this.language = localStorage.getItem("lan");
    });
    setTimeout(() => {
      // this.checkGPSPermission();
    }, 50);
  }
  doRefresh(event) {
    setTimeout(() => {
      this.ionViewWillEnter();
      this.ngOnInit();
      // this.getLocation();
      event.target.complete();
    }, 2000);
  }

  ionViewWillEnter() {
    setTimeout(() => {
      // this.checkGPSPermission();
    }, 50);
    this.util.startLoad();
    this.api.newLang.subscribe((d) => {
      this.language = localStorage.getItem("lan");
    });
    this.selectAddress = localStorage.getItem("dataofaddress");
    this.menuController.swipeGesture(false);
    // this.getLocation();
    this.api.getData("banners").subscribe((success: any) => {
      if (success.success == true) {
        this.banners = success.data;
        this.util.dismissLoader();
      } else {
        this.util.dismissLoader();
      }
    });
  }

  ngOnInit() {
    console.log("will enter console log");
    this.util.startLoad();
    this.api.newLang.subscribe((d) => {
      this.language = localStorage.getItem("lan");
    });
    this.api.getData("banners").subscribe((success: any) => {
      if (success.success == true) {
        this.banners = success.data;
        this.util.dismissLoader();
      } else {
        this.util.dismissLoader();
      }
    });
    this.api.getData("categories").subscribe((success: any) => {
      if (success.success == true) {
        this.categories = success.data;
        this.categories.forEach((element) => {
          this.cat_id = element.cat_id;
        });
        this.util.dismissLoader();
      } else {
        this.util.dismissLoader();
      }
    });
    this.api.addressData;
    this.selectAddress = localStorage.getItem("dataofaddress");
    localStorage.removeItem("booking-detail");

    this.api.getData("salons").subscribe(
      (success: any) => {
        if (success.success == true) {
          this.data = success.data;
          this.data.forEach((element) => {
            this.lat = element.latitude;
            this.long = element.longitude;
            element.distance = this.api
              .getDistanceFromLatLonInKm(
                this.latitude,
                this.longitude,
                this.latitude,
                this.long
              )
              .toFixed(1);
          });
          this.id = success.data.salon_id;

          this.util.dismissLoader();
        } else {
          this.util.dismissLoader();
        }
      },
      (err) => {
        this.util.dismissLoader();
      }
    );
  }

  checkGPSPermission() {
    this.androidPermissions
      .checkPermission(
        this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION
      )
      .then(
        (result) => {
          if (result.hasPermission) {
            //If having permission show 'Turn On GPS' dialogue
            this.askToTurnOnGPS();
          } else {
            //If not having permission ask for permission
            this.requestGPSPermission();
          }
        },
        (err) => {}
      );
  }

  requestGPSPermission() {
    this.locationAccuracy.canRequest().then((canRequest: boolean) => {
      if (canRequest) {
      } else {
        //Show 'GPS Permission Request' dialogue
        this.androidPermissions
          .requestPermission(
            this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION
          )
          .then(
            () => {
              // call method to turn on GPS
              this.askToTurnOnGPS();
            },
            (error) => {
              //Show alert if user click on 'No Thanks'
            }
          );
      }
    });
  }

  askToTurnOnGPS() {
    this.locationAccuracy
      .request(this.locationAccuracy.REQUEST_PRIORITY_HIGH_ACCURACY)
      .then(
        () => {
          // When GPS Turned ON call method to get Accurate location coordinates
          this.getGeolocation();
        },
        (error) => {}
      );
  }

  getGeolocation() {
    this.geolocaion
      .getCurrentPosition()
      .then((resp) => {
        this.latitude = resp.coords.latitude;
        this.longitude = resp.coords.longitude;
        this.accuracy = resp.coords.accuracy;
        localStorage.setItem("addressLat", this.latitude);
        localStorage.setItem("addressLng", this.longitude);
      })
      .catch((error) => {
        console.log(JSON.stringify(error));
      });
  }

  addressLat: any;
  addressLng: any;
  async getLocation() {
    const position = await this.geolocaion.getCurrentPosition();
    this.addressLat = localStorage.getItem("addressLat");
    this.addressLng = localStorage.getItem("addressLng");
    this.latitude = this.addressLat
      ? this.addressLat
      : position.coords.latitude;
    this.longitude = this.addressLng
      ? this.addressLng
      : position.coords.longitude;
    let long = {
      lat: this.latitude,
      long: this.longitude,
    };
    this.api.postData("nearbysalon", long).subscribe(
      (success: any) => {
        if (success.success == true) {
          this.nearBySalon = success.data;
          this.nearBySalon.forEach((element) => {
            this.lat = element.latitude;
            this.long = element.longitude;
            element.distance = this.api
              .getDistanceFromLatLonInKm(
                this.latitude,
                this.longitude,
                this.lat,
                this.long
              )
              .toFixed(1);
          });
        } else {
          this.util.dismissLoader();
        }
      },
      (err) => {
        this.util.dismissLoader();
      }
    );
  }

  catSalon(cat_id) {
    let navigationExtras: NavigationExtras = {
      state: {
        cat_id: cat_id,
        address: this.address,
      },
    };
    this.router.navigate(["top-services"], navigationExtras);
    localStorage.setItem("catId", cat_id);
  }

  search() {
    let navigationExtra: NavigationExtras = {
      state: {
        address: this.address,
      },
    };
    this.router.navigate(["tabs/home/search"], navigationExtra);
  }

  allSalons() {
    let navigationExtra: NavigationExtras = {
      state: {
        address: this.address,
      },
    };
    this.router.navigate(["all-salons"], navigationExtra);
  }

  book(id) {
    let navigationExtras: NavigationExtras = {
      state: {
        id: id,
      },
    };
    this.router.navigate(["tabs/home/salon-profile"], navigationExtras);
    localStorage.setItem("Salon-id", id);
  }

  topServvices() {
    this.navCtrl.navigateForward("tabs/home/tops");
  }

  setLocation() {
    this.navCtrl.navigateForward("tabs/nearby/setlocatio");
  }

  appoint() {
    this.navCtrl.navigateBack("tabs/appointment");
  }

  async presentAlert() {
    const alert = await this.alertController.create({
      cssClass: "my-custom-class",
      // header: "Alert",
      // subHeader: "Subtitle",
      message: "This is an alert message. Navigate to?",
      buttons: ["OK"],
    });

    await alert.present();

    const { role } = await alert.onDidDismiss();
    console.log("onDidDismiss resolved with role", role);
  }
}
