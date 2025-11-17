import type { Schema, Struct } from '@strapi/strapi';

export interface EventDetailsEventDetails extends Struct.ComponentSchema {
  collectionName: 'components_event_details_event_details';
  info: {
    displayName: 'EventDetails';
  };
  attributes: {
    eventName: Schema.Attribute.String;
    expectedAttendees: Schema.Attribute.Integer;
    setupFee: Schema.Attribute.Decimal;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'event-details.event-details': EventDetailsEventDetails;
    }
  }
}
