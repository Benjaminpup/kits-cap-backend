using { kits } from '../db/schema';

@protocol: 'rest'
@path: '/api'
service KitsService {

  entity users as projection on kits.Users;
  
  entity sponsors as projection on kits.Sponsor;
  
  entity cro_protocols as projection on kits.CroProtocol;
  
  entity site_data as projection on kits.SiteData;
  
  entity clab_kit_preparations as projection on kits.ClabKitPreparation;
  
  entity cros as projection on kits.Cro;

}
