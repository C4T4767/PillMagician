class User {
  String user_name;
  String user_nickname;
  String user_id;
  String user_password;
  String user_birth;
  String user_email;
  String user_phone;


  User({
    required this.user_name,
    required this.user_nickname,
    required this.user_id,
    required this.user_password,
    required this.user_birth,
    required this.user_email,
    required this.user_phone

  });


  Map<String, dynamic> toJson() {
    return {
      'user_name': user_name,
      'user_nickname': user_nickname,
      'user_id': user_id,
      'user_password': user_password,
      'user_birth': user_birth,
      'user_email': user_email,
      'user_phone' : user_phone
    };
  }
}
