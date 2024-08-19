import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:pill_magician/Screens/MainScreen.dart';
import 'package:pill_magician/Screens/ImageSearch/ImageSearchScreen.dart';
import 'package:pill_magician/Screens/Alarm/AlarmMainScreen.dart';
import '../Screens/ETC/ETCScreen.dart';

class CommonBottomNavigationBar extends StatelessWidget {
  final int selectedIndex;

  const CommonBottomNavigationBar({Key? key, required this.selectedIndex}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        border: Border(
          top: BorderSide(
            color: Colors.grey.withOpacity(0.5), // 회색 경계선
            width: 1.0,
          ),
        ),
      ),
      child: BottomNavigationBar(
        currentIndex: selectedIndex,
        backgroundColor: Colors.white,
        selectedItemColor: Colors.black,
        unselectedItemColor: Colors.black,
        selectedLabelStyle: const TextStyle(fontWeight: FontWeight.normal),
        unselectedLabelStyle: const TextStyle(fontWeight: FontWeight.normal),
        items: <BottomNavigationBarItem>[
          BottomNavigationBarItem(
            icon: Image.asset(
              'assets/imgs/Alarm.png',
              width: 50, // 이미지의 크기를 조정해야 합니다.
              height: 50, // 이미지의 크기를 조정해야 합니다.
            ),
            label: '알람',
          ),
          BottomNavigationBarItem(
            icon: Image.asset(
              'assets/imgs/Pill_Search.png',
              width: 50, // 이미지의 크기를 조정해야 합니다.
              height: 50, // 이미지의 크기를 조정해야 합니다.
            ),
            label: '알약 검색',
          ),
          BottomNavigationBarItem(
            icon: Image.asset(
              'assets/imgs/ETC.png',
              width: 50, // 이미지의 크기를 조정해야 합니다.
              height: 50, // 이미지의 크기를 조정해야 합니다.
            ),
            label: '기타 메뉴',
          ),
        ],
        onTap: (index) {
          switch (index) {
            case 0:
              Navigator.of(context).push(MaterialPageRoute(builder: (context) => AlarmMainScreen()));
              break;
            case 1:
              Navigator.of(context).push(MaterialPageRoute(builder: (context) => MainScreen()));
              break;
            case 2:
              Navigator.of(context).push(MaterialPageRoute(builder: (context) => ETCScreen()));
              break;
          }
        },
      ),
    );
  }
}
