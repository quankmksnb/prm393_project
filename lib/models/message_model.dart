class MessageModel {
  final String id;
  final String sender;
  final String receiver;
  final String content;
  final String room;
  final DateTime createdAt;

  MessageModel({
    required this.id,
    required this.sender,
    required this.receiver,
    required this.content,
    required this.room,
    required this.createdAt,
  });

  factory MessageModel.fromJson(Map<String, dynamic> json) {
    return MessageModel(
      id: json['_id'] ?? '',
      sender: json['sender'] ?? '',
      receiver: json['receiver'] ?? '',
      content: json['content'] ?? '',
      room: json['room'] ?? '',
      createdAt: DateTime.parse(json['createdAt']),
    );
  }
}
