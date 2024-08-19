import 'package:flutter/material.dart';
import 'package:pill_magician/Screens/ETC/FeedbackScreen.dart';
import '../../NavigationBar/BottomNavigationBar.dart';
import 'package:pill_magician/Screens/ETC/MyPage.dart';
import 'package:pill_magician/Screens/ETC/MedicationLogScreen.dart';
import 'package:pill_magician/Screens/ETC/Share/ShareScheduleScreen.dart';
import 'Settings.dart';

class ETCScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          '기타메뉴',
          style: TextStyle(
            color: Colors.blue[900],
            fontWeight: FontWeight.bold,
            fontFamily: 'Raleway',
          ),
        ),
        backgroundColor: Colors.lightBlue[50],
        iconTheme: IconThemeData(color: Colors.blue[900]),
        elevation: 0,
      ),
      body: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            _buildElevatedButton(
              context,
              '마이페이지',
              Icons.person,
              MyPage(),
            ),
            _buildElevatedButton(
              context,
              '복용기록',
              Icons.history,
              MedicationLogScreen(),
            ),
            _buildElevatedButton(
              context,
              '복용 일정 공유',
              Icons.share,
              ShareScheduleScreen(), // Updated to ShareScheduleScreen
            ),
            _buildElevatedButton(
              context,
              '설정',
              Icons.settings,
              SettingsPage(sessionId: ''),
            ),
            _buildElevatedButton(
              context,
              '피드백 보내기',
              Icons.feedback,
              FeedbackScreen(),
            ),
          ],
        ),
      ),
      bottomNavigationBar: CommonBottomNavigationBar(selectedIndex: 2),
    );
  }

  Widget _buildElevatedButton(
      BuildContext context, String text, IconData icon, Widget page) {
    return Card(
      margin: EdgeInsets.symmetric(vertical: 8.0),
      elevation: 4,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(20.0),
      ),
      child: ElevatedButton(
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => page),
          );
        },
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.white,
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20.0),
          ),
        ),
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 20.0),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.start,
            children: [
              Icon(icon, color: Colors.blue[900], size: 28),
              SizedBox(width: 20),
              Text(
                text,
                style: TextStyle(
                  color: Colors.blue[900],
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  fontFamily: 'Raleway',
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
