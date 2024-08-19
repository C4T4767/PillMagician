import 'package:flutter/material.dart';
import 'package:pill_magician/Screens/ImageSearch/PreviewSendImageScreen.dart';
import 'package:pill_magician/Screens/LoginScreen.dart';
import 'package:pill_magician/Screens/MainScreen.dart';
import 'package:pill_magician/Screens/SearchResult/FeatureSearchResultScreen.dart';
import 'package:pill_magician/Screens/SearchResult/ImageSearchResultScreen.dart';
import 'package:pill_magician/Screens/SearchResult/FeatureSearchResultScreen.dart';

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false, // 디버그 배너 표시 여부 설정
      home: LoginScreen(),
      routes: {
        '/MainScreen': (context) => MainScreen(),
        '/LoginScreen': (context) => LoginScreen(),
      },
    );
  }
}