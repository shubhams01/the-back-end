import type { Attribute, Schema } from '@strapi/strapi';

export interface SharedMetaSocial extends Schema.Component {
  collectionName: 'components_shared_meta_socials';
  info: {
    displayName: 'metaSocial';
    icon: 'project-diagram';
  };
  attributes: {
    description: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        maxLength: 65;
      }>;
    image: Attribute.Media<'images' | 'files' | 'videos'>;
    socialNetwork: Attribute.Enumeration<['Facebook', 'Twitter']> &
      Attribute.Required;
    title: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        maxLength: 60;
      }>;
  };
}

export interface SharedNestedSecttion extends Schema.Component {
  collectionName: 'components_shared_nested_secttions';
  info: {
    description: '';
    displayName: 'NestedSecttion';
    icon: 'layer';
  };
  attributes: {
    NestedSectionDescription: Attribute.Text;
    NestedSectionImage: Attribute.Media<
      'images' | 'files' | 'videos' | 'audios'
    > &
      Attribute.Required;
    NestedSectionImageBlurhash: Attribute.String;
    NestedSectionTitle: Attribute.Text;
  };
}

export interface SharedSection extends Schema.Component {
  collectionName: 'components_shared_sections';
  info: {
    description: '';
    displayName: 'Section';
    icon: 'layer';
  };
  attributes: {
    NestedSections: Attribute.Component<'shared.nested-secttion', true>;
    SectionDescription: Attribute.Text;
    SectionImage: Attribute.Media<'images' | 'files' | 'videos' | 'audios'> &
      Attribute.Required;
    SectionImageBlurhash: Attribute.String;
    SectionTitle: Attribute.Text;
  };
}

export interface SharedSeo extends Schema.Component {
  collectionName: 'components_shared_seos';
  info: {
    displayName: 'seo';
    icon: 'search';
  };
  attributes: {
    canonicalURL: Attribute.String;
    keywords: Attribute.Text;
    metaDescription: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        maxLength: 160;
        minLength: 50;
      }>;
    metaImage: Attribute.Media<'images' | 'files' | 'videos'>;
    metaRobots: Attribute.String;
    metaSocial: Attribute.Component<'shared.meta-social', true>;
    metaTitle: Attribute.String &
      Attribute.Required &
      Attribute.SetMinMaxLength<{
        maxLength: 60;
      }>;
    metaViewport: Attribute.String;
    structuredData: Attribute.JSON;
  };
}

declare module '@strapi/types' {
  export module Shared {
    export interface Components {
      'shared.meta-social': SharedMetaSocial;
      'shared.nested-secttion': SharedNestedSecttion;
      'shared.section': SharedSection;
      'shared.seo': SharedSeo;
    }
  }
}
