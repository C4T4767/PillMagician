import 'package:flutter/material.dart';
import 'package:pill_magician/Model/MedicationInfo.dart';
import 'package:pill_magician/API/APIService.dart';

class MedicationLogScreen extends StatefulWidget {
  @override
  _MedicationLogScreenState createState() => _MedicationLogScreenState();
}

class _MedicationLogScreenState extends State<MedicationLogScreen> {
  List<MedicationInfo> medicationLogs = [];

  @override
  void initState() {
    super.initState();
    _fetchMedicationLogs();
  }

  Future<void> _fetchMedicationLogs() async {
    try {
      final logs = await APIService().fetchAlarms();
      setState(() {
        medicationLogs = logs;
      });
    } catch (error) {
      print('Failed to load medication logs: $error');
      // 오류 처리
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          '복용 기록',
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
        padding: const EdgeInsets.all(16.0),
        child: medicationLogs.isEmpty
            ? Center(child: CircularProgressIndicator())
            : ListView.builder(
          itemCount: medicationLogs.length,
          itemBuilder: (context, index) {
            final log = medicationLogs[index];
            return Card(
              margin: EdgeInsets.symmetric(vertical: 8.0),
              elevation: 4,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20.0),
              ),
              child: ListTile(
                contentPadding: EdgeInsets.all(16.0),
                title: Text(
                  log.name,
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Colors.blue[900],
                    fontFamily: 'Raleway',
                  ),
                ),
                subtitle: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    SizedBox(height: 8.0),
                    Text(
                      '복용 기간: ${log.startDate.toString().substring(0, 10)} ~ ${log.endDate.toString().substring(0, 10)}',
                      style: TextStyle(
                        fontSize: 16,
                        color: Colors.grey[700],
                        fontFamily: 'Raleway',
                      ),
                    ),
                    ...log.times.map((time) => Text(
                      '복용 시간: ${time.format(context)}',
                      style: TextStyle(
                        fontSize: 16,
                        color: Colors.grey[700],
                        fontFamily: 'Raleway',
                      ),
                    )),
                  ],
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}
