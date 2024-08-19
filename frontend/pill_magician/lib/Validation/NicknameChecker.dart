import 'package:flutter/material.dart';

import '../API/APIService.dart';

class NicknameChecker {
  final APIService _apiService;

  NicknameChecker(this._apiService);

  Future<void> checkNickname(String user_nickname, BuildContext context) async {
    final response = await _apiService.checkNickname(user_nickname);

    if (response.statusCode == 200) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('사용 가능 닉네임입니다.')),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('사용 불가 닉네임입니다.')),
      );
    }
  }
}