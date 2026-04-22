namespace kits;

entity Users {
  key user_id : UUID;
  email : String;
  first_name : String;
  last_name : String;
  logged_in_ip : String;
  last_logged_in : Timestamp;
  password : String;
  user_otp : Integer;
  otp_sent_time : Timestamp;
  is_logged_in : Boolean;
  status : String default 'inactive';
  access_token : String;
  refresh_token : String;
  role : String;
  created_by : String;
  sponsor_id : String;
  site_id : String;
}

entity Sponsor {
  key sponsor_id : UUID;
  sponsor_code : String;
  existing_sponsor_code : String;
  sponsor_name : String;
  legal_sponsor_name : String;
  address_1 : String;
  address_2 : String;
  city : String;
  district : String;
  region : String;
  zip_code : String;
  country : String;
  office_telephone : String;
  mobile_telephone : String;
  extension : String;
  email : String;
  website : String;
  notifier_details : LargeString; // JSONB
  user_id : UUID;
  user : Association to Users on user.user_id = user_id;
  created_by : String;
  created_on : Timestamp;
  changed_by : String;
  changed_on : Timestamp;
}

entity CroProtocol {
  key id : UUID;
  protocol_id : String;
  protocol_name : String;
  sponsor_id : String;
  sponsor_name : String;
  cro_id : String;
  no_of_visits : Integer;
  no_of_screens : Integer;
  special_instructions : String;
  global_sample_size : Integer;
  avant_sample_size : Integer;
  kit_variant_count : Integer;
  user_id : UUID;
  user : Association to Users on user.user_id = user_id;
  created_by : String;
  created_on : Timestamp;
  changed_by : String;
  changed_on : Timestamp;
}

entity SiteData {
  key site_id : UUID;
  site_data_code : String;
  site_data_name : String;
  legal_site_data_name : String;
  address_1 : String;
  address_2 : String;
  city : String;
  district : String;
  region : String;
  zip_code : String;
  country : String;
  office_telephone : String;
  extension : String;
  mobile_telephone : String;
  email : String;
  website : String;
  notifier_emails : LargeString; // JSONB
  user_id : UUID;
  user : Association to Users on user.user_id = user_id;
  created_by : String;
  created_on : Timestamp;
  changed_by : String;
  changed_on : Timestamp;
}

entity ClabKitPreparation {
  key id : UUID;
  protocol_id : UUID;
  protocol : Association to CroProtocol on protocol.id = protocol_id;
  screening_kit_details : LargeString; // JSONB
  protocol_name : String;
  visit_kit_details : LargeString; // JSONB
  created_on : Timestamp;
}

entity Cro {
  key cro_id : UUID;
  cro_code : String;
  cro_name : String;
  address : String;
  // Further fields typically match other models, using simple string fields
  // This is a placeholder since I haven't seen cro.py completely, 
  // but it usually follows the same pattern as Sponsor.
  created_on : Timestamp;
}
