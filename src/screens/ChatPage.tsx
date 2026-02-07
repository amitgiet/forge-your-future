import { useState, useEffect, useRef } from 'react';
import { View, Text, FlatList, TextInput, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useRoute } from '@react-navigation/native';
import apiService from '../lib/apiService';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../hooks/useSocket';
import { navigate } from '../navigation/rootRef';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/theme';

export default function ChatPage() {
  const route = useRoute<any>();
  const chatId = route.params?.chatId || '';
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState(false);
  const listRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { connected, joinChat, sendMessage, sendTyping, markAsRead, onNewMessage, onUserTyping } = useSocket(user?._id);

  useEffect(() => {
    if (!chatId) return;
    if (connected) {
      joinChat(chatId);
      markAsRead(chatId);
    }
    (async () => {
      try {
        const res = await apiService.social.getMessages(chatId);
        setMessages(res.data?.data || []);
      } catch (_) {}
      setLoading(false);
    })();
  }, [chatId, connected]);

  useEffect(() => {
    if (!connected) return;
    const cleanup = onNewMessage((message: any) => {
      setMessages((prev) => [...prev, message]);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    });
    return cleanup;
  }, [connected]);

  useEffect(() => {
    if (!connected) return;
    const cleanup = onUserTyping((data: { userId: string; isTyping: boolean }) => {
      if (data.userId !== user?._id) {
        setTyping(data.isTyping);
      }
    });
    return cleanup;
  }, [connected, user?._id]);

  const handleSend = () => {
    if (!text.trim() || !chatId) return;
    if (connected) {
      sendMessage(chatId, text.trim());
      setText('');
      sendTyping(chatId, false);
    } else {
      apiService.social.sendMessage({ chatId, text: text.trim() }).then(() => {
        setMessages((p) => [...p, { text: text.trim(), sender: user?._id, createdAt: new Date().toISOString() }]);
        setText('');
      }).catch(() => {});
    }
  };

  const handleTyping = (value: string) => {
    setText(value);
    if (!chatId || !connected) return;
    sendTyping(chatId, true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      sendTyping(chatId, false);
      typingTimeoutRef.current = null;
    }, 1000);
  };

  if (!chatId) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>No chat selected.</Text>
      </View>
    );
  }

  const isOwn = (msg: any) => (msg.sender?._id ?? msg.sender) === user?._id;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => navigate('Social')}>
          <Ionicons name="arrow-back" size={24} color={colors.foreground} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Chat</Text>
          {typing ? <Text style={styles.typingText}>typing...</Text> : null}
        </View>
        <View style={[styles.dot, connected ? styles.dotConnected : styles.dotOffline]} />
      </View>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(item, i) => item._id || String(i)}
          renderItem={({ item }) => (
            <View style={[styles.bubble, isOwn(item) ? styles.bubbleMe : styles.bubbleThem]}>
              {!isOwn(item) && item.sender?.name ? (
                <Text style={styles.senderName}>{item.sender.name}</Text>
              ) : null}
              <Text style={isOwn(item) ? styles.bubbleTextMe : styles.bubbleText}>{item.text}</Text>
              <Text style={styles.time}>
                {item.createdAt ? new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
              </Text>
            </View>
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>No messages yet.</Text>}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        />
      )}

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={handleTyping}
          placeholder="Type a message..."
          placeholderTextColor={colors.mutedForeground}
          multiline
          maxLength={2000}
        />
        <Pressable style={[styles.sendBtn, !text.trim() && styles.sendBtnDisabled]} onPress={handleSend} disabled={!text.trim()}>
          <Ionicons name="send" size={20} color="#fff" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: colors.mutedForeground },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.card,
  },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: colors.foreground },
  typingText: { fontSize: 12, color: colors.mutedForeground, marginTop: 2 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  dotConnected: { backgroundColor: colors.success },
  dotOffline: { backgroundColor: colors.mutedForeground },
  list: { padding: 16, paddingBottom: 24 },
  bubble: { maxWidth: '80%', padding: 12, borderRadius: 16, marginBottom: 8 },
  bubbleMe: { alignSelf: 'flex-end', backgroundColor: colors.primary },
  bubbleThem: { alignSelf: 'flex-start', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  senderName: { fontSize: 11, color: colors.mutedForeground, marginBottom: 4 },
  bubbleText: { color: colors.foreground, fontSize: 15 },
  bubbleTextMe: { color: '#fff', fontSize: 15 },
  time: { fontSize: 11, color: colors.mutedForeground, marginTop: 4 },
  empty: { color: colors.mutedForeground, textAlign: 'center', marginTop: 24 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.foreground,
    maxHeight: 100,
  },
  sendBtn: { marginLeft: 8, width: 48, height: 48, borderRadius: 12, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { opacity: 0.5 },
});
