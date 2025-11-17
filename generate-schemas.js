const fs = require('fs');
const path = require('path');

/**
 * 🔥 RULES CHUẨN STRAPI:
 * - Tên API folder: src/api/<kebab-case>/content-types/<kebab-case>/schema.json
 * - Schema `info.singularName` và `info.pluralName` phải KEBAB-CASE
 * - Không đổi "-" thành "_" trong folder
 * - Không dùng inversedBy với plugin users-permissions
 */

// ==============================
//        CONTENT TYPES
// ==============================
const schemas = {
  customer: {
    kind: 'collectionType',
    collectionName: 'customers',
    info: {
      singularName: 'customer',
      pluralName: 'customers',
      displayName: 'Customer',
      description: 'Khách hàng - Info cá nhân & Thanh toán'
    },
    options: { draftAndPublish: true },
    attributes: {
      fullName: { type: 'string', required: true },
      phone: { type: 'string', required: true },
      address: { type: 'string' },
      dateOfBirth: { type: 'datetime' },
      loyaltyPoints: { type: 'integer', default: 0 },
      walletBalance: { type: 'decimal', default: 0 },
      paymentMethods: { type: 'json' },
      isVerified: { type: 'boolean', default: false },
      notes: { type: 'string' },

      // FIX ✔ Không inversedBy
      user: {
        type: 'relation',
        relation: 'oneToOne',
        target: 'plugin::users-permissions.user'
      }
    }
  },

  'yard-type': {
    kind: 'collectionType',
    collectionName: 'yard_types',
    info: {
      singularName: 'yard-type',
      pluralName: 'yard-types',
      displayName: 'YardType'
    },
    options: { draftAndPublish: true },
    attributes: {
      name: { type: 'string', required: true },
      description: { type: 'richtext' },
      capacity: { type: 'integer', required: true, min: 1 },
      isActive: { type: 'boolean', default: true },
      basePricePerHour: { type: 'decimal', required: true, min: 0 },
      basePricePerDay: { type: 'decimal', required: true, min: 0 },
      eventMultiplier: { type: 'decimal', default: 1.0 },
      pricingTiers: { type: 'json' },
    }
  },

  yard: {
    kind: 'collectionType',
    collectionName: 'yards',
    info: {
      singularName: 'yard',
      pluralName: 'yards',
      displayName: 'Yard'
    },
    options: { draftAndPublish: true },
    attributes: {
      name: { type: 'string', required: true },
      location: { type: 'string' },
      status: {
        type: 'enumeration',
        required: true,
        default: 'available',
        enum: ['available', 'maintenance', 'booked']
      },
      photos: { type: 'media', multiple: true },
      equipmentIncluded: { type: 'string', multiple: true },
      maxCapacity: { type: 'integer' },
      isActive: { type: 'boolean', default: true },

      yardType: {
        type: 'relation',
        relation: 'manyToOne',
        target: 'api::yard-type.yard-type'
      }
    }
  },

  service: {
    kind: 'collectionType',
    collectionName: 'services',
    info: {
      singularName: 'service',
      pluralName: 'services',
      displayName: 'Service'
    },
    options: { draftAndPublish: true },
    attributes: {
      name: { type: 'string', required: true },
      category: {
        type: 'enumeration',
        required: true,
        enum: ['addon', 'yard_base']
      },
      description: { type: 'richtext' },
      pricePerUnit: { type: 'decimal', required: true, min: 0 },
      unit: { type: 'string' },
      isHourly: { type: 'boolean', default: false },
      isDaily: { type: 'boolean', default: false },
      isEvent: { type: 'boolean', default: false },
      maxQuantity: { type: 'integer' },
      availableFrom: { type: 'datetime' },
      availableTo: { type: 'datetime' },
      isActive: { type: 'boolean', default: true }
    }
  },

  'yard-booking': {
    kind: 'collectionType',
    collectionName: 'yard_bookings',
    info: {
      singularName: 'yard-booking',
      pluralName: 'yard-bookings',
      displayName: 'YardBooking'
    },
    options: { draftAndPublish: true },
    attributes: {
      bookingType: {
        type: 'enumeration',
        required: true,
        default: 'hourly',
        enum: ['hourly', 'daily', 'event']
      },
      startTime: { type: 'datetime', required: true },
      endTime: { type: 'datetime', required: true },
      durationHours: { type: 'decimal' },
      customerNotes: { type: 'string' },

      status: {
        type: 'enumeration',
        required: true,
        default: 'pending',
        enum: ['pending', 'confirmed', 'cancelled', 'completed']
      },

      totalEstimate: { type: 'decimal' },

      eventDetails: {
        type: 'component',
        repeatable: false,
        component: 'event-details.event-details'
      },

      yard: {
        type: 'relation',
        relation: 'manyToOne',
        target: 'api::yard.yard'
      },

      services: {
        type: 'relation',
        relation: 'manyToMany',
        target: 'api::service.service'
      },

      customer: {
        type: 'relation',
        relation: 'manyToOne',
        target: 'api::customer.customer'
      },

      invoice: {
        type: 'relation',
        relation: 'oneToOne',
        target: 'api::invoice.invoice'
      }
    }
  },

  invoice: {
    kind: 'collectionType',
    collectionName: 'invoices',
    info: {
      singularName: 'invoice',
      pluralName: 'invoices',
      displayName: 'Invoice'
    },
    options: { draftAndPublish: true },
    attributes: {
      invoiceNumber: { type: 'string', unique: true },
      subtotal: { type: 'decimal' },
      discountAmount: { type: 'decimal', default: 0 },
      taxAmount: { type: 'decimal', default: 0 },
      grandTotal: { type: 'decimal' },

      status: {
        type: 'enumeration',
        required: true,
        default: 'draft',
        enum: ['draft', 'pending', 'paid', 'cancelled']
      },

      paymentMethod: {
        type: 'enumeration',
        enum: ['cash', 'momo', 'bank_transfer']
      },

      dueDate: { type: 'datetime' },
      issuedDate: { type: 'datetime' },
      paidDate: { type: 'datetime' },
      notes: { type: 'string' },

      booking: {
        type: 'relation',
        relation: 'oneToOne',
        target: 'api::yard-booking.yard-booking'
      },

      customer: {
        type: 'relation',
        relation: 'manyToOne',
        target: 'api::customer.customer'
      },

      items: {
        type: 'relation',
        relation: 'oneToMany',
        target: 'api::invoice-item.invoice-item'
      }
    }
  },

  'invoice-item': {
    kind: 'collectionType',
    collectionName: 'invoice_items',
    info: {
      singularName: 'invoice-item',
      pluralName: 'invoice-items',
      displayName: 'InvoiceItem'
    },
    options: { draftAndPublish: true },
    attributes: {
      type: {
        type: 'enumeration',
        required: true,
        enum: ['hourly', 'daily', 'event', 'addon']
      },

      description: { type: 'string' },
      quantity: { type: 'integer', required: true, min: 1 },
      unit: { type: 'string' },
      unitPrice: { type: 'decimal', required: true, min: 0 },
      totalPrice: { type: 'decimal' },
      startTime: { type: 'datetime' },
      endTime: { type: 'datetime' },

      eventDetails: {
        type: 'component',
        repeatable: false,
        component: 'event-details.event-details'
      },

      invoice: {
        type: 'relation',
        relation: 'manyToOne',
        target: 'api::invoice.invoice'
      },

      booking: {
        type: 'relation',
        relation: 'manyToOne',
        target: 'api::yard-booking.yard-booking'
      },

      service: {
        type: 'relation',
        relation: 'manyToOne',
        target: 'api::service.service'
      },

      yard: {
        type: 'relation',
        relation: 'manyToOne',
        target: 'api::yard.yard'
      }
    }
  }
};

