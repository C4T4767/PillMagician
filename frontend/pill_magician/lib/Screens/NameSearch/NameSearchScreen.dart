import 'package:flutter/material.dart';
import 'package:pill_magician/API/APIService.dart';
import 'package:pill_magician/Screens/SearchResult/NameSearchResultScreen.dart';
import 'package:pill_magician/Storage/SessionManager.dart';
import '../../NavigationBar/BottomNavigationBar.dart';

class NameSearchScreen extends StatefulWidget {
  @override
  _NameSearchScreenState createState() => _NameSearchScreenState();
}

class _NameSearchScreenState extends State<NameSearchScreen> {
  List<dynamic> _results = []; // 검색된 알약 목록(리스트)
  String? _selectedResult; // 선택된 알약 이름
  TextEditingController _searchController = TextEditingController();
  String? _userNum; // 사용자 번호

  @override
  void initState() {
    super.initState();
  }

  void _search() async {
    String itemName = _searchController.text;
    try {
      // 세션에서 사용자 번호 가져오기
      final userNum = await SessionManager.getUserNum();
      setState(() {
        _userNum = userNum;
      });
      final result = await APIService().searchDrug(itemName, _userNum);

      if (result.isNotEmpty) {
        setState(() {
          _results = result.map((item) {
            return {
              'item_seq': item['item_seq'],
              'item_name': item['item_name'],
              'item_image': item['item_image'],
              'entp_name': item['entp_name'],
            };
          }).toList();
        });
      } else {
        // 검색 실패 처리
        showDialog(
          context: context,
          builder: (context) {
            return AlertDialog(
              title: Text('검색 실패'),
              content: Text('약물을 찾을 수 없습니다.'),
              actions: [
                TextButton(
                  onPressed: () {
                    Navigator.pop(context);
                  },
                  child: Text('확인'),
                ),
              ],
            );
          },
        );
      }
    } catch (e) {
      print('Failed to get session ID: $e');
    }
  }

  void _addBookmark(String? userNum, String? itemSeq) async {
    try {
      if (userNum == null) {
        // 사용자가 로그인하지 않은 경우
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('로그인 후 북마크해주세요.'),
          ),
        );
        return;
      }

      // 북마크 추가
      await APIService().addBookmark(userNum, itemSeq);

      // 북마크 추가 성공 시 메시지 표시
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('북마크 되었습니다.'),
        ),
      );
    } catch (e) {
      print('Failed to add bookmark: $e');
      // 북마크 추가 실패 시 메시지 표시
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('$e'),
        ),
      );
    }
  }

  void _navigateToSearchResultScreen(String selectedDrug) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => NameSearchResultScreen(drugName: selectedDrug),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          '이름으로 알약검색',
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
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            TextField(
              controller: _searchController,
              decoration: InputDecoration(
                hintText: '알약 이름을 입력하세요',
                hintStyle: TextStyle(color: Colors.grey[600], fontFamily: 'Raleway'),
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
            SizedBox(height: 20),
            SizedBox(
              width: double.infinity, // 버튼이 가로로 길게 확장됨
              child: ElevatedButton(
                onPressed: _search,
                child: Text('검색', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.blue[700], // 버튼 배경색을 진한 파란색으로 설정
                  padding: EdgeInsets.symmetric(vertical: 16.0),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(20.0),
                  ),
                  textStyle: TextStyle(fontSize: 18, fontFamily: 'Raleway'),
                  elevation: 5, // 버튼에 그림자 추가
                ),
              ),
            ),
            SizedBox(height: 20),
            _selectedResult != null
                ? Text(
              '선택된 알약: $_selectedResult',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            )
                : Container(),
            SizedBox(height: 20),
            Expanded(
              child: ListView.builder(
                itemCount: _results.length, //_results
                itemBuilder: (context, index) {
                  String? _itemSeq = _results[index]['item_seq'].toString();
                  return Card(
                    margin: EdgeInsets.symmetric(vertical: 8.0),
                    elevation: 4,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(20.0),
                    ),
                    child: ListTile(
                      leading: ClipRRect(
                        borderRadius: BorderRadius.circular(10),
                        child: Image.network(
                          _results[index]['item_image'],
                          width: 50,
                          height: 50,
                          fit: BoxFit.cover,
                        ),
                      ),
                      title: Text(
                        _results[index]['item_name'],
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Colors.blue[900],
                          fontFamily: 'Raleway',
                        ),
                      ),
                      subtitle: Text(
                        _results[index]['entp_name'],
                        style: TextStyle(
                          fontSize: 16,
                          color: Colors.grey[700],
                          fontFamily: 'Raleway',
                        ),
                      ),
                      trailing: IconButton(
                        icon: Icon(Icons.bookmark, color: Colors.lightBlue[700]),
                        onPressed: () {
                          setState(() {
                            _addBookmark(_userNum, _itemSeq);
                          });
                        },
                      ),
                      onTap: () {
                        setState(() {
                          _selectedResult = _results[index]['item_name']; // 선택한 알약의 이름 저장
                        });
                        _navigateToSearchResultScreen(_results[index]['item_name']); // 알약 검색 결과 화면으로 이동
                      },
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
      bottomNavigationBar: CommonBottomNavigationBar(selectedIndex: 1),
    );
  }
}
