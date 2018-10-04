import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Connector, Device, Geoloc, Message, Organization, User} from '../../shared/sdk/models';
import {UserApi} from '../../shared/sdk/services';
import {Subscription} from 'rxjs/Subscription';
import {Reception} from '../../shared/sdk/models/Reception';
import {ReceptionApi} from '../../shared/sdk/services/custom/Reception';
import {AgmMap} from '@agm/core';
import {ActivatedRoute} from '@angular/router';
import {OrganizationApi} from '../../shared/sdk/services/custom';
import {ToasterConfig, ToasterService} from 'angular2-toaster';
import {RealtimeService} from "../../shared/realtime/realtime.service";

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss']
})
export class MessagesComponent implements OnInit, OnDestroy {

  private deviceSub: any;
  public user: User;

  @ViewChild('mapModal') mapModal: any;
  @ViewChild('agmMap') agmMap: AgmMap;

  // Flags
  public messagesReady = false;

  public mapLat = 48.856614;
  public mapLng = 2.352222;
  public mapZoom = 10;
  public receptions: any[] = [];
  public geolocs: Geoloc[] = [];

  private organizationRouteSub: Subscription;
  public messages: Message[] = [];

  public organization: Organization;
  private organizations: Organization[] = [];

  private messageFilter: any;
  private isLimit_100 = false;
  private isLimit_500 = false;
  private isLimit_1000 = false;
  private isLimit_0 = false;

  // Notifications
  private toast;
  private toasterService: ToasterService;
  public toasterconfig: ToasterConfig =
    new ToasterConfig({
      tapToDismiss: true,
      timeout: 5000,
      animation: 'fade'
    });

  private filterQuery = '';

  constructor(private userApi: UserApi,
              private organizationApi: OrganizationApi,
              private receptionApi: ReceptionApi,
              toasterService: ToasterService,
              private route: ActivatedRoute,
              private rt: RealtimeService) {
    this.toasterService = toasterService;
  }

  ngOnInit(): void {
    console.log('Messages: ngOnInit');
    // Get the logged in User object
    this.user = this.userApi.getCachedCurrent();

    // Check if organization view
    this.organizationRouteSub = this.route.parent.parent.params.subscribe(parentParams => {
      if (parentParams.id) {
        this.userApi.findByIdOrganizations(this.user.id, parentParams.id).subscribe((organization: Organization) => {
          this.organization = organization;
          this.setup();
        });
      } else {
        this.setup();
      }
    });
  }

  setup(): void {
    this.cleanSetup();
    this.subscribe();

    // Get and listen messages
    this.deviceSub = this.route.params.subscribe(params => {
      this.filterQuery = params['id'];
      if (this.filterQuery) {
        this.messageFilter = {
          order: 'createdAt DESC',
          limit: 100,
          include: ['Device', 'Geolocs'],
          where: {
            and: [{deviceId: this.filterQuery}]
          }
        };
      } else {
        this.messageFilter = {
          order: 'createdAt DESC',
          limit: 100,
          include: ['Device', 'Geolocs']
        };
      }
      const api = this.organization ? this.organizationApi : this.userApi;
      const id = this.organization ? this.organization.id : this.user.id;

      api.getMessages(id, this.messageFilter).subscribe((messages: Message[]) => {
        this.messages = messages;
        this.messagesReady = true;
      });
    });
  }

  ngOnDestroy(): void {
    console.log('Messages: ngOnDestroy');
// Unsubscribe from query parameters
    if (this.organizationRouteSub) this.organizationRouteSub.unsubscribe();

    this.cleanSetup();
  }

  private cleanSetup() {
    if (this.deviceSub) this.deviceSub.unsubscribe();
    this.unsubscribe();
  }

  deleteMessage(message: Message): void {
    this.userApi.destroyByIdMessages(this.user.id, message.id).subscribe(value => {
      if (this.toast)
        this.toasterService.clear(this.toast.toastId, this.toast.toastContainerId);
      this.toast = this.toasterService.pop('success', 'Success', 'The message has been deleted.');
    }, err => {
      if (this.toast)
        this.toasterService.clear(this.toast.toastId, this.toast.toastContainerId);
      this.toast = this.toasterService.pop('error', 'Error', err.error);
    });
  }

  showMarkers(message: Message): void {
    this.geolocs = [];
    this.receptions = [];
    this.mapZoom = 10;

// Message geoloc
    if (message.Geolocs && message.Geolocs.length > 0) {
      this.geolocs = message.Geolocs;
      this.mapLat = message.Geolocs[0].location.lat;
      this.mapLng = message.Geolocs[0].location.lng;
      // Show map
      this.mapModal.show();
      this.mapModal.onShown.subscribe((reason: string) => {
        this.agmMap.triggerResize();
      });
    }

// Coverage
    this.userApi.getConnectors(this.user.id, {where: {type: 'sigfox-api'}}).subscribe((connectors: Connector[]) => {
      if (connectors.length > 0) {
        // Show map
        this.mapModal.show();
        // Get receptions
        this.receptionApi.getBaseStationsByDeviceId(message.deviceId, message.time).subscribe((receptionsResult: Reception[]) => {
            this.receptions = receptionsResult;
            console.log(this.receptions);
            if (this.receptions.length > 0) {
              this.receptions.forEach((reception, i) => {
                this.receptions[i].lat = Number(reception.lat);
                this.receptions[i].lng = Number(reception.lng);
              });
              if (!message.Geolocs) {
                this.mapLat = this.receptions[0].location.lat;
                this.mapLng = this.receptions[0].location.lng;
              }
              this.mapModal.onShown.subscribe((reason: string) => {
                this.agmMap.triggerResize();
              });
            }
          }, error => {
            console.log(error);
          }
        );
      } else {
        console.log('No Sigfox API connector');
      }
    });
  }

  searchFilter(limit: number) {
    this.messages = [];
    this.messagesReady = false;
    // Reset buttons
    this.isLimit_100 = limit == 100;
    this.isLimit_500 = limit == 500;
    this.isLimit_1000 = limit == 1000;
    this.isLimit_0 = limit == 10000;

    this.messageFilter.limit = limit;

    console.log(this.messageFilter);

    if (this.organization) {
      this.organizationApi.getFilteredMessages(this.organization.id, this.messageFilter).subscribe((messages: Message[]) => {
        this.messages = messages;
        this.messagesReady = true;
      });
    } else {
      this.userApi.getMessages(this.user.id, this.messageFilter).subscribe((messages: Message[]) => {
        this.messages = messages;
        this.messagesReady = true;
      });
    }
  }

  download(): void {

  }

  rtHandler = (payload:any) => {
    if (payload.action == "CREATE") {
      this.messages.unshift(payload.content);
    } else if (payload.action == "DELETE") {
      this.messages = this.messages.filter(function (msg) {
        return msg.id !== payload.content.id;
      });
    }
  };

  subscribe(): void {
    this.rtHandler = this.rt.addListener("message", this.rtHandler);
  }

  unsubscribe(): void {
    this.rt.removeListener(this.rtHandler);
  }
}