// ==============================
//           GENERATOR
// ==============================
function generateSchema(apiName, schemaData) {
  const apiDir = path.join('src', 'api', apiName, 'content-types', apiName);
  const schemaPath = path.join(apiDir, 'schema.json');

  if (!fs.existsSync(apiDir)) fs.mkdirSync(apiDir, { recursive: true });

  fs.writeFileSync(schemaPath, JSON.stringify(schemaData, null, 2));
  console.log('Generated:', schemaPath);
}

// ==============================
//        COMPONENT CREATE
// ==============================
function generateComponent() {
  const dir = path.join('src', 'components', 'event-details');
  const file = path.join(dir, 'event-details.json');

  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const schema = {
    collectionName: 'components_event_details_event_details',
    info: { displayName: 'EventDetails' },
    attributes: {
      eventName: { type: 'string' },
      expectedAttendees: { type: 'integer' },
      setupFee: { type: 'decimal' }
    }
  };

  fs.writeFileSync(file, JSON.stringify(schema, null, 2));
  console.log('Generated:', file);
}

// ==============================
//            RUN
// ==============================
console.log('Generating Strapi Schemas...');
Object.entries(schemas).forEach(([name, schema]) => generateSchema(name, schema));
generateComponent();
console.log('Done. Hãy restart Strapi!');
