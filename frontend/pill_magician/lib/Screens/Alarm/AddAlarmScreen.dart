import 'package:flutter/material.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:pill_magician/Model/MedicationInfo.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'dart:convert';
import 'package:pill_magician/API/APIService.dart';
import 'package:intl/intl.dart';

class AddAlarmScreen extends StatefulWidget {
  final void Function(MedicationInfo) onSave;
  final MedicationInfo? initialData;
  final String? initialName; // 알약 이름 추가

  AddAlarmScreen({required this.onSave, this.initialData, this.initialName});

  @override
  _AddAlarmScreenState createState() => _AddAlarmScreenState();
}

class _AddAlarmScreenState extends State<AddAlarmScreen> {
  late TextEditingController _alarmNameController;
  late List<TimeOfDay> _selectedTimes;
  late DateTime _selectedStartDate;
  late DateTime _selectedEndDate;
  late int? _alarmNum;

  FlutterLocalNotificationsPlugin flutterLocalNotificationsPlugin =
  FlutterLocalNotificationsPlugin();

  @override
  void initState() {
    super.initState();
    _alarmNameController = TextEditingController(
        text: widget.initialData?.name ?? widget.initialName ?? '');
    _selectedTimes = widget.initialData?.times ?? [TimeOfDay.now()];
    _selectedStartDate = widget.initialData?.startDate ?? DateTime.now();
    _selectedEndDate = widget.initialData?.endDate ?? DateTime.now();
    _alarmNum =
        widget.initialData?.alarmNum; // 초기화 시에 initialData에서 _alarmNum 가져오기
  }

  @override
  void dispose() {
    _alarmNameController.dispose();
    super.dispose();
  }

  Future<void> _saveMedicationInfo() async {
    String alarmName = _alarmNameController.text;
    MedicationInfo newMedicationInfo = MedicationInfo(
        name: alarmName,
        times: _selectedTimes,
        startDate: _selectedStartDate,
        endDate: _selectedEndDate,
        alarmNum: _alarmNum);

    // 날짜를 MySQL이 인식할 수 있는 형식으로 변환
    String formattedStartDate =
    DateFormat('yyyy-MM-dd').format(_selectedStartDate);
    String formattedEndDate = DateFormat('yyyy-MM-dd').format(_selectedEndDate);

    // 수정된 MedicationInfo에 변환된 날짜를 설정
    newMedicationInfo.startDate = DateTime.parse(formattedStartDate);
    newMedicationInfo.endDate = DateTime.parse(formattedEndDate);

    try {
      // 새 알람을 추가하는 경우
      await APIService().saveAlarm(newMedicationInfo);
      // widget.onSave(newMedicationInfo);
      Navigator.pop(context);
    } catch (error) {
      print('알람 저장 중 오류 발생: $error');
      // 오류 처리
    }
  }

