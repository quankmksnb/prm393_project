import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import '../models/message_model.dart';
import '../services/auth_service.dart';
import 'package:http/http.dart' as http;
import '../constants/api_constants.dart';
import '../services/notification_service.dart';

class ChatProvider with ChangeNotifier {
  late IO.Socket socket;
  List<MessageModel> messages = [];
  bool isConnected = false;
  final String sellerId = "69beb3837b07c84b78c93283"; // ID của Seller thực tế trong DB foodify

  void connect(String userId) {
    if (!isConnected || !socket.connected) {
      socket = IO.io(ApiConstants.baseUrl.replaceAll('/api', ''), <String, dynamic>{
        'transports': ['websocket'],
        'autoConnect': false,
      });

      socket.connect();

      socket.onConnect((_) {
        isConnected = true;
        notifyListeners();
        
        socket.emit('join_user', userId);
        
        final ids = [userId, sellerId];
        ids.sort();
        final room = ids.join('_');
        socket.emit('join_room', room);
      });

      socket.onDisconnect((_) {
        isConnected = false;
        notifyListeners();
      });
    } else {
      socket.emit('join_user', userId);
    }

    socket.off('receive_message');
    socket.on('receive_message', (data) {
      final newMessage = MessageModel.fromJson(data);
      final exists = messages.any((m) => m.id == newMessage.id && m.id.isNotEmpty);
      if (!exists) {
        messages.add(newMessage);
        notifyListeners();
      }
    });

    socket.off('order_status_updated');
    socket.on('order_status_updated', (data) {
      NotificationService.showNotification(
        id: DateTime.now().millisecond,
        title: 'Cập nhật đơn hàng!',
        body: data['message'] ?? 'Đơn hàng của bạn đã thay đổi trạng thái.',
      );
    });
  }

  Future<void> fetchHistory(String userId) async {
    try {
      final token = await AuthService().getToken();
      final response = await http.get(
        Uri.parse('${ApiConstants.baseUrl}/chat/history/$sellerId'),
        headers: {
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        final List<dynamic> data = json.decode(response.body);
        messages = data.map((m) => MessageModel.fromJson(m)).toList();
        notifyListeners();
      }
    } catch (e) {
      print('Error fetching chat history: $e');
    }
  }

  void sendMessage(String senderId, String content) {
    if (content.trim().isEmpty) return;

    final ids = [senderId, sellerId];
    ids.sort();
    final room = ids.join('_');

    final messageData = {
      'sender': senderId,
      'receiver': sellerId,
      'content': content,
      'room': room,
    };

    socket.emit('send_message', messageData);
  }

  void disconnect() {
    socket.disconnect();
  }
}
