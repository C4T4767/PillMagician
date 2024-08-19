import 'package:flutter/material.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:pill_magician/Model/MedicationInfo.dart';
import 'package:pill_magician/Screens/Alarm/AddAlarmScreen.dart';
import 'package:pill_magician/API/APIService.dart';
import '../../NavigationBar/BottomNavigationBar.dart';
import 'package:timezone/data/latest.dart' as tz;
import 'package:timezone/timezone.dart' as tz;

class AlarmMainScreen extends StatefulWidget {
  @override
  _AlarmMainScreenState createState() => _AlarmMainScreenState();
}

class _AlarmMainScreenState extends State<AlarmMainScreen> {
  List<MedicationInfo> alarmList = [];
  FlutterLocalNotificationsPlugin flutterLocalNotificationsPlugin = FlutterLocalNotificationsPlugin();

  @override
  void initState() {
    super.initState();
    _initializeNotifications();
    _loadAlarms();
  }

  void _initializeNotifications() async {
    tz.initializeTimeZones();
    const AndroidInitializationSettings initializationSettingsAndroid = AndroidInitializationSettings('app_icon');
    final InitializationSettings initializationSettings = InitializationSettings(android: initializationSettingsAndroid);
    await flutterLocalNotificationsPlugin.initialize(initializationSettings);
  }

  Future<void> _loadAlarms() async {
    // 서버에서 알람을 가져오기
    final serverAlarms = await APIService().fetchAlarms();

    setState(() {
      alarmList = serverAlarms;
    });

    for (var alarm in serverAlarms) {
      _scheduleAlarms(alarm);
    }
  }

  tz.TZDateTime _nextInstanceOfTime(TimeOfDay time) {
    final tz.TZDateTime now = tz.TZDateTime.now(tz.local);
    tz.TZDateTime scheduledDate = tz.TZDateTime(tz.local, now.year, now.month, now.day, time.hour, time.minute);
    if (scheduledDate.isBefore(now)) {
      scheduledDate = scheduledDate.add(Duration(days: 1));
    }
    return scheduledDate;
  }

  Future<void> _scheduleAlarms(MedicationInfo medicationInfo) async {
    for (var time in medicationInfo.times) {
      final int alarmId = DateTime.now().millisecondsSinceEpoch ~/ 1000 + medicationInfo.times.indexOf(time);
      final tz.TZDateTime scheduledTime = _nextInstanceOfTime(time);

      final androidDetails = AndroidNotificationDetails(
        'alarm_channel',
        'Alarms',
        channelDescription: 'Medication alarms',
        importance: Importance.max,
        priority: Priority.high,
      );
      final platformDetails = NotificationDetails(android: androidDetails);

      await flutterLocalNotificationsPlugin.zonedSchedule(
        alarmId,
        'Medication Reminder',
        'Time to take your medication: ${medicationInfo.name}',
        scheduledTime,
        platformDetails,
        androidAllowWhileIdle: true,
        uiLocalNotificationDateInterpretation: UILocalNotificationDateInterpretation.absoluteTime,
        matchDateTimeComponents: DateTimeComponents.time,
      );
    }
  }

  Future<void> _cancelAlarms(MedicationInfo medicationInfo) async {
    for (var time in medicationInfo.times) {
      final int alarmId = DateTime.now().millisecondsSinceEpoch ~/ 1000 + medicationInfo.times.indexOf(time);
      await flutterLocalNotificationsPlugin.cancel(alarmId);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          '알람 목록',
          style: TextStyle(
            color: Colors.blue[900], // 텍스트 색상 변경
            fontWeight: FontWeight.bold, // 텍스트 굵게
            fontFamily: 'Raleway', // 글꼴 설정
          ),
        ),
        backgroundColor: Colors.lightBlue[50], // 배경색 변경
        iconTheme: IconThemeData(color: Colors.blue[900]),
        elevation: 0, // 그림자 효과 제거
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            ListView.builder(
              shrinkWrap: true,
              itemCount: alarmList.length,
              itemBuilder: (context, index) {
                return Card(
                  margin: EdgeInsets.symmetric(vertical: 8.0, horizontal: 16.0),
                  elevation: 4,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(20.0),
                  ),
                  child: ListTile(
                    title: Text(
                      alarmList[index].name,
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                        color: Colors.blue[900],
                        fontFamily: 'Raleway',
                      ),
                    ),
                    subtitle: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '복용 기간: ${alarmList[index].startDate.toString().substring(0, 10)} ~ ${alarmList[index].endDate.toString().substring(0, 10)}',
                          style: TextStyle(
                            fontSize: 16,
                            fontFamily: 'Raleway',
                          ),
                        ),
                        ...alarmList[index].times.map((time) => Text(
                          '복용 시간: ${time.format(context)}',
                          style: TextStyle(
                            fontSize: 16,
                            fontFamily: 'Raleway',
                          ),
                        )),
                      ],
                    ),
                    onTap: () {
                      _navigateToEditAlarmScreen(context, alarmList[index]);
                    },
                    trailing: IconButton(
                      icon: Icon(Icons.delete, color: Colors.blueAccent),
                      onPressed: () async {
                        await _deleteAlarm(alarmList[index].alarmNum);
                        setState(() {
                          alarmList.removeAt(index);
                        });
                      },
                    ),
                  ),
                );
              },
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _navigateToAddAlarmScreen,
        child: Icon(Icons.add, color: Colors.white),
        backgroundColor: Colors.blue[900],
      ),
      bottomNavigationBar: CommonBottomNavigationBar(selectedIndex: 0),
    );
  }

  void _navigateToAddAlarmScreen() async {
    final addedAlarm = await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => AddAlarmScreen(
          onSave: (medicationInfo) async {
            setState(() {
              alarmList.add(medicationInfo);
            });

            // 서버에 알람 저장
            await APIService().saveAlarm(medicationInfo);
            _scheduleAlarms(medicationInfo);
          },
        ),
      ),
    );
    if (addedAlarm != null) {
      setState(() {
        alarmList.add(addedAlarm);
      });
    }
  }

  void _navigateToEditAlarmScreen(BuildContext context, MedicationInfo medicationInfo) async {
    final updatedAlarm = await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => AddAlarmScreen(
          onSave: (updatedMedicationInfo) async {
            // 알람 취소 및 재스케줄링
            await _cancelAlarms(medicationInfo);
            await _scheduleAlarms(updatedMedicationInfo);

            // 알람 목록 업데이트
            setState(() {
              final index = alarmList.indexWhere((info) => info.name == medicationInfo.name);
              if (index != -1) {
                alarmList[index] = updatedMedicationInfo;
              }
            });

            // 서버에 수정된 알람 정보 업데이트
            try {
              await APIService().updateAlarm(updatedMedicationInfo);
            } catch (error) {
              print('알람 수정 중 오류 발생: $error');
              // 오류 처리
            }
          },
          initialData: medicationInfo,
        ),
      ),
    );
    if (updatedAlarm != null) {
      setState(() {
        final index = alarmList.indexWhere((info) => info.name == medicationInfo.name);
        if (index != -1) {
          alarmList[index] = updatedAlarm;
        }
      });
    }
  }

  Future<void> _deleteAlarm(int? alarmNum) async {
    try {
      await APIService().deleteAlarm(alarmNum!);
      setState(() {
        alarmList.removeWhere((element) => element.alarmNum == alarmNum);
      });
    } catch (error) {
      print('알람 삭제 중 오류 발생: $error');
      // 오류 처리
    }
  }
}
