import 'package:flutter/material.dart';
import '../NavigationBar/BottomNavigationBar.dart';
import 'package:pill_magician/Screens/NameSearch/NameSearchScreen.dart';
import 'package:pill_magician/Screens/ImageSearch/ImageSearchScreen.dart';
import 'package:pill_magician/Screens/BookmarkSearch/BookmarkDetailScreen.dart';
import 'package:pill_magician/Screens/FeatureSearch/FeatureSearchScreen.dart';
import 'package:pill_magician/Screens/BookmarkSearch/BookmarksScreen.dart';

class MainScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.lightBlue[50], // 배경색을 추가합니다.
      body: SingleChildScrollView(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center, // 중앙 정렬
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              SizedBox(height: 50), // 상단 간격 넓힘
              Text(
                '알약 검색',
                style: TextStyle(
                  fontSize: 40,
                  fontWeight: FontWeight.w600,
                  color: Colors.blue[900], // 텍스트 색상 추가
                  fontFamily: 'Raleway', // Google Fonts 등에서 가져온 글꼴 사용
                ),
                textAlign: TextAlign.center, // 가운데 정렬
              ),
              SizedBox(height: 10),
              Center(
                child: Image.asset(
                  'assets/imgs/Pill_Search.png',
                  width: 60, // 이미지의 너비 설정
                  height: 60, // 이미지의 높이 설정
                ),
              ),
              SizedBox(height: 30), // 버튼 간격 넓힘
              Table(
                children: [
                  TableRow(
                    children: [
                      buildTextButton(
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(builder: (context) => ImageSearchScreen()),
                          );
                        },
                        label: 'AI로 사진검색',
                        icon: 'assets/imgs/Picture.png',
                      ),
                      buildTextButton(
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(builder: (context) => FeatureSearchScreen()),
                          );
                        },
                        label: '특징으로 알약검색',
                        icon: 'assets/imgs/Feature.png',
                      ),
                    ],
                  ),
                  TableRow(
                    children: [
                      buildTextButton(
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(builder: (context) => NameSearchScreen()),
                          );
                        },
                        label: '이름으로 알약검색',
                        icon: 'assets/imgs/Name.png',
                      ),

                      buildTextButton(
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(builder: (context) => BookmarksScreen()),
                          );
                        },
                        label: '즐겨찾기 알약검색',
                        icon: 'assets/imgs/Bookmark.png',
                      ),
                    ],
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
      bottomNavigationBar: CommonBottomNavigationBar(selectedIndex: 1),
    );
  }

  Widget buildTextButton({required VoidCallback onPressed, required String label, required String icon}) {
    return Padding(
      padding: const EdgeInsets.all(8.0),
      child: Container(
        width: 150, // 버튼의 너비 설정
        height: 150, // 버튼의 높이 설정
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20.0),
          boxShadow: [
            BoxShadow(
              color: Colors.grey.withOpacity(0.5),
              spreadRadius: 2,
              blurRadius: 5,
              offset: Offset(0, 3),
            ),
          ],
        ),
        child: TextButton(
          onPressed: onPressed,
          style: ButtonStyle(
            padding: MaterialStateProperty.all<EdgeInsets>(EdgeInsets.all(16.0)),
            shape: MaterialStateProperty.all<RoundedRectangleBorder>(
              RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20.0),
              ),
            ),
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Image.asset(
                icon,
                height: 50,
                width: 50,
              ),
              SizedBox(height: 10),
              Text(
                label,
                style: TextStyle(
                  fontSize: 16,
                  color: Colors.blue[900], // 텍스트 색상 변경
                  fontWeight: FontWeight.bold, // 텍스트 굵게
                  fontFamily: 'Raleway',
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
