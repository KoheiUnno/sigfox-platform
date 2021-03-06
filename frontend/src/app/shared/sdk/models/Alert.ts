/* tslint:disable */
import {
  User,
  Organization,
  Device,
  Connector
} from '../index';

declare var Object: any;
export interface AlertInterface {
  "deviceId": string;
  "active"?: boolean;
  "one_shot"?: boolean;
  "triggeredAt"?: Date;
  "key": string;
  "value"?: any;
  "geofence"?: Array<any>;
  "message"?: string;
  "id"?: any;
  "userId"?: any;
  "createdAt"?: Date;
  "updatedAt"?: Date;
  "connectorId"?: any;
  user?: User;
  Organizations?: Organization[];
  Device?: Device;
  Connector?: Connector;
}

export class Alert implements AlertInterface {
  "deviceId": string = '';
  "active": boolean = true;
  "one_shot": boolean = false;
  "triggeredAt": Date = new Date(0);
  "key": string = '';
  "value": any = <any>null;
  "geofence": Array<any> = <any>[];
  "message": string = '';
  "id": any = <any>null;
  "userId": any = <any>null;
  "createdAt": Date = new Date(0);
  "updatedAt": Date = new Date(0);
  "connectorId": any = <any>null;
  user: User = null;
  Organizations: Organization[] = null;
  Device: Device = null;
  Connector: Connector = null;
  constructor(data?: AlertInterface) {
    Object.assign(this, data);
  }
  /**
   * The name of the model represented by this $resource,
   * i.e. `Alert`.
   */
  public static getModelName() {
    return "Alert";
  }
  /**
  * @method factory
  * @author Jonathan Casarrubias
  * @license MIT
  * This method creates an instance of Alert for dynamic purposes.
  **/
  public static factory(data: AlertInterface): Alert{
    return new Alert(data);
  }
  /**
  * @method getModelDefinition
  * @author Julien Ledun
  * @license MIT
  * This method returns an object that represents some of the model
  * definitions.
  **/
  public static getModelDefinition() {
    return {
      name: 'Alert',
      plural: 'Alerts',
      path: 'Alerts',
      idName: 'id',
      properties: {
        "deviceId": {
          name: 'deviceId',
          type: 'string'
        },
        "active": {
          name: 'active',
          type: 'boolean',
          default: true
        },
        "one_shot": {
          name: 'one_shot',
          type: 'boolean',
          default: false
        },
        "triggeredAt": {
          name: 'triggeredAt',
          type: 'Date'
        },
        "key": {
          name: 'key',
          type: 'string'
        },
        "value": {
          name: 'value',
          type: 'any'
        },
        "geofence": {
          name: 'geofence',
          type: 'Array&lt;any&gt;'
        },
        "message": {
          name: 'message',
          type: 'string'
        },
        "id": {
          name: 'id',
          type: 'any'
        },
        "userId": {
          name: 'userId',
          type: 'any'
        },
        "createdAt": {
          name: 'createdAt',
          type: 'Date'
        },
        "updatedAt": {
          name: 'updatedAt',
          type: 'Date'
        },
        "connectorId": {
          name: 'connectorId',
          type: 'any'
        },
      },
      relations: {
        user: {
          name: 'user',
          type: 'User',
          model: 'User',
          relationType: 'belongsTo',
                  keyFrom: 'userId',
          keyTo: 'id'
        },
        Organizations: {
          name: 'Organizations',
          type: 'Organization[]',
          model: 'Organization',
          relationType: 'hasMany',
          modelThrough: 'AlertOrganization',
          keyThrough: 'organizationId',
          keyFrom: 'id',
          keyTo: 'alertId'
        },
        Device: {
          name: 'Device',
          type: 'Device',
          model: 'Device',
          relationType: 'belongsTo',
                  keyFrom: 'deviceId',
          keyTo: 'id'
        },
        Connector: {
          name: 'Connector',
          type: 'Connector',
          model: 'Connector',
          relationType: 'belongsTo',
                  keyFrom: 'connectorId',
          keyTo: 'id'
        },
      }
    }
  }
}
