import 'dart:convert';

import 'package:flutter/material.dart';

class MedicationInfo {
  String name;
  List<TimeOfDay> times;
  DateTime startDate;
  DateTime endDate;
  int? alarmNum;

  MedicationInfo({
    required this.name,
    required this.times,
    required this.startDate,
    required this.endDate,
    this.alarmNum,
  });

  Map<String, dynamic> toJson() {
    List<String> timeStrings = times.map((time) {
      // 시간(TimeOfDay)을 'HH:MM:SS' 형식의 문자열로 변환
      return '${time.hour.toString().padLeft(2, '0')}:${time.minute.toString().padLeft(2, '0')}:00';
    }).toList();

    return {
      'name': name,
      'times': timeStrings,
      'startDate': startDate.toIso8601String(),
      'endDate': endDate.toIso8601String(),
      'alarmNum': alarmNum,
    };
  }

  static MedicationInfo fromJson(Map<String, dynamic> json) {
    return MedicationInfo(
      name: json['alarm_name'],
      times: (json['times'] as List<dynamic>).map((timeString) {
      // 시간 문자열을 TimeOfDay 객체로 변환
      List<String> parts = timeString.split(':');
      return TimeOfDay(hour: int.parse(parts[0]), minute: int.parse(parts[1]));
    }).toList(),
      startDate: DateTime.parse(json['start_date']),
      endDate: DateTime.parse(json['end_date']),
      alarmNum: json['alarm_num'],
    );
  }
}