  Future<void> _updateMedicationInfo() async {
    String alarmName = _alarmNameController.text;
    MedicationInfo updatedMedicationInfo = MedicationInfo(
        name: alarmName,
        times: _selectedTimes,
        startDate: _selectedStartDate,
        endDate: _selectedEndDate,
        alarmNum: _alarmNum);

    // 날짜를 MySQL이 인식할 수 있는 형식으로 변환
    String formattedStartDate =
    DateFormat('yyyy-MM-dd').format(_selectedStartDate);
    String formattedEndDate = DateFormat('yyyy-MM-dd').format(_selectedEndDate);

    // 수정된 MedicationInfo에 변환된 날짜를 설정
    updatedMedicationInfo.startDate = DateTime.parse(formattedStartDate);
    updatedMedicationInfo.endDate = DateTime.parse(formattedEndDate);

    try {
      if (widget.initialData != null) {
        // 기존 알람을 수정하는 경우
        await APIService().updateAlarm(updatedMedicationInfo); // 수정된 부분
        // widget.onSave(updatedMedicationInfo);
      }

      Navigator.pop(context);
    } catch (error) {
      print('알람 수정 중 오류 발생: $error');
      // 오류 처리
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          widget.initialData != null ? '알람 수정' : '알람 추가',
          style: TextStyle(
            color: Colors.blue[900], // 텍스트 색상 변경
            fontWeight: FontWeight.bold, // 텍스트 굵게
            fontFamily: 'Raleway', // 글꼴 설정
          ),
        ),
        backgroundColor: Colors.lightBlue[50], // 배경색 변경
        iconTheme: IconThemeData(color: Colors.blue[900]),
        elevation: 0, // 그림자 효과 제거
        actions: [
          IconButton(
            icon: Icon(Icons.save),
            onPressed: () {
              if (widget.initialData != null) {
                _updateMedicationInfo();
              } else {
                _saveMedicationInfo();
              }
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            TextField(
              controller: _alarmNameController,
              decoration: InputDecoration(
                hintText: '알람 이름을 ${widget.initialData != null ? '수정' : '추가'}해주세요',
                hintStyle: TextStyle(
                  color: Colors.grey[600], // 힌트 텍스트 색상 변경
                  fontFamily: 'Raleway', // 글꼴 설정
                ),
                focusedBorder: OutlineInputBorder(
                  borderSide: BorderSide(color: Colors.blue[900]!),
                  borderRadius: BorderRadius.circular(10.0),
                ),
                enabledBorder: OutlineInputBorder(
                  borderSide: BorderSide(color: Colors.grey[400]!),
                  borderRadius: BorderRadius.circular(10.0),
                ),
                filled: true,
                fillColor: Colors.white,
              ),
            ),
            SizedBox(height: 16),
            ..._buildTimePickerWidgets(),
            SizedBox(height: 16),
            FractionallySizedBox(
              widthFactor: 0.9,
              child: ElevatedButton(
                onPressed: () => _showStartDatePicker(context),
                child: Text(
                  '복용 시작 날짜 선택',
                  style: TextStyle(
                    color: Colors.white,
                    fontFamily: 'Raleway', // 글꼴 설정
                  ),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.lightBlue, // 버튼 배경색 변경
                  padding: EdgeInsets.symmetric(vertical: 16.0),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(20.0),
                  ),
                ),
              ),
            ),
            SizedBox(height: 16),
            FractionallySizedBox(
              widthFactor: 0.9,
              child: ElevatedButton(
                onPressed: () => _showEndDatePicker(context),
                child: Text(
                  '복용 종료 날짜 선택',
                  style: TextStyle(
                    color: Colors.white,
                    fontFamily: 'Raleway', // 글꼴 설정
                  ),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.lightBlue[700], // 버튼 배경색 변경
                  padding: EdgeInsets.symmetric(vertical: 16.0),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(20.0),
                  ),
                ),
              ),
            ),
            SizedBox(height: 16),
            _buildSelectedStartDateInfo(),
            _buildSelectedEndDateInfo(),
            SizedBox(height: 32),
            Text(
              '복용 시간을 변경하고 싶은 경우\n해당 텍스트를 터치하여 주세요!',
              style: TextStyle(
                color: Colors.grey,
                fontSize: 20,
                fontFamily: 'Raleway',
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  List<Widget> _buildTimePickerWidgets() {
    return _selectedTimes.map((time) {
      return ListTile(
        title: Center(
          child: Text(
            '복용 시간: ${time.format(context)}',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Colors.blue[900],
              fontFamily: 'Raleway',
            ),
          ),
        ),
        onTap: () => _showTimePicker(context, time),
      );
    }).toList();
  }

  void _addTimePicker() {
    setState(() {
      _selectedTimes.add(TimeOfDay.now());
    });
  }

  Future<void> _showTimePicker(
      BuildContext context, TimeOfDay initialTime) async {
    final TimeOfDay? selectedTime = await showTimePicker(
      context: context,
      initialTime: initialTime,
    );

    if (selectedTime != null) {
      setState(() {
        final index = _selectedTimes.indexOf(initialTime);
        if (index != -1) {
          _selectedTimes[index] = selectedTime;
        }
      });
    }
  }

  Future<void> _showStartDatePicker(BuildContext context) async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: _selectedStartDate,
      firstDate: DateTime.now(),
      lastDate: _selectedEndDate,
    );

    if (picked != null) {
      setState(() {
        _selectedStartDate = picked;
      });
    }
  }

  Future<void> _showEndDatePicker(BuildContext context) async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: _selectedEndDate,
      firstDate: _selectedStartDate,
      lastDate: DateTime.now().add(Duration(days: 365)),
    );

    if (picked != null) {
      setState(() {
        _selectedEndDate = picked;
      });
    }
  }

  Widget _buildSelectedStartDateInfo() {
    return Text(
      '복용 시작 날짜: ${_selectedStartDate.toString().substring(0, 10)}',
      style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.black54, fontFamily: 'Raleway'),
    );
  }

  Widget _buildSelectedEndDateInfo() {
    return Text(
      '복용 종료 날짜: ${_selectedEndDate.toString().substring(0, 10)}',
      style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.black54, fontFamily: 'Raleway'),
    );
  }
}
