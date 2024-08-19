import 'package:flutter/material.dart';
import 'package:pill_magician/Screens/BookmarkSearch/BookmarkDetailScreen.dart';
import 'package:pill_magician/API/APIService.dart';
import 'package:pill_magician/Storage/SessionManager.dart';

import '../../NavigationBar/BottomNavigationBar.dart';

class BookmarksScreen extends StatefulWidget {
  @override
  _BookmarksScreenState createState() => _BookmarksScreenState();
}

class _BookmarksScreenState extends State<BookmarksScreen> {
  List<dynamic> _bookmarkedItems = [];
  String? _userNum; // 사용자 번호
  String? _itemSeq; // 알약 식별 번호

  @override
  void initState() {
    super.initState();
    _loadBookmarks();
  }

  void _loadBookmarks() async {
    try {
      final userNum = await SessionManager.getUserNum();
      if (userNum != null) {
        setState(() {
          _userNum = userNum;
        });
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('로그인 후 사용해주세요.'),
          ),
        );
        return;
      }
      final bookmarks = await APIService().loadBookmarks(_userNum);
      if (bookmarks != null) {
        setState(() {
          _bookmarkedItems = bookmarks.map((item) {
            return {
              'item_seq': item['item_seq'],
              'item_name': item['item_name'],
              'item_image': item['item_image'],
              'entp_name': item['entp_name'],
            };
          }).toList();
        });
      } else {
        showDialog(
          context: context,
          builder: (context) {
            return AlertDialog(
              title: Text('불러오기 실패'),
              content: Text('북마크를 찾을 수 없습니다.'),
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
      print('Failed to load bookmarks: $e');
      setState(() {
        _bookmarkedItems = [];
      });
    }
  }

  Future<void> _deleteBookmark(String? userNum, String? itemSeq) async {
    try {
      await APIService().deleteBookmark(_userNum, itemSeq);
      _loadBookmarks();
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('북마크 삭제에 실패했습니다.'),
        ),
      );
    }
  }

  void _navigateToSearchResultScreen(String _itemSeq) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => BookmarkDetailScreen(itemSeq: _itemSeq),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(
          '즐겨찾기 알약검색',
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
        child: ListView.builder(
          itemCount: _bookmarkedItems.length,
          itemBuilder: (context, index) {
            String _itemSeq = _bookmarkedItems[index]['item_seq'].toString();
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
                    _bookmarkedItems[index]['item_image'],
                    width: 50,
                    height: 50,
                    fit: BoxFit.cover,
                  ),
                ),
                title: Text(
                  _bookmarkedItems[index]['item_name'],
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Colors.blue[900],
                    fontFamily: 'Raleway',
                  ),
                ),
                subtitle: Text(
                  _bookmarkedItems[index]['entp_name'],
                  style: TextStyle(
                    fontSize: 16,
                    color: Colors.grey[700],
                    fontFamily: 'Raleway',
                  ),
                ),
                trailing: IconButton(
                  icon: Icon(Icons.delete, color: Colors.blueAccent),
                  onPressed: () {
                    showDialog(
                      context: context,
                      builder: (BuildContext context) {
                        return AlertDialog(
                          title: Text("북마크 삭제"),
                          content: Text("북마크를 삭제하시겠습니까?"),
                          actions: [
                            TextButton(
                              onPressed: () {
                                Navigator.of(context).pop();
                              },
                              child: Text("취소"),
                            ),
                            TextButton(
                              onPressed: () {
                                Navigator.of(context).pop();
                                _deleteBookmark(_userNum, _itemSeq);
                              },
                              child: Text("확인"),
                            ),
                          ],
                        );
                      },
                    );
                  },
                ),
                onTap: () {
                  _navigateToSearchResultScreen(_itemSeq);
                },
              ),
            );
          },
        ),
      ),
      bottomNavigationBar: CommonBottomNavigationBar(selectedIndex: 1),
    );
  }
}
